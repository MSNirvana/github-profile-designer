# helloianneo GitHub Profile Design

## Goal

Create a copy-ready GitHub Profile README for `helloianneo` that primarily showcases AI products and reusable Skills. The result should be Chinese-first with short English labels, evidence-backed, GitHub-compatible, and independent of any write to GitHub.

## Evidence

- Public profile name: Ian / helloianneo
- Public bio: product designer
- Public site: https://ianneo.xyz
- Public site positioning: 产品设计师 / 一人公司实践者 / AI Builder
- Public social links: X `@ianneo_ai`, Dribbble `neocurve`, email `hello.neoc@gmail.com`
- Public repositories: 6
- Strongest public signals:
  - `ian-xiaohei-illustrations`: 9,655 stars, 1,218 forks
  - `ian-handdrawn-ppt`: 1,336 stars, 130 forks
  - `ian-xiaohei-scenes`: 473 stars, 63 forks
  - `awesome-claude-code-skills`: 439 stars, 100 forks
  - `obsidian-ai-second-brain`: 232 stars, 28 forks
  - `claude-code-handbook`: 208 stars, 47 forks

The GitHub API was rate-limited during discovery, so profile and repository facts were verified through the public GitHub profile and repository pages. The final output must preserve these public source URLs.

## Visual Direction

Use `Product Case Study`, standard density, Chinese-first copy, and short English labels. Use a restrained paper-white, charcoal, coral, and blue accent palette derived from the public repository imagery without copying a specific repository README layout.

## Layout

1. **Hero / Identity**
   - Name: `Ian / 伊恩`
   - Positioning: `Product Designer · AI Builder`
   - Supporting line: `用 AI 团队，把想法做成有用的产品。`
   - One short English line: `Build useful things with AI.`
   - One contact row containing website, X, Dribbble, and email.

2. **Featured AI Products**
   - Three screenshot-led product blocks:
     - `ian-xiaohei-illustrations` / `Xiaohei Illustrations`
     - `ian-xiaohei-scenes` / `Xiaohei Scenes`
     - `ian-handdrawn-ppt` / `Ian Handdrawn PPT`
   - Each block includes one local README example image, a concise evidence-backed description, star/fork signals, and the repository link.
   - Do not describe these as commercial products or claim results not present in the public README.

3. **Skill Ecosystem / More Projects**
   - Use a full-width HTML table with three distinct projects:
     - `awesome-claude-code-skills`
     - `obsidian-ai-second-brain`
     - `claude-code-handbook`
   - Use text-first rows when no trustworthy project logo is available. Never substitute a random favicon or social preview as a confirmed logo.

4. **Method / Positioning**
   - Short text section connecting product design, AI workflows, visual communication, and one-person company practice.
   - Use only wording supported by the public site or repository descriptions.

## Asset Plan

- Download selected README example images through the public repository pages and keep their source URLs in `assets-manifest.json`.
- Use the public GitHub avatar only as an identity fallback if it improves the Hero; otherwise keep the Hero typographic and screenshot-led.
- Every image must have an explicit `alt`, stable dimensions, and a local fallback.
- Avoid embedding contact QR codes or personal phone numbers in the profile unless the user explicitly supplies them for this output.

## Compatibility And QA

- Use Markdown plus GitHub-supported HTML only.
- Use `align="absmiddle"` with explicit Logo dimensions for inline Logo/name rows.
- Use `<table width="100%">` for the ecosystem table.
- Verify no repeated repository appears in both featured products and the ecosystem table.
- Render and inspect wide and 390px viewports.
- Run `validate-readme.mjs` with the local asset directory and check for missing alt text, missing local files, unsafe links, and horizontal overflow.

## Delivery

Generate a copy-ready directory under the workspace containing:

```text
helloianneo-profile/
├── README.md
├── assets/
├── assets-manifest.json
├── profile-discovery.json
└── profile-preview.html
```

Do not push or modify `helloianneo` on GitHub. The user will copy the output manually.
