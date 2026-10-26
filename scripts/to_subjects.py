#!/usr/bin/env python3
"""Regroup extracted lesson JSON into subject topics for Brazilian Portuguese."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data" / "learning-data.json"

GROUPS = [
    {
        "id": "people",
        "name": "People",
        "blurb": "Greetings, family, the body, clothes, feelings, and work.",
    },
    {
        "id": "home",
        "name": "Home",
        "blurb": "Rooms and the things you use around the house.",
    },
    {
        "id": "food",
        "name": "Food and Drink",
        "blurb": "Meals, flavors, and ordering at a cafe.",
    },
    {
        "id": "around",
        "name": "Around Town",
        "blurb": "Places, directions, and getting from one to the other.",
    },
    {
        "id": "world",
        "name": "The World Around You",
        "blurb": "Animals, weather, school, sports, and everyday objects.",
    },
    {
        "id": "time",
        "name": "Time",
        "blurb": "Days, months, schedules, and parts of the day.",
    },
    {
        "id": "description",
        "name": "Describing Things",
        "blurb": "Adjectives, colors, comparisons, and how much.",
    },
    {
        "id": "grammar",
        "name": "Grammar in Context",
        "blurb": "Demonstratives, the past, prepositions, and useful patterns.",
    },
]

# id, name, namePt, groupId, summary
SUBJECTS = {
    "greetings": ("Greetings", "Cumprimentos", "people", "Hello, goodbye, please, and the phrases you use when you meet someone."),
    "family": ("Family", "Família", "people", "Relatives and the words for the people closest to you."),
    "the-body": ("The Body", "O corpo", "people", "Parts of the body, from head to toe."),
    "clothes": ("Clothes", "Roupas", "people", "What people wear, and words for getting dressed."),
    "feelings": ("Feelings", "Sentimentos", "people", "How someone feels, from happy and tired to worried."),
    "professions": ("Professions", "Profissões", "people", "Jobs and the people who do them."),
    "at-home": ("At Home", "Em casa", "home", "The house itself and everyday things you find there."),
    "rooms": ("Rooms of the House", "Cômodos", "home", "Names for the rooms you move through at home."),
    "the-kitchen": ("In the Kitchen", "Na cozinha", "home", "Utensils, appliances, and kitchen vocabulary."),
    "the-bedroom": ("The Bedroom", "O quarto", "home", "Furniture and objects in the bedroom."),
    "the-bathroom": ("The Bathroom", "O banheiro", "home", "Bathroom objects and the words you need there."),
    "food": ("Food", "Comida", "food", "Meals and common foods."),
    "fruit": ("Fruit", "Frutas", "food", "Fruit names you can use at the market or the table."),
    "vegetables": ("Vegetables", "Legumes", "food", "Vegetables and produce."),
    "drinks": ("Drinks", "Bebidas", "food", "Coffee, water, juice, and what to ask for."),
    "flavors": ("Flavors", "Sabores", "food", "Sweet, salty, spicy, and the rest of how food tastes."),
    "ordering-at-a-cafe": ("Ordering at a Cafe", "No café", "food", "Restaurant and cafe words for reading a menu and placing an order."),
    "places": ("Places in Town", "Lugares", "around", "Shops, streets, and the places you go during the day."),
    "directions": ("Directions", "Direções", "around", "Left, right, near, far, and how to point someone the right way."),
    "getting-around": ("Getting Around", "Transporte", "around", "Buses, cars, and other ways of moving through the city."),
    "animals": ("Animals", "Animais", "world", "Animals you might see, name, or talk about."),
    "nature": ("Nature", "Natureza", "world", "Landscape, plants, and the outdoors."),
    "weather": ("Weather", "O clima", "world", "Sun, rain, heat, and talking about the day outside."),
    "sports": ("Sports", "Esportes", "world", "Games, exercise, and weekend activities."),
    "school": ("School", "A escola", "world", "Classroom words and school life."),
    "technology": ("Technology", "Tecnologia", "world", "Phones, computers, and digital everyday words."),
    "materials-and-objects": ("Materials", "Materiais", "world", "Wood, glass, metal, and what things are made of."),
    "everyday-words": ("Everyday Words", "Palavras do dia", "world", "Useful nouns that do not sit neatly in one scene."),
    "days-of-the-week": ("Days of the Week", "Dias da semana", "time", "Monday through Sunday, and how to talk about the week."),
    "months": ("Months of the Year", "Meses", "time", "The twelve months and how to name them."),
    "ways-to-say-time": (
        "Ways to Say Time",
        "Tempo, vez, hora",
        "time",
        "Tempo for weather and duration, vez for occasions and turns, época for a period, hora for clock time, horário for a schedule, and clima for weather or atmosphere.",
    ),
    "times-of-day": (
        "Times of Day",
        "Manhã, tarde e noite",
        "time",
        "Parts of the day, yesterday, today, and tomorrow, and the difference between está tarde and estou atrasado.",
    ),
    "adjectives": (
        "Adjectives",
        "Adjetivos",
        "description",
        "Core adjectives, gender agreement, and emphasis with muito and um pouco.",
    ),
    "colors": (
        "Colors",
        "Cores",
        "description",
        "Color vocabulary and gender agreement for colors that change form.",
    ),
    "comparatives": (
        "Comparatives",
        "Comparativos",
        "description",
        "Mais and menos with an adjective, irregular maior, menor, melhor, and pior, and the superlative o mais or a mais.",
    ),
    "then-so-and-so-much": (
        "Then, So, and So Much",
        "Então, tão e tanto",
        "description",
        "Então for then or so, tão, tanto and its forms, tanto faz, and tanto quanto.",
    ),
    "this-and-that": (
        "This and That",
        "Isso, esse e aquilo",
        "grammar",
        "Esse, essa, and isso for this. Aquele, aquela, and aquilo for that, plus the plurals. Isso and aquilo refer to unknown things or things that are not physical.",
    ),
    "contractions-with-de": (
        "Contractions with De",
        "Disso, desse, daquilo",
        "grammar",
        "De contracts with demonstratives: disso, desse, dessa, daquilo, daquele, daquela. Required after verbs and expressions that take de, such as gostar de, precisar de, and medo de.",
    ),
    "simple-past": (
        "Simple Past",
        "Pretérito perfeito",
        "grammar",
        "Regular past endings for -ar, -er, and -ir verbs, plus irregular preterite forms of ir, trazer, ver, fazer, ter, dizer, and pedir.",
    ),
    "was-and-were": (
        "Was and Were",
        "Foi, era e estava",
        "grammar",
        "Estava for past location, feelings, and ongoing actions. Era for lasting past states. Foi for a single completed situation.",
    ),
    "past-habits": (
        "Past Habits",
        "Pretérito imperfeito",
        "grammar",
        "Perfeito for one completed action. Imperfeito, or costumar, for habits and repeated past actions.",
    ),
    "past-participles": (
        "Past Participles",
        "Particípio",
        "grammar",
        "Passive voice with ser plus the participle, compared with the active preterite. Includes regular and irregular participles.",
    ),
    "because-of-this": (
        "Because of This",
        "Por isso",
        "grammar",
        "Por isso for that's why, por causa disso or daquilo for because of this or that, and devido a for due to.",
    ),
    "ordinal-numbers": (
        "Ordinal Numbers",
        "Posições numéricas",
        "grammar",
        "Ordinals from primeiro through centésimo, used for floors, rankings, and the nth time.",
    ),
    "para-and-por": (
        "Para and Por",
        "Para e por",
        "grammar",
        "Para for goal, destination, opinion, and deadline. Por for agent, rate, duration, reason, and movement through. Contractions pelo, pela, pelos, pelas.",
    ),
    "nouns-ending-in-ao": (
        "Nouns Ending in -ão",
        "Substantivos em -ão",
        "grammar",
        "Nouns that end in -ão, and how their plurals tend to work.",
    ),
}

LESSON_TO_SUBJECT = {
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
}

CATEGORY_TO_SUBJECT = {
    "days": "days-of-the-week",
    "months": "months",
    "greetings": "greetings",
    "family": "family",
    "places": "places",
    "body": "the-body",
    "clothes": "clothes",
    "directions": "directions",
    "food": "food",
    "fruit": "fruit",
    "vegetables": "vegetables",
    "animals": "animals",
    "nature": "nature",
    "technology": "technology",
    "kitchen": "the-kitchen",
    "bedroom": "the-bedroom",
    "home": "at-home",
    "colors": "colors",
    "professions": "professions",
    "feelings": "feelings",
    "miscellaneous": "everyday-words",
    "adjectives": "adjectives",
    "nouns-ao": "nouns-ending-in-ao",
    "materials": "materials-and-objects",
    "rooms": "rooms",
    "weather": "weather",
    "bathroom": "the-bathroom",
    "drinks": "drinks",
    "restaurant": "ordering-at-a-cafe",
    "sports": "sports",
    "school": "school",
    "transport": "getting-around",
    "flavors": "flavors",
    "ordinals": "ordinal-numbers",
    "demonstratives": "this-and-that",
    "connectors": "then-so-and-so-much",
    "contractions": "contractions-with-de",
    "prepositions": "para-and-por",
    "time": "ways-to-say-time",
    "expressions": "ways-to-say-time",
    "grammar": "was-and-were",
    "comparatives": "comparatives",
    "verbs": "simple-past",
}


def clean_text(value: str) -> str:
    value = value.replace("; also used in European Portuguese", "")
    value = value.replace("also used in European Portuguese", "")
    value = re.sub(r"\s*The file is titled Aula [\d.]+ inside the document\.", "", value)
    value = value.replace("A duplicate copy of this lesson was ignored.", "")
    value = re.sub(r"\s{2,}", " ", value).strip()
    return value


def apply_usage_note(item: dict) -> None:
    notes = item.pop("variantNotes", None)
    if isinstance(notes, dict) and notes.get("pt-BR"):
        item["usageNote"] = clean_text(notes["pt-BR"])


def map_lesson(lesson_id: str, category: str | None = None) -> str:
    if lesson_id == "vocabulario":
        if category and category in CATEGORY_TO_SUBJECT:
            return CATEGORY_TO_SUBJECT[category]
        raise KeyError(f"Unmapped vocabulary category: {category}")
    if lesson_id not in LESSON_TO_SUBJECT:
        raise KeyError(f"Unmapped lesson: {lesson_id}")
    return LESSON_TO_SUBJECT[lesson_id]


def main() -> None:
    raw = json.loads(DATA.read_text())
    old_summaries = {lesson["id"]: lesson["summary"] for lesson in raw["lessons"]}
    for lesson_id, subject_id in LESSON_TO_SUBJECT.items():
        name, name_pt, group_id, _summary = SUBJECTS[subject_id]
        summary = clean_text(old_summaries.get(lesson_id, _summary)) or _summary
        SUBJECTS[subject_id] = (name, name_pt, group_id, summary)

    subjects = []
    for subject_id, (name, name_pt, group_id, summary) in SUBJECTS.items():
        subjects.append(
            {
                "id": subject_id,
                "name": name,
                "namePt": name_pt,
                "groupId": group_id,
                "summary": summary,
            }
        )

    lessons = []
    for lesson in raw["lessons"]:
        if lesson["id"] not in LESSON_TO_SUBJECT:
            continue
        lessons.append(
            {
                "id": lesson["id"],
                "number": lesson["number"],
                "title": clean_text(lesson["title"]),
                "titleEn": lesson["titleEn"],
                "sourceFile": lesson["sourceFile"],
                "summary": clean_text(lesson["summary"]),
                "subjectId": LESSON_TO_SUBJECT[lesson["id"]],
            }
        )

    vocabulary = []
    for item in raw["vocabulary"]:
        lesson_id = item.pop("lessonId")
        apply_usage_note(item)
        item["subjectId"] = map_lesson(lesson_id, item.get("category"))
        if "translation" in item:
            item["translation"] = clean_text(item["translation"])
        if item.get("notes"):
            item["notes"] = clean_text(item["notes"])
        vocabulary.append(item)

    phrases = []
    for item in raw["phrases"]:
        lesson_id = item.pop("lessonId")
        item["subjectId"] = map_lesson(lesson_id, item.get("category"))
        phrases.append(item)

    grammar = []
    for item in raw["grammar"]:
        lesson_id = item.pop("lessonId")
        apply_usage_note(item)
        item["subjectId"] = map_lesson(lesson_id)
        item["explanation"] = clean_text(item["explanation"])
        grammar.append(item)

    verbs = []
    for item in raw["verbs"]:
        lesson_ids = item.pop("lessonIds")
        item["subjectIds"] = [map_lesson(lesson_id) for lesson_id in lesson_ids]
        if item.get("notes"):
            item["notes"] = clean_text(item["notes"])
        verbs.append(item)

    quizzes = []
    for item in raw["quizzes"]:
        lesson_id = item.pop("lessonId")
        category = next((tag for tag in item.get("tags", []) if tag != "vocabulary"), None)
        item["subjectId"] = map_lesson(lesson_id, category)
        for key in ("prompt", "answer", "blankSentence"):
            if item.get(key):
                item[key] = clean_text(item[key])
        if item.get("acceptableAnswers"):
            item["acceptableAnswers"] = [clean_text(value) for value in item["acceptableAnswers"]]
        if item.get("options"):
            item["options"] = [clean_text(value) for value in item["options"]]
        quizzes.append(item)

    payload = {
        "meta": {
            "locale": "pt-BR",
            "language": "Brazilian Portuguese",
            "extractedFrom": "materials/*.docx",
            "notes": "Topics follow Brazilian usage: você, a gente, and spoken pra and pro. English glosses were added for word-list items the teacher wrote without a translation. A duplicate copy of the times-of-day notes was not imported twice.",
        },
        "groups": GROUPS,
        "subjects": subjects,
        "lessons": lessons,
        "vocabulary": vocabulary,
        "phrases": phrases,
        "grammar": grammar,
        "verbs": verbs,
        "quizzes": quizzes,
    }

    blob = json.dumps(payload, ensure_ascii=False, indent=2)
    forbidden = ("pt-PT", "European Portuguese", "lessonId", "variantNotes")
    for token in forbidden:
        if token in blob:
            raise SystemExit(f"Forbidden token still present: {token}")

    DATA.write_text(blob + "\n")
    print(f"subjects {len(subjects)} lessons {len(lessons)} vocab {len(vocabulary)} phrases {len(phrases)} grammar {len(grammar)} verbs {len(verbs)} quizzes {len(quizzes)}")


if __name__ == "__main__":
    main()
