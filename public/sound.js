// Ήχοι της εφαρμογής (Web Audio API, όλα συνθετικά — χωρίς αρχεία ήχου).
// - Απαλό ambient που παίζει συνεχώς (pad + αέρας + αραιές καμπανίτσες), με κουμπί σίγασης.
// - Ξεχωριστός ήχος για κάθε κορυφαίο γεγονός (RECIPES ανά id, αλλιώς ανά τύπο γεγονότος).
// Οι browsers επιτρέπουν ήχο μόνο μετά από ενέργεια του χρήστη: ξεκινά στο πρώτο κλικ / πλήκτρο.
(function () {
  const KEY = "we-muted";
  const S = { ctx: null, master: null, ambGain: null, fxGain: null, amb: null, chimeTimer: 0, muted: false, buffers: {}, btn: null, duckUntil: 0 };
  try { S.muted = localStorage.getItem(KEY) === "1"; } catch (_) { /* ignore */ }

  const AMB_LEVEL = 0.16, FX_LEVEL = 0.65;
  function ctx() {
    if (S.ctx) return S.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const c = (S.ctx = new AC());
    S.master = c.createGain(); S.master.gain.value = S.muted ? 0 : 1; S.master.connect(c.destination);
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

  // ---------- στοιχειώδεις ήχοι (c, out, t) ----------
  function explosion(out, t, size = 1) {
    const n = noise("white"), lp = filter("lowpass", 2500, 0.7), g = gain(0);
    lp.frequency.setValueAtTime(2500, t); lp.frequency.exponentialRampToValueAtTime(60, t + 1.3 * size);
    env(g, t, 0.01, 1.9 * size, 1); chain(n, lp, g, out); n.start(t); n.stop(t + 2.2 * size);
    const o = osc("sine", 75), og = gain(0);
    o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(25, t + 0.9);
    env(og, t, 0.005, 1.3 * size, 0.9); chain(o, og, out); o.start(t); o.stop(t + 1.5 * size);
    return 2.2 * size;
  }
  function rumble(out, t, dur = 3) {
    const n = noise("brown"), lp = filter("lowpass", 110, 0.8), g = gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.9, t + 0.4); g.gain.setValueAtTime(0.9, t + dur - 1); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const lfo = osc("sine", 6.5), lg = gain(0.3); chain(lfo, lg, g.gain); lfo.start(t); lfo.stop(t + dur);
    chain(n, lp, g, out); n.start(t); n.stop(t + dur);
    return dur;
  }
  function rocket(out, t, dur = 3.5) {
    const n = noise("white"), bp = filter("bandpass", 150, 0.8), g = gain(0);
    bp.frequency.setValueAtTime(150, t); bp.frequency.exponentialRampToValueAtTime(1800, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.9, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
    chain(n, bp, g, out); n.start(t); n.stop(t + dur + 0.5);
    const b = noise("brown"), lp = filter("lowpass", 90), bg = gain(0);
    bg.gain.setValueAtTime(0.0001, t); bg.gain.linearRampToValueAtTime(0.6, t + 0.6); bg.gain.linearRampToValueAtTime(0.0001, t + dur + 0.5);
    chain(b, lp, bg, out); b.start(t); b.stop(t + dur + 0.5);
    return dur + 0.5;
  }
  function waves(out, t, dur = 4, n = 3) {
    const src = noise("white"), lp = filter("lowpass", 650, 0.5), g = gain(0);
    const gap = dur / n;
    g.gain.setValueAtTime(0.0001, t);
    for (let i = 0; i < n; i++) { const a = t + i * gap; g.gain.linearRampToValueAtTime(0.75, a + gap * 0.4); g.gain.linearRampToValueAtTime(0.08, a + gap); }
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.3);
    chain(src, lp, g, out); src.start(t); src.stop(t + dur + 0.3);
    return dur + 0.3;
  }
  function fire(out, t, dur = 3) {
    const b = noise("brown"), lp = filter("lowpass", 900), g = gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + 0.5); g.gain.setValueAtTime(0.4, t + dur - 0.6); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(b, lp, g, out); b.start(t); b.stop(t + dur);
    for (let i = 0; i < 28; i++) {
      const a = t + Math.random() * (dur - 0.2), w = noise("white"), hp = filter("highpass", 2500), cg = gain(0);
      env(cg, a, 0.003, 0.03 + Math.random() * 0.05, 0.35 + Math.random() * 0.3); chain(w, hp, cg, out); w.start(a); w.stop(a + 0.15);
    }
    return dur;
  }
  function bell(out, t, f = 440, dur = 3, vol = 0.5) {
    const parts = [1, 2.0, 2.76, 4.1, 5.43], vols = [1, 0.55, 0.38, 0.22, 0.12], decs = [1, 0.7, 0.5, 0.35, 0.25];
    parts.forEach((p, i) => { const o = osc("sine", f * p), g = gain(0); env(g, t, 0.004, dur * decs[i], vol * vols[i]); chain(o, g, out); o.start(t); o.stop(t + dur * decs[i] + 0.1); });
    return dur;
  }
  function gong(out, t, f = 90) { bell(out, t, f, 6, 0.6); const w = noise("white"), bp = filter("bandpass", f * 6, 2), g = gain(0); env(g, t, 0.005, 0.5, 0.3); chain(w, bp, g, out); w.start(t); w.stop(t + 0.6); return 6; }
  function toll(out, t, n = 3, gap = 1.3, f = 196) { for (let i = 0; i < n; i++) bell(out, t + i * gap, f, 3.5, 0.5); return n * gap + 2; }
  function drum(out, t, f = 110, dur = 0.5, vol = 1) {
    const o = osc("sine", f), g = gain(0);
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.35, t + 0.2);
    env(g, t, 0.003, dur, vol); chain(o, g, out); o.start(t); o.stop(t + dur + 0.1);
    const w = noise("white"), cg = gain(0); env(cg, t, 0.002, 0.03, vol * 0.4); chain(w, cg, out); w.start(t); w.stop(t + 0.05);
  }
  function snare(out, t, vol = 0.5) { const w = noise("white"), bp = filter("bandpass", 1800, 1), g = gain(0); env(g, t, 0.002, 0.16, vol); chain(w, bp, g, out); w.start(t); w.stop(t + 0.25); }
  function drums(out, t, dur = 3.5) {
    const step = 0.5, n = Math.floor(dur / step);
    for (let i = 0; i < n; i++) { const v = Math.min(1, 0.4 + i * 0.12); drum(out, t + i * step, 100, 0.5, v); snare(out, t + i * step + step / 2, v * 0.45); if (i % 2 === 1) drum(out, t + i * step + 0.25, 80, 0.3, v * 0.5); }
    return dur;
  }
  function gallop(out, t, dur = 3) {
    for (let a = 0; a < dur; a += 0.46) { const v = 0.7 + Math.random() * 0.3; drum(out, t + a, 95, 0.12, v); drum(out, t + a + 0.12, 90, 0.12, v * 0.8); drum(out, t + a + 0.24, 100, 0.14, v); }
    return dur;
  }
  function horn(out, t, f = 130.81, dur = 1.5, vol = 0.35) {
    const lp = filter("lowpass", 900, 0.8), g = gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.15); g.gain.setValueAtTime(vol, t + dur - 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    [0, 6, -6].forEach((d) => { const o = osc("sawtooth", f); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur); });
    chain(lp, g, out);
    return dur;
  }
  function fanfare(out, t) { [261.63, 329.63, 392.0, 523.25].forEach((f, i) => horn(out, t + i * 0.28, f, i === 3 ? 1.8 : 1.0, 0.28)); return 2.8; }
  function siren(out, t, dur = 3, lo = 500, hi = 900) {
    const o = osc("sine", lo), g = gain(0); const half = 1.4;
    o.frequency.setValueAtTime(lo, t);
    for (let a = 0; a < dur; a += half) o.frequency.linearRampToValueAtTime(Math.round(a / half) % 2 ? lo : hi, t + a + half);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.25, t + 0.4); g.gain.setValueAtTime(0.25, t + dur - 0.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(o, g, out); o.start(t); o.stop(t + dur);
    return dur;
  }
  function beeps(out, t, n = 4, f = 1000, on = 0.22, off = 0.33, vol = 0.25, type = "sine") {
    for (let i = 0; i < n; i++) { const a = t + i * (on + off), o = osc(type, f), g = gain(0); g.gain.setValueAtTime(0.0001, a); g.gain.linearRampToValueAtTime(vol, a + 0.01); g.gain.setValueAtTime(vol, a + on - 0.02); g.gain.linearRampToValueAtTime(0.0001, a + on); chain(o, g, out); o.start(a); o.stop(a + on + 0.05); }
    return n * (on + off);
  }
  function geiger(out, t, dur = 3.5) {
    for (let i = 0; i < 70; i++) { const a = t + Math.random() * dur, w = noise("white"), hp = filter("highpass", 3000), g = gain(0); env(g, a, 0.001, 0.012, 0.6); chain(w, hp, g, out); w.start(a); w.stop(a + 0.03); }
    const o = osc("sawtooth", 50), lp = filter("lowpass", 130), g = gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.14, t + 0.5); g.gain.setValueAtTime(0.14, t + dur - 0.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(o, lp, g, out); o.start(t); o.stop(t + dur);
    return dur;
  }
  function crowd(out, t, dur = 3.5) {
    const bus = filter("bandpass", 1100, 0.6), bg = gain(0);
    bg.gain.setValueAtTime(0.0001, t); bg.gain.linearRampToValueAtTime(1, t + 0.6); bg.gain.setValueAtTime(1, t + dur - 0.8); bg.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(bus, bg, out);
    for (let i = 0; i < 140; i++) { const a = t + Math.random() * dur, w = noise("white"), bp = filter("bandpass", 500 + Math.random() * 1200, 4), g = gain(0); env(g, a, 0.02, 0.08 + Math.random() * 0.15, 0.25 + Math.random() * 0.35); chain(w, bp, g, bus); w.start(a); w.stop(a + 0.35); }
    for (let i = 0; i < 4; i++) { const a = t + 0.4 + Math.random() * (dur - 1), o = osc("sine", 1900 + Math.random() * 400), g = gain(0); o.frequency.linearRampToValueAtTime(2500, a + 0.3); env(g, a, 0.02, 0.35, 0.12); chain(o, g, out); o.start(a); o.stop(a + 0.5); }
    return dur;
  }
  function sparkle(out, t) {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093, 2637];
    notes.forEach((f, i) => { const a = t + i * 0.13; [1, 2].forEach((h, j) => { const o = osc("sine", f * h), g = gain(0); env(g, a, 0.005, 1.3, j ? 0.08 : 0.25); chain(o, g, out); o.start(a); o.stop(a + 1.5); }); });
    const o = osc("sine", 110), o2 = osc("sine", 220), lp = filter("lowpass", 400), g = gain(0);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2, t + 0.5); g.gain.linearRampToValueAtTime(0.0001, t + 2.6);
    o.connect(lp); o2.connect(lp); chain(lp, g, out); o.start(t); o2.start(t); o.stop(t + 2.7); o2.stop(t + 2.7);
    return 2.7;
  }
  function pluck(out, t, f, vol = 0.35) { const o = osc("triangle", f), o2 = osc("sine", f * 2), g = gain(0); env(g, t, 0.005, 1.0, vol); o.connect(g); const g2 = gain(0); env(g2, t, 0.005, 0.5, vol * 0.3); o2.connect(g2); g.connect(out); g2.connect(out); o.start(t); o2.start(t); o.stop(t + 1.2); o2.stop(t + 0.7); }
  function lyre(out, t) { const seq = [293.66, 329.63, 349.23, 392.0, 440.0, 523.25, 587.33, 523.25, 440.0, 392.0]; seq.forEach((f, i) => pluck(out, t + i * 0.2, f, i === seq.length - 1 ? 0.3 : 0.28)); return seq.length * 0.2 + 1; }
  function clinks(out, t, dur = 3, metallic = true) {
    for (let a = 0.1; a < dur; a += 0.5) { const w = noise("white"), hp = filter("highpass", 3200), g = gain(0); env(g, t + a, 0.002, 0.05, 0.45); chain(w, hp, g, out); w.start(t + a); w.stop(t + a + 0.1); if (metallic) bell(out, t + a, 1900 + Math.random() * 500, 0.5, 0.18); }
    return dur;
  }
  function coins(out, t, dur = 2.5) { for (let i = 0; i < 18; i++) { const a = t + Math.random() * dur; bell(out, a, 2400 + Math.random() * 1600, 0.6, 0.14); } return dur + 0.6; }
  function printing(out, t, dur = 3.5) {
    for (let a = 0; a < dur; a += 0.62) {
      drum(out, t + a, 180, 0.1, 0.6);
      const w = noise("white"), bp = filter("bandpass", 3000, 1.5), g = gain(0); env(g, t + a + 0.18, 0.02, 0.18, 0.18); chain(w, bp, g, out); w.start(t + a + 0.18); w.stop(t + a + 0.45);
      const c2 = noise("white"), hp = filter("highpass", 4000), cg = gain(0); env(cg, t + a + 0.4, 0.002, 0.03, 0.4); chain(c2, hp, cg, out); c2.start(t + a + 0.4); c2.stop(t + a + 0.5);
    }
    return dur;
  }
  function propeller(out, t, dur = 3.5) {
    const o = osc("sawtooth", 55), lp = filter("lowpass", 800), am = gain(0), g = gain(0);
    o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(72, t + dur);
    const lfo = osc("square", 22), lg = gain(0.5); lfo.frequency.linearRampToValueAtTime(30, t + dur); chain(lfo, lg, am.gain); am.gain.value = 0.5; lfo.start(t); lfo.stop(t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.35, t + 0.6); g.gain.setValueAtTime(0.35, t + dur - 0.6); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(o, lp, am, g, out); o.start(t); o.stop(t + dur);
    return dur;
  }
  function shiphorn(out, t) { const lp = filter("lowpass", 500), g = gain(0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + 0.3); g.gain.setValueAtTime(0.4, t + 1.5); g.gain.linearRampToValueAtTime(0.0001, t + 2.0); [98, 146.8, 196].forEach((f) => { const o = osc("sawtooth", f); o.connect(lp); o.start(t); o.stop(t + 2.1); }); chain(lp, g, out); return 2; }
  function wind(out, t, dur = 4) {
    const n = noise("white"), bp = filter("bandpass", 300, 1.5), g = gain(0);
    bp.frequency.setValueAtTime(300, t); bp.frequency.linearRampToValueAtTime(900, t + dur * 0.55); bp.frequency.linearRampToValueAtTime(350, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.4, t + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    chain(n, bp, g, out); n.start(t); n.stop(t + dur);
    return dur;
  }
  function drone(out, t, f = 55, dur = 3.5, vol = 0.3) { const o = osc("sine", f), o2 = osc("triangle", f * 1.5), lp = filter("lowpass", 300), g = gain(0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.8); g.gain.setValueAtTime(vol, t + dur - 1); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(lp); o2.connect(lp); chain(lp, g, out); o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur); return dur; }

  // ---------- συνταγές ανά κορυφαίο γεγονός (id από featured.js) ----------
  const RECIPES = {
    moon: (o, t) => { rocket(o, t, 3.2); beeps(o, t + 2.4, 3, 800, 0.15, 0.25, 0.18); return 4.2; },
    sputnik: (o, t) => { rocket(o, t, 2.6); beeps(o, t + 1.6, 6, 1000, 0.18, 0.22, 0.2); return 4.2; },
    wright: (o, t) => propeller(o, t, 3.6),
    chernobyl: (o, t) => { geiger(o, t, 3.6); beeps(o, t + 0.3, 3, 620, 0.45, 0.45, 0.12, "square"); return 3.6; },
    hiroshima: (o, t) => { siren(o, t, 1.6, 450, 800); explosion(o, t + 1.5, 1.7); rumble(o, t + 1.7, 2.4); return 4.5; },
    dday: (o, t) => { waves(o, t, 3, 2); drums(o, t + 0.3, 3); explosion(o, t + 1.2, 0.8); explosion(o, t + 2.1, 0.7); return 4; },
    sf1906: (o, t) => { rumble(o, t, 2.8); fire(o, t + 1.6, 2.6); return 4.2; },
    wallfall: (o, t) => { crowd(o, t, 4); clinks(o, t + 0.8, 2.6, false); return 4; },
    ww2: (o, t) => { siren(o, t, 3, 420, 780); drums(o, t + 0.5, 3); explosion(o, t + 1.3, 1); explosion(o, t + 2.4, 0.8); return 4.2; },
    giza: (o, t) => { wind(o, t, 4); gong(o, t + 0.5, 70); return 4.5; },
    parthenon: (o, t) => { lyre(o, t + 0.1); bell(o, t + 2.3, 659.25, 2.5, 0.2); return 3.8; },
    einstein: (o, t) => sparkle(o, t),
    titanic: (o, t) => { shiphorn(o, t); waves(o, t + 1.2, 3, 2); return 4.3; },
    alexander: (o, t) => { drums(o, t, 3.5); fanfare(o, t + 0.9); return 3.8; },
    blackdeath: (o, t) => { toll(o, t, 3, 1.3, 196); wind(o, t + 0.2, 4); return 4.5; },
    magellan: (o, t) => { waves(o, t, 4, 3); bell(o, t + 0.9, 880, 1.2, 0.22); bell(o, t + 1.25, 880, 1.2, 0.22); return 4.3; },
    columbus: (o, t) => { waves(o, t, 4, 3); bell(o, t + 2.2, 880, 1.2, 0.22); bell(o, t + 2.55, 880, 1.2, 0.22); return 4.3; },
    genghis: (o, t) => { gallop(o, t, 3.2); drums(o, t + 1.4, 2); return 3.6; },
    russia1812: (o, t) => { wind(o, t, 4); drums(o, t + 0.8, 2.8); return 4; },
    troy: (o, t) => { horn(o, t, 110, 1.4, 0.35); drums(o, t + 0.8, 2.4); fire(o, t + 2, 2); return 4; },
    stonehenge: (o, t) => { wind(o, t, 4); drone(o, t, 55, 3.5); bell(o, t + 2.2, 330, 2.5, 0.15); return 4.5; },
    greatwall: (o, t) => { gong(o, t, 80); wind(o, t + 0.3, 3.5); return 4; },
    rapanui: (o, t) => { waves(o, t, 4, 3); wind(o, t + 0.5, 3); return 4.3; },
    terracotta: (o, t) => { gong(o, t, 110); drum(o, t + 0.9, 70, 0.8, 0.8); drum(o, t + 1.7, 70, 0.8, 0.8); gong(o, t + 2.4, 130); return 4.5; },
    vesuvius: (o, t) => { rumble(o, t, 1.6); explosion(o, t + 1.2, 1.5); fire(o, t + 2, 2); return 4.3; },
    krakatoa: (o, t) => { explosion(o, t, 2); rumble(o, t + 0.2, 2.5); waves(o, t + 1.8, 3, 2); return 4.8; },
    eiffel: (o, t) => { clinks(o, t, 3.5); fanfare(o, t + 1.4); return 4.2; },
    gutenberg: (o, t) => printing(o, t, 3.5),
  };
  const TYPE_RECIPES = {
    war: (o, t) => { drums(o, t, 3); horn(o, t + 0.6, 110, 1.4, 0.3); return 3.5; },
    revolution: (o, t) => crowd(o, t, 3.5),
    politics: (o, t) => fanfare(o, t),
    exploration: (o, t) => waves(o, t, 4, 3),
    science: (o, t) => sparkle(o, t),
    culture: (o, t) => { bell(o, t, 523.25, 3, 0.4); lyre(o, t + 0.4); return 3.5; },
    disaster: (o, t) => { rumble(o, t, 2); explosion(o, t + 0.8, 1); return 3.2; },
    economy: (o, t) => coins(o, t, 2.5),
    tragedy: (o, t) => toll(o, t, 3, 1.3, 196),
    religion: (o, t) => toll(o, t, 3, 1.1, 261.63),
  };

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
  function setMuted(m) {
    S.muted = !!m;
    try { localStorage.setItem(KEY, S.muted ? "1" : "0"); } catch (_) { /* ignore */ }
    const c = ctx();
    if (c) {
      const now = c.currentTime;
      S.master.gain.cancelScheduledValues(now);
      S.master.gain.setValueAtTime(S.master.gain.value, now);
      S.master.gain.linearRampToValueAtTime(S.muted ? 0 : 1, now + 0.4);
      if (!S.muted) { if (c.state === "suspended") c.resume().catch(() => {}); startAmbient(); }
    }
    updateBtn();
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
    const recipe = RECIPES[id] || TYPE_RECIPES[type] || TYPE_RECIPES.culture;
    const t = c.currentTime + 0.05;
    const dur = recipe(S.fxGain, t) || 3;
    // το ambient χαμηλώνει όσο παίζει ο ήχος του γεγονότος
    S.ambGain.gain.cancelScheduledValues(t);
    S.ambGain.gain.setTargetAtTime(AMB_LEVEL * 0.2, t, 0.25);
    S.ambGain.gain.setTargetAtTime(AMB_LEVEL, t + dur, 1.2);
    S.duckUntil = performance.now() + (dur + 1.5) * 1000;
  }
  function init(btn, labels) {
    S.btn = btn || null;
    if (S.btn) {
      if (labels) { S.btn.dataset.labelOn = labels.on; S.btn.dataset.labelOff = labels.off; }
      S.btn.addEventListener("click", () => setMuted(!S.muted));
      updateBtn();
    }
    ["pointerdown", "keydown", "touchstart"].forEach((e) => document.addEventListener(e, unlock, { passive: true }));
    document.addEventListener("visibilitychange", () => { if (document.hidden) { if (S.ctx && S.ctx.state === "running") S.ctx.suspend().catch(() => {}); } else if (S.ctx && !S.muted) S.ctx.resume().catch(() => {}); });
  }
  window.WorldSound = { init, event: playEvent, setMuted, get muted() { return S.muted; }, setLabels(l) { if (S.btn) { S.btn.dataset.labelOn = l.on; S.btn.dataset.labelOff = l.off; updateBtn(); } } };
})();
