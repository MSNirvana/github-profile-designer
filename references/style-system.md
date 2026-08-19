# Style System

Use one primary style per profile. The style controls hierarchy, spacing, image treatment, and section order; it does not force a fixed color palette.

## Clean Editorial

- Audience: hiring managers, researchers, consultants, and individual maintainers.
- Layout: compact hero, one-line positioning, 3-4 selected projects, short contact row.
- Treatment: generous whitespace, restrained color, typography-led hierarchy.
- Avoid: excessive badges, dense stats, decorative separators.

## Bento Showcase

- Audience: multi-project builders, indie hackers, and product teams.
- Layout: modular project blocks with one hero tile, one metrics tile, and one links tile.
- Treatment: consistent image ratios, clear labels, short copy, two-column rhythm.
- Avoid: nested cards and more than six repeated project blocks.

## Terminal Native

- Audience: infrastructure engineers, CLI/tool authors, and open-source maintainers.
- Layout: terminal-like opening, command or stack summary, repository list, contribution proof.
- Treatment: monospace accents, code snippets, dark or high-contrast palette when requested.
- Avoid: fake command output, inaccessible low contrast, and decorative code that says nothing.

## Product Case Study

- Audience: founders, product engineers, and client-facing builders.
- Layout: value proposition, featured products, screenshots, outcomes, links.
- Treatment: screenshot-first modules, clear CTA, product logos with source labels.
- Avoid: claiming traction or customer results that the user did not provide.

## Bold Portfolio

- Audience: design-minded developers, creative technologists, and public speakers.
- Layout: strong hero, one visual signature, selected work, social/contact footer.
- Treatment: high-contrast accent color, large but bounded headings, intentional image crops.
- Avoid: oversized banners that push projects below the fold or unreadable text inside images.

## Selection Heuristics

1. Choose the audience and goal before the visual preference.
2. Choose Clean Editorial when evidence is mostly text and repositories.
3. Choose Bento Showcase when there are several equally important products.
4. Choose Terminal Native when the profile is tool- or systems-oriented.
5. Choose Product Case Study when screenshots and websites are the strongest proof.
6. Choose Bold Portfolio only when the user can provide strong, high-resolution visual assets.

## Shared Tokens

- Desktop content width: keep the main composition below roughly 1000-1100px.
- Image ratios: use 16:9 for screenshots, 1:1 for logos, and 3:1 or less for a hero banner.
- Density: `compact` means 3-5 sections, `standard` 5-7, `rich` 7-9.
- Motion: use static assets by default; use GIF/APNG/SVG only when the motion communicates state or product behavior.
- Every visual needs a source, fallback, and concise alt text.
