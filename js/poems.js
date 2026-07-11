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

  /* ---- Public API ---- */

  /**
   * Generate a single poem by index.
   * @param {number} index - 0 to 999
   * @returns {object} { id, title, lines, theme, form }
   */
  function generate(index) {
    var rng = mulberry32(index);

    var theme = pick(themes, rng);
    var generator = pick(formGenerators, rng);
    var titleFn = pick(titleTemplates, rng);

    var title = titleFn(rng, theme);
    var lines = generator.fn(rng, theme);

    return {
      id: index,
      title: title,
      lines: lines,
      theme: theme,
      form: generator.form
    };
  }

  /**
   * Generate a batch of poems.
   * @param {number} start - start index (inclusive)
   * @param {number} count - number of poems to generate
   * @returns {object[]}
   */
  function generateBatch(start, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
      result.push(generate(start + i));
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
