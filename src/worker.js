// World Events — Worker: σερβίρει τα στατικά αρχεία (public/) και τρέχει το online multiplayer.
//
// Κάθε δωμάτιο (4-γράμματος κωδικός) είναι ένα Durable Object «Room» με WebSockets:
// κρατά τους παίκτες, το σκορ, τη φάση (lobby / ask / reveal / end) και την τρέχουσα ερώτηση.
// Ο οικοδεσπότης (ο πρώτος που μπήκε) φτιάχνει τις ερωτήσεις στον browser του και τις στέλνει
// εδώ· ο server τις μοιράζει σε όλους, μαζεύει τις απαντήσεις και κάνει την αποκάλυψη όταν
// απαντήσουν όλοι ή τελειώσει ο χρόνος. Κατηγορίες: «mix» (ο browser κρίνει σωστό/λάθος),
// «point» / «date» (ο server μετρά την απόσταση κάθε απάντησης από το σωστό σημείο / τη σωστή
// χρονιά και στην αποκάλυψη δίνει τον πόντο στον πιο κοντινό). Το «Registry» (ένα μόνο object) μοιράζει τους κωδικούς
// και κρατά το όριο των ταυτόχρονων δωματίων. Το παιχνίδι ξεκινά όταν είναι τουλάχιστον 2 παίκτες
// στο δωμάτιο και όλοι έχουν πατήσει «Έναρξη».

const MAX_ROOMS = 10;             // πόσα παιχνίδια μπορούν να παίζονται ταυτόχρονα
const MAX_PLAYERS = 12;           // παίκτες ανά δωμάτιο
const QUESTION_MS = 45_000;       // χρόνος ανά ερώτηση
const GRACE_MS = 2_500;           // ανοχή για απαντήσεις που φτάνουν λίγο μετά το όριο
const ROOM_IDLE_MS = 30 * 60_000; // άδειο δωμάτιο: σβήνεται μετά από μισή ώρα
const EMPTY_FREE_MS = 2 * 60_000;  // δωμάτιο χωρίς κανέναν online για 2 λεπτά δεν πιάνει θέση στο όριο των 10
const TOTALS = [10, 20, 30, 50];
const CATS = ["mix", "point", "date"]; // κατηγορία: mix = σωστό/λάθος, point/date = τον πόντο παίρνει ο πιο κοντινός (χλμ. / χρόνια)
const PROTO = 3; // έκδοση πρωτοκόλλου client/server: παλιότερος client -> του ζητάμε να ξαναφορτώσει τη σελίδα
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // χωρίς I/O/0/1 που μπερδεύονται

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
// Γεωμετρία απάντησης στον χάρτη: σημείο [lng, lat], ακτίνα κύκλου σε χλμ., γράμμα επιλογής A-D
const num = (v, lo, hi) => (typeof v === "number" && isFinite(v) && v >= lo && v <= hi ? v : null);
const cleanGeo = (g) => (Array.isArray(g) && num(g[0], -180, 180) != null && num(g[1], -90, 90) != null ? [Math.round(g[0] * 1e4) / 1e4, Math.round(g[1] * 1e4) / 1e4] : null);
const cleanMark = (m) => { const geo = cleanGeo(m.geo); const km = num(m.km, 0, 40000); const letter = /^[A-Z]$/.test(m.letter) ? m.letter : ""; const year = num(m.year, -10000, 3000); return geo || letter || year != null ? { geo, km: geo && km != null ? Math.round(km) : null, letter, year: year != null ? Math.round(year) : null } : null; };
// Απόσταση μεγάλου κύκλου σε χλμ. ανάμεσα σε δύο [lng, lat]
const RAD = Math.PI / 180;
const distKm = (a, b) => { const dLat = (b[1] - a[1]) * RAD, dLng = (b[0] - a[0]) * RAD; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLng / 2) ** 2; return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h))); };
const clean = (s, n = 24) => String(s == null ? "" : s).replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, n);
const registry = (env) => env.REGISTRY.get(env.REGISTRY.idFromName("main"));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/room/")) return handleRoomApi(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

async function handleRoomApi(request, env, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "room", <code|new>, ("ws")]
  if (parts[2] === "stats") { const r = await registry(env).fetch("https://registry/stats"); return new Response(r.body, r); }
  if (parts[2] === "new") {
    if (request.method !== "POST") return json({ error: "method" }, 405);
    const r = await registry(env).fetch("https://registry/new", { method: "POST" });
    const data = await r.json();
    if (!r.ok) return json(data, r.status);
    const room = env.ROOMS.get(env.ROOMS.idFromName(data.code));
    await room.fetch("https://room/create", { method: "POST", body: JSON.stringify({ code: data.code }) });
    return json({ code: data.code });
  }
  const code = (parts[2] || "").toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(code)) return json({ error: "bad-code" }, 400);
  if (parts[3] === "ws") {
    if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") return new Response("Expected WebSocket", { status: 426 });
    return env.ROOMS.get(env.ROOMS.idFromName(code)).fetch(request);
  }
  if (parts[3] === "info") {
    const r = await env.ROOMS.get(env.ROOMS.idFromName(code)).fetch("https://room/info");
    return new Response(r.body, r);
  }
  return json({ error: "not-found" }, 404);
}

// ---------- Registry: κωδικοί δωματίων + όριο ταυτόχρονων παιχνιδιών ----------
export class Registry {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.rooms = {}; // code -> τελευταία δραστηριότητα (ms)
    ctx.blockConcurrencyWhile(async () => { this.rooms = (await ctx.storage.get("rooms")) || {}; });
  }
  // Ενεργό = έχει παίκτες online, ή άδειασε πριν από λιγότερο από 2 λεπτά (π.χ. refresh). Τα υπόλοιπα ελευθερώνουν θέση.
  async prune() {
    const now = Date.now();
    for (const [code, seen] of Object.entries(this.rooms)) {
      if (now - seen >= ROOM_IDLE_MS) { delete this.rooms[code]; continue; }
      if (now - seen < EMPTY_FREE_MS) continue; // φρέσκο: δεν χρειάζεται έλεγχος
      try {
        const r = await this.env.ROOMS.get(this.env.ROOMS.idFromName(code)).fetch("https://room/info");
        if (r.status === 404) { delete this.rooms[code]; continue; }
        const info = await r.json();
        if (!info.online && now - (info.touched || seen) >= EMPTY_FREE_MS) delete this.rooms[code];
      } catch (_) { /* αν δεν απαντήσει, το κρατάμε */ }
    }
  }
  async fetch(request) {
    const url = new URL(request.url);
    await this.prune();
    if (url.pathname === "/new") {
      if (Object.keys(this.rooms).length >= MAX_ROOMS) return json({ error: "full", max: MAX_ROOMS }, 503);
      let code = "";
      for (let i = 0; i < 50 && (!code || this.rooms[code]); i++) {
        code = "";
        for (let k = 0; k < 4; k++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
      if (!code || this.rooms[code]) return json({ error: "busy" }, 503);
      this.rooms[code] = Date.now();
      await this.ctx.storage.put("rooms", this.rooms);
      return json({ code });
    }
    if (url.pathname === "/touch" || url.pathname === "/remove") {
      const { code } = await request.json();
      if (url.pathname === "/touch") { if (this.rooms[code] != null) this.rooms[code] = Date.now(); }
      else delete this.rooms[code];
      await this.ctx.storage.put("rooms", this.rooms);
      return json({ ok: true, active: Object.keys(this.rooms).length });
    }
    if (url.pathname === "/stats") { await this.ctx.storage.put("rooms", this.rooms); return json({ active: Object.keys(this.rooms).length, max: MAX_ROOMS, rooms: Object.keys(this.rooms) }); }
    return json({ error: "not-found" }, 404);
  }
}

// ---------- Room: ένα παιχνίδι ----------
export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.room = null;
    ctx.blockConcurrencyWhile(async () => { this.room = (await ctx.storage.get("room")) || null; });
  }
  save() { return this.ctx.storage.put("room", this.room); }
  touchRegistry(remove) {
    if (!this.room) return;
    const body = JSON.stringify({ code: this.room.code });
    this.ctx.waitUntil(registry(this.env).fetch("https://registry/" + (remove ? "remove" : "touch"), { method: "POST", body }).catch(() => {}));
  }
  sockets() { return this.ctx.getWebSockets(); }
  idOf(ws) { const a = ws.deserializeAttachment(); return a && a.id; }
  onlineIds() { const s = new Set(); for (const ws of this.sockets()) { const id = this.idOf(ws); if (id) s.add(id); } return s; }
  send(ws, msg) { try { ws.send(JSON.stringify(msg)); } catch (_) { /* κλειστό socket */ } }
  broadcast(msg) { const raw = JSON.stringify(msg); for (const ws of this.sockets()) { try { ws.send(raw); } catch (_) { /* ignore */ } } }
  publicPlayers() {
    const online = this.onlineIds(), ask = this.room.phase === "ask";
    return Object.values(this.room.players)
      .sort((a, b) => a.joined - b.joined)
      // όσο τρέχει η ερώτηση φαίνεται μόνο ΠΟΙΟΣ απάντησε, όχι αν ήταν σωστός (θα έδινε στοιχεία στους άλλους)
      .map((p) => ({ id: p.id, name: p.name, score: p.score, answered: p.answered, ok: ask ? null : p.ok, pick: ask ? "" : p.pick, mark: ask ? null : p.mark || null, dist: ask ? null : (p.dist != null ? p.dist : null), ready: !!p.ready, online: online.has(p.id) }));
  }
  stateMsg() {
    const r = this.room;
    return { type: "state", code: r.code, hostId: r.hostId, phase: r.phase, round: r.round, total: r.total, cat: r.cat || "mix", players: this.publicPlayers(), max: MAX_PLAYERS };
  }
  broadcastState() { this.broadcast(this.stateMsg()); }
  ensureHost() {
    const r = this.room, online = this.onlineIds();
    if (r.hostId && r.players[r.hostId] && online.has(r.hostId)) return;
    const next = Object.values(r.players).filter((p) => online.has(p.id)).sort((a, b) => a.joined - b.joined)[0];
    if (next) r.hostId = next.id;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/create") {
      const { code } = await request.json();
      this.room = { code, hostId: "", phase: "lobby", round: 0, total: 10, cat: "mix", players: {}, q: null, deadline: 0, created: Date.now(), touched: Date.now() };
      await this.save();
      return json({ ok: true });
    }
    if (url.pathname === "/info") {
      if (!this.room) return json({ error: "not-found" }, 404);
      return json({ code: this.room.code, phase: this.room.phase, players: Object.keys(this.room.players).length, online: this.onlineIds().size, touched: this.room.touched });
    }
    if (url.pathname.endsWith("/ws")) {
      // Δεχόμαστε πάντα το socket: αν δεν υπάρχει δωμάτιο, στέλνουμε error και κλείνουμε
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);
      this.ctx.acceptWebSocket(server);
      if (!this.room) { this.send(server, { type: "error", code: "not-found" }); try { server.close(1000, "no room"); } catch (_) { /* ignore */ } }
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ error: "not-found" }, 404);
  }

  async webSocketMessage(ws, raw) {
    let m;
    try { m = JSON.parse(raw); } catch (_) { return; }
    const r = this.room;
    if (!r) { this.send(ws, { type: "error", code: "not-found" }); try { ws.close(1000); } catch (_) { /* ignore */ } return; }

    if (m.type === "hello") {
      const id = clean(m.id, 40);
      if (!id) return;
      if (Number(m.proto || 0) < PROTO) { this.send(ws, { type: "reload" }); } // παλιά σελίδα (ανοιχτή από πριν το deploy)
      const name = clean(m.name);
      const existing = r.players[id];
      if (!existing) {
        if (r.phase !== "lobby") { this.send(ws, { type: "error", code: "started" }); try { ws.close(1000); } catch (_) { /* ignore */ } return; }
        if (Object.keys(r.players).length >= MAX_PLAYERS) { this.send(ws, { type: "error", code: "full" }); try { ws.close(1000); } catch (_) { /* ignore */ } return; }
        r.players[id] = { id, name: name || "Player", score: 0, answered: false, ok: null, pick: "", ready: false, joined: Date.now() };
      } else if (name) existing.name = name;
      // Παλιό socket του ίδιου παίκτη (π.χ. refresh): κλείνει
      for (const o of this.sockets()) { if (o !== ws && this.idOf(o) === id) { try { o.close(1000, "replaced"); } catch (_) { /* ignore */ } } }
      ws.serializeAttachment({ id });
      this.ensureHost();
      r.touched = Date.now();
      await this.save();
      this.touchRegistry(false);
      this.send(ws, { type: "welcome", id, now: Date.now() });
      if (r.phase === "ask" && r.q) this.send(ws, { type: "question", spec: r.q, round: r.round, total: r.total, deadline: r.deadline, now: Date.now(), rejoin: true });
      this.broadcastState();
      return;
    }

    const id = this.idOf(ws);
    const p = id && r.players[id];
    if (!p) return;
    const isHost = id === r.hostId;
    let changed = true;
    switch (m.type) {
      case "name": { const n = clean(m.name); if (n) p.name = n; break; }
      case "total": { // ο οικοδεσπότης διαλέγει πόσες ερωτήσεις
        if (!isHost || !(r.phase === "lobby" || r.phase === "end")) return;
        if (TOTALS.includes(Number(m.total))) r.total = Number(m.total);
        break;
      }
      case "cat": { // ο οικοδεσπότης διαλέγει κατηγορία
        if (!isHost || !(r.phase === "lobby" || r.phase === "end")) return;
        if (CATS.includes(m.cat)) r.cat = m.cat;
        break;
      }
      case "start": // παλιός client: «Έναρξη» = έτοιμος (+ επιλογή πλήθους ερωτήσεων αν είναι ο οικοδεσπότης)
      case "ready": { // «Έναρξη»: το παιχνίδι ξεκινά μόνο με >= 2 παίκτες online που ΟΛΟΙ το πάτησαν
        if (!(r.phase === "lobby" || r.phase === "end")) return;
        if (m.type === "start") { p.ready = true; if (isHost && TOTALS.includes(Number(m.total))) r.total = Number(m.total); }
        else p.ready = !!m.ready;
        const online = this.onlineIds();
        const here = Object.values(r.players).filter((pl) => online.has(pl.id));
        if (here.length >= 2 && here.every((pl) => pl.ready)) {
          r.round = 0; r.q = null;
          for (const pl of Object.values(r.players)) { pl.score = 0; pl.answered = false; pl.ok = null; pl.pick = ""; pl.mark = null; pl.dist = null; pl.ready = false; }
          r.phase = "starting"; // ο οικοδεσπότης φτιάχνει την 1η ερώτηση
        }
        break;
      }
      case "question": {
        if (!isHost || r.phase !== "starting" || !m.spec || typeof m.spec !== "object") return;
        r.q = m.spec; r.round++; r.phase = "ask"; r.deadline = Date.now() + QUESTION_MS;
        for (const pl of Object.values(r.players)) { pl.answered = false; pl.ok = null; pl.pick = ""; pl.mark = null; pl.dist = null; }
        await this.ctx.storage.setAlarm(r.deadline + GRACE_MS);
        this.touchRegistry(false);
        this.broadcast({ type: "question", spec: r.q, round: r.round, total: r.total, deadline: r.deadline, now: Date.now() });
        break;
      }
      case "answer": {
        if (r.phase !== "ask" || p.answered || Date.now() > r.deadline + GRACE_MS) return;
        p.answered = true; p.pick = clean(m.pick, 160); p.mark = cleanMark(m);
        if ((r.cat || "mix") === "mix") { p.ok = !!m.ok; if (p.ok) p.score++; }
        else { // point/date: κρατάμε την απόσταση από τη σωστή απάντηση· ποιος κέρδισε κρίνεται στην αποκάλυψη
          p.ok = false; p.dist = null;
          const q = r.q || {}, mk = p.mark || {};
          if (r.cat === "point") { const truth = cleanGeo(q.truth); if (truth && mk.geo) p.dist = Math.round(distKm(mk.geo, truth)); }
          else { const truth = num(q.year, -10000, 3000); if (truth != null && mk.year != null) p.dist = Math.abs(mk.year - truth); }
        }
        const online = this.onlineIds();
        const pending = Object.values(r.players).filter((pl) => online.has(pl.id) && !pl.answered);
        if (!pending.length) { await this.reveal(); return; }
        break;
      }
      case "next": {
        if (!isHost || r.phase !== "reveal" || r.round >= r.total) return;
        r.phase = "starting";
        break;
      }
      case "finish": {
        if (!isHost || r.phase !== "reveal") return;
        r.phase = "end";
        this.broadcast({ type: "final", players: this.publicPlayers() });
        break;
      }
      case "restart": {
        if (!isHost || r.phase !== "end") return;
        r.phase = "lobby"; r.round = 0; r.q = null;
        for (const pl of Object.values(r.players)) { pl.score = 0; pl.answered = false; pl.ok = null; pl.pick = ""; pl.mark = null; pl.dist = null; pl.ready = false; }
        break;
      }
      case "leave": {
        delete r.players[id];
        try { ws.close(1000, "left"); } catch (_) { /* ignore */ }
        this.ensureHost();
        break;
      }
      default: changed = false;
    }
    if (!changed) return;
    r.touched = Date.now();
    await this.save();
    this.broadcastState();
  }

  async reveal() {
    const r = this.room;
    if (!r || r.phase !== "ask") return;
    r.phase = "reveal";
    for (const pl of Object.values(r.players)) if (!pl.answered) { pl.answered = true; pl.ok = false; pl.pick = ""; pl.mark = null; pl.dist = null; }
    if ((r.cat || "mix") !== "mix") { // τον πόντο παίρνει όποιος (ή όποιοι, σε ισοπαλία) ήταν πιο κοντά
      const all = Object.values(r.players);
      let best = Infinity;
      for (const pl of all) if (pl.dist != null && pl.dist < best) best = pl.dist;
      for (const pl of all) { pl.ok = pl.dist != null && pl.dist === best; if (pl.ok) pl.score++; }
    }
    await this.ctx.storage.deleteAlarm();
    r.touched = Date.now();
    await this.save();
    this.broadcast({ type: "reveal", results: this.publicPlayers(), last: r.round >= r.total, round: r.round, total: r.total });
    this.broadcastState();
  }

  async webSocketClose(ws) { await this.dropped(ws); }
  async webSocketError(ws) { await this.dropped(ws); }
  async dropped(ws) {
    try { ws.close(1000); } catch (_) { /* ignore */ }
    const r = this.room;
    if (!r) return;
    this.ensureHost();
    // Αν έφυγε ο τελευταίος που δεν είχε απαντήσει, η αποκάλυψη γίνεται τώρα
    if (r.phase === "ask") {
      const online = this.onlineIds();
      const pending = Object.values(r.players).filter((pl) => online.has(pl.id) && !pl.answered);
      if (online.size && !pending.length) { await this.reveal(); return; }
    }
    r.touched = Date.now();
    if (!this.onlineIds().size) await this.ctx.storage.setAlarm(Date.now() + ROOM_IDLE_MS); // καθάρισμα αν δεν ξαναμπεί κανείς
    await this.save();
    this.broadcastState();
  }

  async alarm() {
    const r = this.room;
    if (!r) return;
    if (r.phase === "ask" && Date.now() >= r.deadline) { await this.reveal(); return; }
    if (!this.onlineIds().size && Date.now() - r.touched >= ROOM_IDLE_MS - 1000) {
      this.touchRegistry(true);
      this.room = null;
      await this.ctx.storage.deleteAll();
    }
  }
}
