# GitHub Profile Designer Skill Design

## Goal

Create a standalone, generic Codex Skill named `github-profile-designer`. It researches public GitHub profile and repository information, asks for missing or ambiguous data, offers a small style system, produces a README case draft and compatible assets, validates the result, and either exports files or publishes them to the user's profile repository after explicit confirmation.

## Scope

The first release is a pure Skill with deterministic Node scripts. It does not include a web wizard, a mascot, brand-specific assets, or a hosted service. Public discovery works without credentials when GitHub permits it; optional `GH_TOKEN` or `GITHUB_TOKEN` may improve rate limits. Publishing requires the user's authenticated GitHub workflow.

## Workflow

1. Identify the username and intended profile repository.
2. Discover profile facts, ranked public repositories, README media, project sites, and asset candidates.
3. Present found data with source URLs and missing fields separately.
4. Ask for only missing or ambiguous information.
5. Let the user choose one of five styles: Clean Editorial, Bento Showcase, Terminal Native, Product Case Study, or Bold Portfolio.
6. Build a case draft and asset manifest.
7. Generate `README.md` and supporting assets.
8. Render a local preview and validate Markdown, links, images, and GitHub constraints.
9. Export the result or, after confirmation, commit and push to the profile repository.

## Components

- `SKILL.md`: procedural instructions and safety boundaries.
- `scripts/discover-profile.mjs`: public GitHub REST discovery with provenance and gaps.
- `scripts/render-preview.mjs`: dependency-free local visual preview.
- `scripts/validate-readme.mjs`: deterministic compatibility and asset checks.
- `references/style-system.md`: style selection and shared visual tokens.
- `references/github-rendering.md`: GitHub-supported document constraints.
- `references/output-schema.md`: discovery JSON contract.

## Safety

The Skill must not invent facts, expose credentials, upload unapproved files, or perform GitHub writes without user confirmation. Ambiguous logos, screenshots, and third-party widgets remain candidates until approved.

## Success Criteria

- A public username produces useful profile and repository JSON or a clear, actionable error.
- Missing copy and assets are surfaced instead of fabricated.
- Every generated visual has source evidence and alt text.
- The README passes validation without unsupported scripts or CSS.
- A user can receive a copy-ready export without GitHub permissions.
