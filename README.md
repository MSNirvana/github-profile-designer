# GitHub Profile Designer

通用 Codex Skill：从公开 GitHub 资料出发，设计、预览、校验并按确认发布 Profile README。

[English](README.en.md) · [Skill instructions](SKILL.md) · [GitHub repository](https://github.com/MSNirvana/github-profile-designer)

![Profile README case generated with GitHub Profile Designer](docs/screenshots/msnirvana-profile.jpg)

上图是本 Skill 生成的真实 Profile 案例截图，用于展示输出形态，不是固定模板，也不会把个人内容写入 Skill 规则。

## AI 工作边界

- 先读取用户资料和完整公开仓库集合，再选择项目。
- 区分已找到、推断和缺失信息，保留来源 URL。
- 选择风格前完成项目去重，避免产品、开源证明和联系方式重复。
- 优先使用项目自有 Logo、README 截图和项目网站；没有可信素材就标记缺失。
- 遵守 GitHub Markdown/HTML 限制，检查 Logo 对齐、全宽表格、响应式宽度和图片 alt 文本。
- 仅在用户明确确认后写入或推送 GitHub。

## 核心资源

`SKILL.md` 是 AI 的执行入口；脚本和 `references/` 只在任务需要时读取或运行：

- `scripts/discover-profile.mjs`：公开资料与仓库发现
- `scripts/render-preview.mjs`：README 本地预览
- `scripts/validate-readme.mjs`：兼容性与素材校验
- `references/style-system.md`：风格选择
- `references/github-rendering.md`：GitHub 渲染约束
- `references/output-schema.md`：发现数据结构

仓库内容以 AI 执行为中心；需要执行时，以 `SKILL.md` 和上述资源为准。

## License

[MIT](LICENSE)
