---
name: Português
description: A personal Brazilian Portuguese study app laid like Burle Marx's Copacabana pavement, one stone per study card.
colors:
  ground: "#f3f3f0"
  raised: "#e9e8e2"
  sunken: "#dddcd4"
  line: "#d3d2c9"
  rule: "#dad9d1"
  ink: "#121212"
  muted: "#5d5d57"
  faint: "#8a8a83"
  basalt: "#141413"
  basalt-2: "#22221f"
  basalt-line: "#33332f"
  limestone: "#f3f3f0"
  on-basalt: "#f3f3f0"
  on-basalt-muted: "#a6a69e"
  sea: "#087099"
  sea-bright: "#3fb3dd"
  sun: "#ffc531"
  sun-deep: "#e8a800"
  on-sun: "#121212"
  positive: "#1f7a4a"
  positive-soft: "#ddf1e5"
  negative: "#b8392a"
  negative-soft: "#f8e1dc"
  stone-rose-granite: "#B4475C"
  stone-palm: "#2F7D57"
  stone-ochre: "#E0A021"
  stone-slate-blue: "#3F51C4"
  stone-sea: "#087099"
  stone-basalt: "#1E1E1C"
  stone-terracotta: "#B4532A"
  stone-earth: "#7A5A3A"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(44px, 6.4vw, 92px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
    fontVariation: "'wdth' 78"
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 84"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 650
  caption:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 650
    fontFeature: "'tnum'"
rounded:
  stone: "3px"
  chip: "6px"
  control: "10px"
  token: "12px"
  grade: "14px"
  choice: "16px"
  surface: "18px"
  palette: "20px"
  card: "26px"
  pill: "999px"
spacing:
  stone-gap: "2px"
  socket-gap: "4px"
  tight: "8px"
  gutter: "12px"
  field-x: "14px"
  card-pad: "18px"
  button-x: "20px"
  panel-pad: "22px"
components:
  button:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  button-hover:
    backgroundColor: "{colors.raised}"
  button-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.on-sun}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  button-sun-hover:
    backgroundColor: "{colors.sun-deep}"
  button-sun-lg:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.on-sun}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 26px"
    height: "58px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "46px"
  button-ghost-hover:
    backgroundColor: "{colors.sunken}"
  field:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "46px"
  segmented:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "4px"
  segmented-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "38px"
  chip:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.chip}"
    padding: "0 9px"
    height: "24px"
  chip-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.on-sun}"
  panel:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "22px"
  field-basalt:
    backgroundColor: "{colors.basalt}"
    textColor: "{colors.on-basalt}"
    rounded: "{rounded.surface}"
    padding: "12px"
  rail-item:
    backgroundColor: "transparent"
    textColor: "{colors.on-basalt-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  rail-item-active:
    backgroundColor: "{colors.limestone}"
    textColor: "{colors.basalt}"
  choice:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.choice}"
    padding: "0 18px"
    height: "62px"
  choice-correct:
    backgroundColor: "{colors.positive-soft}"
    textColor: "{colors.positive}"
  choice-wrong:
    backgroundColor: "{colors.negative-soft}"
    textColor: "{colors.negative}"
  grade-button:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.grade}"
    padding: "12px 14px"
  token:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.token}"
    padding: "0 16px"
    height: "46px"
  token-placed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
---

# Design System: Português

## Overview

**Creative North Star: "Calçadão"**

The app is Burle Marx's Copacabana promenade seen from above. Every vocabulary item is one tessera; studying it lays the stone. A basalt rail and a limestone ground carry the shell, the sea owns everything live (due, learning, focus, the caret), the sun owns the one primary action and the moment a stone is set, and each of the eight subject groups owns one full-strength stone colour. The signature object is the canvas pavement on Today: a mortar field of square stones laid along a wavy work front, black and white where words are set, wet sea blue where they are settling, sun yellow where they are due, and bare grains that already trace the wave still to be laid.

Portuguese is the material and is set poster-size, tight and condensed, against small, plain English UI. Browsing screens stay calm and quick; the wow is spent on Today, flashcards and practice, where motion keeps identity: a graded card shrinks into a stone and flies into the round's socket strip, a finished round bursts tesserae, a correct choice pops and a wrong one shakes. The night theme darkens the ground, but the pavement keeps its stones so the mosaic reads as one object in both themes.

The world refuses the study-app default of white cards, a streak flame and a purple accent.

**Key Characteristics:**
- Basalt shell, limestone ground, square tesserae as the only ornament motif.
- Sea for live state, sun for the single primary action and celebration, eight group stones at full strength.
- Bricolage Grotesque variable, condensed by the `wdth` axis for Portuguese, normal width for UI.
- Flat tonal layering; shadow only on lifted objects (the flashcard, the search palette, hovered tiles).
- Motion that carries identity: cards become stones, stones fall into sockets.

## Colors

A near-neutral stone palette (basalt, limestone, warm greys) with two owned signals, sea and sun, and eight full-strength subject stones.

### Primary
- **Copacabana Sea** (`sea`): owns live state. Due counts in the greeting, the due panel's field, links, the focus ring, the input caret, field focus border, the "Good" grade. In dark theme it lifts to Sea Bright.
- **Sea Bright** (`sea-bright`): the wet stone of a word still settling in the pavement, and the dark-theme sea.

### Secondary
- **Ipanema Sun** (`sun`): the one primary action per screen (Start / Review), selection highlight, the rail's due count, the active tab dot, the speaking state, the combo badge, the current socket, and due stones in the mosaic.
- **Deep Sun** (`sun-deep`): hover of the sun button and the "Hard" grade.

### Tertiary (subject stones)
One full-strength stone per subject group, used wherever that group appears (tiles, subject card top bar, flashcard front, flying stone), each paired with its own ink:
- **Rose Granite** (`stone-rose-granite`), People, white ink.
- **Palm** (`stone-palm`), Home, white ink.
- **Ochre** (`stone-ochre`), Food and Drink, ink #121212.
- **Slate Blue** (`stone-slate-blue`), Around Town, white ink.
- **Sea** (`stone-sea`), The World Around You, white ink.
- **Basalt** (`stone-basalt`), Time, white ink.
- **Terracotta** (`stone-terracotta`), Describing Things, white ink.
- **Earth** (`stone-earth`), Grammar in Context, white ink.

### Neutral
- **Limestone Ground** (`ground`, same value as `limestone`): page background; the flashcard's turned-over side.
- **Raised Limestone** (`raised`): panels, buttons, fields, choices, grade buttons.
- **Sunken Sand** (`sunken`): empty sockets, segmented track, chips, empty states, ghost hover, unlit meter stones.
- **Joint Line** (`line`) and **Mortar Rule** (`rule`): borders and row dividers respectively.
- **Ink** (`ink`), **Muted** (`muted`), **Faint** (`faint`): text, secondary text, placeholders.
- **Basalt** (`basalt`), **Basalt Raised** (`basalt-2`), **Basalt Joint** (`basalt-line`): the rail, mobile header, tab bar, pavement field; rail hover; rail search border.
- **On Basalt** / **On Basalt Muted**: text on the rail and pavement field.
- **Positive / Negative** (with `-soft` fills): correct and wrong choices, chips, Again/Easy grades only.

Dark theme (`.dark`) remaps neutrals to ground #0d0d0c, raised #181816, sunken #1f1f1c, line #2c2c28, ink #f3f3f0, and sea to #3fb3dd; sun and the subject stones do not change.

### Named Rules
**The Two Signals Rule.** Sea means "live now" and sun means "do this / it is set". Never swap them, and never use either as decoration.
**The One Sun Rule.** One sun-filled button per screen; it is the action the screen exists for.
**The Group Owns Its Stone Rule.** A group's stone is used at full strength with its paired ink, never tinted down to a pastel, and never reused for a different group.

## Typography

**Display Font:** Bricolage Grotesque Variable (with ui-sans-serif, system-ui), self-hosted with the width axis.
**Body Font:** the same family at normal width.

**Character:** One grotesque in two voices. Portuguese is condensed (`wdth` 78 to 84), heavy and tightly tracked so a single word fills a card; English UI is small, plain and normal width.

### Hierarchy
- **Display** (800, clamp(44px, 6.4vw, 92px), 0.9, wdth 78): the Portuguese greeting on Today and subject names; text-wrap balanced.
- **Headline** (700, 44px, 0.95, wdth 84): page titles in Portuguese (Estudar, Praticar).
- **Portuguese term** (700, -0.035em, wdth 84, size set by context): every Portuguese word or phrase that is the object of study: list rows, verb of the day, flashcard faces, the wordmark.
- **Title** (700, 20px, -0.015em): section headings in English.
- **Body** (400, 16px, 1.5): running text; subheads capped near 68ch.
- **Label** (600 to 650, 14px): buttons, rail items, links, table text.
- **Caption** (650, 12px, tabular): chips, counts, table heads, legend.

The token ramp is 12 / 14 / 16 / 20 / 28 / 44 / clamp(44, 6.4vw, 92).

### Named Rules
**The Material Rule.** Portuguese is the product's material: whenever a Portuguese word is the subject, set it with the condensed heavy term style, larger than the English around it.
**The Rank Rule.** Rank comes from weight, width and reversal (basalt or sea field), drawn from the token ramp; numbers that count anything are tabular.

## Layout

Desktop (1024px and up) is a two-column grid: a sticky 248px basalt rail (wordmark, search with ⌘K, five nav items, theme toggle at the foot) and a main column padded 48px, with content capped at 1180px (760 to 860px for reading and study screens). Below 1024px the rail becomes a 56px sticky basalt header (wordmark, search, theme) and a fixed five-item basalt tab bar with blur, respecting the safe-area inset; main padding is 16px (24px from 640px) with 128px bottom room for the tab bar.

Today: display greeting, then the pavement field beside a 320px sea due panel (the panel moves above the pavement on phones), then eight group tiles in a 2 / 4 / 8 column grid, then a 5/7 split of panels. Gutters are 10 to 16px; panels pad 22px, cards 18px. Rows inside panels are separated by single mortar rules, not boxes.

## Elevation & Depth

Flat by default, layered by tone: ground, raised, sunken, and the basalt reversal provide all structure. Shadows are soft, long and downward, and only appear on objects that are physically lifted off the pavement.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 30px 60px -30px rgb(0 0 0 / 0.45)`; 0.3 on the limestone back): the flashcard in play.
- **Palette float** (`box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.5)`): the search palette over a 55% basalt, 3px-blur backdrop.
- **Stone glow** (`box-shadow: 0 18px 36px -22px var(--tile)`): hovered subject tile, tinted by its own stone.
- **Socket recess** (`box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.12)`): an empty socket waiting for a stone.
- **Focus halo** (`box-shadow: 0 0 0 3px` sea at 22%): focused field.

### Named Rules
**The Lifted Objects Rule.** Only things that move over the pavement (a card, the palette, a hovered tile) cast shadow. Panels, buttons and fields stay flat.

## Shapes

Two families of corner. Containers are softly rounded slabs: 18px for panels, tiles and the pavement field, 26px for flashcards, 20px for the palette, 16px choices, 14px grade buttons, 12px tokens, 10px fields and rail items. Actions are full pills (buttons, segmented control, combo badge, speak button). The ornament motif is the near-square tessera: 2 to 3px radius stones in the pavement, the meter, the sockets, the legend swatches, the grade swatches, the tab dot and the flying shard. Borders are 1px joints (1.5px on choices and tokens).

### Named Rules
**The Tessera Rule.** Any marker, meter segment or status swatch is a small square stone (radius 1 to 3px), never a circle or a bar with rounded ends.

## Components

### Buttons
Pressed like stones: everything pressable scales to 0.97 on press (180ms ease-out).
- **Shape:** full pill (999px), 46px tall; large 58px.
- **Default:** raised limestone with a joint border; hover darkens the border to ink.
- **Sun:** the single primary action; hover to Deep Sun.
- **Ink:** reversed secondary action; hover mixes 15% ground in.
- **Ghost:** transparent, hover to sunken. Icon buttons are 42px square pills.
- **Disabled:** 45% opacity.

### Chips
- **Style:** 24px, 6px radius, 12px tabular label on sunken with muted text.
- **Variants:** sun (count of due), positive, negative.

### Cards / Containers
- **Panel:** raised, 1px joint, 18px radius, 22px padding, flat.
- **Basalt field:** reversed basalt slab, 18px radius; holds the pavement.
- **Stone tile:** a subject group tile filled with its stone and paired ink, 12-stone meter at the foot, arrow nudges 4px on hover, stone glow shadow.
- **Subject card:** raised panel whose 5px top bar in the group stone grows from 14% to full width on hover.

### Inputs / Fields
- **Style:** 46px, raised, 1px joint, 10px radius, 16px text; selects carry a faint chevron.
- **Focus:** border to sea with a 3px sea halo at 22%; global focus-visible is a 2px sea outline, 3px offset.
- **Segmented control:** sunken pill track, 38px pill segments; pressed segment reverses to ink.

### Navigation
- **Rail:** basalt, 40px items with 18px lucide icons at 1.7 stroke; muted on-basalt text, hover to basalt-2; active item reverses to limestone with basalt text at 650 weight. Study shows its due count in sun.
- **Tab bar:** basalt at 94% with 14px blur, 11px labels, a 4px square sun dot under the active tab.
- **Search palette:** opens on ⌘K or `/`, 640px max, 12vh from top, selected row on sunken.

### Flashcard
A 26px slab in its subject's stone with the Portuguese word set huge; it turns over in 620ms on the Y axis to its limestone side. Swiping shows tilted stamps; grading sends the card, shrinking into a 3px stone, along an arc into the next socket of the round strip (640ms), where it lands with a spring. Grade buttons carry a 10px square swatch in their grade colour and tint 10% toward it on hover.

### Practice choices and tokens
62px-tall raised choices with 20px text; correct turns positive and pops (scale 1.025), wrong turns negative and shakes. Word-order tokens spring in and reverse to ink when placed. A sun combo pill pops on streaks within a session.

### Pavement (signature)
A runtime canvas: one stone per study card on a mortar field, laid along a sine-leaning work front in two or three swells. States: set (black or white by wave band, black stones with a lighter top edge), learning (sea bright), due (sun), bare (small grains tracing the wave). Stones grow in on load with a slight overshoot, lift under the pointer, ripple outward on click, fall in from above when freshly laid after a round, and a slow diagonal glint passes across. Hovering a stone shows its word on a limestone tooltip. All of it is static under reduced motion.

## Do's and Don'ts

### Do:
- **Do** take every colour from the CSS custom properties in `src/index.css` and every group colour from `GROUP_STONE`.
- **Do** set Portuguese in the condensed heavy term style and English UI at 14 to 16px.
- **Do** keep sea for live state and sun for the one primary action and the moment a stone is set.
- **Do** draw meters, markers and progress as rows of small square stones (2px gap, 1.5 to 3px radius).
- **Do** use `--ease-out` cubic-bezier(0.16, 1, 0.3, 1) for state transitions and `--ease-spring` for things landing; stagger reveals by 45ms.
- **Do** turn off every animation and transition under prefers-reduced-motion, as the existing helpers do.

### Don't:
- **Don't** use white cards, a streak flame or a purple accent.
- **Don't** put more than one sun button on a screen, or use sun or sea as decoration.
- **Don't** tint a group stone to a pastel or assign it to anything but its group.
- **Don't** add shadows to panels, buttons or fields; shadow belongs to lifted objects.
- **Don't** add uppercase tracked labels above headings; section headings are 20px sentence-case titles.
