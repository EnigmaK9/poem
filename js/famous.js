/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: 1000 poems in the style of famous authors (English + Spanish),
 *              plus a curated set of public-domain classics.
 * Author: enigmak9
 *
 * The first ~30 entries are real public-domain poems.
 * The remaining ~970 are procedurally generated in the style of
 * famous poets using author-specific vocabulary, forms, and templates.
 */

var FamousEngine = (function () {
  "use strict";

  /* ---- Seeded PRNG ---- */
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---- Real Public-Domain Poems ---- */

  var realPoems = [
    {
      title: "Sonnet 18",
      author: "William Shakespeare",
      language: "en",
      lines: [
        "Shall I compare thee to a summer's day?",
        "Thou art more lovely and more temperate:",
        "Rough winds do shake the darling buds of May,",
        "And summer's lease hath all too short a date:",
        "Sometime too hot the eye of heaven shines,",
        "And often is his gold complexion dimmed;",
        "And every fair from fair sometime declines,",
        "By chance, or nature's changing course, untrimmed;",
        "But thy eternal summer shall not fade,",
        "Nor lose possession of that fair thou owest;",
        "Nor shall Death brag thou wanderest in his shade,",
        "When in eternal lines to time thou growest:",
        "  So long as men can breathe, or eyes can see,",
        "  So long lives this, and this gives life to thee."
      ]
    },
    {
      title: "Hope is the thing with feathers",
      author: "Emily Dickinson",
      language: "en",
      lines: [
        "Hope is the thing with feathers",
        "That perches in the soul,",
        "And sings the tune without the words,",
        "And never stops at all,",
        "",
        "And sweetest in the gale is heard;",
        "And sore must be the storm",
        "That could abash the little bird",
        "That kept so many warm.",
        "",
        "I've heard it in the chillest land,",
        "And on the strangest sea;",
        "Yet, never, in extremity,",
        "It asked a crumb of me."
      ]
    },
    {
      title: "The Road Not Taken",
      author: "Robert Frost",
      language: "en",
      lines: [
        "Two roads diverged in a yellow wood,",
        "And sorry I could not travel both",
        "And be one traveler, long I stood",
        "And looked down one as far as I could",
        "To where it bent in the undergrowth;",
        "",
        "Then took the other, as just as fair,",
        "And having perhaps the better claim,",
        "Because it was grassy and wanted wear;",
        "Though as for that the passing there",
        "Had worn them really about the same,",
        "",
        "And both that morning equally lay",
        "In leaves no step had trodden black.",
        "Oh, I kept the first for another day!",
        "Yet knowing how way leads on to way,",
        "I doubted if I should ever come back.",
        "",
        "I shall be telling this with a sigh",
        "Somewhere ages and ages hence:",
        "Two roads diverged in a wood, and I,",
        "I took the one less traveled by,",
        "And that has made all the difference."
      ]
    },
    {
      title: "The Tyger",
      author: "William Blake",
      language: "en",
      lines: [
        "Tyger Tyger, burning bright,",
        "In the forests of the night;",
        "What immortal hand or eye,",
        "Could frame thy fearful symmetry?",
        "",
        "In what distant deeps or skies",
        "Burnt the fire of thine eyes?",
        "On what wings dare he aspire?",
        "What the hand, dare seize the fire?",
        "",
        "And what shoulder, and what art,",
        "Could twist the sinews of thy heart?",
        "And when thy heart began to beat,",
        "What dread hand? and what dread feet?"
      ]
    },
    {
      title: "Because I could not stop for Death",
      author: "Emily Dickinson",
      language: "en",
      lines: [
        "Because I could not stop for Death,",
        "He kindly stopped for me;",
        "The carriage held but just ourselves",
        "And Immortality.",
        "",
        "We slowly drove, he knew no haste,",
        "And I had put away",
        "My labor, and my leisure too,",
        "For his civility."
      ]
    },
    {
      title: "Ozymandias",
      author: "Percy Bysshe Shelley",
      language: "en",
      lines: [
        "I met a traveller from an antique land",
        "Who said: Two vast and trunkless legs of stone",
        "Stand in the desert. Near them, on the sand,",
        "Half sunk, a shattered visage lies, whose frown,",
        "And wrinkled lip, and sneer of cold command,",
        "Tell that its sculptor well those passions read",
        "Which yet survive, stamped on these lifeless things,",
        "The hand that mocked them and the heart that fed:",
        "And on the pedestal these words appear:",
        "'My name is Ozymandias, king of kings:",
        "Look on my works, ye Mighty, and despair!'",
        "Nothing beside remains. Round the decay",
        "Of that colossal wreck, boundless and bare",
        "The lone and level sands stretch far away."
      ]
    },
    {
      title: "Stopping by Woods on a Snowy Evening",
      author: "Robert Frost",
      language: "en",
      lines: [
        "Whose woods these are I think I know.",
        "His house is in the village though;",
        "He will not see me stopping here",
        "To watch his woods fill up with snow.",
        "",
        "My little horse must think it queer",
        "To stop without a farmhouse near",
        "Between the woods and frozen lake",
        "The darkest evening of the year.",
        "",
        "He gives his harness bells a shake",
        "To ask if there is some mistake.",
        "The only other sound's the sweep",
        "Of easy wind and downy flake.",
        "",
        "The woods are lovely, dark and deep,",
        "But I have promises to keep,",
        "And miles to go before I sleep,",
        "And miles to go before I sleep."
      ]
    },
    {
      title: "She Walks in Beauty",
      author: "Lord Byron",
      language: "en",
      lines: [
        "She walks in beauty, like the night",
        "Of cloudless climes and starry skies;",
        "And all that's best of dark and bright",
        "Meet in her aspect and her eyes:",
        "Thus mellowed to that tender light",
        "Which heaven to gaudy day denies.",
        "",
        "One shade the more, one ray the less,",
        "Had half impaired the nameless grace",
        "Which waves in every raven tress,",
        "Or softly lightens o'er her face;",
        "Where thoughts serenely sweet express",
        "How pure, how dear their dwelling-place."
      ]
    },
    {
      title: "I Wandered Lonely as a Cloud",
      author: "William Wordsworth",
      language: "en",
      lines: [
        "I wandered lonely as a cloud",
        "That floats on high o'er vales and hills,",
        "When all at once I saw a crowd,",
        "A host, of golden daffodils;",
        "Beside the lake, beneath the trees,",
        "Fluttering and dancing in the breeze.",
        "",
        "Continuous as the stars that shine",
        "And twinkle on the milky way,",
        "They stretched in never-ending line",
        "Along the margin of a bay:",
        "Ten thousand saw I at a glance,",
        "Tossing their heads in sprightly dance."
      ]
    },
    {
      title: "Annabel Lee",
      author: "Edgar Allan Poe",
      language: "en",
      lines: [
        "It was many and many a year ago,",
        "  In a kingdom by the sea,",
        "That a maiden there lived whom you may know",
        "  By the name of Annabel Lee;",
        "And this maiden she lived with no other thought",
        "  Than to love and be loved by me.",
        "",
        "I was a child and she was a child,",
        "  In this kingdom by the sea,",
        "But we loved with a love that was more than love,",
        "  I and my Annabel Lee;",
        "With a love that the winged seraphs of heaven",
        "  Coveted her and me."
      ]
    },
    {
      title: "O Captain! My Captain!",
      author: "Walt Whitman",
      language: "en",
      lines: [
        "O Captain! my Captain! our fearful trip is done;",
        "The ship has weathered every rack, the prize we sought is won;",
        "The port is near, the bells I hear, the people all exulting,",
        "While follow eyes the steady keel, the vessel grim and daring:",
        "  But O heart! heart! heart!",
        "    O the bleeding drops of red,",
        "      Where on the deck my Captain lies,",
        "        Fallen cold and dead."
      ]
    },
    {
      title: "Rima LIII",
      author: "Gustavo Adolfo Becquer",
      language: "es",
      lines: [
        "Volveran las oscuras golondrinas",
        "en tu balcon sus nidos a colgar,",
        "y otra vez con el ala a sus cristales",
        "jugando llamaran.",
        "",
        "Pero aquellas que el vuelo refrenaban",
        "tu hermosura y mi dicha a contemplar,",
        "aquellas que aprendieron nuestros nombres,",
        "esas... no volveran."
      ]
    },
    {
      title: "Rima XXI",
      author: "Gustavo Adolfo Becquer",
      language: "es",
      lines: [
        "Que es poesia?, dices mientras clavas",
        "en mi pupila tu pupila azul.",
        "Que es poesia? Y tu me lo preguntas?",
        "Poesia... eres tu."
      ]
    },
    {
      title: "Caminante no hay camino",
      author: "Antonio Machado",
      language: "es",
      lines: [
        "Caminante, son tus huellas",
        "el camino y nada mas;",
        "Caminante, no hay camino,",
        "se hace camino al andar.",
        "",
        "Al andar se hace el camino,",
        "y al volver la vista atras",
        "se ve la senda que nunca",
        "se ha de volver a pisar.",
        "",
        "Caminante no hay camino",
        "sino estelas en la mar."
      ]
    },
    {
      title: "Lo fatal",
      author: "Ruben Dario",
      language: "es",
      lines: [
        "Dichoso el arbol, que es apenas sensitivo,",
        "y mas la piedra dura porque esa ya no siente,",
        "pues no hay dolor mas grande que el dolor de ser vivo,",
        "ni mayor pesadumbre que la vida consciente.",
        "",
        "Ser, y no saber nada, y ser sin rumbo cierto,",
        "y el temor de haber sido y un futuro terror...",
        "Y el espanto seguro de estar manana muerto,",
        "y sufrir por la vida y por la sombra y por",
        "",
        "lo que no conocemos y apenas sospechamos,",
        "y la carne que tienta con sus frescos racimos,",
        "y la tumba que aguarda con sus funebres ramos,",
        "y no saber adonde vamos,",
        "ni de donde venimos!"
      ]
    },
    {
      title: "Cultivo una rosa blanca",
      author: "Jose Marti",
      language: "es",
      lines: [
        "Cultivo una rosa blanca,",
        "en julio como en enero,",
        "para el amigo sincero",
        "que me da su mano franca.",
        "",
        "Y para el cruel que me arranca",
        "el corazon con que vivo,",
        "cardo ni oruga cultivo:",
        "cultivo la rosa blanca."
      ]
    },
    {
      title: "En paz",
      author: "Amado Nervo",
      language: "es",
      lines: [
        "Muy cerca de mi ocaso, yo te bendigo, vida,",
        "porque nunca me diste ni esperanza fallida,",
        "ni trabajos injustos, ni pena inmerecida;",
        "",
        "porque veo al final de mi rudo camino",
        "que yo fui el arquitecto de mi propio destino;",
        "que si extraje las mieles o la hiel de las cosas,",
        "fue porque en ellas puse hiel o mieles sabrosas:",
        "cuando plante rosales, coseche siempre rosas."
      ]
    },
    {
      title: "Hombres necios que acusais",
      author: "Sor Juana Ines de la Cruz",
      language: "es",
      lines: [
        "Hombres necios que acusais",
        "a la mujer sin razon,",
        "sin ver que sois la ocasion",
        "de lo mismo que culpais:",
        "",
        "si con ansia sin igual",
        "solicitais su desden,",
        "por que quereis que obren bien",
        "si las incitais al mal?"
      ]
    },
    {
      title: "A Margarita Debayle",
      author: "Ruben Dario",
      language: "es",
      lines: [
        "Margarita, esta linda la mar,",
        "y el viento",
        "lleva esencia sutil de azahar;",
        "yo siento",
        "en el alma una alondra cantar;",
        "tu acento.",
        "",
        "Margarita, te voy a contar",
        "un cuento."
      ]
    },
    {
      title: "Nocturno III (excerpt)",
      author: "Jose Asuncion Silva",
      language: "es",
      lines: [
        "Una noche,",
        "una noche toda llena de murmullos, de perfumes y de musicas de alas;",
        "una noche",
        "en que ardian en la sombra nupcial y humeda las luciernagas fantasticas,",
        "a mi lado lentamente, contra mi ceñida toda, muda y palida,",
        "como si un presentimiento de amarguras infinitas",
        "hasta el mas secreto fondo de las fibras te agitara,",
        "por la senda florecida que atraviesa la llanura",
        "caminabas;",
        "y la luna llena",
        "por los cielos azulosos, infinitos y profundos esparcia su luz blanca;",
        "y tu sombra,",
        "fina y languida,",
        "y mi sombra,",
        "por los rayos de la luna proyectadas,",
        "sobre las arenas tristes",
        "de la senda se juntaban,",
        "y eran una,",
        "y eran una,",
        "y eran una sola sombra larga,",
        "y eran una sola sombra larga,",
        "y eran una sola sombra larga..."
      ]
    },
    {
      title: "A una rosa",
      author: "Sor Juana Ines de la Cruz",
      language: "es",
      lines: [
        "Rosa divina que en gentil cultura",
        "eres, con tu fragante sutileza,",
        "magisterio purpureo en la belleza,",
        "enseñanza nevada a la hermosura.",
        "",
        "Amago de la humana arquitectura,",
        "ejemplo de la vana gentileza,",
        "en cuyo ser unio naturaleza",
        "la cuna alegre y triste sepultura.",
        "",
        "Cuan altiva en tu pompa, presumida,",
        "soberbia, el riesgo de morir desdeñas,",
        "y luego desmayada y encogida",
        "",
        "de tu caduco ser das mustias señas,",
        "con que con docta muerte y necia vida,",
        "viviendo enganas y muriendo enseñas."
      ]
    },
    {
      title: "The Raven (excerpt)",
      author: "Edgar Allan Poe",
      language: "en",
      lines: [
        "Once upon a midnight dreary, while I pondered, weak and weary,",
        "Over many a quaint and curious volume of forgotten lore,",
        "While I nodded, nearly napping, suddenly there came a tapping,",
        "As of some one gently rapping, rapping at my chamber door.",
        "Tis some visitor, I muttered, tapping at my chamber door;",
        "Only this and nothing more.",
        "",
        "Ah, distinctly I remember it was in the bleak December,",
        "And each separate dying ember wrought its ghost upon the floor.",
        "Eagerly I wished the morrow; vainly I had sought to borrow",
        "From my books surcease of sorrow, sorrow for the lost Lenore,",
        "For the rare and radiant maiden whom the angels name Lenore,",
        "Nameless here for evermore."
      ]
    },
    {
      title: "If",
      author: "Rudyard Kipling",
      language: "en",
      lines: [
        "If you can keep your head when all about you",
        "  Are losing theirs and blaming it on you,",
        "If you can trust yourself when all men doubt you,",
        "  But make allowance for their doubting too;",
        "If you can wait and not be tired by waiting,",
        "  Or being lied about, don't deal in lies,",
        "Or being hated, don't give way to hating,",
        "  And yet don't look too good, nor talk too wise."
      ]
    },
    {
      title: "Sonnet 116",
      author: "William Shakespeare",
      language: "en",
      lines: [
        "Let me not to the marriage of true minds",
        "Admit impediments. Love is not love",
        "Which alters when it alteration finds,",
        "Or bends with the remover to remove.",
        "O no, it is an ever-fixed mark",
        "That looks on tempests and is never shaken;",
        "It is the star to every wandering bark,",
        "Whose worth's unknown, although his height be taken.",
        "Love's not Time's fool, though rosy lips and cheeks",
        "Within his bending sickle's compass come;",
        "Love alters not with his brief hours and weeks,",
        "But bears it out even to the edge of doom.",
        "  If this be error and upon me proved,",
        "  I never writ, nor no man ever loved."
      ]
    },
    {
      title: "A Dream Within a Dream",
      author: "Edgar Allan Poe",
      language: "en",
      lines: [
        "Take this kiss upon the brow!",
        "And, in parting from you now,",
        "Thus much let me avow:",
        "You are not wrong, who deem",
        "That my days have been a dream;",
        "Yet if hope has flown away",
        "In a night, or in a day,",
        "In a vision, or in none,",
        "Is it therefore the less gone?",
        "All that we see or seem",
        "Is but a dream within a dream."
      ]
    },
    {
      title: "Recuerdo infantil",
      author: "Antonio Machado",
      language: "es",
      lines: [
        "Una tarde parda y fria",
        "de invierno. Los colegiales",
        "estudian. Monotonia",
        "de lluvia tras los cristales.",
        "",
        "Es la clase. En un cartel",
        "se representa a Cain",
        "fugitivo, y muerto Abel,",
        "junto a una mancha carmin.",
        "",
        "Con timbre sonoro y hueco",
        "truena el maestro, un anciano",
        "mal vestido, enjuto y seco,",
        "que lleva un libro en la mano."
      ]
    },
    {
      title: "Soneto XXIII",
      author: "Garcilaso de la Vega",
      language: "es",
      lines: [
        "En tanto que de rosa y azucena",
        "se muestra la color en vuestro gesto,",
        "y que vuestro mirar ardiente, honesto,",
        "con clara luz la tempestad serena;",
        "",
        "y en tanto que el cabello, que en la vena",
        "del oro se escogio, con vuelo presto",
        "por el hermoso cuello blanco, enhiesto,",
        "el viento mueve, esparce y desordena:",
        "",
        "coged de vuestra alegre primavera",
        "el dulce fruto antes que el tiempo airado",
        "cubra de nieve la hermosa cumbre."
      ]
    },
    {
      title: "How Do I Love Thee?",
      author: "Elizabeth Barrett Browning",
      language: "en",
      lines: [
        "How do I love thee? Let me count the ways.",
        "I love thee to the depth and breadth and height",
        "My soul can reach, when feeling out of sight",
        "For the ends of Being and ideal Grace.",
        "I love thee to the level of everyday's",
        "Most quiet need, by sun and candle-light.",
        "I love thee freely, as men strive for Right;",
        "I love thee purely, as they turn from Praise.",
        "I love thee with the passion put to use",
        "In my old griefs, and with my childhood's faith.",
        "I love thee with a love I seemed to lose",
        "With my lost saints, I love thee with the breath,",
        "Smiles, tears, of all my life! and, if God choose,",
        "I shall but love thee better after death."
      ]
    },
    {
      title: "A sus ojos",
      author: "Manuel Gutierrez Najera",
      language: "es",
      lines: [
        "No se si son negros o son verdes,",
        "sus ojos fascinantes y traidores,",
        "lo unico que se es que en sus miradas",
        "hay destellos de luz, rayos de soles;",
        "",
        "que me atraen, me arrastran y me llevan",
        "como el mar en sus ondas a los barcos;",
        "que me hacen sonar con lo imposible,",
        "sentir lo que no siento, ver lo extrano."
      ]
    }
  ];

  /* ---- Author-Style Generators ---- */

  /* -- Shakespearean Sonnet Generator -- */
  var shakespeareNouns = [
    "beauty", "summer", "winter", "rose", "star", "moon", "sun", "time",
    "love", "heart", "soul", "eye", "grace", "truth", "honor", "death",
    "nature", "heaven", "earth", "gold", "glass", "flower", "spring",
    "autumn", "tempest", "darling", "bud", "lease", "complexion", "shade"
  ];

  var shakespeareVerbs = [
    "compare", "shake", "shine", "fade", "wander", "breathe", "see",
    "grow", "change", "decline", "remember", "forget", "bless", "curse",
    "sing", "weep", "dance", "sleep", "dream", "die", "live", "love"
  ];

  var shakespeareAdjs = [
    "eternal", "lovely", "temperate", "darling", "golden", "fair",
    "sweet", "gentle", "mighty", "noble", "pure", "bright", "dark",
    "pale", "wild", "tender", "blessed", "cursed", "mortal", "divine"
  ];

  var shakespeareEnds = [
    "thee", "me", "love", "heart", "soul", "time", "death",
    "life", "truth", "grace", "light", "night", "day", "away"
  ];

  function generateShakespeare(rng) {
    var lines = [];
    var end1 = pick(shakespeareEnds, rng);
    var end2 = pick(shakespeareEnds, rng);
    var end3 = pick(shakespeareEnds, rng);
    while (end3 === end1) end3 = pick(shakespeareEnds, rng);

    for (var i = 0; i < 14; i++) {
      var adj = pick(shakespeareAdjs, rng);
      var noun = pick(shakespeareNouns, rng);
      var verb = pick(shakespeareVerbs, rng);

      var templates = [
        "Shall I " + verb + " " + pick(shakespeareAdjs, rng) + " " + end1 + "?",
        "Thou art more " + adj + " and more " + pick(shakespeareAdjs, rng),
        "When " + adj + " " + noun + " in " + pick(shakespeareNouns, rng) + " doth " + verb,
        "And " + noun + "'s sweet " + adj + " " + pick(shakespeareNouns, rng) + " " + verb + "s",
        "But thy " + adj + " " + noun + " shall not " + verb,
        "Nor shall " + cap(noun) + " " + verb + " upon thy " + end2,
        "So long as " + noun + " can " + verb + " this " + end3,
        "That " + cap(adj) + " " + noun + " to " + pick(shakespeareNouns, rng) + " doth " + verb,
        "When in " + adj + " " + noun + " to " + end3 + " I " + verb,
        "The " + adj + " " + noun + " of " + pick(shakespeareNouns, rng) + "'s " + adj + " " + end1
      ];

      var line = pick(templates, rng);
      if (i === 13) line = "  So long lives this, and this gives " + end3 + " to " + end1 + ".";
      lines.push(line);
    }

    return {
      title: cap(pick(shakespeareAdjs, rng)) + " " + cap(pick(shakespeareNouns, rng)),
      author: "William Shakespeare",
      language: "en",
      lines: lines
    };
  }

  /* -- Dickinson-style Generator -- */
  var dickinsonNouns = [
    "hope", "thing", "feather", "soul", "tune", "gale", "storm",
    "bird", "crumb", "death", "eternity", "light", "bee", "rose",
    "sky", "house", "door", "window", "garden", "orchard", "fly",
    "spider", "cricket", "daisy", "butterfly", "frost", "circumference"
  ];

  var dickinsonVerbs = [
    "perches", "sings", "stops", "keeps", "heard", "abash",
    "linger", "dwell", "flutter", "hum", "buzz", "drift",
    "alight", "descend", "ascend", "whisper", "tremble", "gleam"
  ];

  function generateDickinson(rng) {
    var noun = pick(dickinsonNouns, rng);
    var noun2 = pick(dickinsonNouns, rng);
    var verb = pick(dickinsonVerbs, rng);
    var lines = [];

    var templates = [
      [noun + " is the thing with " + noun2,
       "That " + verb + "s in the " + pick(dickinsonNouns, rng) + " --",
       "And " + pick(dickinsonVerbs, rng) + "s the tune without the " + pick(dickinsonNouns, rng) + " --",
       "And never " + pick(dickinsonVerbs, rng) + "s at all --",
       "",
       "I've " + pick(dickinsonVerbs, rng) + "ed it in the " + pick(dickinsonNouns, rng) + " --",
       "And on the strangest " + pick(dickinsonNouns, rng) + " --",
       "Yet -- never -- in Extremity --",
       "It asked a " + noun2 + " of me --"],
      ["The " + cap(noun) + " -- " + pick(dickinsonVerbs, rng) + "s -- in " + cap(noun2) + " --",
       "A " + pick(dickinsonNouns, rng) + " -- upon the " + pick(dickinsonNouns, rng) + " --",
       "That " + pick(dickinsonVerbs, rng) + "s -- and " + pick(dickinsonVerbs, rng) + "s -- and stays --",
       "Nor ever " + pick(dickinsonVerbs, rng) + "s -- away --",
       "",
       "This " + adj(pick(dickinsonNouns, rng)) + " " + pick(dickinsonNouns, rng) + " --",
       "That will not " + pick(dickinsonVerbs, rng) + " -- nor " + pick(dickinsonVerbs, rng) + " --",
       "Is all we know of " + cap(pick(dickinsonNouns, rng)) + " --",
       "Is all we need of " + cap(pick(dickinsonNouns, rng)) + " --"]
    ];

    lines = pick(templates, rng);

    return {
      title: cap(noun) + " is the thing with " + cap(noun2),
      author: "Emily Dickinson",
      language: "en",
      lines: lines
    };
  }

  function adj(word) {
    var last = word.charAt(word.length - 1);
    if (last === "e") return word.slice(0, -1) + "ed";
    if (last === "y") return word.slice(0, -1) + "ied";
    return word + "ed";
  }

  /* -- Whitman-style Generator -- */
  function generateWhitman(rng) {
    var bodies = ["body", "soul", "self", "heart", "spirit", "flesh", "blood", "bone"];
    var actions = ["sing", "celebrate", "chant", "praise", "wander", "sail", "march", "drift"];
    var scapes = ["America", "prairie", "river", "mountain", "city", "ocean", "road", "shore"];

    var b = pick(bodies, rng);
    var a = pick(actions, rng);
    var s = pick(scapes, rng);

    return {
      title: "I " + cap(a) + " the " + cap(b) + " " + pick(actions, rng),
      author: "Walt Whitman",
      language: "en",
      lines: [
        "I " + a + " the " + b + " electric,",
        "The " + pick(scapes, rng) + "s and " + pick(scapes, rng) + "s of " + s + ",",
        "The " + pick(bodies, rng) + " and the " + pick(bodies, rng) + " equal,",
        "",
        "I " + pick(actions, rng) + " the " + pick(scapes, rng) + " vast and open,",
        "The " + pick(bodies, rng) + " of the people, the " + pick(bodies, rng) + " of the land,",
        "For every atom belonging to me as good belongs to you.",
        "",
        "I " + pick(actions, rng) + " and " + pick(actions, rng) + " and " + pick(actions, rng) + ",",
        "I " + pick(actions, rng) + " the " + pick(bodies, rng) + " and the " + pick(bodies, rng) + ",",
        "The " + b + ", the " + pick(bodies, rng) + ", the " + pick(bodies, rng) + " -- all " + a + "ing."
      ]
    };
  }

  /* -- Neruda-style Generator (Spanish) -- */
  function generateNerudaStyle(rng) {
    var cosas = [
      "cebolla", "alcachofa", "tomate", "sal", "pan", "vino", "mar", "piedra",
      "pajaro", "ola", "fuego", "tierra", "luna", "ciruela", "limon", "naranja",
      "madera", "arena", "niebla", "campana", "mesa", "silla", "cuchara", "anillo",
      "calcetin", "tijeras", "reloj", "paraguas", "trompo", "cometa"
    ];
    var adjetivos = [
      "redondo", "oscuro", "luminoso", "simple", "profundo", "salvaje", "dulce",
      "amargo", "fragil", "eterno", "pequeño", "inmenso", "secreto", "desnudo",
      "mojado", "antiguo", "nuevo", "lento", "rapido", "suave"
    ];

    var cosa = pick(cosas, rng);
    var cosa2 = pick(cosas, rng);
    var adj1 = pick(adjetivos, rng);
    var adj2 = pick(adjetivos, rng);

    return {
      title: "Oda a la " + cap(cosa),
      author: "Pablo Neruda",
      language: "es",
      lines: [
        cap(cosa) + " " + adj1 + ",",
        cap(cosa) + " " + adj2 + ",",
        "te " + pick(["canto", "nombro", "toco", "miro", "saboreo", "celebres"], rng) + "",
        "",
        "como quien " + pick(["abre", "descubre", "inventa", "acaricia", "desnuda", "enciende"], rng),
        "un " + pick(["mundo", "sol", "secreto", "universo", "tesoro", "milagro"], rng),
        "en la " + cosa2 + ",",
        "",
        "porque eres",
        adj1 + " como la " + pick(cosas, rng),
        adj2 + " como el " + pick(cosas, rng),
        "",
        "y en tu " + pick(["centro", "corazon", "alma", "raiz", "esencia", "fondo"], rng),
        "vive el " + pick(["fuego", "canto", "silencio", "tiempo", "amor", "olvido"], rng)
      ]
    };
  }

  /* -- Machado-style Generator (Spanish) -- */
  function generateMachadoStyle(rng) {
    var sustantivos = [
      "camino", "tarde", "campo", "rio", "huerta", "plaza", "fuente", "torre",
      "galeria", "recuerdo", "sueño", "sombra", "viento", "olmo", "tierra", "alma",
      "ayer", "mañana", "soledad", "niebla", "lluvia", "polvo", "piedra", "misterio"
    ];
    var adjetivos = [
      "parda", "fria", "viejo", "clara", "sonora", "seca", "rota",
      "lenta", "honda", "solitaria", "callada", "triste", "dulce", "amarga",
      "polvorienta", "blanca", "oscura", "lejana", "perdida", "ultima"
    ];

    var s = pick(sustantivos, rng);
    var adj1 = pick(adjetivos, rng);

    return {
      title: cap(adj1) + " " + cap(s),
      author: "Antonio Machado",
      language: "es",
      lines: [
        "Es una " + pick(sustantivos, rng) + " " + adj1,
        "de " + pick(["invierno", "otoño", "verano", "primavera"], rng) + ". " + cap(pick(sustantivos, rng)) + ".",
        cap(pick(["monotonia", "melancolia", "soledad", "quietud", "serenidad"], rng)),
        "de " + pick(sustantivos, rng) + " tras los cristales.",
        "",
        "Es el " + pick(sustantivos, rng) + ". En un " + pick(["cartel", "muro", "banco", "suelo", "atril"], rng),
        "se " + pick(["representa", "dibuja", "inscribe", "graba", "pinta"], rng) + " la " + pick(sustantivos, rng),
        "fugitiva, y muerta la " + pick(["esperanza", "alegria", "inocencia", "infancia", "palabra"], rng) + ",",
        "junto a una " + pick(["mancha", "huella", "marca", "linea", "sombra"], rng) + " " + pick(["carmin", "carmesi", "ocre", "sepia", "gris"], rng) + ".",
        "",
        "Con " + pick(["timbre", "eco", "rumor", "golpe", "latido"], rng) + " " + pick(["sonoro", "hueco", "seco", "lento", "pausado"], rng),
        pick(["truena", "suena", "resuena", "vibra", "calla"], rng) + " el " + pick(["maestro", "viento", "recuerdo", "campo", "poema"], rng) + "."
      ]
    };
  }

  /* -- Blake-style Generator -- */
  function generateBlake(rng) {
    var animals = ["Tyger", "Lamb", "Eagle", "Lion", "Worm", "Serpent", "Dove", "Raven"];
    var elements = ["fire", "forest", "night", "deep", "sky", "star", "hand", "eye"];
    var animal = pick(animals, rng);

    return {
      title: "The " + animal,
      author: "William Blake",
      language: "en",
      lines: [
        animal + " " + animal + ", burning bright,",
        "In the " + pick(elements, rng) + "s of the " + pick(elements, rng) + ";",
        "What immortal " + pick(elements, rng) + " or " + pick(elements, rng) + ",",
        "Could frame thy fearful " + pick(["symmetry", "mystery", "energy", "destiny"], rng) + "?",
        "",
        "In what distant " + pick(elements, rng) + "s or " + pick(elements, rng) + "s",
        "Burnt the " + pick(elements, rng) + " of thine " + pick(elements, rng) + "s?",
        "On what wings dare he " + pick(["aspire", "desire", "conspire", "require"], rng) + "?",
        "What the " + pick(elements, rng) + ", dare seize the " + pick(elements, rng) + "?"
      ]
    };
  }

  /* -- Poe-style Generator -- */
  function generatePoeStyle(rng) {
    var nouns = [
      "raven", "dream", "shadow", "chamber", "door", "soul", "heart",
      "midnight", "ghost", "angel", "demon", "spectre", "sepulchre", "tomb",
      "Lenore", "Nevermore", "Annabel", "kingdom", "sea", "maiden"
    ];
    var adjs = [
      "dreary", "bleak", "grim", "ghastly", "pale", "sable", "spectral",
      "haunted", "lost", "dying", "ancient", "forgotten", "melancholy", "somber"
    ];

    var n = pick(nouns, rng);

    return {
      title: "The " + cap(pick(adjs, rng)) + " " + cap(n),
      author: "Edgar Allan Poe",
      language: "en",
      lines: [
        "Once upon a " + pick(["midnight", "evening", "twilight", "morning"], rng) + " " + pick(adjs, rng) + ",",
        "While I " + pick(["pondered", "wandered", "waited", "murmured"], rng) + ", " + pick(adjs, rng) + " and " + pick(adjs, rng) + ",",
        "Over many a " + pick(["quaint", "curious", "strange", "mystic"], rng) + " and " + pick(adjs, rng) + " volume",
        "Of " + pick(["forgotten", "hidden", "buried", "ancient"], rng) + " lore --",
        "",
        "While I " + pick(["nodded", "drifted", "listened", "trembled"], rng) + ", nearly " + pick(["napping", "weeping", "dreaming", "falling"], rng),
        "Suddenly there came a " + pick(["tapping", "rapping", "murmur", "whisper"], rng) + ",",
        "As of some one gently " + pick(["knocking", "calling", "sighing", "weeping"], rng) + ",",
        pick(["rapping", "tapping", "calling", "knocking"], rng) + " at my chamber " + pick(["door", "floor", "wall"], rng) + ".",
        "",
        "Tis some " + pick(["visitor", "phantom", "memory", "stranger"], rng) + ", I muttered,",
        "Only " + pick(["this", "that", "this and nothing more", "this and evermore"], rng) + "."
      ]
    };
  }

  /* -- Frost-style Generator -- */
  function generateFrostStyle(rng) {
    var scenes = ["wood", "road", "wall", "tree", "orchard", "pasture", "brook", "hill"];
    var actions = ["walk", "stand", "stop", "turn", "look", "wait", "mend", "climb"];

    var scene = pick(scenes, rng);
    var action = pick(actions, rng);

    return {
      title: "The " + cap(scene) + " Not " + cap(pick(actions, rng)),
      author: "Robert Frost",
      language: "en",
      lines: [
        "Two " + pick(scenes, rng) + "s diverged in a " + pick(["yellow", "golden", "dark", "deep"], rng) + " " + scene + ",",
        "And sorry I could not " + pick(["travel", "follow", "wander", "enter"], rng) + " both",
        "And be one " + pick(["traveler", "wanderer", "walker", "stranger"], rng) + ", long I " + pick(["stood", "paused", "waited", "looked"], rng),
        "And " + pick(["looked", "gazed", "peered", "stared"], rng) + " down one as far as I could",
        "To where it " + pick(["bent", "curved", "turned", "dipped"], rng) + " in the " + pick(["undergrowth", "distance", "shadows", "morning"], rng) + ";",
        "",
        "I shall be " + pick(["telling", "remembering", "thinking", "saying"], rng) + " this with a " + pick(["sigh", "smile", "pause", "breath"], rng),
        "Somewhere " + pick(["ages", "years", "days", "seasons"], rng) + " and " + pick(["ages", "years", "miles", "lifetimes"], rng) + " hence:",
        "Two " + pick(scenes, rng) + "s diverged in a " + scene + ", and I --",
        "I took the one less " + pick(["traveled", "followed", "worn", "known"], rng) + " by,",
        "And that has made all the " + pick(["difference", "difference", "difference", "difference"], rng) + "."
      ]
    };
  }

  /* -- Becquer-style Generator (Spanish) -- */
  function generateBecquerStyle(rng) {
    var sust = [
      "golondrina", "beso", "suspiro", "lagrima", "mirada", "sombra",
      "recuerdo", "nota", "eco", "luz", "flor", "ala", "suspiro", "aroma"
    ];
    var verbos = [
      "volveran", "regresaran", "tornaran", "llegaran", "brotaran",
      "renaceran", "floreceran", "cantaran", "brillaran", "sonaran"
    ];
    var s = pick(sust, rng);

    return {
      title: "Rima " + cap(pick(sust, rng)),
      author: "Gustavo Adolfo Becquer",
      language: "es",
      lines: [
        pick(verbos, rng) + " las " + pick(["oscuras", "blancas", "leves", "eternas", "dulces"], rng) + " " + s + "s",
        "en tu " + pick(["balcon", "jardin", "ventana", "alero", "tejado"], rng) + " sus " + pick(["nidos", "cantos", "vuelos", "besos"], rng) + " a " + pick(["colgar", "dejar", "posar", "buscar"], rng) + ",",
        "y otra vez con el " + pick(["ala", "vuelo", "canto", "beso"], rng) + " a sus cristales",
        pick(["jugando", "cantando", "volando", "temblando"], rng) + " " + pick(["llamaran", "volveran", "llegaran", "tocaran"], rng) + ".",
        "",
        "Pero aquellas que el " + pick(["vuelo", "paso", "canto", "rumbo"], rng) + " refrenaban",
        "tu " + pick(["hermosura", "belleza", "dulzura", "mirada"], rng) + " y mi " + pick(["dicha", "pena", "vida", "alma"], rng) + " a contemplar,",
        "aquellas que aprendieron nuestros " + pick(["nombres", "besos", "suenios", "versos"], rng) + ",",
        "esas... no " + pick(["volveran", "tornaran", "regresaran", "reviviran"], rng) + "."
      ]
    };
  }

  /* -- Mistral-style Generator (Spanish) -- */
  function generateMistralStyle(rng) {
    var sust = [
      "madre", "tierra", "agua", "luz", "nube", "nieve", "rama", "semilla",
      "leche", "miel", "trigo", "viento", "cuna", "raiz", "flor", "fruto",
      "piedra", "ceniza", "grito", "arrullo"
    ];

    var s = pick(sust, rng);

    return {
      title: "La " + cap(s) + " " + pick(["dormida", "despierta", "cantando", "callada", "herida", "renacida"], rng),
      author: "Gabriela Mistral",
      language: "es",
      lines: [
        cap(s) + " " + pick(["dulce", "amarga", "profunda", "suave", "firme", "clara"], rng) + ",",
        "como el " + pick(["pan", "vino", "agua", "trigo", "sol"], rng) + " de cada dia,",
        "como la " + pick(sust, rng) + " que " + pick(["brota", "crece", "canta", "suena", "vuela"], rng),
        "sin " + pick(["prisa", "nombre", "duena", "patria", "rumbo"], rng) + ".",
        "",
        "Te " + pick(["llevo", "siento", "guardo", "nombro", "beso"], rng) + "",
        "como se " + pick(["lleva", "guarda", "siente", "cuida"], rng) + " la " + pick(["infancia", "memoria", "herida", "dicha"], rng) + ",",
        "como se " + pick(["respira", "camina", "espera", "suena"], rng) + "",
        "sin " + pick(["saberlo", "quererlo", "nombrarlo", "pensarlo"], rng) + "."
      ]
    };
  }

  /* ---- Attribution List ---- */
  var authors = [
    { name: "William Shakespeare", lang: "en", gen: generateShakespeare },
    { name: "Emily Dickinson", lang: "en", gen: generateDickinson },
    { name: "Walt Whitman", lang: "en", gen: generateWhitman },
    { name: "William Blake", lang: "en", gen: generateBlake },
    { name: "Edgar Allan Poe", lang: "en", gen: generatePoeStyle },
    { name: "Robert Frost", lang: "en", gen: generateFrostStyle },
    { name: "Pablo Neruda", lang: "es", gen: generateNerudaStyle },
    { name: "Antonio Machado", lang: "es", gen: generateMachadoStyle },
    { name: "Gustavo Adolfo Becquer", lang: "es", gen: generateBecquerStyle },
    { name: "Gabriela Mistral", lang: "es", gen: generateMistralStyle }
  ];

  /* ---- Spanish Author Generators for ES mode ---- */

  var authorsES = [
    { name: "Pablo Neruda", lang: "es", gen: generateNerudaStyle },
    { name: "Antonio Machado", lang: "es", gen: generateMachadoStyle },
    { name: "Gustavo Adolfo Becquer", lang: "es", gen: generateBecquerStyle },
    { name: "Gabriela Mistral", lang: "es", gen: generateMistralStyle }
  ];

  /* ---- Public API ---- */

  var REAL_COUNT = realPoems.length;
  var TOTAL = 1000;

  function generate(index, lang) {
    lang = lang || "en";

    if (lang === "es") {
      // In ES mode: use original Spanish-language real poems + ES author generators
      if (index < realPoems.length) {
        // Return Spanish-original poems as-is, translate English-original ones
        var enPoem = realPoems[index];
        if (enPoem.language === "es") {
          return enPoem;
        }
        // For English real poems in ES mode, return a generated ES poem instead
        // using the same index seed for determinism
        var rngES = mulberry32(index * 1000);
        return generateNerudaStyle(rngES);
      }

      var adjES = index - realPoems.length;
      var slotES = adjES % authorsES.length;
      var aES = authorsES[slotES];
      var seedES = Math.floor(adjES / authorsES.length);
      var rngES2 = mulberry32(seedES * 100 + slotES);
      var poemES = aES.gen(rngES2);
      poemES.author = aES.name;
      poemES.language = "es";
      poemES.id = index;
      return poemES;
    }

    if (index < realPoems.length) {
      return realPoems[index];
    }

    var adjustedIndex = index - realPoems.length;
    var authorSlot = adjustedIndex % authors.length;
    var author = authors[authorSlot];
    var seed = Math.floor(adjustedIndex / authors.length);
    var rng = mulberry32(seed * 100 + authorSlot);

    var poem = author.gen(rng);
    poem.author = author.name;
    poem.language = author.lang;
    poem.id = index;

    return poem;
  }

  function selfCheck() {
    var p0 = generate(0);
    var p0es = generate(0, "es");
    var p30 = generate(30);
    var p999 = generate(999);
    return {
      realPoem0: p0.author,
      realPoem0ES: p0es.author,
      generated30: p30.author,
      generated999: p999.author,
      total: TOTAL,
      realCount: REAL_COUNT
    };
  }

  return {
    generate: generate,
    selfCheck: selfCheck,
    TOTAL: TOTAL,
    REAL_COUNT: REAL_COUNT
  };
})();
