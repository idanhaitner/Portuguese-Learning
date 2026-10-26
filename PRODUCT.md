# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One learner: the owner of this project, studying Brazilian Portuguese with a private teacher. There are no other users, accounts or roles. The app is used on a laptop and on a phone.

## Product Purpose

A personal study app built from the teacher's own lesson documents (the "Aula" `.docx` files). It turns each lesson into material the learner can review, drill and look up, so what was taught in class sticks.

Success means two habits hold: a short daily review (often on the phone), and working through each new Aula soon after it arrives.

## Positioning

The course is this teacher's course, not a generic curriculum. Words, rules, verbs and quizzes come from the Aula files, in Brazilian usage (você, a gente, spoken pra/pro). A general-purpose language app cannot follow this syllabus. The Aula numbers are arbitrary: the app is organised by subject only and never shows lesson numbers.

## Operating Context

- New lessons arrive from the teacher as `.docx` files in `materials/` (currently Aula 12 to 17.2, plus a VOCABULÁRIO file).
- `scripts/extract_learning_data.py` regenerates `src/data/learning-data.json`; it calls `scripts/to_subjects.py` itself. New Aula files are added to `LESSONS` in the extract script and to `LESSON_TO_SUBJECT` in `to_subjects.py`.
- Two study moments: a few minutes of daily review (flashcards, practice), and a longer pass through a new lesson right after class.

## Capabilities and Constraints

- Sections: Today, Subjects (46 subjects in 8 groups), Study (flashcards), Practice (quizzes), Progress, plus verb pages with conjugation tables, and search (⌘K or `/`). There is no Lessons section; old lesson links redirect to their subject.
- Spaced repetition: a lightweight SM-2 with Again, Hard, Good and Easy grades.
- Pronunciation uses the browser's speech synthesis with a pt-BR voice when one is installed.
- Light and dark theme.
- No backend and no account. Progress and settings live in the browser's localStorage (`pt-study-progress-v1`, `pt-study-settings-v1`), so they do not sync between the laptop and the phone.
- Stack in place: React 19, Vite, Tailwind v4, react-router, lucide-react.
- Interface language is English; the study content is Brazilian Portuguese with English glosses.

## Evidence on Hand

- Source material: the Aula `.docx` files and VOCABULÁRIO in `materials/`.
- Extracted content in `src/data/learning-data.json`: 15 lessons, 46 subjects in 8 groups, 822 vocabulary items, 753 phrases, 17 grammar notes, 120 verbs, 513 quizzes.
- Some English glosses were added where the teacher's word lists had none.

## Product Principles

1. **The teacher's lessons are the spine.** Extras such as added examples, audio or generated exercises are welcome, but they build on the Aula material and must never replace or contradict it.
2. **Make the daily review quick.** Opening the app on a phone and finishing a review should take a few minutes and almost no navigation.
3. **Subject first.** Material is found and studied by subject, never by Aula number. After class, new material should be easy to reach through its subject.
4. **Brazilian usage, stated plainly.** Content follows how Portuguese is spoken in Brazil and keeps the teacher's terms.
5. **One person, no ceremony.** It serves one person, so there are no accounts, sign-up or social features.
