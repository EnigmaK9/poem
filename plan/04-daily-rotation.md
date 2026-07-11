# 04 - Daily Rotation

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: Daily poem rotation logic
Author: enigmak9

## Behavior

- All 1000 poems are always available
- Poems display in descending order by index (999 down to 0)
- Each day, the featured/starting position changes
- The daily seed = days since epoch, ensuring global consistency across timezones (UTC)

## Daily Selection

```javascript
function getDailySeed() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const start = Date.UTC(utcYear, 0, 0);
  const diff = now.getTime() - start;
  return Math.floor(diff / 86400000); // day of year in UTC
}
```

## Display Order

1. Featured poem of the day: `daySeed % 1000` — shown prominently at top
2. Remaining poems in descending order (999 → 0), with the daily poem highlighted
3. User can scroll through all 1000 poems

## Pagination

To avoid rendering 1000 poems at once:
- Show 20 poems at a time
- "Load more" button at bottom
- Virtual scrolling not needed — 20 poems is ~2KB of DOM, 1000 is ~100KB which is fine for lazy loading in chunks of 20

## Edge Cases

- Day boundary: UTC midnight triggers the rotation
- Feb 29: handled by Date.UTC, no special casing needed
- DST changes: UTC avoids this entirely
