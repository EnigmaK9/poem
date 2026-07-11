# 06 - GitHub Pages Deployment

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: GitHub Pages deployment configuration
Author: enigmak9

## Setup

1. Push repository to GitHub
2. Enable GitHub Pages in repo Settings → Pages
3. Source: "Deploy from a branch" → `master` (or `main`) → `/ (root)`
4. Site available at `https://<username>.github.io/<repo-name>/`

## Required Files at Root

```
/
├── index.html          -- Entry point (required by GitHub Pages)
├── css/
│   └── style.css
├── js/
│   ├── poems.js
│   ├── rotation.js
│   └── main.js
└── plan/               -- Planning docs (not served as pages)
```

## No Special Configuration Needed

- No `_config.yml` (not a Jekyll site)
- No `.nojekyll` needed if we're not using underscores in top-level directories that Jekyll would ignore. Wait — `css/` and `js/` are fine. But `_site/` and similar underscore-prefixed dirs would need `.nojekyll`. We have none, so no action needed.

## Custom Domain

Optional, not required for initial deployment. Documented here for future reference.

## Caching

Static assets change rarely. GitHub Pages sets reasonable cache headers by default. No additional config needed.
