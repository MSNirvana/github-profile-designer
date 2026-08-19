# Discovery Output Schema

`discover-profile.mjs` writes JSON with `schemaVersion: "1.0"`.

```json
{
  "schemaVersion": "1.0",
  "fetchedAt": "ISO-8601 timestamp",
  "query": {"username": "octocat", "repoLimit": 12},
  "profile": {
    "login": "octocat",
    "name": "The Octocat",
    "bio": "...",
    "avatarUrl": "https://...",
    "profileUrl": "https://github.com/octocat",
    "blog": "https://...",
    "social": {"twitter": "..."},
    "sources": {"name": "https://api.github.com/users/octocat"}
  },
  "repositories": [
    {
      "fullName": "octocat/example",
      "name": "example",
      "url": "https://github.com/octocat/example",
      "description": "...",
      "homepage": "https://...",
      "topics": ["..."],
      "stars": 0,
      "forks": 0,
      "languages": {"JavaScript": 1000},
      "readme": {"url": "https://...", "fetched": true, "excerpt": "..."},
      "assets": {
        "logoCandidates": [{"url": "https://...", "reason": "...", "source": "..."}],
        "screenshotCandidates": [],
        "websiteCandidates": [],
        "socialPreview": {"url": "https://...", "reason": "..."}
      },
      "sources": {"repository": "https://api.github.com/repos/..."}
    }
  ],
  "gaps": [{"field": "positioningStatement", "prompt": "...", "severity": "high"}],
  "errors": []
}
```

Keep URLs and source evidence intact. Consumers can add fields, but must not repurpose a candidate asset as a confirmed asset without user approval.
