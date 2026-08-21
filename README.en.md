# GitHub Profile Designer

A generic Codex Skill for designing, previewing, validating, and optionally publishing a GitHub Profile README from public GitHub evidence.

[中文](README.md) · [Skill instructions](SKILL.md) · [GitHub repository](https://github.com/MSNirvana/github-profile-designer)

![Profile README case generated with GitHub Profile Designer](docs/screenshots/msnirvana-profile.jpg)

The image is a real Profile case generated with this Skill. It demonstrates the output surface; it is not a fixed template, and personal content is not embedded in the Skill rules.

## AI operating boundary

- Read the profile and complete public repository inventory before selecting projects.
- Keep found, inferred, and missing values separate and preserve source URLs.
- Deduplicate products, open-source proof, contribution evidence, and contacts before writing.
- Prefer project-owned Logos, README screenshots, and project sites; mark untrusted assets as missing.
- Respect GitHub Markdown/HTML limits and check Logo alignment, full-width tables, responsive width, and image alt text.
- Write or push to GitHub only after explicit user confirmation.

## Core resources

`SKILL.md` is the AI execution entry point. Load or run the other resources only when the task requires them:

- `scripts/discover-profile.mjs`: public profile and repository discovery
- `scripts/render-preview.mjs`: local README preview
- `scripts/validate-readme.mjs`: compatibility and asset validation
- `references/style-system.md`: style selection
- `references/github-rendering.md`: GitHub rendering constraints
- `references/output-schema.md`: discovery data contract

The repository is organized for AI execution rather than human tutorials. Use `SKILL.md` and the resources above.

## License

[MIT](LICENSE)
