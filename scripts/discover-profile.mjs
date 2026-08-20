#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const API_ROOT = "https://api.github.com";
const DEFAULT_REPO_LIMIT = 12;
const DEFAULT_README_LIMIT = 8;

function parseArgs(argv) {
  const args = { repoLimit: DEFAULT_REPO_LIMIT, readmeLimit: DEFAULT_README_LIMIT };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--username" || token === "-u") args.username = argv[++index];
    else if (token === "--output" || token === "-o") args.output = argv[++index];
    else if (token === "--repo-limit") args.repoLimit = Number(argv[++index]);
    else if (token === "--readme-limit") args.readmeLimit = Number(argv[++index]);
    else if (!token.startsWith("-") && !args.username) args.username = token;
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/discover-profile.mjs --username <login> [options]

Options:
  -u, --username <login>   GitHub username or profile login
  -o, --output <file>      Write JSON to a file instead of stdout
  --repo-limit <number>    Number of ranked repositories to return (default: 12)
  --readme-limit <number>  Number of repositories whose README is inspected (default: 8)
  -h, --help               Show this help`);
}

function authHeaders() {
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: authHeaders() });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { message: text.slice(0, 300) };
  }
  if (!response.ok) {
    const error = new Error(body?.message || `GitHub request failed (${response.status})`);
    error.status = response.status;
    error.url = url;
    error.rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
    error.rateLimitReset = response.headers.get("x-ratelimit-reset");
    throw error;
  }
  return body;
}

async function fetchRaw(url) {
  const response = await fetch(url, {
    headers: {
      ...authHeaders(),
      Accept: "application/vnd.github.raw+json",
    },
  });
  if (!response.ok) {
    const error = new Error(`README request failed (${response.status})`);
    error.status = response.status;
    error.url = url;
    throw error;
  }
  return response.text();
}

async function fetchAllRepos(login) {
  const repositories = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await fetchJson(`${API_ROOT}/users/${encodeURIComponent(login)}/repos?per_page=100&page=${page}&sort=updated&direction=desc&type=owner`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  return repositories;
}

function safeUrl(value, base) {
  if (!value || value.startsWith("data:") || value.startsWith("javascript:")) return null;
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
}

function assetKind(alt, url) {
  const value = `${alt} ${url}`.toLowerCase();
  if (/logo|icon|avatar|mark|brand|favicon/.test(value)) return "logo";
  if (/screenshot|screen|dashboard|demo|preview|feature|hero|ui|interface/.test(value)) return "screenshot";
  return "other";
}

function extractImageCandidates(markdown, rawReadmeUrl, htmlReadmeUrl) {
  const candidates = [];
  const add = (alt, rawUrl, syntax) => {
    const url = safeUrl(rawUrl, rawReadmeUrl);
    if (!url || candidates.some((item) => item.url === url)) return;
    candidates.push({
      url,
      kind: assetKind(alt || "", url),
      alt: alt || "",
      reason: alt ? `README image alt text: ${alt}` : "README image without alt text",
      source: htmlReadmeUrl,
      syntax,
    });
  };

  const markdownPattern = /!\[([^\]]*)\]\(\s*<?([^)>\s]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const match of markdown.matchAll(markdownPattern)) add(match[1], match[2], "markdown");

  const htmlPattern = /<img\b[^>]*?src=["']([^"']+)["'][^>]*>/gi;
  for (const match of markdown.matchAll(htmlPattern)) {
    const alt = match[0].match(/\balt=["']([^"']*)["']/i)?.[1] || "";
    add(alt, match[1], "html");
  }

  return candidates;
}

function scoreRepository(repo) {
  const ageDays = Math.max(0, (Date.now() - Date.parse(repo.updated_at || repo.created_at)) / 86_400_000);
  const recency = Math.max(0, 12 - Math.min(ageDays / 90, 12));
  return (
    repo.stargazers_count * 5 +
    repo.forks_count * 2 +
    (repo.homepage ? 8 : 0) +
    (repo.topics?.length || 0) * 1.5 +
    recency -
    (repo.archived ? 10 : 0) -
    (repo.fork ? 8 : 0)
  );
}

function sourceForRepo(repo) {
  return {
    repository: `https://api.github.com/repos/${repo.full_name}`,
    page: repo.html_url,
  };
}

function inventoryEntry(repo) {
  return {
    fullName: repo.full_name,
    name: repo.name,
    url: repo.html_url,
    description: repo.description || "",
    homepage: repo.homepage || "",
    topics: repo.topics || [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || "",
    updatedAt: repo.updated_at,
    archived: repo.archived,
    fork: repo.fork,
    score: Math.round(scoreRepository(repo) * 100) / 100,
  };
}

function websiteCandidates(homepage) {
  if (!homepage) return [];
  const normalized = /^https?:\/\//i.test(homepage) ? homepage : `https://${homepage}`;
  const url = safeUrl(normalized);
  if (!url) return [];
  const parsed = new URL(url);
  return [
    { url, kind: "website", reason: "Repository homepage", source: url },
    { url: `${parsed.origin}/favicon.ico`, kind: "logo", reason: "Homepage favicon candidate", source: url },
  ];
}

function gap(field, prompt, severity = "medium") {
  return { field, prompt, severity };
}

async function inspectRepository(repo, shouldInspectReadme) {
  const rawReadmeUrl = `https://raw.githubusercontent.com/${repo.full_name}/${encodeURIComponent(repo.default_branch)}/README.md`;
  const readme = {
    url: repo.html_url + "#readme",
    rawUrl: rawReadmeUrl,
    fetched: false,
    excerpt: "",
    images: [],
  };

  if (shouldInspectReadme) {
    try {
      const markdown = await fetchRaw(rawReadmeUrl);
      readme.fetched = true;
      readme.excerpt = markdown.replace(/\s+/g, " ").trim().slice(0, 2500);
      readme.images = extractImageCandidates(markdown, rawReadmeUrl, readme.url);
    } catch (error) {
      readme.error = error.status === 404 ? "README not found" : error.message;
    }
  }

  let languages = {};
  try {
    languages = await fetchJson(`${API_ROOT}/repos/${repo.full_name}/languages`);
  } catch {
    // Languages are enrichment; the repository remains useful when this request fails.
  }

  const logoCandidates = readme.images.filter((item) => item.kind === "logo");
  const screenshotCandidates = readme.images.filter((item) => item.kind === "screenshot");
  const website = websiteCandidates(repo.homepage);
  const socialPreview = {
    url: `https://opengraph.githubassets.com/1/${repo.full_name}`,
    kind: "social-preview",
    reason: "GitHub-generated repository social preview; confirm before using as a logo",
    source: repo.html_url,
  };

  return {
    fullName: repo.full_name,
    name: repo.name,
    url: repo.html_url,
    description: repo.description || "",
    homepage: repo.homepage || "",
    topics: repo.topics || [],
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    language: repo.language || "",
    languages,
    license: repo.license?.spdx_id || "",
    defaultBranch: repo.default_branch,
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    archived: repo.archived,
    fork: repo.fork,
    score: Math.round(scoreRepository(repo) * 100) / 100,
    readme,
    assets: {
      logoCandidates,
      screenshotCandidates,
      websiteCandidates: website,
      socialPreview,
      otherReadmeImages: readme.images.filter((item) => item.kind === "other"),
    },
    sources: sourceForRepo(repo),
  };
}

function normalizeProfile(profile) {
  return {
    login: profile.login,
    name: profile.name || "",
    bio: profile.bio || "",
    avatarUrl: profile.avatar_url || "",
    profileUrl: profile.html_url,
    company: profile.company || "",
    location: profile.location || "",
    blog: profile.blog || "",
    email: profile.email || "",
    social: { twitter: profile.twitter_username || "" },
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    createdAt: profile.created_at,
    sources: {
      profile: `https://api.github.com/users/${profile.login}`,
      page: profile.html_url,
    },
  };
}

async function discover(username, options) {
  const errors = [];
  const login = username.replace(/^@/, "").trim();
  let rawProfile;
  let rawRepos;

  try {
    rawProfile = await fetchJson(`${API_ROOT}/users/${encodeURIComponent(login)}`);
  } catch (error) {
    errors.push({ stage: "profile", status: error.status || 0, message: error.message, url: error.url });
    return {
      schemaVersion: "1.0",
      fetchedAt: new Date().toISOString(),
      query: { username: login, repoLimit: options.repoLimit, readmeLimit: options.readmeLimit },
      profile: null,
      repositories: [],
      gaps: [gap("githubProfile", "Please provide a public GitHub profile URL or a valid username.", "high")],
      errors,
    };
  }

  try {
    rawRepos = await fetchAllRepos(login);
  } catch (error) {
    errors.push({ stage: "repositories", status: error.status || 0, message: error.message, url: error.url });
    rawRepos = [];
  }

  const ranked = rawRepos
    .filter((repo) => !repo.private)
    .sort((left, right) => scoreRepository(right) - scoreRepository(left));
  const repositoryInventory = ranked.map((repo) => inventoryEntry(repo));
  const selected = ranked.slice(0, Math.max(1, options.repoLimit));
  const readmeLimit = Math.max(0, Math.min(options.readmeLimit, selected.length));
  const repositories = [];

  for (let index = 0; index < selected.length; index += 1) {
    try {
      repositories.push(await inspectRepository(selected[index], index < readmeLimit));
    } catch (error) {
      errors.push({ stage: "repository", repository: selected[index].full_name, status: error.status || 0, message: error.message });
    }
  }

  const profile = normalizeProfile(rawProfile);
  const gaps = [];
  if (!profile.bio) gaps.push(gap("positioningStatement", "What one sentence should explain your work and audience?", "high"));
  if (!profile.blog && !profile.email && !profile.social.twitter) gaps.push(gap("contact", "Which website, email, or social link should readers use to reach you?", "medium"));
  if (!repositories.length) gaps.push(gap("featuredProjects", "Which public projects should be featured?", "high"));
  if (repositories.every((repo) => !repo.homepage && !repo.assets.logoCandidates.length && !repo.assets.screenshotCandidates.length)) {
    gaps.push(gap("projectVisuals", "Please provide a logo, screenshot, or project website for the projects you want to show.", "medium"));
  }
  gaps.push(gap("projectHighlights", "For each selected project, what is the key capability, outcome, or differentiator?", "high"));

  return {
    schemaVersion: "1.0",
    fetchedAt: new Date().toISOString(),
    query: { username: login, repoLimit: options.repoLimit, readmeLimit: options.readmeLimit },
    profile,
    repositoryInventory,
    repositories,
    consideredRepositories: ranked.length,
    gaps,
    errors,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.username) {
    printHelp();
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  const result = await discover(args.username, {
    repoLimit: Number.isFinite(args.repoLimit) ? args.repoLimit : DEFAULT_REPO_LIMIT,
    readmeLimit: Number.isFinite(args.readmeLimit) ? args.readmeLimit : DEFAULT_README_LIMIT,
  });
  const json = JSON.stringify(result, null, 2) + "\n";
  if (args.output) {
    const outputPath = resolve(args.output);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, json, "utf8");
  } else {
    process.stdout.write(json);
  }
  if (result.errors.some((error) => error.stage === "profile")) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
