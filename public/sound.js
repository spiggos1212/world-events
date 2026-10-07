// Ήχοι της εφαρμογής (Web Audio API, όλα συνθετικά — χωρίς αρχεία ήχου).
// - Απαλό ambient που παίζει συνεχώς (pad + αέρας + αραιές καμπανίτσες), με κουμπί σίγασης.
// - Ένας κοινός ήχος «σημαντικής στιγμής» όταν φτάνεις σε κορυφαίο γεγονός. Μπάρα έντασης (ξεκινά από τη μέση).
// Οι browsers επιτρέπουν ήχο μόνο μετά από ενέργεια του χρήστη: ξεκινά στο πρώτο κλικ / πλήκτρο.
(function () {
  const KEY = "we-muted";
  const S = { ctx: null, master: null, ambGain: null, fxGain: null, amb: null, chimeTimer: 0, muted: false, buffers: {}, btn: null, duckUntil: 0 };
  try { S.muted = localStorage.getItem(KEY) === "1"; } catch (_) { /* ignore */ }

  const AMB_LEVEL = 0.1, FX_LEVEL = 0.4;
  const VOL_KEY = "we-volume";
  S.volume = 0.5; // 0..1, ξεκινά από τη μέση
  try { const v = parseFloat(localStorage.getItem(VOL_KEY)); if (Number.isFinite(v) && v >= 0 && v <= 1) S.volume = v; } catch (_) { /* ignore */ }
  const masterLevel = () => (S.muted ? 0 : S.volume * S.volume); // τετραγωνική καμπύλη: πιο φυσική αίσθηση έντασης
  function ctx() {
    if (S.ctx) return S.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const c = (S.ctx = new AC());
    S.master = c.createGain(); S.master.gain.value = masterLevel(); S.master.connect(c.destination);
    S.ambGain = c.createGain(); S.ambGain.gain.value = AMB_LEVEL; S.ambGain.connect(S.master);
    S.fxGain = c.createGain(); S.fxGain.gain.value = FX_LEVEL; S.fxGain.connect(S.master);
    return c;
  }
  // ---------- βασικά εργαλεία ----------
  function buffer(kind) {
    if (S.buffers[kind]) return S.buffers[kind];
    const c = ctx(), len = c.sampleRate * 3, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    S.buffers[kind] = b;
    return b;
  }
  function noise(kind = "white") { const c = ctx(); const s = c.createBufferSource(); s.buffer = buffer(kind); s.loop = true; return s; }
  function gain(v = 1) { const g = ctx().createGain(); g.gain.value = v; return g; }
  function filter(type, f, q = 1) { const b = ctx().createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function osc(type, f) { const o = ctx().createOscillator(); o.type = type; o.frequency.value = f; return o; }
  // Περιβάλλουσα: attack a, στη συνέχεια εκθετική πτώση d
  function env(g, t, a, d, peak = 1) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  const chain = (...nodes) => { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; };

  // ---------- Ο ένας ήχος «σημαντικής στιγμής» για τα κορυφαία γεγονότα ----------
  // Ανέβασμα (riser) 1,2 δευτ. -> βαθύ χτύπημα + απαλή συγχορδία (Λα) + λαμπερή καμπανίτσα, ουρά ~3 δευτ.
  function important(out, t) {
    // riser: brown noise με bandpass που ανεβαίνει και crescendo
    const n = noise("brown"), bp = filter("bandpass", 120, 1.2), ng = gain(0);
    bp.frequency.setValueAtTime(120, t); bp.frequency.exponentialRampToValueAtTime(900, t + 1.2);
    ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.8, t + 1.15); ng.gain.linearRampToValueAtTime(0.0001, t + 1.3);
    chain(n, bp, ng, out); n.start(t); n.stop(t + 1.35);
    const hit = t + 1.2;
    // βαθύ χτύπημα
    const o = osc("sine", 60), og = gain(0);
    o.frequency.setValueAtTime(60, hit); o.frequency.exponentialRampToValueAtTime(28, hit + 1.2);
    env(og, hit, 0.005, 2.2, 0.9); chain(o, og, out); o.start(hit); o.stop(hit + 2.5);
    // απαλή συγχορδία Λα (A2, E3, A3, C#4) με χαμηλοπερατό, φουσκώνει και σβήνει
    const lp = filter("lowpass", 700, 0.7), cg = gain(0);
    cg.gain.setValueAtTime(0.0001, hit); cg.gain.linearRampToValueAtTime(0.22, hit + 0.5); cg.gain.setValueAtTime(0.22, hit + 1.4); cg.gain.linearRampToValueAtTime(0.0001, hit + 3.0);
    [110, 164.81, 220, 277.18].forEach((f, i) => { [-5, 5].forEach((d) => { const so = osc(i < 2 ? "sawtooth" : "triangle", f); so.detune.value = d; const sg = gain(i < 2 ? 0.5 : 0.35); chain(so, sg, lp); so.start(hit); so.stop(hit + 3.1); }); });
    chain(lp, cg, out);
    // λαμπερή καμπανίτσα (A5) με αρμονικές
    [[880, 0.16, 2.6], [1760, 0.06, 1.8], [2637, 0.025, 1.2]].forEach(([f, v, d]) => { const bo = osc("sine", f), bg = gain(0); env(bg, hit + 0.02, 0.01, d, v); chain(bo, bg, out); bo.start(hit); bo.stop(hit + d + 0.2); });
    return 4.3;
  }

  // ---------- ambient ----------
  function startAmbient() {
    const c = ctx();
    if (!c || S.amb) return;
    const g = gain(0); g.connect(S.ambGain);
    const lp = filter("lowpass", 260, 0.7); lp.connect(g);
    [[55, "sine", 0.5], [82.41, "sine", 0.4], [110, "triangle", 0.16], [164.81, "triangle", 0.1]].forEach(([f, type, v]) => {
      [-4, 4].forEach((det) => { const o = osc(type, f); o.detune.value = det; const og = gain(v); chain(o, og, lp); o.start(); });
    });
    const lfo = osc("sine", 0.06), lg = gain(110); chain(lfo, lg, lp.frequency); lfo.start();
    const n = noise("brown"), nlp = filter("lowpass", 380), ng = gain(0.3); chain(n, nlp, ng, g); n.start();
    const lfo2 = osc("sine", 0.085), lg2 = gain(0.12); chain(lfo2, lg2, ng.gain); lfo2.start();
    const now = c.currentTime; g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(1, now + 5);
    S.amb = { g };
    scheduleChime();
  }
  const CHIME = [440, 493.88, 587.33, 659.25, 783.99, 880, 987.77];
  function chime() {
    const c = ctx(), t = c.currentTime + 0.05, f = CHIME[Math.floor(Math.random() * CHIME.length)];
    [1, 2, 3].forEach((h, i) => { const o = osc("sine", f * h), g = gain(0); env(g, t, 0.04, 3.5 - i, [0.11, 0.035, 0.012][i]); chain(o, g, S.ambGain); o.start(t); o.stop(t + 4); });
    if (Math.random() < 0.5) { const f2 = CHIME[Math.floor(Math.random() * CHIME.length)], t2 = t + 0.9; const o = osc("sine", f2), g = gain(0); env(g, t2, 0.04, 3, 0.08); chain(o, g, S.ambGain); o.start(t2); o.stop(t2 + 3.5); }
  }
  function scheduleChime() {
    clearTimeout(S.chimeTimer);
    S.chimeTimer = setTimeout(() => { if (S.amb && !S.muted && S.ctx.state === "running" && performance.now() > S.duckUntil) chime(); scheduleChime(); }, 7000 + Math.random() * 9000);
  }

  // ---------- δημόσιο API ----------
  function unlock() {
    const c = ctx();
    if (!c) return;
    if (c.state === "suspended" && !S.muted) c.resume().catch(() => {});
    if (!S.muted) startAmbient();
  }
  // ---------- Αφηγητής (speechSynthesis του browser) ----------
  const SP = { active: false, seq: 0, onEnd: null };
  const synth = window.speechSynthesis || null;
  let voicesReady = [];
  function loadVoices() { if (synth) voicesReady = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.addEventListener && synth.addEventListener("voiceschanged", loadVoices); }
  // Καλύτερη διαθέσιμη φωνή για τη γλώσσα: προτιμά αντρική φωνή, μετά "Natural"/"Google"
  const MALE = /stefanos|nikos|nestoras|david|mark|george|guy|ryan|christopher|eric|andrew|brian|daniel|james|thomas|william|alex|fred|rishi|liam|male/i;
  const FEMALE = /zira|hazel|susan|aria|jenny|michelle|sonia|libby|natasha|samantha|victoria|karen|moira|tessa|fiona|athina|melina|female|woman/i;
  function pickVoice(lang) {
    loadVoices();
    const base = lang.toLowerCase().slice(0, 2);
    const cands = voicesReady.filter((v) => (v.lang || "").toLowerCase().startsWith(base));
    if (!cands.length) return null;
    const score = (v) => (MALE.test(v.name) ? 10 : 0) - (FEMALE.test(v.name) ? 6 : 0) + (/natural/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 2 : 0) + (/online/i.test(v.name) ? 1 : 0) + (v.default ? 0.2 : 0);
    return cands.sort((a, b) => score(b) - score(a))[0];
  }
  // Σπάει το κείμενο σε προτάσεις (ως ~220 χαρακτήρες) — μεγάλες εκφωνήσεις κόβονται σε Chrome
  function chunks(text) {
    const out = [];
    const sents = String(text).replace(/\s+/g, " ").match(/[^.!?;…]+[.!?;…]*\s*/g) || [String(text)];
    let cur = "";
    for (const s of sents) { if ((cur + s).length > 220 && cur) { out.push(cur.trim()); cur = ""; } cur += s; }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function say(text, lang, onEnd) {
    stopSpeech();
    if (!synth || !text || S.muted) return false;
    const seq = ++SP.seq;
    SP.active = true; SP.onEnd = onEnd || null;
    const voice = pickVoice(lang);
    const parts = chunks(text);
    const vol = Math.max(0.05, Math.min(1, 0.35 + S.volume * 0.65)); // η αφήγηση μένει ευδιάκριτη και σε χαμηλή ένταση
    duck(true);
    // Chrome: speak() αμέσως μετά από cancel() χάνεται — μικρή καθυστέρηση
    setTimeout(() => {
      if (seq !== SP.seq) return;
      parts.forEach((p, i) => {
        const u = new SpeechSynthesisUtterance(p);
        u.lang = voice ? voice.lang : (lang === "el" ? "el-GR" : "en-US");
        if (voice) u.voice = voice;
        u.rate = 0.95; u.pitch = 0.9; u.volume = vol;
        if (i === parts.length - 1) u.onend = () => { if (seq === SP.seq) finishSpeech(); };
        u.onerror = (e) => { if (seq === SP.seq && e.error !== "interrupted" && e.error !== "canceled") finishSpeech(); };
        synth.speak(u);
      });
    }, 120);
    return true;
  }
  function finishSpeech() { SP.active = false; duck(false); const cb = SP.onEnd; SP.onEnd = null; if (cb) cb(); }
  function stopSpeech() { if (!synth) return; SP.seq++; if (synth.speaking || synth.pending) synth.cancel(); if (SP.active) { SP.active = false; duck(false); SP.onEnd = null; } }
  // Το ambient χαμηλώνει όσο μιλάει ο αφηγητής
  function duck(on) {
    const c = S.ctx; if (!c) return;
    const now = c.currentTime;
    S.ambGain.gain.cancelScheduledValues(now);
    S.ambGain.gain.setTargetAtTime(on ? AMB_LEVEL * 0.25 : AMB_LEVEL, now, on ? 0.3 : 1.0);
  }
  function setMuted(m) {
    S.muted = !!m;
    if (S.muted) stopSpeech();
    try { localStorage.setItem(KEY, S.muted ? "1" : "0"); } catch (_) { /* ignore */ }
    const c = ctx();
    if (c) {
      const now = c.currentTime;
      S.master.gain.cancelScheduledValues(now);
      S.master.gain.setValueAtTime(S.master.gain.value, now);
      S.master.gain.linearRampToValueAtTime(masterLevel(), now + 0.4);
      if (!S.muted) { if (c.state === "suspended") c.resume().catch(() => {}); startAmbient(); }
    }
    updateBtn();
  }
  function setVolume(v) {
    S.volume = Math.max(0, Math.min(1, Number(v) || 0));
    try { localStorage.setItem(VOL_KEY, String(S.volume)); } catch (_) { /* ignore */ }
    const c = S.ctx;
    if (c && !S.muted) { const now = c.currentTime; S.master.gain.cancelScheduledValues(now); S.master.gain.setValueAtTime(S.master.gain.value, now); S.master.gain.linearRampToValueAtTime(masterLevel(), now + 0.15); }
    if (S.slider) { S.slider.value = String(Math.round(S.volume * 100)); S.slider.style.setProperty("--pct", S.volume * 100 + "%"); }
  }
  function updateBtn() {
    if (!S.btn) return;
    S.btn.classList.toggle("off", S.muted);
    S.btn.textContent = S.muted ? "🔇" : "🔊";
    S.btn.setAttribute("aria-pressed", String(!S.muted));
    const lbl = S.btn.dataset[S.muted ? "labelOff" : "labelOn"];
    if (lbl) { S.btn.title = lbl; S.btn.setAttribute("aria-label", lbl); }
  }
  function playEvent(id, type) {
    const c = ctx();
    if (!c || S.muted) return;
    if (c.state === "suspended") c.resume().catch(() => {});
    const t = c.currentTime + 0.05;
    const dur = important(S.fxGain, t);
    // το ambient χαμηλώνει όσο παίζει ο ήχος του γεγονότος
    S.ambGain.gain.cancelScheduledValues(t);
    S.ambGain.gain.setTargetAtTime(AMB_LEVEL * 0.2, t, 0.25);
    S.ambGain.gain.setTargetAtTime(AMB_LEVEL, t + dur, 1.2);
    S.duckUntil = performance.now() + (dur + 1.5) * 1000;
  }
  function init(btn, labels, slider) {
    S.btn = btn || null;
    S.slider = slider || null;
    if (S.slider) {
      setVolume(S.volume);
      S.slider.addEventListener("input", () => { setVolume(Number(S.slider.value) / 100); if (S.muted && S.volume > 0) setMuted(false); });
    }
    if (S.btn) {
      if (labels) { S.btn.dataset.labelOn = labels.on; S.btn.dataset.labelOff = labels.off; }
      S.btn.addEventListener("click", () => setMuted(!S.muted));
      updateBtn();
    }
    ["pointerdown", "keydown", "touchstart"].forEach((e) => document.addEventListener(e, unlock, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (document.hidden) { stopSpeech(); if (SP.onHidden) SP.onHidden(); }
      if (document.hidden) { if (S.ctx && S.ctx.state === "running") S.ctx.suspend().catch(() => {}); } else if (S.ctx && !S.muted) S.ctx.resume().catch(() => {}); });
  }
  window.WorldSound = { init, event: playEvent, setMuted, setVolume, say, stopSpeech, get speaking() { return SP.active; }, get canSpeak() { return !!synth; }, get muted() { return S.muted; }, setLabels(l) { if (S.btn) { S.btn.dataset.labelOn = l.on; S.btn.dataset.labelOff = l.off; updateBtn(); } } };
})();
