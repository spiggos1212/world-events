// Ζωγραφισμένες σκηνές (SVG) που εμφανίζονται μεγάλες πάνω στον χάρτη για κορυφαία γεγονότα.
// Κάθε σκηνή: function(g, lang) — g είναι d3 selection ενός <g> με αρχή (0,0) στο «έδαφος» του σημείου του γεγονότος.
// Οι συντεταγμένες είναι pixels οθόνης (η κλίμακα ρυθμίζεται από την εφαρμογή). Προς τα πάνω = αρνητικό y.
(function () {
  const L = {
    el: { human: "άνθρωπος 1,75 μ.", pyramid: "146 μ.", parthenon: "13,7 μ.", titanic: "269 μ. ≈ 3 γήπεδα ποδοσφαίρου", doctor: "Γιατρός της πανώλης", formula: "E = mc²" },
    en: { human: "human 1.75 m", pyramid: "146 m", parthenon: "13.7 m", titanic: "269 m ≈ 3 football pitches", doctor: "Plague doctor", formula: "E = mc²" },
  };
  const txt = (g, x, y, s, size, cls) => g.append("text").attr("x", x).attr("y", y).attr("font-size", size || 12).attr("class", cls || null).text(s);

  // Ανθρωπάκι ύψους h με τα πόδια στο baseY
  function human(g, x, baseY, h, color) {
    const r = h * 0.11, sw = Math.max(0.6, h * 0.085);
    const f = g.append("g").attr("class", "human");
    const line = (x1, y1, x2, y2, w) => f.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke", color).attr("stroke-width", w).attr("stroke-linecap", "round");
    f.append("circle").attr("cx", x).attr("cy", baseY - h + r).attr("r", r).attr("fill", color);
    line(x, baseY - h + 2 * r, x, baseY - h * 0.42, sw);
    line(x - h * 0.2, baseY - h * 0.6, x + h * 0.2, baseY - h * 0.6, sw * 0.8);
    line(x, baseY - h * 0.42, x - h * 0.14, baseY, sw * 0.9);
    line(x, baseY - h * 0.42, x + h * 0.14, baseY, sw * 0.9);
    return f;
  }
  // Γραμμή διάστασης με ετικέτα
  function dim(g, x, y0, y1, label, delay) {
    const d = g.append("g").attr("opacity", 0);
    d.append("line").attr("x1", x).attr("y1", y0).attr("x2", x).attr("y2", y1).attr("stroke", "#fff").attr("stroke-width", 1.2).attr("stroke-dasharray", "3 3");
    [y0, y1].forEach((y) => d.append("line").attr("x1", x - 5).attr("y1", y).attr("x2", x + 5).attr("y2", y).attr("stroke", "#fff").attr("stroke-width", 1.2));
    const ym = (y0 + y1) / 2;
    txt(d, x, ym, label, 12).attr("transform", "rotate(-90 " + x + " " + ym + ")").attr("dy", -8);
    d.transition().delay(delay == null ? 900 : delay).duration(500).attr("opacity", 1);
    return d;
  }
  // Ανάπτυξη από τη βάση (y = 0)
  function grow(sel, delay, dur) {
    sel.attr("transform", "scale(1,0.001)")
      .transition().delay(delay || 0).duration(dur || 1100).ease(d3.easeBackOut.overshoot(1.1)).attr("transform", "scale(1,1)");
  }

  // ---------- Η Μεγάλη Πυραμίδα: 146 μ. δίπλα σε έναν άνθρωπο σε πραγματική κλίμακα ----------
  function pyramid(g, lang) {
    const l = L[lang] || L.el;
    const H = 150, W = 125;
    g.append("ellipse").attr("cx", 10).attr("cy", 6).attr("rx", 150).attr("ry", 12).attr("fill", "rgba(0,0,0,0.35)");
    const p = g.append("g");
    p.append("polygon").attr("points", (-W) + ",0 0," + (-H) + " 22,8").attr("fill", "#dcb470");
    p.append("polygon").attr("points", "22,8 0," + (-H) + " " + (W + 10) + ",-12").attr("fill", "#b48a3c");
    for (let i = 1; i < 10; i++) {
      const f = i / 10, y = -H * f;
      p.append("line").attr("x1", -W * (1 - f)).attr("y1", y).attr("x2", 22 * (1 - f)).attr("y2", y + 8 * (1 - f)).attr("stroke", "rgba(0,0,0,0.12)");
    }
    grow(p, 0, 1200);
    // άνθρωπος σε πραγματική κλίμακα (≈1,8 px) και μεγεθυντικός φακός
    const realH = H * (1.75 / 146);
    human(g, W + 30, -8, realH, "#fff");
    const cx = W + 100, cy = -78;
    const mag = g.append("g").attr("opacity", 0);
    mag.append("line").attr("x1", W + 30).attr("y1", -9).attr("x2", cx - 27).attr("y2", cy + 27).attr("stroke", "#fff").attr("stroke-width", 1.2);
    mag.append("circle").attr("cx", W + 30).attr("cy", -9).attr("r", 4).attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 1.2);
    mag.append("circle").attr("cx", cx).attr("cy", cy).attr("r", 38).attr("fill", "rgba(10,14,32,0.88)").attr("stroke", "#fff").attr("stroke-width", 1.5);
    human(mag, cx, cy + 26, 48, "#fff");
    txt(mag, cx, cy + 54, l.human, 11);
    mag.transition().delay(1400).duration(500).attr("opacity", 1);
    dim(g, -W - 18, 0, -H, l.pyramid);
  }

  // ---------- Ο Παρθενώνας με άνθρωπο σε κλίμακα ----------
  function parthenon(g, lang) {
    const l = L[lang] || L.el;
    const H = 120, W = 230;
    g.append("ellipse").attr("cx", 0).attr("cy", 6).attr("rx", 165).attr("ry", 10).attr("fill", "rgba(0,0,0,0.35)");
    const b = g.append("g");
    [[W / 2 + 14, 0, 8], [W / 2 + 8, -8, 8], [W / 2 + 2, -16, 8]].forEach(([hw, y, h]) =>
      b.append("rect").attr("x", -hw).attr("y", y - h).attr("width", hw * 2).attr("height", h).attr("fill", "#d9d2c0"));
    grow(b, 0, 600);
    const n = 8, colH = 62, top = -24 - colH;
    for (let i = 0; i < n; i++) {
      const x = -W / 2 + 14 + i * ((W - 28) / (n - 1));
      const c = g.append("g");
      c.append("rect").attr("x", x - 7).attr("y", top).attr("width", 14).attr("height", colH).attr("fill", i % 2 ? "#e8e1d0" : "#efe9da");
      c.append("rect").attr("x", x - 10).attr("y", top - 5).attr("width", 20).attr("height", 6).attr("fill", "#efe9da");
      [-4, 0, 4].forEach((dx) => c.append("line").attr("x1", x + dx).attr("y1", top + 2).attr("x2", x + dx).attr("y2", top + colH - 2).attr("stroke", "rgba(0,0,0,0.08)"));
      c.attr("transform", "translate(0,-24) scale(1,0.001) translate(0,24)")
        .transition().delay(300 + i * 90).duration(500).ease(d3.easeCubicOut).attr("transform", "translate(0,-24) scale(1,1) translate(0,24)");
    }
    const e = g.append("g").attr("opacity", 0);
    e.append("rect").attr("x", -W / 2 - 4).attr("y", top - 20).attr("width", W + 8).attr("height", 16).attr("fill", "#e3dccb");
    e.append("polygon").attr("points", (-W / 2 - 8) + "," + (top - 20) + " " + (W / 2 + 8) + "," + (top - 20) + " 0," + (-H)).attr("fill", "#efe9da").attr("stroke", "#cfc7b3");
    for (let i = -3; i <= 3; i++) e.append("circle").attr("cx", i * 24).attr("cy", top - 30 - (3 - Math.abs(i)) * 3).attr("r", 3.2).attr("fill", "#c9c0aa");
    e.transition().delay(1100).duration(500).attr("opacity", 1);
    const hH = H * (1.75 / 13.7);
    human(g, W / 2 + 42, 0, hH, "#fff").attr("opacity", 0).transition().delay(1500).duration(400).attr("opacity", 1);
    txt(g, W / 2 + 42, 16, l.human, 10).attr("opacity", 0).transition().delay(1500).duration(400).attr("opacity", 1);
    dim(g, -W / 2 - 30, 0, -H, l.parthenon);
  }

  // ---------- Ο γιατρός της πανώλης με τη μάσκα-ράμφος ----------
  function plaguedoctor(g, lang) {
    const l = L[lang] || L.el;
    const H = 180, dark = "#1c1b24", dark2 = "#2a2935", bone = "#e9dcc3";
    g.append("ellipse").attr("cx", 0).attr("cy", 4).attr("rx", 48).attr("ry", 8).attr("fill", "rgba(0,0,0,0.4)");
    for (let i = 0; i < 6; i++) {
      g.append("ellipse").attr("cx", (Math.random() - 0.5) * 120).attr("cy", -10 - Math.random() * 30).attr("rx", 30 + Math.random() * 30).attr("ry", 8).attr("fill", "rgba(180,170,200,0.16)").attr("opacity", 0)
        .transition().delay(i * 200).duration(1500).attr("opacity", 1).attr("cx", (Math.random() - 0.5) * 170);
    }
    const f = g.append("g").attr("class", "sway").attr("opacity", 0);
    const sh = H * 0.62;
    f.append("path").attr("d", "M-34,0 Q-40,-60 -22," + (-sh) + " L22," + (-sh) + " Q40,-60 34,0 Q20,6 0,2 Q-20,6 -34,0 Z").attr("fill", dark);
    for (let i = 0; i < 5; i++) f.append("circle").attr("cx", 0).attr("cy", -H * 0.58 + i * 16).attr("r", 1.8).attr("fill", "#6b6b78");
    f.append("path").attr("d", "M-22," + (-H * 0.6) + " Q-46,-80 -40,-50").attr("stroke", dark).attr("stroke-width", 12).attr("fill", "none").attr("stroke-linecap", "round");
    f.append("path").attr("d", "M22," + (-H * 0.6) + " Q44,-82 36,-56").attr("stroke", dark).attr("stroke-width", 12).attr("fill", "none").attr("stroke-linecap", "round");
    f.append("circle").attr("cx", -40).attr("cy", -48).attr("r", 6).attr("fill", "#3b2a1e");
    f.append("circle").attr("cx", 36).attr("cy", -54).attr("r", 6).attr("fill", "#3b2a1e");
    f.append("line").attr("x1", 38).attr("y1", -54).attr("x2", 44).attr("y2", 2).attr("stroke", "#7a5a3a").attr("stroke-width", 3).attr("stroke-linecap", "round");
    const hy = -H * 0.72;
    f.append("ellipse").attr("cx", 0).attr("cy", hy).attr("rx", 18).attr("ry", 20).attr("fill", dark2);
    f.append("path").attr("d", "M-6," + (hy + 4) + " Q10," + (hy + 2) + " 34," + (hy + 22) + " Q14," + (hy + 20) + " -4," + (hy + 14) + " Z").attr("fill", bone).attr("stroke", "#9a8c6e").attr("stroke-width", 1);
    [[22, hy + 15], [27, hy + 18]].forEach(([x, y]) => f.append("circle").attr("cx", x).attr("cy", y).attr("r", 1.2).attr("fill", "#7a6c50"));
    [[-4, hy - 3], [10, hy - 2]].forEach(([x, y]) => {
      f.append("circle").attr("cx", x).attr("cy", y).attr("r", 6).attr("fill", "#8fd3ff").attr("stroke", "#5a4a2a").attr("stroke-width", 2);
      f.append("circle").attr("cx", x - 1).attr("cy", y - 2).attr("r", 1.5).attr("fill", "#fff");
    });
    f.append("ellipse").attr("cx", 0).attr("cy", hy - 16).attr("rx", 34).attr("ry", 6).attr("fill", "#111017");
    f.append("rect").attr("x", -16).attr("y", hy - 42).attr("width", 32).attr("height", 28).attr("rx", 3).attr("fill", "#15141c");
    f.append("rect").attr("x", -16).attr("y", hy - 20).attr("width", 32).attr("height", 4).attr("fill", "#4a3b2a");
    f.transition().duration(1200).ease(d3.easeCubicOut).attr("opacity", 1);
    txt(g, 0, 22, l.doctor, 13).attr("opacity", 0).transition().delay(1000).duration(500).attr("opacity", 1);
  }

  // ---------- Ο Αϊνστάιν με το E = mc² ----------
  function einstein(g, lang) {
    const l = L[lang] || L.el;
    const f = g.append("g").attr("opacity", 0);
    const hy = -92;
    f.append("path").attr("d", "M-56,0 Q-50,-44 -18,-50 L18,-50 Q50,-44 56,0 Z").attr("fill", "#3a3f55");
    f.append("path").attr("d", "M-10,-50 L0,-30 L10,-50 Z").attr("fill", "#f1e9dc");
    f.append("line").attr("x1", 0).attr("y1", -50).attr("x2", 0).attr("y2", -22).attr("stroke", "#8a2f2f").attr("stroke-width", 4);
    f.append("rect").attr("x", -9).attr("y", hy + 24).attr("width", 18).attr("height", 18).attr("fill", "#e8c3a0");
    for (let i = 0; i < 14; i++) {
      const a = Math.PI + (i / 13) * Math.PI;
      const r = 34 + (i % 2) * 10 + Math.random() * 6;
      f.append("circle").attr("cx", Math.cos(a) * r * 0.9).attr("cy", hy + Math.sin(a) * r).attr("r", 11 + (i % 3) * 3).attr("fill", "#e6e6ea");
    }
    f.append("circle").attr("cx", -34).attr("cy", hy + 6).attr("r", 10).attr("fill", "#e6e6ea");
    f.append("circle").attr("cx", 34).attr("cy", hy + 6).attr("r", 10).attr("fill", "#e6e6ea");
    f.append("ellipse").attr("cx", 0).attr("cy", hy + 2).attr("rx", 27).attr("ry", 31).attr("fill", "#f1d2b6");
    [-10, 10].forEach((x) => {
      f.append("circle").attr("cx", x).attr("cy", hy - 2).attr("r", 2.6).attr("fill", "#222");
      f.append("path").attr("d", "M" + (x - 7) + "," + (hy - 11) + " Q" + x + "," + (hy - 16) + " " + (x + 7) + "," + (hy - 10)).attr("stroke", "#cfcfd4").attr("stroke-width", 3).attr("fill", "none").attr("stroke-linecap", "round");
    });
    f.append("path").attr("d", "M0," + hy + " Q4," + (hy + 10) + " -2," + (hy + 12)).attr("stroke", "#c99a78").attr("stroke-width", 2).attr("fill", "none");
    f.append("path").attr("d", "M-14," + (hy + 17) + " Q0," + (hy + 10) + " 14," + (hy + 17) + " Q0," + (hy + 24) + " -14," + (hy + 17) + " Z").attr("fill", "#d8d8dc");
    f.append("path").attr("d", "M-8," + (hy + 25) + " Q0," + (hy + 30) + " 8," + (hy + 25)).attr("stroke", "#a0624a").attr("stroke-width", 1.5).attr("fill", "none");
    f.transition().duration(900).ease(d3.easeCubicOut).attr("opacity", 1);
    const b = g.append("g").attr("opacity", 0).attr("transform", "translate(76,-150) scale(0.3)");
    b.append("rect").attr("x", -64).attr("y", -27).attr("width", 128).attr("height", 54).attr("rx", 16).attr("fill", "#fff");
    b.append("polygon").attr("points", "-32,24 -14,24 -42,46").attr("fill", "#fff");
    txt(b, 0, 2, l.formula, 28, "ink");
    b.transition().delay(800).duration(700).ease(d3.easeBackOut.overshoot(1.4)).attr("opacity", 1).attr("transform", "translate(76,-150) scale(1)");
    for (let i = 0; i < 8; i++) {
      g.append("text").text("✦").attr("x", 40 + Math.random() * 90).attr("y", -205 + Math.random() * 90).attr("font-size", 8 + Math.random() * 8).attr("fill", "#ffd36b").attr("opacity", 0)
        .transition().delay(1200 + i * 120).duration(500).attr("opacity", 1).transition().duration(900).attr("opacity", 0.4);
    }
  }

  // ---------- Ο Τιτανικός πλέει προς το παγόβουνο ----------
  function titanic(g, lang) {
    const l = L[lang] || L.el;
    let d = "M-260,0";
    for (let x = -240; x <= 260; x += 20) d += " Q" + (x - 10) + ",-6 " + x + ",0";
    g.append("path").attr("d", d + " L260,22 L-260,22 Z").attr("fill", "rgba(40,90,160,0.55)");
    const ice = g.append("g").attr("opacity", 0);
    ice.append("polygon").attr("points", "150,0 170,-48 186,-30 200,-62 222,-20 236,0").attr("fill", "#dff3ff").attr("stroke", "#9fd0ee");
    ice.append("polygon").attr("points", "140,2 250,2 232,40 160,46").attr("fill", "rgba(200,235,255,0.45)");
    ice.transition().duration(800).attr("opacity", 1);
    const s = g.append("g").attr("transform", "translate(-420,0)");
    s.append("path").attr("d", "M-130,0 L-120,-26 L120,-26 L140,-6 L130,0 Z").attr("fill", "#15161c");
    s.append("rect").attr("x", -120).attr("y", -31).attr("width", 240).attr("height", 5).attr("fill", "#b8102a");
    s.append("rect").attr("x", -90).attr("y", -46).attr("width", 180).attr("height", 15).attr("fill", "#f4f1ea");
    s.append("rect").attr("x", -70).attr("y", -56).attr("width", 140).attr("height", 10).attr("fill", "#f4f1ea");
    for (let i = 0; i < 4; i++) {
      const x = -55 + i * 36;
      s.append("rect").attr("x", x - 6).attr("y", -86).attr("width", 12).attr("height", 30).attr("fill", "#d9a441");
      s.append("rect").attr("x", x - 6).attr("y", -86).attr("width", 12).attr("height", 6).attr("fill", "#111");
    }
    for (let i = 0; i < 18; i++) s.append("circle").attr("cx", -110 + i * 12.5).attr("cy", -20).attr("r", 1.3).attr("fill", "#ffd36b");
    s.append("line").attr("x1", -100).attr("y1", -46).attr("x2", -100).attr("y2", -100).attr("stroke", "#ccc").attr("stroke-width", 1.5);
    s.append("line").attr("x1", 90).attr("y1", -46).attr("x2", 90).attr("y2", -96).attr("stroke", "#ccc").attr("stroke-width", 1.5);
    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 4; k++) {
        s.append("circle").attr("cx", -55 + i * 36).attr("cy", -90).attr("r", 3).attr("fill", "rgba(120,120,130,0.6)").attr("opacity", 0)
          .transition().delay(600 + k * 500 + i * 120).duration(1600).attr("opacity", 0.8).attr("cx", -55 + i * 36 - 20 - k * 10).attr("cy", -120 - k * 10).attr("r", 9)
          .transition().duration(400).attr("opacity", 0);
      }
    }
    s.transition().duration(2600).ease(d3.easeCubicOut).attr("transform", "translate(0,0)");
    txt(g, 0, 40, l.titanic, 12).attr("opacity", 0).transition().delay(1800).duration(500).attr("opacity", 1);
  }

  window.WORLD_SCENES = { pyramid, parthenon, plaguedoctor, einstein, titanic };
})();
