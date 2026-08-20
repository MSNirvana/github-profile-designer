# GitHub Profile Designer

Turn public GitHub information into a profile README that feels intentional and personal.

[中文主文档](README.md) · [Skill source](SKILL.md) · [Issue tracker](https://github.com/MSNirvana/github-profile-designer/issues)

`github-profile-designer` is a generic Codex Skill. It researches a GitHub user and public repositories, asks for missing information, offers a small visual style system, generates a README case, validates GitHub compatibility, and then exports the files or publishes them to the user's Profile repository after confirmation.

It is not a fixed template and does not ship with any mascot, company identity, or private asset library. Each run re-reads the user's complete public repository set instead of silently reusing a previous README selection.

## Workflow

```text
Public discovery  ->  Gap questions  ->  Style choice  ->  README case  ->  Preview and validation  ->  Export / publish
```

The screenshots below come from a real public-data run against `octocat`. They were produced with `scripts/discover-profile.mjs`, `scripts/render-preview.mjs`, and `scripts/validate-readme.mjs`.

### 1. Discover public data

The Skill first inventories the complete public repository set, then collects profile facts, repository descriptions, languages, Topics, Stars, Forks, README images, project sites, and logo candidates. It keeps found values separate from missing values.

![Public discovery: profile facts, project candidates, and missing fields](docs/screenshots/01-discovery.png)

### 2. Choose a visual direction

The Skill chooses a visual system from the user's goal, audience, and available evidence instead of stacking every badge and widget. Five built-in directions are available:

| Style | Best for |
| --- | --- |
| Clean Editorial | Hiring, research, consulting, individual maintainers |
| Bento Showcase | Multi-product builders and indie hackers |
| Terminal Native | CLI, infrastructure, and developer tools |
| Product Case Study | Founders, product engineers, client work |
| Bold Portfolio | Creative technologists, speakers, design-minded developers |

![Style choice: five generic README directions](docs/screenshots/02-styles.png)

### 3. Generate, preview, and validate

The Skill produces a copy-ready `README.md`, an assets directory, an asset provenance manifest, and discovery data. The previewer checks hierarchy, images, and responsive width; the validator catches scripts, iframes, unsafe links, missing local images, and missing alt text.

![README case preview: generated output and GitHub compatibility check](docs/screenshots/03-preview.png)

## Install

Clone the repository into your Codex Skills directory:

```bash
git clone https://github.com/MSNirvana/github-profile-designer.git ~/.codex/skills/github-profile-designer
```

Replace `~/.codex` with `$CODEX_HOME` when your environment uses that variable.

## Usage

Ask Codex for something like:

```text
Design my GitHub Profile README for username octocat.
Search public data first, show what you found and what is missing, then let me choose a style.
```

The Skill follows this sequence:

1. Read the complete public repository inventory and preserve source URLs.
2. Separate found, inferred, and missing values. Never turn an inference into a fact.
3. Ask for missing positioning, project highlights, logos, screenshots, and contact links.
4. Offer five styles and record density, palette, motion, and language mix.
5. Deduplicate product showcases and open-source proof so one project is not repeated across modules.
6. Keep contact links in one visual location and prefer small, source-backed brand icons over a repeated bottom contact block.
7. Generate a case, then preview and validate it.
8. Export the files or update the Profile repository after explicit confirmation.

## CLI scripts

### Discover public data

```bash
node scripts/discover-profile.mjs \
  --username octocat \
  --repo-limit 12 \
  --readme-limit 8 \
  --output profile-discovery.json
```

The script uses GitHub's public REST API and works without a token. Setting `GH_TOKEN` or `GITHUB_TOKEN` can improve rate limits; the token is never written to output files.

### Render a local preview

```bash
node scripts/render-preview.mjs \
  --readme profile-output/octocat/README.md \
  --output profile-output/octocat/preview.html
```

### Validate a README

```bash
node scripts/validate-readme.mjs \
  --readme profile-output/octocat/README.md \
  --assets profile-output/octocat/assets \
  --check-remote
```

## Output

```text
profile-output/<username>/
├── README.md
├── assets/
├── assets-manifest.json
└── profile-discovery.json
```

Every important visual should have a source, fallback, and alt text. When no trustworthy logo or screenshot exists, the Skill keeps it as missing instead of substituting a random image.

## Boundaries

- A GitHub Profile README is a Markdown document, not a JavaScript website.
- Convert motion to GIF, APNG, or compatible SVG and provide a static fallback.
- Do not upload local files, modify repositories, or push code by default.
- Require explicit confirmation before publishing to GitHub.
- Never invent outcomes, clients, metrics, roles, or dates.
- Keep important meaning in text; do not hide the entire profile inside an image.
- Evaluate product, proof, contribution, and contact modules for information value; remove redundant or colliding modules instead of stacking them.

Read the detailed rules in:

- [Skill workflow](SKILL.md)
- [Style system](references/style-system.md)
- [GitHub rendering constraints](references/github-rendering.md)
- [Discovery output schema](references/output-schema.md)

## Development and validation

```bash
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py .
node --check scripts/discover-profile.mjs
node --check scripts/render-preview.mjs
node --check scripts/validate-readme.mjs
```

Generate the workflow demo pages with:

```bash
node scripts/render-workflow-demo.mjs \
  --discovery /path/to/profile-discovery.json \
  --validation /path/to/validation.json \
  --output /tmp/github-profile-designer-demo
```

## License

[MIT](LICENSE)
