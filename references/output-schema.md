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
  "repositoryInventory": [
    {
      "fullName": "octocat/example",
      "name": "example",
      "url": "https://github.com/octocat/example",
      "description": "...",
      "homepage": "https://...",
      "topics": ["..."],
      "stars": 0,
      "forks": 0,
      "language": "JavaScript",
      "updatedAt": "ISO-8601 timestamp",
      "archived": false,
      "fork": false,
      "score": 12.5
    }
  ],
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

`repositoryInventory` is the complete ranked public-repository list used for selection. `repositories` is the enriched subset chosen for deeper README analysis.

Keep URLs and source evidence intact. Consumers can add fields, but must not repurpose a candidate asset as a confirmed asset without user approval.
