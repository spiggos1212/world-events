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
    [-2999, -499, 0.14],
    [-499, 501, 0.16],
    [501, 1500, 0.20],
    [1500, 1900, 0.24],
    [1900, END_YEAR + 1, 0.26],
  ];
  const TRACK_MAX = 100000;
  // Διάρκεια όλης της μπάρας στο 1×, ρυθμισμένη ώστε μετά το 1900 να περνά 1 έτος ανά δευτερόλεπτο
  const TRACK_SECONDS = (END_YEAR + 1 - 1900) / 0.26;
  const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  const MONTHS_EL = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
  const MAX_LABELS = 9; // μέγιστες ετικέτες ταυτόχρονα στον χάρτη

  const TYPES = {
    war: { label: "Πόλεμος", icon: "💂" },
    revolution: { label: "Επανάσταση", icon: "✊" },
    politics: { label: "Πολιτική", icon: "🏛️" },
    exploration: { label: "Εξερεύνηση", icon: "⛵" },
    science: { label: "Επιστήμη", icon: "🔬" },
    culture: { label: "Πολιτισμός", icon: "🎨" },
    economy: { label: "Οικονομία", icon: "💰" },
    tragedy: { label: "Ανθρωπογενής καταστροφή", icon: "☢️" },
    disaster: { label: "Φυσική καταστροφή", icon: "🌋" },
    crop: { label: "Καλλιέργειες & φυτά", icon: "🌾" },
    tree: { label: "Δέντρα", icon: "🌳" },
    spice: { label: "Ποτά & μπαχαρικά", icon: "☕" },
  };
  // Κατηγορίες φίλτρων (sidebar): κάθε τύπος ανήκει σε μία κατηγορία
  const CATEGORIES = [
    { id: "human", label: "Άνθρωπος", icon: "🧑", types: ["war", "revolution", "politics", "exploration", "science", "culture", "economy", "tragedy"] },
    { id: "nature", label: "Φύση", icon: "🌍", types: ["disaster", "crop", "tree", "spice"] },
  ];

  // Παλέτα χωρών (ήπια «ζωγραφισμένα» χρώματα πάνω σε σκούρο ωκεανό)
  const LAND_PALETTE = ["#355a86", "#2e7066", "#5e4b8b", "#8c5a3a", "#4f7a3a", "#8a3f5f", "#3c7a8c", "#8a7a35"];

  // ---------- State ----------
  const state = {
    t: 0,
    playing: false,
    speed: 1,
    lastFrame: 0,
    rafId: 0,
    zoomK: 1,
    hiddenTypes: new Set(),
    panelKey: "",
    historical: true,
  };

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const els = {
    mapWrap: $("#map-wrap"),
    svg: d3.select("#map"),
    tooltip: $("#tooltip"),
    loading: $("#loading"),
    play: $("#play"),
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
    speed: $("#speed"),
    speedInput: $("#speed-input"),
    filters: $("#filters"),
    filtersAll: $("#filters-all"),
    filtersNone: $("#filters-none"),
    sidebar: $("#sidebar"),
    sidebarOpen: $("#sidebar-open"),
    sidebarClose: $("#sidebar-close"),
    panel: $("#panel"),
    panelList: $("#panel-list"),
    panelCount: $("#panel-count"),
    panelToggle: $("#panel-toggle"),
    histToggle: $("#hist-toggle"),
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
    return astroYear <= 0 ? 1 - astroYear + " π.Χ." : String(astroYear);
  }
  function yearOf(dateStr) {
    return yearLabel(parseDate(dateStr).y);
  }
  function eraLabel(year) {
    if (year <= 0) return Math.floor(-year / 100) + 1 + "ος αιώνας π.Χ.";
    const c = Math.floor((year - 1) / 100) + 1;
    return (c === 20 ? "20ός" : c + "ος") + " αιώνας";
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
  // Μήνες αναπαραγωγής ανά δευτερόλεπτο: state.speed = έτη/δευτ., σταθερό σε όλες τις εποχές
  function playRate() {
    return 12 * state.speed;
  }
  // Πόσους μήνες μένει ορατό/με ετικέτα ένα γεγονός: ~3 δευτ. αναπαραγωγής (τουλάχιστον 2 έτη),
  // λίγο περισσότερο σε μεγάλες ταχύτητες ώστε να προλαβαίνει να διαβαστεί
  function visibleMonthsAt() {
    return Math.max(24, 3 * playRate() * Math.max(1, Math.sqrt(state.speed / 2)));
  }
  // Βήμα με τα βελάκια: 1 έτος, ή μισό δευτερόλεπτο αναπαραγωγής σε μεγάλες ταχύτητες
  function stepMonths() {
    return Math.max(12, Math.round((playRate() * 0.5) / 12) * 12);
  }

  // ---------- Events data ----------
  const EVENTS = (Array.isArray(window.WORLD_EVENTS) ? window.WORLD_EVENTS : [])
    .filter((e) => e.lat != null && e.lng != null && e.start && TYPES[e.type])
    .map((e) => ({ ...e, s: dateToMonths(e.start), e: e.end ? dateToMonths(e.end) : null }))
    .sort((a, b) => a.s - b.s);

  function activeEvents(t) {
    const out = [];
    for (const ev of EVENTS) {
      if (ev.s > t) break; // ταξινομημένα κατά έναρξη
      if (state.hiddenTypes.has(ev.type)) continue;
      const vis = visibleMonthsAt(ev.s);
      const end = ev.e != null ? Math.max(ev.e, ev.s + vis / 3) : ev.s + vis;
      const fade = vis / 6;
      if (t > end + fade) continue;
      const age = t - ev.s;
      out.push({
        ev,
        age,
        labeled: age <= vis,
        opacity: t > end ? 1 - (t - end) / fade : 1,
        fresh: age < vis / 4,
      });
    }
    // Ετικέτες μόνο για τα πιο πρόσφατα
    const labeled = out.filter((a) => a.labeled).sort((a, b) => a.age - b.age);
    labeled.forEach((a, i) => { if (i >= MAX_LABELS) a.labeled = false; });
    return out;
  }

  // ---------- Map ----------
  const width = () => els.mapWrap.clientWidth;
  const height = () => els.mapWrap.clientHeight;

  const projection = d3.geoNaturalEarth1();
  const path = d3.geoPath(projection);

  const gRoot = els.svg.append("g").attr("class", "root");
  const gSphere = gRoot.append("path").attr("class", "sphere");
  const gGrat = gRoot.append("path").attr("class", "graticule");
  const gCountries = gRoot.append("g").attr("class", "countries");
  const gHist = gRoot.append("g").attr("class", "hist-layer");
  const gEvents = gRoot.append("g").attr("class", "events-layer");

  let countriesFeatures = [];
  let countryColors = new Map();
  let countryNames = new Map();

  const zoom = d3
    .zoom()
    .scaleExtent([1, 14])
    .on("zoom", (ev) => {
      gRoot.attr("transform", ev.transform);
      state.zoomK = ev.transform.k;
      gEvents.selectAll("g.ev .body").attr("transform", bodyTransform);
      placeLabels();
    });
  els.svg.call(zoom);

  function fitProjection() {
    const w = width();
    const h = height();
    els.svg.attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    projection.fitExtent([[12, 12], [w - 12, h - 12]], { type: "Sphere" });
    redrawMap();
  }

  function redrawMap() {
    gSphere.attr("d", path({ type: "Sphere" }));
    gGrat.attr("d", path(d3.geoGraticule10()));
    gCountries
      .selectAll("path.country")
      .data(countriesFeatures, (d) => d.id)
      .join("path")
      .attr("class", "country")
      .attr("fill", (d) => countryColors.get(d.id) || LAND_PALETTE[0])
      .attr("d", path);
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
  // Το d3 θέλει τα εξωτερικά δακτυλίδια «μικρά» (< μισή σφαίρα), αλλιώς γεμίζει όλη τη σφαίρα.
  function rewind(feature) {
    const g = feature.geometry;
    if (!g) return;
    const fixPoly = (rings) => {
      rings.forEach((ring, i) => {
        const a = d3.geoArea({ type: "Polygon", coordinates: [ring] });
        const big = a > 2 * Math.PI;
        if ((i === 0 && big) || (i > 0 && !big)) ring.reverse();
      });
    };
    if (g.type === "Polygon") fixPoly(g.coordinates);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(fixPoly);
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
      .attr("d", path);
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
  function setHistorical(on) {
    state.historical = on;
    try { localStorage.setItem("we-historical-borders", on ? "1" : "0"); } catch (_) { /* ignore */ }
    els.histToggle.checked = on;
    if (on) {
      histCurrentYear = null;
      ensureBasemap(monthsToDate(state.t).year);
    }
    applyLayerVisibility();
  }
  function initHistoricalToggle() {
    let on = true;
    try { on = localStorage.getItem("we-historical-borders") !== "0"; } catch (_) { /* ignore */ }
    state.historical = on;
    els.histToggle.checked = on;
    els.histToggle.addEventListener("change", () => setHistorical(els.histToggle.checked));
    applyLayerVisibility();
  }

  gHist
    .on("mousemove", (ev) => {
      const target = ev.target;
      if (!target.classList || !target.classList.contains("hcountry")) return hideTooltip();
      const p = d3.select(target).datum().properties || {};
      const name = p.NAME || "";
      if (!name) return hideTooltip();
      const sub = p.SUBJECTO && p.SUBJECTO !== name ? `<div class="tt-desc">υπό: ${esc(p.SUBJECTO)}</div>` : "";
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
      els.loading.textContent = "Αποτυχία φόρτωσης χάρτη. Έλεγξε τη σύνδεση και κάνε ανανέωση.";
    }
  }


  function focusEvent(ev) {
    const [x, y] = projection([ev.lng, ev.lat]);
    const k = Math.max(state.zoomK, 3);
    const tr = d3.zoomIdentity.translate(width() / 2 - x * k, height() / 2 - y * k).scale(k);
    els.svg.transition().duration(600).call(zoom.transform, tr);
  }

  // ---------- Event markers ----------
  function bodyTransform(a) {
    const s = 1 / Math.sqrt(state.zoomK); // μικραίνουν ήπια όσο κάνουμε zoom
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
    g.append("circle").attr("class", "pulse").attr("r", 6);
    g.append("circle").attr("class", "anchor").attr("r", 3.2);

    const body = g.append("g").attr("class", "body");
    if (ev.from) {
      // Το εικονίδιο «ταξιδεύει» κατά μήκος του βέλους και σταματά λίγο πριν την αιχμή
      body.append("animateMotion").attr("dur", "1.6s").attr("fill", "freeze").attr("begin", "indefinite")
        .attr("calcMode", "spline").attr("keySplines", "0.3 0 0.2 1").attr("keyTimes", "0;1").attr("keyPoints", "0;0.86");
    }
    body.append("circle").attr("class", "icon-bg").attr("r", 10);
    body.append("text").attr("class", "icon").text(TYPES[ev.type].icon);

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
      .on("click", () => focusEvent(ev));
  }

  function layoutEvent(g, ev, restartMotion) {
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
    const s = 1 / Math.sqrt(state.zoomK);
    const nodes = [];
    const obstacles = [];
    gEvents.selectAll("g.ev").each(function (a) {
      const p = a.ev._pos;
      if (!p) return;
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
            .attr("class", (a) => "ev t-" + a.ev.type)
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
  openBtn.textContent = "Συμβαίνει τώρα";
  openBtn.addEventListener("click", () => setPanelCollapsed(false));
  els.mapWrap.appendChild(openBtn);

  function setPanelCollapsed(v) {
    els.panel.classList.toggle("collapsed", v);
    openBtn.classList.toggle("show", v);
  }
  els.panelToggle.addEventListener("click", () => setPanelCollapsed(true));
  if (window.matchMedia("(max-width: 820px)").matches) setPanelCollapsed(true);

  function updatePanel(data) {
    const key = data.map((a) => a.ev.id + (a.labeled ? "*" : "")).join("|");
    if (key === state.panelKey) return;
    state.panelKey = key;
    els.panelCount.textContent = data.length;
    const sorted = data.slice().sort((a, b) => b.ev.s - a.ev.s);
    if (!sorted.length) {
      els.panelList.innerHTML = `<li class="panel-empty">Πάτησε Play για να ξεκινήσει η ιστορία.</li>`;
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
            <div class="ttl">${esc(TYPES[ev.type].icon)} ${esc(ev.title)}</div>
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
    if (ev) focusEvent(ev);
  });

  // ---------- Sidebar: φίλτρα ----------
  const HIDDEN_KEY = "we-hidden-types";
  function loadHiddenTypes() {
    try {
      const arr = JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
      if (Array.isArray(arr)) arr.filter((t) => TYPES[t]).forEach((t) => state.hiddenTypes.add(t));
    } catch (_) { /* ignore */ }
  }
  function saveHiddenTypes() {
    try { localStorage.setItem(HIDDEN_KEY, JSON.stringify([...state.hiddenTypes])); } catch (_) { /* ignore */ }
  }
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
          <button class="cat-fold" type="button" aria-label="Σύμπτυξη/ανάπτυξη" title="Σύμπτυξη/ανάπτυξη">▾</button>
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

  // Άνοιγμα/κλείσιμο sidebar (θυμάται την επιλογή)
  const SIDEBAR_KEY = "we-sidebar";
  function setSidebarCollapsed(v, persist = true) {
    els.sidebar.classList.toggle("collapsed", v);
    els.sidebarOpen.classList.toggle("show", v);
    if (persist) { try { localStorage.setItem(SIDEBAR_KEY, v ? "0" : "1"); } catch (_) { /* ignore */ } }
  }
  function initSidebar() {
    let open = !window.matchMedia("(max-width: 1100px)").matches;
    try { const s = localStorage.getItem(SIDEBAR_KEY); if (s != null) open = s === "1"; } catch (_) { /* ignore */ }
    setSidebarCollapsed(!open, false);
    els.sidebarOpen.addEventListener("click", () => setSidebarCollapsed(false));
    els.sidebarClose.addEventListener("click", () => setSidebarCollapsed(true));
  }

  // ---------- Timeline ----------
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
        lbl.className = "tick-label";
        lbl.textContent = y < 0 ? -y + " π.Χ." : y === 1 ? "0" : y;
        tick.appendChild(lbl);
      }
      frag.appendChild(tick);
    }
    els.ticks.appendChild(frag);
    els.labelStart.textContent = "3000 π.Χ.";
    els.labelEnd.textContent = END_YEAR;

    // Μικρά σημάδια γεγονότων πάνω στη μπάρα
    const marks = document.createDocumentFragment();
    for (const ev of EVENTS) {
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
    els.month.textContent = MONTHS_EL[month];
    els.era.textContent = eraLabel(year);
    ensureBasemap(year);
    const u = monthsToTrack(state.t);
    els.track.value = Math.round(u);
    els.track.style.setProperty("--pct", (u / TRACK_MAX) * 100 + "%");
    renderEvents();
  }

  function setTime(t, { fromUser = false } = {}) {
    state.t = clampT(t);
    updateUI();
    if (fromUser && state.t >= TOTAL_MONTHS - 1 && state.playing) pause();
  }

  function tick(now) {
    if (!state.playing) return;
    const dt = Math.min(0.5, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    let next = state.t + dt * playRate();
    if (next >= TOTAL_MONTHS - 1) { setTime(TOTAL_MONTHS - 1); pause(); return; }
    setTime(next);
    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (state.playing) return;
    if (state.t >= TOTAL_MONTHS - 1) state.t = 0;
    state.playing = true;
    state.lastFrame = performance.now();
    els.play.classList.add("playing");
    els.play.setAttribute("aria-label", "Pause");
    state.rafId = requestAnimationFrame(tick);
  }
  function pause() {
    state.playing = false;
    cancelAnimationFrame(state.rafId);
    els.play.classList.remove("playing");
    els.play.setAttribute("aria-label", "Play");
  }
  function toggle() { state.playing ? pause() : play(); }

  const SPEED_KEY = "we-speed";
  function setSpeed(s) {
    s = Number(s);
    if (!Number.isFinite(s) || s <= 0) return;
    s = Math.min(1000, Math.max(0.1, Math.round(s * 10) / 10));
    state.speed = s;
    let preset = false;
    els.speed.querySelectorAll("button").forEach((b) => {
      const on = Number(b.dataset.speed) === s;
      preset = preset || on;
      b.classList.toggle("active", on);
    });
    if (document.activeElement !== els.speedInput) els.speedInput.value = String(s);
    els.speedInput.classList.toggle("custom", !preset);
    try { localStorage.setItem(SPEED_KEY, String(s)); } catch (_) { /* ignore */ }
    renderEvents();
  }
  function initSpeed() {
    let s = 1;
    try { const v = Number(localStorage.getItem(SPEED_KEY)); if (v > 0) s = v; } catch (_) { /* ignore */ }
    setSpeed(s);
    els.speedInput.value = String(state.speed);
  }

  els.play.addEventListener("click", toggle);
  els.stepBack.addEventListener("click", () => setTime(state.t - stepMonths(), { fromUser: true }));
  els.stepFwd.addEventListener("click", () => setTime(state.t + stepMonths(), { fromUser: true }));

  els.track.min = 0;
  els.track.max = TRACK_MAX;
  els.track.addEventListener("input", () => setTime(trackToMonths(Number(els.track.value)), { fromUser: true }));

  els.speed.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-speed]");
    if (btn) setSpeed(Number(btn.dataset.speed));
  });
  els.speedInput.addEventListener("input", () => {
    const v = Number(els.speedInput.value);
    if (v > 0) setSpeed(v);
  });
  els.speedInput.addEventListener("blur", () => { els.speedInput.value = String(state.speed); });
  els.speedInput.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") els.speedInput.blur();
    ev.stopPropagation(); // μην πιάνουν τα πλήκτρα του timeline (Space, βελάκια)
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.target && /INPUT|TEXTAREA|BUTTON/.test(ev.target.tagName) && ev.code !== "Space") return;
    switch (ev.code) {
      case "Space": ev.preventDefault(); toggle(); break;
      case "ArrowRight": setTime(state.t + stepMonths() * (ev.shiftKey ? 10 : 1), { fromUser: true }); break;
      case "ArrowLeft": setTime(state.t - stepMonths() * (ev.shiftKey ? 10 : 1), { fromUser: true }); break;
      case "Home": setTime(0, { fromUser: true }); break;
      case "End": setTime(TOTAL_MONTHS - 1, { fromUser: true }); break;
    }
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitProjection, 80);
  });

  // ---------- Public API ----------
  window.WorldEventsApp = {
    get date() { return monthsToDate(state.t); },
    setDate(dateStr) { setTime(dateToMonths(dateStr), { fromUser: true }); },
    play, pause, setSpeed, focusEvent, setHistorical, setTypesVisible,
    refreshEvents: renderEvents,
    projection,
    events: EVENTS,
    config: { START_YEAR, END_YEAR, SEGMENTS },
  };

  // ---------- Init ----------
  loadHiddenTypes();
  buildFilters();
  initSidebar();
  initHistoricalToggle();
  buildTicks();
  fitProjection();
  updateUI();
  initSpeed();
  loadWorld();
})();
