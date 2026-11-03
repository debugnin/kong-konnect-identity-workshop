// Deck helper library: theme, layouts and small drawing helpers.
// Brand source: Kong Brand Foundations (Navy Green / Electric Lime / Bay / White + warm-green grays).
// Fonts: Arial + Courier New are used so the deck renders identically on any machine.
// To use Kong's brand typefaces (Funnel Sans / Roboto Mono) change FONT_* below and rebuild —
// every text style in the deck inherits from these two constants.
const FONT_HEAD = "Arial";
const FONT_BODY = "Arial";
const FONT_CODE = "Courier New";

const THEME = {
  name: "Kong Konnect Workshop",
  headFontFace: FONT_HEAD,
  bodyFontFace: FONT_BODY,
  colors: {
    dk1: "001408",   // Navy Green  — primary dark / text on light
    lt1: "FFFFFF",   // White
    dk2: "4A4D49",   // Gray 700
    lt2: "CDD4CB",   // Bay
    accent1: "CCFF00", // Electric Lime — the voltage
    accent2: "B7BDB5", // Gray 300
    accent3: "858983", // Gray 500
    accent4: "313919", // blueprint line on dark
    accent5: "E7EDE5", // Gray 50
    accent6: "1A1F1B", // dark surface
    hlink: "CCFF00",
    folHlink: "B7BDB5",
  },
};

const W = 13.333, H = 7.5;

function setup(pres) {
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: FONT_HEAD, bodyFontFace: FONT_BODY };
  pres.title = "Getting Started with Kong Konnect: Control Plane Management & Kong Identity";
  pres.author = "Kong Professional Services";
  pres.company = "Kong Inc.";
  const C = pres.SchemeColor;

  const footer = (dark) => ({
    text: {
      text: "KONG KONNECT + KONG IDENTITY  ·  CUSTOMER ENABLEMENT WORKSHOP",
      options: { x: 0.6, y: 7.04, w: 9, h: 0.3, fontSize: 10, color: dark ? C.accent3 : C.accent3, charSpacing: 1.5, fontFace: FONT_BODY, margin: 0 },
    },
  });
  const grid = () => {
    const o = [];
    for (let i = 1; i < 10; i++) o.push({ line: { x: (W / 10) * i, y: 0, w: 0, h: H, line: { color: C.accent4, width: 0.5 } } });
    for (let j = 1; j < 6; j++) o.push({ line: { x: 0, y: (H / 6) * j, w: W, h: 0, line: { color: C.accent4, width: 0.5 } } });
    return o;
  };
  const titlePh = (color, y = 0.6) => ({
    placeholder: {
      options: { name: "title", type: "title", x: 0.6, y, w: 12.1, h: 0.9, fontSize: 34, bold: true, color, align: "left", valign: "top", margin: 0, fontFace: FONT_HEAD },
      text: "",
    },
  });
  const sn = (dark) => ({ x: 12.2, y: 7.04, w: 0.55, h: 0.3, fontSize: 10, color: C.accent3, align: "right", fontFace: FONT_BODY });

  pres.defineSlideMaster({
    title: "KONG_CONTENT", background: { color: "FFFFFF" },
    objects: [titlePh(C.text1), footer(false)], slideNumber: sn(false),
  });
  pres.defineSlideMaster({
    title: "KONG_DARK", background: { color: "001408" },
    objects: [...grid(), titlePh(C.background1), footer(true)], slideNumber: sn(true),
  });
  pres.defineSlideMaster({
    title: "KONG_DEMO", background: { color: "001408" },
    objects: [
      ...grid(), titlePh(C.background1), footer(true),
      { rect: { x: 11.0, y: 0.58, w: 1.73, h: 0.38, fill: { color: C.accent1 }, rectRadius: 0.19 } },
      { text: { text: "LIVE DEMO", options: { x: 11.0, y: 0.58, w: 1.73, h: 0.38, fontSize: 11, bold: true, color: C.text1, align: "center", valign: "middle", charSpacing: 2, fontFace: FONT_BODY, margin: 0 } } },
    ],
    slideNumber: sn(true),
  });
  pres.defineSlideMaster({
    title: "KONG_TITLE", background: { color: "001408" },
    objects: [
      ...grid(),
      { text: { text: "KONG PROFESSIONAL SERVICES  ·  CUSTOMER ENABLEMENT", options: { x: 0.8, y: 0.7, w: 9, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 3, fontFace: FONT_BODY, margin: 0 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 11.2, h: 2.4, fontSize: 48, bold: true, color: C.background1, align: "left", valign: "top", margin: 0, fontFace: FONT_HEAD }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.7, w: 10.5, h: 1.2, fontSize: 20, color: C.background2, align: "left", valign: "top", margin: 0, fontFace: FONT_BODY }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "KONG_SECTION", background: { color: "001408" },
    objects: [
      ...grid(),
      { placeholder: { options: { name: "title", type: "title", x: 3.4, y: 2.55, w: 9.2, h: 1.5, fontSize: 44, bold: true, color: C.background1, align: "left", valign: "top", margin: 0, fontFace: FONT_HEAD }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 3.4, y: 4.25, w: 9.0, h: 1.4, fontSize: 18, color: C.background2, align: "left", valign: "top", margin: 0, fontFace: FONT_BODY }, text: "" } },
      footer(true),
    ],
    slideNumber: sn(true),
  });
  return C;
}

// ── drawing helpers ──────────────────────────────────────────────────────────
function mk(pres, C) {
  const h = {};
  h.C = C;
  h.notes = (s, t) => s.addNotes(t.trim());
  h.kicker = (s, text, dark) =>
    s.addText(text.toUpperCase(), { x: 0.6, y: 0.3, w: 8, h: 0.25, fontSize: 11, bold: true, color: dark ? C.accent1 : C.accent3, charSpacing: 2.5, margin: 0, isTextBox: true, objectName: "Kicker" });
  h.text = (s, text, o = {}) => s.addText(text, { fontSize: 16, color: C.text1, margin: 0, valign: "top", isTextBox: true, ...o });
  // pill chip: variant lime | dark | bay | line
  h.chip = (s, text, x, y, w, variant = "lime", hgt = 0.34) => {
    const fills = { lime: [C.accent1, C.text1, null], dark: [C.dk2 || C.text2, C.background1, null], bay: [C.background2, C.text1, null], line: [null, C.accent1, C.accent1] };
    const [fill, color, line] = fills[variant];
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: hgt / 2, fill: fill ? { color: fill } : { type: "none" }, line: line ? { color: line, width: 1 } : { type: "none" }, objectName: "Chip " + text });
    s.addText(text.toUpperCase(), { x, y, w, h: hgt, fontSize: 10, bold: true, color, align: "center", valign: "middle", charSpacing: 1.5, margin: 0, isTextBox: true });
  };
  // card with header + body; dark=true for dark slides
  h.card = (s, x, y, w, hgt, head, body, o = {}) => {
    const dark = !!o.dark;
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: 0.08, fill: { color: o.fill || (dark ? C.accent6 : C.accent5) }, line: dark ? { color: o.lineColor || C.accent4, width: 1 } : { type: "none" }, objectName: "Card " + (head || "note") });
    if (o.tag) h.chip(s, o.tag, x + 0.25, y + 0.22, o.tagW || 1.1, o.tagVariant || (dark ? "line" : "lime"), 0.28);
    const ty = y + (o.tag ? 0.62 : 0.25);
    const gap = head ? (o.headGap === undefined ? 0.5 : o.headGap) : 0;
    if (head) s.addText(head, { x: x + 0.25, y: ty, w: w - 0.5, h: 0.4, fontSize: o.headSize || 18, bold: true, color: dark ? C.background1 : C.text1, margin: 0, valign: "top", isTextBox: true });
    if (body) {
      let content = body;
      if (typeof body === "object" && !Array.isArray(body)) {
        content = [];
        if (body.lead) content.push({ text: body.lead, options: { breakLine: true, bold: true, paraSpaceAfter: 6 } });
        body.bullets.forEach((b, i) => content.push({ text: b, options: { bullet: { indent: 14 }, breakLine: i < body.bullets.length - 1, paraSpaceAfter: 5 } }));
      }
      s.addText(content, { x: x + 0.25, y: ty + gap, w: w - 0.5, h: hgt - (ty - y) - gap - 0.2, fontSize: o.bodySize || 14, color: o.bodyColor || (dark ? C.background2 : C.text2), margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 4 });
    }
  };
  // diagram node. kind: pill | focal | kong | ai
  h.node = (s, label, x, y, w, kind = "pill", hgt = 0.46) => {
    if (kind === "focal") {
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: 0.06, fill: { color: C.background1 }, line: { type: "none" }, objectName: "Node " + label });
      s.addText(label, { x, y, w, h: hgt, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0.04, isTextBox: true });
    } else if (kind === "kong") {
      s.addShape(pres.ShapeType.ellipse, { x, y, w: hgt + 0.2, h: hgt + 0.2, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Node " + label });
      s.addText(label, { x, y, w: hgt + 0.2, h: hgt + 0.2, fontSize: 10, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    } else if (kind === "lime") {
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: 0.06, fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Node " + label });
      s.addText(label, { x, y, w, h: hgt, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0.04, isTextBox: true });
    } else if (kind === "ai") {
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: hgt / 2, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 }, objectName: "Node " + label });
      s.addText(label.toUpperCase(), { x, y, w, h: hgt, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle", charSpacing: 1, margin: 0, isTextBox: true });
    } else {
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: hgt / 2, fill: { color: C.text2 }, line: { type: "none" }, objectName: "Node " + label });
      s.addText(label.toUpperCase(), { x, y, w, h: hgt, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle", charSpacing: 1, margin: 0, isTextBox: true });
    }
  };
  // connector (dark-slide default): dashed lime, optional arrow
  h.link = (s, x1, y1, x2, y2, o = {}) => {
    const dark = o.dark !== false;
    s.addShape(pres.ShapeType.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1),
      flipH: x2 < x1, flipV: y2 < y1,
      line: { color: dark ? C.accent1 : C.text2, width: o.width || 1.5, dashType: o.solid ? "solid" : (o.dot ? "sysDot" : "dash"), endArrowType: o.arrow === false ? undefined : "triangle" },
    });
  };
  h.dot = (s, x, y, dark = true) => s.addShape(pres.ShapeType.ellipse, { x: x - 0.04, y: y - 0.04, w: 0.08, h: 0.08, fill: { color: dark ? C.accent1 : C.text1 }, line: { type: "none" } });
  // code block. Use ⟦highlight⟧ to mark lime-highlighted spans.
  h.code = (s, text, x, y, w, hgt, o = {}) => {
    const dark = o.onDark !== false;
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hgt, rectRadius: 0.04, fill: { color: dark ? C.accent6 : C.text1 }, line: dark ? { color: C.accent4, width: 1 } : { type: "none" }, objectName: "Code block" });
    const runs = [];
    const lines = text.split("\n");
    lines.forEach((ln, li) => {
      const parts = ln.split(/(⟦[^⟧]*⟧)/);
      parts.forEach((p, pi) => {
        if (!p) return;
        const last = pi === parts.length - 1 || parts.slice(pi + 1).every((q) => !q);
        const isHi = p.startsWith("⟦");
        runs.push({ text: isHi ? p.slice(1, -1) : p, options: { color: isHi ? C.accent1 : C.background1, bold: isHi, breakLine: last && li < lines.length - 1 } });
      });
      if (!ln && li < lines.length - 1) runs.push({ text: " ", options: { breakLine: true } });
    });
    s.addText(runs, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: hgt - 0.3, fontFace: FONT_CODE, fontSize: o.size || 12, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 0 });
  };
  // four-lens strip used on every "navigating Konnect" slide
  h.lens = (s, what, why, when, watch, dark) => {
    const labels = ["What it is", "Why it matters", "Use it when", "Watch for"];
    const bodies = [what, why, when, watch];
    const w = 2.9, g = 0.17, y = 4.95, hh = 1.6;
    bodies.forEach((b, i) => {
      const x = 0.6 + i * (w + g), warn = i === 3;
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: hh, rectRadius: 0.08, fill: { color: warn ? C.accent1 : (dark ? C.accent6 : C.accent5) }, line: dark && !warn ? { color: C.accent4, width: 1 } : { type: "none" }, objectName: "Lens " + labels[i] });
      s.addText(labels[i].toUpperCase(), { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.25, fontSize: 10, bold: true, color: warn ? C.text1 : (dark ? C.accent1 : C.text2), charSpacing: 2, margin: 0, isTextBox: true });
      s.addText(b, { x: x + 0.2, y: y + 0.45, w: w - 0.4, h: hh - 0.55, fontSize: 13, color: warn ? C.text1 : (dark ? C.background1 : C.text1), margin: 0, valign: "top", isTextBox: true });
    });
  };
  // numbered step badge
  h.step = (s, n, x, y, dark = false) => {
    s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.42, h: 0.42, fill: { color: dark ? C.accent1 : C.text1 }, line: { type: "none" } });
    s.addText(String(n), { x, y, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: dark ? C.text1 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  };
  // "conceptual diagram" disclaimer
  h.conceptual = (s, dark) =>
    s.addText("CONCEPTUAL DIAGRAM — NOT A SCREENSHOT", { x: 8.0, y: 7.04, w: 4.1, h: 0.3, fontSize: 10, bold: true, color: dark ? C.accent1 : C.accent3, align: "right", charSpacing: 1, margin: 0, isTextBox: true });
  // source / doc link footer line above the footer
  h.src = (s, text, dark) =>
    s.addText(text, { x: 0.6, y: 6.68, w: 12.1, h: 0.28, fontSize: 11, color: dark ? C.accent2 : C.accent3, margin: 0, isTextBox: true, valign: "middle" });
  return h;
}

module.exports = { THEME, setup, mk, W, H, FONT_CODE, FONT_BODY, FONT_HEAD };
