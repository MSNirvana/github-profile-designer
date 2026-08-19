#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--discovery") args.discovery = argv[++index];
    else if (token === "--validation") args.validation = argv[++index];
    else if (token === "--preview") args.preview = argv[++index];
    else if (token === "--output") args.output = argv[++index];
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function page(title, eyebrow, content) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #edf2f7; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    main { max-width: 1240px; margin: 0 auto; padding: 54px; }
    .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-bottom: 34px; }
    .eyebrow { color: #3875d7; font: 700 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .14em; text-transform: uppercase; }
    h1 { margin: 10px 0 0; font-size: clamp(32px, 5vw, 58px); line-height: .98; letter-spacing: -.04em; }
    h2 { margin: 0 0 14px; font-size: 21px; letter-spacing: -.02em; }
    p { line-height: 1.6; }
    .pill { display: inline-flex; align-items: center; gap: 8px; padding: 9px 13px; border-radius: 999px; background: #dceaff; color: #225db6; font-weight: 700; font-size: 13px; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
    .card { grid-column: span 4; background: #fff; border: 1px solid #d5deea; border-radius: 18px; padding: 22px; box-shadow: 0 14px 34px rgba(29, 55, 93, .08); }
    .wide { grid-column: span 8; }
    .full { grid-column: 1 / -1; }
    .label { color: #70809a; font: 700 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .1em; text-transform: uppercase; }
    .value { margin-top: 8px; font-size: 25px; font-weight: 800; letter-spacing: -.03em; }
    .muted { color: #63728a; }
    .repo { display: grid; grid-template-columns: 1fr auto; gap: 7px 16px; padding: 15px 0; border-bottom: 1px solid #e7edf4; }
    .repo:last-child { border-bottom: 0; padding-bottom: 0; }
    .repo strong { font-size: 16px; }
    .repo small { color: #677892; }
    .repo .score { color: #2261c5; font: 700 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
    ul { margin: 12px 0 0; padding-left: 20px; }
    li { margin: 9px 0; line-height: 1.45; }
    .styles { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .style { min-height: 138px; border-radius: 15px; padding: 16px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    .style strong { font-size: 17px; line-height: 1.1; }
    .style span { font-size: 12px; opacity: .85; line-height: 1.35; }
    .style:nth-child(1) { background: #2f5b9f; }
    .style:nth-child(2) { background: #b64e2e; }
    .style:nth-child(3) { background: #263238; }
    .style:nth-child(4) { background: #31806f; }
    .style:nth-child(5) { background: #7654b6; }
    .selected { outline: 4px solid #f4bd3f; outline-offset: 3px; }
    .status { display: inline-flex; align-items: center; gap: 8px; color: #14734d; font-weight: 800; }
    .status::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: #23a26d; }
    iframe { width: 100%; height: 580px; border: 0; background: #fff; border-radius: 14px; }
    @media (max-width: 840px) { main { padding: 28px 18px; } .card, .wide { grid-column: 1 / -1; } .styles { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .top { display: block; } .pill { margin-top: 18px; } .styles { grid-template-columns: 1fr; } }
  </style>
</head>
<body><main>${content}</main></body>
</html>`;
}

function renderDiscovery(discovery) {
  const profile = discovery.profile || {};
  const repos = (discovery.repositories || []).slice(0, 5).map((repo) => `<div class="repo">
    <div><strong>${escapeHtml(repo.fullName)}</strong><br><small>${escapeHtml(repo.description || "No public description found")}</small></div>
    <div class="score">${escapeHtml(repo.stars)}★<br>${escapeHtml(repo.language || "Mixed")}</div>
  </div>`).join("");
  const gaps = (discovery.gaps || []).map((item) => `<li><strong>${escapeHtml(item.field)}</strong><br><span class="muted">${escapeHtml(item.prompt)}</span></li>`).join("");
  const content = `<div class="top"><div><div class="eyebrow">Stage 01 / public discovery</div><h1>Find the signal<br>before the style.</h1></div><div class="pill">${escapeHtml(profile.login || discovery.query?.username)} · ${escapeHtml(discovery.consideredRepositories || 0)} public repos</div></div>
  <div class="grid"><section class="card"><div class="label">Profile</div><div class="value">${escapeHtml(profile.name || profile.login)}</div><p class="muted">${escapeHtml(profile.bio || "No public bio found yet")}</p><small class="muted">${escapeHtml(profile.blog || profile.profileUrl || "Profile URL unavailable")}</small></section>
  <section class="card"><div class="label">Public proof</div><div class="value">${escapeHtml(profile.followers || 0)}</div><p class="muted">followers · ${escapeHtml(profile.publicRepos || 0)} public repositories · ${escapeHtml(profile.location || "location not listed")}</p></section>
  <section class="card"><div class="label">Evidence state</div><div class="value">${escapeHtml((discovery.gaps || []).length)} gaps</div><p class="muted">Found values stay separate from inferred and missing content.</p></section>
  <section class="card wide"><h2>Ranked project candidates</h2>${repos || "<p class='muted'>No public repositories found.</p>"}</section>
  <section class="card"><h2>Ask only what is missing</h2><ul>${gaps || "<li>Nothing is missing.</li>"}</ul></section></div>`;
  return page("GitHub Profile Designer · Discovery", "", content);
}

function renderStyles() {
  const styles = [
    ["Clean Editorial", "Text-led, restrained, focused", "recommended for hiring"],
    ["Bento Showcase", "Modular product and project tiles", "recommended for many projects"],
    ["Terminal Native", "High-contrast tools and code", "recommended for engineers"],
    ["Product Case Study", "Screenshots, outcomes, clear CTA", "recommended for builders"],
    ["Bold Portfolio", "Strong visual signature", "recommended for creatives"],
  ];
  const cards = styles.map(([name, description, note], index) => `<div class="style ${index === 3 ? "selected" : ""}"><strong>${name}</strong><span>${description}<br><br>${index === 3 ? "Selected for this case" : note}</span></div>`).join("");
  const content = `<div class="top"><div><div class="eyebrow">Stage 02 / style choice</div><h1>Choose a system,<br>not a template.</h1></div><div class="pill">Product Case Study selected</div></div><section class="card full"><h2>Five directions, one evidence-based decision</h2><p class="muted">The Skill matches audience, goal, and available visual evidence before it chooses a layout. The selected direction is marked with a gold outline.</p><div class="styles">${cards}</div></section><div class="grid" style="margin-top:16px"><section class="card"><div class="label">Density</div><div class="value">Standard</div><p class="muted">5-7 sections with room for project proof.</p></section><section class="card"><div class="label">Motion</div><div class="value">Light</div><p class="muted">Use motion only when it explains a product state.</p></section><section class="card"><div class="label">Language</div><div class="value">Bilingual</div><p class="muted">Chinese-first copy with short English labels.</p></section></div>`;
  return page("GitHub Profile Designer · Styles", "", content);
}

async function renderPreview(previewPath, validation) {
  const source = await readFile(previewPath, "utf8");
  const main = source.match(/<main>([\s\S]*?)<\/main>/i)?.[1] || "<p>Preview content unavailable.</p>";
  const result = validation || {};
  const content = `<div class="top"><div><div class="eyebrow">Stage 03 / preview and validation</div><h1>Make the case<br>safe to publish.</h1></div><div class="pill"><span class="status">${result.passed === false ? "Needs fixes" : "Validation passed"}</span></div></div><div class="grid"><section class="card wide"><div class="label">Generated README preview</div><div style="margin-top:16px;border:1px solid #d5deea;border-radius:14px;overflow:hidden;background:#fff"><div style="padding:10px 14px;background:#f6f8fb;border-bottom:1px solid #d5deea;color:#70809a;font:700 11px ui-monospace,SFMono-Regular,Menlo,monospace">README.md · GitHub-compatible surface</div><div style="padding:20px;max-height:460px;overflow:hidden;font-size:14px">${main}</div></div></section><section class="card"><div class="label">Validation report</div><div style="margin-top:18px"><div class="label">Errors</div><div class="value">${escapeHtml(result.counts?.errors ?? 0)}</div><p class="muted">Unsupported HTML and broken local assets are blocked.</p></div><hr style="border:0;border-top:1px solid #e2e8f0;margin:22px 0"><div><div class="label">Warnings</div><div class="value">${escapeHtml(result.counts?.warnings ?? 0)}</div><p class="muted">Review remote-resource trade-offs before publishing.</p></div><hr style="border:0;border-top:1px solid #e2e8f0;margin:22px 0"><div><div class="label">Images checked</div><div class="value">${escapeHtml(result.counts?.images ?? 0)}</div><p class="muted">Every meaningful image needs stable sizing and alt text.</p></div></section></div>`;
  return page("GitHub Profile Designer · Preview", "", content);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.discovery || !args.output) {
    console.log("Usage: node scripts/render-workflow-demo.mjs --discovery <profile-discovery.json> --output <directory> [--validation <validation.json>] [--preview <preview.html>]");
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  const discovery = JSON.parse(await readFile(args.discovery, "utf8"));
  const validation = args.validation ? JSON.parse(await readFile(args.validation, "utf8")) : { passed: true, counts: {} };
  const output = resolve(args.output);
  await mkdir(output, { recursive: true });
  await writeFile(`${output}/01-discovery.html`, renderDiscovery(discovery), "utf8");
  await writeFile(`${output}/02-styles.html`, renderStyles(), "utf8");
  if (args.preview) await writeFile(`${output}/03-preview.html`, await renderPreview(args.preview, validation), "utf8");
  else await writeFile(`${output}/03-preview.html`, await renderPreview(args.discovery, validation), "utf8");
  console.log(`Wrote workflow demo pages to ${output}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
