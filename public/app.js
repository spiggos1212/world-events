/* World Events — map + timeline
 * Ο χρόνος μετριέται σε μήνες από το START_YEAR, ώστε η κίνηση να είναι ομαλή.
 */
(function () {
  "use strict";

  // ---------- Config ----------
  const START_YEAR = 1900;
  const END_YEAR = 2026;
  const TOTAL_MONTHS = (END_YEAR - START_YEAR + 1) * 12; // inclusive of END_YEAR
  const BASE_MONTHS_PER_SECOND = 6; // 1× = 1 έτος ανά 2 δευτερόλεπτα
  const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
  const MONTHS_EL = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];

  // ---------- State ----------
  const state = {
    t: 0,            // τρέχουσα θέση σε μήνες (float)
    playing: false,
    speed: 1,
    loop: false,
    lastFrame: 0,
    rafId: 0,
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
    track: $("#track"),
    ticks: $("#ticks"),
    labelStart: $("#label-start"),
    labelEnd: $("#label-end"),
    speed: $("#speed"),
    loop: $("#loop"),
    zoomIn: $("#zoom-in"),
    zoomOut: $("#zoom-out"),
    zoomReset: $("#zoom-reset"),
  };

  // ---------- Time helpers ----------
  function monthsToDate(m) {
    const whole = Math.floor(m);
    const year = START_YEAR + Math.floor(whole / 12);
    const month = whole % 12; // 0-11
    return { year, month };
  }

  function dateToMonths(dateStr) {
    // Δέχεται "1914", "1914-07" ή "1914-07-28"
    const parts = String(dateStr).split("-").map(Number);
    const y = parts[0];
    const mo = (parts[1] || 1) - 1;
    const d = parts[2] || 1;
    return (y - START_YEAR) * 12 + mo + (d - 1) / 31;
  }

  function clampT(t) {
    return Math.max(0, Math.min(TOTAL_MONTHS - 1, t));
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
  const gEvents = gRoot.append("g").attr("class", "events-layer");

  let countriesFeatures = [];
  let countryNames = new Map();

  const zoom = d3
    .zoom()
    .scaleExtent([1, 12])
    .on("zoom", (ev) => {
      gRoot.attr("transform", ev.transform);
    });

  els.svg.call(zoom);

  function fitProjection() {
    const w = width();
    const h = height();
    els.svg.attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    projection.fitExtent(
      [
        [12, 12],
        [w - 12, h - 12],
      ],
      { type: "Sphere" }
    );
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
      .attr("d", path);
    renderEvents();
  }

  function showTooltip(text, x, y) {
    els.tooltip.textContent = text;
    els.tooltip.style.left = x + "px";
    els.tooltip.style.top = y + "px";
    els.tooltip.classList.add("show");
  }
  function hideTooltip() {
    els.tooltip.classList.remove("show");
  }

  gCountries
    .on("mousemove", (ev) => {
      const target = ev.target;
      if (!target.classList || !target.classList.contains("country")) return hideTooltip();
      const d = d3.select(target).datum();
      const name = countryNames.get(d.id) || "";
      if (!name) return hideTooltip();
      const [x, y] = d3.pointer(ev, els.mapWrap);
      showTooltip(name, x, y);
    })
    .on("mouseleave", hideTooltip);

  async function loadWorld() {
    try {
      const topo = await d3.json(WORLD_URL);
      const geo = topojson.feature(topo, topo.objects.countries);
      countriesFeatures = geo.features;
      countryNames = new Map(countriesFeatures.map((f) => [f.id, f.properties && f.properties.name]));
      els.loading.classList.add("hidden");
      fitProjection();
    } catch (err) {
      console.error("Map load failed", err);
      els.loading.textContent = "Αποτυχία φόρτωσης χάρτη. Έλεγξε τη σύνδεση και κάνε ανανέωση.";
    }
  }

  // Zoom buttons
  els.zoomIn.addEventListener("click", () => els.svg.transition().duration(250).call(zoom.scaleBy, 1.6));
  els.zoomOut.addEventListener("click", () => els.svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6));
  els.zoomReset.addEventListener("click", () =>
    els.svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity)
  );

  // ---------- Events layer (έτοιμο για τα δεδομένα του επόμενου βήματος) ----------
  function activeEvents(t) {
    const list = Array.isArray(window.WORLD_EVENTS) ? window.WORLD_EVENTS : [];
    return list.filter((e) => {
      if (e.lat == null || e.lng == null || !e.start) return false;
      const s = dateToMonths(e.start);
      const en = e.end ? dateToMonths(e.end) : s + 12; // στιγμιαίο event: ορατό για 1 έτος
      return t >= s && t <= en;
    });
  }

  function renderEvents() {
    const data = activeEvents(state.t);
    gEvents
      .selectAll("circle.event")
      .data(data, (d) => d.id || d.title)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "event")
            .attr("r", 0)
            .call((sel) => sel.transition().duration(300).attr("r", 5)),
        (update) => update,
        (exit) => exit.transition().duration(200).attr("r", 0).remove()
      )
      .attr("cx", (d) => projection([d.lng, d.lat])[0])
      .attr("cy", (d) => projection([d.lng, d.lat])[1])
      .on("mousemove", (ev, d) => {
        const [x, y] = d3.pointer(ev, els.mapWrap);
        showTooltip(d.title || d.id, x, y);
      })
      .on("mouseleave", hideTooltip);
  }

  // ---------- Timeline ----------
  function buildTicks() {
    els.ticks.innerHTML = "";
    const frag = document.createDocumentFragment();
    const span = END_YEAR - START_YEAR;
    const majorEvery = span > 150 ? 50 : span > 60 ? 10 : 5;
    const minorEvery = majorEvery / 2;
    for (let y = START_YEAR; y <= END_YEAR; y += minorEvery) {
      const pct = ((y - START_YEAR) * 12) / (TOTAL_MONTHS - 1) * 100;
      const isMajor = (y - START_YEAR) % majorEvery === 0;
      const tick = document.createElement("div");
      tick.className = "tick" + (isMajor ? " major" : "");
      tick.style.left = pct + "%";
      if (isMajor) {
        const lbl = document.createElement("span");
        lbl.className = "tick-label";
        lbl.textContent = y;
        tick.appendChild(lbl);
      }
      frag.appendChild(tick);
    }
    els.ticks.appendChild(frag);
    els.labelStart.textContent = START_YEAR;
    els.labelEnd.textContent = END_YEAR;
  }

  function updateUI() {
    const { year, month } = monthsToDate(state.t);
    els.year.textContent = year;
    els.month.textContent = MONTHS_EL[month];
    const pct = (state.t / (TOTAL_MONTHS - 1)) * 100;
    els.track.value = Math.round(state.t);
    els.track.style.setProperty("--pct", pct + "%");
    renderEvents();
  }

  function setTime(t, { fromUser = false } = {}) {
    state.t = clampT(t);
    updateUI();
    if (fromUser && state.t >= TOTAL_MONTHS - 1 && state.playing && !state.loop) pause();
  }

  function tick(now) {
    if (!state.playing) return;
    const dt = Math.min(0.5, (now - state.lastFrame) / 1000); // s, με όριο για tab switch / throttling
    state.lastFrame = now;
    let next = state.t + dt * BASE_MONTHS_PER_SECOND * state.speed;
    if (next >= TOTAL_MONTHS - 1) {
      if (state.loop) {
        next = 0;
      } else {
        setTime(TOTAL_MONTHS - 1);
        pause();
        return;
      }
    }
    setTime(next);
    state.rafId = requestAnimationFrame(tick);
  }

  function play() {
    if (state.playing) return;
    if (state.t >= TOTAL_MONTHS - 1) state.t = 0; // ξανά από την αρχή
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

  function toggle() {
    state.playing ? pause() : play();
  }

  function setSpeed(s) {
    state.speed = s;
    els.speed.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", Number(b.dataset.speed) === s);
    });
  }

  // Controls
  els.play.addEventListener("click", toggle);
  els.stepBack.addEventListener("click", () => setTime(Math.floor(state.t / 12) * 12 - 12, { fromUser: true }));
  els.stepFwd.addEventListener("click", () => setTime(Math.floor(state.t / 12) * 12 + 12, { fromUser: true }));

  els.track.min = 0;
  els.track.max = TOTAL_MONTHS - 1;
  els.track.addEventListener("input", () => setTime(Number(els.track.value), { fromUser: true }));

  els.speed.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-speed]");
    if (btn) setSpeed(Number(btn.dataset.speed));
  });

  els.loop.addEventListener("click", () => {
    state.loop = !state.loop;
    els.loop.setAttribute("aria-pressed", String(state.loop));
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.target && /INPUT|TEXTAREA|BUTTON/.test(ev.target.tagName) && ev.code !== "Space") return;
    switch (ev.code) {
      case "Space":
        ev.preventDefault();
        toggle();
        break;
      case "ArrowRight":
        setTime(state.t + (ev.shiftKey ? 120 : 12), { fromUser: true });
        break;
      case "ArrowLeft":
        setTime(state.t - (ev.shiftKey ? 120 : 12), { fromUser: true });
        break;
      case "Home":
        setTime(0, { fromUser: true });
        break;
      case "End":
        setTime(TOTAL_MONTHS - 1, { fromUser: true });
        break;
    }
  });

  // Resize
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitProjection, 80);
  });

  // ---------- Public API (για το επόμενο βήμα με τα events) ----------
  window.WorldEventsApp = {
    get date() {
      return monthsToDate(state.t);
    },
    setDate(dateStr) {
      setTime(dateToMonths(dateStr), { fromUser: true });
    },
    play,
    pause,
    setSpeed,
    refreshEvents: renderEvents,
    projection,
    config: { START_YEAR, END_YEAR },
  };

  // ---------- Init ----------
  buildTicks();
  fitProjection();
  updateUI();
  setSpeed(1);
  loadWorld();
})();
