// Opening + Section A: Introduction to Kong Konnect
const { W, H, FONT_CODE } = require("./lib");

module.exports = function (pres, h) {
  const C = h.C;
  const T = pres.ShapeType;

  // ───────────────────────── 1. Title ─────────────────────────
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "KONG_TITLE", sectionTitle: "Opening" });
  s.addText("Getting Started with Kong Konnect: Control Plane Management & Kong Identity", { placeholder: "title" });
  s.addText("Customer enablement workshop  ·  about 105 minutes  ·  concepts first, then a live demo you can rerun yourself", { placeholder: "body" });
  h.notes(s, `
PRESENTER (2 min). Welcome and set the contract for the session.
SAY: "This is a working session, not a product pitch. By the end you'll know how Konnect is organised, how people and machines get access to it, and how Kong Identity lets the gateway know who an API client is. Then I'll run a demo that you can rerun from the repo we're leaving with you."
CHECK: ask who has used Konnect before, who runs Kong Gateway today, and whether anyone already uses an external IdP with the gateway. Their answers decide how long you spend in Sections A and B.
LOGISTICS: breaks are not scheduled; pause wherever the room needs it. Questions are welcome at any point.
BRAND NOTE FOR THE SA: this deck uses text-only branding. Drop the official Kong logo onto the title layout if you want it.`);

  // ───────────────────────── 2. Agenda ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "Opening" });
  s.addText("Today: four concept blocks, then one live demo", { placeholder: "title" });
  h.kicker(s, "Agenda and format");
  const blocks = [
    ["Open", 5, "c"], ["A  Konnect", 15, "c"], ["B  Navigating", 20, "c"], ["C  Account access", 15, "c"], ["D  Kong Identity", 15, "c"], ["Live demo", 30, "d"], ["Wrap", 5, "c"],
  ];
  const total = 105, x0 = 0.6, bw = 12.1; let cx = x0;
  blocks.forEach(([name, min, kind]) => {
    const w = (bw * min) / total;
    s.addShape(T.rect, { x: cx, y: 1.95, w: w - 0.04, h: 0.8, fill: { color: kind === "d" ? C.accent1 : C.text1 }, line: { type: "none" }, objectName: "Timeline " + name });
    s.addText(String(min), { x: cx, y: 1.95, w: w - 0.04, h: 0.8, fontSize: min >= 15 ? 24 : 14, bold: true, color: kind === "d" ? C.text1 : C.accent1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(name, { x: cx - 0.1, y: 2.85, w: w + 0.16, h: 0.5, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "top", margin: 0, isTextBox: true });
    cx += w;
  });
  s.addText("minutes", { x: 0.6, y: 3.4, w: 3, h: 0.25, fontSize: 11, color: C.accent3, margin: 0, isTextBox: true });
  // legend + format
  h.chip(s, "Concept", 0.6, 4.2, 1.3, "dark"); h.text(s, "Slides and discussion. No keyboard needed.", { x: 2.1, y: 4.2, w: 6, h: 0.34, fontSize: 14, valign: "middle" });
  h.chip(s, "Live demo", 0.6, 4.75, 1.3, "lime"); h.text(s, "Terminal and Konnect UI. Every step is a script in the repo.", { x: 2.1, y: 4.75, w: 7, h: 0.34, fontSize: 14, valign: "middle" });
  h.card(s, 9.2, 4.0, 3.5, 2.35, "How to use this time", "Interrupt me. If a slide raises a question about your environment, that question is the workshop.", { bodySize: 14 });
  h.notes(s, `
PRESENTER (2 min). Walk the bar left to right. The only block that's mostly hands-on is the 30-minute demo; everything before it builds the vocabulary the demo uses.
SAY: "Sections A and B are about Konnect itself. C is how your people and your machines get in. D is Kong Identity, which is the newer piece and the reason for the demo."
LEGEND: the two chips are Concept and Live demo. PRESENTER-ONLY: where the public docs do not settle something (for example the availability stage of Kong Identity), it is flagged in these notes and in docs/documentation-references.md, not on the slides. Read those before the session.
TIMING: if you're running long, shorten B. Do not shorten the demo.`);

  // ───────────────────────── 3. Versions and licensing ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "Opening" });
  s.addText("What you need: versions and licensing", { placeholder: "title" });
  h.kicker(s, "Prerequisites");
  const hd = (t) => ({ text: t, options: { bold: true, color: C.accent1, fill: { color: C.text1 }, fontSize: 14, fontFace: "Arial" } });
  const cell = (t, o = {}) => ({ text: t, options: { fontSize: 14, color: C.text1, ...o } });
  s.addTable(
    [
      [hd("Requirement"), hd("What you need")],
      [cell("Kong Gateway data plane", { bold: true }), cell("3.15 or later for principal lookup in the OpenID Connect plugin. 3.16 for the Datakit principal property. The demo runs 3.16.")],
      [cell("Where it runs", { bold: true }), cell("Kong Identity principals and directories are Konnect-only. They are not available on self-managed, on-prem control planes.")],
      [cell("Licence", { bold: true }), cell("OpenID Connect is an Enterprise plugin. A Konnect account provisions the Gateway Enterprise licence automatically.")],
      [cell("decK", { bold: true }), cell("1.69 or later recommended. From 1.59 the OIDC plugin needs cache_tokens_salt.")],
      [cell("Konnect access", { bold: true }), cell("A personal access token whose user can create control planes and manage Kong Identity.")],
    ],
    { x: 0.6, y: 1.8, w: 12.1, colW: [3.3, 8.8], rowH: 0.78, border: { type: "solid", color: C.background2, pt: 1 }, fill: { color: C.background1 }, valign: "middle", margin: [0.05, 0.14, 0.05, 0.14], objectName: "Prerequisites table" }
  );
  h.notes(s, `
PRESENTER (3 min). This is the one slide to be strict about, because every row can derail a demo.
SAY: "Principal lookup in the OpenID Connect plugin arrived in Gateway 3.15, and the way we'll inspect the principal inside the gateway needs 3.16. Kong Identity principals only exist in Konnect. If you run a self-managed control plane, this feature isn't available to you today."
LICENCE: the OpenID Connect plugin is Enterprise-only. In Konnect that's handled for you: data planes inherit the licence from the control plane.
PRESENTER-ONLY, NOT ON THE SLIDE: whether Kong Identity is switched on for the customer's org, and its availability stage (the docs carry no beta label, which is not a GA statement), are things the public docs don't settle. Confirm both with the Kong account team before the session. Script 00 checks that the directories API answers. Don't say GA unless someone at Kong has told you so.
SOURCES: developer.konghq.com/identity/principals, plugins/openid-connect (changelog 3.15.0.0), how-to/configure-oidc-datakit-host-routing-with-principals-metadata.`);

  // ───────────────────────── 4. Section A ─────────────────────────
  pres.addSection({ title: "A. Introduction to Konnect" });
  s = pres.addSlide({ masterName: "KONG_SECTION", sectionTitle: "A. Introduction to Konnect" });
  s.addText("A", { x: 0.8, y: 1.9, w: 2.4, h: 2.8, fontSize: 160, bold: true, color: C.accent1, margin: 0, isTextBox: true, valign: "top" });
  s.addText("Introduction to Kong Konnect", { placeholder: "title" });
  s.addText("15 minutes  ·  Concept\nWhat Konnect is, who owns which piece, and how configuration reaches the traffic.", { placeholder: "body" });
  h.notes(s, `
PRESENTER (30 sec). Section divider. Transition: "Let's start with the shape of the platform, because every later question — who can change this, where does it run, where does identity live — is answered by it."`);

  // ───────────────────────── 5. What Konnect is ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "A. Introduction to Konnect" });
  s.addText("Konnect: one management plane, your data planes", { placeholder: "title" });
  h.kicker(s, "A  ·  What Konnect is");
  h.text(s, "Konnect gives you one place to manage Kong Gateway and the things built around it. Kong hosts the control plane. You decide where the data planes run.", { x: 0.6, y: 1.85, w: 4.6, h: 1.8, fontSize: 18, color: C.text1 });
  h.text(s, "That split is the idea behind everything else in this session.", { x: 0.6, y: 3.85, w: 4.6, h: 0.9, fontSize: 16, color: C.text2 });
  h.card(s, 0.6, 4.55, 4.6, 1.9, "Where Kong Identity fits", "Today's second half. Directories and principals live in Konnect, not inside your data plane.", { tag: "Remember this", tagW: 1.5, bodySize: 14 });
  // layered stack
  const lx = 5.8, lw = 6.9;
  s.addShape(T.roundRect, { x: lx, y: 1.85, w: lw, h: 1.95, rectRadius: 0.08, fill: { color: C.background2 }, line: { type: "none" }, objectName: "Layer apps" });
  s.addText("APPLICATIONS ON KONNECT", { x: lx + 0.3, y: 2.0, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  [["Observability", 0.3, 2.45, 1.9], ["Dev Portal", 2.3, 2.45, 1.5], ["Catalog", 3.9, 2.45, 1.4], ["Metering & Billing", 0.3, 3.05, 2.4], ["Kong Identity", 2.8, 3.05, 1.9]].forEach(([a, dx, y, w]) => {
    const hi = a === "Kong Identity";
    s.addShape(T.roundRect, { x: lx + dx, y, w, h: 0.5, rectRadius: 0.25, fill: { color: hi ? C.accent1 : C.text2 }, line: { type: "none" }, objectName: "App " + a });
    s.addText(a.toUpperCase(), { x: lx + dx, y, w, h: 0.5, fontSize: 10, bold: true, color: hi ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, charSpacing: 1, isTextBox: true });
  });
  s.addShape(T.roundRect, { x: lx, y: 3.95, w: lw, h: 1.25, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" }, objectName: "Layer control plane" });
  s.addText("CONTROL PLANE", { x: lx + 0.3, y: 4.08, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("Managed by Kong. Hosted in the cloud. Holds your configuration.", { x: lx + 0.3, y: 4.5, w: lw - 0.6, h: 0.6, fontSize: 16, color: C.background1, margin: 0, isTextBox: true, valign: "top" });
  s.addShape(T.roundRect, { x: lx, y: 5.35, w: lw, h: 1.1, rectRadius: 0.08, fill: { color: C.background1 }, line: { color: C.text1, width: 1.5 }, objectName: "Layer data planes" });
  s.addText("DATA PLANES", { x: lx + 0.3, y: 5.47, w: 5, h: 0.3, fontSize: 11, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("Kong Gateway nodes that carry your traffic. Self-managed, or run by Kong.", { x: lx + 0.3, y: 5.85, w: lw - 0.6, h: 0.5, fontSize: 16, color: C.text1, margin: 0, isTextBox: true, valign: "top" });
  h.src(s, "Source: developer.konghq.com/konnect/");
  h.notes(s, `
PRESENTER (3 min). Draw the three layers from the bottom up.
BOTTOM: data planes are Kong Gateway nodes. They take the traffic. You can run them yourselves, or Kong can run them for you.
MIDDLE: the control plane is where configuration lives: services, routes, plugins, consumers. Kong hosts it.
TOP: applications built on the platform: analytics, Dev Portal, Catalog, Metering and Billing — and Kong Identity, highlighted because it's today's second half.
SAY: "The documentation puts it as a control plane managed by Kong and hosted in the cloud, with the data plane managed on your terms. Hold on to that sentence."
TRANSITION: "Next, the same picture as a chain of responsibilities."`);

  // ───────────────────────── 6. Architecture ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: "A. Introduction to Konnect" });
  s.addText("Konnect architecture: who does what", { placeholder: "title" });
  h.kicker(s, "A  ·  Architecture", true);
  const nodes = [
    ["Customer", "Decides which APIs exist. Owns the upstream services, the identity provider and the network."],
    ["Kong Konnect", "The SaaS platform. Hosts control planes, Kong Identity, analytics, Dev Portal and Catalog."],
    ["Organization", "The account boundary: users, teams, roles, SSO, regions, plan and usage."],
    ["Control plane", "Stores configuration: services, routes, plugins, consumers. Pushes it to data planes."],
    ["Data plane(s)", "Kong Gateway nodes. Proxy traffic, enforce plugins, report status and analytics."],
    ["Upstream APIs", "Your services. The gateway routes to them. They stay where they are."],
  ];
  const nw = 1.72, gap = 0.356;
  nodes.forEach(([n, d], i) => {
    const x = 0.6 + i * (nw + gap);
    h.node(s, n, x, 1.9, nw, "focal", 0.6);
    if (i < nodes.length - 1) h.link(s, x + nw + 0.04, 2.2, x + nw + gap - 0.04, 2.2);
    s.addShape(T.roundRect, { x, y: 2.85, w: nw, h: 2.35, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Responsibility " + n });
    s.addText(d, { x: x + 0.15, y: 3.0, w: nw - 0.3, h: 2.1, fontSize: 13, color: C.background2, margin: 0, valign: "top", isTextBox: true });
    h.dot(s, x + nw / 2, 2.5);
  });
  s.addShape(T.roundRect, { x: 0.6, y: 5.45, w: 12.13, h: 1.05, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 }, objectName: "Two paths" });
  s.addText([
    { text: "REQUEST PATH   ", options: { bold: true, color: C.accent1, charSpacing: 2, fontSize: 11 } }, { text: "client  →  data plane  →  upstream API", options: { color: C.background1, breakLine: true } },
    { text: "CONFIG PATH    ", options: { bold: true, color: C.accent1, charSpacing: 2, fontSize: 11 } }, { text: "you  →  control plane  →  data plane", options: { color: C.background1 } },
  ], { x: 0.9, y: 5.45, w: 11.5, h: 1.05, fontSize: 16, valign: "middle", margin: 0, isTextBox: true, paraSpaceAfter: 4 });
  h.src(s, "Konnect applications, control planes and data planes: developer.konghq.com/konnect/", true);
  h.notes(s, `
PRESENTER (4 min). This is the architecture slide the brief asks for; walk it left to right and say one sentence per box.
CUSTOMER: you. You own the APIs, the identity provider, and the network the data planes sit in.
KONNECT: the platform. One login, many applications.
ORGANIZATION: the boundary for users, teams, roles and SSO. When we get to Section C, everything about who can log in happens at this level.
CONTROL PLANE: configuration lives here. When you create a route in the UI, or run decK, this is what changes.
DATA PLANE: Kong Gateway nodes. They receive configuration from the control plane, handle requests, and report health and analytics back.
UPSTREAM: your services.
ASK THE ROOM: "Where would the data plane run for you — Kubernetes, VMs, a cloud network?" The answer shapes the next slides.
NOTE: in the demo, the control plane and Kong Identity are the Konnect SaaS; the data plane is a single container on this laptop.`);

  // ───────────────────────── 7. Control plane vs data plane ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "A. Introduction to Konnect" });
  s.addText("Control plane vs data plane", { placeholder: "title" });
  h.kicker(s, "A  ·  Core model");
  h.card(s, 0.6, 1.85, 5.2, 3.5, "Control plane", { lead: "Where you configure.", bullets: ["Hosted by Kong in Konnect", "Holds services, routes, plugins, consumers", "Roles grant access per control plane", "You create it with one click or one API call"] }, { tag: "Konnect SaaS", tagW: 1.5, bodySize: 15 });
  h.card(s, 7.53, 1.85, 5.2, 3.5, "Data plane", { lead: "Where traffic runs.", bullets: ["Kong Gateway nodes: yours or Kong's", "Connect to the control plane over mutual TLS", "Pull configuration and enforce plugins", "Send status and analytics back"] }, { tag: "Runs where you choose", tagW: 2.8, bodySize: 15, fill: C.background2 });
  // arrows between
  h.link(s, 5.95, 2.95, 7.4, 2.95, { dark: false, solid: true });
  h.text(s, "configuration", { x: 5.9, y: 2.55, w: 1.6, h: 0.3, fontSize: 12, align: "center", color: C.text2, bold: true });
  h.link(s, 7.4, 3.75, 5.95, 3.75, { dark: false, solid: true });
  h.text(s, "status, analytics", { x: 5.85, y: 3.85, w: 1.75, h: 0.3, fontSize: 12, align: "center", color: C.text2, bold: true });
  s.addShape(T.roundRect, { x: 0.6, y: 5.6, w: 12.13, h: 0.85, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" } });
  s.addText([{ text: "In the demo  ", options: { bold: true, color: C.accent1 } }, { text: "the control plane is your Konnect account. The data plane is one container on this laptop, authenticated to the control plane with a pinned client certificate.", options: { color: C.background1 } }], { x: 0.9, y: 5.6, w: 11.6, h: 0.85, fontSize: 15, valign: "middle", margin: 0, isTextBox: true });
  h.src(s, "Sources: developer.konghq.com/konnect/ · developer.konghq.com/gateway/cp-dp-communication/");
  h.notes(s, `
PRESENTER (3 min). One idea: configuration goes down, status comes up.
SAY: "The control plane never handles your API traffic. It holds the configuration and hands it to data planes. The data planes do the work."
SECURITY HOOK: data planes authenticate to the control plane with certificates — pinned certificates or ones signed by a CA — and the connection is mutual TLS. In the demo script 01 generates a certificate, pins it to the control plane through the API, and mounts it into the container.
ROLES HOOK: because roles can be scoped to one control plane, a control plane is also the unit of access. Teams that must not see each other's configuration get separate control planes.
KEEP SHORT: this is vocabulary. Move on.`);

  // ───────────────────────── 8. Hosting options ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "A. Introduction to Konnect" });
  s.addText("Where data planes can run", { placeholder: "title" });
  h.kicker(s, "A  ·  Hosting options");
  const cw = 3.9, cg = 0.2;
  [
    ["Serverless gateway", "Lightweight API gateways. Konnect hosts the control plane and provisions the data plane nodes for you.", "Kong runs it", "lime"],
    ["Dedicated Cloud Gateway", "Data plane nodes managed by Kong on isolated infrastructure in AWS, Azure or GCP.", "Kong runs it", "lime"],
    ["Self-hosted", "You run the nodes on a supported system you choose. This workshop uses Docker on a laptop.", "You run it", "dark"],
  ].forEach(([t, d, tag, v], i) => {
    const x = 0.6 + i * (cw + cg);
    s.addShape(T.roundRect, { x, y: 1.85, w: cw, h: 3.2, rectRadius: 0.08, fill: { color: i === 2 ? C.text1 : C.accent5 }, line: { type: "none" }, objectName: "Hosting " + t });
    h.chip(s, tag, x + 0.3, 2.1, 1.5, i === 2 ? "lime" : "dark", 0.3);
    s.addText(t, { x: x + 0.3, y: 2.65, w: cw - 0.6, h: 0.5, fontSize: 19, bold: true, color: i === 2 ? C.background1 : C.text1, margin: 0, valign: "top", isTextBox: true });
    s.addText(d, { x: x + 0.3, y: 3.2, w: cw - 0.6, h: 1.6, fontSize: 15, color: i === 2 ? C.background2 : C.text2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addText([{ text: "Why it matters today  ", options: { bold: true } }, { text: "The OpenID Connect plugin is listed as supported on hybrid, cloud-gateway and serverless deployments. Principal lookups go from the data plane to the Konnect region that hosts the control plane." }], { x: 0.6, y: 5.55, w: 12.1, h: 0.9, fontSize: 15, color: C.text1, margin: 0, valign: "top", isTextBox: true });
  h.src(s, "Sources: developer.konghq.com/konnect/ · developer.konghq.com/plugins/openid-connect/reference/");
  h.notes(s, `
PRESENTER (2 min). Three options; the customer usually already knows which one applies.
SERVERLESS and DEDICATED CLOUD GATEWAYS: Kong runs the data plane. Serverless is the lightweight option; Dedicated Cloud Gateways run on isolated infrastructure in AWS, Azure or GCP.
SELF-HOSTED: they run the nodes. This is the hybrid mode in the docs, and it's what we simulate in the demo.
FOR TODAY: the OpenID Connect plugin reference lists hybrid, cloud gateways and serverless as supported Konnect deployments. If someone asks "does principal lookup work on my deployment type?", the plugin page covers the plugin; check the Kong Identity docs for anything specific to a deployment type.
CONFIRM LATER: if the customer runs Dedicated Cloud Gateways, the network path from data plane to Konnect Identity differs from a laptop. Flag that as a follow-up rather than guessing.`);

  // ───────────────────────── 9. Organization, accounts, regions ─────────────────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: "A. Introduction to Konnect" });
  s.addText("Organization, accounts and regions", { placeholder: "title" });
  h.kicker(s, "A  ·  Scope and geography", true);
  // org node + people
  h.node(s, "Organization", 0.6, 1.95, 2.2, "focal", 0.6);
  ["Users", "Teams", "Roles"].forEach((n, i) => {
    h.node(s, n, 0.6, 2.95 + i * 0.7, 2.2, "pill");
  });
  h.link(s, 1.7, 2.55, 1.7, 2.93, { arrow: false });
  // regions
  [["Region A", 3.6], ["Region B", 8.15]].forEach(([r, x]) => {
    s.addShape(T.roundRect, { x, y: 1.85, w: 4.4, h: 3.1, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Region " + r });
    s.addText(r.toUpperCase(), { x: x + 0.25, y: 1.98, w: 3, h: 0.3, fontSize: 11, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
    h.node(s, "CP: production", x + 0.25, 2.5, 1.9, "focal", 0.5);
    h.node(s, "CP: development", x + 0.25, 3.2, 1.9, "focal", 0.5);
    h.node(s, "Kong Identity directory", x + 2.35, 2.5, 1.8, "ai", 0.5);
    h.node(s, "Data plane nodes", x + 2.35, 3.2, 1.8, "pill", 0.5);
    if (r === "Region A") s.addText("one directory per region by default", { x: x + 0.25, y: 4.05, w: 3.9, h: 0.6, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
    else h.chip(s, "Same org, another region", x + 0.25, 4.15, 2.7, "line", 0.3);
  });
  h.link(s, 2.85, 2.25, 3.55, 2.25);
  // facts
  const facts = [
    "Teams and roles can be assigned to one region. They then reach only the Konnect objects in that region.",
    "A directory belongs to one region. One per region by default; ask Kong Support if you need more.",
    "The Konnect API host is regional: us.api.konghq.com, and so on. Keep control plane and directory in the same region.",
  ];
  facts.forEach((f, i) => {
    h.card(s, 0.6 + i * 4.1, 5.15, 3.95, 1.45, null, f, { dark: true, bodySize: 13, headGap: 0, fill: C.accent6 });
  });
  h.src(s, "", true);
  h.conceptual(s, true);
  h.notes(s, `
PRESENTER (3 min). Two ideas: the organization is the account boundary; regions are the geographic boundary.
ORGANIZATION (left): users, teams and roles live here. Everything in Section C is configured at this level.
REGIONS (right): control planes and the Kong Identity directory are regional. A data plane that needs a principal sends its lookup to the Konnect region that hosts its control plane — so control plane and directory should sit in the same region.
FACTS FROM THE DOCS: a Konnect organization can provision one directory per region by default. Teams and roles can be assigned to a geo, and then only see Konnect objects in that geo.
THE DEMO: you'll set KONNECT_REGION once and every script builds the right API hostname from it. If your org spans regions, say so now; it changes where a directory lives.
CAUTION: "Region A" and "Region B" are placeholders. I'm not listing the available regions here because they change; the Konnect geos page is the reference.
DIAGRAM NOTE: conceptual illustration, not a screenshot.`);
};
