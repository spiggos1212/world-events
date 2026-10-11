// Smoke test του online server (2 παίκτες, 1 ερώτηση, αποκάλυψη). Τοπικά: `npx wrangler dev` και `npm run smoke:online`· live: `node scripts/smoke-online.js https://discoverworldevents.com`
const BASE = process.argv[2] || "http://127.0.0.1:8787";
const WS = BASE.replace(/^http/, "ws");
const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function client(name, code) {
  const ws = new WebSocket(WS + "/api/room/" + code + "/ws");
  const c = { name, ws, msgs: [], id: name + "-" + Math.random().toString(36).slice(2, 8) };
  ws.onmessage = (e) => { const m = JSON.parse(e.data); c.msgs.push(m); log(name, "<-", m.type, m.type === "state" ? m.phase + " r" + m.round + " host=" + (m.hostId === c.id) + " players=" + m.players.map((p) => p.name + (p.answered ? "✓" : "") + ":" + p.score).join(",") : m.type === "reveal" ? JSON.stringify(m.results.map((p) => [p.name, p.ok, p.score])) + " last=" + m.last : m.type === "question" ? "round " + m.round + " kind " + m.spec.kind : m.type === "error" ? m.code : ""); };
  c.send = (m) => ws.send(JSON.stringify(m));
  c.until = async (pred, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const m = c.msgs.find(pred); if (m) return m; await wait(50); } throw new Error(name + ": timeout waiting"); };
  c.open = new Promise((r) => { ws.onopen = r; });
  return c;
}

(async () => {
  const r = await fetch(BASE + "/api/room/new", { method: "POST" });
  const { code } = await r.json();
  log("room", code);
  const bad = client("ghost", "ZZZZ"); await bad.open; bad.send({ type: "hello", id: "g1", name: "Ghost" });
  await bad.until((m) => m.type === "error" && m.code === "not-found"); log("ok: unknown room rejected");

  const a = client("A", code), b = client("B", code);
  await a.open; a.send({ type: "hello", id: a.id, name: "Alice", proto: 2 });
  await a.until((m) => m.type === "state" && m.hostId === a.id); log("ok: A is host");
  await b.open; b.send({ type: "hello", id: b.id, name: "Bob" }); // χωρίς proto = παλιός client
  await b.until((m) => m.type === "state" && m.players.length === 2); log("ok: 2 players");
  await b.until((m) => m.type === "reload"); log("ok: old client is told to reload");

  b.send({ type: "total", total: 50 }); await wait(200);
  if (a.msgs.some((m) => m.type === "state" && m.total === 50)) throw new Error("non-host changed total");
  a.send({ type: "total", total: 20 });
  await b.until((m) => m.type === "state" && m.total === 20); log("ok: only the host picks the question count");
  a.send({ type: "ready", ready: true }); await wait(300);
  if (a.msgs.some((m) => m.type === "state" && m.phase === "starting")) throw new Error("started with one ready player");
  log("ok: one ready player is not enough");
  b.send({ type: "start", total: 50 }); // παλιό μήνυμα «Έναρξη» = έτοιμος (δεν αλλάζει το πλήθος, δεν είναι host)
  await a.until((m) => m.type === "state" && m.phase === "starting" && m.total === 20); log("ok: starts when both pressed Start (legacy start accepted)");
  a.send({ type: "question", spec: { kind: "map", id: 1, km: 2500 } });
  await b.until((m) => m.type === "question" && m.round === 1); log("ok: question delivered to B");
  a.send({ type: "answer", ok: true, pick: "near" });
  await b.until((m) => m.type === "state" && m.players.find((p) => p.name === "Alice").answered && m.players.find((p) => p.name === "Alice").ok == null); log("ok: B sees Alice answered but not whether correct");
  b.send({ type: "answer", ok: false, pick: "far" });
  const rev = await a.until((m) => m.type === "reveal");
  if (rev.results.find((p) => p.name === "Alice").score !== 1 || rev.results.find((p) => p.name === "Bob").score !== 0) throw new Error("scores wrong");
  log("ok: reveal with scores");
  a.send({ type: "next" });
  await a.until((m) => m.type === "state" && m.phase === "starting" && m.round === 1); log("ok: next -> starting");
  a.send({ type: "question", spec: { kind: "tl", id: 2, year: 1500, tol: 50 } });
  await b.until((m) => m.type === "question" && m.round === 2); log("ok: round 2");
  // B φεύγει χωρίς να απαντήσει -> όταν απαντήσει ο A, αποκάλυψη αμέσως
  b.ws.close();
  await wait(300);
  a.send({ type: "answer", ok: true, pick: "1500" });
  await a.until((m) => m.type === "reveal" && m.round === 2); log("ok: reveal when the only online player answered");
  // Late joiner mid-game -> started
  const c = client("C", code); await c.open; c.send({ type: "hello", id: c.id, name: "Carol" });
  await c.until((m) => m.type === "error" && m.code === "started"); log("ok: mid-game join rejected");
  a.send({ type: "leave" });
  await wait(300);
  const info = await (await fetch(BASE + "/api/room/" + code + "/info")).json();
  log("info", JSON.stringify(info));
  log("ALL OK");
  process.exit(0);
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
