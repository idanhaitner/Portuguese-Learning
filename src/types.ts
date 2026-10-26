export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "pronoun"
  | "expression"
  | "interjection"
  | "numeral"
  | "conjunction"
  | "other";

export interface Example {
  portuguese: string;
  english: string;
  note?: string;
}

export interface SubjectGroup {
  id: string;
  name: string;
  blurb: string;
}

export interface Subject {
  id: string;
  name: string;
  namePt: string;
  groupId: string;
  summary: string;
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  sourceFile: string;
  summary: string;
  subjectId: string;
}

export interface VocabularyItem {
  id: string;
  lemma: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  gender?: "m" | "f" | "both" | "invariable";
  plural?: string;
  feminine?: string;
  category: string;
  subjectId: string;
  examples: Example[];
  pronunciationHint?: string;
  notes?: string;
  usageNote?: string;
}

export interface Phrase {
  id: string;
  portuguese: string;
  english: string;
  subjectId: string;
  category: string;
  kind: "example" | "expression" | "dialogue" | "contrast";
  incorrectForm?: string;
  notes?: string;
}

export interface GrammarException {
  wrong: string;
  right: string;
  note?: string;
}

export interface GrammarRule {
  id: string;
  subjectId: string;
  title: string;
  explanation: string;
  patterns: string[];
  examples: Example[];
  exceptions?: GrammarException[];
  relatedRuleIds?: string[];
  usageNote?: string;
}

export interface Conjugation {
  tense: "present" | "present-continuous" | "preterite" | "imperfect" | "participle";
  forms: { person: string; form: string }[];
}

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  ending: "ar" | "er" | "ir" | "irregular";
  subjectIds: string[];
  preposition?: string;
  participle?: string;
  conjugations: Conjugation[];
  examples: Example[];
  notes?: string;
}

export type QuizType = "multiple-choice" | "fill-blank" | "sentence-builder" | "translation";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  prompt: string;
  promptLang: "en" | "pt";
  answer: string;
  acceptableAnswers?: string[];
  options?: string[];
  tokens?: string[];
  blankSentence?: string;
  subjectId: string;
  tags: string[];
  source: "exercise" | "generated";
  focus: "vocabulary" | "conjugation" | "preposition" | "grammar" | "phrase";
}

export interface LearningData {
  meta: {
    locale: "pt-BR";
    language: string;
    extractedFrom: string;
    notes: string;
  };
  groups: SubjectGroup[];
  subjects: Subject[];
  lessons: Lesson[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  grammar: GrammarRule[];
  verbs: Verb[];
  quizzes: QuizQuestion[];
}
