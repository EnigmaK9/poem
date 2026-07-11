# 07 - Testing Strategy

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: Verification and testing approach
Author: enigmak9

## Verification Steps

### 1. Poem Generation (unit-level, manual)

- Generate poem for index 0, verify it has title, lines, theme, form
- Generate poem for index 0 again, verify it matches (determinism)
- Generate poem for index 999, verify it differs from index 0
- Generate all 1000 poems, verify all have unique titles (collision check)

### 2. Daily Rotation (unit-level, manual)

- Call `getDailySeed()` at a known date, verify result
- Verify seed changes when date advances by one day
- Verify same seed across multiple calls on the same UTC day

### 3. DOM Rendering (integration, manual)

- Load index.html in browser
- Verify featured poem is displayed
- Verify descending order
- Click "Load more", verify 20 more poems appear
- Verify no console errors

### 4. GitHub Pages (deployment, manual)

- Push to GitHub
- Visit the Pages URL
- Verify site loads and displays poems
- Verify daily rotation works

### 5. Cross-browser

- Test in Firefox and Chromium
- Verify layout and rendering

## Self-Check Script

A `demo()` function in `poems.js` that:
- Generates poems 0, 1, 999
- Logs them to verify structure
- Checks determinism: poem 0 === poem 0
- Checks uniqueness: poem 0 !== poem 1

Run by loading the page and checking the console (development only).
