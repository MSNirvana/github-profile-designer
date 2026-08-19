# GitHub Rendering Constraints

GitHub Profile README files are rendered as repository Markdown. Treat them as a constrained document, not a web application.

## Safe Defaults

- Use Markdown headings, lists, links, tables, blockquotes, and fenced code where appropriate.
- Use `<img>` with explicit `alt`, `width`, and `height` when stable sizing matters.
- Use `<picture>` only for simple light/dark image variants with a static fallback.
- Keep important content in text; never put the only copy inside an image.
- Commit important assets to the profile repository or use a stable, user-controlled URL.
- Pin third-party widgets to documented, reputable endpoints and record them in the asset manifest.

## Avoid

- JavaScript, `<script>`, CSS files, inline event handlers, iframes, and assumptions about arbitrary CSS classes.
- Layouts that depend on a fixed browser viewport or on scripts running in GitHub.
- Unbounded remote image URLs, URL shorteners, and hotlinked assets with unclear ownership.
- Excessive animated images, flashing effects, or motion that cannot be understood when static.
- Empty image alt text for meaningful visuals and duplicate H1 headings.

## Asset Decisions

Prefer candidates in this order:

1. User-provided or repository-owned logo.
2. An image linked in the project's README with a clear logo/screenshot context.
3. The project's official homepage favicon or OG image.
4. GitHub's social preview image, clearly labeled as a preview rather than a logo.
5. A text-only project block when no trustworthy visual exists.

When an asset is remote, retain the source URL and a local fallback or mark it as requiring user confirmation. Do not download or rehost an asset without the user's approval when ownership is unclear.
