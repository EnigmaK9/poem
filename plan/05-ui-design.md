# 05 - UI Design

Creation Date: 2026-07-10
Last Modified: 2026-07-10
Description: User interface design for poetry display
Author: enigmak9

## Layout

```
+------------------------------------------+
|  Header: site title, date indicator       |
+------------------------------------------+
|  Featured Poem (daily, prominent)         |
|  +--------------------------------------+|
|  | Title                                ||
|  | ................................     ||
|  | Lines in descending visual order     ||
|  | Index marker                         ||
|  +--------------------------------------+|
+------------------------------------------+
|  Poem stream (descending, paginated)     |
|  +--------------------------------------+|
|  | Poem N                                ||
|  | Poem N-1                              ||
|  | Poem N-2                              ||
|  | ...                                   ||
|  +--------------------------------------+|
|  [Load 20 more]                          |
+------------------------------------------+
|  Footer: generation info                 |
+------------------------------------------+
```

## Typography

- System font stack for body text
- Serif font for poem text (Georgia, serif)
- Large, readable line height (1.8) for verse

## Color Scheme

- Dark background (#1a1a2e or similar deep tone)
- Warm text (#e0d8c8 or off-white)
- Subtle accent for daily poem highlight
- Minimal, no bright colors — let the words carry the weight

## Responsive Behavior

- Single column, max-width 720px centered
- Padding adapts to viewport
- No mobile-specific breakpoints needed with max-width constraint

## States

- **Loading**: Poem text fades in as generated
- **Empty**: Not possible — poems are procedural, always available
- **Error**: Not possible without JS — show a static message in `<noscript>`

## Accessibility

- Semantic HTML: `<article>` per poem, `<h1>` for title, `<h2>` for poem titles
- Skip to content link
- Sufficient color contrast (off-white on dark background)
- No animation-dependent content
