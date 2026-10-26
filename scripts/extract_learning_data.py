#!/usr/bin/env python3
"""Extract teacher lesson .docx files into src/data/learning-data.json."""

from __future__ import annotations

import json
import re
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / "materials"
OUT = ROOT / "src" / "data" / "learning-data.json"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

LESSONS = [
    {
        "id": "aula-12",
        "number": "12",
        "title": "Isso, esse, essa e aquilo, aquele, aquela",
        "titleEn": "This and that",
        "sourceFile": "AULA 12 – ISSO, ESSE, ESSA & AQUILO, AQUELE, AQUELA.docx",
        "categories": ["demonstratives", "grammar"],
        "summary": "Esse/essa/isso for this, aquele/aquela/aquilo for that, plus the plurals esses/essas and aqueles/aquelas. Isso and aquilo refer to unknown things or things that are not physical.",
    },
    {
        "id": "aula-12-1",
        "number": "12.1",
        "title": "Disso, desse, dessa, daquilo, daquele, daquela",
        "titleEn": "Contractions with de",
        "sourceFile": "AULA 12.1 – DISSO, DESSE, DESSA, DAQUILO, DAQUELE & DAQUELA.docx",
        "categories": ["contractions", "prepositions", "grammar"],
        "summary": "De contracts with demonstratives: disso, desse, dessa, daquilo, daquele, daquela. Required after verbs and expressions that take de, such as gostar de, precisar de, and medo de.",
    },
    {
        "id": "aula-13",
        "number": "13",
        "title": "Adjetivos",
        "titleEn": "Adjectives",
        "sourceFile": "AULA 13 - ADJETIVOS.docx",
        "categories": ["adjectives"],
        "summary": "Core adjectives, gender agreement, and emphasis with muito and um pouco.",
    },
    {
        "id": "aula-13-2",
        "number": "13.2",
        "title": "Comparativos e superlativos",
        "titleEn": "Comparatives and superlatives",
        "sourceFile": "AULA 13.2 – COMPARATIVOS.docx",
        "categories": ["comparatives", "adjectives", "grammar"],
        "summary": "Mais/menos + adjective + (do) que, irregular maior, menor, melhor, pior, and the superlative o/a mais.",
    },
    {
        "id": "aula-13-3",
        "number": "13.3",
        "title": "Cores",
        "titleEn": "Colors",
        "sourceFile": "AULA 13.3 – CORES.docx",
        "categories": ["colors", "adjectives"],
        "summary": "Color vocabulary and gender agreement for colors that change form.",
    },
    {
        "id": "aula-13-4",
        "number": "13.4",
        "title": "Então, tão e tanto",
        "titleEn": "Then, so, and so much",
        "sourceFile": "AULA 13.4 – ENTÃO, TANTO & TÃO.docx",
        "categories": ["connectors", "expressions"],
        "summary": "Então (then/so), desde então, tão, tanto/tanta/tantos/tantas, tanto faz, and tanto quanto.",
    },
    {
        "id": "aula-14",
        "number": "14",
        "title": "Vez, tempo, época, hora e horário",
        "titleEn": "Ways to say time",
        "sourceFile": "AULA 14 - VEZ, TEMPO, ÉPOCA, HORA & HORÁRIO.docx",
        "categories": ["time", "expressions"],
        "summary": "Tempo for weather and duration, vez for occasions and turns, época for a period, hora for clock time, horário for a schedule, and clima for weather or vibe.",
    },
    {
        "id": "aula-14-past",
        "number": "14-past",
        "title": "Pretérito perfeito",
        "titleEn": "Simple past",
        "sourceFile": "AULA 14 – PAST SIMPLE.docx",
        "categories": ["verbs", "preterite"],
        "summary": "Regular past endings for -ar, -er, and -ir verbs, plus irregular preterite forms of ir, trazer, ver, fazer, ter, dizer, and pedir. The file is titled Aula 15 inside the document.",
    },
    {
        "id": "aula-14-1",
        "number": "14.1",
        "title": "Foi, era e estava",
        "titleEn": "Was and were",
        "sourceFile": "AULA 14.1 - FOI, ERA & ESTAVA.docx",
        "categories": ["verbs", "ser", "estar"],
        "summary": "Estava for past location, feelings, and ongoing actions. Era for lasting past states. Foi for a single completed situation. The file is titled Aula 15.1 inside the document.",
    },
    {
        "id": "aula-14-2",
        "number": "14.2",
        "title": "Pretérito perfeito e imperfeito",
        "titleEn": "Completed past and used to",
        "sourceFile": "AULA 14.2 – PASSADO PERFEITO (SIMPLE) & IMPERFEITO.docx",
        "categories": ["verbs", "imperfect", "preterite"],
        "summary": "Perfeito for one completed action. Imperfeito, or costumar, for habits and repeated past actions.",
    },
    {
        "id": "aula-14-3",
        "number": "14.3",
        "title": "Particípio",
        "titleEn": "Past participle",
        "sourceFile": "AULA 14.3 - PARTICÍPIO.docx",
        "categories": ["verbs", "participle"],
        "summary": "Passive voice with ser + participle, compared with the active preterite. Includes regular and irregular participles.",
    },
    {
        "id": "aula-15-1",
        "number": "15.1",
        "title": "Por isso e por aquilo",
        "titleEn": "Because of this and that",
        "sourceFile": "AULA 15.1 – POR ISSO & POR AQUILO.docx",
        "categories": ["connectors", "prepositions"],
        "summary": "Por isso for that's why, por causa disso/daquilo for because of this/that, and devido a/ao for due to. The file is titled Aula 17.1 inside the document.",
    },
    {
        "id": "aula-16-1",
        "number": "16.1",
        "title": "Posições numéricas",
        "titleEn": "Ordinal numbers",
        "sourceFile": "AULA 16.1 – POSIÇÕES NUMÉRICAS.docx",
        "categories": ["ordinals"],
        "summary": "Ordinals from primeiro through centésimo, used for floors, rankings, and the nth time.",
    },
    {
        "id": "aula-17",
        "number": "17",
        "title": "Para e por",
        "titleEn": "Para and por",
        "sourceFile": "AULA 17 – PARA & POR.docx",
        "categories": ["prepositions"],
        "summary": "Para for goal, destination, opinion, and deadline. Por for agent, rate, duration, reason, and movement through. Contractions pelo, pela, pelos, pelas.",
    },
    {
        "id": "aula-17-2",
        "number": "17.2",
        "title": "Manhã, tarde, noite, ontem, hoje, amanhã, cedo e tarde",
        "titleEn": "Times of day",
        "sourceFile": "AULA 17.2 - MANHÃ, TARDE & NOITE. ONTEM, HOJE & AMANHÃ. TARDE & CEDO.docx",
        "categories": ["time", "expressions"],
        "summary": "Parts of the day, yesterday/today/tomorrow combinations, and the difference between está tarde and estou atrasado. A duplicate copy of this lesson was ignored.",
    },
    {
        "id": "vocabulario",
        "number": "voc",
        "title": "Vocabulário temático",
        "titleEn": "Thematic vocabulary",
        "sourceFile": "VOCABULÁRIO.docx",
        "categories": ["vocabulary"],
        "summary": "Teacher word lists: calendar, greetings, family, places, body, clothes, food, animals, house, colors, professions, feelings, and nouns ending in -ão.",
    },
]

CATEGORY_HEADERS = {
    "dias da semana": "days",
    "meses do ano": "months",
    "palavras importantes": "greetings",
    "casa": "home",
    "família": "family",
    "familia": "family",
    "transporte": "transport",
    "lugares": "places",
    "corpo": "body",
    "roupas": "clothes",
    "direção": "directions",
    "direcao": "directions",
    "bebidas": "drinks",
    "comida": "food",
    "frutas": "fruit",
    "vegetais": "vegetables",
    "sabor": "flavors",
    "animais": "animals",
    "clima / natureza": "weather",
    "natureza": "nature",
    "tecnologia": "technology",
    "cozinha": "kitchen",
    "quarto": "bedroom",
    "banheiro": "bathroom",
    "cores": "colors",
    "material": "materials",
    "esportes": "sports",
    "escola": "school",
    "profissões": "professions",
    "profissoes": "professions",
    "sentimentos / sensações": "feelings",
    "sentimentos / sensacoes": "feelings",
    "restaurante / bar": "restaurant",
    "aleatório": "miscellaneous",
    "aleatorio": "miscellaneous",
    "adjetivos": "adjectives",
    "palavras com “ão”": "nouns-ao",
    'palavras com "ão"': "nouns-ao",
    "palavras com “ao”": "nouns-ao",
}

# English glosses for list items the teacher wrote without a translation.
GLOSSES = {
    "janeiro": "January",
    "fevereiro": "February",
    "março": "March",
    "abril": "April",
    "maio": "May",
    "junho": "June",
    "julho": "July",
    "agosto": "August",
    "setembro": "September",
    "outubro": "October",
    "novembro": "November",
    "dezembro": "December",
    "oi": "hi",
    "olá": "hello",
    "tchau": "bye",
    "prazer": "nice to meet you",
    "tudo bem?": "how are you? / all good?",
    "como vai?": "how are you?",
    "como está?": "how are you?",
    "obrigado": "thank you",
    "por nada": "you're welcome",
    "de nada": "you're welcome",
    "com licença": "excuse me",
    "desculpa": "sorry",
    "por favor": "please",
    "bom dia": "good morning",
    "boa tarde": "good afternoon",
    "boa noite": "good evening / good night",
    "ontem": "yesterday",
    "hoje": "today",
    "amanhã": "tomorrow",
    "manhã": "morning",
    "tarde": "afternoon / late",
    "noite": "evening / night",
    "tempo": "time / weather",
    "casa": "house",
    "faculdade": "college",
    "universidade": "university",
    "bar": "bar",
    "academia": "gym",
    "restaurante": "restaurant",
    "parque": "park",
    "praia": "beach",
    "escola": "school",
    "prédio": "building",
    "estacionamento": "parking lot",
    "loja": "store",
    "provador": "fitting room",
    "shopping": "mall",
    "biblioteca": "library",
    "creche": "daycare",
    "território": "territory",
    "igreja": "church",
    "templo": "temple",
    "padaria": "bakery",
    "hospital": "hospital",
    "hotel": "hotel",
    "abrigo": "shelter",
    "acampamento": "campsite",
    "estação": "station",
    "cruzamento": "intersection",
    "faixa de pedestres": "crosswalk",
    "esquina": "street corner",
    "fronteira": "border",
    "unha": "nail",
    "mão": "hand",
    "dedo": "finger",
    "pé": "foot",
    "peitos": "chest",
    "pescoço": "neck",
    "perna": "leg",
    "olhos": "eyes",
    "sobrancelha": "eyebrow",
    "testa": "forehead",
    "rosto": "face",
    "bochecha": "cheek",
    "cílios": "eyelashes",
    "orelha": "ear",
    "boca": "mouth",
    "lábios": "lips",
    "nariz": "nose",
    "língua": "tongue",
    "costas": "back",
    "costela": "rib",
    "coluna": "spine",
    "quadril": "hip",
    "braço": "arm",
    "dente": "tooth",
    "gengiva": "gum",
    "pele": "skin",
    "osso": "bone",
    "sangue": "blood",
    "cabeça": "head",
    "cabelo": "hair",
    "pelo": "body hair",
    "joelho": "knee",
    "cotovelo": "elbow",
    "ombro": "shoulder",
    "queixo": "chin",
    "estômago": "stomach",
    "barriga": "belly",
    "umbigo": "navel",
    "barba": "beard",
    "bigode": "mustache",
    "bunda": "butt",
    "camiseta": "t-shirt",
    "camisa": "shirt",
    "calça": "pants",
    "shorte": "shorts",
    "vestido": "dress",
    "cueca": "men's underwear",
    "calcinha": "panties",
    "sutiã": "bra",
    "sapatos": "shoes",
    "tênis": "sneakers",
    "chinelo": "flip-flop",
    "luva": "glove",
    "sandália": "sandal",
    "chapéu": "hat",
    "boné": "cap",
    "casaco": "coat",
    "blusa": "blouse",
    "jaqueta": "jacket",
    "cachecol": "scarf",
    "gravata": "tie",
    "saia": "skirt",
    "meia": "sock",
    "bota": "boot",
    "sunga": "men's swim briefs",
    "biquíni": "bikini",
    "maiô": "one-piece swimsuit",
    "tecido": "fabric",
    "norte": "north",
    "sul": "south",
    "leste": "east",
    "oeste": "west",
    "direita": "right",
    "esquerda": "left",
    "rua": "street",
    "avenida": "avenue",
    "estrada": "road",
    "caminho": "path / way",
    "endereço": "address",
    "bairro": "neighborhood",
    "calçada": "sidewalk",
    "semáforo": "traffic light",
    "cidade": "city",
    "estado": "state",
    "país": "country",
    "continente": "continent",
    "região": "region",
    "zona": "zone",
    "apartamento": "apartment",
    "água": "water",
    "suco": "juice",
    "vinho": "wine",
    "cerveja": "beer",
    "refrigerante": "soda",
    "leite": "milk",
    "café": "coffee",
    "chá": "tea",
    "energético": "energy drink",
    "café da manhã": "breakfast",
    "almoço": "lunch",
    "jantar": "dinner",
    "refeição": "meal",
    "açúcar": "sugar",
    "sal": "salt",
    "pão": "bread",
    "queijo": "cheese",
    "carne": "meat",
    "churrasco": "barbecue",
    "frango": "chicken",
    "presunto": "ham",
    "hamburguer": "hamburger",
    "salada": "salad",
    "sopa": "soup",
    "macarrão": "pasta",
    "pizza": "pizza",
    "torrada": "toast",
    "bolo": "cake",
    "torta": "pie / tart",
    "ovo": "egg",
    "brócolis": "broccoli",
    "batata": "potato",
    "beterraba": "beet",
    "cenoura": "carrot",
    "ervilha": "pea",
    "milho": "corn",
    "tomate": "tomato",
    "alface": "lettuce",
    "cebola": "onion",
    "alho": "garlic",
    "abóbora": "pumpkin / squash",
    "pepino": "cucumber",
    "pimentão": "bell pepper",
    "berinjela": "eggplant",
    "arroz": "rice",
    "feijão": "beans",
    "gengibre": "ginger",
    "soja": "soy",
    "doce": "sweet",
    "salgado": "salty",
    "amargo": "bitter",
    "azedo": "sour",
    "picante": "spicy",
    "podre": "rotten",
    "cachorro": "dog",
    "gato": "cat",
    "cavalo": "horse",
    "urso": "bear",
    "cabra": "goat",
    "tigre": "tiger",
    "leão": "lion",
    "vaca": "cow",
    "boi": "ox / steer",
    "touro": "bull",
    "cobra": "snake",
    "macaco": "monkey",
    "girafa": "giraffe",
    "elefante": "elephant",
    "lobo": "wolf",
    "hipopótamo": "hippopotamus",
    "guaxinim": "raccoon",
    "mosquito": "mosquito",
    "esquilo": "squirrel",
    "coelho": "rabbit",
    "javali": "wild boar",
    "gambá": "skunk",
    "peixe": "fish",
    "baleia": "whale",
    "veado": "deer",
    "sapo": "frog",
    "tubarão": "shark",
    "galinha": "hen",
    "galo": "rooster",
    "raposa": "fox",
    "tartaruga": "turtle",
    "porco": "pig",
    "pato": "duck",
    "pinguim": "penguin",
    "borboleta": "butterfly",
    "jacaré": "alligator",
    "zebra": "zebra",
    "abelha": "bee",
    "aranha": "spider",
    "pássaro": "bird",
    "pavão": "peacock",
    "avestruz": "ostrich",
    "águia": "eagle",
    "canguru": "kangaroo",
    "coala": "koala",
    "verão": "summer",
    "inverno": "winter",
    "outono": "autumn",
    "primavera": "spring",
    "estação": "season",
    "quente": "hot",
    "frio": "cold",
    "húmido": "humid",
    "seco": "dry",
    "molhado": "wet",
    "sol": "sun",
    "lua": "moon",
    "planeta": "planet",
    "mar": "sea",
    "onda": "wave",
    "areia": "sand",
    "terra": "earth / ground",
    "rio": "river",
    "lago": "lake",
    "oceano": "ocean",
    "cachoeira": "waterfall",
    "céu": "sky",
    "nuvem": "cloud",
    "fogo": "fire",
    "neve": "snow",
    "gelo": "ice",
    "árvore": "tree",
    "grama": "grass",
    "flor": "flower",
    "floresta": "forest",
    "selvagem": "wild",
    "chuva": "rain",
    "tempestade": "storm",
    "montanha": "mountain",
    "terremoto": "earthquake",
    "furacão": "hurricane",
    "granizo": "hail",
    "raio": "lightning",
    "trovão": "thunder",
    "lama": "mud",
    "computador": "computer",
    "celular": "cell phone",
    "tela": "screen",
    "teclado": "keyboard",
    "tomada": "power outlet",
    "câmera": "camera",
    "televisão": "television",
    "fone de ouvido": "headphones",
    "carregador": "charger",
    "bateria": "battery",
    "energia": "energy / power",
    "luz": "light",
    "fogão": "stove",
    "forno": "oven",
    "microondas": "microwave",
    "mesa": "table",
    "cadeira": "chair",
    "prato": "plate / dish",
    "colher": "spoon",
    "garfo": "fork",
    "faca": "knife",
    "panela": "pot",
    "geladeira": "fridge",
    "copo": "glass",
    "taça": "wine glass",
    "garrafa": "bottle",
    "liquidificador": "blender",
    "guardanapo": "napkin",
    "canudo": "straw",
    "caneca": "mug",
    "xícara": "cup",
    "papel toalha": "paper towel",
    "cama": "bed",
    "travesseiro": "pillow",
    "cobertor": "blanket",
    "lençol": "bedsheet",
    "colchão": "mattress",
    "guarda-roupa": "wardrobe",
    "closet": "closet",
    "cabide": "hanger",
    "mochila": "backpack",
    "mala": "suitcase",
    "bolsa": "bag",
    "janela": "window",
    "porta": "door",
    "tapete": "rug",
    "torneira": "faucet",
    "pia": "sink",
    "lixo": "trash",
    "toalha": "towel",
    "vaso sanitário": "toilet",
    "descarga": "flush",
    "chuveiro": "shower",
    "sabonete": "soap",
    "shampoo": "shampoo",
    "condicionador": "conditioner",
    "garagem": "garage",
    "portão": "gate",
    "sala": "living room",
    "sofá": "sofa",
    "decoração": "decoration",
    "jardim": "garden",
    "quintal": "yard",
    "horta": "vegetable garden",
    "escritório": "office",
    "muro": "outside wall",
    "parede": "inside wall",
    "teto": "ceiling",
    "telhado": "roof",
    "cobertura": "penthouse / roof covering",
    "piscina": "pool",
    "rosa": "pink",
    "azul": "blue",
    "verde": "green",
    "cinza": "gray",
    "preto": "black",
    "roxo": "purple",
    "vermelho": "red",
    "branco": "white",
    "laranja": "orange",
    "marrom": "brown",
    "amarelo": "yellow",
    "dourado": "gold",
    "lilás": "lilac",
    "vidro": "glass (material)",
    "plástico": "plastic",
    "papel": "paper",
    "borracha": "rubber",
    "metal": "metal",
    "ferro": "iron",
    "ouro": "gold",
    "prata": "silver",
    "madeira": "wood",
    "reciclável": "recyclable",
    "descartável": "disposable",
    "futebol": "soccer",
    "basquete": "basketball",
    "vôlei": "volleyball",
    "bola": "ball",
    "campo": "field",
    "estádio": "stadium",
    "quadra": "court",
    "gol": "goal",
    "professor": "teacher",
    "professora": "teacher",
    "matéria": "school subject",
    "caderno": "notebook",
    "livro": "book",
    "caneta": "pen",
    "lápis": "pencil",
    "carta": "letter",
    "diplomata": "diplomat",
    "engenheiro": "engineer",
    "engenheira": "engineer",
    "advogado": "lawyer",
    "advogada": "lawyer",
    "publicitário": "advertiser",
    "publicitária": "advertiser",
    "escritor": "writer",
    "escritora": "writer",
    "ator": "actor",
    "atriz": "actress",
    "cantor": "singer",
    "cantora": "singer",
    "biólogo": "biologist",
    "bióloga": "biologist",
    "jornalista": "journalist",
    "farmacêutico": "pharmacist",
    "farmacêutica": "pharmacist",
    "médico": "doctor",
    "médica": "doctor",
    "dentista": "dentist",
    "arquiteto": "architect",
    "arquiteta": "architect",
    "psicólogo": "psychologist",
    "psicóloga": "psychologist",
    "historiador": "historian",
    "historiadora": "historian",
    "investidor": "investor",
    "investidora": "investor",
    "empresário": "business owner",
    "empresária": "business owner",
    "cozinheiro": "cook",
    "cozinheira": "cook",
    "chefe de cozinha": "chef",
    "gerente": "manager",
    "cientista": "scientist",
    "editor": "editor",
    "sonho": "dream",
    "pesadelo": "nightmare",
    "sinal": "sign / signal",
    "pensamento": "thought",
    "amizade": "friendship",
    "amor": "love",
    "relação": "relation",
    "relacionamento": "relationship",
    "raiva": "anger",
    "paixão": "passion",
    "fome": "hunger",
    "sede": "thirst",
    "satisfação": "satisfaction",
    "aflição": "distress",
    "ansiedade": "anxiety",
    "sono": "sleepiness",
    "dor": "pain",
    "cardápio": "menu",
    "menu": "menu",
    "conta": "bill",
    "cartão": "card",
    "débito": "debit",
    "crédito": "credit",
    "gorjeta": "tip",
    "reserva": "reservation",
    "pedido": "order",
    "fantasia": "costume / fantasy",
    "prancha": "surfboard",
    "ração": "pet food",
    "coleira": "collar",
    "marca": "brand",
    "palavrão": "swear word",
    "bandeira": "flag",
    "lâmpada": "lamp / light bulb",
    "balança": "scale",
    "remédio": "medicine",
    "pista de dança": "dance floor",
    "indústria": "industry",
    "economia": "economy",
    "documento": "document",
    "boleto": "payment slip",
    "fatura": "invoice",
    "ingresso": "ticket",
    "convite": "invitation",
    "música": "music",
    "placa": "sign",
    "alarme": "alarm",
    "temporada": "season (of a show or sports)",
    "opção": "option",
    "resultado": "result",
    "sócio": "partner",
    "guarda-chuva": "umbrella",
    "guarda-sol": "beach umbrella",
    "barulho": "noise",
    "silêncio": "silence",
    "regra": "rule",
    "bonito": "beautiful / pretty",
    "bonita": "beautiful / pretty",
    "lindo": "beautiful",
    "linda": "beautiful",
    "feio": "ugly",
    "feia": "ugly",
    "caro": "expensive",
    "cara": "expensive",
    "barato": "cheap",
    "barata": "cheap",
    "limpo": "clean",
    "limpa": "clean",
    "sujo": "dirty",
    "suja": "dirty",
    "perto": "near",
    "longe": "far",
    "claro": "clear / light",
    "escuro": "dark",
    "fácil": "easy",
    "difícil": "difficult",
    "inteligente": "smart",
    "burro": "dumb",
    "burra": "dumb",
    "educado": "polite",
    "educada": "polite",
    "mal-educado": "rude",
    "estúpido": "stupid",
    "idiota": "idiot",
    "arrogante": "arrogant",
    "alto": "tall / high / loud",
    "alta": "tall / high / loud",
    "baixo": "short / low",
    "baixa": "short / low",
    "gordo": "fat",
    "magro": "thin",
    "honesto": "honest",
    "divertido": "fun",
    "divertida": "fun",
    "engraçado": "funny",
    "engraçada": "funny",
    "sarcástico": "sarcastic",
    "sarcástica": "sarcastic",
    "nojento": "disgusting",
    "nojenta": "disgusting",
    "maravilhoso": "amazing",
    "maravilhosa": "amazing",
    "velho": "old",
    "velha": "old",
    "novo": "new / young",
    "nova": "new / young",
    "constituição": "constitution",
    "população": "population",
    "poluição": "pollution",
    "civilização": "civilization",
    "movimentação": "movement / bustle",
    "condição": "condition",
    "ligação": "phone call / connection",
    "exceção": "exception",
    "inspiração": "inspiration",
    "seção": "section",
    "proporção": "proportion",
    "intervenção": "intervention",
    "concepção": "conception",
    "ambição": "ambition",
    "interação": "interaction",
    "sanção": "sanction",
    "contenção": "containment",
    "distinção": "distinction",
    "transição": "transition",
    "emoção": "emotion",
    "dicção": "diction",
    "imaginação": "imagination",
    "corrupção": "corruption",
    "fragmentação": "fragmentation",
    "composição": "composition",
    "correção": "correction",
    "inflação": "inflation",
    "extinção": "extinction",
    "evolução": "evolution",
    "renovação": "renovation",
    "noção": "notion",
    "vocação": "vocation",
    "instrução": "instruction",
    "preocupação": "worry",
    "solução": "solution",
    "construção": "construction",
    "promoção": "promotion",
    "aplicação": "application",
    "formação": "education / formation",
    "obrigação": "obligation",
    "oração": "prayer",
    "representação": "representation",
    "porção": "portion",
    "traição": "betrayal",
    "produção": "production",
    "tradução": "translation",
    "imigração": "immigration",
    "cotação": "quote / exchange rate",
    "graduação": "graduation / undergraduate degree",
    "perseguição": "persecution / chase",
    "conjugação": "conjugation",
    "eleição": "election",
    "coleção": "collection",
    "cesta": "basket",
}

TYPO_FIXES = {
    "barket": "basket",
    "soon": "son",
    "half bother": "half brother",
    "sters": "stairs",
    "autumm, falls": "autumn",
    "mellon": "melon",
    "watermellon": "watermelon",
    "passiofruit": "passion fruit",
    "gwava": "guava",
    "motorcicly": "motorcycle",
    "balconi, yard": "balcony / yard",
    "male cousin": "male cousin",
    "female cousin": "female cousin",
}

PRONUNCIATION = {
    "cesta": "The teacher marked this word while discussing the S sound in sexta.",
    "sexta-feira": "The x in sexta sounds like S.",
    "abacaxi": "The x sounds like the Portuguese ch (English sh).",
    "exercício": "The c before i sounds like Z.",
    "tóxico": "The x here sounds like KS.",
    "faz": "Pronounced with an ee before the z: fa-iz.",
    "português": "The ê is followed by a short ee sound: portugue-is.",
    "mas": "Often pronounced ma-is, which keeps it distinct from mais.",
    "fez": "Pronounced fe-iz.",
}


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as zf:
        root = ET.fromstring(zf.read("word/document.xml"))
    lines = []
    for p in root.iter(f"{W}p"):
        texts = []
        for t in p.iter(f"{W}t"):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        line = re.sub(r"\s+", " ", "".join(texts)).strip()
        if line:
            lines.append(line)
    return lines


def fold(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text.lower().strip()


def slug(text: str) -> str:
    text = fold(text)
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "item"


def clean_english(text: str) -> str:
    text = re.sub(r"\s+", " ", text.strip(" ."))
    fixed = TYPO_FIXES.get(text.lower(), text)
    if fixed.isupper():
        fixed = fixed[:1] + fixed[1:].lower()
    return fixed


HEADER_SEQUENCE = [
    ("dias da semana", "days"),
    ("meses do ano", "months"),
    ("palavras importantes", "greetings"),
    ("casa", "rooms"),
    ("família", "family"),
    ("transporte", "transport"),
    ("lugares", "places"),
    ("corpo", "body"),
    ("roupas", "clothes"),
    ("direção", "directions"),
    ("bebidas", "drinks"),
    ("comida", "food"),
    ("frutas", "fruit"),
    ("vegetais", "vegetables"),
    ("sabor", "flavors"),
    ("animais", "animals"),
    ("clima / natureza", "weather"),
    ("natureza", "nature"),
    ("tecnologia", "technology"),
    ("cozinha", "kitchen"),
    ("quarto", "bedroom"),
    ("banheiro", "bathroom"),
    ("casa", "home"),
    ("cores", "colors"),
    ("material", "materials"),
    ("esportes", "sports"),
    ("escola", "school"),
    ("profissões", "professions"),
    ("sentimentos / sensações", "feelings"),
    ("restaurante / bar", "restaurant"),
    ("aleatório", "miscellaneous"),
    ("adjetivos", "adjectives"),
    ("palavras com “ão”", "nouns-ao"),
]

def norm_key(text: str) -> str:
    text = fold(text)
    text = text.replace("“", "").replace("”", "").replace('"', "")
    text = re.sub(r"[?.,!]+", "", text)
    return re.sub(r"\s+", " ", text).strip()


GLOSS_BY_FOLD = {norm_key(key): value for key, value in GLOSSES.items()}
GLOSS_BY_FOLD["sarcatica"] = "sarcastic"
GLOSS_BY_FOLD["chefe de cozinha"] = "chef"


def split_gender_pair(token: str) -> tuple[str, str | None]:
    token = token.strip()
    match = re.match(r"^(.+?)\s*\(a\)$", token, flags=re.I)
    if match:
        base = match.group(1).strip()
        feminine = base[:-1] + "a" if base.endswith("o") else base + "a"
        return base, feminine
    if "/" in token:
        left, right = [part.strip() for part in token.split("/", 1)]
        if fold(right) in {fold(left)[:-1] + "a", fold(left) + "a"} or (
            left.endswith("o") and right.endswith("a") and fold(left)[:-1] == fold(right)[:-1]
        ):
            return left, right
    return token, None


def add_vocab(bucket: list[dict], seen: set[str], *, lemma: str, translation: str, category: str, lesson_id: str, pos: str, gender: str | None = None, feminine: str | None = None, notes: str | None = None, pronunciation: str | None = None):
    lemma = lemma.strip(" .,-")
    if not lemma or len(lemma) < 2:
        return
    key = f"{category}:{fold(lemma)}"
    if key in seen:
        return
    seen.add(key)
    item = {
        "id": f"vocab-{category}-{slug(lemma)}",
        "lemma": lemma[:1].upper() + lemma[1:] if lemma[:1].islower() and " " not in lemma[:2] else lemma,
        "translation": translation,
        "partOfSpeech": pos,
        "category": category,
        "lessonId": lesson_id,
        "examples": [],
    }
    if gender:
        item["gender"] = gender
    if feminine:
        item["feminine"] = feminine
    if notes:
        item["notes"] = notes
    hint = pronunciation or PRONUNCIATION.get(fold(lemma))
    if hint:
        item["pronunciationHint"] = hint
    if category == "days":
        item["lemma"] = lemma[:1].upper() + lemma[1:]
    bucket.append(item)


def pos_for(category: str) -> str:
    if category in {"adjectives", "colors", "flavors"}:
        return "adjective"
    if category in {"greetings"}:
        return "expression"
    if category == "ordinals":
        return "numeral"
    return "noun"


def parse_vocab_file(vocab: list[dict], seen: set[str]) -> list[str]:
    missing = []
    path = next(MATERIALS.glob("VOCABUL*.docx"))
    category = "miscellaneous"
    header_index = 0
    lines = docx_paragraphs(path)
    for line_index, line in enumerate(lines):
        if line.lower().startswith("vocabulário"):
            continue
        folded_line = norm_key(line)
        if header_index < len(HEADER_SEQUENCE) and folded_line == norm_key(HEADER_SEQUENCE[header_index][0]):
            category = HEADER_SEQUENCE[header_index][1]
            header_index += 1
            continue
        if re.fullmatch(r"[A-ZÁÉÍÓÚÃÕÇ ]+=\s*[A-Z].*", line) and len(line) < 40:
            continue
        note = None
        work = line
        if "MEU ANIVERSÁRIO" in line.upper():
            work = "Fevereiro"
            note = "Teacher note: Meu aniversário é em fevereiro."
        work = re.sub(r"\s+", " ", work).strip()
        work = work.replace(", _____", "").strip()
        translation = None
        lemma = work
        if " - " in work or " – " in work:
            lemma, translation = re.split(r"\s+[–-]\s+", work, maxsplit=1)
            translation = clean_english(translation)
        lemma = lemma.strip()
        if lemma.lower() in {"cesta", "sexta", "abacaxí", "exercício", "tóxico"} and translation and len(translation) < 4:
            continue
        parts = [lemma]
        if " / " in lemma and "(a)" not in lemma.lower():
            chunks = [p.strip() for p in lemma.split(" / ")]
            gendered = split_gender_pair(f"{chunks[0]} / {chunks[1]}") if len(chunks) == 2 else (lemma, None)
            if gendered[1] and len(chunks) == 2:
                parts = [lemma]
            elif "," not in chunks[0]:
                parts = chunks
        if len(parts) == 1:
            base, feminine = split_gender_pair(parts[0])
            gloss = translation or GLOSS_BY_FOLD.get(norm_key(base))
            if not gloss:
                missing.append(f"{category}: {base}")
                continue
            gender = None
            if base.lower().startswith("o "):
                gender, base = "m", base[2:].strip()
            elif base.lower().startswith("a "):
                gender, base = "f", base[2:].strip()
            elif feminine:
                gender = "both"
            add_vocab(
                vocab,
                seen,
                lemma=base,
                translation=gloss,
                category=category,
                lesson_id="vocabulario",
                pos="adjective" if category == "adjectives" else pos_for(category),
                gender=gender,
                feminine=feminine,
                notes=note,
            )
        else:
            for part in parts:
                gloss = GLOSS_BY_FOLD.get(fold(re.sub(r"[?.,]", "", part))) or translation
                if not gloss:
                    missing.append(f"{category}: {part}")
                    continue
                add_vocab(
                    vocab,
                    seen,
                    lemma=part,
                    translation=gloss,
                    category=category,
                    lesson_id="vocabulario",
                    pos="adjective" if category == "adjectives" else pos_for(category),
                    notes=note,
                )
    return missing


def parse_adjectives(vocab: list[dict], seen: set[str]) -> None:
    path = next(p for p in MATERIALS.glob("AULA 13 -*.docx"))
    lines = docx_paragraphs(path)
    i = 0
    while i < len(lines) - 1:
        pt, en = lines[i], lines[i + 1]
        if pt.startswith("▶") or pt.upper().startswith("AULA") or "ADJETIV" in pt.upper():
            i += 1
            continue
        if en[:1].isascii() and en[:1].isalpha() and not re.search(r"[áàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]", en):
            if len(pt.split()) <= 4 and len(en.split()) <= 6 and "—" not in pt:
                base, feminine = split_gender_pair(pt.replace("Longo/Comprido", "Longo"))
                if "Longo" in pt and "Comprido" in pt:
                    for word, gloss in (("longo", "long"), ("comprido", "long")):
                        add_vocab(vocab, seen, lemma=word, translation=gloss, category="adjectives", lesson_id="aula-13", pos="adjective", gender="both", feminine=word[:-1] + "a" if word.endswith("o") else None)
                    i += 2
                    continue
                add_vocab(
                    vocab,
                    seen,
                    lemma=base,
                    translation=clean_english(en),
                    category="adjectives",
                    lesson_id="aula-13",
                    pos="adjective",
                    gender="both" if feminine else "invariable",
                    feminine=feminine,
                )
                i += 2
                continue
        i += 1


def parse_colors(vocab: list[dict], seen: set[str]) -> None:
    path = next(MATERIALS.glob("AULA 13.3*.docx"))
    lines = docx_paragraphs(path)
    for i in range(len(lines) - 1):
        pt, en = lines[i], lines[i + 1]
        if pt.lower() in GLOSSES and en[:1].isascii() and len(en.split()) <= 2:
            add_vocab(vocab, seen, lemma=pt, translation=clean_english(en), category="colors", lesson_id="aula-13-3", pos="adjective", gender="both" if fold(pt) in {"preto", "branco", "vermelho", "amarelo", "roxo"} else "invariable")


ORDINALS = [
    ("1", "primeiro", "primeira", "first"),
    ("2", "segundo", "segunda", "second"),
    ("3", "terceiro", "terceira", "third"),
    ("4", "quarto", "quarta", "fourth"),
    ("5", "quinto", "quinta", "fifth"),
    ("6", "sexto", "sexta", "sixth"),
    ("7", "sétimo", "sétima", "seventh"),
    ("8", "oitavo", "oitava", "eighth"),
    ("9", "nono", "nona", "ninth"),
    ("10", "décimo", "décima", "tenth"),
    ("11", "décimo primeiro", "décima primeira", "eleventh"),
    ("12", "décimo segundo", "décima segunda", "twelfth"),
    ("13", "décimo terceiro", "décima terceira", "thirteenth"),
    ("14", "décimo quarto", "décima quarta", "fourteenth"),
    ("15", "décimo quinto", "décima quinta", "fifteenth"),
    ("16", "décimo sexto", "décima sexta", "sixteenth"),
    ("17", "décimo sétimo", "décima sétima", "seventeenth"),
    ("18", "décimo oitavo", "décima oitava", "eighteenth"),
    ("19", "décimo nono", "décima nona", "nineteenth"),
    ("20", "vigésimo", "vigésima", "twentieth"),
    ("30", "trigésimo", "trigésima", "thirtieth"),
    ("40", "quadragésimo", "quadragésima", "fortieth"),
    ("50", "quinquagésimo", "quinquagésima", "fiftieth"),
    ("60", "sexagésimo", "sexagésima", "sixtieth"),
    ("70", "septuagésimo", "septuagésima", "seventieth"),
    ("80", "octogésimo", "octogésima", "eightieth"),
    ("90", "nonagésimo", "nonagésima", "ninetieth"),
    ("100", "centésimo", "centésima", "hundredth"),
]


def add_ordinals(vocab: list[dict], seen: set[str]) -> None:
    for _n, masc, fem, en in ORDINALS:
        add_vocab(vocab, seen, lemma=masc, translation=en, category="ordinals", lesson_id="aula-16-1", pos="numeral", gender="both", feminine=fem)
    add_vocab(vocab, seen, lemma="último", translation="last", category="ordinals", lesson_id="aula-16-1", pos="numeral", gender="both", feminine="última")


EXPRESSIONS = [
    ("isso", "this (unspecified or non-physical)", "demonstratives", "aula-12", "pronoun"),
    ("esse", "this (masculine)", "demonstratives", "aula-12", "pronoun"),
    ("essa", "this (feminine)", "demonstratives", "aula-12", "pronoun"),
    ("aquilo", "that (unspecified or non-physical)", "demonstratives", "aula-12", "pronoun"),
    ("aquele", "that (masculine)", "demonstratives", "aula-12", "pronoun"),
    ("aquela", "that (feminine)", "demonstratives", "aula-12", "pronoun"),
    ("esses", "these (masculine)", "demonstratives", "aula-12", "pronoun"),
    ("essas", "these (feminine)", "demonstratives", "aula-12", "pronoun"),
    ("aqueles", "those (masculine)", "demonstratives", "aula-12", "pronoun"),
    ("aquelas", "those (feminine)", "demonstratives", "aula-12", "pronoun"),
    ("isto", "this (same idea as isso; also used in European Portuguese)", "demonstratives", "aula-12", "pronoun"),
    ("este", "this (same idea as esse)", "demonstratives", "aula-12", "pronoun"),
    ("esta", "this (same idea as essa)", "demonstratives", "aula-12", "pronoun"),
    ("disso", "of this / about this", "contractions", "aula-12-1", "pronoun"),
    ("desse", "of this (masculine)", "contractions", "aula-12-1", "pronoun"),
    ("dessa", "of this (feminine)", "contractions", "aula-12-1", "pronoun"),
    ("daquilo", "of that / about that", "contractions", "aula-12-1", "pronoun"),
    ("daquele", "of that (masculine)", "contractions", "aula-12-1", "pronoun"),
    ("daquela", "of that (feminine)", "contractions", "aula-12-1", "pronoun"),
    ("então", "then / so", "connectors", "aula-13-4", "adverb"),
    ("desde então", "since then", "connectors", "aula-13-4", "expression"),
    ("tão", "so / very", "connectors", "aula-13-4", "adverb"),
    ("tanto", "so much / so many", "connectors", "aula-13-4", "adverb"),
    ("tanto faz", "whatever / it doesn't matter", "expressions", "aula-13-4", "expression"),
    ("tanto quanto", "as much as", "expressions", "aula-13-4", "expression"),
    ("às vezes", "sometimes", "time", "aula-14", "expression"),
    ("de vez em quando", "sometimes / once in a while", "time", "aula-14", "expression"),
    ("de vez", "for good / permanently", "time", "aula-14", "expression"),
    ("toda hora", "all the time", "time", "aula-14", "expression"),
    ("quanto tempo", "how long", "time", "aula-14", "expression"),
    ("que horas", "what time", "time", "aula-14", "expression"),
    ("por isso", "that's why / because of this", "connectors", "aula-15-1", "expression"),
    ("por causa disso", "because of this", "connectors", "aula-15-1", "expression"),
    ("por causa daquilo", "because of that", "connectors", "aula-15-1", "expression"),
    ("devido a", "due to", "connectors", "aula-15-1", "preposition"),
    ("para", "to / for (goal, destination, opinion, deadline)", "prepositions", "aula-17", "preposition"),
    ("por", "by / per / for (duration) / through", "prepositions", "aula-17", "preposition"),
    ("pelo", "through the / by the / for the (masculine)", "prepositions", "aula-17", "preposition"),
    ("pela", "through the / by the / for the (feminine)", "prepositions", "aula-17", "preposition"),
    ("cedo", "early", "time", "aula-17-2", "adverb"),
    ("atrasado", "late (a person)", "time", "aula-17-2", "adjective"),
    ("de manhã", "in the morning", "time", "aula-17-2", "expression"),
    ("de tarde", "in the afternoon", "time", "aula-17-2", "expression"),
    ("de noite", "at night", "time", "aula-17-2", "expression"),
    ("hoje de noite", "tonight", "time", "aula-17-2", "expression"),
    ("ontem de manhã", "yesterday morning", "time", "aula-17-2", "expression"),
    ("amanhã de manhã", "tomorrow morning", "time", "aula-17-2", "expression"),
    ("cedo ou tarde", "sooner or later", "expressions", "aula-17-2", "expression"),
    ("a gente", "we (spoken Brazilian Portuguese)", "grammar", "aula-14-1", "pronoun"),
    ("lá", "there (far)", "directions", "aula-14-1", "adverb"),
    ("ali", "there (nearby)", "directions", "aula-14-1", "adverb"),
    ("aí", "there (where the listener is)", "directions", "aula-14-1", "adverb"),
    ("legal", "nice / cool", "adjectives", "aula-13", "adjective"),
    ("pra", "to / for (spoken contraction of para + a)", "prepositions", "aula-17", "preposition"),
    ("pro", "to / for (spoken contraction of para + o)", "prepositions", "aula-17", "preposition"),
]


def add_expressions(vocab: list[dict], seen: set[str]) -> None:
    for lemma, translation, category, lesson_id, pos in EXPRESSIONS:
        item_notes = None
        variant = None
        if lemma in {"isto", "este", "esta"}:
            variant = {
                "pt-BR": "Everyday Brazilian speech prefers isso, esse, and essa. The teacher says isto, este, and esta can be used the same way.",
                "pt-PT": "Isto, este, and esta are common in European Portuguese. The teacher treats them as equivalents of isso, esse, and essa.",
            }
        if lemma in {"pra", "pro", "a gente"}:
            variant = {
                "pt-BR": "Very common in spoken Brazilian Portuguese.",
                "pt-PT": "European Portuguese more often keeps para and uses nós rather than a gente.",
            }
        add_vocab(vocab, seen, lemma=lemma, translation=translation, category=category, lesson_id=lesson_id, pos=pos, notes=item_notes)
        if variant:
            vocab[-1]["variantNotes"] = variant


EN_HINTS = re.compile(
    r"\b(the|you|we|they|he|she|is|are|was|were|my|this|that|and|for|with|don't|didn't|i'm|it's|have|has|will|because|what|when|where|your|from|going|not)\b",
    re.I,
)
PT_HINTS = re.compile(
    r"[áàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]|\b(eu|não|nao|que|uma|está|estou|para|pra|por|com|meu|minha|esse|essa|aquele|aquela|isso|disso|ontem|hoje|amanhã)\b",
    re.I,
)
SKIP_LINE = re.compile(
    r"^(aula |leitura|exemplo|exerc[ií]cio|practic|freestyle|▶|english|portugu|passado |verbo|let's|notice|regular )",
    re.I,
)


def looks_english(line: str) -> bool:
    hits = EN_HINTS.findall(line)
    if PT_HINTS.search(line) and len(hits) < 2:
        return False
    letters = re.sub(r"[^A-Za-z]", "", line)
    if len(letters) < 3:
        return False
    if len(hits) >= 2:
        return True
    return line.isascii() and len(line.split()) >= 3 and len(hits) >= 1


def looks_portuguese(line: str) -> bool:
    if looks_english(line) and not PT_HINTS.search(line):
        return False
    return bool(PT_HINTS.search(line)) or (not line.isascii())


def extract_phrases() -> list[dict]:
    phrases = []
    seen = set()
    files = {
        "aula-12": "AULA 12 –*.docx",
        "aula-12-1": "AULA 12.1*.docx",
        "aula-13": "AULA 13 -*.docx",
        "aula-13-2": "AULA 13.2*.docx",
        "aula-13-3": "AULA 13.3*.docx",
        "aula-13-4": "AULA 13.4*.docx",
        "aula-14": "AULA 14 - VEZ*.docx",
        "aula-14-past": "AULA 14 – PAST*.docx",
        "aula-14-1": "AULA 14.1*.docx",
        "aula-14-2": "AULA 14.2*.docx",
        "aula-14-3": "AULA 14.3*.docx",
        "aula-15-1": "AULA 15.1*.docx",
        "aula-16-1": "AULA 16.1*.docx",
        "aula-17": "AULA 17 –*.docx",
        "aula-17-2": "AULA 17.2 - MANHÃ, TARDE & NOITE. ONTEM, HOJE & AMANHÃ. TARDE & CEDO.docx",
    }
    for lesson_id, pattern in files.items():
        matches = list(MATERIALS.glob(pattern))
        if not matches:
            continue
        path = matches[0]
        if " (1)" in path.name:
            continue
        lines = [ln for ln in docx_paragraphs(path) if not SKIP_LINE.search(ln) and len(ln) > 8 and not re.match(r"^\d+\.", ln)]
        i = 0
        while i < len(lines):
            current = lines[i].strip(" -")
            inline = re.split(r"\s+[–—-]\s+", current, maxsplit=1)
            if len(inline) == 2 and looks_portuguese(inline[0]) and looks_english(inline[1]):
                record_phrase(phrases, seen, inline[0], inline[1], lesson_id, "example")
                i += 1
                continue
            nxt = lines[i + 1].strip(" -") if i + 1 < len(lines) else ""
            third = lines[i + 2].strip(" -") if i + 2 < len(lines) else ""
            if nxt and third and looks_portuguese(current) and looks_portuguese(nxt) and looks_english(third) and not looks_portuguese(third):
                record_phrase(phrases, seen, nxt, third, lesson_id, "contrast", incorrect=current)
                i += 3
                continue
            if nxt and looks_portuguese(current) and looks_english(nxt) and not looks_portuguese(nxt):
                if len(current.split()) >= 3 and len(nxt.split()) >= 3:
                    record_phrase(phrases, seen, current, nxt, lesson_id, "example")
                i += 2
                continue
            i += 1
    return phrases


def record_phrase(phrases, seen, pt, en, lesson_id, kind, incorrect=None):
    pt = re.sub(r"\s+", " ", pt).strip(" .")
    en = re.sub(r"\s+", " ", en).strip(" .")
    if " = " in pt or " = " in en or len(pt) < 8 or len(en) < 8 or len(pt) > 220 or len(en) > 240:
        return
    if looks_portuguese(en) and not looks_english(en):
        return
    pt_words, en_words = len(pt.split()), len(en.split())
    if en_words > pt_words * 2.2 or pt_words > en_words * 2.2:
        return
    if en.isupper():
        en = en[:1] + en[1:].lower()
    if pt.isupper():
        pt = pt[:1] + pt[1:].lower()
    key = fold(pt)
    if key in seen:
        return
    seen.add(key)
    base_id = f"phrase-{slug(pt)[:48]}"
    phrase_id = base_id
    suffix = 2
    used_ids = getattr(record_phrase, "used_ids", set())
    record_phrase.used_ids = used_ids
    while phrase_id in used_ids:
        phrase_id = f"{base_id}-{suffix}"
        suffix += 1
    used_ids.add(phrase_id)
    item = {
        "id": phrase_id,
        "portuguese": pt if pt[-1] in ".?!" else pt + ".",
        "english": en[0].upper() + en[1:] if en else en,
        "lessonId": lesson_id,
        "category": lesson_category(lesson_id),
        "kind": kind,
    }
    if incorrect:
        item["incorrectForm"] = incorrect
        item["notes"] = "The first form is the uncontracted version the teacher marks as incorrect."
    if not item["english"].endswith((".", "!", "?")):
        item["english"] += "."
    phrases.append(item)


def lesson_category(lesson_id: str) -> str:
    for lesson in LESSONS:
        if lesson["id"] == lesson_id:
            return lesson["categories"][0]
    return "general"


def grammar_rules() -> list[dict]:
    return [
        {
            "id": "grammar-demonstratives",
            "lessonId": "aula-12",
            "title": "Isso, esse, essa / aquilo, aquele, aquela",
            "explanation": "Esse and essa point to something near the idea of 'this' and agree in gender. Aquilo and aquele/aquela point to 'that'. Use isso and aquilo when you do not know what the thing is, or when it is not a physical object, such as a situation or a piece of information. The teacher also lists isto, este, and esta as words that can be used the same way.",
            "patterns": [
                "esse + masculine noun",
                "essa + feminine noun",
                "isso = this (unspecified)",
                "aquele / aquela = that",
                "aquilo = that (unspecified)",
                "esses / essas = these",
                "aqueles / aquelas = those",
            ],
            "examples": [
                {"portuguese": "Essa menina é minha irmã.", "english": "This girl is my sister."},
                {"portuguese": "Eu não sei o que é isso.", "english": "I don't know what this is."},
                {"portuguese": "Aquele homem é meu pai.", "english": "That man is my father."},
                {"portuguese": "Aquilo não é verdade.", "english": "That is not true."},
            ],
            "variantNotes": {
                "pt-BR": "Everyday speech uses isso, esse, and essa.",
                "pt-PT": "Isto, este, and esta are more typical in European Portuguese. The lesson treats them as equivalents.",
            },
        },
        {
            "id": "grammar-de-contractions",
            "lessonId": "aula-12-1",
            "title": "Contractions with de",
            "explanation": "De combines with the demonstratives. Verbs and expressions that need de make the contraction mandatory. The teacher contrasts the split form, which should not be said, with the contracted form.",
            "patterns": [
                "de + isso = disso",
                "de + esse = desse / desses",
                "de + essa = dessa / dessas",
                "de + aquilo = daquilo",
                "de + aquele = daquele / daqueles",
                "de + aquela = daquela / daquelas",
            ],
            "examples": [
                {"portuguese": "Eu não gosto disso.", "english": "I don't like this."},
                {"portuguese": "Eu gosto muito desse livro.", "english": "I really like this book."},
                {"portuguese": "Eu sou dessa cidade.", "english": "I'm from this city."},
                {"portuguese": "Não gostei daquilo que vi.", "english": "I didn't like what I saw."},
            ],
            "exceptions": [
                {"wrong": "Eu não gosto de isso.", "right": "Eu não gosto disso."},
                {"wrong": "Eu gosto muito de esse livro.", "right": "Eu gosto muito desse livro."},
            ],
        },
        {
            "id": "grammar-verbs-with-de",
            "lessonId": "aula-12-1",
            "title": "Verbs and expressions that take de",
            "explanation": "These verbs keep the preposition de, which then contracts with the following article or demonstrative.",
            "patterns": [
                "precisar de = to need",
                "gostar de = to like",
                "saber de = to know about",
                "lembrar de = to remember",
                "rir de = to laugh at",
                "esquecer de = to forget",
                "cuidar de = to take care of",
                "duvidar de = to doubt",
                "aproximar de = to get closer to",
                "medo de = to be afraid of",
            ],
            "examples": [
                {"portuguese": "Eu estou com medo desse cachorro.", "english": "I'm afraid of this dog."},
                {"portuguese": "Não esqueça disso amanhã.", "english": "Don't forget about this tomorrow."},
            ],
        },
        {
            "id": "grammar-adjective-agreement",
            "lessonId": "aula-13",
            "title": "Adjective gender and emphasis",
            "explanation": "Adjectives agree with the noun. Many masculine forms end in -o and the feminine ends in -a. Muito means very or a lot. Um pouco means a little.",
            "patterns": ["masculine -o / feminine -a", "muito + adjective = very", "um pouco + adjective = a bit"],
            "examples": [
                {"portuguese": "Meu chefe é estressado.", "english": "My boss is stressed."},
                {"portuguese": "Essa casa é feia e suja.", "english": "This house is ugly and dirty."},
                {"portuguese": "Hoje está um pouco frio.", "english": "Today is a bit cold."},
            ],
        },
        {
            "id": "grammar-comparatives",
            "lessonId": "aula-13-2",
            "title": "Comparatives and superlatives",
            "explanation": "Mais or menos plus the adjective plus que or do que means more or less than. The superlative uses o, a, os, or as plus mais. Grande, pequeno, bom, and mau/ruim do not take mais.",
            "patterns": [
                "mais + adjective + (do) que",
                "menos + adjective + (do) que",
                "o/a mais + adjective",
                "maior, menor, melhor, pior",
            ],
            "examples": [
                {"portuguese": "O Brasil é maior do que a França.", "english": "Brazil is bigger than France."},
                {"portuguese": "Ela é mais alta do que eu.", "english": "She is taller than me."},
                {"portuguese": "São Paulo é a maior cidade do Brasil.", "english": "São Paulo is the biggest city in Brazil."},
                {"portuguese": "Caipirinha é a melhor bebida do bar.", "english": "Caipirinha is the best drink at the bar."},
            ],
            "exceptions": [
                {"wrong": "mais grande", "right": "maior", "note": "bigger"},
                {"wrong": "mais pequeno", "right": "menor", "note": "smaller"},
                {"wrong": "mais melhor", "right": "melhor", "note": "better"},
                {"wrong": "mais pior", "right": "pior", "note": "worse"},
            ],
        },
        {
            "id": "grammar-colors",
            "lessonId": "aula-13-3",
            "title": "Color agreement",
            "explanation": "Some colors agree in gender. Preto, branco, vermelho, amarelo, and roxo take -a in the feminine. Colors that are also nouns, such as rosa, laranja, and azul, stay invariable in these lessons.",
            "patterns": ["preto / preta", "branco / branca", "vermelho / vermelha", "amarelo / amarela"],
            "examples": [
                {"portuguese": "Meu carro é preto.", "english": "My car is black."},
                {"portuguese": "Minha cama é preta.", "english": "My bed is black."},
                {"portuguese": "O céu é azul.", "english": "The sky is blue."},
            ],
        },
        {
            "id": "grammar-entao-tao-tanto",
            "lessonId": "aula-13-4",
            "title": "Então, tão, and tanto",
            "explanation": "Então connects a sequence or a result: then or so. Desde então means since then. Tão intensifies an adjective: so. Tanto agrees: tanto, tanta, tantos, tantas. Tanto faz means it doesn't matter. Tanto quanto means as much as.",
            "patterns": ["então = then / so", "desde então = since then", "tão + adjective", "tanto/tanta/tantos/tantas", "tanto faz", "tanto quanto"],
            "examples": [
                {"portuguese": "Eu vou para a academia e então eu vou trabalhar.", "english": "I go to the gym and then I go to work."},
                {"portuguese": "Hoje está tão quente!", "english": "Today is so hot!"},
                {"portuguese": "Tanto faz, estou livre o dia todo.", "english": "Whatever, I'm free all day."},
                {"portuguese": "Ele precisa de ajuda tanto quanto eu.", "english": "He needs help as much as I do."},
            ],
        },
        {
            "id": "grammar-time-words",
            "lessonId": "aula-14",
            "title": "Tempo, vez, época, hora, horário, clima",
            "explanation": "Tempo asks how long and also means weather. Vez is an occasion or a turn. Às vezes and de vez em quando mean sometimes. De vez means for good. Época is a period or season. Hora is clock time. Horário is a schedule or appointment. Clima is weather, mood, or vibe.",
            "patterns": ["quanto tempo? = how long?", "que horas? = what time?", "às vezes = sometimes", "de vez = for good", "toda hora = all the time"],
            "examples": [
                {"portuguese": "Quanto tempo você vai ficar aqui?", "english": "How long will you stay here?"},
                {"portuguese": "Essa é minha primeira vez em São Paulo.", "english": "This is my first time in São Paulo."},
                {"portuguese": "Que horas são?", "english": "What time is it?"},
                {"portuguese": "O clima da festa estava super animado.", "english": "The party atmosphere was really lively."},
            ],
        },
        {
            "id": "grammar-preterite",
            "lessonId": "aula-14-past",
            "title": "Regular simple past",
            "explanation": "Regular verbs are grouped by the infinitive ending. In the preterite, -ar verbs use -ei, -ou, -amos, -aram. -er verbs use -i, -eu, -emos, -eram. -ir verbs use -i, -iu, -imos, -iram. The lesson also shows the present and the present continuous (estar + gerund) next to the past.",
            "patterns": ["-ar: falei, falou, falamos, falaram", "-er: comi, comeu, comemos, comeram", "-ir: dormi, dormiu, dormimos, dormiram", "present continuous = estar + gerund"],
            "examples": [
                {"portuguese": "Eu falei com ela ontem.", "english": "I spoke to her yesterday."},
                {"portuguese": "Eu comi comida japonesa ontem.", "english": "I ate Japanese food yesterday."},
                {"portuguese": "Eu saí de casa ontem.", "english": "I left home yesterday."},
            ],
        },
        {
            "id": "grammar-foi-era-estava",
            "lessonId": "aula-14-1",
            "title": "Foi, era, and estava",
            "explanation": "Estar in the imperfect (estava) is for location, emotions, and actions in progress. Ser in the imperfect (era) is for what something was like over a long period. Ser in the preterite (foi) is for a single event or situation that is over.",
            "patterns": ["estava = location, feelings, ongoing actions", "era = lasting description or role", "foi = one completed situation"],
            "examples": [
                {"portuguese": "Eu estava na academia.", "english": "I was at the gym."},
                {"portuguese": "Quando eu era criança, eu era muito tímido.", "english": "When I was a child, I was very shy."},
                {"portuguese": "A festa foi boa.", "english": "The party was good."},
                {"portuguese": "Ontem foi um dia muito especial.", "english": "Yesterday was a very special day."},
            ],
        },
        {
            "id": "grammar-imperfect",
            "lessonId": "aula-14-2",
            "title": "Perfeito versus imperfeito",
            "explanation": "The preterite states one finished action. The imperfect states a habit or something that continued in the past. Costumar plus the infinitive is another way to say used to.",
            "patterns": ["-ar imperfect: falava", "-er/-ir imperfect: bebia, dormia", "eu costumava + infinitive = I used to"],
            "examples": [
                {"portuguese": "Eu conversei com ela ontem.", "english": "I talked to her yesterday."},
                {"portuguese": "Eu conversava muito com ela na universidade.", "english": "I used to talk to her a lot at university."},
                {"portuguese": "Eu costumava viajar sozinho.", "english": "I used to travel by myself."},
            ],
        },
        {
            "id": "grammar-participle",
            "lessonId": "aula-14-3",
            "title": "Participle and passive voice",
            "explanation": "Ser plus the participle makes a passive sentence. The participle agrees with the subject. Regular -ar participles end in -ado/-ada, and regular -er/-ir participles end in -ido/-ida. Several common verbs are irregular, including aberto, escrito, feito, dito, and visto.",
            "patterns": ["ser + participle", "comprado / vendido / feito", "pelo / pela = by the"],
            "examples": [
                {"portuguese": "O carro foi comprado pelo vizinho.", "english": "The car was bought by the neighbor."},
                {"portuguese": "O vizinho comprou o carro.", "english": "The neighbor bought the car."},
                {"portuguese": "A música foi cantada no show.", "english": "The song was sung at the concert."},
            ],
        },
        {
            "id": "grammar-por-isso",
            "lessonId": "aula-15-1",
            "title": "Por isso, por causa, devido a",
            "explanation": "Por isso means that's why. Por causa disso, desse, dessa, daquilo, daquele, or daquela means because of this or that. Devido a, and the contraction devido ao, means due to.",
            "patterns": ["por isso = that's why", "por causa de = because of", "devido a / devido ao = due to"],
            "examples": [
                {"portuguese": "Ele está cansado e por isso não quer ir na festa.", "english": "He's tired and that's why he doesn't want to go to the party."},
                {"portuguese": "Por causa da chuva, eu não vou viajar.", "english": "Because of the rain, I won't travel."},
                {"portuguese": "Devido à chuva, eu não vou viajar.", "english": "Due to the rain, I won't travel."},
            ],
        },
        {
            "id": "grammar-ordinals",
            "lessonId": "aula-16-1",
            "title": "Ordinal numbers",
            "explanation": "Ordinals agree in gender: primeiro/primeira, décimo/décima. They are used for position, the floor of a building, and the nth time something happens. Último means the last one.",
            "patterns": ["primeiro, segundo, terceiro…", "décimo primeiro = 11th", "vigésimo = 20th", "último / última = last"],
            "examples": [
                {"portuguese": "Meu apartamento fica no sétimo andar.", "english": "My apartment is on the seventh floor."},
                {"portuguese": "Essa é a vigésima vez que vou ao Brasil.", "english": "This is the twentieth time I've been to Brazil."},
            ],
        },
        {
            "id": "grammar-para-por",
            "lessonId": "aula-17",
            "title": "Para and por",
            "explanation": "Para covers a goal, a destination, an opinion, and a deadline. Por covers the agent of a passive, a rate, a length of time, a reason, and movement through or around. Por contracts with articles: pelo, pela, pelos, pelas. Spoken Brazilian Portuguese often uses pra and pro.",
            "patterns": [
                "para + infinitive = in order to",
                "para + place = destination",
                "para mim = in my opinion / for me",
                "por + period = for a length of time",
                "por + agent = by",
                "por + o = pelo",
                "por + a = pela",
            ],
            "examples": [
                {"portuguese": "Eu estou no Brasil para aprender português.", "english": "I'm in Brazil to learn Portuguese."},
                {"portuguese": "O bolo foi feito por mim.", "english": "The cake was made by me."},
                {"portuguese": "Eu vou ficar no Brasil por duas semanas.", "english": "I will stay in Brazil for two weeks."},
                {"portuguese": "Eu vou caminhar pelo parque.", "english": "I'll walk through the park."},
            ],
            "variantNotes": {
                "pt-BR": "Pra and pro are the usual spoken contractions of para a and para o.",
                "pt-PT": "European Portuguese usually keeps para a and para o in this lesson's patterns.",
            },
        },
        {
            "id": "grammar-time-of-day",
            "lessonId": "aula-17-2",
            "title": "Parts of the day, and late versus early",
            "explanation": "De manhã, de tarde, and de noite say when something happens. Ontem, hoje, and amanhã combine with those parts of the day. Está tarde means the hour is late. Estou atrasado means the person is late. Cedo means early.",
            "patterns": [
                "de manhã / pela manhã = in the morning",
                "de tarde / pela tarde = in the afternoon",
                "de noite / pela noite = at night",
                "está tarde = it's late",
                "eu estou atrasado = I'm late",
                "cedo = early",
            ],
            "examples": [
                {"portuguese": "Hoje eu não vou trabalhar de manhã.", "english": "Today I won't work in the morning."},
                {"portuguese": "Eles foram na biblioteca ontem à noite.", "english": "They went to the library last night."},
                {"portuguese": "Eu perdi o trem porque eu estava atrasado.", "english": "I missed the train because I was late."},
            ],
            "exceptions": [
                {"wrong": "Eu estou tarde.", "right": "Eu estou atrasado.", "note": "A person is atrasado. The hour is tarde."},
                {"wrong": "Estou atrasado para say the clock is late.", "right": "Está tarde.", "note": "It's late."},
            ],
        },
        {
            "id": "grammar-distinctions",
            "lessonId": "aula-14",
            "title": "Pairs the lessons keep apart",
            "explanation": "The notes repeatedly separate words that look similar in English.",
            "patterns": [
                "passar = spend time; gastar = spend money",
                "saber = know a fact; conhecer = know a person or place",
                "poder = permission or possibility; conseguir = ability",
                "muro = outside wall; parede = inside wall",
                "lá = there far; ali = there nearby; aí = there where you are",
                "mais = more; mas = but",
            ],
            "examples": [
                {"portuguese": "Eu passo muito tempo cozinhando.", "english": "I spend a lot of time cooking."},
                {"portuguese": "Eu não conheço esse lugar.", "english": "I don't know this place."},
            ],
        },
    ]


IRREGULAR = {
    "ir": {
        "ending": "irregular",
        "translation": "to go",
        "preterite": {"eu": "fui", "ele-ela-voce": "foi", "nos": "fomos", "eles-elas-voces": "foram"},
        "imperfect": {"eu": "ia", "ele-ela-voce": "ia", "nos": "íamos", "eles-elas-voces": "iam"},
        "participle": "ido",
    },
    "ser": {
        "ending": "irregular",
        "translation": "to be (identity, lasting traits)",
        "preterite": {"eu": "fui", "ele-ela-voce": "foi", "nos": "fomos", "eles-elas-voces": "foram"},
        "imperfect": {"eu": "era", "ele-ela-voce": "era", "nos": "éramos", "eles-elas-voces": "eram"},
        "participle": "sido",
    },
    "estar": {
        "ending": "irregular",
        "translation": "to be (state, location, ongoing)",
        "preterite": {"eu": "estive", "ele-ela-voce": "esteve", "nos": "estivemos", "eles-elas-voces": "estiveram"},
        "imperfect": {"eu": "estava", "ele-ela-voce": "estava", "nos": "estávamos", "eles-elas-voces": "estavam"},
        "participle": "estado",
        "notes": "The lesson focuses on the imperfect estava for location, feelings, and actions in progress. The preterite estive is mentioned beside estava.",
    },
    "trazer": {
        "ending": "irregular",
        "translation": "to bring",
        "preterite": {"eu": "trouxe", "ele-ela-voce": "trouxe", "nos": "trouxemos", "eles-elas-voces": "trouxeram"},
        "imperfect": {"eu": "trazia", "ele-ela-voce": "trazia", "nos": "trazíamos", "eles-elas-voces": "traziam"},
        "participle": "trazido",
    },
    "ver": {
        "ending": "irregular",
        "translation": "to see",
        "preterite": {"eu": "vi", "ele-ela-voce": "viu", "nos": "vimos", "eles-elas-voces": "viram"},
        "imperfect": {"eu": "via", "ele-ela-voce": "via", "nos": "víamos", "eles-elas-voces": "viam"},
        "participle": "visto",
    },
    "fazer": {
        "ending": "irregular",
        "translation": "to do / to make",
        "preterite": {"eu": "fiz", "ele-ela-voce": "fez", "nos": "fizemos", "eles-elas-voces": "fizeram"},
        "imperfect": {"eu": "fazia", "ele-ela-voce": "fazia", "nos": "fazíamos", "eles-elas-voces": "faziam"},
        "participle": "feito",
    },
    "ter": {
        "ending": "irregular",
        "translation": "to have",
        "preterite": {"eu": "tive", "ele-ela-voce": "teve", "nos": "tivemos", "eles-elas-voces": "tiveram"},
        "imperfect": {"eu": "tinha", "ele-ela-voce": "tinha", "nos": "tínhamos", "eles-elas-voces": "tinham"},
        "participle": "tido",
    },
    "dizer": {
        "ending": "irregular",
        "translation": "to say",
        "preterite": {"eu": "disse", "ele-ela-voce": "disse", "nos": "dissemos", "eles-elas-voces": "disseram"},
        "imperfect": {"eu": "dizia", "ele-ela-voce": "dizia", "nos": "dizíamos", "eles-elas-voces": "diziam"},
        "participle": "dito",
    },
    "pedir": {
        "ending": "irregular",
        "translation": "to ask / to order",
        "preterite": {"eu": "pedi", "ele-ela-voce": "pediu", "nos": "pedimos", "eles-elas-voces": "pediram"},
        "imperfect": {"eu": "pedia", "ele-ela-voce": "pedia", "nos": "pedíamos", "eles-elas-voces": "pediam"},
        "participle": "pedido",
    },
    "saber": {
        "ending": "irregular",
        "translation": "to know (a fact)",
        "preterite": {"eu": "soube", "ele-ela-voce": "soube", "nos": "soubemos", "eles-elas-voces": "souberam"},
        "imperfect": {"eu": "sabia", "ele-ela-voce": "sabia", "nos": "sabíamos", "eles-elas-voces": "sabiam"},
        "participle": "sabido",
    },
    "ler": {
        "ending": "er",
        "translation": "to read",
        "preterite": {"eu": "li", "ele-ela-voce": "leu", "nos": "lemos", "eles-elas-voces": "leram"},
        "imperfect": {"eu": "lia", "ele-ela-voce": "lia", "nos": "líamos", "eles-elas-voces": "liam"},
        "participle": "lido",
    },
    "ouvir": {
        "ending": "ir",
        "translation": "to hear",
        "participle": "ouvido",
    },
    "manter": {
        "ending": "irregular",
        "translation": "to keep",
        "preterite": {"eu": "mantive", "ele-ela-voce": "manteve", "nos": "mantivemos", "eles-elas-voces": "mantiveram"},
        "imperfect": {"eu": "mantinha", "ele-ela-voce": "mantinha", "nos": "mantínhamos", "eles-elas-voces": "mantinham"},
        "participle": "mantido",
    },
    "dirigir": {
        "ending": "ir",
        "translation": "to drive",
        "participle": "dirigido",
    },
    "dar": {
        "ending": "irregular",
        "translation": "to give",
        "preterite": {"eu": "dei", "ele-ela-voce": "deu", "nos": "demos", "eles-elas-voces": "deram"},
        "participle": "dado",
    },
    "vir": {
        "ending": "irregular",
        "translation": "to come",
        "preterite": {"eu": "vim", "ele-ela-voce": "veio", "nos": "viemos", "eles-elas-voces": "vieram"},
        "imperfect": {"eu": "vinha", "ele-ela-voce": "vinha", "nos": "vínhamos", "eles-elas-voces": "vinham"},
        "participle": "vindo",
    },
    "caber": {
        "ending": "irregular",
        "translation": "to fit",
        "preterite": {"eu": "coube", "ele-ela-voce": "coube", "nos": "coubemos", "eles-elas-voces": "couberam"},
        "participle": "cabido",
    },
    "pôr": {
        "ending": "irregular",
        "translation": "to put",
        "participle": "posto",
    },
    "abrir": {"ending": "ir", "translation": "to open", "participle": "aberto"},
    "escrever": {"ending": "er", "translation": "to write", "participle": "escrito"},
    "cobrir": {"ending": "ir", "translation": "to cover", "participle": "coberto"},
    "descobrir": {"ending": "ir", "translation": "to discover", "participle": "descoberto"},
    "ganhar": {"ending": "ar", "translation": "to win", "participle": "ganho"},
    "gastar": {"ending": "ar", "translation": "to spend money", "participle": "gastado"},
    "pagar": {"ending": "ar", "translation": "to pay", "participle": "pago"},
    "morrer": {"ending": "er", "translation": "to die", "participle": "morto"},
    "nascer": {"ending": "er", "translation": "to be born", "participle": "nascido"},
    "aceitar": {"ending": "ar", "translation": "to accept", "participle": "aceito"},
    "entregar": {"ending": "ar", "translation": "to deliver", "participle": "entregue"},
    "imprimir": {"ending": "ir", "translation": "to print", "participle": "impresso"},
}

REGULAR_VERBS = [
    ("falar", "to speak", "ar", "aula-14-past"),
    ("morar", "to live", "ar", "aula-14-past"),
    ("cozinhar", "to cook", "ar", "aula-14-past"),
    ("amar", "to love", "ar", "aula-14-past"),
    ("nadar", "to swim", "ar", "aula-14-past"),
    ("limpar", "to clean", "ar", "aula-14-past"),
    ("estudar", "to study", "ar", "aula-14-past"),
    ("trabalhar", "to work", "ar", "aula-14-past"),
    ("comprar", "to buy", "ar", "aula-14-2"),
    ("fechar", "to close", "ar", "aula-14-2"),
    ("acordar", "to wake up", "ar", "aula-14-2"),
    ("convidar", "to invite", "ar", "aula-14-2"),
    ("visitar", "to visit", "ar", "aula-14-2"),
    ("esperar", "to wait / to hope", "ar", "aula-14-2"),
    ("sonhar", "to dream", "ar", "aula-14-2"),
    ("lavar", "to wash", "ar", "aula-14-2"),
    ("andar", "to walk", "ar", "aula-14-2"),
    ("enviar", "to send", "ar", "aula-14-2"),
    ("conversar", "to talk", "ar", "aula-14-2"),
    ("ajudar", "to help", "ar", "aula-14-past"),
    ("quebrar", "to break", "ar", "aula-14-past"),
    ("fumar", "to smoke", "ar", "aula-14-past"),
    ("chorar", "to cry", "ar", "aula-14-past"),
    ("casar", "to marry", "ar", "aula-14-past"),
    ("começar", "to start", "ar", "aula-14"),
    ("mudar", "to move / to change", "ar", "aula-14-past"),
    ("precisar", "to need", "ar", "aula-12-1"),
    ("gostar", "to like", "ar", "aula-12-1"),
    ("lembrar", "to remember", "ar", "aula-12-1"),
    ("esquecer", "to forget", "ar", "aula-12-1"),
    ("cuidar", "to take care", "ar", "aula-12-1"),
    ("usar", "to use / to wear", "ar", "aula-14-3"),
    ("chamar", "to call", "ar", "aula-14-3"),
    ("ficar", "to stay / to become", "ar", "aula-14"),
    ("chegar", "to arrive", "ar", "aula-14-2"),
    ("passar", "to spend time / to pass", "ar", "aula-14"),
    ("cortar", "to cut", "ar", "aula-14-3"),
    ("cantar", "to sing", "ar", "aula-14-3"),
    ("vender", "to sell", "er", "aula-14-3"),
    ("comer", "to eat", "er", "aula-14-past"),
    ("beber", "to drink", "er", "aula-14-past"),
    ("aprender", "to learn", "er", "aula-14-past"),
    ("entender", "to understand", "er", "aula-14-past"),
    ("escolher", "to choose", "er", "aula-14-past"),
    ("correr", "to run", "er", "aula-14-2"),
    ("conhecer", "to know (a person or place)", "er", "aula-12"),
    ("descer", "to go down", "er", "aula-14-3"),
    ("sofrer", "to suffer", "er", "aula-14-past"),
    ("dormir", "to sleep", "ir", "aula-14-past"),
    ("sair", "to leave / to go out", "ir", "aula-14-past"),
    ("assistir", "to watch", "ir", "aula-14-past"),
    ("dividir", "to divide / to share", "ir", "aula-14-past"),
    ("vestir", "to wear", "ir", "aula-14-past"),
    ("mentir", "to lie", "ir", "aula-14-past"),
    ("confundir", "to confuse", "ir", "aula-14-past"),
    ("sentir", "to feel", "ir", "aula-14-3"),
    ("partir", "to leave", "ir", "aula-14-3"),
    ("repetir", "to repeat", "ir", "aula-14"),
    ("preferir", "to prefer", "ir", "aula-15-1"),
    ("decidir", "to decide", "ir", "aula-15-1"),
    ("conseguir", "to be able to / to manage", "ir", "aula-15-1"),
    ("construir", "to build", "ir", "aula-14-3"),
    ("discutir", "to discuss", "ir", "aula-14-3"),
    ("compartilhar", "to share", "ar", "aula-14-past"),
    ("malhar", "to work out", "ar", "aula-17"),
    ("viajar", "to travel", "ar", "aula-14-2"),
    ("costumar", "to used to", "ar", "aula-14-2"),
]

PREPOSITIONS = {
    "gostar": "de",
    "precisar": "de",
    "lembrar": "de",
    "esquecer": "de",
    "cuidar": "de",
    "saber": "de",
    "rir": "de",
}

PARTICIPLES = {
    "abrir": "aberto",
    "aceitar": "aceito",
    "fechar": "fechado",
    "pagar": "pago",
    "limpar": "limpo",
    "beber": "bebido",
    "acordar": "acordado",
    "jogar": "jogado",
    "colocar": "colocado",
    "dividir": "dividido",
    "usar": "usado",
    "dormir": "dormido",
    "convidar": "convidado",
    "descobrir": "descoberto",
    "falar": "falado",
    "escrever": "escrito",
    "imprimir": "impresso",
    "ler": "lido",
    "ouvir": "ouvido",
    "correr": "corrido",
    "nadar": "nadado",
    "viajar": "viajado",
    "cozinhar": "cozido",
    "esquecer": "esquecido",
    "ganhar": "ganho",
    "perder": "perdido",
    "morrer": "morto",
    "dirigir": "dirigido",
    "fazer": "feito",
    "ver": "visto",
    "dizer": "dito",
    "pôr": "posto",
    "vir": "vindo",
    "entregar": "entregue",
    "sentir": "sentido",
    "cantar": "cantado",
    "comprar": "comprado",
    "vender": "vendido",
    "estudar": "estudado",
    "construir": "construído",
    "eleger": "eleito",
}


def regular_forms(infinitive: str, ending: str, tense: str) -> dict[str, str]:
    stem = infinitive[: -len(ending)] if infinitive.endswith(ending) else infinitive[:-2]
    if tense == "preterite":
        table = {
            "ar": ("ei", "ou", "amos", "aram"),
            "er": ("i", "eu", "emos", "eram"),
            "ir": ("i", "iu", "imos", "iram"),
        }[ending]
    else:
        if ending == "ar":
            table = ("ava", "ava", "ávamos", "avam")
        else:
            table = ("ia", "ia", "íamos", "iam")
    keys = ["eu", "ele-ela-voce", "nos", "eles-elas-voces"]
    return dict(zip(keys, [stem + suffix for suffix in table]))


def gerund(infinitive: str, ending: str) -> str:
    stem = infinitive[:-2]
    if ending == "ar":
        return stem + "ando"
    if ending == "er":
        return stem + "endo"
    return stem + "indo"


def build_verbs() -> list[dict]:
    verbs = []
    seen = set()

    def push(infinitive: str, translation: str, ending: str, lesson_id: str, extra=None):
        if infinitive in seen:
            return
        seen.add(infinitive)
        extra = extra or {}
        actual_ending = extra.get("ending", ending if ending in {"ar", "er", "ir"} else "irregular")
        conjugations = []
        if extra.get("preterite"):
            conjugations.append({"tense": "preterite", "forms": [{"person": p, "form": f} for p, f in extra["preterite"].items()]})
        elif actual_ending in {"ar", "er", "ir"}:
            forms = regular_forms(infinitive, actual_ending, "preterite")
            conjugations.append({"tense": "preterite", "forms": [{"person": p, "form": f} for p, f in forms.items()]})
        if extra.get("imperfect"):
            conjugations.append({"tense": "imperfect", "forms": [{"person": p, "form": f} for p, f in extra["imperfect"].items()]})
        elif actual_ending in {"ar", "er", "ir"}:
            forms = regular_forms(infinitive, actual_ending, "imperfect")
            conjugations.append({"tense": "imperfect", "forms": [{"person": p, "form": f} for p, f in forms.items()]})
        if actual_ending in {"ar", "er", "ir"} or infinitive in IRREGULAR:
            g_ending = actual_ending if actual_ending in {"ar", "er", "ir"} else ("ar" if infinitive.endswith("ar") else "er" if infinitive.endswith("er") else "ir")
            if infinitive not in {"ser", "ir", "ter", "vir", "pôr", "caber"}:
                conjugations.append({"tense": "present-continuous", "forms": [{"person": "gerund", "form": gerund(infinitive, g_ending)}]})
        participle = extra.get("participle") or PARTICIPLES.get(infinitive)
        item = {
            "id": f"verb-{slug(infinitive)}",
            "infinitive": infinitive,
            "translation": translation,
            "ending": actual_ending if actual_ending in {"ar", "er", "ir", "irregular"} else "irregular",
            "lessonIds": [lesson_id],
            "conjugations": conjugations,
            "examples": [],
        }
        if participle:
            item["participle"] = participle
        if infinitive in PREPOSITIONS:
            item["preposition"] = PREPOSITIONS[infinitive]
        if extra.get("notes"):
            item["notes"] = extra["notes"]
        if infinitive == "costumar":
            item["notes"] = "Costumar + infinitive means used to. Eu costumava viajar sozinho."
        verbs.append(item)

    for infinitive, translation, ending, lesson_id in REGULAR_VERBS:
        irregular = IRREGULAR.get(infinitive) or {}
        push(infinitive, irregular.get("translation", translation), ending, lesson_id, irregular)
    for infinitive, data in IRREGULAR.items():
        if not data:
            continue
        push(infinitive, data["translation"], data.get("ending", "irregular"), "aula-14-past", data)
    # extra participles that are not already verbs
    extras = [
        ("jogar", "to play", "ar", "aula-14-3"),
        ("colocar", "to put", "ar", "aula-14-3"),
        ("aprender", "to learn", "er", "aula-14-past"),
        ("responder", "to answer", "er", "aula-14-3"),
        ("receber", "to receive", "er", "aula-14-3"),
        ("perder", "to lose", "er", "aula-14-past"),
        ("eleger", "to elect", "er", "aula-14-3"),
        ("consertar", "to fix", "ar", "aula-14-3"),
        ("ensinar", "to teach", "ar", "aula-14-3"),
        ("pintar", "to paint", "ar", "aula-14-3"),
        ("fritar", "to fry", "ar", "aula-14-3"),
        ("votar", "to vote", "ar", "aula-14-3"),
        ("defender", "to defend", "er", "aula-14-3"),
        ("carregar", "to charge / to carry", "ar", "aula-14-3"),
        ("abraçar", "to hug", "ar", "aula-14-3"),
        ("bater", "to hit", "er", "aula-14-3"),
        ("trocar", "to switch / to replace", "ar", "aula-16-1"),
        ("ligar", "to call", "ar", "aula-14"),
        ("marcar", "to set / to mark", "ar", "aula-14"),
        ("almoçar", "to have lunch", "ar", "aula-17-2"),
        ("jantar", "to have dinner", "ar", "aula-17-2"),
        ("emprestar", "to lend", "ar", "aula-17-2"),
        ("devolver", "to return (an object)", "er", "aula-17-2"),
        ("contratar", "to hire", "ar", "aula-17-2"),
    ]
    for row in extras:
        push(*row)
    return verbs


FILL_BLANKS = [
    ("Eu não gosto ___.", "disso", ["de isso", "este", "nele"], "aula-12-1", ["contractions", "prepositions"], "I don't like this."),
    ("Eu sou ___ cidade.", "dessa", ["de essa", "nessa", "desta"], "aula-12-1", ["contractions"], "I'm from this city."),
    ("Não esqueça ___ amanhã.", "disso", ["de isso", "nisto", "isso"], "aula-12-1", ["contractions"], "Don't forget about this tomorrow."),
    ("O dono ___ carro é meu amigo.", "daquele", ["de aquele", "nesse", "aquele"], "aula-12-1", ["contractions"], "The owner of that car is my friend."),
    ("___ menina é minha irmã.", "Essa", ["Esse", "Aquilo", "Aquele"], "aula-12", ["demonstratives"], "This girl is my sister."),
    ("Eu não sei o que é ___.", "isso", ["esse", "essa", "aquele"], "aula-12", ["demonstratives"], "I don't know what this is."),
    ("O Brasil é ___ do que a França.", "maior", ["mais grande", "mais maior", "grande"], "aula-13-2", ["comparatives"], "Brazil is bigger than France."),
    ("Chocolate é ___ do que caramelo.", "melhor", ["mais bom", "mais melhor", "bom"], "aula-13-2", ["comparatives"], "Chocolate is better than caramel."),
    ("Minha cama é ___.", "preta", ["preto", "preto a", "pretas"], "aula-13-3", ["colors"], "My bed is black."),
    ("Hoje está ___ quente!", "tão", ["tanto", "então", "muitos"], "aula-13-4", ["connectors"], "Today is so hot!"),
    ("___ faz, estou livre o dia todo.", "Tanto", ["Tão", "Então", "Tanta"], "aula-13-4", ["expressions"], "Whatever, I'm free all day."),
    ("___ tempo você vai ficar aqui?", "Quanto", ["Que horas", "Quando", "Tanto"], "aula-14", ["time"], "How long will you stay here?"),
    ("___ horas são?", "Que", ["Quanto", "Qual", "Como"], "aula-14", ["time"], "What time is it?"),
    ("Eu ___ com ela ontem.", "falei", ["falo", "falava", "falado"], "aula-14-past", ["conjugation"], "I spoke to her yesterday."),
    ("Eu ___ comida japonesa ontem.", "comi", ["como", "comia", "comido"], "aula-14-past", ["conjugation"], "I ate Japanese food yesterday."),
    ("Eu ___ de casa ontem.", "saí", ["saio", "saía", "saído"], "aula-14-past", ["conjugation"], "I left home yesterday."),
    ("Eu ___ na academia.", "estava", ["era", "foi", "estive"], "aula-14-1", ["ser", "estar"], "I was at the gym."),
    ("A festa ___ boa.", "foi", ["era", "estava", "fui"], "aula-14-1", ["ser", "estar"], "The party was good."),
    ("Quando eu ___ criança, eu era tímido.", "era", ["foi", "estava", "sou"], "aula-14-1", ["ser", "estar"], "When I was a child, I was shy."),
    ("Eu ___ muito com ela na universidade.", "conversava", ["conversei", "converso", "conversado"], "aula-14-2", ["conjugation"], "I used to talk to her a lot at university."),
    ("O carro foi ___ pelo vizinho.", "comprado", ["comprou", "comprar", "compra"], "aula-14-3", ["participle"], "The car was bought by the neighbor."),
    ("Ele está cansado e ___ não quer ir na festa.", "por isso", ["por aquilo de", "para isso", "devido"], "aula-15-1", ["connectors"], "He's tired and that's why he doesn't want to go to the party."),
    ("Eu estou no Brasil ___ aprender português.", "para", ["por", "pelo", "de"], "aula-17", ["prepositions"], "I'm in Brazil to learn Portuguese."),
    ("Eu vou ficar no Brasil ___ duas semanas.", "por", ["para", "pela", "pra"], "aula-17", ["prepositions"], "I will stay in Brazil for two weeks."),
    ("Eu vou caminhar ___ parque.", "pelo", ["para o", "pela", "por a"], "aula-17", ["prepositions"], "I'll walk through the park."),
    ("O almoço foi feito ___ mim.", "por", ["para", "pra", "de"], "aula-17", ["prepositions"], "Lunch was made by me."),
    ("Hoje eu não vou trabalhar ___ manhã.", "de", ["a", "para", "em a"], "aula-17-2", ["time"], "Today I won't work in the morning."),
    ("Eu perdi o trem porque eu estava ___.", "atrasado", ["tarde", "cedo", "hora"], "aula-17-2", ["time"], "I missed the train because I was late."),
    ("___ tarde.", "Está", ["Estou", "Sou", "Fui"], "aula-17-2", ["time"], "It's late."),
]


def build_quizzes(vocab: list[dict], phrases: list[dict], verbs: list[dict]) -> list[dict]:
    quizzes = []
    by_cat: dict[str, list[dict]] = {}
    for item in vocab:
        if item["translation"] and item["partOfSpeech"] != "verb":
            by_cat.setdefault(item["category"], []).append(item)
    n = 0
    for category, items in by_cat.items():
        pool = items[:12]
        for item in pool:
            distractors = [other["translation"] for other in pool if other["id"] != item["id"]][:3]
            if len(distractors) < 3:
                continue
            n += 1
            quizzes.append({
                "id": f"quiz-mc-{n}",
                "type": "multiple-choice",
                "prompt": item["lemma"],
                "promptLang": "pt",
                "answer": item["translation"],
                "options": distractors,
                "lessonId": item["lessonId"],
                "tags": [category, "vocabulary"],
                "source": "generated",
                "focus": "vocabulary",
            })
    for index, (blank, answer, wrongs, lesson_id, tags, prompt) in enumerate(FILL_BLANKS, start=1):
        quizzes.append({
            "id": f"quiz-blank-{index}",
            "type": "fill-blank",
            "prompt": prompt,
            "promptLang": "en",
            "answer": answer,
            "acceptableAnswers": [answer.lower(), answer],
            "options": wrongs,
            "blankSentence": blank,
            "lessonId": lesson_id,
            "tags": tags,
            "source": "exercise",
            "focus": "grammar" if "conjugation" not in tags else "conjugation",
        })
    builders = [p for p in phrases if 4 <= len(p["portuguese"].replace(".", "").split()) <= 9 and p["kind"] == "example"]
    for index, phrase in enumerate(builders[:40], start=1):
        tokens = phrase["portuguese"].replace(".", "").replace("?", "").replace("!", "").split()
        quizzes.append({
            "id": f"quiz-build-{index}",
            "type": "sentence-builder",
            "prompt": phrase["english"],
            "promptLang": "en",
            "answer": " ".join(tokens),
            "tokens": tokens,
            "lessonId": phrase["lessonId"],
            "tags": [phrase["category"], "sentence"],
            "source": "generated",
            "focus": "phrase",
        })
    verb_quiz_sources = [v for v in verbs if any(c["tense"] == "preterite" for c in v["conjugations"])][:24]
    for index, verb in enumerate(verb_quiz_sources, start=1):
        forms = next(c for c in verb["conjugations"] if c["tense"] == "preterite")["forms"]
        eu = next(f["form"] for f in forms if f["person"] == "eu")
        others = [f["form"] for f in forms if f["form"] != eu][:3]
        if len(others) < 3:
            continue
        quizzes.append({
            "id": f"quiz-verb-{index}",
            "type": "multiple-choice",
            "prompt": f"Eu ___ ({verb['infinitive']}) ontem.",
            "promptLang": "pt",
            "answer": eu,
            "options": others,
            "lessonId": verb["lessonIds"][0],
            "tags": ["verbs", verb["ending"]],
            "source": "generated",
            "focus": "conjugation",
        })
    return quizzes


def attach_examples(vocab: list[dict], phrases: list[dict]) -> None:
    for item in vocab:
        lemma = fold(item["lemma"])
        if len(lemma) < 4:
            continue
        pattern = re.compile(rf"\b{re.escape(lemma)}\b", re.I)
        for phrase in phrases:
            if pattern.search(fold(phrase["portuguese"])):
                item["examples"].append({"portuguese": phrase["portuguese"], "english": phrase["english"]})
                if len(item["examples"]) >= 1:
                    break


def main() -> None:
    vocab: list[dict] = []
    seen: set[str] = set()
    missing = parse_vocab_file(vocab, seen)
    parse_adjectives(vocab, seen)
    parse_colors(vocab, seen)
    add_ordinals(vocab, seen)
    add_expressions(vocab, seen)
    phrases = extract_phrases()
    attach_examples(vocab, phrases)
    verbs = build_verbs()
    quizzes = build_quizzes(vocab, phrases, verbs)
    data = {
        "meta": {
            "variantDefault": "pt-BR",
            "language": "Brazilian Portuguese",
            "extractedFrom": "materials/*.docx",
            "notes": "Lesson files follow Brazilian usage: você, a gente, and spoken pra/pro. European notes are included only where the lessons mention an alternative, such as isto/este/esta. A duplicate of Aula 17.2 was not imported twice. English glosses were added for word-list items the teacher wrote without a translation. Obvious typos in the teacher's English glosses were corrected.",
        },
        "lessons": LESSONS,
        "vocabulary": vocab,
        "phrases": phrases,
        "grammar": grammar_rules(),
        "verbs": verbs,
        "quizzes": quizzes,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"lessons={len(data['lessons'])} vocab={len(vocab)} phrases={len(phrases)} grammar={len(data['grammar'])} verbs={len(verbs)} quizzes={len(quizzes)}")
    from to_subjects import main as build_subjects

    build_subjects()
    if missing:
        print("MISSING", len(missing))
        print("\n".join(missing[:40]))


if __name__ == "__main__":
    main()
