# Português

A personal Brazilian Portuguese study app built from my teacher's lesson documents (the *Aula* `.docx` files). Each lesson becomes material I can read, drill with flashcards, quiz myself on and look up, so what was taught in class sticks.

**Live site:** https://idanhaitner.github.io/Portuguese-Learning/

The app is organised by **subject**, not by lesson number. Words, rules, verbs and quizzes come straight from the Aula files, in Brazilian usage (você, a gente, pra/pro).

---

## Contents

- [Features](#features)
- [What's inside the data](#whats-inside-the-data)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Adding a new lesson](#adding-a-new-lesson)
- [How studying works](#how-studying-works)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Where progress is stored](#where-progress-is-stored)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Design](#design)

---

## Features

| Section | What it does |
| --- | --- |
| **Today** | The home screen. Shows what's due, your streak and a one-tap start for the daily review. |
| **Subjects** | 46 subjects in 8 groups (People, Home, Food and Drink, Around Town, The World Around You, Time, Describing Things, Grammar in Context). Each subject page has its vocabulary, phrases, grammar notes and verbs. |
| **Study** | Spaced-repetition flashcards for words, sentences and verbs. Filter by subject and card type; choose *Due and new*, *New only* or *Hard*. Cards are **shuffled every round**. |
| **Practice** | Quizzes generated from the lessons: multiple choice, fill in the blank, sentence builder, a mixed set, and a *targeted* set built from the questions you missed. |
| **Progress** | Streak, cards reviewed, quiz answers, accuracy, reviews per day and cards by stage. |
| **Verb pages** | Full conjugation tables for 120 verbs. |
| **Search** | Search across everything with <kbd>⌘K</kbd> or <kbd>/</kbd>. |
| **Pronunciation** | Tap to hear any word or sentence through the browser's speech synthesis, using a pt‑BR voice when one is installed. |
| **Themes** | Light and dark. |

There is no backend, no account and no sign‑up: it's built for one learner.

## What's inside the data

All study content lives in [`src/data/learning-data.json`](src/data/learning-data.json), generated from the `.docx` files in [`materials/`](materials/):

| Kind | Count |
| --- | --- |
| Lessons (Aulas) | 15 |
| Subjects / groups | 46 / 8 |
| Vocabulary items | 822 |
| Phrases | 753 |
| Grammar notes | 17 |
| Verbs | 120 |
| Quiz questions | 513 |

Some English glosses were added where the teacher's word lists had none.

## Tech stack

- [React 19](https://react.dev/) + TypeScript
- [Vite 7](https://vite.dev/) for dev server and build
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [React Router 7](https://reactrouter.com/)
- [lucide-react](https://lucide.dev/) icons, Bricolage Grotesque variable font
- Python 3 (standard library only) for the lesson extraction scripts

## Getting started

**Requirements:** Node.js 20+ and npm. Python 3.9+ only if you regenerate the lesson data.

```bash
git clone git@github.com:idanhaitner/Portuguese-Learning.git
cd Portuguese-Learning
npm install
npm run dev
```

Then open http://localhost:5173.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload (served at `/`). |
| `npm run build` | Type-check with `tsc`, then build to `dist/` with the GitHub Pages base path. |
| `npm run preview` | Serve the production build locally at http://localhost:4173/Portuguese-Learning/. |

## Project structure

```
.
├── materials/                  # Teacher's Aula .docx files + VOCABULÁRIO.docx (source of truth)
├── scripts/
│   ├── extract_learning_data.py  # Parses the .docx files → src/data/learning-data.json
│   └── to_subjects.py            # Regroups lesson content into subjects (called by the extractor)
├── src/
│   ├── App.tsx                 # Routes (and redirects for old lesson/material links)
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind + design tokens
│   ├── components/             # Layout, Flashcard, Pavement, PracticeSession, SearchPalette, ...
│   ├── context/AppState.tsx    # Progress + settings state, persisted to localStorage
│   ├── data/learning-data.json # Generated study content
│   ├── hooks/                  # Small React hooks
│   ├── lib/
│   │   ├── content.ts          # Data access: subjects, study cards, quiz pools, shuffle
│   │   ├── srs.ts              # Spaced repetition (SM-2 variant)
│   │   ├── stats.ts            # Streaks and progress stats
│   │   ├── speech.ts           # Text-to-speech
│   │   └── fx.ts               # Small animations and haptics
│   └── pages/                  # Dashboard, Materials, Subject, Verb, Flashcards, Practice, Progress
├── .github/workflows/deploy.yml  # Build + deploy to GitHub Pages
├── DESIGN.md                   # Design system (colours, type, components)
├── PRODUCT.md                  # Product brief and principles
└── vite.config.ts              # Base path + 404.html fallback for GitHub Pages
```

### Routes

| Path | Page |
| --- | --- |
| `/` | Today |
| `/subjects` | All subjects |
| `/subjects/:subjectId` | One subject |
| `/verbs/:verbId` | Verb conjugation |
| `/study` | Flashcards (`?subject=…&mode=due\|new\|hard`) |
| `/practice` | Quizzes |
| `/progress` | Progress |

Older `/lessons/*`, `/materials/*` and `/cards` links redirect to the subject-first routes.

## Adding a new lesson

1. Drop the new Aula `.docx` into `materials/`.
2. Add an entry to `LESSONS` in [`scripts/extract_learning_data.py`](scripts/extract_learning_data.py) (id, number, title, English title, `sourceFile`, categories, summary).
3. Map the lesson to a subject in `LESSON_TO_SUBJECT` in [`scripts/to_subjects.py`](scripts/to_subjects.py).
4. Regenerate the data:

   ```bash
   python3 scripts/extract_learning_data.py
   ```

5. Run `npm run dev` to check the new material, then commit and push. The site redeploys automatically.

> Close Word before running the script; Word leaves `~$…docx` lock files in `materials/` while a document is open.

## How studying works

### Flashcards

- A round has up to **20 cards**.
- **Due and new:** reviews that are due come first (the most overdue get picked first), then the remaining places are filled with a random selection of new cards.
- **New only:** a random selection of cards you've never seen.
- **Hard:** cards whose last grade was Again or Hard (a later Good or Easy takes them off the list), shuffled.
- The chosen cards are then **shuffled**, so words never appear in the order of the teacher's notes. *Start another round* reshuffles.
- Flip the card, then grade it: **Again**, **Hard**, **Good** or **Easy**.

### Spaced repetition

[`src/lib/srs.ts`](src/lib/srs.ts) implements a lightweight SM-2:

- **Again** resets the card (interval back to 1 day) and counts a lapse.
- **Hard / Good / Easy** grow the interval: 1 day → 6 days → previous interval × ease. The ease factor goes up or down with the grade.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| <kbd>⌘K</kbd> or <kbd>/</kbd> | Open search |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Flip the flashcard |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> | Grade Again / Hard / Good / Easy (after flipping) |

## Where progress is stored

Everything stays in your browser's `localStorage`:

- `pt-study-progress-v1`: card schedules, hard cards, quiz history and streak
- `pt-study-settings-v1`: theme (light or dark)

It does **not** sync between devices, so your laptop and phone keep separate progress. Clearing site data resets it. *Progress → Reset progress* clears it on purpose.

## Deployment (GitHub Pages)

The site is a project page served from `https://idanhaitner.github.io/Portuguese-Learning/`. Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs `npm ci && npm run build` and publishes `dist/` with `actions/deploy-pages`. You can also run it manually from the **Actions** tab.

How the app is set up for Pages:

- **Base path:** [`vite.config.ts`](vite.config.ts) builds with `base: "/Portuguese-Learning/"` (dev still uses `/`).
- **Router:** `BrowserRouter` uses `basename={import.meta.env.BASE_URL}` so routes resolve under the repo path.
- **Deep links:** GitHub Pages has no SPA fallback, so the build copies `index.html` to `404.html`. Opening `/Portuguese-Learning/progress` directly still loads the app.
- **Repo settings:** *Settings → Pages → Source* must be **GitHub Actions**.

If the repository is renamed, update `base` in `vite.config.ts` to the new name.

## Design

The visual language follows Burle Marx's Copacabana pavement: every study card is one stone, and each round lays a strip of pavement. Colours, type and components are documented in [`DESIGN.md`](DESIGN.md); product goals and principles are in [`PRODUCT.md`](PRODUCT.md).
