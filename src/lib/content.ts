import raw from "../data/learning-data.json";
import type { Example, LearningData, QuizQuestion, Subject, Verb } from "../types";

export const data = raw as LearningData;

export const subjectById = Object.fromEntries(data.subjects.map((subject) => [subject.id, subject]));

const LEGACY_SUBJECT_IDS: Record<string, string> = {
  "aula-12": "this-and-that",
  "aula-12-1": "contractions-with-de",
  "aula-13": "adjectives",
  "aula-13-2": "comparatives",
  "aula-13-3": "colors",
  "aula-13-4": "then-so-and-so-much",
  "aula-14": "ways-to-say-time",
  "aula-14-past": "simple-past",
  "aula-14-1": "was-and-were",
  "aula-14-2": "past-habits",
  "aula-14-3": "past-participles",
  "aula-15-1": "because-of-this",
  "aula-16-1": "ordinal-numbers",
  "aula-17": "para-and-por",
  "aula-17-2": "times-of-day",
};

export function resolveSubjectId(id: string) {
  if (id === "all" || subjectById[id]) return id;
  return LEGACY_SUBJECT_IDS[id] ?? id;
}

export function subjectName(id: string) {
  return subjectById[id]?.name ?? "Topic";
}

export const CATEGORY_LABELS: Record<string, string> = {
  adjectives: "Adjectives",
  animals: "Animals",
  bathroom: "Bathroom",
  bedroom: "Bedroom",
  body: "Body",
  clothes: "Clothes",
  colors: "Colors",
  connectors: "Connectors",
  contractions: "Contractions",
  days: "Days",
  demonstratives: "Demonstratives",
  directions: "Directions",
  drinks: "Drinks",
  expressions: "Expressions",
  family: "Family",
  feelings: "Feelings",
  flavors: "Flavors",
  food: "Food",
  fruit: "Fruit",
  grammar: "Grammar",
  greetings: "Greetings",
  home: "Home",
  kitchen: "Kitchen",
  materials: "Materials",
  miscellaneous: "Miscellaneous",
  months: "Months",
  nature: "Nature",
  "nouns-ao": "Nouns in -ão",
  ordinals: "Ordinals",
  places: "Places",
  prepositions: "Prepositions",
  professions: "Professions",
  restaurant: "Restaurant",
  rooms: "Rooms",
  school: "School",
  sports: "Sports",
  technology: "Technology",
  time: "Time",
  transport: "Transport",
  vegetables: "Vegetables",
  verbs: "Verbs",
  weather: "Weather",
};

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category.replace(/-/g, " ");
}

export function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export interface StudyCard {
  id: string;
  subjectId: string;
  category: string;
  kind: "word" | "sentence" | "verb";
  front: string;
  back: string;
  hint?: string;
  examplePt?: string;
  exampleEn?: string;
  note?: string;
  feminine?: string;
  usageNote?: string;
}

export function studyCards(): StudyCard[] {
  const words: StudyCard[] = data.vocabulary.map((item) => ({
    id: `vocab:${item.id}`,
    subjectId: item.subjectId,
    category: item.category,
    kind: "word",
    front: item.lemma,
    back: item.translation,
    hint: item.pronunciationHint,
    examplePt: item.examples[0]?.portuguese,
    exampleEn: item.examples[0]?.english,
    note: item.notes,
    feminine: item.feminine,
    usageNote: item.usageNote,
  }));

  const sentences: StudyCard[] = data.phrases.map((item) => ({
    id: `phrase:${item.id}`,
    subjectId: item.subjectId,
    category: item.category,
    kind: "sentence",
    front: item.portuguese,
    back: item.english,
    note: item.incorrectForm ? `Avoid: ${item.incorrectForm}` : item.notes,
  }));

  const verbs: StudyCard[] = data.verbs.map((verb) => {
    const past = verb.conjugations.find((row) => row.tense === "preterite");
    const eu = past?.forms.find((form) => form.person === "eu")?.form;
    return {
      id: `verb:${verb.id}`,
      subjectId: verb.subjectIds[0] ?? "simple-past",
      category: "verbs",
      kind: "verb" as const,
      front: verb.infinitive,
      back: verb.translation,
      hint: eu ? `Eu ${eu}` : undefined,
      note: [verb.preposition ? `Takes ${verb.preposition}` : "", verb.participle ? `Participle: ${verb.participle}` : "", verb.notes ?? ""]
        .filter(Boolean)
        .join(" · "),
    };
  });

  return [...words, ...sentences, ...verbs];
}

export function subjectsInGroup(groupId: string): Subject[] {
  return data.subjects.filter((subject) => subject.groupId === groupId);
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

export function questionsForMode(mode: "multiple-choice" | "fill-blank" | "sentence-builder" | "mixed" | "targeted", subjectId: string, missedIds: string[]) {
  let pool: QuizQuestion[] = data.quizzes;
  if (mode === "multiple-choice") pool = pool.filter((item) => item.type === "multiple-choice");
  if (mode === "fill-blank") pool = pool.filter((item) => item.type === "fill-blank");
  if (mode === "sentence-builder") pool = pool.filter((item) => item.type === "sentence-builder");
  if (mode === "targeted") {
    const missed = new Set(missedIds);
    const targeted = pool.filter((item) => missed.has(item.id));
    pool = targeted.length > 0 ? targeted : pool.filter((item) => item.focus === "conjugation" || item.focus === "grammar");
  }
  if (subjectId !== "all") pool = pool.filter((item) => item.subjectId === subjectId);
  return shuffle(pool).slice(0, 10);
}

export function searchContent(query: string) {
  const needle = fold(query.trim());
  if (!needle) {
    return {
      vocabulary: data.vocabulary.slice(0, 24),
      phrases: data.phrases.slice(0, 12),
      grammar: data.grammar,
      verbs: data.verbs.slice(0, 12),
    };
  }
  const hit = (value: string) => fold(value).includes(needle);
  return {
    vocabulary: data.vocabulary.filter((item) => hit(item.lemma) || hit(item.translation) || hit(item.category) || hit(subjectName(item.subjectId))).slice(0, 40),
    phrases: data.phrases.filter((item) => hit(item.portuguese) || hit(item.english)).slice(0, 24),
    grammar: data.grammar.filter((item) => hit(item.title) || hit(item.explanation) || item.patterns.some(hit)),
    verbs: data.verbs.filter((item) => hit(item.infinitive) || hit(item.translation) || hit(item.participle ?? "")).slice(0, 24),
  };
}

export const verbById = Object.fromEntries(data.verbs.map((verb) => [verb.id, verb]));

/** The teacher's own summary for a subject, when one of the lesson files covers it. */
export function teacherNotesFor(subjectId: string): string | undefined {
  return data.lessons.find((lesson) => lesson.subjectId === subjectId)?.summary;
}

export function verbForCard(cardId: string) {
  return cardId.startsWith("verb:") ? verbById[cardId.slice(5)] : undefined;
}

/** Sentences from the notes that use any form the lessons give for this verb, matched as whole words. */
export function sentencesWithVerb(verb: Verb, limit = 6): Example[] {
  if (verb.examples.length) return verb.examples.slice(0, limit);
  const forms = new Set(
    [verb.infinitive, verb.participle, ...verb.conjugations.flatMap((row) => row.forms.map((form) => form.form))]
      .filter((form): form is string => Boolean(form))
      .map((form) => form.toLowerCase()),
  );
  return data.phrases
    .filter((phrase) => phrase.portuguese.toLowerCase().split(/[^\p{L}-]+/u).some((word) => forms.has(word)))
    .slice(0, limit)
    .map((phrase) => ({ portuguese: phrase.portuguese, english: phrase.english }));
}
