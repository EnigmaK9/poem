# 02 - Data Model

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: Poem data structures and schema
Author: enigmak9

## Poem Object

```javascript
{
  id: number,        // 0-999, unique identifier
  title: string,     // Generated title, 1-6 words
  lines: string[],   // Array of verse lines, 3-12 lines each
  theme: string,     // One of: 'nature', 'time', 'love', 'solitude', 'wonder', 'memory'
  form: string       // One of: 'quatrain', 'haiku', 'couplets', 'freeverse', 'tercets'
}
```

## Design Decisions

- **Procedural generation over hardcoded text**: 1000 poems as raw strings would be ~500KB uncompressed. Procedural generation from templates and word pools is ~5KB of code and produces infinite variety.
- **Seeded PRNG ensures determinism**: Same poem index always produces the same poem. No storage needed.
- **Theme and form metadata**: Enables filtering and display variety without adding complexity.

## Memory Budget

- Poem generation code: ~3KB
- Word pools (arrays of words by category): ~2KB
- Poem templates: ~1KB
- Total overhead: ~6KB of JS, producing 1000 unique poems on demand
