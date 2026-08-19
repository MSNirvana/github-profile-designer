#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--readme" || token === "-r") args.readme = argv[++index];
    else if (token === "--output" || token === "-o") args.output = argv[++index];
    else if (token === "--title") args.title = argv[++index];
    else if (token === "--help" || token === "-h") args.help = true;
  }
  return args;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

const allowedTags = new Set(["a", "b", "br", "div", "details", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "p", "picture", "small", "source", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u"]);
const allowedAttributes = new Set(["align", "alt", "colspan", "height", "href", "loading", "media", "rel", "rowspan", "src", "srcset", "target", "width"]);

function safeAttribute(name, value) {
  const normalized = value.trim();
  if (["src", "href"].includes(name) && /^(?:javascript|data):/i.test(normalized)) return null;
  if (name === "align" && !/^(?:left|center|right)$/i.test(normalized)) return null;
  if (["width", "height", "colspan", "rowspan"].includes(name) && !/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  return `${name}="${escapeHtml(normalized)}"`;
}

function sanitizeTag(raw) {
  const match = raw.match(/^<\s*(\/?)\s*([a-z][a-z0-9]*)\b([^>]*)>$/i);
  if (!match || !allowedTags.has(match[2].toLowerCase())) return null;
  const closing = match[1] ? "/" : "";
  if (closing) return `</${match[2].toLowerCase()}>`;
  const attrs = [];
  for (const attribute of match[3].matchAll(/\s+([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const name = attribute[1].toLowerCase();
    if (!allowedAttributes.has(name)) continue;
    const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
    const safe = safeAttribute(name, value);
    if (safe) attrs.push(safe);
  }
  return `<${match[2].toLowerCase()}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
}

function inline(value) {
  const htmlTokens = [];
  const tokenized = value.replace(/<[^>]+>/g, (tag) => {
    const safe = sanitizeTag(tag);
    if (!safe) return escapeHtml(tag);
    const token = `__GPD_HTML_${htmlTokens.length}__`;
    htmlTokens.push({ token, safe });
    return token;
  });
  let html = escapeHtml(tokenized);
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_match, alt, url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">`);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, url) => `<a href="${escapeHtml(url)}" rel="noreferrer">${label}</a>`);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replaceAll("&amp;nbsp;", "&nbsp;");
  for (const { token, safe } of htmlTokens) html = html.replaceAll(token, safe);
  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const output = [];
  let list = false;
  let code = false;
  let codeLines = [];
  let paragraph = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (list) {
      output.push("</ul>");
      list = false;
    }
  };

  const tableCells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (code) {
      if (/^```/.test(line)) {
        output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        code = false;
        codeLines = [];
      } else {
        codeLines.push(line);
      }
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1] || "")) {
      flushParagraph();
      closeList();
      const headers = tableCells(line);
      output.push("<table><thead><tr>");
      for (const header of headers) output.push(`<th>${inline(header)}</th>`);
      output.push("</tr></thead><tbody>");
      index += 2;
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        output.push("<tr>");
        for (const cell of tableCells(lines[index])) output.push(`<td>${inline(cell)}</td>`);
        output.push("</tr>");
        index += 1;
      }
      output.push("</tbody></table>");
      index -= 1;
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushParagraph();
      closeList();
    } else if (/^\s*<\/?(?:a|br|div|details|h[1-6]|hr|img|p|picture|source|table|tbody|td|tfoot|th|thead|tr)\b/i.test(line)) {
      flushParagraph();
      closeList();
      output.push(inline(line));
    } else if (/^#{1,6}\s+/.test(line)) {
      flushParagraph();
      closeList();
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      const level = match[1].length;
      output.push(`<h${level}>${inline(match[2])}</h${level}>`);
    } else if (/^\s*[-*+]\s+/.test(line)) {
      flushParagraph();
      if (!list) {
        output.push("<ul>");
        list = true;
      }
      output.push(`<li>${inline(line.replace(/^\s*[-*+]\s+/, ""))}</li>`);
    } else if (/^\s*>\s?/.test(line)) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ""))}</blockquote>`);
    } else if (/^```/.test(line)) {
      flushParagraph();
      closeList();
      code = true;
    } else {
      paragraph.push(line);
    }
  }
  if (code) output.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  flushParagraph();
  closeList();
  return output.join("\n");
}

function documentHtml(content, title) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    body { margin: 0; background: #f6f8fa; color: #24292f; }
    main { box-sizing: border-box; max-width: 1012px; margin: 32px auto; padding: 32px; background: #fff; border: 1px solid #d0d7de; border-radius: 8px; }
    h1,h2,h3,h4,h5,h6 { line-height: 1.25; margin: 24px 0 12px; }
    h1 { font-size: 2em; border-bottom: 1px solid #d8dee4; padding-bottom: .3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #d8dee4; padding-bottom: .3em; }
    p,li,blockquote { line-height: 1.6; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    table { width: 100%; border-spacing: 0; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 8px 12px; border: 1px solid #d0d7de; text-align: left; vertical-align: top; }
    th { background: #f6f8fa; font-weight: 600; }
    a { color: #0969da; }
    code { padding: .2em .4em; background: #eff1f3; border-radius: 4px; font-family: ui-monospace,SFMono-Regular,Menlo,monospace; }
    blockquote { margin-left: 0; padding: 0 1em; color: #57606a; border-left: .25em solid #d0d7de; }
    @media (max-width: 640px) { main { margin: 0; border: 0; border-radius: 0; padding: 20px 16px; } }
  </style>
</head>
<body><main>${content}</main></body>
</html>
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.readme || !args.output) {
    console.log("Usage: node scripts/render-preview.mjs --readme <README.md> --output <preview.html> [--title <title>]");
    process.exitCode = args.help ? 0 : 2;
    return;
  }
  const markdown = await readFile(args.readme, "utf8");
  const html = documentHtml(renderMarkdown(markdown), args.title || "GitHub Profile README Preview");
  await mkdir(dirname(resolve(args.output)), { recursive: true });
  await writeFile(args.output, html, "utf8");
  console.log(`Wrote ${resolve(args.output)}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
