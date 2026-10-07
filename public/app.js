/* World Events — χάρτης + timeline + γεγονότα
 * Ο χρόνος μετριέται σε μήνες από το START_YEAR, ώστε η κίνηση να είναι ομαλή.
 */
(function () {
  "use strict";

  // ---------- Config ----------
  const START_YEAR = -2999; // αστρονομικό έτος (0 = 1 π.Χ.), δηλαδή 3000 π.Χ.
  const END_YEAR = 2026;
  const TOTAL_MONTHS = (END_YEAR - START_YEAR + 1) * 12;
  // Μη γραμμική μπάρα: [από έτος, έως έτος, ποσοστό της μπάρας].
  // Η αρχαιότητα έχει λίγα γεγονότα και πολλούς αιώνες, οπότε τρέχει γρηγορότερα.
  const SEGMENTS = [
    [-2999, -499, 0.18],
    [-499, 501, 0.16],
    [501, 1500, 0.20],
    [1500, 1900, 0.23],
    [1900, END_YEAR + 1, 0.23],
  ];
  const TRACK_MAX = 100000;
  // Διάρκεια όλης της μπάρας στο 1×, ρυθμισμένη ώστε μετά το 1900 να περνά 1 έτος ανά δευτερόλεπτο
  const TRACK_SECONDS = (END_YEAR + 1 - 1900) / 0.23;
  const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  const MONTHS = {
    el: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };
  // Κείμενα διεπαφής ανά γλώσσα
  const UI = {
    el: {
      subtitle: "Η ιστορία του κόσμου, 3000 π.Χ. – σήμερα", filters: "Φίλτρα", filtersBtn: "☰ Φίλτρα",
      hide: "Απόκρυψη", hideFilters: "Απόκρυψη φίλτρων", showFilters: "Εμφάνιση φίλτρων",
      search: "Αναζήτηση", searchPh: "Αναζήτηση: γεγονός, φυτό, ζώο, θρησκεία…",
      events: "Γεγονότα", all: "Όλα", none: "Κανένα", fold: "Σύμπτυξη/ανάπτυξη",
      borders: "Σύνορα:", creditNote: "(GPL-3.0, κατά προσέγγιση)", loadingBorders: "Φόρτωση συνόρων…",
      now: "Συμβαίνει τώρα", hidePanel: "Απόκρυψη πάνελ", pressPlay: "Πάτησε «Επόμενο γεγονός» για να ξεκινήσει η ιστορία.",
      loadingMap: "Φόρτωση χάρτη…", loadError: "Αποτυχία φόρτωσης χάρτη. Έλεγξε τη σύνδεση και κάνε ανανέωση.",
      prevYear: "Προηγούμενο γεγονός", nextYear: "Επόμενο γεγονός", prevEvent: "Προηγούμενο γεγονός", nextEvent: "Επόμενο γεγονός", prevEventShort: "Προηγ.", nextEventShort: "Επόμ.", trackAria: "Θέση στο timeline",
      featuredOnly: "Μόνο τα μεγαλύτερα γεγονότα", featuredOnlyShort: "Μεγαλύτερα", region: "Ήπειρος", regionAll: "Όλες οι ήπειροι", tourStop: "Στάση", tourNext: "Επόμενη στάση ›", tourPrev: "‹ Προηγούμενη", tourRestart: "↻ Από την αρχή",
      game: "Παιχνίδι", gameShort: "Παιχνίδι", gameWelcome: "Πόσο καλά ξέρεις την ιστορία;",
      gameRules: "10 ερωτήσεις. Άλλοτε διαλέγεις ανάμεσα σε 4 απαντήσεις, άλλοτε τοποθετείς ένα παράθυρο 100 ετών πάνω στο timeline για να πεις πότε έγινε ένα γεγονός.",
      gameSingle: "Ένας παίκτης", gameDual: "Δύο παίκτες", gameRound: "Ερώτηση {n} / {total}", gamePlayer: "Παίκτης {n}", gameScore: "Πόντοι",
      gameQYear: "Ποιο γεγονός συνέβη το {year};", gameQWhere: "Σε ποια ήπειρο συνέβη: {event};", gameQWhen: "Πότε συνέβη: {event};",
      gameTlHint: "Σύρε το timeline κάτω ώστε το κίτρινο παράθυρο των 100 ετών να καλύπτει τη σωστή εποχή και πάτα «Απάντηση». Με τα βελάκια ← → μετακινείσαι 10 χρόνια.",
      gameAnswer: "Απάντηση", gameCorrect: "Σωστό! +1", gameWrong: "Λάθος", gameAnswerWas: "Σωστή απάντηση: {answer}", gameOff: "απόκλιση {n} έτη",
      gameNext: "Επόμενη ερώτηση", gameResults: "Αποτελέσματα", gameFinalSingle: "Σκορ: {score} / {total}", gameTie: "Ισοπαλία!", gameWinner: "Νικητής: Παίκτης {n}!", gameAgain: "Ξανά",
      videoCredit: "Βίντεο:", soundOn: "Ήχος: ενεργός (κλικ για σίγαση)", volume: "Ένταση ήχου", narrate: "Αφήγηση", soundOff: "Ήχος: σίγαση (κλικ για ενεργοποίηση)",
      storyAria: "Ιστορία γεγονότος", close: "Κλείσιμο", readMore: "Διάβασε περισσότερα στη Wikipedia",
      wikiLoading: "Φόρτωση από τη Wikipedia…", wikiFail: "Δεν βρέθηκε άρθρο στη Wikipedia.",
      wikiOtherLang: "Το άρθρο υπάρχει μόνο στα αγγλικά.", wikiCredit: "Εικόνα: Wikipedia / Wikimedia Commons",
      map: "Χάρτης", projection: "Προβολή", projFlat: "Επίπεδος", projGlobe: "Υδρόγειος",
      bc: "π.Χ.", under: "υπό:", noResults: "Κανένα αποτέλεσμα", result: "αποτέλεσμα", results: "αποτελέσματα",
      first: "πρώτα", clickToGo: "κλικ για μετάβαση",
    },
    en: {
      subtitle: "The history of the world, 3000 BC – today", filters: "Filters", filtersBtn: "☰ Filters",
      hide: "Hide", hideFilters: "Hide filters", showFilters: "Show filters",
      search: "Search", searchPh: "Search: event, plant, animal, religion…",
      events: "Events", all: "All", none: "None", fold: "Collapse/expand",
      borders: "Borders:", creditNote: "(GPL-3.0, approximate)", loadingBorders: "Loading borders…",
      now: "Happening now", hidePanel: "Hide panel", pressPlay: "Press 'Next event' to start the story.",
      loadingMap: "Loading map…", loadError: "Failed to load the map. Check your connection and refresh.",
      prevYear: "Previous event", nextYear: "Next event", prevEvent: "Previous event", nextEvent: "Next event", prevEventShort: "Prev", nextEventShort: "Next", trackAria: "Timeline position",
      featuredOnly: "Biggest events only", featuredOnlyShort: "Biggest", region: "Continent", regionAll: "All continents", tourStop: "Stop", tourNext: "Next stop ›", tourPrev: "‹ Previous", tourRestart: "↻ Start over",
      game: "Game", gameShort: "Game", gameWelcome: "How well do you know history?",
      gameRules: "10 questions. Sometimes you pick one of 4 answers, sometimes you place a 100-year window on the timeline to say when an event happened.",
      gameSingle: "Single player", gameDual: "Two players", gameRound: "Question {n} / {total}", gamePlayer: "Player {n}", gameScore: "Score",
      gameQYear: "Which event happened in {year}?", gameQWhere: "On which continent did this happen: {event}?", gameQWhen: "When did this happen: {event}?",
      gameTlHint: "Drag the timeline below so the yellow 100-year window covers the right period, then press Answer. Arrow keys ← → move 10 years.",
      gameAnswer: "Answer", gameCorrect: "Correct! +1", gameWrong: "Wrong", gameAnswerWas: "Correct answer: {answer}", gameOff: "{n} years off",
      gameNext: "Next question", gameResults: "Results", gameFinalSingle: "Score: {score} / {total}", gameTie: "It's a tie!", gameWinner: "Winner: Player {n}!", gameAgain: "Play again",
      videoCredit: "Video:", soundOn: "Sound: on (click to mute)", volume: "Volume", narrate: "Narration", soundOff: "Sound: muted (click to unmute)",
      storyAria: "Event story", close: "Close", readMore: "Read more on Wikipedia",
      wikiLoading: "Loading from Wikipedia…", wikiFail: "No Wikipedia article found.",
      wikiOtherLang: "The article is only available in Greek.", wikiCredit: "Image: Wikipedia / Wikimedia Commons",
      map: "Map", projection: "Projection", projFlat: "Flat", projGlobe: "Globe",
      bc: "BC", under: "under:", noResults: "No results", result: "result", results: "results",
      first: "first", clickToGo: "click to jump",
    },
  };
  const t = (k) => (UI[state.lang] && UI[state.lang][k]) || UI.el[k] || k;
  // Μέγιστες ετικέτες ταυτόχρονα στον χάρτη (λιγότερες σε μικρές οθόνες)
  const maxLabels = () => (width() < 600 ? 4 : width() < 1000 ? 6 : 9);

  // label = τρέχουσα γλώσσα (ορίζεται από το setLang)
  const TYPES = {
    war: { el: "Πόλεμος", en: "War", icon: "💂" },
    revolution: { el: "Επανάσταση", en: "Revolution", icon: "✊" },
    politics: { el: "Πολιτική", en: "Politics", icon: "🏛️" },
    exploration: { el: "Εξερεύνηση", en: "Exploration", icon: "⛵" },
    science: { el: "Επιστήμη", en: "Science", icon: "🔬" },
    culture: { el: "Πολιτισμός", en: "Culture", icon: "🎨" },
    economy: { el: "Οικονομία", en: "Economy", icon: "💰" },
    religion: { el: "Θρησκεία", en: "Religion", icon: "🕊️" },
    tragedy: { el: "Ανθρωπογενής καταστροφή", en: "Man-made disaster", icon: "☢️" },
    disaster: { el: "Φυσική καταστροφή", en: "Natural disaster", icon: "🌋" },
    crop: { el: "Καλλιέργειες & φυτά", en: "Crops & plants", icon: "🌾" },
    tree: { el: "Δέντρα", en: "Trees", icon: "🌳" },
    spice: { el: "Ποτά & μπαχαρικά", en: "Drinks & spices", icon: "☕" },
    animal: { el: "Ζώα", en: "Animals", icon: "🐾" },
  };
  Object.values(TYPES).forEach((v) => { v.label = v.el; });
  // Κατηγορίες φίλτρων (sidebar): κάθε τύπος ανήκει σε μία κατηγορία
  const CATEGORIES = [
    { id: "human", el: "Άνθρωπος", en: "Humans", label: "Άνθρωπος", icon: "🧑", types: ["war", "revolution", "politics", "exploration", "science", "culture", "economy", "religion", "tragedy"] },
    { id: "nature", el: "Φύση", en: "Nature", label: "Φύση", icon: "🌍", types: ["disaster", "crop", "tree", "spice", "animal"] },
  ];

  // Παλέτα χωρών (ήπια «ζωγραφισμένα» χρώματα πάνω σε σκούρο ωκεανό)
  const LAND_PALETTE = ["#355a86", "#2e7066", "#5e4b8b", "#8c5a3a", "#4f7a3a", "#8a3f5f", "#3c7a8c", "#8a7a35"];

  // ---------- State ----------
  const state = {
    t: 0,
    zoomK: 1,
    hiddenTypes: new Set(),
    panelKey: "",
    historical: true,
    lang: "el",
    proj: "flat",
    featuredOnly: true, // by default μόνο τα μεγαλύτερα γεγονότα
    region: null, // επιλεγμένη ήπειρος (key από continents.js) ή null = όλες
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const els = {
    mapWrap: $("#map-wrap"),
    svg: d3.select("#map"),
    tooltip: $("#tooltip"),
    loading: $("#loading"),
    stepBack: $("#step-back"),
    stepFwd: $("#step-fwd"),
    year: $("#year"),
    month: $("#month"),
    era: $("#era"),
    track: $("#track"),
    ticks: $("#ticks"),
    eventMarks: $("#event-marks"),
    labelStart: $("#label-start"),
    labelEnd: $("#label-end"),
    search: $("#search"),
    searchMeta: $("#search-meta"),
    searchResults: $("#search-results"),
    filters: $("#filters"),
    filtersAll: $("#filters-all"),
    filtersNone: $("#filters-none"),
    sidebar: $("#sidebar"),
    sidebarOpen: $("#sidebar-open"),
    searchOpen: $("#search-open"),
    sidebarClose: $("#sidebar-close"),
    panel: $("#panel"),
    panelList: $("#panel-list"),
    panelCount: $("#panel-count"),
    panelToggle: $("#panel-toggle"),
    lang: $("#lang"),
    proj: $("#proj"),
    story: $("#story"),
    storyType: $("#story-type"),
    storyClose: $("#story-close"),
    storyBody: $("#story-body"),
    storyMedia: $("#story-media"),
    storyTitle: $("#story-title"),
    storyMeta: $("#story-meta"),
    storyDesc: $("#story-desc"),
    storyWiki: $("#story-wiki"),
    storyLinks: $("#story-links"),
    storyFeature: $("#story-feature"),
    postcard: $("#postcard"),
    postcardImg: $("#postcard-img"),
    postcardCap: $("#postcard-cap"),
    featuredOnly: $("#featured-only"),
    intro: $("#intro"), introYear: $("#intro-year"), introTitle: $("#intro-title"),
    cinema: $("#cinema"), cinemaBackdrop: $("#cinema-backdrop"), cinemaType: $("#cinema-type"), cinemaMeta: $("#cinema-meta"),
    cinemaTitle: $("#cinema-title"), cinemaMedia: $("#cinema-media"), cinemaCap: $("#cinema-cap"), cinemaCredit: $("#cinema-credit"),
    cinemaClose: $("#cinema-close"), cinemaNarrate: $("#cinema-narrate"), cinemaDesc: $("#cinema-desc"), cinemaWiki: $("#cinema-wiki"), cinemaLinks: $("#cinema-links"),
    region: $("#region"),

    histLoading: $("#hist-loading"),
  };

  // ---------- Time helpers ----------
  function monthsToDate(m) {
    const whole = Math.floor(m);
    return { year: START_YEAR + Math.floor(whole / 12), month: whole % 12 };
  }
  // "YYYY", "YYYY-MM", "YYYY-MM-DD" και αρνητικά έτη για π.Χ. ("-480" = 480 π.Χ.)
  function parseDate(dateStr) {
    const m = /^(-?\d+)(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(String(dateStr).trim());
    if (!m) return { y: START_YEAR, mo: 0, d: 1 };
    let y = Number(m[1]);
    if (y < 0) y += 1; // 1 π.Χ. = έτος 0
    return { y, mo: (Number(m[2]) || 1) - 1, d: Number(m[3]) || 1 };
  }
  function dateToMonths(dateStr) {
    const { y, mo, d } = parseDate(dateStr);
    return (y - START_YEAR) * 12 + mo + (d - 1) / 31;
  }
  function clampT(t) {
    return Math.max(0, Math.min(TOTAL_MONTHS - 1, t));
  }
  function yearLabel(astroYear) {
    return astroYear <= 0 ? 1 - astroYear + " " + t("bc") : String(astroYear);
  }
  function yearOf(dateStr) {
    return yearLabel(parseDate(dateStr).y);
  }
  function ordinalEn(n) {
    const m10 = n % 10, m100 = n % 100;
    const sfx = m10 === 1 && m100 !== 11 ? "st" : m10 === 2 && m100 !== 12 ? "nd" : m10 === 3 && m100 !== 13 ? "rd" : "th";
    return n + sfx;
  }
  function eraLabel(year) {
    const bc = year <= 0;
    const c = bc ? Math.floor(-year / 100) + 1 : Math.floor((year - 1) / 100) + 1;
    if (state.lang === "en") return ordinalEn(c) + " century" + (bc ? " BC" : "");
    return (c === 20 ? "20ός" : c + "ος") + " αιώνας" + (bc ? " π.Χ." : "");
  }

  // Αντιστοίχιση μηνών <-> θέσης στη μπάρα (μη γραμμική)
  function segBounds(seg) {
    return [(seg[0] - START_YEAR) * 12, (seg[1] - START_YEAR) * 12, seg[2]];
  }
  function monthsToTrack(m) {
    let acc = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const [a, b, f] = segBounds(SEGMENTS[i]);
      if (m <= b || i === SEGMENTS.length - 1) return (acc + (f * (m - a)) / (b - a)) * TRACK_MAX;
      acc += f;
    }
    return TRACK_MAX;
  }
  function trackToMonths(u) {
    u /= TRACK_MAX;
    let acc = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const [a, b, f] = segBounds(SEGMENTS[i]);
      if (u <= acc + f || i === SEGMENTS.length - 1) return a + ((u - acc) / f) * (b - a);
      acc += f;
    }
    return TOTAL_MONTHS - 1;
  }
  // Μήνες ανά δευτερόλεπτο στο 1× για τη δεδομένη στιγμή
  function rateAt(m) {
    for (let i = 0; i < SEGMENTS.length; i++) {
      const [a, b, f] = segBounds(SEGMENTS[i]);
      if (m < b || i === SEGMENTS.length - 1) return (b - a) / (f * TRACK_SECONDS);
    }
    return 12;
  }
  // Βήμα χρόνου με Shift+βελάκια (σε μήνες)
  function playRate() {
    return 12;
  }
  // Βήμα με τα βελάκια: 1 έτος, ή μισό δευτερόλεπτο αναπαραγωγής σε μεγάλες ταχύτητες
  function stepMonths() {
    return Math.max(12, Math.round((playRate() * 0.5) / 12) * 12);
  }

  // ---------- Events data ----------
  // Ήπειροι (continents.js): κάθε γεγονός κατατάσσεται σε μία, για το φίλτρο «Ήπειρος»
  const CONTINENTS = window.WORLD_CONTINENTS || { list: [], classify: () => null };
  const EVENTS = (Array.isArray(window.WORLD_EVENTS) ? window.WORLD_EVENTS : [])
    .filter((e) => e.lat != null && e.lng != null && e.start && TYPES[e.type])
    .map((e) => ({ ...e, s: dateToMonths(e.start), e: e.end ? dateToMonths(e.end) : null, _cont: CONTINENTS.classify(e.lng, e.lat) }))
    .sort((a, b) => a.s - b.s);
  // Φίλτρο ηπείρου: με επιλεγμένη ήπειρο φαίνονται μόνο τα γεγονότα της· χωρίς επιλογή κρύβονται
  // τα «τοπικά» γεγονότα (regional.js), που έχουν νόημα μόνο μέσα στην ήπειρό τους.
  const regionOk = (ev) => (state.region ? ev._cont === state.region : !ev.regional);
  // Κορυφαία γεγονότα με βίντεο / 3D / μίνι ιστορία (featured.js)
  const FEATURED = window.WORLD_FEATURED || {};
  // Κείμενα ανά γλώσσα: τα ελληνικά είναι στα αρχεία δεδομένων, τα αγγλικά στο window.WORLD_EVENTS_EN
  {
    const EN = window.WORLD_EVENTS_EN || {};
    EVENTS.forEach((ev) => {
      ev.el = { title: ev.title, description: ev.description };
      ev.en = EN[ev.id] ? { title: EN[ev.id][0], description: EN[ev.id][1] } : null;
    });
  }

  function activeEvents(t) {
    const out = [];
    for (const ev of EVENTS) {
      if (ev.s > t) break; // ταξινομημένα κατά έναρξη
      if (state.hiddenTypes.has(ev.type)) continue;
      if (state.featuredOnly && !FEATURED[ev.id]) continue;
      if (!regionOk(ev)) continue;
      // ορατό μόνο μέσα στο ημερολογιακό έτος που ξεκίνησε (ή ως το τέλος του, αν διαρκεί περισσότερο)
      const yearEnd = (Math.floor(ev.s / 12) + 1) * 12;
      const end = ev.e != null ? Math.max(ev.e, yearEnd) : yearEnd;
      if (t >= end) continue;
      const age = t - ev.s;
      out.push({ ev, age, labeled: true, opacity: 1, fresh: age < 6 });
    }
    // Ταμπέλα μόνο για το πιο πρόσφατο γεγονός (ή όσα ξεκίνησαν την ίδια στιγμή): μόλις εμφανιστεί
    // το επόμενο, η παλιά ταμπέλα κρύβεται (το γεγονός μένει στο «Συμβαίνει τώρα» ως το τέλος της χρονολογίας του).
    const newest = out.reduce((m, a) => Math.max(m, a.ev.s), -Infinity);
    out.forEach((a) => { a.labeled = a.ev.s === newest; });
    out.filter((a) => a.labeled).forEach((a, i) => { if (i >= maxLabels()) a.labeled = false; });
    return out;
  }

  // ---------- Map ----------
  const width = () => els.mapWrap.clientWidth;
  const height = () => els.mapWrap.clientHeight;

  // Προβολές: «επίπεδος» (ισαπέχουσα ορθογώνια) ή «υδρόγειος» (ορθογραφική σφαίρα)
  const PROJECTIONS = {
    flat: () => d3.geoEquirectangular(),
    globe: () => d3.geoOrthographic().clipAngle(90).rotate([-20, -28, 0]).precision(0.3),
  };
  const isGlobe = () => state.proj === "globe";
  // Κέντρο της ορατής πλευράς της υδρογείου (lng, lat)
  const globeCenter = () => { const r = projection.rotate(); return [-r[0], -r[1]]; };
  // Είναι το σημείο στην ορατή πλευρά της υδρογείου;
  const onFront = (lng, lat) => !isGlobe() || d3.geoDistance([lng, lat], globeCenter()) < Math.PI / 2 - 0.03;
  // Κεντραρισμένη κλιμάκωση (η υδρόγειος μένει πάντα στο κέντρο· η μετακίνηση γίνεται περιστροφή)
  const centeredTransform = (k) => d3.zoomIdentity.translate(((1 - k) * width()) / 2, ((1 - k) * height()) / 2).scale(k);
  let projection = PROJECTIONS.flat();
  let path = d3.geoPath(projection);
  // Δίχτυ ασφαλείας για την υδρόγειο: το d3 μερικές φορές «γεμίζει» ολόκληρο τον δίσκο με ένα πολύγωνο που
  // βρίσκεται στην πίσω πλευρά (εκφυλισμένα δεδομένα, σημεία στον πόλο κ.λπ.) και κρύβει όλη την ήπειρο.
  // Σχεδιάζουμε με δικό μας context που μετράει και το bounding box· αν ένα πολύγωνο μικρότερο από μισή
  // σφαίρα καλύπτει ολόκληρο τον δίσκο, είναι σφάλμα αποκοπής και δεν σχεδιάζεται.
  const track = {
    s: "", x0: 0, y0: 0, x1: 0, y1: 0,
    reset() { this.s = ""; this.x0 = this.y0 = Infinity; this.x1 = this.y1 = -Infinity; },
    p(x, y) {
      if (x < this.x0) this.x0 = x; if (x > this.x1) this.x1 = x;
      if (y < this.y0) this.y0 = y; if (y > this.y1) this.y1 = y;
      return Math.round(x * 1000) / 1000 + "," + Math.round(y * 1000) / 1000;
    },
    moveTo(x, y) { this.s += "M" + this.p(x, y); },
    lineTo(x, y) { this.s += "L" + this.p(x, y); },
    closePath() { this.s += "Z"; },
    arc(x, y, r) { this.s += "M" + this.p(x + r, y) + "A" + r + "," + r + " 0 1,1 " + this.p(x - r, y) + "A" + r + "," + r + " 0 1,1 " + this.p(x + r, y); },
  };
  let pathTrack = d3.geoPath(projection, track);
  let discBox = null; // bounding box της σφαίρας στην τρέχουσα προβολή (μόνο στην υδρόγειο)
  function safePath(f) {
    if (!discBox) return path(f);
    track.reset();
    pathTrack(f);
    if (!track.s) return null;
    const full = track.x0 <= discBox[0][0] + 1 && track.y0 <= discBox[0][1] + 1 && track.x1 >= discBox[1][0] - 1 && track.y1 >= discBox[1][1] - 1;
    if (full) {
      if (f._sr == null) f._sr = d3.geoArea(f);
      if (f._sr < 2 * Math.PI) return null;
    }
    return track.s;
  }

  const gRoot = els.svg.append("g").attr("class", "root");
  const gSphere = gRoot.append("path").attr("class", "sphere");
  const gGrat = gRoot.append("path").attr("class", "graticule");
  const gCountries = gRoot.append("g").attr("class", "countries");
  const gHist = gRoot.append("g").attr("class", "hist-layer");
  const gEvents = gRoot.append("g").attr("class", "events-layer");
  const gFx = gRoot.append("g").attr("class", "fx");
  const gTour = gRoot.append("g").attr("class", "tour-layer");

  let countriesFeatures = [];
  let countryColors = new Map();
  let countryNames = new Map();

  const zoom = d3
    .zoom()
    .scaleExtent([1, 14])
    .on("start", () => { rotStart = projection.rotate(); })
    .on("zoom", (ev) => {
      let tr = ev.transform;
      if (isGlobe()) {
        const c = centeredTransform(tr.k);
        const dx = tr.x - c.x, dy = tr.y - c.y; // σωρευτική μετατόπιση από την αρχή της κίνησης
        if (ev.sourceEvent && rotStart && (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01)) {
          const s = 75 / (projection.scale() * tr.k);
          projection.rotate([rotStart[0] + dx * s, Math.max(-90, Math.min(90, rotStart[1] - dy * s)), 0]);
          scheduleGlobeRedraw();
        }
        els.svg.node().__zoom = c; // η υδρόγειος παραμένει κεντραρισμένη
        tr = c;
      }
      gRoot.attr("transform", tr);
      state.zoomK = tr.k;
      gEvents.selectAll("g.ev .body").attr("transform", bodyTransform);
      // κουκκίδα και παλμός κρατούν σταθερό μέγεθος στην οθόνη
      gEvents.selectAll("g.ev .anchor").attr("r", 3.2 * bodyScale());
      gEvents.selectAll("g.ev .pulse").attr("r", 6 * bodyScale());
      placeLabels();
      positionPostcard();
      gTour.selectAll("g.tour-stop").attr("transform", (d) => "translate(" + d[0] + "," + d[1] + ") scale(" + bodyScale() + ")");
    });
  let rotStart = null;
  // Το σύρσιμο στέλνει πολλά zoom events ανά καρέ· η επανασχεδίαση γίνεται μία φορά ανά καρέ
  let globeRedrawPending = false;
  function scheduleGlobeRedraw() {
    if (globeRedrawPending) return;
    globeRedrawPending = true;
    requestAnimationFrame(() => { globeRedrawPending = false; redrawGlobe(); });
  }
  // Επανασχεδίαση μετά από περιστροφή της υδρογείου (σύνορα, γεγονότα, διαδρομή tour)
  function redrawGlobe() {
    redrawMap();
    positionPostcard();
    if (tour) drawTour(tour.f.stops.slice(0, tour.i + 1), tour.f.color);
  }
  // Ομαλή περιστροφή της υδρογείου ώστε το σημείο να έρθει στο κέντρο
  function rotateTo(lng, lat, dur = 900) {
    if (!isGlobe()) return;
    const r0 = projection.rotate();
    const r1 = [-lng, -lat, 0];
    while (r1[0] - r0[0] > 180) r1[0] -= 360;
    while (r1[0] - r0[0] < -180) r1[0] += 360;
    const ip = d3.interpolate([r0[0], r0[1], 0], r1);
    els.svg.transition("rotate").duration(dur).ease(d3.easeCubicInOut)
      .tween("rotate", () => (t) => { projection.rotate(ip(t)); redrawGlobe(); });
  }
  els.svg.call(zoom).on("dblclick.zoom", null);

  function fitProjection() {
    const w = width();
    const h = height();
    els.svg.attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    projection.fitExtent([[12, 12], [w - 12, h - 12]], { type: "Sphere" });
    // Επίπεδος: στο πλήρες zoom out ο χάρτης μένει κεντραρισμένος· μετακίνηση μόνο όταν έχει γίνει zoom in,
    // και ποτέ πέρα από τα όρια του χάρτη. Υδρόγειος: η μετακίνηση γίνεται περιστροφή (και στο πλήρες zoom out),
    // οπότε δεν περιορίζεται· η σφαίρα κεντράρεται ξανά σε κάθε zoom event.
    const inf = Infinity;
    zoom.extent([[0, 0], [w, h]]).translateExtent(isGlobe() ? [[-inf, -inf], [inf, inf]] : [[0, 0], [w, h]]);
    els.svg.call(zoom.transform, d3.zoomTransform(els.svg.node()));
    redrawMap();
    positionPostcard();
    if (tour) drawTour(tour.f.stops.slice(0, tour.i + 1), tour.f.color);
  }

  // ---------- Ιστορία γεγονότος: popup με κείμενο και εικόνα από τη Wikipedia ----------
  const WIKI = window.WORLD_WIKI || {};
  const wikiCache = new Map();
  let storyEv = null;
  let storySeq = 0;
  let tour = null;     // { ev, f, i } ενεργή μίνι ιστορία
  let postcardAt = null; // { lng, lat } της καρτ ποστάλ πάνω στον χάρτη
  const isMobile = () => window.matchMedia("(max-width: 820px)").matches;
  function fetchSummary(lang, title) {
    const key = lang + ":" + title;
    if (!wikiCache.has(key)) {
      const url = "https://" + lang + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_"));
      wikiCache.set(key, fetch(url, { headers: { Accept: "application/json" } }).then((r) => (r.ok ? r.json() : null)).catch(() => null));
    }
    return wikiCache.get(key);
  }
  // Ολόκληρο το άρθρο σε απλό κείμενο (TextExtracts API), με τις επικεφαλίδες ως "== Τίτλος =="
  function fetchExtract(lang, title) {
    const key = "x:" + lang + ":" + title;
    if (!wikiCache.has(key)) {
      const url = "https://" + lang + ".wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&format=json&formatversion=2&origin=*&titles=" + encodeURIComponent(title);
      wikiCache.set(key, fetch(url).then((r) => (r.ok ? r.json() : null)).then((j) => {
        const p = j && j.query && j.query.pages && j.query.pages[0];
        return p && p.extract ? p.extract : null;
      }).catch(() => null));
    }
    return wikiCache.get(key);
  }
  // Απλό κείμενο άρθρου -> HTML: παράγραφοι και ενότητες (χωρίς Παραπομπές / Εξωτερικούς συνδέσμους κ.λπ.)
  const WIKI_SKIP = /^(παραπομπές|σημειώσεις|βιβλιογραφία|πηγές|εξωτερικοί σύνδεσμοι|δείτε επίσης|περαιτέρω ανάγνωση|references|notes|bibliography|sources|external links|see also|further reading|citations|footnotes|gallery|εικόνες)$/i;
  function extractToHtml(text, maxChars = 12000) {
    const out = [];
    let used = 0, skipping = false;
    for (const raw of text.split(/\n+/)) {
      const line = raw.trim();
      if (!line) continue;
      const h = line.match(/^(={2,6})\s*(.+?)\s*\1$/);
      if (h) {
        if (h[1].length === 2) skipping = WIKI_SKIP.test(h[2]);
        if (skipping) continue;
        out.push("<h" + Math.min(4, h[1].length + 1) + ">" + esc(h[2]) + "</h" + Math.min(4, h[1].length + 1) + ">");
        continue;
      }
      if (skipping) continue;
      if (used + line.length > maxChars) { out.push("<p>" + esc(line.slice(0, Math.max(0, maxChars - used))).replace(/\s+\S*$/, "") + "…</p>"); break; }
      used += line.length;
      out.push("<p>" + esc(line) + "</p>");
    }
    // Να μην τελειώνει με ορφανή επικεφαλίδα
    while (out.length && /^<h\d>/.test(out[out.length - 1])) out.pop();
    return out.join("");
  }
  // Μεγαλύτερη εικόνα από το thumbnail, χωρίς να ξεπεράσει το πρωτότυπο
  function pickImage(sum) {
    if (!sum || !sum.thumbnail || !sum.thumbnail.source) return null;
    const ow = sum.originalimage ? sum.originalimage.width : 0;
    const orig = sum.originalimage && sum.originalimage.source;
    if (orig && ow && ow <= 1280) return orig; // μικρό πρωτότυπο: το δείχνουμε όπως είναι
    return sum.thumbnail.source.replace(/\/(\d+)px-/, "/960px-");
  }
  function setStoryCollapsed(v) {
    els.story.classList.toggle("collapsed", v);
    if (v) { storyEv = null; endTour(); hidePostcard(); }
  }
  els.storyClose.addEventListener("click", () => setStoryCollapsed(true));
  async function openStory(ev) {
    storyEv = ev;
    const seq = ++storySeq;
    const type = TYPES[ev.type];
    els.story.style.setProperty("--c", "var(--c-" + ev.type + ")");
    els.storyType.textContent = type.icon + " " + type.label;
    els.storyTitle.textContent = ev.title;
    els.storyMeta.textContent = yearOf(ev.start) + (ev.end ? " – " + yearOf(ev.end) : "");
    els.storyDesc.textContent = ev.description || "";
    els.storyMedia.innerHTML = '<div class="ph">' + esc(type.icon) + "</div>";
    els.storyWiki.innerHTML = '<span class="loading">' + esc(t("wikiLoading")) + "</span>";
    els.storyWiki.style.display = "";
    els.storyLinks.innerHTML = "";
    els.storyFeature.innerHTML = "";
    els.storyBody.scrollTop = 0;
    endTour(); hidePostcard();
    setStoryCollapsed(false);
    setPanelCollapsed(true);
    if (isMobile()) setSidebarCollapsed(true);
    // Κορυφαίο γεγονός: βίντεο, 3D ή μίνι ιστορία
    const f = FEATURED[ev.id];
    if (f && (f.kind === "photo" || f.kind === "video")) els.storyFeature.innerHTML = '<p class="story-caption">' + esc(capOf(f)) + "</p>";
    else if (f && f.kind === "tour") startTour(ev, f);
    const skipImage = false;

    const w = WIKI[ev.id] || [null, null];
    if (!w[0] && !w[1]) { els.storyWiki.innerHTML = ""; return; }
    const [sEl, sEn] = await Promise.all([w[1] ? fetchSummary("el", w[1]) : null, w[0] ? fetchSummary("en", w[0]) : null]);
    if (seq !== storySeq) return; // άνοιξε άλλο γεγονός στο μεταξύ
    const pref = state.lang === "el" ? [sEl, sEn] : [sEn, sEl];
    const got = pref.find((s) => s && s.extract && s.type !== "disambiguation");
    if (!got) { els.storyWiki.innerHTML = '<span class="note">' + esc(t("wikiFail")) + "</span>"; return; }
    const gotLang = got === sEl ? "el" : "en";
    const img = pickImage(got) || pickImage(sEn) || pickImage(sEl);
    if (img && !skipImage) {
      const im = new Image();
      im.alt = got.title || ev.title;
      im.onload = () => { if (seq === storySeq) { if (f && (f.kind === "photo" || f.kind === "video")) showPostcard(ev.lng, ev.lat, img, capOf(f)); els.storyMedia.appendChild(im); requestAnimationFrame(() => im.classList.add("in")); const c = document.createElement("span"); c.className = "credit"; c.textContent = t("wikiCredit"); els.storyMedia.appendChild(c); } };
      im.onerror = () => { const small = (got.thumbnail && got.thumbnail.source) || (sEn && sEn.thumbnail && sEn.thumbnail.source); if (small && im.src !== small) { im.onerror = null; im.src = small; } };
      im.src = img;
    }
    const paras = got.extract.split(/\n+/).filter(Boolean).slice(0, 3);
    els.storyWiki.innerHTML = paras.map((p) => "<p>" + esc(p) + "</p>").join("") +
      (gotLang !== state.lang ? '<div class="note">' + esc(t("wikiOtherLang")) + "</div>" : "");
    const url = got.content_urls && got.content_urls.desktop ? got.content_urls.desktop.page : "https://" + gotLang + ".wikipedia.org/wiki/" + encodeURIComponent(got.title);
    els.storyLinks.innerHTML = '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t("readMore")) + " ↗</a>";
  }

  // ---------- Κορυφαία γεγονότα: βίντεο / 3D μοντέλο / μίνι ιστορία ----------
  const capOf = (f) => (f.caption && (f.caption[state.lang] || f.caption.el)) || "";
  // Καρτ ποστάλ: φωτογραφία με λεζάντα, «καρφιτσωμένη» δίπλα στο σημείο του γεγονότος (μόνο σε μεγάλη οθόνη)
  function showPostcard(lng, lat, src, caption) {
    if (isMobile()) return;
    postcardAt = { lng, lat };
    els.postcardImg.src = src;
    els.postcardCap.textContent = caption || "";
    els.postcard.style.animation = "none";
    void els.postcard.offsetWidth; // επανεκκίνηση του animation εισόδου
    els.postcard.style.animation = "";
    els.postcard.classList.remove("collapsed");
    positionPostcard();
  }
  function hidePostcard() {
    postcardAt = null;
    els.postcard.classList.add("collapsed");
    els.postcardImg.removeAttribute("src");
  }
  function positionPostcard() {
    if (!postcardAt) return;
    const tr = d3.zoomTransform(els.svg.node());
    const [mx, my] = projection([postcardAt.lng, postcardAt.lat]);
    if (!isFinite(mx) || !isFinite(my)) return;
    els.postcard.style.visibility = onFront(postcardAt.lng, postcardAt.lat) ? "" : "hidden";
    const x = tr.applyX(mx), y = tr.applyY(my);
    const w = els.postcard.offsetWidth || 300, h = els.postcard.offsetHeight || 260;
    let left = x - w - 24, top = y - h - 10;
    if (left < 8) left = Math.min(width() - w - 8, x + 24);
    top = Math.max(8, Math.min(height() - h - 8, top));
    els.postcard.style.left = left + "px";
    els.postcard.style.top = top + "px";
  }
  // Φωτογραφία για στάση μίνι ιστορίας: από άρθρο της Wikipedia (st.photo = αγγλικός τίτλος)
  async function showStopPhoto(st) {
    const s = await fetchSummary("en", st.photo);
    if (!tour || tour.f.stops[tour.i] !== st) return;
    const img = pickImage(s);
    if (img) showPostcard(st.lng, st.lat, img, (st[state.lang] || st.el)[0]);
  }
  // Μίνι ιστορία: στάσεις με κάμερα, χρόνο, κείμενο και διαδρομή στον χάρτη
  function startTour(ev, f) {
    tour = { ev, f, i: 0 };
    els.storyWiki.style.display = "none";
    gotoStop(0);
  }
  function endTour() {
    if (!tour) return;
    tour = null;
    gTour.selectAll("*").remove();
    els.storyWiki.style.display = "";
  }
  function gotoStop(i) {
    if (!tour) return;
    const { f, ev } = tour;
    const stops = f.stops;
    i = Math.max(0, Math.min(stops.length - 1, i));
    tour.i = i;
    const st = stops[i];
    const txt = st[state.lang] || st.el;
    setTime(dateToMonths(st.date), { fromUser: true });
    const [x, y] = projection([st.lng, st.lat]);
    const k = st.k || 3;
    if (isGlobe()) { rotateTo(st.lng, st.lat, 900); els.svg.transition().duration(900).call(zoom.transform, centeredTransform(k)); }
    else els.svg.transition().duration(900).call(zoom.transform, d3.zoomIdentity.translate(width() / 2 - x * k, height() / 2 - y * k).scale(k));
    drawTour(stops.slice(0, i + 1), f.color);
    hidePostcard();
    if (st.photo) showStopPhoto(st);
    els.storyTitle.textContent = ev.title;
    els.storyMeta.innerHTML = '<span class="tour-step">' + esc(t("tourStop")) + " " + (i + 1) + " / " + stops.length + "</span>";
    els.storyDesc.innerHTML = "<strong>" + esc(txt[0]) + "</strong><br>" + esc(txt[1]);
    const last = i === stops.length - 1;
    els.storyFeature.innerHTML = '<div class="tour-bar" style="--tour:' + esc(f.color) + '">' + stops.map((_, j) => '<span class="' + (j <= i ? "done" : "") + '"></span>').join("") + "</div>" +
      '<div class="tour-nav"><button type="button" id="tour-prev"' + (i === 0 ? " disabled" : "") + ">" + esc(t("tourPrev")) + '</button><button type="button" id="tour-next" class="primary">' + esc(last ? t("tourRestart") : t("tourNext")) + "</button></div>";
    els.storyFeature.querySelector("#tour-prev").onclick = () => gotoStop(tour.i - 1);
    els.storyFeature.querySelector("#tour-next").onclick = () => gotoStop(tour.i === stops.length - 1 ? 0 : tour.i + 1);
    els.storyBody.scrollTop = 0;
  }
  function drawTour(stops, color) {
    gTour.selectAll("*").remove();
    if (stops.length > 1) {
      const d = path({ type: "LineString", coordinates: stops.map((s) => [s.lng, s.lat]) });
      if (d) {
        const p = gTour.append("path").attr("class", "tour-route").attr("d", d).attr("stroke", color);
        const len = p.node().getTotalLength();
        p.attr("stroke-dasharray", len + " " + len).attr("stroke-dashoffset", len)
          .transition().duration(900).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0)
          .on("end", () => p.attr("stroke-dasharray", "6 6"));
      }
    }
    stops.forEach((st, j) => {
      const [x, y] = projection([st.lng, st.lat]);
      const g = gTour.append("g").attr("class", "tour-stop").datum([x, y]).attr("transform", "translate(" + x + "," + y + ") scale(" + bodyScale() + ")");
      g.append("circle").attr("r", 9).attr("fill", j === stops.length - 1 ? "#fff" : color);
      g.append("text").text(j + 1);
    });
  }

  // ---------- Σινεμά: μεγάλη εισαγωγή + βίντεο όταν φτάνεις σε ένα κορυφαίο γεγονός ----------
  // Με «Επόμενο / Προηγούμενο γεγονός», όταν το γεγονός είναι κορυφαίο (featured.js): zoom στο σημείο,
  // μεγάλο εφέ + τίτλος σε όλη την οθόνη και μετά μεγάλο popup με το βίντεο (ή μεγάλη φωτογραφία
  // από τη Wikipedia όταν δεν υπάρχει βίντεο). Παίζει κάθε φορά που φτάνεις στο γεγονός.
  let cinemaEv = null, cinemaTimer = 0, cinemaSeq = 0, cinemaPending = false;
  const cinemaOpen = () => !els.cinema.classList.contains("collapsed");
  const cinemaActive = () => cinemaPending || cinemaOpen();
  function cinemaIntro(ev) {
    if (!FEATURED[ev.id]) return;
    closeCinema();
    cinemaPending = true;
    const seq = ++cinemaSeq;
    setStoryCollapsed(true); setPanelCollapsed(true); if (isMobile()) setSidebarCollapsed(true, false);
    if (state.zoomK > 1.01) els.svg.transition().duration(500).call(zoom.transform, isGlobe() ? centeredTransform(1) : d3.zoomIdentity);
    rotateTo(ev.lng, ev.lat, 700);
    const type = TYPES[ev.type];
    els.intro.style.setProperty("--c", "var(--c-" + ev.type + ")");
    els.introYear.textContent = type.icon + "  " + yearOf(ev.start);
    els.introTitle.textContent = ev.title;
    els.intro.classList.remove("collapsed");
    els.intro.setAttribute("aria-hidden", "false");
    restartAnimations(els.intro);
    if (window.WorldSound) WorldSound.event(ev.id, ev.type); // ήχος του γεγονότος
    setTimeout(() => { if (seq === cinemaSeq) bigBang(ev); }, 350); // αφού «κάτσει» το zoom
    clearTimeout(cinemaTimer);
    cinemaTimer = setTimeout(() => {
      if (seq !== cinemaSeq) return;
      hideIntro();
      cinemaPending = false;
      openCinema(ev);
    }, 2300);
  }
  function restartAnimations(el) {
    el.querySelectorAll("*").forEach((n) => { n.style.animation = "none"; });
    void el.offsetWidth;
    el.querySelectorAll("*").forEach((n) => { n.style.animation = ""; });
  }
  function hideIntro() {
    els.intro.classList.add("collapsed");
    els.intro.setAttribute("aria-hidden", "true");
  }
  // Πολύ μεγάλο εφέ στο σημείο του γεγονότος: λάμψη, διαδοχικοί κύκλοι και αστέρι
  function bigBang(ev) {
    const [x, y] = projection([ev.lng, ev.lat]);
    if (!isFinite(x) || !isFinite(y)) return;
    const color = typeColor(ev.type);
    const g = gFx.append("g").attr("class", "fx-bang").attr("transform", "translate(" + x + "," + y + ") scale(" + bodyScale() + ")");
    g.append("circle").attr("r", 0).attr("fill", "#fff").attr("opacity", 1)
      .transition().duration(600).ease(d3.easeCubicOut).attr("r", 70).attr("opacity", 0).remove();
    for (let i = 0; i < 4; i++) {
      g.append("circle").attr("r", 5).attr("fill", "none").attr("stroke", i % 2 ? "#fff" : color).attr("stroke-width", 9).attr("opacity", 0.95)
        .transition().delay(i * 200).duration(1700).ease(d3.easeCubicOut)
        .attr("r", 220).attr("stroke-width", 0.5).attr("opacity", 0).remove();
    }
    g.append("text").attr("class", "bang-star").text("★").attr("fill", "#ffd36b").attr("font-size", 1).attr("opacity", 1)
      .transition().duration(700).ease(d3.easeBackOut).attr("font-size", 80)
      .transition().delay(700).duration(500).attr("opacity", 0).attr("font-size", 100).remove();
    setTimeout(() => g.remove(), 2600);
  }
  async function openCinema(ev) {
    cinemaEv = ev;
    const seq = cinemaSeq;
    const f = FEATURED[ev.id] || {};
    const type = TYPES[ev.type];
    els.cinema.style.setProperty("--c", "var(--c-" + ev.type + ")");
    els.cinemaType.textContent = type.icon + " " + type.label;
    els.cinemaMeta.textContent = yearOf(ev.start) + (ev.end ? " – " + yearOf(ev.end) : "");
    els.cinemaTitle.textContent = ev.title;
    els.cinemaCap.textContent = capOf(f);
    els.cinemaCredit.innerHTML = "";
    els.cinemaDesc.textContent = ev.description || "";
    els.cinemaWiki.innerHTML = "";
    els.cinemaLinks.innerHTML = "";
    els.cinemaMedia.innerHTML = "";
    els.cinema.classList.remove("collapsed");
    els.cinema.setAttribute("aria-hidden", "false");
    restartAnimations(els.cinema);
    els.cinema.querySelector(".cinema-box").scrollTop = 0;
    els.cinemaClose.focus({ preventScroll: true });
    loadCinemaStory(ev, seq);
    // Slideshow με φωτογραφίες του άρθρου της Wikipedia (ή μία μεγάλη φωτογραφία)
    els.cinemaMedia.innerHTML = '<div class="ph">' + esc(type.icon) + "</div>";
    const [sEl, sEn] = await wikiPair(ev);
    if (seq !== cinemaSeq || cinemaEv !== ev) return;
    loadGallery(ev, seq, sEl, sEn);
    const img = pickImage(sEn) || pickImage(sEl);
    if (!img) return;
    const im = new Image();
    im.alt = ev.title;
    im.onload = () => {
      if (cinemaEv !== ev || cinemaGal) return;
      els.cinemaMedia.innerHTML = "";
      els.cinemaMedia.appendChild(im);
      requestAnimationFrame(() => im.classList.add("in"));
      els.cinemaCredit.textContent = t("wikiCredit");
    };
    im.onerror = () => { const small = (sEn && sEn.thumbnail && sEn.thumbnail.source) || (sEl && sEl.thumbnail && sEl.thumbnail.source); if (small && im.src !== small) { im.onerror = null; im.src = small; } };
    im.src = img;
  }
  // ---- Slideshow φωτογραφιών από το άρθρο της Wikipedia ----
  // media-list: σειρά εμφάνισης + λεζάντες· imageinfo: διαστάσεις + μεγάλο thumbnail
  const BAD_IMG = /flag|icon|logo|symbol|pictogram|wiki|commons|ambox|disambig|edit-|button|arrow|signature|coat_of_arms|emblem|seal_of|stamp|\.svg$|\.gif$|\.ogv$|\.webm$|\.tiff?$|\.pdf$|\.djvu$/i;
  const normTitle = (s) => s.replace(/_/g, " ");
  function fetchGallery(lang, title, max = 10) {
    const key = "g:" + lang + ":" + title;
    if (wikiCache.has(key)) return wikiCache.get(key);
    const p = (async () => {
      const ml = await fetch("https://" + lang + ".wikipedia.org/api/rest_v1/page/media-list/" + encodeURIComponent(title.replace(/ /g, "_"))).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (!ml || !ml.items) return [];
      const items = ml.items.filter((it) => it.type === "image" && it.title && !BAD_IMG.test(it.title)).slice(0, 40);
      if (!items.length) return [];
      const q = await fetch("https://" + lang + ".wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&format=json&formatversion=2&origin=*&titles=" + encodeURIComponent(items.map((i) => i.title).join("|"))).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      const info = new Map();
      if (q && q.query && q.query.pages) for (const pg of q.query.pages) { const ii = pg.imageinfo && pg.imageinfo[0]; if (ii) info.set(normTitle(pg.title), ii); }
      const out = [], seen = new Set();
      for (const it of items) {
        const ii = info.get(normTitle(it.title));
        if (!ii || !/^image\/(jpeg|png|webp)$/.test(ii.mime || "") || ii.width < 480 || ii.height < 300) continue;
        const ar = ii.width / ii.height;
        if (ar > 3.2 || ar < 0.5) continue; // πανοράματα / πολύ στενές εικόνες
        const src = ii.thumburl || ii.url;
        if (seen.has(src)) continue;
        seen.add(src);
        out.push({ src, cap: it.caption && it.caption.text ? it.caption.text.replace(/\s+/g, " ").trim() : "" });
        if (out.length >= max) break;
      }
      return out;
    })();
    wikiCache.set(key, p);
    return p;
  }
  let cinemaGal = null; // { items, i, timer }
  async function loadGallery(ev, seq, sEl, sEn) {
    const pref = state.lang === "el" ? [sEl, sEn] : [sEn, sEl];
    const arts = pref.filter((s) => s && s.title && s.type !== "disambiguation");
    let items = [];
    for (const a of arts) {
      const got = await fetchGallery(a === sEl ? "el" : "en", a.title);
      if (seq !== cinemaSeq || cinemaEv !== ev) return;
      if (got.length > items.length) items = got;
      if (items.length >= 4) break;
    }
    if (items.length < 2) return; // με 1 εικόνα μένει η μεγάλη φωτογραφία
    startGallery(items);
    els.cinemaCredit.textContent = t("wikiCredit");
  }
  function startGallery(items) {
    stopGallery();
    const root = document.createElement("div");
    root.className = "gal";
    root.innerHTML = '<div class="gal-count"></div><div class="gal-cap"></div>' +
      '<button type="button" class="gal-btn gal-prev" aria-label="Προηγούμενη">‹</button><button type="button" class="gal-btn gal-next" aria-label="Επόμενη">›</button>' +
      '<div class="gal-dots">' + items.map(() => "<span></span>").join("") + "</div>";
    els.cinemaMedia.innerHTML = "";
    els.cinemaMedia.appendChild(root);
    const g = (cinemaGal = { items, i: -1, timer: 0, root });
    const dots = [...root.querySelectorAll(".gal-dots span")];
    const show = (i, dir = 1) => {
      i = (i + items.length) % items.length;
      if (i === g.i) return;
      g.i = i;
      const it = items[i];
      const old = root.querySelector("img.show");
      const im = new Image();
      im.className = "gal-img";
      im.alt = it.cap || "";
      im.onload = () => {
        if (cinemaGal !== g || g.i !== i) return;
        root.insertBefore(im, root.firstChild);
        requestAnimationFrame(() => { im.classList.add("show"); if (old) { old.classList.remove("show"); setTimeout(() => old.remove(), 800); } });
      };
      im.onerror = () => { if (cinemaGal === g && g.i === i) show(i + dir, dir); };
      im.src = it.src;
      root.querySelector(".gal-cap").textContent = it.cap;
      root.querySelector(".gal-count").textContent = (i + 1) + " / " + items.length;
      dots.forEach((d, j) => d.classList.toggle("on", j === i));
      // προφόρτωση της επόμενης
      const nx = new Image(); nx.src = items[(i + 1) % items.length].src;
      restartTimer();
    };
    const restartTimer = () => { clearInterval(g.timer); g.timer = setInterval(() => show(g.i + 1), 5000); };
    root.querySelector(".gal-prev").onclick = () => show(g.i - 1, -1);
    root.querySelector(".gal-next").onclick = () => show(g.i + 1, 1);
    dots.forEach((d, j) => { d.onclick = () => show(j); });
    show(0);
  }
  function stopGallery() {
    if (!cinemaGal) return;
    clearInterval(cinemaGal.timer);
    cinemaGal = null;
  }

  // Τα δύο άρθρα (el/en) της Wikipedia για ένα γεγονός, με cache ανά γεγονός
  const wikiPairCache = new Map();
  function wikiPair(ev) {
    if (!wikiPairCache.has(ev.id)) {
      const w = WIKI[ev.id] || [null, null];
      wikiPairCache.set(ev.id, Promise.all([w[1] ? fetchSummary("el", w[1]) : null, w[0] ? fetchSummary("en", w[0]) : null]));
    }
    return wikiPairCache.get(ev.id);
  }
  // Ολόκληρη η ιστορία μέσα στο popup: κείμενο από τη Wikipedia + σύνδεσμος
  async function loadCinemaStory(ev, seq) {
    const w = WIKI[ev.id] || [null, null];
    if (!w[0] && !w[1]) return;
    els.cinemaWiki.innerHTML = '<span class="loading">' + esc(t("wikiLoading")) + "</span>";
    const [sEl, sEn] = await wikiPair(ev);
    if (seq !== cinemaSeq || cinemaEv !== ev) return;
    const pref = state.lang === "el" ? [sEl, sEn] : [sEn, sEl];
    const got = pref.find((s) => s && s.extract && s.type !== "disambiguation");
    if (!got) { els.cinemaWiki.innerHTML = '<span class="note">' + esc(t("wikiFail")) + "</span>"; return; }
    const gotLang = got === sEl ? "el" : "en";
    const note = gotLang !== state.lang ? '<div class="note">' + esc(t("wikiOtherLang")) + "</div>" : "";
    // Σύντομο κείμενο: οι 2 πρώτες παράγραφοι του άρθρου (ολόκληρο στον σύνδεσμο)
    let paras = firstParas(got.extract, 2);
    // Αν η εισαγωγή είναι μία σύντομη παράγραφος, συμπληρώνουμε από το πλήρες άρθρο
    if (paras.length < 2 || paras.join("").length < 400) {
      const full = await fetchExtract(gotLang, got.title);
      if (seq !== cinemaSeq || cinemaEv !== ev) return;
      if (full) { const fp = firstParas(full, 2); if (fp.join("").length > paras.join("").length) paras = fp; }
    }
    els.cinemaWiki.innerHTML = paras.map((p) => "<p>" + esc(p) + "</p>").join("") + note;
    const url = got.content_urls && got.content_urls.desktop ? got.content_urls.desktop.page : "https://" + gotLang + ".wikipedia.org/wiki/" + encodeURIComponent(got.title);
    els.cinemaLinks.innerHTML = '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(t("readMore")) + " ↗</a>";
    // Αφήγηση: τίτλος + περιγραφή + οι 2 παράγραφοι, όσο παίζουν οι φωτογραφίες
    cinemaNarration = { text: [ev.title + ".", ev.description || "", ...paras].filter(Boolean).join(" "), lang: gotLang };
    startNarration();
  }
  // Οι πρώτες n παράγραφοι κειμένου (χωρίς επικεφαλίδες "== ... ==")
  function firstParas(text, n) {
    return String(text).split(/\n+/).map((s) => cleanWiki(s)).filter((s) => s && !/^=+.*=+$/.test(s) && s.length > 40).slice(0, n);
  }
  // Αφαιρεί ό,τι δεν διαβάζεται καλά: αγκύλες με IPA/σημειώσεις [ ... ] και παρενθέσεις με
  // προφορές ή μεταγραφές, π.χ. (Ancient Greek: Παρθενών, romanised: Parthenōn [par.tʰe.nɔ̌ːn]; ...)
  function cleanWiki(s) {
    let out = String(s);
    for (let i = 0; i < 3; i++) out = out.replace(/\s*\[[^\[\]]*\]/g, ""); // [ ... ], και φωλιασμένα
    const noisy = /romani[sz]|pronounc|pronunciation|listen|ipa|transliterat|\b(ancient greek|greek|latin|arabic|hebrew|russian|chinese|japanese|german|french|italian|spanish|portuguese|dutch|turkish|persian|hindi|egyptian|norse|old english|sanskrit|lit\.|literally|abbreviated|abbr\.|also known as|aka)\b\s*:|ελληνικά:|αρχαία ελληνικά:|λατινικά:|προφ(ορά|έρεται)|μεταγραφ|[ˈˌːʰʷʲðŋɔɛəɪʊæɑɒɜɐʁ]|^\/.*\/$/i;
    for (let i = 0; i < 3; i++) out = out.replace(/\s*\(([^()]*)\)/g, (m, inner) => (noisy.test(inner.trim()) ? "" : m));
    return out.replace(/\s+([,.;:!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  }
  // ---- Αφηγητής ----
  let cinemaNarration = null;
  function setNarrateBtn(on) { els.cinemaNarrate.hidden = !(cinemaNarration && window.WorldSound && WorldSound.canSpeak); els.cinemaNarrate.setAttribute("aria-pressed", String(!!on)); }
  function startNarration() {
    if (!cinemaNarration || !window.WorldSound || !WorldSound.canSpeak) { setNarrateBtn(false); return; }
    const ok = WorldSound.say(cinemaNarration.text, cinemaNarration.lang, () => setNarrateBtn(false));
    setNarrateBtn(ok);
  }
  function stopNarration() { if (window.WorldSound) WorldSound.stopSpeech(); setNarrateBtn(false); }
  els.cinemaNarrate.addEventListener("click", () => { if (window.WorldSound && WorldSound.speaking) stopNarration(); else { if (WorldSound.muted) WorldSound.setMuted(false); startNarration(); } });
  function closeCinema() {
    cinemaSeq++;
    clearTimeout(cinemaTimer);
    cinemaPending = false;
    hideIntro();
    stopGallery();
    cinemaNarration = null;
    stopNarration();
    els.cinemaNarrate.hidden = true;
    if (cinemaOpen()) {
      els.cinema.classList.add("collapsed");
      els.cinema.setAttribute("aria-hidden", "true");
      els.cinemaMedia.innerHTML = ""; // σταματά και το βίντεο
    }
    cinemaEv = null;
  }
  els.cinemaClose.addEventListener("click", () => closeCinema());
  els.cinemaBackdrop.addEventListener("click", () => closeCinema());

  // ---------- Ζωντανές αναπαραστάσεις πάνω στον χάρτη (ανά τύπο γεγονότος) ----------
  let fxCount = 0;
  const FX_MAX = 4;
  const kw = (ev, re) => re.test([ev.title, ev.description, ev.en && ev.en.title, ev.en && ev.en.description].filter(Boolean).join(" ").toLowerCase());
  const typeColor = (type) => getComputedStyle(document.documentElement).getPropertyValue("--c-" + type).trim() || "#fff";
  function playScene(ev) {
    // Όλα τα γεγονότα παίζουν αναπαράσταση (βελάκια διαδρομής, κύκλοι, φωτιά κ.λπ.) όταν φτάνεις σε αυτά
    if (fxCount >= FX_MAX) return;
    const [x, y] = projection([ev.lng, ev.lat]);
    if (!isFinite(x) || !isFinite(y)) return;
    const s = bodyScale(); // 1 pixel οθόνης σε μονάδες χάρτη
    const color = typeColor(ev.type);
    const T = ev.type;
    const g = gFx.append("g").attr("class", "fx-" + T);
    const pt = g.append("g").attr("transform", "translate(" + x + "," + y + ") scale(" + s + ")"); // σημειακά εφέ
    fxCount++;
    const done = (ms) => setTimeout(() => { g.remove(); fxCount--; }, ms);
    if (T === "disaster" || T === "tragedy") {
      if (kw(ev, /σεισμ|earthquake|quake/)) { shake(); rings(pt, "#ffd36b", 4, 1800); done(2000); return; }
      if (kw(ev, /τσουνάμι|tsunami|πλημμ|flood|κατακλυσμ/)) { rings(pt, "#5ec8ff", 5, 2600); done(2800); return; }
      if (kw(ev, /επιδημ|πανδημ|πανώλη|λοιμ|γρίπη|plague|pandemic|epidemic|flu|cholera|χολέρα|ebola|aids|smallpox|ευλογιά/)) { plague(pt, 2800); done(3000); return; }
      if (kw(ev, /ηφαίστ|έκρηξη|volcan|erupt|explosion|bomb|βόμβα|ατομικ|nuclear|πυρηνικ|chernobyl|τσερνόμπιλ/)) { explosion(pt, color, 3000, kw(ev, /ηφαίστ|volcan|erupt/)); done(3200); return; }
      if (kw(ev, /πυρκαγ|fire|καίγ|burn|φωτιά|καίει/)) { fire(pt, 2800); done(3000); return; }
      rings(pt, color, 3, 1800); done(2000); return;
    }
    if (T === "war") { clash(pt, color, 2600); setTimeout(() => fire(pt, 2600), 300); done(3200); return; }
    if (T === "revolution") { fist(pt, 2800); fire(pt, 2600); sparks(pt, color); done(3000); return; }
    if (T === "exploration") { if (ev.from) voyage(g, ev, 3200); else radar(pt, color, 2400); done(3400); return; }
    if (T === "science") { formula(pt, scienceText(ev), 3000); rays(pt, "#fff", 1600); done(3200); return; }
    if (T === "culture") { rays(pt, color, 2200); glitter(pt, color, 2400); done(2600); return; }
    if (T === "politics") { seal(pt, color, 2000); done(2200); return; }
    if (T === "economy") { coins(pt, 2400); done(2600); return; }
    // θρησκείες, φυτά, ζώα: κύμα κατά μήκος του βέλους ή ήπια λάμψη
    if (ev.from) { travelPulse(g, ev, color, 2600); done(2800); return; }
    rings(pt, color, 3, 2000); done(2200);
  }
  function shake() {
    els.mapWrap.classList.remove("shake");
    void els.mapWrap.offsetWidth;
    els.mapWrap.classList.add("shake");
    setTimeout(() => els.mapWrap.classList.remove("shake"), 700);
  }
  function rings(g, color, n, dur) {
    for (let i = 0; i < n; i++) {
      g.append("circle").attr("r", 4).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.5).attr("opacity", 0.9)
        .transition().delay(i * (dur / (n + 1))).duration(dur * 0.7).ease(d3.easeCubicOut)
        .attr("r", 70).attr("stroke-width", 0.5).attr("opacity", 0);
    }
  }
  function explosion(g, color, dur, volcano) {
    g.append("circle").attr("r", 2).attr("fill", "#fff").attr("opacity", 1)
      .transition().duration(500).ease(d3.easeExpOut).attr("r", 40).attr("opacity", 0);
    rings(g, "#ffb347", 2, dur * 0.6);
    for (let i = 0; i < 26; i++) {
      const a = volcano ? -Math.PI / 2 + (Math.random() - 0.5) * 1.2 : Math.random() * Math.PI * 2;
      const d = 30 + Math.random() * 60;
      const r0 = 2 + Math.random() * 3;
      g.append("circle").attr("r", r0).attr("fill", volcano ? "#9a9a9a" : i % 3 ? "#ff7a3d" : "#ffd36b").attr("opacity", 0.9)
        .transition().delay(Math.random() * 300).duration(dur * (0.6 + Math.random() * 0.4)).ease(d3.easeCubicOut)
        .attr("cx", Math.cos(a) * d).attr("cy", Math.sin(a) * d - (volcano ? 20 : 0)).attr("r", r0 * (volcano ? 4 : 2)).attr("opacity", 0);
    }
    if (!volcano) {
      g.append("circle").attr("r", 6).attr("fill", color).attr("opacity", 0.35)
        .transition().duration(dur).ease(d3.easeCubicOut).attr("r", 110).attr("opacity", 0);
    }
  }
  function fire(g, dur) {
    for (let i = 0; i < 18; i++) {
      const dx = (Math.random() - 0.5) * 16;
      g.append("circle").attr("cx", dx).attr("cy", 0).attr("r", 3 + Math.random() * 3).attr("fill", i % 2 ? "#ff6a2a" : "#ffc63a").attr("opacity", 0.95)
        .transition().delay(i * (dur / 24)).duration(dur * 0.45).ease(d3.easeQuadOut)
        .attr("cy", -(30 + Math.random() * 30)).attr("cx", dx * 2).attr("r", 0.5).attr("opacity", 0);
    }
    for (let i = 0; i < 8; i++) {
      g.append("circle").attr("cy", -10).attr("r", 4).attr("fill", "#888").attr("opacity", 0.5)
        .transition().delay(200 + i * (dur / 10)).duration(dur * 0.6).ease(d3.easeQuadOut)
        .attr("cy", -70).attr("cx", (Math.random() - 0.5) * 40).attr("r", 14).attr("opacity", 0);
    }
  }
  // Πολλές μικρές φωτιές γύρω από το σημείο της μάχης
  function fires(g, dur) {
    for (let k = 0; k < 5; k++) {
      const a = Math.random() * Math.PI * 2, d = 18 + Math.random() * 40;
      const fg = g.append("g").attr("transform", "translate(" + Math.cos(a) * d + "," + Math.sin(a) * d + ") scale(0.6)").attr("opacity", 0);
      fg.transition().delay(400 + k * 250).duration(300).attr("opacity", 1);
      setTimeout(() => fire(fg, dur * 0.7), 400 + k * 250);
    }
  }
  // Γροθιά που υψώνεται και μεγαλώνει
  function fist(g, dur) {
    g.append("text").text("✊").attr("y", 0).attr("font-size", 14).attr("opacity", 0).attr("transform", "scale(0.4)")
      .transition().duration(dur * 0.45).ease(d3.easeBackOut).attr("opacity", 1).attr("transform", "scale(2.6)").attr("y", -22)
      .transition().duration(dur * 0.25).attr("transform", "scale(2.9)")
      .transition().duration(dur * 0.3).attr("opacity", 0).attr("transform", "scale(3.4)").attr("y", -30);
  }
  function sparks(g, color) {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 50;
      g.append("circle").attr("r", 2).attr("fill", color).attr("opacity", 1)
        .transition().delay(600 + Math.random() * 600).duration(900).ease(d3.easeCubicOut)
        .attr("cx", Math.cos(a) * d).attr("cy", Math.sin(a) * d).attr("opacity", 0);
    }
  }
  function plague(g, dur) {
    for (let i = 0; i < 40; i++) {
      const a = Math.random() * Math.PI * 2, d = 10 + Math.random() * 80;
      g.append("circle").attr("r", 0).attr("fill", "#b36bff").attr("opacity", 0.9)
        .transition().delay((d / 90) * dur * 0.6 + Math.random() * 200).duration(700)
        .attr("cx", Math.cos(a) * d).attr("cy", Math.sin(a) * d).attr("r", 2.5)
        .transition().duration(900).attr("opacity", 0);
    }
  }
  function clash(g, color, dur) {
    g.append("circle").attr("r", 0).attr("fill", "#fff").attr("opacity", 0)
      .transition().delay(0).duration(600).ease(d3.easeExpOut).attr("r", 34).attr("opacity", 0.9)
      .transition().duration(600).attr("opacity", 0);
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 40;
      g.append("circle").attr("r", 2).attr("fill", color).attr("opacity", 0)
        .transition().delay(0).attr("opacity", 1)
        .transition().duration(800).ease(d3.easeCubicOut).attr("cx", Math.cos(a) * d).attr("cy", Math.sin(a) * d).attr("opacity", 0);
    }
  }
  function voyage(gp, ev, dur) {
    const d = arrowPath(ev);
    if (!d) return;
    const p = gp.append("path").attr("d", d).attr("fill", "none").attr("stroke", "#ffe9a8").attr("stroke-width", 2).attr("vector-effect", "non-scaling-stroke").attr("opacity", 0.9);
    const len = p.node().getTotalLength();
    p.attr("stroke-dasharray", len).attr("stroke-dashoffset", len).transition().duration(dur).ease(d3.easeSinInOut).attr("stroke-dashoffset", 0);
    const s = bodyScale();
    const ship = gp.append("text").text("⛵").attr("font-size", 18 * s);
    ship.transition().duration(dur).ease(d3.easeSinInOut)
      .attrTween("transform", () => (tt) => { const q = p.node().getPointAtLength(tt * len); return "translate(" + q.x + "," + q.y + ")"; });
    gp.transition().delay(dur).duration(400).style("opacity", 0);
  }
  function travelPulse(gp, ev, color, dur) {
    const d = arrowPath(ev);
    if (!d) return;
    const pth = gp.append("path").attr("d", d).attr("fill", "none").attr("stroke", "none");
    const len = pth.node().getTotalLength();
    const s = bodyScale();
    for (let i = 0; i < 3; i++) {
      gp.append("circle").attr("r", 5 * s).attr("fill", color).attr("opacity", 0)
        .transition().delay(i * 350).duration(dur * 0.8).ease(d3.easeSinInOut).attr("opacity", 0.9)
        .attrTween("transform", () => (tt) => { const q = pth.node().getPointAtLength(tt * len); return "translate(" + q.x + "," + q.y + ")"; })
        .transition().duration(300).attr("opacity", 0);
    }
  }
  function radar(g, color, dur) {
    for (let i = 0; i < 3; i++) {
      g.append("circle").attr("r", 2).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2).attr("opacity", 0.8)
        .transition().delay(i * 400).duration(dur * 0.7).attr("r", 60).attr("opacity", 0);
    }
    g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", -55).attr("stroke", color).attr("stroke-width", 2).attr("opacity", 0.8)
      .transition().duration(dur).ease(d3.easeLinear).attrTween("transform", () => (tt) => "rotate(" + tt * 720 + ")").attr("opacity", 0);
  }
  function rays(g, color, dur) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 0).attr("stroke", color).attr("stroke-width", 2).attr("stroke-linecap", "round").attr("opacity", 0.9)
        .transition().duration(dur * 0.5).ease(d3.easeCubicOut)
        .attr("x1", Math.cos(a) * 14).attr("y1", Math.sin(a) * 14).attr("x2", Math.cos(a) * 46).attr("y2", Math.sin(a) * 46)
        .transition().duration(dur * 0.5).attr("opacity", 0);
    }
  }
  function glitter(g, color, dur) {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2, d = 15 + Math.random() * 45;
      g.append("text").text("✦").attr("fill", color).attr("font-size", 10 + Math.random() * 8).attr("x", Math.cos(a) * d).attr("y", Math.sin(a) * d).attr("opacity", 0)
        .transition().delay(Math.random() * dur * 0.5).duration(500).attr("opacity", 1)
        .transition().duration(700).attr("opacity", 0).attr("y", Math.sin(a) * d - 12);
    }
  }
  function seal(g, color, dur) {
    g.append("rect").attr("x", -18).attr("y", -18).attr("width", 36).attr("height", 36).attr("rx", 6).attr("fill", "none").attr("stroke", color).attr("stroke-width", 3).attr("opacity", 0).attr("transform", "scale(2.2) rotate(15)")
      .transition().duration(dur * 0.35).ease(d3.easeBackOut).attr("opacity", 1).attr("transform", "scale(1) rotate(0)")
      .transition().delay(dur * 0.3).duration(dur * 0.3).attr("opacity", 0);
    rings(g, color, 2, dur);
  }
  function coins(g, dur) {
    for (let i = 0; i < 12; i++) {
      const dx = (Math.random() - 0.5) * 50;
      g.append("text").text("●").attr("fill", "#ffd36b").attr("font-size", 10).attr("x", dx).attr("y", 10).attr("opacity", 0)
        .transition().delay(i * (dur / 14)).duration(dur * 0.5).ease(d3.easeQuadOut).attr("opacity", 1).attr("y", -40 - Math.random() * 30)
        .transition().duration(300).attr("opacity", 0);
    }
  }
  function formula(g, text, dur) {
    g.append("text").text(text).attr("y", -26).attr("font-size", 16).attr("opacity", 0).attr("transform", "scale(0.6)")
      .transition().duration(600).ease(d3.easeBackOut).attr("opacity", 1).attr("transform", "scale(1)").attr("y", -40)
      .transition().delay(dur * 0.5).duration(500).attr("opacity", 0).attr("y", -60);
  }
  function scienceText(ev) {
    const tests = [
      [/einstein|αϊνστάιν|relativ|σχετικότ/, "E = mc²"],
      [/newton|νεύτων|gravit|βαρύτ/, "F = G·m₁m₂ / r²"],
      [/pythag|πυθαγ/, "a² + b² = c²"],
      [/archimed|αρχιμήδ/, "ΕΥΡΗΚΑ!"],
      [/euclid|ευκλείδ/, "Q.E.D."],
      [/\bdna\b/, "DNA 🧬"],
      [/darwin|δαρβίν|evolution|εξέλιξ/, "🐢 → 🦎 → 🐒"],
      [/moon|σελήν|apollo|gagarin|γκαγκάριν|sputnik|σπούτνικ|rocket|πύραυλ|space|διάστημ/, "🚀"],
      [/print|τυπογραφ|gutenberg|γουτεμβέργ|τυπώνει/, "Aa"],
      [/\bzero\b|μηδέν|aryabhata|αριαμπάτα/, "0"],
      [/telescope|τηλεσκόπ|galile|γαλιλα|copernic|κοπέρνικ|kepler|κέπλερ|planet|πλανήτ/, "☉ ☿ ♀ ⊕ ♂"],
      [/penicill|πενικιλ|vaccin|εμβόλ|medicine|ιατρικ/, "⚕"],
      [/electric|ηλεκτρ|edison|έντισον|tesla|τέσλα|lightbulb|λαμπτήρ/, "⚡"],
      [/comput|υπολογιστ|internet|arpanet|web|transistor|τρανζίστορ|iphone|google/, "0 1 0 1 1 0"],
      [/steam|ατμο/, "♨"],
      [/flight|πτήση|wright|ράιτ|aviation|αεροπλάν/, "✈"],
      [/writing|γραφή|alphabet|αλφάβητ|hangul|χανγκούλ|cuneiform|σφηνοειδ|hieroglyph|ιερογλυφ/, "Α Β Γ"],
      [/map|χάρτ|geograph|γεωγραφ|seismo|σεισμογρ/, "🧭"],
      [/calendar|ημερολόγ|clock|ρολό/, "⌚"],
      [/railway|σιδηρόδρομ|train|τρένο|shinkansen/, "🚆"],
      [/dam|φράγμα|canal|διώρυγ/, "🌊"],
      [/atom|ατομ|trinity|nuclear|πυρηνικ/, "☢"],
    ];
    for (const [re, txt] of tests) if (kw(ev, re)) return txt;
    return "✦ " + yearOf(ev.start);
  }

  // ---------- Επιλογές χάρτη (προβολή) ----------
  const PROJ_KEY = "we-proj";
  function setProjection(kind, { persist = true } = {}) {
    if (!PROJECTIONS[kind]) kind = "flat";
    state.proj = kind;
    projection = PROJECTIONS[kind]();
    path = d3.geoPath(projection);
    pathTrack = d3.geoPath(projection, track);
    els.proj.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.proj === kind));
    els.mapWrap.classList.toggle("globe", kind === "globe");
    if (persist) { try { localStorage.setItem(PROJ_KEY, kind); } catch (_) { /* ignore */ } }
    els.svg.call(zoom.transform, d3.zoomIdentity);
    fitProjection();
  }
  function initMapOptions() {
    let p = "flat";
    try { p = localStorage.getItem(PROJ_KEY) || p; } catch (_) { /* ignore */ }
    els.proj.addEventListener("click", (e) => { const b = e.target.closest("button[data-proj]"); if (b) setProjection(b.dataset.proj); });
    setProjection(p, { persist: false });
  }

  function redrawMap() {
    gSphere.attr("d", path({ type: "Sphere" }));
    discBox = isGlobe() ? path.bounds({ type: "Sphere" }) : null;
    gGrat.attr("d", path(d3.geoGraticule10()));
    gCountries
      .selectAll("path.country")
      .data(countriesFeatures, (d) => d.id)
      .join("path")
      .attr("class", "country")
      .attr("fill", (d) => countryColors.get(d.id) || LAND_PALETTE[0])
      .attr("d", safePath);
    redrawHist();
    gEvents.selectAll("g.ev").each(function (a) { layoutEvent(d3.select(this), a.ev, false); });
    placeLabels();
  }

  // Χρωματισμός χωρών ώστε γειτονικές να μη μοιράζονται χρώμα
  function colorCountries(topo) {
    const geoms = topo.objects.countries.geometries;
    const neighbors = topojson.neighbors(geoms);
    const colorIdx = new Array(geoms.length).fill(-1);
    for (let i = 0; i < geoms.length; i++) {
      const used = new Set(neighbors[i].map((n) => colorIdx[n]).filter((c) => c >= 0));
      let c = (i * 3) % LAND_PALETTE.length;
      for (let k = 0; k < LAND_PALETTE.length; k++) {
        const cand = (c + k) % LAND_PALETTE.length;
        if (!used.has(cand)) { c = cand; break; }
      }
      colorIdx[i] = c;
      countryColors.set(geoms[i].id, LAND_PALETTE[c]);
    }
  }

  function showTooltipHTML(html, x, y, typeClass) {
    els.tooltip.innerHTML = html;
    els.tooltip.className = "tooltip show " + (typeClass || "");
    els.tooltip.style.left = x + "px";
    els.tooltip.style.top = y + "px";
  }
  function hideTooltip() {
    els.tooltip.classList.remove("show");
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  gCountries
    .on("mousemove", (ev) => {
      const target = ev.target;
      if (!target.classList || !target.classList.contains("country")) return hideTooltip();
      const d = d3.select(target).datum();
      const name = countryNames.get(d.id) || "";
      if (!name) return hideTooltip();
      const [x, y] = d3.pointer(ev, els.mapWrap);
      showTooltipHTML(`<div class="tt-title">${esc(name)}</div>`, x, y, "");
    })
    .on("mouseleave", hideTooltip);


  // ---------- Ιστορικά σύνορα ----------
  // Dataset: aourednik/historical-basemaps (GPL-3.0), ένας χάρτης ανά έτος-σταθμό.
  const BASEMAP_BASE = "https://cdn.jsdelivr.net/gh/aourednik/historical-basemaps@master/geojson/";
  const BASEMAP_YEARS = [
    -3000, -2000, -1500, -1000, -700, -500, -400, -323, -300, -200, -100, -1,
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1279, 1300, 1400, 1492,
    1500, 1530, 1600, 1650, 1700, 1715, 1783, 1800, 1815, 1878, 1880, 1900, 1914, 1920, 1930,
    1938, 1945, 1960, 1994, 2000, 2010,
  ];
  // Περιοχές χωρίς κρατική οργάνωση (κυνηγοί-τροφοσυλλέκτες, νομάδες κ.λπ.) σχεδιάζονται ουδέτερα
  const WILD_RE = /hunter|gatherer|nomad|uninhabited|unpopulated|pastoral|forager|horticultur|tribes|peoples|cultures?|farmers|herders|fishers|aborigin|inuit|pygm|khoisan|bantu|celts|germanic|slavs|scythian|sarmatian|berber|bedouin/i;
  const STATE_RE = /kingdom|empire|state|sultanate|caliphate|khanate|dynasty|republic/i;
  const histCache = new Map(); // έτος -> Promise<{features}>
  let histCurrentYear = null;
  let histLoadToken = 0;
  let histLoading = 0;
  let histFeatures = [];

  function basemapYearFor(astroYear) {
    const hist = astroYear <= 0 ? astroYear - 1 : astroYear;
    let best = BASEMAP_YEARS[0];
    for (const y of BASEMAP_YEARS) {
      if (y <= hist) best = y;
      else break;
    }
    return best;
  }
  function basemapFile(y) {
    return BASEMAP_BASE + "world_" + (y < 0 ? "bc" + -y : y) + ".geojson";
  }
  function isWild(p) {
    const n = (p.NAME || "") + " " + (p.SUBJECTO || "");
    if (!n.trim() || /^\s*\d+\s*$/.test(n)) return true; // ανώνυμες περιοχές
    return WILD_RE.test(n) && !STATE_RE.test(n);
  }
  // Καθαρισμός γεωμετρίας για το d3:
  // - τα εξωτερικά δακτυλίδια πρέπει να είναι «μικρά» (< μισή σφαίρα), αλλιώς γεμίζει όλη η σφαίρα·
  // - σειρές σημείων πάνω στον πόλο (π.χ. Ανταρκτική με 300 σημεία σε lat -90) μπερδεύουν την αποκοπή
  //   της υδρογείου όταν ο πόλος πέφτει στην άκρη του δίσκου → μένουν μόνο το πρώτο και το τελευταίο·
  // - δακτυλίδια μηδενικού εμβαδού (γραμμή που πάει και γυρίζει) είναι αόρατα αλλά στην υδρόγειο
  //   σχεδιάζονται καμιά φορά ως ολόκληρος ο δίσκος → αφαιρούνται.
  const isPolePt = (p) => Math.abs(p[1]) >= 89.999;
  function rewind(feature) {
    const g = feature.geometry;
    if (!g) return;
    const fixPoly = (rings) => {
      const out = [];
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i].filter((p, j, r) => !(j > 0 && j < r.length - 1 && isPolePt(p) && isPolePt(r[j - 1]) && isPolePt(r[j + 1])));
        if (ring.length < 4) { if (i === 0) return null; continue; }
        let a = d3.geoArea({ type: "Polygon", coordinates: [ring] });
        if (a > 2 * Math.PI) { ring.reverse(); a = 4 * Math.PI - a; }
        if (a < 1e-9) { if (i === 0) return null; continue; }
        if (i > 0) ring.reverse(); // οι τρύπες με αντίθετη φορά
        out.push(ring);
      }
      return out;
    };
    if (g.type === "Polygon") {
      const r = fixPoly(g.coordinates);
      if (r) g.coordinates = r; else feature.geometry = null;
    } else if (g.type === "MultiPolygon") {
      g.coordinates = g.coordinates.map(fixPoly).filter(Boolean);
      if (!g.coordinates.length) feature.geometry = null;
    }
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // Ομαδοποίηση ανά κυρίαρχο κράτος (SUBJECTO), ώστε π.χ. η Ρωμαϊκή Αυτοκρατορία να φαίνεται ενιαία.
  // Το χρώμα προκύπτει από hash του ονόματος (σταθερό από χάρτη σε χάρτη) και αλλάζει μόνο αν συγκρούεται με γείτονα.
  function colorFeatures(features) {
    const groups = new Map();
    for (const f of features) {
      f._key = null;
      if (isWild(f.properties)) continue;
      const sub = f.properties.SUBJECTO && !/^\d+$/.test(String(f.properties.SUBJECTO).trim()) ? f.properties.SUBJECTO : null;
      const key = sub || f.properties.NAME;
      f._key = key;
      let g = groups.get(key);
      if (!g) {
        g = { key, boxes: [], color: -1 };
        groups.set(key, g);
      }
      try { g.boxes.push(d3.geoBounds(f)); } catch (_) { /* ignore */ }
    }
    const touches = (A, B) =>
      A.some(([[ax0, ay0], [ax1, ay1]]) =>
        B.some(([[bx0, by0], [bx1, by1]]) => !(ax1 < bx0 || ax0 > bx1 || ay1 < by0 || ay0 > by1)));
    const list = [...groups.values()];
    for (const g of list) {
      const used = new Set();
      for (const o of list) if (o !== g && o.color >= 0 && touches(g.boxes, o.boxes)) used.add(o.color);
      const pref = hashStr(g.key) % LAND_PALETTE.length;
      g.color = pref;
      for (let k = 0; k < LAND_PALETTE.length; k++) {
        const c = (pref + k) % LAND_PALETTE.length;
        if (!used.has(c)) { g.color = c; break; }
      }
    }
    for (const f of features) f._color = f._key ? LAND_PALETTE[groups.get(f._key).color] : null;
  }

  function loadBasemap(y) {
    if (histCache.has(y)) return histCache.get(y);
    histLoading++;
    els.histLoading.classList.add("show");
    const p = d3
      .json(basemapFile(y))
      .then((geo) => {
        geo.features.forEach(rewind);
        colorFeatures(geo.features);
        return { features: geo.features };
      })
      .catch((err) => {
        console.error("Basemap load failed", y, err);
        histCache.delete(y);
        return null;
      })
      .finally(() => {
        if (--histLoading <= 0) { histLoading = 0; els.histLoading.classList.remove("show"); }
      });
    histCache.set(y, p);
    return p;
  }

  async function ensureBasemap(astroYear) {
    if (!state.historical) return;
    const y = basemapYearFor(astroYear);
    if (y === histCurrentYear) return;
    histCurrentYear = y;
    const token = ++histLoadToken;
    const entry = await loadBasemap(y);
    if (token !== histLoadToken) return; // ήρθε νεότερο αίτημα στο μεταξύ
    histFeatures = entry ? entry.features : [];
    renderHist(true);
    applyLayerVisibility();
    const next = BASEMAP_YEARS[BASEMAP_YEARS.indexOf(y) + 1];
    if (next != null) loadBasemap(next); // προφόρτωση του επόμενου
  }

  function renderHist(animate) {
    const old = gHist.selectAll("g.hist-year");
    const layer = gHist.append("g").attr("class", "hist-year" + (animate ? "" : " in"));
    layer
      .selectAll("path")
      .data(histFeatures)
      .join("path")
      .attr("class", (f) => "hcountry" + (f._color ? "" : " wild") + " p" + (f.properties.BORDERPRECISION || 2))
      .attr("fill", (f) => f._color || null)
      .attr("d", safePath);
    if (animate) {
      // CSS crossfade (δουλεύει και σε background tab, αντίθετα με τα d3 transitions)
      requestAnimationFrame(() => layer.classed("in", true));
      old.classed("out", true);
      setTimeout(() => old.remove(), 800);
    } else {
      old.remove();
    }
  }
  function redrawHist() {
    if (histFeatures.length) renderHist(false);
  }
  function applyLayerVisibility() {
    const showHist = state.historical && histFeatures.length > 0;
    gCountries.style("display", showHist ? "none" : null);
    gHist.style("display", state.historical ? null : "none");
  }

  gHist
    .on("mousemove", (ev) => {
      const target = ev.target;
      if (!target.classList || !target.classList.contains("hcountry")) return hideTooltip();
      const p = d3.select(target).datum().properties || {};
      const name = p.NAME || "";
      if (!name) return hideTooltip();
      const sub = p.SUBJECTO && p.SUBJECTO !== name ? `<div class="tt-desc">${esc(t("under"))} ${esc(p.SUBJECTO)}</div>` : "";
      const [x, y] = d3.pointer(ev, els.mapWrap);
      showTooltipHTML(`<div class="tt-title">${esc(name)}</div>${sub}`, x, y, "");
    })
    .on("mouseleave", hideTooltip);

  async function loadWorld() {
    try {
      const topo = await d3.json(WORLD_URL);
      const geo = topojson.feature(topo, topo.objects.countries);
      countriesFeatures = geo.features;
      countryNames = new Map(countriesFeatures.map((f) => [f.id, f.properties && f.properties.name]));
      colorCountries(topo);
      els.loading.classList.add("hidden");
      fitProjection();
    } catch (err) {
      console.error("Map load failed", err);
      els.loading.textContent = t("loadError");
    }
  }


  function focusEvent(ev, minK = 3) {
    const k = Math.max(state.zoomK, minK);
    if (isGlobe()) {
      rotateTo(ev.lng, ev.lat, 700);
      els.svg.transition().duration(600).call(zoom.transform, centeredTransform(k));
      return;
    }
    const [x, y] = projection([ev.lng, ev.lat]);
    const tr = d3.zoomIdentity.translate(width() / 2 - x * k, height() / 2 - y * k).scale(k);
    els.svg.transition().duration(600).call(zoom.transform, tr);
  }

  // ---------- Event markers ----------
  // Εικονίδια και ταμπελάκια μεγαλώνουν ήπια με το zoom (√k), αλλά όχι πάνω από 1.5× το αρχικό
  const screenScale = () => Math.min(1.5, Math.sqrt(state.zoomK));
  const bodyScale = () => screenScale() / state.zoomK;
  function bodyTransform(a) {
    const s = bodyScale();
    if (a.ev.from) return `scale(${s})`;
    const [x, y] = projection([a.ev.lng, a.ev.lat]);
    return `translate(${x},${y}) scale(${s})`;
  }

  // Βέλος κατά μήκος μεγάλου κύκλου (π.χ. Τόκιο → Χαβάη περνά από τον Ειρηνικό)
  function arrowPath(ev) {
    return path({ type: "LineString", coordinates: [[ev.from.lng, ev.from.lat], [ev.lng, ev.lat]] });
  }

  function truncate(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
  }

  function buildEvent(g, ev) {
    if (ev.from) {
      g.append("path").attr("class", "arrow-glow");
      g.append("path").attr("class", "arrow");
    }
    g.append("circle").attr("class", "pulse").attr("r", 6 * bodyScale());
    g.append("circle").attr("class", "anchor").attr("r", 3.2 * bodyScale());

    const body = g.append("g").attr("class", "body");
    if (ev.from) {
      // Το εικονίδιο «ταξιδεύει» κατά μήκος του βέλους και σταματά λίγο πριν την αιχμή
      body.append("animateMotion").attr("dur", "1.6s").attr("fill", "freeze").attr("begin", "indefinite")
        .attr("calcMode", "spline").attr("keySplines", "0.3 0 0.2 1").attr("keyTimes", "0;1").attr("keyPoints", "0;0.86");
    }
    body.append("circle").attr("class", "icon-bg").attr("r", 10);
    body.append("text").attr("class", "icon").text(TYPES[ev.type].icon);
    if (FEATURED[ev.id]) body.append("text").attr("class", "star").attr("x", 9).attr("y", -8).text("★");

    const label = body.append("g").attr("class", "label");
    label.append("line").attr("class", "leader");
    const rect = label.append("rect").attr("rx", 7).attr("ry", 7);
    const meta = TYPES[ev.type].label + " · " + yearOf(ev.start) + (ev.end ? "–" + yearOf(ev.end) : "");
    const tYear = label.append("text").attr("class", "lbl-year").attr("text-anchor", "middle").text(meta);
    const tTitle = label.append("text").attr("class", "lbl-title").attr("text-anchor", "middle").text(truncate(ev.title, 40));
    const desc = truncate(ev.description, 56);
    const tDesc = desc ? label.append("text").attr("class", "lbl-desc").attr("text-anchor", "middle").text(desc) : null;

    // Διάταξη ετικέτας: γραμμές από πάνω προς τα κάτω, κουτί γύρω τους
    const lines = [tYear, tTitle, tDesc].filter(Boolean);
    const lh = [11, 14, 12];
    let y = 0;
    lines.forEach((t, i) => { y += lh[i]; t.attr("y", y); });
    let w = 0;
    lines.forEach((t) => { w = Math.max(w, t.node().getComputedTextLength()); });
    const padX = 9, padY = 6;
    const boxW = w + padX * 2, boxH = y + padY * 2;
    rect.attr("x", -boxW / 2).attr("y", 0).attr("width", boxW).attr("height", boxH);
    ev._lbl = { w: boxW, h: boxH };
    lines.forEach((t) => t.attr("y", +t.attr("y") + padY - 3));
    label.attr("transform", `translate(0, ${-(boxH + 16)})`).attr("filter", "url(#label-shadow)");

    body
      .on("mousemove", (mouseEv) => {
        const [x, yy] = d3.pointer(mouseEv, els.mapWrap);
        showTooltipHTML(
          `<div class="tt-meta">${esc(meta)}</div><div class="tt-title">${esc(ev.title)}</div>` +
            (ev.description ? `<div class="tt-desc">${esc(ev.description)}</div>` : ""),
          x, yy, "t-" + ev.type
        );
      })
      .on("mouseleave", hideTooltip)
      .on("click", () => showEvent(ev));
  }

  function layoutEvent(g, ev, restartMotion) {
    g.style("display", onFront(ev.lng, ev.lat) ? null : "none");
    const [x, y] = projection([ev.lng, ev.lat]);
    g.select(".pulse").attr("cx", x).attr("cy", y);
    g.select(".anchor").attr("cx", x).attr("cy", y);
    const body = g.select(".body");
    body.attr("transform", bodyTransform({ ev }));
    ev._pos = { x, y };
    if (ev.from) {
      const d = arrowPath(ev);
      const arrow = g.select(".arrow").attr("d", d);
      const glow = g.select(".arrow-glow").attr("d", d);
      const am = body.select("animateMotion").attr("path", d).node();
      const total = arrow.node().getTotalLength();
      const pt = arrow.node().getPointAtLength(total * 0.86);
      ev._pos = { x: pt.x, y: pt.y };
      if (restartMotion) {
        // Σχεδίαση της γραμμής από την αφετηρία προς τον στόχο
        const len = total;
        [arrow, glow].forEach((p) => {
          p.style("transition", "none").attr("stroke-dasharray", len).attr("stroke-dashoffset", len);
          p.node().getBoundingClientRect(); // force reflow
          p.style("transition", null).attr("stroke-dashoffset", 0);
        });
        if (am && am.beginElement) {
          try { am.beginElement(); } catch (_) { /* ignore */ }
        }
      }
    }
  }

  // Τοποθέτηση ετικετών ώστε να μην καλύπτουν η μία την άλλη (πάνω / κάτω / δεξιά / αριστερά)
  function placeLabels() {
    const s = bodyScale();
    const nodes = [];
    const obstacles = [];
    gEvents.selectAll("g.ev").each(function (a) {
      const p = a.ev._pos;
      if (!p || this.style.display === "none") return;
      const r = 13 * s;
      obstacles.push({ x0: p.x - r, y0: p.y - r, x1: p.x + r, y1: p.y + r, owner: a.ev });
      if (a.labeled && a.ev._lbl) nodes.push({ node: this, a });
    });
    nodes.sort((m, n) => m.a.age - n.a.age);
    const overlaps = (b, c) => !(b.x1 < c.x0 || b.x0 > c.x1 || b.y1 < c.y0 || b.y0 > c.y1);
    for (const { node, a } of nodes) {
      const { w, h } = a.ev._lbl;
      const p = a.ev._pos;
      const cands = [
        [0, -(h + 16)], [0, 16], [w / 2 + 16, -h / 2], [-(w / 2 + 16), -h / 2],
        [w / 2 + 24, -(h + 28)], [-(w / 2 + 24), -(h + 28)], [w / 2 + 24, 28], [-(w / 2 + 24), 28],
        [0, -(2 * h + 40)], [0, h + 40], [w + 30, -h / 2], [-(w + 30), -h / 2],
      ];
      let chosen = null;
      for (const [tx, ty] of cands) {
        const box = { x0: p.x + s * (tx - w / 2) - 3, y0: p.y + s * ty - 3, x1: p.x + s * (tx + w / 2) + 3, y1: p.y + s * (ty + h) + 3 };
        if (!obstacles.some((o) => o.owner !== a.ev && overlaps(o, box))) { chosen = [tx, ty]; obstacles.push(box); break; }
      }
      const label = d3.select(node).select(".label")
        .style("display", chosen ? null : "none")
        .attr("transform", chosen ? `translate(${chosen[0]}, ${chosen[1]})` : null);
      // Γραμμή-οδηγός από το κουτί προς το εικονίδιο (σε τοπικές συντεταγμένες της ετικέτας)
      if (chosen) label.select(".leader").attr("x1", 0).attr("y1", h / 2).attr("x2", -chosen[0]).attr("y2", -chosen[1]);
    }
  }

  function renderEvents() {
    const data = activeEvents(state.t);
    gEvents
      .selectAll("g.ev")
      .data(data, (a) => a.ev.id)
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", (a) => "ev t-" + a.ev.type + (FEATURED[a.ev.id] ? " featured" : ""))
            .each(function (a) {
              const g = d3.select(this);
              buildEvent(g, a.ev);
              layoutEvent(g, a.ev, true);
            }),
        (update) => update,
        (exit) => exit.remove()
      )
      .classed("old", (a) => !a.labeled)
      .style("opacity", (a) => a.opacity)
      .each(function (a) {
        d3.select(this).select(".pulse").style("display", a.fresh ? null : "none");
      });
    placeLabels();
    updatePanel(data);
  }

  // ---------- Panel ----------
  const openBtn = document.createElement("button");
  openBtn.className = "panel-open-btn";
  function renderOpenBtn() {
    openBtn.innerHTML = `<span class="ico">📋</span><span class="full">${esc(t("now"))}</span><span class="cnt">${esc(els.panelCount.textContent || "0")}</span>`;
  }
  renderOpenBtn();
  openBtn.addEventListener("click", () => setPanelCollapsed(false));
  els.mapWrap.appendChild(openBtn);

  function setPanelCollapsed(v) {
    els.panel.classList.toggle("collapsed", v);
    openBtn.classList.toggle("show", v);
  }
  els.panelToggle.addEventListener("click", () => setPanelCollapsed(true));
  setPanelCollapsed(true); // κλειστό εξ ορισμού· ανοίγει μόνο αν το ζητήσει ο χρήστης

  function updatePanel(data) {
    const key = data.map((a) => a.ev.id + (a.labeled ? "*" : "")).join("|");
    if (key === state.panelKey) return;
    state.panelKey = key;
    els.panelCount.textContent = data.length;
    const oc = openBtn.querySelector(".cnt");
    if (oc) oc.textContent = data.length;
    const sorted = data.slice().sort((a, b) => b.ev.s - a.ev.s);
    if (!sorted.length) {
      els.panelList.innerHTML = `<li class="panel-empty">${esc(t("pressPlay"))}</li>`;
      return;
    }
    els.panelList.innerHTML = sorted
      .map((a) => {
        const ev = a.ev;
        const yrs = yearOf(ev.start) + (ev.end ? " – " + yearOf(ev.end) : "");
        return `<li class="t-${ev.type}${a.labeled ? " new" : ""}" data-id="${esc(ev.id)}">
          <span class="bar"></span>
          <span>
            <div class="meta">${esc(yrs)} · ${esc(TYPES[ev.type].label)}</div>
            <div class="ttl">${FEATURED[ev.id] ? '<span class="star">★</span> ' : ""}${esc(TYPES[ev.type].icon)} ${esc(ev.title)}</div>
            ${ev.description ? `<div class="dsc">${esc(ev.description)}</div>` : ""}
          </span>
        </li>`;
      })
      .join("");
  }
  els.panelList.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-id]");
    if (!li) return;
    const ev = EVENTS.find((x) => x.id === li.dataset.id);
    if (ev) showEvent(ev);
  });

  // ---------- Sidebar: φίλτρα ----------
  const HIDDEN_KEY = "we-hidden-types-v2"; // νέο κλειδί ώστε όλοι να πάρουν την προεπιλογή
  // Προεπιλογή: όλα του Ανθρώπου + φυσικές καταστροφές· φυτά, δέντρα, ποτά και ζώα κλειστά
  const DEFAULT_HIDDEN = ["crop", "tree", "spice", "animal"];
  // Στο άνοιγμα ισχύουν πάντα οι προεπιλογές: όλα του Ανθρώπου + φυσικές καταστροφές. Η επιλογή δεν αποθηκεύεται.
  function loadHiddenTypes() {
    DEFAULT_HIDDEN.forEach((t) => state.hiddenTypes.add(t));
    try { localStorage.removeItem(HIDDEN_KEY); } catch (_) { /* ignore */ }
  }
  function saveHiddenTypes() { /* δεν αποθηκεύεται πια */ }
  function buildFilters() {
    const counts = {};
    EVENTS.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1; });
    els.filters.innerHTML = CATEGORIES.map((cat) => {
      const total = cat.types.reduce((n, t) => n + (counts[t] || 0), 0);
      const subs = cat.types.map((t) => `
        <label class="sb-row sub t-${t}" data-type="${t}">
          <input type="checkbox" data-type="${t}" />
          <span class="cb"></span>
          <span class="dot"></span>
          <span class="txt">${esc(TYPES[t].icon)} ${esc(TYPES[t].label)}</span>
          <span class="count">${counts[t] || 0}</span>
        </label>`).join("");
      return `
      <div class="cat" data-cat="${cat.id}">
        <div class="cat-head">
          <label class="sb-row">
            <input type="checkbox" data-cat="${cat.id}" />
            <span class="cb"></span>
            <span class="txt">${esc(cat.icon)} ${esc(cat.label)}</span>
            <span class="count">${total}</span>
          </label>
          <button class="cat-fold" type="button" aria-label="${esc(t("fold"))}" title="${esc(t("fold"))}">▾</button>
        </div>
        <div class="subs">${subs}</div>
      </div>`;
    }).join("");
    syncFilterUI();
  }
  function syncFilterUI() {
    els.filters.querySelectorAll("input[data-type]").forEach((inp) => {
      const on = !state.hiddenTypes.has(inp.dataset.type);
      inp.checked = on;
      inp.closest(".sb-row").classList.toggle("off", !on);
    });
    CATEGORIES.forEach((cat) => {
      const inp = els.filters.querySelector(`input[data-cat="${cat.id}"]`);
      const onCount = cat.types.filter((t) => !state.hiddenTypes.has(t)).length;
      inp.checked = onCount === cat.types.length;
      inp.indeterminate = onCount > 0 && onCount < cat.types.length;
      inp.closest(".sb-row").classList.toggle("off", onCount === 0);
    });
  }
  function setTypesVisible(types, on) {
    types.forEach((t) => (on ? state.hiddenTypes.delete(t) : state.hiddenTypes.add(t)));
    saveHiddenTypes();
    syncFilterUI();
    renderEvents();
  }
  els.filters.addEventListener("change", (e) => {
    const inp = e.target;
    if (inp.dataset.type) setTypesVisible([inp.dataset.type], inp.checked);
    else if (inp.dataset.cat) {
      const cat = CATEGORIES.find((c) => c.id === inp.dataset.cat);
      if (cat) setTypesVisible(cat.types, inp.checked);
    }
  });
  els.filters.addEventListener("click", (e) => {
    const fold = e.target.closest(".cat-fold");
    if (fold) fold.closest(".cat").classList.toggle("folded");
  });
  els.filtersAll.addEventListener("click", () => setTypesVisible(Object.keys(TYPES), true));
  els.filtersNone.addEventListener("click", () => setTypesVisible(Object.keys(TYPES), false));

  // ---------- Αναζήτηση ----------
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const SEARCH_MAX = 80;
  function searchEvents(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return EVENTS.filter((ev) => (!state.featuredOnly || FEATURED[ev.id]) && regionOk(ev) && terms.every((t) => ev._hay.includes(t)));
  }
  function renderSearch() {
    const q = els.search.value.trim();
    const hits = searchEvents(q);
    els.sidebar.classList.toggle("searching", !!q); // τα αποτελέσματα καλύπτουν τα φίλτρα
    if (!q) { els.searchMeta.textContent = ""; els.searchResults.innerHTML = ""; return; }
    els.searchMeta.textContent = hits.length === 0 ? t("noResults")
      : hits.length + " " + (hits.length === 1 ? t("result") : t("results")) + (hits.length > SEARCH_MAX ? " (" + t("first") + " " + SEARCH_MAX + ")" : "") + " · " + t("clickToGo");
    els.searchResults.innerHTML = hits.slice(0, SEARCH_MAX).map((ev) => {
      const yrs = yearOf(ev.start) + (ev.end ? "–" + yearOf(ev.end) : "");
      return `<li class="t-${ev.type}" data-id="${esc(ev.id)}" role="option">
        <span class="bar"></span>
        <span><div class="meta">${esc(yrs)} · ${esc(TYPES[ev.type].label)}</div><div class="ttl">${FEATURED[ev.id] ? '<span class="star">★</span> ' : ""}${esc(TYPES[ev.type].icon)} ${esc(ev.title)}</div></span>
      </li>`;
    }).join("");
  }
  function jumpToEvent(ev) {
    // Σε κινητό το φύλλο των φίλτρων κλείνει για να φανεί ο χάρτης
    if (window.matchMedia("(max-width: 820px)").matches) { els.search.blur(); setSidebarCollapsed(true); }
    showEvent(ev);
  }

  // Μετάβαση σε γεγονός: παύση, σωστή χρονιά, zoom κοντά, popup με την ιστορία και αναπαράσταση στον χάρτη
  function showEvent(ev, { zoom = 2.5 } = {}) {
    if (gameOn()) return; // στο παιχνίδι δεν ανοίγουν γεγονότα (θα έδιναν την απάντηση)
    if (state.hiddenTypes.has(ev.type)) setTypesVisible([ev.type], true);
    const sameYear = Math.floor(state.t / 12) === Math.floor(ev.s / 12);
    const inRange = ev.e != null && state.t >= ev.s && state.t < ev.e;
    if (!sameYear && !inRange) setTime(ev.s, { fromUser: true });
    // Κορυφαίο γεγονός: πάντα η μεγάλη εισαγωγή + popup με φωτογραφίες και αφήγηση (όχι το πλαϊνό πάνελ)
    if (FEATURED[ev.id]) { setStoryCollapsed(true); cinemaIntro(ev); return; }
    focusEvent(ev, zoom);
    openStory(ev);
    playScene(ev);
  }
  els.search.addEventListener("input", renderSearch);
  els.search.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { els.search.value = ""; renderSearch(); els.search.blur(); }
    if (e.key === "Enter") { const first = els.searchResults.querySelector("li[data-id]"); if (first) first.click(); }
    e.stopPropagation();
  });
  els.searchResults.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-id]");
    if (!li) return;
    const ev = EVENTS.find((x) => x.id === li.dataset.id);
    if (!ev) return;
    els.searchResults.querySelectorAll("li.active").forEach((n) => n.classList.remove("active"));
    li.classList.add("active");
    jumpToEvent(ev);
  });

  // ---------- Γλώσσα ----------
  const LANG_KEY = "we-lang";
  function applyStaticTexts() {
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    if (window.WorldSound) WorldSound.setLabels({ on: t("soundOn"), off: t("soundOff") });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }
  function setLang(lang, { init = false } = {}) {
    if (!UI[lang]) lang = "el";
    state.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ }
    document.documentElement.lang = lang;
    Object.values(TYPES).forEach((v) => { v.label = v[lang] || v.el; });
    CATEGORIES.forEach((c) => { c.label = c[lang] || c.el; });
    fillRegionOptions();
    EVENTS.forEach((ev) => {
      const tx = ev[lang] || ev.el;
      ev.title = tx.title;
      ev.description = tx.description;
      ev._hay = norm([ev.title, ev.description, TYPES[ev.type].label, yearOf(ev.start), ev.end ? yearOf(ev.end) : ""].join(" "));
    });
    els.lang.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    applyStaticTexts();
    renderOpenBtn();
    if (init) return;
    // ξαναχτίζουμε ό,τι έχει κείμενο
    gEvents.selectAll("g.ev").remove();
    state.panelKey = "";
    buildFilters();
    buildTicks();
    updateUI();
    renderSearch();
    if (storyEv) openStory(storyEv);
  }
  function initLang() {
    let lang = "el";
    try { lang = localStorage.getItem(LANG_KEY) || ((navigator.language || "").toLowerCase().startsWith("en") ? "en" : "el"); } catch (_) { /* ignore */ }
    setLang(lang, { init: true });
    els.lang.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-lang]");
      if (b && b.dataset.lang !== state.lang) setLang(b.dataset.lang);
    });
  }

  // Κινητό: σύρσιμο προς τα κάτω κλείνει το φύλλο (φίλτρα / συμβαίνει τώρα)
  function enableSwipeToClose(sheet, scrollEl, close) {
    let startY = 0, dy = 0, active = false, inScroll = false;
    const isMobile = () => window.matchMedia("(max-width: 820px)").matches;
    sheet.addEventListener("touchstart", (e) => {
      if (!isMobile() || e.touches.length !== 1) return;
      startY = e.touches[0].clientY; dy = 0; active = true;
      inScroll = scrollEl.contains(e.target);
    }, { passive: true });
    sheet.addEventListener("touchmove", (e) => {
      if (!active) return;
      const y = e.touches[0].clientY - startY;
      if (inScroll && scrollEl.scrollTop > 0) { dy = 0; return; } // αφήνουμε τη λίστα να κάνει scroll
      if (y <= 0) { dy = 0; sheet.style.transform = ""; sheet.style.transition = ""; return; }
      dy = y;
      sheet.style.transition = "none";
      sheet.style.transform = "translateY(" + y + "px)";
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    const end = () => {
      if (!active) return;
      active = false;
      sheet.style.transition = "";
      sheet.style.transform = "";
      if (dy > 90) { if (document.activeElement) document.activeElement.blur(); close(); }
      dy = 0;
    };
    sheet.addEventListener("touchend", end);
    sheet.addEventListener("touchcancel", end);
  }

  // Άνοιγμα/κλείσιμο sidebar (θυμάται την επιλογή)
  const SIDEBAR_KEY = "we-sidebar";
  function setSidebarCollapsed(v, persist = true) {
    els.sidebar.classList.toggle("collapsed", v);
    els.sidebarOpen.classList.toggle("show", v);
    els.searchOpen.classList.toggle("show", v);
    if (persist) { try { localStorage.setItem(SIDEBAR_KEY, v ? "0" : "1"); } catch (_) { /* ignore */ } }
  }
  function initSidebar() {
    let open = !window.matchMedia("(max-width: 1100px)").matches;
    try { const s = localStorage.getItem(SIDEBAR_KEY); if (s != null) open = s === "1"; } catch (_) { /* ignore */ }
    setSidebarCollapsed(!open, false);
    els.sidebarOpen.addEventListener("click", () => setSidebarCollapsed(false));
    // Κινητό: άμεση πρόσβαση στην αναζήτηση (ανοίγει τα φίλτρα και εστιάζει στο πεδίο)
    els.searchOpen.addEventListener("click", () => {
      setSidebarCollapsed(false);
      els.sidebar.querySelector(".sb-body").scrollTop = 0;
      setTimeout(() => els.search.focus(), 280);
    });
    els.sidebarClose.addEventListener("click", () => setSidebarCollapsed(true));
  }

  // ---------- Timeline ----------
  // Κρύβει ημερομηνίες που θα έπεφταν η μία πάνω στην άλλη (π.χ. 3000 π.Χ. / 2000 π.Χ. σε στενές οθόνες).
  // Προτεραιότητα έχει η πρώτη ημερομηνία κάθε ζεύγους, ώστε να μένουν πάντα η αρχή και οι μεγάλοι σταθμοί.
  function layoutTickLabels() {
    const labels = [...els.ticks.querySelectorAll(".tick-label")];
    labels.forEach((l) => { l.style.visibility = ""; });
    if (!labels.length || !labels[0].getClientRects().length) return;
    labels.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
    let lastRight = -Infinity;
    for (const l of labels) {
      const r = l.getBoundingClientRect();
      if (r.left < lastRight + 8) { l.style.visibility = "hidden"; continue; }
      lastRight = r.right;
    }
  }

  function buildTicks() {
    els.ticks.innerHTML = "";
    const frag = document.createDocumentFragment();
    // Ιστορικά έτη (αρνητικά = π.Χ.). Τα major έχουν ετικέτα.
    const majors = [-3000, -2000, -1000, 1, 500, 1000, 1500, 1600, 1700, 1800, 1900, 2000];
    const minors = [];
    for (let y = -3000; y < -500; y += 250) minors.push(y);
    for (let y = -500; y < 1500; y += 100) minors.push(y);
    for (let y = 1500; y <= 2025; y += 25) minors.push(y);
    const toAstro = (y) => (y < 0 ? y + 1 : y);
    const seen = new Set();
    for (const y of [...majors, ...minors]) {
      if (seen.has(y)) continue;
      seen.add(y);
      const isMajor = majors.includes(y);
      const pct = (monthsToTrack((toAstro(y) - START_YEAR) * 12) / TRACK_MAX) * 100;
      const tick = document.createElement("div");
      tick.className = "tick" + (isMajor ? " major" : "");
      tick.style.left = pct + "%";
      if (isMajor) {
        const lbl = document.createElement("span");
        lbl.className = "tick-label" + (pct < 2 ? " first" : pct > 98 ? " last" : "");
        lbl.textContent = y < 0 ? -y + " " + t("bc") : y === 1 ? "0" : y;
        tick.appendChild(lbl);
      }
      frag.appendChild(tick);
    }
    els.ticks.appendChild(frag);
    layoutTickLabels();
    els.labelStart.textContent = "3000 " + t("bc");
    els.labelEnd.textContent = END_YEAR;

    // Μικρά σημάδια γεγονότων πάνω στη μπάρα
    const marks = document.createDocumentFragment();
    for (const ev of EVENTS) {
      if (!regionOk(ev)) continue;
      const m = document.createElement("span");
      m.className = "event-mark t-" + ev.type;
      m.style.left = (monthsToTrack(ev.s) / TRACK_MAX) * 100 + "%";
      marks.appendChild(m);
    }
    els.eventMarks.innerHTML = "";
    els.eventMarks.appendChild(marks);
  }

  function updateUI() {
    const { year, month } = monthsToDate(state.t);
    els.year.textContent = yearLabel(year);
    els.month.textContent = MONTHS[state.lang][month];
    els.era.textContent = eraLabel(year);
    ensureBasemap(year);
    const u = monthsToTrack(state.t);
    els.track.value = Math.round(u);
    els.track.style.setProperty("--pct", (u / TRACK_MAX) * 100 + "%");
    renderEvents();
  }

  function setTime(t, { fromUser = false } = {}) {
    state.t = clampT(t);
    if (fromUser && cinemaActive()) closeCinema();
    updateUI();
  }

  // Βελάκια: μετάβαση στο επόμενο / προηγούμενο ορατό γεγονός (όχι κρυμμένου τύπου)
  function stepEvent(dir) {
    if (gameOn()) return;
    const visible = EVENTS.filter((ev) => !state.hiddenTypes.has(ev.type) && (!state.featuredOnly || FEATURED[ev.id]) && regionOk(ev));
    if (!visible.length) return;
    const cur = state.t;
    let target = null;
    if (dir > 0) {
      target = visible.find((ev) => ev.s > cur + 0.5) || null;
    } else {
      for (let i = visible.length - 1; i >= 0; i--) {
        if (visible[i].s < cur - 0.5) { target = visible[i]; break; }
      }
    }
    if (!target) return;
    setStoryCollapsed(true);
    setTime(target.s, { fromUser: true });
    if (FEATURED[target.id]) { cinemaIntro(target); return; } // κορυφαίο: μεγάλη εισαγωγή + βίντεο
    if (state.zoomK > 1.01) els.svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    rotateTo(target.lng, target.lat, 700);
    playScene(target);
  }

  els.stepBack.addEventListener("click", () => stepEvent(-1));
  els.stepFwd.addEventListener("click", () => stepEvent(1));

  els.track.min = 0;
  els.track.max = TRACK_MAX;
  els.track.addEventListener("input", () => setTime(trackToMonths(Number(els.track.value)), { fromUser: true }));

  document.addEventListener("keydown", (ev) => {
    if (ev.target && /INPUT|TEXTAREA|BUTTON/.test(ev.target.tagName) && ev.code !== "Space") return;
    if (tour && (ev.code === "ArrowRight" || ev.code === "ArrowLeft")) { gotoStop(tour.i + (ev.code === "ArrowRight" ? 1 : -1)); return; }
    if (gameOn()) { // στο παιχνίδι: Escape κλείνει, βελάκια = 10 χρόνια στο timeline
      if (ev.code === "Escape") closeGame();
      else if (ev.code === "ArrowRight") setTime(state.t + 120, { fromUser: true });
      else if (ev.code === "ArrowLeft") setTime(state.t - 120, { fromUser: true });
      return;
    }
    switch (ev.code) {
      case "Space": ev.preventDefault(); if (cinemaActive()) closeCinema(); else stepEvent(1); break;
      // Βελάκια: επόμενο/προηγούμενο γεγονός· με Shift: βήμα 10 ετών
      case "ArrowRight": if (cinemaOpen() && cinemaGal) { cinemaGal.root.querySelector(".gal-next").click(); break; } if (ev.shiftKey) setTime(state.t + stepMonths() * 10, { fromUser: true }); else stepEvent(1); break;
      case "ArrowLeft": if (cinemaOpen() && cinemaGal) { cinemaGal.root.querySelector(".gal-prev").click(); break; } if (ev.shiftKey) setTime(state.t - stepMonths() * 10, { fromUser: true }); else stepEvent(-1); break;
      case "Escape": if (cinemaActive()) closeCinema(); else setStoryCollapsed(true); break;
      case "Home": setTime(0, { fromUser: true }); break;
      case "End": setTime(TOTAL_MONTHS - 1, { fromUser: true }); break;
    }
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { fitProjection(); layoutTickLabels(); }, 80);
  });

  // ---------- Παιχνίδι (κουίζ): ένας ή δύο παίκτες, 10 ερωτήσεις ----------
  // Τύποι ερώτησης: (α) 4 επιλογές — «ποιο γεγονός συνέβη το Χ» / «σε ποια ήπειρο», (β) timeline —
  // ο παίκτης σέρνει το timeline ώστε ένα παράθυρο 100 ετών να καλύπτει την εποχή του γεγονότος.
  const G = { on: false, mode: 1, round: 0, total: 10, player: 0, scores: [0, 0], q: null, phase: "" };
  const gameEls = { root: $("#game"), body: $("#game-body"), status: $("#game-status"), btn: $("#game-btn"), close: $("#game-close"), win: $("#game-window") };
  const gameOn = () => G.on;
  const rnd = (n) => Math.floor(Math.random() * n);
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gamePool = () => EVENTS.filter((ev) => !ev.regional && ev.title && isFinite(ev.lng) && !state.hiddenTypes.has(ev.type));
  const evYear = (ev) => parseDate(ev.start).y;
  const yearToMonths = (y) => (y - START_YEAR) * 12;
  const fill = (key, vars) => Object.keys(vars).reduce((s, k) => s.split("{" + k + "}").join(String(vars[k])), t(key));
  function openGame() {
    closeCinema(); setStoryCollapsed(true); setPanelCollapsed(true); hidePostcard();
    if (isMobile()) setSidebarCollapsed(true, false);
    G.on = true;
    document.body.classList.add("game-on");
    gameEls.root.classList.remove("collapsed");
    gameEls.btn.classList.add("on"); gameEls.btn.setAttribute("aria-pressed", "true");
    showModeSelect();
  }
  function closeGame() {
    G.on = false; G.q = null; G.phase = "";
    document.body.classList.remove("game-on", "game-reveal");
    gameEls.root.classList.add("collapsed");
    gameEls.btn.classList.remove("on"); gameEls.btn.setAttribute("aria-pressed", "false");
    gameEls.win.hidden = true;
  }
  function showModeSelect() {
    if (!G.on) return;
    gameEls.status.textContent = "";
    document.body.classList.remove("game-reveal");
    gameEls.win.hidden = true;
    gameEls.body.innerHTML = '<p class="game-q">' + esc(t("gameWelcome")) + '</p><p class="game-hint">' + esc(t("gameRules")) + "</p>" +
      '<div class="game-actions"><button type="button" class="primary" data-mode="1">👤 ' + esc(t("gameSingle")) + '</button><button type="button" data-mode="2">👥 ' + esc(t("gameDual")) + "</button></div>";
    gameEls.body.querySelectorAll("[data-mode]").forEach((b) => { b.onclick = () => startGame(Number(b.dataset.mode)); });
  }
  function startGame(mode) {
    G.mode = mode; G.round = 0; G.player = 0; G.scores = [0, 0]; G.total = 10;
    nextQuestion();
  }
  function makeQuestion(depth = 0) {
    const pool = gamePool();
    if (pool.length < 8 || depth > 20) return null;
    const kind = rnd(3); // 0: έτος -> γεγονός, 1: γεγονός -> ήπειρος, 2: timeline
    const ev = pool[rnd(pool.length)];
    const y = evYear(ev);
    if (kind === 0) {
      const others = shuffle(pool.filter((o) => o !== ev && Math.abs(evYear(o) - y) >= 40 && o.title !== ev.title)).slice(0, 3);
      if (others.length < 3) return makeQuestion(depth + 1);
      return { kind: "mc", ev, text: fill("gameQYear", { year: yearLabel(y) }), options: shuffle([ev, ...others]).map((o) => ({ label: o.title, ok: o === ev })), answer: ev.title };
    }
    if (kind === 1) {
      const c = CONTINENTS.list.find((k) => k.key === ev._cont);
      if (!c) return makeQuestion(depth + 1);
      const name = (k) => k[state.lang] || k.el;
      const others = shuffle(CONTINENTS.list.filter((k) => k !== c)).slice(0, 3);
      return { kind: "mc", ev, text: fill("gameQWhere", { event: ev.title }), options: shuffle([c, ...others]).map((k) => ({ label: name(k), ok: k === c })), answer: name(c) };
    }
    return { kind: "tl", ev, year: y, text: fill("gameQWhen", { event: ev.title }), answer: yearLabel(y) };
  }
  function nextQuestion() {
    if (!G.on) return;
    if (G.round >= G.total) return showFinal();
    const q = makeQuestion();
    if (!q) { closeGame(); return; }
    G.q = q; G.phase = "ask";
    if (G.mode === 2) G.player = G.round % 2;
    document.body.classList.remove("game-reveal");
    renderQuestion();
  }
  function statusText() {
    let s = fill("gameRound", { n: G.round + 1, total: G.total });
    if (G.mode === 2) s += " · " + fill("gamePlayer", { n: G.player + 1 });
    return s;
  }
  function scoresHtml() {
    if (G.mode === 1) return '<div class="game-scores"><div class="game-score active"><div class="n">' + G.scores[0] + '</div><div class="who">' + esc(t("gameScore")) + "</div></div></div>";
    return '<div class="game-scores">' + [0, 1].map((i) => '<div class="game-score' + (i === G.player ? " active" : "") + '"><div class="n">' + G.scores[i] + '</div><div class="who">' + esc(fill("gamePlayer", { n: i + 1 })) + "</div></div>").join("") + "</div>";
  }
  function renderQuestion() {
    const q = G.q;
    gameEls.status.textContent = statusText();
    gameEls.win.hidden = true;
    if (q.kind === "mc") {
      gameEls.body.innerHTML = '<p class="game-q">' + esc(q.text) + '</p><div class="game-opts">' + q.options.map((o, i) => '<button type="button" data-i="' + i + '">' + esc(o.label) + "</button>").join("") + '</div><div class="game-feedback"></div>' + scoresHtml();
      gameEls.body.querySelectorAll(".game-opts button").forEach((b) => { b.onclick = () => answerMc(Number(b.dataset.i)); });
      return;
    }
    gameEls.body.innerHTML = '<p class="game-q">' + esc(q.text) + '</p><p class="game-hint">' + esc(t("gameTlHint")) + "</p>" +
      '<div class="game-actions"><button type="button" class="primary" id="game-answer">' + esc(t("gameAnswer")) + '</button></div><div class="game-feedback"></div>' + scoresHtml();
    gameEls.body.querySelector("#game-answer").onclick = answerTl;
    gameEls.win.hidden = false;
    updateGameWindow();
  }
  const curYear = () => monthsToDate(state.t).year;
  function updateGameWindow() {
    if (gameEls.win.hidden) return;
    const y = curYear();
    const lo = Math.max(START_YEAR, y - 50), hi = Math.min(END_YEAR, y + 49);
    const a = (monthsToTrack(yearToMonths(lo)) / TRACK_MAX) * 100, b = (monthsToTrack(yearToMonths(hi + 1)) / TRACK_MAX) * 100;
    gameEls.win.style.left = a + "%";
    gameEls.win.style.width = Math.max(0.6, b - a) + "%";
    gameEls.win.querySelector(".game-window-lbl").textContent = yearLabel(lo) + " – " + yearLabel(hi);
  }
  function answerMc(i) {
    if (!G.on || G.phase !== "ask") return;
    G.phase = "fb";
    const q = G.q, ok = q.options[i].ok;
    gameEls.body.querySelectorAll(".game-opts button").forEach((b, j) => { b.disabled = true; if (q.options[j].ok) b.classList.add("correct"); else if (j === i) b.classList.add("wrong"); });
    finishAnswer(ok, q.answer, null);
  }
  function answerTl() {
    if (!G.on || G.phase !== "ask") return;
    G.phase = "fb";
    const q = G.q, y = curYear();
    const diff = Math.abs(q.year - y);
    gameEls.win.hidden = true;
    finishAnswer(diff <= 50, q.answer, diff);
  }
  function finishAnswer(ok, answer, diff) {
    if (ok) G.scores[G.player]++;
    const fb = gameEls.body.querySelector(".game-feedback");
    fb.className = "game-feedback " + (ok ? "ok" : "bad");
    fb.innerHTML = esc(ok ? t("gameCorrect") : t("gameWrong")) + "<small>" + esc(fill("gameAnswerWas", { answer })) + (diff != null && diff > 0 ? " · " + esc(fill("gameOff", { n: diff })) : "") + "</small>";
    if (window.WorldSound) WorldSound.ding(ok);
    const sc = gameEls.body.querySelector(".game-scores");
    if (sc) sc.outerHTML = scoresHtml();
    G.round++;
    const act = document.createElement("div");
    act.className = "game-actions";
    act.innerHTML = '<button type="button" class="primary">' + esc(G.round >= G.total ? t("gameResults") : t("gameNext")) + " ›</button>";
    act.querySelector("button").onclick = nextQuestion;
    gameEls.body.appendChild(act);
    // Αποκάλυψη: ο χάρτης πάει στη χρονιά του γεγονότος και το δείχνει με την αναπαράστασή του
    const ev = G.q.ev;
    document.body.classList.add("game-reveal");
    setTime(ev.s, { fromUser: true });
    rotateTo(ev.lng, ev.lat, 700);
    playScene(ev);
  }
  function showFinal() {
    G.q = null; G.phase = "end";
    gameEls.win.hidden = true;
    gameEls.status.textContent = "";
    let html;
    if (G.mode === 1) html = '<div class="game-final"><div class="big">🏆</div><p class="game-q">' + esc(fill("gameFinalSingle", { score: G.scores[0], total: G.total })) + "</p></div>";
    else { const [a, b] = G.scores; html = '<div class="game-final"><div class="big">🏆</div><p class="game-q">' + esc(a === b ? t("gameTie") : fill("gameWinner", { n: a > b ? 1 : 2 })) + "</p>" + scoresHtml() + "</div>"; }
    html += '<div class="game-actions"><button type="button" class="primary" id="game-again">↻ ' + esc(t("gameAgain")) + '</button><button type="button" id="game-quit">' + esc(t("close")) + "</button></div>";
    gameEls.body.innerHTML = html;
    gameEls.body.querySelector("#game-again").onclick = showModeSelect;
    gameEls.body.querySelector("#game-quit").onclick = closeGame;
  }
  gameEls.btn.addEventListener("click", () => (G.on ? closeGame() : openGame()));
  gameEls.close.addEventListener("click", closeGame);
  els.track.addEventListener("input", updateGameWindow);

  // ---------- Public API ----------
  window.WorldEventsApp = {
    get date() { return monthsToDate(state.t); },
    setDate(dateStr) { setTime(dateToMonths(dateStr), { fromUser: true }); },
    focusEvent, setTypesVisible, jumpToEvent, setLang, search: searchEvents,
    refreshEvents: renderEvents,
    get projection() { return projection; },
    setProjection, showEvent, openStory, playScene, featured: FEATURED,
    events: EVENTS,
    config: { START_YEAR, END_YEAR, SEGMENTS },
  };

  // ---------- Init ----------
  if (window.WorldSound) WorldSound.init(document.getElementById("sound-toggle"), null, document.getElementById("sound-volume"));
  initLang();
  loadHiddenTypes();
  buildFilters();
  initSidebar();
  enableSwipeToClose(els.sidebar, els.sidebar.querySelector(".sb-body"), () => setSidebarCollapsed(true));
  enableSwipeToClose(els.panel, els.panelList, () => setPanelCollapsed(true));
  enableSwipeToClose(els.story, els.storyBody, () => setStoryCollapsed(true));
  initMapOptions();
  els.featuredOnly.addEventListener("click", () => {
    state.featuredOnly = !state.featuredOnly;
    els.featuredOnly.classList.toggle("on", state.featuredOnly);
    els.featuredOnly.setAttribute("aria-pressed", String(state.featuredOnly));
    gEvents.selectAll("g.ev").remove();
    state.panelKey = "";
    updateUI();
    renderSearch();
  });
  // ---------- Ήπειρος: φίλτρο + zoom στην περιοχή ----------
  function fillRegionOptions() {
    const sel = els.region;
    const cur = state.region || "";
    sel.innerHTML = "";
    const add = (v, label) => { const o = document.createElement("option"); o.value = v; o.textContent = label; sel.appendChild(o); };
    add("", t("regionAll"));
    CONTINENTS.list.forEach((c) => add(c.key, c[state.lang] || c.el));
    sel.value = cur;
  }
  function zoomToRegion(c) {
    const dur = 800;
    if (!c) {
      els.svg.transition().duration(dur).call(zoom.transform, isGlobe() ? centeredTransform(1) : d3.zoomIdentity);
      return;
    }
    const [[lng0, lat0], [lng1, lat1]] = c.bbox;
    const cLng = (lng0 + lng1) / 2, cLat = (lat0 + lat1) / 2;
    if (isGlobe()) {
      const span = Math.max(lng1 - lng0, (lat1 - lat0) * 1.3);
      const k = Math.max(1, Math.min(6, 110 / span));
      rotateTo(cLng, cLat, dur);
      els.svg.transition().duration(dur).call(zoom.transform, centeredTransform(k));
      return;
    }
    const pts = [[lng0, lat0], [lng1, lat0], [lng0, lat1], [lng1, lat1]].map((p) => projection(p));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = width(), h = height();
    const k = Math.max(1, Math.min(14, 0.9 * Math.min(w / (x1 - x0), h / (y1 - y0))));
    const tr = d3.zoomIdentity.translate(w / 2 - (k * (x0 + x1)) / 2, h / 2 - (k * (y0 + y1)) / 2).scale(k);
    els.svg.transition().duration(dur).call(zoom.transform, zoom.constrain()(tr, [[0, 0], [w, h]], zoom.translateExtent()));
  }
  els.region.addEventListener("change", () => {
    state.region = els.region.value || null;
    els.region.classList.toggle("on", !!state.region);
    gEvents.selectAll("g.ev").remove();
    state.panelKey = "";
    buildTicks();
    updateUI();
    renderSearch();
    zoomToRegion(CONTINENTS.list.find((c) => c.key === state.region));
  });
  applyLayerVisibility();
  buildTicks();
  fitProjection();
  state.t = 0; // η σελίδα ανοίγει στην αρχή, 3000 π.Χ.
  updateUI();
  loadWorld();
})();
