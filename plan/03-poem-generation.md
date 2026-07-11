# 03 - Poem Generation

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: Procedural poem generation strategy
Author: enigmak9

## Strategy

Poems are generated procedurally using a seeded PRNG (mulberry32). Given an index N, the generator produces a deterministic poem by:

1. Seeding the PRNG with N
2. Selecting a poetic form (quatrain, haiku, couplets, freeverse, tercets)
3. Selecting a theme (nature, time, love, solitude, wonder, memory)
4. Building lines from template structures filled with themed word pools

## Seeded PRNG

```javascript
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

## Word Pools

Organized by part of speech and theme:

- **Nouns by theme**: e.g., nature → [river, mountain, forest, sky, ocean, ...]
- **Verbs by theme**: e.g., time → [fade, drift, linger, pass, return, ...]
- **Adjectives by theme**: e.g., solitude → [quiet, still, hollow, distant, ...]
- **Abstract nouns**: [eternity, silence, memory, shadow, light, ...]

## Templates per Form

### Quatrain (ABAB rhyme)
```
The [adj] [noun] [verb]s in the [noun],
[A] [adj] [noun] of [noun],
[Line with end-rhyme matching line 1],
[Line with end-rhyme matching line 2]
```

### Haiku (5-7-5 syllable pattern)
```
[5-syllable phrase about nature]
[7-syllable phrase with seasonal reference]
[5-syllable phrase with insight]
```

### Couplets
```
[Line ending in word A]
[Line ending in rhyme of A]

[Line ending in word B]
[Line ending in rhyme of B]
```

### Free Verse
```
[Image-based line]
[Contrasting image]
[Abstract reflection]
[Concrete detail]
```

### Tercets
```
[Line A]
[Line B]
[Line C - rhyme with A]
```

## Title Generation

Titles are generated from the poem's theme words: "[Adjective] [Noun]" or "The [Noun] of [Noun]" patterns.
