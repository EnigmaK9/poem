# 01 - Architecture

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: Overall architecture for the poetry display site
Author: enigmak9

## Goal

Static website that displays 1000 procedurally generated poems in descending order, with daily rotation. Hosted on GitHub Pages.

## Architecture Decision

**Single-page static site. No framework, no build step, no dependencies.**

Rationale: GitHub Pages serves static files. A single HTML file with embedded or linked CSS/JS is the simplest thing that satisfies every requirement. No React, no webpack, no npm.

## File Structure

```
/
├── index.html          -- Entry point, semantic HTML structure
├── css/
│   └── style.css       -- All styling
├── js/
│   ├── poems.js        -- Poem generation engine (procedural, seeded PRNG)
│   ├── rotation.js     -- Daily rotation logic (date-based selection)
│   └── main.js         -- DOM rendering, event binding, initialization
└── plan/
    └── 01 through 07   -- These planning documents
```

## Data Flow

1. Page loads
2. `main.js` calls `rotation.js` to get today's poem indices
3. `rotation.js` uses current date to seed the shuffle
4. `main.js` calls `poems.js` to generate poem objects by index
5. `poems.js` uses a seeded PRNG to deterministically produce each poem
6. `main.js` renders poems into the DOM in descending order

## Constraints

- No external dependencies (no npm packages, no CDN scripts)
- No build step (plain HTML/CSS/JS)
- Works on any modern browser
- GitHub Pages compatible (no server-side code)
- All content in English
- No name "anel" anywhere in the codebase
