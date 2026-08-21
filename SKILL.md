---
name: github-profile-designer
description: Design, audit, validate, and optionally publish a GitHub Profile README from a user's public GitHub profile and complete public repository inventory. Use for profile README redesigns, project selection, repository logos, screenshots, visual styles, GitHub-safe layouts, previews, and copy-ready or published output.
---

# GitHub Profile Designer

Use this skill to turn public GitHub evidence into a focused, GitHub-compatible Profile README. Treat the README as a constrained Markdown surface, not a web app.

## Non-negotiable rules

- Keep the output generic and user-owned. Never introduce a mascot, brand, or private asset unless the user supplies it for that profile.
- Search public GitHub data before asking the user for facts exposed by GitHub.
- Enumerate the complete public repository inventory before selecting projects. An existing README is only a draft.
- Keep `found`, `inferred`, and `missing` values separate. Never present an inference as a fact.
- Preserve source URLs for profile facts, repository facts, logos, screenshots, and project sites.
- Keep product showcases, open-source proof, contribution evidence, and contacts distinct. Do not repeat a repository or product across modules.
- Prefer source-backed project logos and real project screenshots. Mark ambiguous or missing assets instead of inventing replacements.
- Use one contact row near the identity block. Remove duplicate bottom contact blocks and redundant stats/activity modules.
- Use GitHub-supported Markdown/HTML only. No JavaScript, CSS, iframe, or browser-layout assumptions inside the README.
- For Logo/name rows, set explicit image dimensions and `align="absmiddle"`. For tables that should span the profile container, use `<table width="100%">` and verify narrow layouts.
- Convert motion to a compatible SVG/GIF/APNG and provide a static fallback.
- Never place tokens, cookies, secrets, or private data in outputs, logs, or prompts.

## Procedure

### 1. Establish the target

Identify the GitHub username/profile URL, the special profile repository (`<username>/<username>`), the language mix, the audience/goal, and whether the result is export-only or publishable. Default to export-only until the user explicitly confirms a write.

### 2. Discover evidence

Run the bundled discovery script with the username:

```bash
node scripts/discover-profile.mjs --username <username> --output <workdir>/profile-discovery.json
```

Read the complete `repositoryInventory` first. Then inspect the enriched repositories, profile facts, source URLs, asset candidates, and gaps. Present only the evidence needed for decisions; do not repeat facts the API already returned.

### 3. Resolve gaps and select projects

Ask only for missing or ambiguous positioning, project highlights, screenshots, logos, websites, language mix, and contacts. Select 3-6 projects using public evidence, recency, relevance, and distinctness.

Run a duplication pass before writing:

1. Canonicalize every product and repository URL.
2. Remove any repeated repository/product across sections.
3. Replace removed rows with distinct evidence-backed candidates from the full inventory, or leave the slot missing.
4. Keep contacts in one visual location.

### 4. Choose and build the case

Read [references/style-system.md](references/style-system.md) only when style selection is needed. Record the selected style, density, palette, motion, language mix, and section order.

Build a focused case with:

- identity: name, positioning, one primary CTA;
- proof: selected products/projects, screenshots/logos, public signals;
- navigation: website, social links, and selected repositories;
- optional sections only when evidence gives them real value.

Keep important meaning in text. Use local committed assets for important visuals, explicit `alt` text, stable dimensions, and a source manifest when assets are collected.

### 5. Preview and validate

Render the README with `scripts/render-preview.mjs` and inspect both a wide viewport and a narrow viewport when available. Read [references/github-rendering.md](references/github-rendering.md) for compatibility decisions.

Validate with:

```bash
node scripts/validate-readme.mjs --readme <path>/README.md --assets <path>/assets
```

Fix all errors and review warnings before delivery. Check project duplication, Logo/name baseline alignment, full-width tables, image fallbacks, alt text, and horizontal overflow.

### 6. Deliver or publish

- Export: provide the generated README and assets without changing GitHub.
- Publish: only after the user confirms the exact files and destination; use the authenticated GitHub workflow, commit intentionally, push, then re-read the remote diff and verify the profile URL.

Never create a repository, change visibility, or push unrelated files implicitly.

## Resources

- `scripts/discover-profile.mjs`: public profile and repository inventory plus asset candidates.
- `scripts/render-preview.mjs`: lightweight local README preview.
- `scripts/validate-readme.mjs`: GitHub-safe HTML, image, link, and asset checks.
- [references/style-system.md](references/style-system.md): style choices and selection heuristics.
- [references/github-rendering.md](references/github-rendering.md): supported layout and asset rules.
- [references/output-schema.md](references/output-schema.md): discovery JSON contract.

## Failure handling

- `404`: report that the profile is not publicly discoverable and request a profile URL or manual data.
- Rate limit: report the reset context and use an authenticated GitHub session or a smaller scope; do not retry in a loop.
- Missing README/logo/screenshot: mark the field missing and ask for a user-provided asset or leave the visual slot out.
- Failed remote asset/widget: keep the source URL for review and provide a local/static fallback.
- Publication declined or unconfirmed: leave the export untouched and perform no GitHub write.
