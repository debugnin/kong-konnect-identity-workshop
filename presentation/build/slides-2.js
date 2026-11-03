// Section B: Navigating Kong Konnect
module.exports = function (pres, h) {
  const C = h.C, T = pres.ShapeType;
  const SEC = "B. Navigating Konnect";
  pres.addSection({ title: SEC });

  // ───────────── B divider ─────────────
  let s = pres.addSlide({ masterName: "KONG_SECTION", sectionTitle: SEC });
  s.addText("B", { x: 0.8, y: 1.9, w: 2.4, h: 2.8, fontSize: 160, bold: true, color: C.accent1, margin: 0, isTextBox: true, valign: "top" });
  s.addText("Navigating Kong Konnect", { placeholder: "title" });
  s.addText("20 minutes  ·  Concept, then a short live tour\nSix areas of the product, each through the same four questions.", { placeholder: "body" });
  h.notes(s, `
PRESENTER (30 sec). Transition: "Now the walk through the product. For each area I'll answer four questions: what is it, why does it matter, when would you use it, and what should you watch for. The diagrams are conceptual on purpose — I'm not going to show you screenshots that go stale. At the end we'll open the real UI together."`);

  // ───────────── B1 Org overview and settings ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Organization overview and settings", { placeholder: "title" });
  h.kicker(s, "B  ·  1 and 2  ·  Organization");
  // sidebar mock
  s.addShape(T.roundRect, { x: 0.6, y: 1.8, w: 2.6, h: 2.95, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" }, objectName: "Sidebar mock" });
  ["API Gateway", "Observability", "Dev Portal", "Catalog", "Identity", "Organization"].forEach((m, i) => {
    const hi = m === "Organization";
    if (hi) s.addShape(T.roundRect, { x: 0.75, y: 1.95 + i * 0.44, w: 2.3, h: 0.38, rectRadius: 0.19, fill: { color: C.accent1 }, line: { type: "none" } });
    s.addText(m.toUpperCase(), { x: 0.95, y: 1.95 + i * 0.44, w: 2.0, h: 0.38, fontSize: 11, bold: true, color: hi ? C.text1 : C.background1, charSpacing: 1, margin: 0, valign: "middle", isTextBox: true });
  });
  // organization panel
  s.addShape(T.roundRect, { x: 3.45, y: 1.8, w: 5.6, h: 2.95, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "Organization panel" });
  s.addText("ORGANIZATION", { x: 3.7, y: 1.95, w: 4, h: 0.28, fontSize: 11, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  [["Users", "Invite, assign teams"], ["Teams", "Predefined and custom"], ["Settings", "Authentication scheme · Team mappings"], ["Plan and usage", "Licence and request counts"], ["Audit logs", "Org and Dev Portal"]].forEach(([a, b], i) => {
    s.addShape(T.roundRect, { x: 3.7, y: 2.35 + i * 0.46, w: 5.1, h: 0.38, rectRadius: 0.06, fill: { color: C.background1 }, line: { type: "none" } });
    s.addText(a, { x: 3.85, y: 2.35 + i * 0.46, w: 1.6, h: 0.38, fontSize: 13, bold: true, color: C.text1, margin: 0, valign: "middle", isTextBox: true });
    s.addText(b, { x: 5.45, y: 2.35 + i * 0.46, w: 3.3, h: 0.38, fontSize: 12, color: C.text2, margin: 0, valign: "middle", isTextBox: true });
  });
  h.card(s, 9.3, 1.8, 3.43, 2.95, "One Owner", "Every org has exactly one Owner. Only the Owner can delete the organization. Org Admins manage everything else.", { bodySize: 14, tag: "Good to know", tagW: 1.5 });
  h.lens(s, "The org-wide home for users, teams, settings, plan and usage.", "Everything about who gets in is decided here.", "Onboarding, turning on SSO, audits, licence checks.", "Org-level SSO changes hit every user. Test with built-in login still on.");
  h.conceptual(s);
  h.src(s, "Sources: developer.konghq.com/konnect-platform/teams-and-roles/ · /konnect-platform/sso/");
  h.notes(s, `
PRESENTER (3 min). Conceptual diagram of the navigation, not a screenshot. The names come from the docs: the sidebar has API Gateway, Identity and Organization; under Organization you'll find Users, Teams, settings (Authentication Scheme and Team Mappings), and Plan and usage.
SAY: "If you remember one thing from this slide: org settings are org-wide. Turn on SSO here and it applies to everyone."
THE OWNER: every organization has exactly one Owner, who always has the Organization Admin role and is the only person who can delete the org. The docs note that an SSO-controlled account can be the Owner as long as it's an Organization Admin.
MANAGE USERS: you need to be in the Organization Admin team or hold the Identity Admin role.
LIVE TOUR (later): we'll click through Settings and Teams in the real UI. Don't open them now.`);

  // ───────────── B2 Control planes and Gateway Manager ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Control planes and Gateway Manager", { placeholder: "title" });
  h.kicker(s, "B  ·  3, 4, 5 and 6  ·  Control planes");
  const steps = [["Create", "A control plane in a region. Give it a name your team will recognise."], ["Pin a certificate", "Generate or upload the client certificate that data planes use to connect."], ["Run a data plane", "Start Kong Gateway with the cluster endpoints and certificate."], ["Config arrives", "The node appears in Gateway Manager and receives configuration."]];
  steps.forEach(([t, d], i) => {
    const x = 0.6 + i * 3.1;
    s.addShape(T.roundRect, { x, y: 1.85, w: 2.85, h: 1.95, rectRadius: 0.08, fill: { color: i === 3 ? C.text1 : C.accent5 }, line: { type: "none" }, objectName: "Step " + t });
    h.step(s, i + 1, x + 0.2, 2.02, i === 3);
    s.addText(t, { x: x + 0.75, y: 2.02, w: 2.0, h: 0.42, fontSize: 16, bold: true, color: i === 3 ? C.background1 : C.text1, margin: 0, valign: "middle", isTextBox: true });
    s.addText(d, { x: x + 0.2, y: 2.6, w: 2.5, h: 1.15, fontSize: 13, color: i === 3 ? C.background2 : C.text2, margin: 0, valign: "top", isTextBox: true });
    if (i < 3) h.link(s, x + 2.88, 2.82, x + 3.07, 2.82, { dark: false, solid: true });
  });
  s.addText("CONTROL PLANE TYPES YOU WILL SEE", { x: 0.6, y: 4.1, w: 5, h: 0.25, fontSize: 10, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  [["Hybrid (Gateway)", 2.1], ["Kubernetes Ingress Controller", 3.7], ["Control plane groups", 2.7]].forEach(([t, w], i, a) => {
    const x = 0.6 + a.slice(0, i).reduce((acc, [, ww]) => acc + ww + 0.15, 0);
    h.chip(s, t, x, 4.42, w, "bay", 0.32);
  });
  h.lens(s, "Where you create, list and delete control planes and see their nodes.", "A control plane is the unit of configuration and of access.", "New environment, team or region.", "Konnect-generated data plane certificates expire after ten years. Track renewal.");
  h.conceptual(s);
  h.src(s, "Sources: developer.konghq.com/gateway/cp-dp-communication/ · docs.konghq.com Konnect: renew data plane certificates");
  h.notes(s, `
PRESENTER (3 min). Four steps, and the demo does all four in script 01.
CREATE: a control plane lives in a region. Naming matters; teams will find it by name.
CERTIFICATE: data planes authenticate with a pinned certificate or one signed by your CA. The Konnect wizard can generate one; in the demo we generate it with openssl and pin it through the API.
RUN: start Kong Gateway as a data plane with the cluster endpoints Konnect gives you.
ARRIVES: the node shows up under the control plane's data plane nodes.
TYPES: besides the Gateway (hybrid) control plane there are Kubernetes Ingress Controller control planes and control plane groups. Groups combine several control planes; entity conflicts show up when you combine them.
WATCH: certificates Konnect generates expire after ten years. Put the renewal in a calendar now.
ROLES: the Creator role makes you Admin of the control plane you create. Control Plane Admin (a predefined team) can create and manage control planes.`);

  // ───────────── B3 Services, routes, plugins ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("Services, routes, plugins and policies", { placeholder: "title" });
  h.kicker(s, "B  ·  7 and 8  ·  Gateway entities", true);
  h.node(s, "Client", 0.6, 2.2, 1.5, "ai", 0.5);
  h.node(s, "Route", 2.8, 2.2, 1.5, "focal", 0.5);
  h.node(s, "Service", 5.0, 2.2, 1.5, "focal", 0.5);
  h.node(s, "Upstream", 7.2, 2.2, 1.5, "ai", 0.5);
  h.link(s, 2.15, 2.45, 2.75, 2.45); h.link(s, 4.35, 2.45, 4.95, 2.45); h.link(s, 6.55, 2.45, 7.15, 2.45);
  s.addText("how a request matches", { x: 2.5, y: 2.78, w: 2.1, h: 0.3, fontSize: 11, color: C.background2, align: "center", margin: 0, isTextBox: true });
  s.addText("what it forwards to", { x: 4.7, y: 2.78, w: 2.1, h: 0.3, fontSize: 11, color: C.background2, align: "center", margin: 0, isTextBox: true });
  s.addText("PLUGINS CAN BE SCOPED TO", { x: 9.2, y: 1.85, w: 3.5, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  ["Global", "Service", "Route", "Consumer", "Consumer group"].forEach((t, i) => h.node(s, t, 9.2, 2.2 + i * 0.52, 2.2, i === 4 ? "ai" : "pill", 0.4));
  h.card(s, 0.6, 3.3, 8.3, 1.45, null, { bullets: ["In the demo: service workshop-httpbin, route /anything.", "Two plugins sit on the service: OpenID Connect verifies the token; Datakit shows the gateway context.", "Rate limits attach to Consumer Groups in Demo 5."] }, { dark: true, bodySize: 14 });
  h.lens(s, "Service: the backend. Route: how requests reach it. Plugin: a policy.", "Plugins are where authentication, limits and transformation happen.", "Any time behaviour should differ by API, route or caller.", "Global plugins can only be changed by Plugin Admin, control plane Admin or Deployer.", true);
  h.conceptual(s, true);
  h.src(s, "Sources: developer.konghq.com/gateway/entities/ · /konnect-platform/teams-and-roles/ (plugin permissions)", true);
  h.notes(s, `
PRESENTER (3 min). The three entities every gateway has.
ROUTE decides whether a request belongs to an API. SERVICE says where it goes. PLUGINS attach behaviour.
SCOPES: a plugin can be global, or scoped to a service, route, consumer or consumer group. Keep "consumer group" in mind; Demo 5 uses it.
PERMISSIONS: scoped roles can only manage plugins on the entities they can manage. A plugin scoped to both a service and a route needs permission on both. Global plugins can only be created, edited or deleted by Plugin Admin, the control plane Admin role, or Deployer. That's the answer when someone asks "why can't my developer add this plugin?".
DEMO PREVIEW: the OpenID Connect plugin runs before Datakit; OIDC has a higher static priority, so no explicit ordering is required.`);

  // ───────────── B4 Consumers and Consumer Groups ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Consumers and Consumer Groups", { placeholder: "title" });
  h.kicker(s, "B  ·  9  ·  Who is calling");
  // groups with consumers
  [["Group: standard", 0.6, ["consumer-a", "consumer-b"]], ["Group: gold", 3.4, ["consumer-c"]]].forEach(([g, x, cs]) => {
    s.addShape(T.roundRect, { x, y: 1.85, w: 2.6, h: 2.8, rectRadius: 0.08, fill: { color: C.accent5 }, line: { color: C.text2, width: 1, dashType: "dash" }, objectName: g });
    s.addText(g.toUpperCase(), { x: x + 0.2, y: 1.97, w: 2.3, h: 0.28, fontSize: 10, bold: true, color: C.text2, charSpacing: 1.5, margin: 0, isTextBox: true });
    cs.forEach((c, i) => h.node(s, c, x + 0.25, 2.45 + i * 0.65, 2.1, "pill", 0.45));
  });
  s.addShape(T.roundRect, { x: 6.4, y: 2.2, w: 3.1, h: 1.0, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" } });
  s.addText([{ text: "rate-limiting-advanced", options: { bold: true, color: C.accent1, breakLine: true } }, { text: "scoped to a group", options: { color: C.background1 } }], { x: 6.6, y: 2.2, w: 2.8, h: 1.0, fontSize: 13, margin: 0, valign: "middle", isTextBox: true });
  h.link(s, 6.05, 2.7, 6.35, 2.7, { dark: false });
  h.card(s, 9.8, 1.85, 2.93, 2.8, "Limits to know", "Consumers are loaded into data plane memory and have control plane limits. That is the gap principals fill.", { bodySize: 13, tag: "From the docs", tagW: 1.5 });
  h.lens(s, "A Consumer is how the gateway knows an API client. Groups collect Consumers.", "Attach credentials, plugins and limits per client or per tier.", "Tiered plans, per-client limits, per-team policy.", "Large client populations hit Consumer limits and sit in data plane memory.");
  h.conceptual(s);
  h.src(s, "Sources: developer.konghq.com/identity/principals/ · docs.konghq.com Konnect: create consumer groups");
  h.notes(s, `
PRESENTER (3 min). Consumers are the gateway's classic answer to "who is calling".
CONSUMER: an entity in the control plane that represents an API client. Credentials and plugins attach to it.
CONSUMER GROUP: a set of Consumers. A plugin scoped to a group applies to every Consumer in it. The standard example is tiering: free, basic, premium, each with a different rate limit. Rate Limiting Advanced has a consumer-group scope.
THE LIMIT: the Kong Identity docs are explicit that Consumers are loaded into data plane memory and are subject to control plane resource limits, whereas principals are loaded on demand when they authenticate. That's one of four reasons principals exist; we'll cover all four in Section D.
KEEP IN MIND: in Demo 4 and Demo 5 we'll link a principal to a Consumer and to Consumer Groups. Both mechanisms rely on this slide.`);

  // ───────────── B5 Runtime, data plane status, analytics ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Data plane status, analytics and monitoring", { placeholder: "title" });
  h.kicker(s, "B  ·  10 and 11  ·  Runtime");
  // node table skeleton
  s.addShape(T.roundRect, { x: 0.6, y: 1.85, w: 6.4, h: 2.8, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" }, objectName: "Nodes panel" });
  s.addText("DATA PLANE NODES", { x: 0.85, y: 1.98, w: 4, h: 0.26, fontSize: 10, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  ["Node", "Version", "Labels", "State"].forEach((c, i) => s.addText(c, { x: 0.85 + [0, 1.7, 2.8, 5.0][i], y: 2.35, w: 1.6, h: 0.3, fontSize: 12, bold: true, color: C.text2, margin: 0, isTextBox: true }));
  [0, 1].forEach((r) => ["node-" + (r + 1), "3.16", "created-by:…", "connected"].forEach((c, i) => s.addText(c, { x: 0.85 + [0, 1.7, 2.8, 5.0][i], y: 2.75 + r * 0.5, w: 1.9, h: 0.4, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true })));
  s.addText("Illustrative rows.", { x: 0.85, y: 3.95, w: 4, h: 0.3, fontSize: 11, color: C.text2, margin: 0, isTextBox: true });
  // analytics side
  h.card(s, 7.25, 1.85, 2.65, 2.8, "Observability", "Real-time analytics on API health, performance and usage. Dashboards and reports.", { bodySize: 13 });
  h.card(s, 10.08, 1.85, 2.65, 2.8, "Debugger", "Trace a request through a data plane. There is a Datakit-specific debugger.", { bodySize: 13, fill: C.background2 });
  h.lens(s, "A live list of data plane nodes, plus analytics for the traffic they carry.", "First place to look when configuration does not seem to arrive.", "After a deploy, during an incident, before an upgrade.", "Node version versus feature: principal lookup needs 3.15, Datakit principals 3.16.");
  h.conceptual(s);
  h.src(s, "Sources: developer.konghq.com/konnect/ · developer.konghq.com/gateway/data-plane-reference/");
  h.notes(s, `
PRESENTER (3 min). Where to look when something is off.
NODES: under a control plane, the data plane nodes list shows each node that's connected. In the demo the node carries a label, created-by:identity-workshop, set through KONG_CLUSTER_DP_LABELS. (The rows in the sketch are illustrative, not real data.)
ANALYTICS: Konnect Observability is a real-time analytics platform covering API health, performance and usage. Dashboards and reports have their own roles — Viewer, Editor, Admin — so sharing is controlled.
DEBUGGER: the docs list a Konnect Debugger and a debugger for Datakit. If a Datakit workflow in the demo misbehaves, that's the next stop after the X-Datakit-Debug-Trace header.
THE VERSION CHECK: the first diagnostic for "principals don't work" is the node's Gateway version. Below 3.15 the plugin cannot do principal lookup.
SKIP: don't dwell on analytics screens here; the live tour covers them.`);

  // ───────────── B6 Deployment workflows ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("API configuration and deployment workflows", { placeholder: "title" });
  h.kicker(s, "B  ·  12  ·  Getting config in", true);
  [["Konnect UI", "Explore. One-off changes."], ["decK", "Declarative gateway config in files. Used in this demo."], ["Terraform", "Konnect itself as code: org, control planes, gateway."], ["kongctl", "Declarative, plan-based workflows."], ["Konnect API", "Anything scriptable. Kong Identity here."]].forEach(([t, d], i) => {
    const x = 0.6 + i * 2.45, w = 2.3;
    s.addShape(T.roundRect, { x, y: 1.85, w, h: 1.75, rectRadius: 0.08, fill: { color: i === 1 || i === 4 ? C.accent1 : C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Tool " + t });
    s.addText(t, { x: x + 0.2, y: 2.0, w: w - 0.4, h: 0.4, fontSize: 18, bold: true, color: i === 1 || i === 4 ? C.text1 : C.background1, margin: 0, isTextBox: true, valign: "top" });
    s.addText(d, { x: x + 0.2, y: 2.5, w: w - 0.4, h: 1.0, fontSize: 13, color: i === 1 || i === 4 ? C.text1 : C.background2, margin: 0, isTextBox: true, valign: "top" });
  });
  s.addText("A GITOPS FLOW", { x: 0.6, y: 3.95, w: 4, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  [["Git commit", 0.6], ["deck gateway diff", 3.0], ["Review", 5.4], ["deck gateway apply", 7.8], ["Data planes", 10.5]].forEach(([t, x], i, a) => {
    const w = i === 4 ? 2.2 : 2.0;
    h.node(s, t, x, 4.35, w, i === 3 ? "ai" : "pill", 0.5);
    if (i < a.length - 1) h.link(s, x + w + 0.04, 4.6, a[i + 1][1] - 0.04, 4.6);
  });
  s.addText([{ text: "apply vs sync  ", options: { bold: true, color: C.accent1 } }, { text: "deck gateway apply adds and updates what is in your file. deck gateway sync also deletes what is not. This workshop only ever uses apply.", options: { color: C.background1 } }], { x: 0.6, y: 5.35, w: 12.1, h: 0.9, fontSize: 15, margin: 0, valign: "top", isTextBox: true });
  h.src(s, "Sources: developer.konghq.com/konnect/ (tools to manage Konnect) · developer.konghq.com/deck/", true);
  h.notes(s, `
PRESENTER (3 min). Same control plane, five ways to drive it. The docs list them as tools to manage Konnect: kongctl, decK, Terraform, the Kubernetes Ingress Controller, and the Konnect APIs.
ADVICE: pick one source of truth per entity type. If decK owns your routes and someone edits them in the UI, the next sync will fight them.
THE DEMO: gateway entities go through decK (declarative, in the repo under kong/). Kong Identity is not part of decK state; it's driven through the Konnect API, which is why scripts 02 to 04 use curl.
APPLY VERSUS SYNC: apply is additive; sync makes the control plane match the file and deletes the rest. The scripts only use apply so a stray run can't remove a customer's configuration.
GITOPS: the diagram is the usual pattern: commit, diff in CI, human review, apply, data planes pick it up.
OPTIONAL: if the customer is Kubernetes-first, point to the Ingress Controller and Kong Operator material; same control plane, different authoring model.`);

  // ───────────── B7 Live UI tour ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: SEC });
  s.addText("Konnect UI tour: eight stops", { placeholder: "title" });
  h.kicker(s, "B  ·  Live", true);
  const stops = [
    ["Organization → Settings", "Authentication scheme, team mappings"],
    ["Organization → Users and Teams", "Predefined teams, a custom team"],
    ["Organization → Plan and usage", "Licence and request usage"],
    ["API Gateway", "The control plane list"],
    ["Control plane → Data plane nodes", "The demo node, its version and labels"],
    ["Control plane → Services, Routes, Plugins", "workshop-httpbin and its two plugins"],
    ["Control plane → Consumers", "Consumers and Consumer Groups"],
    ["Identity → Principals", "The directory and one principal"],
  ];
  stops.forEach(([a, b], i) => {
    const col = i < 4 ? 0 : 1, row = i % 4;
    const x = 0.6 + col * 6.15, y = 1.85 + row * 1.15;
    s.addShape(T.roundRect, { x, y, w: 5.95, h: 0.98, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Stop " + (i + 1) });
    h.step(s, i + 1, x + 0.2, y + 0.28, true);
    s.addText(a, { x: x + 0.8, y: y + 0.12, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true });
    s.addText(b, { x: x + 0.8, y: y + 0.54, w: 5.0, h: 0.34, fontSize: 13, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  s.addText("Run scripts 00 to 05 before this stop so there is something to see. Use a read-only account to show what a Viewer cannot change.", { x: 0.6, y: 6.5, w: 12.1, h: 0.4, fontSize: 12, color: C.accent2, margin: 0, isTextBox: true });
  h.notes(s, `
PRESENTER (5 min, live). Open Konnect in a browser. This is a guided click-through; keep each stop to 30 seconds.
BEFORE THE SESSION: run scripts 00 to 05 so the control plane, data plane node, service, route and plugins exist, and the Identity section has a directory and a principal. Have a second browser profile signed in as a read-only user if you want to show what's disabled for a Viewer.
ORDER: org first (settings, users and teams, usage), then the gateway (control plane list, nodes, entities, consumers), then Identity.
WHAT TO POINT AT: the Authentication scheme and Team Mappings sections (Section C relies on them); the data plane node's version (matters for principals); the two plugins on workshop-httpbin; the principal in Identity with its identities and metadata.
IF THE UI CHANGED: that's fine — say so. The labels on this slide come from the docs and may have moved. Nothing in the demo depends on them.`);
};
