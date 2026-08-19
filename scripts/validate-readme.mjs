#!/usr/bin/env node

import { access, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = { assets: null, checkRemote: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--readme" || token === "-r") args.readme = argv[++index];
    else if (token === "--assets") args.assets = argv[++index];
    else if (token === "--check-remote") args.checkRemote = true;
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function help() {
  console.log("Usage: node scripts/validate-readme.mjs --readme <README.md> [--assets <dir>] [--check-remote]");
}

function issue(level, code, message, line = null) {
  return { level, code, message, ...(line ? { line } : {}) };
}

function extractImages(markdown) {
  const images = [];
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(\s*<?([^)>\s]+)>?[^)]*\)/g)) {
    images.push({ alt: match[1], url: match[2], index: match.index });
  }
  for (const match of markdown.matchAll(/<img\b[^>]*>/gi)) {
    images.push({
      alt: match[0].match(/\balt=["']([^"']*)["']/i)?.[1] || "",
      url: match[0].match(/\bsrc=["']([^"']+)["']/i)?.[1] || "",
      width: match[0].match(/\bwidth=["']?([0-9]+(?:\.[0-9]+)?)\b/i)?.[1],
      index: match.index,
    });
  }
  return images;
}

function lineNumber(markdown, index) {
  return markdown.slice(0, index).split("\n").length;
}

async function remoteReachable(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function validate(args) {
  const markdown = await readFile(args.readme, "utf8");
  const errors = [];
  const warnings = [];
  const lines = markdown.split("\n");
  const h1Count = lines.filter((line) => /^#\s+/.test(line)).length;
  if (h1Count > 1) warnings.push(issue("warning", "multiple-h1", "More than one H1 heading can weaken profile hierarchy."));
  if (/<script\b|<iframe\b|javascript:/i.test(markdown)) errors.push(issue("error", "unsupported-html", "JavaScript, iframes, or javascript URLs are not GitHub README-safe."));
  if (/<style\b|\.css\b/i.test(markdown)) warnings.push(issue("warning", "css-assumption", "CSS is not a reliable GitHub Profile README dependency."));
  if (/<img\b[^>]*\bwidth=["']?(?:1[2-9]\d{2}|[2-9]\d{3,})/i.test(markdown)) warnings.push(issue("warning", "wide-image", "An image width above 1200px may overflow narrow profile layouts."));

  const images = extractImages(markdown);
  const readmeDir = dirname(resolve(args.readme));
  for (const image of images) {
    const line = lineNumber(markdown, image.index);
    if (!image.alt.trim()) warnings.push(issue("warning", "missing-alt", `Image has no descriptive alt text: ${image.url}`, line));
    if (!image.url) errors.push(issue("error", "missing-image-url", "Image tag has no source URL.", line));
    if (/^https?:\/\//i.test(image.url)) {
      if (!/^https:\/\//i.test(image.url)) warnings.push(issue("warning", "insecure-image", `Use HTTPS for remote image: ${image.url}`, line));
      if (args.checkRemote && !(await remoteReachable(image.url))) warnings.push(issue("warning", "unreachable-image", `Remote image did not respond to HEAD: ${image.url}`, line));
    } else if (image.url && !image.url.startsWith("#")) {
      try {
        await access(resolve(readmeDir, image.url.split("#")[0].split("?")[0]));
      } catch {
        errors.push(issue("error", "missing-local-image", `Local image was not found: ${image.url}`, line));
      }
    }
  }

  const links = [...markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)];
  for (const link of links) {
    if (/^javascript:/i.test(link[1])) errors.push(issue("error", "unsafe-link", `Unsafe link URL: ${link[1]}`, lineNumber(markdown, link.index)));
  }
  if (!markdown.trim()) errors.push(issue("error", "empty-readme", "README is empty."));
  if (!/^\s*(?:#|<|!\[)/m.test(markdown)) warnings.push(issue("warning", "weak-opening", "README has no visible heading, HTML hero, or image near the beginning."));

  const result = {
    schemaVersion: "1.0",
    readme: resolve(args.readme),
    assetsDirectory: args.assets ? resolve(args.assets) : null,
    passed: errors.length === 0,
    counts: { errors: errors.length, warnings: warnings.length, images: images.length, links: links.length },
    errors,
    warnings,
  };
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.readme) {
    help();
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  const result = await validate(args);
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (!result.passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
