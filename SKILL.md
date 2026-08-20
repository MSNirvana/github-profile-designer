---
name: github-profile-designer
description: Design, generate, validate, and optionally publish polished GitHub profile README pages from public GitHub profile and repository data. Use when a user asks to decorate, redesign, generate, audit, preview, or update a GitHub Profile README, including requests for project showcases, repository logos, screenshots, styles, badges, animated assets, or a copy-ready export.
---

# GitHub Profile Designer

Use this skill to turn a user's public GitHub presence into an intentional, GitHub-compatible profile README. Treat the README as a constrained publishing surface: use Markdown, supported HTML, images, SVG/GIF/APNG assets, and external widgets only when they improve the page and remain maintainable.

## Operating Rules

- Keep the design generic and user-owned. Never add a mascot, brand, visual identity, or asset that the user did not request.
- Search public GitHub information first. Do not ask the user to repeat information that the API already exposes.
- Enumerate the user's complete public repository set before choosing featured projects. Treat an earlier README as a draft, not the source of truth.
- Separate `found`, `inferred`, and `missing` values. Do not turn an inference into a fact.
- Show source URLs for profile data, repository facts, logos, screenshots, and project sites.
- Keep product showcases and open-source proof separate. Do not repeat the same repository or product in both sections unless the user explicitly requests a cross-link.
- Prefer distinct public repositories with different names, descriptions, logos, screenshots, or homepages when filling an open-source proof section.
- Use one contact row near the identity block. Prefer small, source-backed brand icons with descriptive `alt` text; remove a repeated bottom contact section.
- Remove contribution graphs, activity routes, or stats panels when they duplicate proof content or collide with contact content.
- Ask for user confirmation before sending any write, upload, commit, push, or pull-request action.
- Never place access tokens, cookies, or local secrets in generated files, logs, previews, or prompts.
- Prefer real project screenshots and project-owned logos. Do not use random stock images as substitutes.
- Do not promise browser-like CSS or JavaScript inside GitHub README. Convert motion to a hosted GIF/APNG/SVG or provide a static fallback.

## Workflow

### 1. Define the target

Ask for or identify:

- GitHub username or profile URL.
- Whether the target is the user's special profile repository (`<username>/<username>`).
- Desired language mix, audience, and primary goal (hiring, open source, products, research, or community).
- Whether the user wants a direct GitHub update or a copy-ready export.

Default to the public profile only and to an export before any write. If a GitHub username is available, run the discovery script before asking content questions.

### 2. Discover public data

Run the bundled script from the skill directory:

```bash
node scripts/discover-profile.mjs --username <username> --output <workdir>/profile-discovery.json
```

Use a broad `--repo-limit` for discovery, then rank and filter locally. The script uses GitHub's public REST API and can use an already-authenticated `GH_TOKEN`/`GITHUB_TOKEN` without printing it. If the REST API is rate-limited, use the user's authenticated GitHub CLI/API session to enumerate public repositories instead of silently reusing the previous README selection. Read the resulting JSON and present:

1. Profile facts with their source URLs.
2. The complete public-repository inventory, followed by candidates ranked by public signals and recency.
3. Candidate logos, screenshots, social previews, homepages, and favicons for each selected project.
4. Missing fields and a short question for each missing field.

When a README image is found, preserve its original URL and evidence (alt text, source README, and nearby text). A social preview or favicon is a candidate, not a confirmed project logo. Ask the user to approve or replace ambiguous assets.

### 3. Resolve gaps

Ask only for missing or ambiguous values. Prioritize:

1. One-line positioning statement.
2. Which 3-6 repositories or products to feature.
3. Project highlight, outcome, or differentiator for each selected item.
4. Logo and screenshot confirmation or upload/URL.
5. Contact and social links.

Keep the user's original wording when they provide copy. Offer a concise rewrite only as an explicit alternative. Do not invent metrics, clients, roles, or dates.

### 4. Select a style

Read [references/style-system.md](references/style-system.md) and offer the five styles by name. Recommend one based on the user's audience and repository mix, then let the user choose. Record these decisions:

- style name and density (`compact`, `standard`, or `rich`)
- palette (default or user-specified)
- motion (`static`, `light`, or `animated`)
- language mix and section order

Do not combine incompatible patterns without explaining the trade-off. Keep the first case focused; add sections only when they have evidence to fill them.

### 5. Build a case draft

Create a content and asset plan before writing the final README:

- Hero: name, positioning line, one primary call to action.
- Proof: selected projects, real screenshots/logos, languages, or public signals.
- Navigation: contact, website, social links, and selected repositories.
- Optional sections: now, writing, talks, stats, contribution graph, or currently learning.

Use stable widths and `alt` text for every image. Prefer local committed assets for important visuals, with a source manifest beside the README. Use remote badges/widgets sparingly and record their URL.

Before generating, run a duplication pass:

1. Record canonical repository URLs for every product and proof row.
2. Remove any proof row whose canonical URL or repository name already appears in the product matrix.
3. Replace removed rows with distinct public repositories from the full inventory, or ask the user to choose when no trustworthy candidate has enough evidence.
4. Check that contact links appear in one visual location only.

### 6. Generate output

Generate a copy-ready directory, normally:

```text
profile-output/<username>/
├── README.md
├── assets/
├── assets-manifest.json
└── profile-discovery.json
```

Keep the README readable in raw Markdown. Use HTML only where GitHub reliably renders it, such as aligned tables or images with explicit dimensions. Do not add JavaScript, CSS files, `<script>`, iframes, or unsupported layout assumptions.

### 7. Preview and validate

Render the README for visual inspection:

```bash
node scripts/render-preview.mjs --readme <path>/README.md --output <path>/preview.html
```

Validate the final Markdown and assets:

```bash
node scripts/validate-readme.mjs --readme <path>/README.md --assets <path>/assets
```

Read [references/github-rendering.md](references/github-rendering.md) when choosing widgets, images, animation, or layout. Fix all errors and review warnings with the user. Check both a wide viewport and a narrow viewport when a browser or local preview is available.

### 8. Deliver or publish

Offer two explicit outcomes:

- **Export:** provide the output directory and explain that its `README.md` belongs in the special profile repository.
- **Publish:** after the user confirms the exact files and destination, use the user's GitHub-authenticated workflow (`gh` or the connected GitHub app) to update the profile repository, commit, and push. Re-read the remote diff and verify the rendered profile URL after publishing.

If authentication or repository permissions are missing, stop at the export and explain the exact prerequisite. Never silently create a repository, change visibility, or push unrelated files.

## Resource Guidance

- Use `scripts/discover-profile.mjs` for deterministic public-data collection.
- Use `scripts/render-preview.mjs` for a local visual check; it is a lightweight Markdown preview, not a claim that GitHub supports arbitrary HTML.
- Use `scripts/validate-readme.mjs` before delivery and after any user edits.
- Use `scripts/render-workflow-demo.mjs` when documenting or screenshotting the discovery, style, and preview stages.
- Read `references/output-schema.md` before interpreting discovery JSON or building an asset manifest.
- Read `references/style-system.md` for style selection and `references/github-rendering.md` for compatibility decisions.

## Failure Handling

- If GitHub returns `404`, explain that the username or profile is not publicly discoverable and ask for a profile URL or manual data.
- If GitHub returns a rate-limit error, report the reset context when available and ask the user for a token or a smaller discovery scope; do not retry in a loop.
- If a repository has no README, homepage, or image, mark its visual assets as missing and ask the user for a logo or screenshot.
- If a remote image or widget fails validation, provide a local/static fallback and keep the failed URL in the manifest for review.
- If the user declines publication, leave the export untouched and do not make any GitHub write.
