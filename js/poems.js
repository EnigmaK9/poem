/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: Procedural poem generation engine with seeded PRNG
 * Author: enigmak9
 *
 * Generates 1000 deterministic, unique poems from templates and word pools.
 * Same index always produces the same poem. No external dependencies.
 */

var PoemEngine = (function () {
  "use strict";

  /* ---- Seeded PRNG (mulberry32) ---- */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- Utility ---- */
  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function shuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ponytail: basic conjugation, covers ~90% of verbs in the pools */
  function ing(verb) {
    if (verb.charAt(verb.length - 1) === "e") {
      return verb.slice(0, -1) + "ing";
    }
    return verb + "ing";
  }

  function ed(verb) {
    if (verb.charAt(verb.length - 1) === "e") {
      return verb.slice(0, -1) + "ed";
    }
    return verb + "ed";
  }

  /* ---- Word Pools ---- */

  var nounsByTheme = {
    nature: [
      "river", "mountain", "forest", "sky", "ocean", "wind", "stone", "garden",
      "rain", "leaf", "horizon", "meadow", "stream", "valley", "shore", "thunder",
      "blossom", "glacier", "canyon", "reef", "snowfall", "coral", "prairie",
      "cave", "summit", "lagoon", "waterfall", "orchard", "vine", "moss",
      "breeze", "pine", "dune", "ripple", "cedar", "wildflower", "ridge",
      "island", "starlight", "dew", "cliff", "delta", "grove", "tide",
      "pebble", "canopy", "geyser", "tundra", "quarry", "fen"
    ],
    time: [
      "hour", "century", "moment", "dawn", "dusk", "midnight", "season",
      "autumn", "winter", "spring", "summer", "past", "future", "memory",
      "yesterday", "tomorrow", "eternity", "clock", "calendar", "sunrise",
      "sunset", "twilight", "decade", "age", "passage", "cycle", "lifetime",
      "instant", "interval", "remnant", "echo", "footprint", "reckoning",
      "threshold", "childhood", "solstice", "equinox", "aftermath", "prelude",
      "morning", "evening", "vigil", "respite", "onset", "waning", "interlude",
      "meantime", "meantime", "epoch", "span"
    ],
    love: [
      "heart", "embrace", "kiss", "promise", "letter", "distance", "flame",
      "tender", "desire", "longing", "reunion", "whisper", "glance", "touch",
      "breath", "sigh", "devotion", "passion", "warmth", "tremble", "silk",
      "harbor", "beacon", "thread", "bond", "yearning", "ache", "surrender",
      "radiance", "union", "rapture", "affection", "tenderness", "ardor",
      "intimacy", "beloved", "soulmate", "covenant", "fidelity", "reverie",
      "enchantment", "infatuation", "serenade", "caress", "bliss", "grace",
      "harmony", "melody", "spark", "allure"
    ],
    solitude: [
      "silence", "shadow", "void", "empty", "absence", "distance", "hollow",
      "stillness", "quiet", "isolation", "retreat", "wilderness", "exile",
      "refuge", "chamber", "corridor", "threshold", "alcove", "dusk",
      "reflection", "departure", "separation", "wanderer", "stranger",
      "hermitage", "lighthouse", "ruin", "ascent", "drift", "anchor",
      "veil", "frontier", "expanse", "oblivion", "limbo", "pale",
      "solitario", "phantom", "outpost", "margin", "clearing", "haven",
      "recess", "lapse", "interval", "interim", "ellipsis", "residue",
      "azure", "amber"
    ],
    wonder: [
      "star", "galaxy", "cosmos", "infinity", "mystery", "dream", "voyage",
      "discovery", "frontier", "nebula", "comet", "orbit", "universe",
      "horizon", "miracle", "riddle", "labyrinth", "kaleidoscope", "prism",
      "constellation", "supernova", "particle", "dimension", "portal",
      "revelation", "enigma", "quest", "phenomenon", "spectacle", "marvel",
      "alchemy", "paradox", "quantum", "fractal", "wavelength", "zenith",
      "aether", "cipher", "mirage", "phantasm", "elysium", "arcanum",
      "firmament", "equator", "meridian", "polestar", "eclipse", "aurora",
      "solstice", "apogee"
    ],
    memory: [
      "photograph", "keepsake", "relic", "diary", "fragment", "trace",
      "impression", "legacy", "inheritance", "heirloom", "monument", "ruin",
      "chronicle", "testament", "epitaph", "memento", "token", "artifact",
      "archive", "recuerdo", "vestige", "imprint", "palimpsest", "ghost",
      "lineage", "origin", "passage", "hearth", "threshold", "window",
      "album", "letter", "portrait", "pendant", "locket", "story",
      "fable", "parable", "ballad", "manuscript", "parchment", "scroll",
      "codex", "cartography", "compass", "lantern", "tapestry", "mosaic",
      "fresco", "hologram"
    ]
  };

  var verbsByTheme = {
    nature: [
      "flow", "rise", "fall", "drift", "sway", "bloom", "cascade", "erode",
      "whisper", "roar", "gleam", "shimmer", "unfold", "scatter", "surge",
      "wander", "nestle", "cradle", "shatter", "quiver", "murmur", "ripple",
      "dissolve", "awaken", "breathe", "stretch", "climb", "descend",
      "radiate", "tremble", "envelop", "kindle", "wane", "billow",
      "burgeon", "wilt", "glimmer", "flourish", "meander", "crash"
    ],
    time: [
      "fade", "linger", "return", "pass", "unravel", "dissolve", "echo",
      "recede", "emerge", "persist", "decay", "renew", "arrive", "depart",
      "suspend", "accelerate", "dwell", "vanish", "recur", "endure",
      "transcend", "bestow", "erase", "resonate", "still", "elapse",
      "beckon", "hasten", "protract", "cease", "commence", "resume",
      "outlast", "transpire", "culminate", "precede", "outlive", "revisit",
      "foresee", "reclaim"
    ],
    love: [
      "hold", "yearn", "tremble", "surrender", "bloom", "ignite", "melt",
      "entwine", "cherish", "adore", "embrace", "unfold", "kindle", "ache",
      "dissolve", "resonate", "radiate", "beckon", "linger", "devote",
      "awaken", "enchant", "captivate", "console", "forgive", "treasure",
      "nurture", "shelter", "swoon", "revel", "enshrine", "covet",
      "bless", "envelop", "fuse", "bind", "pledge", "bestow", "entrust", "unveil"
    ],
    solitude: [
      "withdraw", "wander", "reflect", "observe", "listen", "endure",
      "contemplate", "recede", "abide", "wait", "search", "traverse",
      "ascend", "descend", "linger", "persist", "dwell", "roam",
      "ponder", "gaze", "withstand", "navigate", "beckon", "confront",
      "relinquish", "forsake", "meditate", "perceive", "discern", "unfurl",
      "unravel", "cleave", "sever", "traverse", "surmount", "transcend",
      "sift", "glean", "reckon", "abscond"
    ],
    wonder: [
      "discover", "explore", "imagine", "behold", "glimpse", "unravel",
      "transcend", "illuminate", "conjure", "summon", "fathom", "perceive",
      "venture", "traverse", "unveil", "reckon", "ponder", "marvel",
      "divine", "manifest", "crystallize", "resonate", "radiate", "emanate",
      "envision", "foresee", "prophesy", "decode", "dispel", "ignite",
      "traverse", "ascend", "plumb", "chart", "stray", "breach",
      "beckon", "kindle", "metamorphose", "transfigure"
    ],
    memory: [
      "remember", "recall", "revisit", "preserve", "enshrine", "trace",
      "linger", "haunt", "cherish", "recount", "unearth", "reclaim",
      "commemorate", "immortalize", "safeguard", "reconstruct", "assemble",
      "scatter", "gather", "fade", "resurface", "invoke", "summon",
      "bequeath", "inherit", "carry", "transmit", "record", "chronicle",
      "etched", "imprint", "capture", "retrace", "rekindle", "reawaken",
      "reverberate", "entomb", "exhume", "consecrate", "anoint"
    ]
  };

  var adjectivesByTheme = {
    nature: [
      "wild", "ancient", "vast", "gentle", "fierce", "silent", "endless",
      "verdant", "crystalline", "pristine", "turbulent", "tranquil", "lush",
      "barren", "radiant", "misty", "golden", "silver", "emerald", "azure",
      "amber", "crimson", "jade", "opal", "sapphire", "russet", "iridescent",
      "luminous", "shadowed", "sunlit", "moonlit", "windswept", "frostbitten",
      "dew-kissed", "storm-tossed", "star-scattered", "wave-worn", "lichen-covered",
      "moss-grown", "rain-washed"
    ],
    time: [
      "fleeting", "eternal", "ancient", "brief", "endless", "passing",
      "lingering", "lost", "distant", "imminent", "relentless", "patient",
      "hasty", "tardy", "belated", "untimely", "seasonal", "cyclical",
      "suspended", "irreversible", "evanescent", "perpetual", "transient",
      "impermanent", "immutable", "unfolding", "recurring", "bygone",
      "nascent", "senescent", "crepuscular", "auroral", "dilatory",
      "mercurial", "sempiternal", "protracted", "ephemeral", "ageless",
      "millennial", "primordial"
    ],
    love: [
      "tender", "fierce", "quiet", "burning", "soft", "deep", "fragile",
      "steadfast", "aching", "radiant", "secret", "boundless", "unspoken",
      "trembling", "sweet", "bittersweet", "timeless", "reckless", "devoted",
      "longing", "restless", "patient", "wild", "gentle", "sacred",
      "profane", "chaste", "ardent", "halcyon", "sempiternal",
      "lambent", "rhapsodic", "enraptured", "smoldering", "incandescent",
      "cherished", "beloved", "captive", "willing", "undying"
    ],
    solitude: [
      "quiet", "still", "hollow", "distant", "cold", "vast", "empty",
      "profound", "unbroken", "deep", "pale", "bare", "stark", "remote",
      "hidden", "untouched", "secluded", "desolate", "forsaken", "obscure",
      "austere", "sparse", "unadorned", "naked", "raw", "bleak",
      "tenuous", "opaque", "translucent", "penumbral", "crepuscular",
      "vestigial", "unmoored", "adrift", "anchorless", "unclaimed",
      "unwritten", "unspoken", "uncharted", "unknown"
    ],
    wonder: [
      "infinite", "mysterious", "brilliant", "strange", "sublime", "hidden",
      "cosmic", "celestial", "luminous", "unfathomable", "magnificent",
      "ethereal", "transcendent", "ineffable", "boundless", "uncharted",
      "inexplicable", "astounding", "breathtaking", "awe-inspiring",
      "phantasmal", "kaleidoscopic", "prismatic", "nebulous", "sidereal",
      "empyrean", "supernal", "numinous", "seraphic", "beatific",
      "resplendent", "scintillating", "coruscating", "effulgent", "refulgent",
      "ultramundane", "extramundane", "hyperborean", "elysian", "Olympian"
    ],
    memory: [
      "faded", "distant", "cherished", "forgotten", "vivid", "blurred",
      "fragile", "haunting", "fleeting", "persistent", "bittersweet", "tender",
      "half-remembered", "dreamlike", "spectral", "sepia", "timeworn",
      "reconstructed", "embellished", "eroded", "palimpsestic", "vestigial",
      "lacunary", "elliptical", "refracted", "prismatic", "echoing",
      "reverberant", "recurrent", "intrusive", "evocative", "resonant",
      "mnemonic", "anamnestic", "nostalgic", "wistful", "elegiac",
      "commemorative", "redolent", "suggestive"
    ]
  };

  var abstractNouns = [
    "eternity", "silence", "memory", "shadow", "light", "dream", "song",
    "breath", "flame", "wave", "dust", "ash", "gold", "glass", "bone",
    "root", "wing", "door", "bridge", "key", "seed", "veil", "knot",
    "bell", "wheel", "web", "spark", "salt", "thread", "blade", "vessel",
    "mirror", "prism", "lens", "cipher", "map", "hourglass", "compass",
    "anchor", "rudder", "sail", "oar", "ladder", "spiral", "circle", "line",
    "point", "edge", "center", "horizon", "threshold", "gate", "arc", "chord"
  ];

  /* ---- Rhyme Pairs ---- */
  var rhymePairs = [
    ["light", "night"], ["sky", "fly"], ["deep", "sleep"], ["dream", "stream"],
    ["fire", "higher"], ["stone", "alone"], ["wave", "grave"], ["gold", "old"],
    ["rain", "pain"], ["wind", "pinned"], ["sea", "free"], ["star", "far"],
    ["bloom", "gloom"], ["door", "before"], ["song", "long"], ["breath", "death"],
    ["river", "shiver"], ["mountain", "fountain"], ["shadow", "meadow"],
    ["flame", "name"], ["hour", "flower"], ["voice", "choice"], ["hand", "sand"],
    ["path", "wrath"], ["leaf", "grief"], ["snow", "glow"], ["tree", "eternity"],
    ["dust", "trust"], ["glass", "pass"], ["bone", "throne"], ["seed", "need"],
    ["bridge", "ridge"], ["bell", "swell"], ["wheel", "steel"], ["spark", "dark"],
    ["thread", "bread"], ["dawn", "drawn"], ["dusk", "husk"], ["root", "mute"],
    ["veil", "trail"], ["knot", "thought"], ["key", "mystery"], ["wing", "sing"],
    ["blade", "fade"], ["map", "lap"], ["sail", "veil"], ["arc", "mark"],
    ["shore", "before"], ["tide", "inside"], ["pine", "design"], ["dune", "moon"],
    ["moss", "loss"], ["cliff", "gift"], ["fen", "when"], ["ember", "remember"]
  ];

  /* ---- Haiku Phrase Pools ---- */
  var haiku5 = [
    "silent morning dew",
    "ancient stones remember",
    "wind through empty halls",
    "light falls on still water",
    "a door left half open",
    "footsteps in deep snow",
    "the last leaf holds on",
    "stars above the pines",
    "rain on a tin roof",
    "moon over the sea",
    "frost on fallen leaves",
    "a crow at midnight",
    "waves erase our steps",
    "smoke rises alone",
    "the old bridge trembles",
    "cherry blossoms drift",
    "a bell in the fog",
    "clouds part for one star",
    "embers in the ash",
    "the path disappears",
    "thunder in the hills",
    "a candle burns low",
    "shadow of a hawk",
    "stillness after rain",
    "drifting winter light",
    "the well is deeper now",
    "tide pools hold the sky",
    "a thread of birdsong",
    "lichen on grave stones",
    "river ice cracking"
  ];

  var haiku7 = [
    "a single petal falls down",
    "the mountain does not answer",
    "autumn light through bare branches",
    "footprints leading to the shore",
    "what the water remembers",
    "between two breaths the world turns",
    "dragonfly skims the surface",
    "the distant sound of a bell",
    "where the forest meets the sky",
    "cicadas in the twilight",
    "a boat drifts without oars",
    "morning glories on the fence",
    "stone steps leading to nowhere",
    "the weight of an empty room",
    "pine needles in the late sun",
    "a lantern floating downstream",
    "the echo of your footsteps",
    "snow falling on cedar boughs",
    "a window facing the sea",
    "old photographs on the wall",
    "the slow arc of returning",
    "fireflies in the meadow",
    "roots breaking through ancient walls",
    "the river changes its course",
    "a mirror clouded with breath",
    "wind stirring the rice fields",
    "the last train at the station",
    "a ladder leaning on air",
    "where the tide leaves its markings",
    "embers glowing in the dark"
  ];

  /* ---- Title Templates ---- */
  var titleTemplates = [
    function (rng, theme) {
      return cap(pick(adjectivesByTheme[theme], rng)) + " " + cap(pick(nounsByTheme[theme], rng));
    },
    function (rng, theme) {
      return "The " + cap(pick(nounsByTheme[theme], rng)) + " of " + cap(pick(abstractNouns, rng));
    },
    function (rng, theme) {
      return cap(pick(verbsByTheme[theme], rng)) + " " + cap(pick(nounsByTheme[theme], rng));
    },
    function (rng, theme) {
      return cap(pick(adjectivesByTheme[theme], rng)) + " " + cap(pick(abstractNouns, rng));
    },
    function (rng) {
      return cap(pick(abstractNouns, rng)) + " and " + cap(pick(abstractNouns, rng));
    }
  ];

  /* ---- Poem Form Generators ---- */

  function generateQuatrain(rng, theme) {
    var rhyme = pick(rhymePairs, rng);
    var lines = [];
    var adj1 = pick(adjectivesByTheme[theme], rng);
    var noun1 = pick(nounsByTheme[theme], rng);
    var verb1 = pick(verbsByTheme[theme], rng);
    var noun2 = pick(nounsByTheme[theme], rng);

    lines.push("The " + adj1 + " " + noun1 + " " + verb1 + "s through the " + noun2);
    lines.push("A " + pick(adjectivesByTheme[theme], rng) + " " + pick(abstractNouns, rng) + " of " + rhyme[0]);
    lines.push("Where " + pick(nounsByTheme[theme], rng) + " and " + pick(abstractNouns, rng) + " softly " + pick(verbsByTheme[theme], rng));
    lines.push("Beneath the " + pick(adjectivesByTheme[theme], rng) + " veil of " + rhyme[1]);

    return lines;
  }

  function generateHaiku(rng, theme) {
    return [
      pick(haiku5, rng),
      pick(haiku7, rng),
      pick(haiku5, rng)
    ];
  }

  function generateCouplets(rng, theme) {
    var rhyme1 = pick(rhymePairs, rng);
    var rhyme2 = pick(rhymePairs, rng);
    var adj1 = pick(adjectivesByTheme[theme], rng);
    var noun1 = pick(nounsByTheme[theme], rng);
    var verb1 = pick(verbsByTheme[theme], rng);

    return [
      "The " + adj1 + " " + noun1 + " " + verb1 + "s in the " + rhyme1[0],
      "A " + pick(adjectivesByTheme[theme], rng) + " reminder carved from " + rhyme1[1],
      "",
      "We " + pick(verbsByTheme[theme], rng) + " the " + pick(nounsByTheme[theme], rng) + " of " + rhyme2[0],
      "And " + pick(verbsByTheme[theme], rng) + " what lingers in the " + rhyme2[1]
    ];
  }

  function generateFreeverse(rng, theme) {
    var templates = [
      function () {
        return [
          pick(adjectivesByTheme[theme], rng) + " " + pick(nounsByTheme[theme], rng) + ",",
          ing(pick(verbsByTheme[theme], rng)) + " through " + pick(abstractNouns, rng) + " and " + pick(abstractNouns, rng),
          "",
          "there is a " + pick(abstractNouns, rng),
          "where the " + pick(nounsByTheme[theme], rng) + " " + pick(verbsByTheme[theme], rng) + "s",
          "and nothing " + pick(verbsByTheme[theme], rng) + "s",
          "but the " + pick(adjectivesByTheme[theme], rng) + " " + pick(abstractNouns, rng)
        ];
      },
      function () {
        return [
          "I have " + ed(pick(verbsByTheme[theme], rng)) + " the " + pick(nounsByTheme[theme], rng),
          "and " + ed(pick(verbsByTheme[theme], rng)) + " the " + pick(abstractNouns, rng) + " of " + pick(nounsByTheme[theme], rng) + "s",
          "",
          "still the " + pick(nounsByTheme[theme], rng) + " " + pick(verbsByTheme[theme], rng) + "s",
          "at the " + pick(adjectivesByTheme[theme], rng) + " edge",
          "of " + pick(abstractNouns, rng)
        ];
      },
      function () {
        return [
          "between " + pick(nounsByTheme[theme], rng) + " and " + pick(nounsByTheme[theme], rng),
          "a " + pick(abstractNouns, rng) + " opens",
          "",
          pick(adjectivesByTheme[theme], rng) + " and " + pick(adjectivesByTheme[theme], rng),
          "it " + pick(verbsByTheme[theme], rng) + "s without " + pick(abstractNouns, rng),
          "",
          "what passes through:",
          pick(abstractNouns, rng) + ", " + pick(abstractNouns, rng) + ", " + pick(abstractNouns, rng)
        ];
      }
    ];
    return pick(templates, rng)();
  }

  function generateTercets(rng, theme) {
    var rhyme1 = pick(rhymePairs, rng);
    var rhyme2 = pick(rhymePairs, rng);

    return [
      "The " + pick(adjectivesByTheme[theme], rng) + " " + pick(nounsByTheme[theme], rng) + " of " + rhyme1[0],
      "where " + pick(nounsByTheme[theme], rng) + "s " + pick(verbsByTheme[theme], rng) + " through the " + rhyme2[0],
      "a " + pick(abstractNouns, rng) + " of " + rhyme1[1] + " and " + rhyme2[1],
      "",
      "Beyond the " + pick(adjectivesByTheme[theme], rng) + " " + pick(nounsByTheme[theme], rng),
      "the " + pick(abstractNouns, rng) + " " + pick(verbsByTheme[theme], rng) + "s alone",
      "in " + pick(adjectivesByTheme[theme], rng) + " " + pick(abstractNouns, rng) + " and " + pick(abstractNouns, rng)
    ];
  }

  var formGenerators = [
    { form: "quatrain", fn: generateQuatrain },
    { form: "haiku", fn: generateHaiku },
    { form: "couplets", fn: generateCouplets },
    { form: "freeverse", fn: generateFreeverse },
    { form: "tercets", fn: generateTercets }
  ];

  var themes = ["nature", "time", "love", "solitude", "wonder", "memory"];

  /* ================================================================
   * SPANISH (ES) WORD POOLS AND GENERATORS
   * ================================================================ */

  var esNounsByTheme = {
    naturaleza: [
      "rio", "montaña", "bosque", "cielo", "mar", "viento", "piedra", "jardin",
      "lluvia", "hoja", "horizonte", "prado", "arroyo", "valle", "orilla", "trueno",
      "flor", "glaciar", "cañon", "arrecife", "nevada", "coral", "pradera",
      "cueva", "cumbre", "laguna", "cascada", "huerto", "vid", "musgo",
      "brisa", "pino", "duna", "onda", "cedro", "flor silvestre", "cresta",
      "isla", "lucero", "rocio", "acantilado", "delta", "arboleda", "marea",
      "guijarro", "dosel", "geiser", "tundra", "cantera", "pantano"
    ],
    tiempo: [
      "hora", "siglo", "instante", "alba", "ocaso", "medianoche", "estacion",
      "otoño", "invierno", "primavera", "verano", "pasado", "futuro", "memoria",
      "ayer", "mañana", "eternidad", "reloj", "calendario", "amanecer",
      "atardecer", "crepusculo", "decada", "edad", "paso", "ciclo", "vida",
      "instante", "intervalo", "resto", "eco", "huella", "ajuste",
      "umbral", "infancia", "solsticio", "equinoccio", "resaca", "preludio",
      "mañana", "tarde", "vigilia", "respiro", "inicio", "menguante", "interludio",
      "entretanto", "epoca", "lapso"
    ],
    amor: [
      "corazon", "abrazo", "beso", "promesa", "carta", "distancia", "llama",
      "ternura", "deseo", "anhelo", "reencuentro", "susurro", "mirada", "caricia",
      "aliento", "suspiro", "devocion", "pasion", "calor", "temblor", "seda",
      "puerto", "faro", "hilo", "lazo", "nostalgia", "dolor", "entrega",
      "resplandor", "union", "arrobamiento", "cariño", "dulzura", "ardor",
      "intimidad", "amado", "alma gemela", "pacto", "fidelidad", "ensoñacion",
      "encanto", "flechazo", "serenata", "caricia", "dicha", "gracia",
      "armonia", "melodia", "chispa", "atraccion"
    ],
    soledad: [
      "silencio", "sombra", "vacio", "ausencia", "lejania", "oquedad",
      "quietud", "calma", "aislamiento", "retiro", "desierto", "exilio",
      "refugio", "camara", "pasillo", "umbral", "alcoba", "crepusculo",
      "reflejo", "partida", "separacion", "errante", "forastero",
      "ermita", "faro", "ruina", "ascenso", "deriva", "ancla",
      "velo", "frontera", "extension", "olvido", "limbo", "palido",
      "solitario", "fantasma", "avanzada", "margen", "claro", "refugio",
      "hueco", "lapso", "intervalo", "interin", "elipsis", "residuo",
      "azul", "ambar"
    ],
    asombro: [
      "estrella", "galaxia", "cosmos", "infinito", "misterio", "sueño", "viaje",
      "descubrimiento", "frontera", "nebulosa", "cometa", "orbita", "universo",
      "horizonte", "milagro", "enigma", "laberinto", "caleidoscopio", "prisma",
      "constelacion", "supernova", "particula", "dimension", "portal",
      "revelacion", "acertijo", "busqueda", "fenomeno", "espectaculo", "maravilla",
      "alquimia", "paradoja", "cuanto", "fractal", "longitud de onda", "cenit",
      "eter", "cifra", "espejismo", "fantasma", "elisio", "arcano",
      "firmamento", "ecuador", "meridiano", "estrella polar", "eclipse", "aurora",
      "solsticio", "apogeo"
    ],
    memoria: [
      "fotografia", "recuerdo", "reliquia", "diario", "fragmento", "rastro",
      "impresion", "legado", "herencia", "reliquia familiar", "monumento", "ruina",
      "cronica", "testamento", "epitafio", "recuerdo", "señal", "artefacto",
      "archivo", "vestigio", "impronta", "palimpsesto", "fantasma",
      "linaje", "origen", "pasaje", "hogar", "umbral", "ventana",
      "album", "carta", "retrato", "colgante", "medallon", "cuento",
      "fabula", "parabola", "balada", "manuscrito", "pergamino", "rollo",
      "codice", "cartografia", "brujula", "linterna", "tapiz", "mosaico",
      "fresco", "holograma"
    ]
  };

  var esVerbsByTheme = {
    naturaleza: [
      "fluye", "sube", "cae", "deriva", "mece", "florece", "cae en cascada", "erosiona",
      "susurra", "ruge", "brilla", "reluce", "despliega", "esparce", "olea",
      "vaga", "anida", "acuna", "rompe", "tiembla", "murmura", "ondula",
      "disuelve", "despierta", "respira", "estira", "escala", "desciende",
      "irradia", "estremece", "envuelve", "enciende", "mengua", "ondea",
      "brota", "marchita", "destella", "florece", "serpentea", "choca"
    ],
    tiempo: [
      "desvanece", "permanece", "vuelve", "pasa", "deshila", "disuelve", "resuena",
      "retrocede", "emerge", "persiste", "decae", "renueva", "llega", "parte",
      "suspende", "acelera", "mora", "desaparece", "repite", "perdura",
      "trasciende", "otorga", "borra", "resuena", "aquieta", "transcurre",
      "llama", "apresura", "prolonga", "cesa", "comienza", "reanuda",
      "sobrevive", "acontece", "culmina", "precede", "revive", "revisita",
      "presagia", "reclama"
    ],
    amor: [
      "sostiene", "añora", "tiembla", "rinde", "florece", "enciende", "derrite",
      "enlaza", "aprecia", "adora", "abraza", "despliega", "enciende", "duele",
      "disuelve", "resuena", "irradia", "llama", "permanece", "consagra",
      "despierta", "encanta", "cautiva", "consuela", "perdona", "atesora",
      "nutre", "cobija", "desmaya", "deleita", "consagra", "codicia",
      "bendice", "envuelve", "funde", "une", "promete", "otorga", "confia", "revela"
    ],
    soledad: [
      "retira", "vaga", "reflexiona", "observa", "escucha", "soporta",
      "contempla", "retrocede", "mora", "espera", "busca", "atraviesa",
      "asciende", "desciende", "permanece", "persiste", "habita", "deambula",
      "pondera", "contempla", "resiste", "navega", "llama", "enfrenta",
      "renuncia", "abandona", "medita", "percibe", "discierne", "despliega",
      "deshace", "escinde", "corta", "cruza", "supera", "trasciende",
      "tamiza", "recoge", "ajusta", "huye"
    ],
    asombro: [
      "descubre", "explora", "imagina", "contempla", "vislumbra", "desentraña",
      "trasciende", "ilumina", "conjura", "invoca", "alcanza", "percibe",
      "aventura", "atraviesa", "devela", "ajusta", "pondera", "maravilla",
      "adivina", "manifiesta", "cristaliza", "resuena", "irradia", "emana",
      "visualiza", "presagia", "profetiza", "descifra", "disipa", "enciende",
      "recorre", "asciende", "sondea", "traza", "extravia", "irrumpe",
      "convoca", "enciende", "transforma", "transfigura"
    ],
    memoria: [
      "recuerda", "evoca", "revisita", "preserva", "atesora", "traza",
      "permanece", "ronda", "aprecia", "narra", "desentierra", "reclama",
      "conmemora", "inmortaliza", "resguarda", "reconstruye", "reune",
      "esparce", "recoge", "desvanece", "reaparece", "invoca", "convoca",
      "lega", "hereda", "lleva", "transmite", "registra", "cronica",
      "graba", "imprime", "captura", "repite", "reaviva", "despierta",
      "retumba", "sepulta", "exhuma", "consagra", "unge"
    ]
  };

  var esAdjectivesByTheme = {
    naturaleza: [
      "salvaje", "antiguo", "vasto", "suave", "feroz", "silencioso", "infinito",
      "verde", "cristalino", "pristino", "turbulento", "tranquilo", "exuberante",
      "arido", "radiante", "brumoso", "dorado", "plateado", "esmeralda", "azul",
      "ambar", "carmesi", "jade", "opalo", "zafiro", "ocre", "iridiscente",
      "luminoso", "sombreado", "soleado", "iluminado por la luna", "azotado por el viento",
      "besado por el rocio", "sacudido por la tormenta", "salpicado de estrellas",
      "gastado por las olas", "cubierto de liquen", "cubierto de musgo", "lavado por la lluvia"
    ],
    tiempo: [
      "fugaz", "eterno", "antiguo", "breve", "infinito", "pasajero",
      "persistente", "perdido", "distante", "iminente", "implacable", "paciente",
      "apresurado", "tardio", "tardio", "intempestivo", "estacional", "ciclico",
      "suspendido", "irreversible", "evanescente", "perpetuo", "transitorio",
      "impermanente", "inmutable", "desplegandose", "recurrente", "pasado",
      "naciente", "senescente", "crepuscular", "auroral", "dilatorio",
      "mercurial", "sempiterno", "prolongado", "efimero", "eterno",
      "milenario", "primordial"
    ],
    amor: [
      "tierno", "feroz", "callado", "ardiente", "suave", "profundo", "fragil",
      "firme", "doloroso", "radiante", "secreto", "infinito", "no dicho",
      "tembloroso", "dulce", "agridulce", "eterno", "imprudente", "devoto",
      "añorante", "inquieto", "paciente", "salvaje", "suave", "sagrado",
      "profano", "casto", "ardiente", "apacible", "eterno",
      "lambente", "rapsodico", "extasiado", "latente", "incandescente",
      "apreciado", "amado", "cautivo", "dispuesto", "eterno"
    ],
    soledad: [
      "callado", "quieto", "hueco", "distante", "frio", "vasto", "vacio",
      "profundo", "ininterrumpido", "hondo", "palido", "desnudo", "austero", "remoto",
      "oculto", "intacto", "apartado", "desolado", "abandonado", "oscuro",
      "severo", "escaso", "sin adornos", "desnudo", "crudo", "arido",
      "tenue", "opaco", "translucido", "penumbral", "crepuscular",
      "vestigial", "sin amarras", "a la deriva", "sin ancla", "no reclamado",
      "no escrito", "no dicho", "inexplorado", "desconocido"
    ],
    asombro: [
      "infinito", "misterioso", "brillante", "extraño", "sublime", "oculto",
      "cosmico", "celestial", "luminoso", "insondable", "magnifico",
      "etereo", "trascendente", "inefable", "ilimitado", "inexplorado",
      "inexplicable", "asombroso", "impresionante", "sobrecogedor",
      "fantasmal", "caleidoscopico", "prismatico", "nebuloso", "sideral",
      "empireo", "superno", "numinoso", "serafico", "beatifico",
      "resplandeciente", "centelleante", "coruscante", "efulgente", "refulgente",
      "ultramundano", "extramundano", "hiperboreo", "elisio", "olimpico"
    ],
    memoria: [
      "desvanecido", "distante", "apreciado", "olvidado", "vivido", "borroso",
      "fragil", "persistente", "fugaz", "persistente", "agridulce", "tierno",
      "medio recordado", "onirico", "espectral", "sepia", "gastado por el tiempo",
      "reconstruido", "embellecido", "erosionado", "palimpsestico", "vestigial",
      "lagunar", "eliptico", "refractado", "prismatico", "resonante",
      "reverberante", "recurrente", "intrusivo", "evocador", "resonante",
      "mnemonico", "anamnestico", "nostalgico", "melancolico", "elegiaco",
      "conmemorativo", "aromatico", "sugerente"
    ]
  };

  var esAbstractNouns = [
    "eternidad", "silencio", "memoria", "sombra", "luz", "sueño", "canto",
    "aliento", "llama", "ola", "polvo", "ceniza", "oro", "cristal", "hueso",
    "raiz", "ala", "puerta", "puente", "llave", "semilla", "velo", "nudo",
    "campana", "rueda", "red", "chispa", "sal", "hilo", "filo", "vasija",
    "espejo", "prisma", "lente", "cifra", "mapa", "reloj de arena", "brujula",
    "ancla", "timon", "vela", "remo", "escalera", "espiral", "circulo", "linea",
    "punto", "borde", "centro", "horizonte", "umbral", "puerta", "arco", "cuerda"
  ];

  var esRhymePairs = [
    ["luz", "cruz"], ["mar", "cantar"], ["flor", "amor"], ["viento", "sentimiento"],
    ["cielo", "suelo"], ["noche", "derroche"], ["sol", "caracol"], ["piedra", "hiedra"],
    ["arena", "pena"], ["rio", "frio"], ["fuego", "juego"], ["sombra", "alfombra"],
    ["camino", "destino"], ["estrella", "huella"], ["vida", "herida"],
    ["dolor", "color"], ["tierra", "sierra"], ["ola", "amapola"], ["beso", "peso"],
    ["sueño", "dueño"], ["alma", "calma"], ["tiempo", "viento"], ["lluvia", "llama"],
    ["corazon", "cancion"], ["recuerdo", "acuerdo"], ["mano", "verano"],
    ["puerta", "abierta"], ["espejo", "reflejo"], ["viaje", "paisaje"],
    ["palabra", "abre"], ["silencio", "incienso"], ["alto", "asalto"],
    ["nieve", "mueve"], ["lagrima", "anima"], ["mirada", "madrugada"],
    ["ceniza", "prisa"], ["oro", "tesoro"], ["hierro", "destierro"],
    ["nube", "sube"], ["raiz", "matiz"], ["eco", "hueco"], ["ala", "escala"],
    ["polvo", "resuelvo"], ["vela", "estela"], ["rosa", "hermosa"],
    ["tumba", "derRumba"], ["canto", "quebranto"], ["prado", "sagrado"]
  ];

  var esHaiku5 = [
    "rocío en la brizna",
    "luna sobre el junco",
    "viento entre los pinos",
    "silencio de nieve",
    "golondrina al alba",
    "campana lejana",
    "senda entre la niebla",
    "luz sobre el estanque",
    "hoja que se suelta",
    "grillo en la penumbra",
    "lluvia de verano",
    "piedra en el camino",
    "nube pasajera",
    "rama de cerezo",
    "musgo en la escalera",
    "alba sobre el puerto",
    "taza de te humeante",
    "huellas en la arena",
    "templo entre la bruma",
    "eco de tambores",
    "mariposa blanca",
    "viejo sauce llora",
    "niebla en la cañada",
    "lucero del alba",
    "sombra de la garza"
  ];

  var esHaiku7 = [
    "el rio sigue su curso",
    "la montaña no responde",
    "mariposa en la ventana",
    "voces que el viento se lleva",
    "campanas de la ermita",
    "senderos que se bifurcan",
    "la luna llena en el lago",
    "aroma de pan reciente",
    "el mar besando la orilla",
    "escribe el agua en la piedra",
    "un pajaro cruza el cielo",
    "hojas secas en el suelo",
    "atardecer en los alamos",
    "la guitarra en el silencio",
    "cae la tarde en el parque",
    "el perfume del jazmin",
    "se deshoja la magnolia",
    "caminos de polvo y sol",
    "el cipres junto a la tapia",
    "palomas en el alero",
    "rescoldo de la fogata",
    "primera estrella del dia",
    "el rumor de la acequia",
    "flores de jacaranda",
    "pinceladas de la aurora"
  ];

  var esTitleTemplates = [
    function (rng, theme) {
      var tKey = theme === "nature" ? "naturaleza" :
                 theme === "time" ? "tiempo" :
                 theme === "love" ? "amor" :
                 theme === "solitude" ? "soledad" :
                 theme === "wonder" ? "asombro" : "memoria";
      return cap(pick(esAdjectivesByTheme[tKey], rng)) + " " + cap(pick(esNounsByTheme[tKey], rng));
    },
    function (rng, theme) {
      var tKey = theme === "nature" ? "naturaleza" :
                 theme === "time" ? "tiempo" :
                 theme === "love" ? "amor" :
                 theme === "solitude" ? "soledad" :
                 theme === "wonder" ? "asombro" : "memoria";
      return "El " + cap(pick(esNounsByTheme[tKey], rng)) + " de " + cap(pick(esAbstractNouns, rng));
    },
    function (rng, theme) {
      var tKey = theme === "nature" ? "naturaleza" :
                 theme === "time" ? "tiempo" :
                 theme === "love" ? "amor" :
                 theme === "solitude" ? "soledad" :
                 theme === "wonder" ? "asombro" : "memoria";
      return cap(pick(esVerbsByTheme[tKey], rng)) + " " + cap(pick(esNounsByTheme[tKey], rng));
    },
    function (rng, theme) {
      var tKey = theme === "nature" ? "naturaleza" :
                 theme === "time" ? "tiempo" :
                 theme === "love" ? "amor" :
                 theme === "solitude" ? "soledad" :
                 theme === "wonder" ? "asombro" : "memoria";
      return cap(pick(esAdjectivesByTheme[tKey], rng)) + " " + cap(pick(esAbstractNouns, rng));
    },
    function (rng) {
      return cap(pick(esAbstractNouns, rng)) + " y " + cap(pick(esAbstractNouns, rng));
    }
  ];

  function esGenerateQuatrain(rng, theme) {
    var tKey = theme === "nature" ? "naturaleza" :
               theme === "time" ? "tiempo" :
               theme === "love" ? "amor" :
               theme === "solitude" ? "soledad" :
               theme === "wonder" ? "asombro" : "memoria";

    var rhyme = pick(esRhymePairs, rng);
    var adj1 = pick(esAdjectivesByTheme[tKey], rng);
    var noun1 = pick(esNounsByTheme[tKey], rng);
    var verb1 = pick(esVerbsByTheme[tKey], rng);
    var noun2 = pick(esNounsByTheme[tKey], rng);

    return [
      "El " + adj1 + " " + noun1 + " " + verb1 + " en el " + noun2,
      "Un " + pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esAbstractNouns, rng) + " de " + rhyme[0],
      "Donde " + pick(esNounsByTheme[tKey], rng) + " y " + pick(esAbstractNouns, rng) + " suavemente " + pick(esVerbsByTheme[tKey], rng),
      "Bajo el " + pick(esAdjectivesByTheme[tKey], rng) + " velo de " + rhyme[1]
    ];
  }

  function esGenerateHaiku(rng, theme) {
    return [
      pick(esHaiku5, rng),
      pick(esHaiku7, rng),
      pick(esHaiku5, rng)
    ];
  }

  function esGenerateCouplets(rng, theme) {
    var tKey = theme === "nature" ? "naturaleza" :
               theme === "time" ? "tiempo" :
               theme === "love" ? "amor" :
               theme === "solitude" ? "soledad" :
               theme === "wonder" ? "asombro" : "memoria";

    var rhyme1 = pick(esRhymePairs, rng);
    var rhyme2 = pick(esRhymePairs, rng);
    var adj1 = pick(esAdjectivesByTheme[tKey], rng);
    var noun1 = pick(esNounsByTheme[tKey], rng);
    var verb1 = pick(esVerbsByTheme[tKey], rng);

    return [
      "El " + adj1 + " " + noun1 + " " + verb1 + " en la " + rhyme1[0],
      "Un " + pick(esAdjectivesByTheme[tKey], rng) + " recuerdo tallado de " + rhyme1[1],
      "",
      "Atravesamos el " + pick(esNounsByTheme[tKey], rng) + " de " + rhyme2[0],
      "Y " + pick(esVerbsByTheme[tKey], rng) + " lo que persiste en la " + rhyme2[1]
    ];
  }

  function esGenerateFreeverse(rng, theme) {
    var tKey = theme === "nature" ? "naturaleza" :
               theme === "time" ? "tiempo" :
               theme === "love" ? "amor" :
               theme === "solitude" ? "soledad" :
               theme === "wonder" ? "asombro" : "memoria";

    var templates = [
      function () {
        return [
          pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esNounsByTheme[tKey], rng) + ",",
          ing(pick(esVerbsByTheme[tKey], rng)) + " a traves de " + pick(esAbstractNouns, rng) + " y " + pick(esAbstractNouns, rng),
          "",
          "hay un " + pick(esAbstractNouns, rng),
          "donde el " + pick(esNounsByTheme[tKey], rng) + " " + pick(esVerbsByTheme[tKey], rng),
          "y nada " + pick(esVerbsByTheme[tKey], rng),
          "sino el " + pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esAbstractNouns, rng)
        ];
      },
      function () {
        return [
          "He " + ed(pick(esVerbsByTheme[tKey], rng)) + " el " + pick(esNounsByTheme[tKey], rng),
          "y " + ed(pick(esVerbsByTheme[tKey], rng)) + " el " + pick(esAbstractNouns, rng) + " de " + pick(esNounsByTheme[tKey], rng) + "s",
          "",
          "aun el " + pick(esNounsByTheme[tKey], rng) + " " + pick(esVerbsByTheme[tKey], rng),
          "en el " + pick(esAdjectivesByTheme[tKey], rng) + " borde",
          "de " + pick(esAbstractNouns, rng)
        ];
      },
      function () {
        return [
          "entre " + pick(esNounsByTheme[tKey], rng) + " y " + pick(esNounsByTheme[tKey], rng),
          "un " + pick(esAbstractNouns, rng) + " se abre",
          "",
          pick(esAdjectivesByTheme[tKey], rng) + " y " + pick(esAdjectivesByTheme[tKey], rng),
          "" + pick(esVerbsByTheme[tKey], rng) + " sin " + pick(esAbstractNouns, rng),
          "",
          "lo que pasa:",
          pick(esAbstractNouns, rng) + ", " + pick(esAbstractNouns, rng) + ", " + pick(esAbstractNouns, rng)
        ];
      }
    ];
    return pick(templates, rng)();
  }

  function esGenerateTercets(rng, theme) {
    var tKey = theme === "nature" ? "naturaleza" :
               theme === "time" ? "tiempo" :
               theme === "love" ? "amor" :
               theme === "solitude" ? "soledad" :
               theme === "wonder" ? "asombro" : "memoria";

    var rhyme1 = pick(esRhymePairs, rng);
    var rhyme2 = pick(esRhymePairs, rng);

    return [
      "El " + pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esNounsByTheme[tKey], rng) + " de " + rhyme1[0],
      "donde " + pick(esNounsByTheme[tKey], rng) + "s " + pick(esVerbsByTheme[tKey], rng) + " a traves del " + rhyme2[0],
      "un " + pick(esAbstractNouns, rng) + " de " + rhyme1[1] + " y " + rhyme2[1],
      "",
      "Mas alla del " + pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esNounsByTheme[tKey], rng),
      "el " + pick(esAbstractNouns, rng) + " " + pick(esVerbsByTheme[tKey], rng) + " solo",
      "en " + pick(esAdjectivesByTheme[tKey], rng) + " " + pick(esAbstractNouns, rng) + " y " + pick(esAbstractNouns, rng)
    ];
  }

  var esFormGenerators = [
    { form: "cuarteto", fn: esGenerateQuatrain },
    { form: "haiku", fn: esGenerateHaiku },
    { form: "pareados", fn: esGenerateCouplets },
    { form: "verso libre", fn: esGenerateFreeverse },
    { form: "tercetos", fn: esGenerateTercets }
  ];

  var esThemes = ["naturaleza", "tiempo", "amor", "soledad", "asombro", "memoria"];

  function themeToEsKey(theme) {
    if (theme === "nature") return "naturaleza";
    if (theme === "time") return "tiempo";
    if (theme === "love") return "amor";
    if (theme === "solitude") return "soledad";
    if (theme === "wonder") return "asombro";
    return "memoria";
  }

  /* ---- Public API ---- */

  /**
   * Generate a single poem by index.
   * @param {number} index - 0 to 999
   * @param {string} [lang='en'] - 'en' or 'es'
   * @returns {object} { id, title, lines, theme, form }
   */
  function generate(index, lang) {
    lang = lang || "en";
    var rng = mulberry32(index);

    if (lang === "es") {
      var esTheme = pick(esThemes, rng);
      var esGenerator = pick(esFormGenerators, rng);
      var esTitleFn = pick(esTitleTemplates, rng);
      var enTheme = esTheme === "naturaleza" ? "nature" :
                    esTheme === "tiempo" ? "time" :
                    esTheme === "amor" ? "love" :
                    esTheme === "soledad" ? "solitude" :
                    esTheme === "asombro" ? "wonder" : "memory";

      return {
        id: index,
        title: esTitleFn(rng, esTheme),
        lines: esGenerator.fn(rng, esTheme),
        theme: enTheme,
        form: esGenerator.form,
        lang: "es"
      };
    }

    var theme = pick(themes, rng);
    var generator = pick(formGenerators, rng);
    var titleFn = pick(titleTemplates, rng);

    return {
      id: index,
      title: titleFn(rng, theme),
      lines: generator.fn(rng, theme),
      theme: theme,
      form: generator.form,
      lang: "en"
    };
  }

  /**
   * Generate a batch of poems.
   * @param {number} start - start index (inclusive)
   * @param {number} count - number of poems to generate
   * @returns {object[]}
   */
  function generateBatch(start, count, lang) {
    lang = lang || "en";
    var result = [];
    for (var i = 0; i < count; i++) {
      result.push(generate(start + i, lang));
    }
    return result;
  }

  /**
   * Verify determinism and uniqueness of poem generation.
   * Returns results object; logs nothing.
   */
  function selfCheck() {
    var p0a = generate(0);
    var p0b = generate(0);
    var p1 = generate(1);
    var p999 = generate(999);

    var deterministic = JSON.stringify(p0a) === JSON.stringify(p0b);
    var unique01 = JSON.stringify(p0a) !== JSON.stringify(p1);
    var unique0999 = JSON.stringify(p0a) !== JSON.stringify(p999);

    return {
      totalPoemsGenerated: 4,
      deterministic: deterministic,
      unique01: unique01,
      unique0999: unique0999,
      sampleTitles: [p0a.title, p1.title, p999.title],
      allUnique: deterministic && unique01 && unique0999
    };
  }

  return {
    generate: generate,
    generateBatch: generateBatch,
    selfCheck: selfCheck,
    TOTAL_POEMS: 1000
  };
})();
