// Section D: Introduction to Kong Identity
module.exports = function (pres, h) {
  const C = h.C, T = pres.ShapeType;
  const SEC = "D. Kong Identity";
  pres.addSection({ title: SEC });

  // ───────────── D divider ─────────────
  let s = pres.addSlide({ masterName: "KONG_SECTION", sectionTitle: SEC });
  s.addText("D", { x: 0.8, y: 1.9, w: 2.4, h: 2.8, fontSize: 160, bold: true, color: C.accent1, margin: 0, isTextBox: true, valign: "top" });
  s.addText("Introduction to Kong Identity", { placeholder: "title" });
  s.addText("15 minutes  ·  Concept\nDirectories, principals, identities and metadata, and how the gateway uses them.", { placeholder: "body" });
  h.notes(s, `
PRESENTER (30 sec). Transition: "This is the part the demo is built around. Four nouns: directory, principal, identity, metadata. Then two verbs: authenticate and hydrate."`);

  // ───────────── D1 Why principals ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Why principals when you have Consumers", { placeholder: "title" });
  h.kicker(s, "D  ·  The problem it solves");
  const hd = (t) => ({ text: t, options: { bold: true, color: C.accent1, fill: { color: C.text1 }, fontSize: 14 } });
  const c = (t, o = {}) => ({ text: t, options: { fontSize: 14, color: C.text1, valign: "middle", ...o } });
  s.addTable([
    [hd("Pain point"), hd("Consumers"), hd("Principals")],
    [c("Scale", { bold: true }), c("Loaded into data plane memory. Subject to control plane limits."), c("Loaded on demand, when they authenticate.")],
    [c("Several gateways", { bold: true }), c("The same entity must be replicated to each one."), c("One principal in one directory. Any gateway in the region can look it up.")],
    [c("Several Kong products", { bold: true }), c("Consumers and Dev Portal applications model the same client two ways."), c("One model across Gateway, Event Gateway and Dev Portal.")],
    [c("Per-client attributes", { bold: true }), c("No metadata. Teams resort to custom plugins or header tricks."), c("Metadata is native and available to the gateway at request time.")],
  ], { x: 0.6, y: 1.8, w: 12.1, colW: [2.4, 4.9, 4.8], rowH: 0.8, border: { type: "solid", color: C.background2, pt: 1 }, fill: { color: C.background1 }, margin: [0.05, 0.15, 0.05, 0.15], objectName: "Consumers vs principals" });
  s.addShape(T.roundRect, { x: 0.6, y: 6.0, w: 12.13, h: 0.55, rectRadius: 0.08, fill: { color: C.accent1 }, line: { type: "none" } });
  s.addText("Principals do not replace Consumers overnight. You can link a principal to a Consumer and migrate gradually.", { x: 0.9, y: 6.0, w: 11.6, h: 0.55, fontSize: 14, bold: true, color: C.text1, margin: 0, valign: "middle", isTextBox: true });
  h.src(s, "");
  h.notes(s, `
PRESENTER (3 min). This table is straight from the "when to use principals instead of Consumers" section of the Kong Identity docs. Read the rows aloud and ask which one hurts.
SCALE: Consumers sit in data plane memory and hit control plane limits. Principals are fetched when they authenticate, then cached.
SEVERAL GATEWAYS: with Consumers the same entity has to be replicated to every gateway. A principal lives in one directory and can be referenced from any gateway in the same region.
SEVERAL PRODUCTS: Gateway has Consumers, Dev Portal has applications. Principals give one model.
METADATA: Consumers don't carry metadata, which pushes people to custom plugins or header injection to get per-client rate limits or conditional behaviour. Principals carry metadata natively.
HONEST CAVEAT: the first lookup of a credential adds latency because the data plane asks Konnect; later lookups are cached. Section D3 covers it.
BOTTOM LINE: this is a migration story, not a rip-and-replace one. Demo 4 shows the bridge.`);

  // ───────────── D2 Core concepts ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("The five nouns", { placeholder: "title" });
  h.kicker(s, "D  ·  Core concepts", true);
  const nouns = [
    ["Directory", "A regional collection of principals. One per region by default."],
    ["Principal", "An external client, workload or human that authenticates to a Kong gateway."],
    ["Credential", "A secret the principal presents: an API key, or a username and password. Checked at the gateway."],
    ["Identity", "An external identifier that links a principal to an IdP or to another Kong entity."],
    ["Metadata", "Key and value pairs on the principal. They drive policy and gateway behaviour."],
  ];
  nouns.forEach(([t, d], i) => {
    const w = 2.28, g = 0.18, x = 0.6 + i * (w + g);
    s.addShape(T.roundRect, { x, y: 1.85, w, h: 3.0, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: i === 3 || i === 4 ? C.accent1 : C.accent4, width: 1 }, objectName: "Noun " + t });
    s.addText(String(i + 1).padStart(2, "0"), { x: x + 0.2, y: 2.0, w: 1, h: 0.4, fontSize: 20, bold: true, color: C.accent1, margin: 0, isTextBox: true });
    s.addText(t, { x: x + 0.2, y: 2.55, w: w - 0.4, h: 0.45, fontSize: 20, bold: true, color: C.background1, margin: 0, isTextBox: true, valign: "top" });
    s.addText(d, { x: x + 0.2, y: 3.15, w: w - 0.4, h: 1.9, fontSize: 14, color: C.background2, margin: 0, isTextBox: true, valign: "top" });
  });
  s.addShape(T.roundRect, { x: 0.6, y: 5.15, w: 12.13, h: 1.2, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 } });
  s.addText([{ text: "In today's demo  ", options: { bold: true, color: C.accent1 } }, { text: "we use identities and metadata. Credentials are the other way in, where Kong Identity holds the secret itself. Not a principal: a Konnect user or a Dev Portal developer.", options: { color: C.background1 } }], { x: 0.9, y: 5.15, w: 11.6, h: 1.2, fontSize: 15, margin: 0, valign: "middle", isTextBox: true });
  h.src(s, "Source: developer.konghq.com/identity/principals/", true);
  h.notes(s, `
PRESENTER (4 min). Go left to right and keep the definitions crisp. These are the wording from the brief and the docs.
DIRECTORY: a regional collection of principals. Each Konnect organization can provision one per region by default.
PRINCIPAL: represents an external client, workload or human authenticating to a Kong Gateway. Not a Konnect user, not a Dev Portal developer.
CREDENTIAL: a secret the principal presents at authentication time: a username and password (up to two passwords per username, for rotation) or an API key. Konnect stores one-way salted hashes, not the secrets, so it can verify but can't retrieve them.
IDENTITY: how another system recognises the principal. It's used either to look the principal up after authentication happened elsewhere, or to link it to an entity in another Kong product.
METADATA: key and value pairs. The gateway makes them available in the request context. A Request Termination plugin could, for example, block only when principal.metadata.business_unit equals payments.
SAY: "The two lime cards are the ones the demo uses."`);

  // ───────────── D3 Anatomy of a principal ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Anatomy of a principal", { placeholder: "title" });
  h.kicker(s, "D  ·  Identity types");
  s.addShape(T.roundRect, { x: 0.6, y: 1.8, w: 3.4, h: 2.3, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" }, objectName: "Principal" });
  s.addText("PRINCIPAL", { x: 0.85, y: 1.95, w: 2.9, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("workshop-demo-client", { x: 0.85, y: 2.3, w: 3.0, h: 0.4, fontSize: 16, bold: true, color: C.background1, margin: 0, isTextBox: true });
  s.addText("display_name\ndescription\nid (UUID)", { x: 0.85, y: 2.8, w: 3.0, h: 1.2, fontSize: 13, fontFace: "Courier New", color: C.background2, margin: 0, valign: "top", isTextBox: true });
  [["Credentials", "api key · username + password", 1.8], ["Identities", "how others recognise it", 2.55], ["Metadata", "business_unit, tier, consumer_groups…", 3.3]].forEach(([t, d, y], i) => {
    s.addShape(T.roundRect, { x: 4.6, y: y - 0.05, w: 3.2, h: 0.62, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" } });
    s.addText([{ text: t, options: { bold: true, breakLine: true, fontSize: 14, color: C.text1 } }, { text: d, options: { fontSize: 11, color: C.text2 } }], { x: 4.8, y: y - 0.05, w: 2.9, h: 0.62, margin: 0, valign: "middle", isTextBox: true });
    h.link(s, 4.05, 2.95, 4.55, y + 0.25, { dark: false, solid: true, arrow: false });
  });
  // identity types table
  const th = (t) => ({ text: t, options: { bold: true, color: C.accent1, fill: { color: C.text1 }, fontSize: 11 } });
  const tc = (t, o = {}) => ({ text: t, options: { fontSize: 11, color: C.text1, valign: "middle", ...o } });
  s.addTable([
    [th("Identity type"), th("Use it to")],
    [tc("oidc", { fontFace: "Courier New" }), tc("Match an external IdP token by issuer plus a claim (usually sub).")],
    [tc("auth_server_client", { fontFace: "Courier New" }), tc("Match a client of a Kong Identity auth server.")],
    [tc("control_plane_consumer", { fontFace: "Courier New" }), tc("Link to a Consumer in one control plane.")],
    [tc("custom", { fontFace: "Courier New" }), tc("Match any external key and value.")],
  ], { x: 8.0, y: 1.75, w: 4.73, colW: [2.2, 2.53], rowH: 0.5, border: { type: "solid", color: C.background2, pt: 1 }, fill: { color: C.background1 }, margin: [0.04, 0.08, 0.04, 0.08], objectName: "Identity types" });
  s.addShape(T.roundRect, { x: 0.6, y: 4.75, w: 12.13, h: 1.75, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" } });
  s.addText([
    { text: "One principal, many identities. ", options: { bold: true, breakLine: false } },
    { text: "A principal can hold several identities, even of the same type: two OAuth servers, an API key, a username and password, a linked Consumer.", options: { breakLine: true } },
    { text: "Consumer Groups are not an identity type. ", options: { bold: true } },
    { text: "They are mapped through the reserved metadata key consumer_groups. We come back to this.", options: { breakLine: true } },
    { text: "Matching is exact. ", options: { bold: true } },
    { text: "An oidc identity must equal the token's issuer and claim character for character. Issuer and claim pairs are unique within a directory.", options: {} },
  ], { x: 0.9, y: 4.75, w: 11.6, h: 1.75, fontSize: 13, color: C.text1, margin: 0, valign: "middle", isTextBox: true, paraSpaceAfter: 6 });
  h.src(s, "Source: developer.konghq.com/identity/principals/");
  h.notes(s, `
PRESENTER (3 min). A principal always carries some combination of credentials, identities and metadata.
LEFT: the principal itself has a display name, a description and an ID.
TABLE: the four identity types and their API values: oidc, auth_server_client, control_plane_consumer and custom. oidc is "find the principal from an external IdP token by issuer plus a claim". auth_server_client does the same for Kong Identity's own auth servers. control_plane_consumer links to a Consumer in a specific control plane. custom is a free key and value, for example a SASL username for Event Gateway.
THE POINT OF THE BOTTOM PANEL: three sentences to land. One principal can carry many identities. Consumer Groups are NOT an identity; that's metadata. And matching is exact.
LIMITS (mention only if asked): up to 10 identities and 50 metadata keys per principal.
FOR THE BRIEF: the "principal identities" and "principal metadata" asks are both on this slide.`);

  // ───────────── D4 Authenticate vs hydrate ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("Authenticate or hydrate", { placeholder: "title" });
  h.kicker(s, "D  ·  Two ways the gateway uses a principal", true);
  // lane 1
  s.addShape(T.roundRect, { x: 0.6, y: 1.8, w: 12.13, h: 2.1, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
  h.chip(s, "Authenticate", 0.85, 1.95, 1.7, "lime", 0.3);
  s.addText("Kong Identity holds the secret", { x: 2.75, y: 1.95, w: 5, h: 0.3, fontSize: 14, bold: true, color: C.background1, margin: 0, valign: "middle", isTextBox: true });
  [["Client sends API key or password", 0.85], ["Auth plugin checks the directory", 4.95], ["Principal and metadata in context", 9.05]].forEach(([t, x], i, a) => {
    h.node(s, t, x, 2.7, 3.55, i === 2 ? "focal" : "pill", 0.6);
    if (i < 2) h.link(s, x + 3.59, 3.0, a[i + 1][1] - 0.04, 3.0);
  });
  s.addText("Key Auth and Basic Auth plugins, with a principals directory configured", { x: 0.85, y: 3.4, w: 11, h: 0.3, fontSize: 12, color: C.background2, margin: 0, isTextBox: true });
  // lane 2
  s.addShape(T.roundRect, { x: 0.6, y: 4.1, w: 12.13, h: 2.35, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 } });
  h.chip(s, "Hydrate", 0.85, 4.25, 1.4, "lime", 0.3);
  s.addText("An IdP already authenticated the client. This is the demo.", { x: 2.45, y: 4.25, w: 8, h: 0.3, fontSize: 14, bold: true, color: C.background1, margin: 0, valign: "middle", isTextBox: true });
  [["Client sends an OIDC token", 0.85], ["OIDC plugin verifies it", 3.75], ["Gateway looks up iss + claim", 6.65], ["Principal and metadata in context", 9.75]].forEach(([t, x], i, a) => {
    h.node(s, t, x, 5.0, 2.6, i === 3 ? "focal" : "pill", 0.6);
    if (i < 3) h.link(s, x + 2.64, 5.3, a[i + 1][1] - 0.04, 5.3);
  });
  s.addText("The IdP proves who the caller is. Kong Identity adds what you know about them.", { x: 0.85, y: 5.75, w: 11, h: 0.5, fontSize: 12, color: C.background2, margin: 0, isTextBox: true });
  h.src(s, "Source: developer.konghq.com/identity/principals/ (when to use principals)", true);
  h.notes(s, `
PRESENTER (4 min). The distinction the brief asks us to make explicit.
AUTHENTICATE (top lane): Kong Identity holds the secret. The client sends an API key or a username and password, an authentication plugin (Key Auth or Basic Auth, with a principals directory set) checks it against the directory, and the principal with its metadata ends up in the request context. Kong Identity IS the authentication system.
HYDRATE (bottom lane): somebody else already authenticated the client. In the demo, Keycloak issued an OAuth token. The OpenID Connect plugin verifies the token's signature, issuer, audience and expiry. Only then does the gateway ask Kong Identity "who is iss + sub?" and receive the principal and its metadata. Kong Identity doesn't authenticate anything here; it adds context.
SAY: "Same destination, different journey. In the first, Kong Identity decides who you are. In the second, your IdP decides, and Kong Identity tells the gateway what it knows about you."
WHY IT MATTERS: with hydration you can adopt Kong Identity without moving a single client credential. That's what makes the migration gradual.
IMPLEMENTATION DETAIL: with the OIDC plugin, principals.enabled turns hydration on and principals.directory names the directory.`);

  // ───────────── D5 Pipeline architecture ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("From IdP token to gateway policy", { placeholder: "title" });
  h.kicker(s, "D  ·  Architecture", true);
  const r1 = [["External IdP", "Keycloak in the demo. Issues the token.", "ai"], ["Kong Gateway", "Receives the request with the bearer token.", "lime"], ["OpenID Connect plugin", "Verifies signature, issuer, audience, expiry.", "focal"], ["Kong Identity", "Konnect service. Called over mTLS.", "ai"], ["Directory", "Regional. Holds the principals.", "focal"]];
  const r2 = [["Principal", "Matched by issuer + claim.", "focal"], ["Principal metadata", "Returned with the principal.", "focal"], ["Consumer / Groups", "Mapped Consumer, plus groups from metadata.", "ai"], ["Gateway policies", "Plugins scoped to the Consumer or group.", "focal"]];
  const nw = 2.1, ng = 0.4;
  r1.forEach(([t, d, k], i) => {
    const x = 0.6 + i * (nw + ng);
    h.node(s, t, x, 1.95, nw, k, 0.6);
    s.addText(d, { x, y: 2.7, w: nw, h: 0.75, fontSize: 12, color: C.background2, align: "center", margin: 0, valign: "top", isTextBox: true });
    if (i < r1.length - 1) h.link(s, x + nw + 0.04, 2.25, x + nw + ng - 0.04, 2.25);
  });
  s.addText("OIDC token", { x: 0.6 + nw - 0.1, y: 1.65, w: 1.0, h: 0.25, fontSize: 10, bold: true, color: C.accent1, margin: 0, isTextBox: true });
  // wrap connector: from last of row 1 down to start of row 2
  const rx = 0.6 + 4 * (nw + ng) + nw + 0.12;
  h.link(s, rx - 0.12, 2.25, rx, 2.25, { arrow: false });
  h.link(s, rx, 2.25, rx, 3.78, { arrow: false });
  h.link(s, rx, 3.78, 0.6 + nw / 2, 3.78, { arrow: false });
  h.link(s, 0.6 + nw / 2, 3.78, 0.6 + nw / 2, 3.98);
  r2.forEach(([t, d, k], i) => {
    const x = 0.6 + i * (nw + ng + 0.55);
    h.node(s, t, x, 4.05, nw + 0.2, k, 0.6);
    s.addText(d, { x, y: 4.8, w: nw + 0.2, h: 0.8, fontSize: 12, color: C.background2, align: "center", margin: 0, valign: "top", isTextBox: true });
    if (i < r2.length - 1) h.link(s, x + nw + 0.24, 4.35, x + nw + ng + 0.55 - 0.04, 4.35);
  });
  s.addShape(T.roundRect, { x: 0.6, y: 5.75, w: 12.13, h: 0.78, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 } });
  s.addText("Everything after “Kong Identity” happens inside Konnect and the gateway request context. The client never talks to Kong Identity directly.", { x: 0.9, y: 5.75, w: 11.6, h: 0.78, fontSize: 14, color: C.background1, margin: 0, valign: "middle", isTextBox: true });
  h.src(s, "", true);
  h.notes(s, `
PRESENTER (4 min). This is the architecture diagram from the brief, laid out left to right.
TOP ROW: Your external IdP issues a token (Keycloak in the demo). The client sends it to Kong Gateway. The OpenID Connect plugin verifies it. If principals are enabled, the gateway calls Kong Identity, which looks in the directory.
BOTTOM ROW: the directory returns the principal that matches issuer plus claim, along with its metadata. If the principal has a control_plane_consumer identity, the mapped Consumer is loaded into the request context. If its metadata has consumer_groups, those groups are loaded too. Plugins scoped to that Consumer or those groups then apply.
SECURITY NOTES FROM THE DOCS: lookups go from the data plane to Konnect over mutual TLS, using the same certificates the data plane uses for the control plane. What comes back is the principal's UUID, display name and metadata. Credentials are stored as one-way salted hashes and never returned.
KEY POINT: the client never talks to Kong Identity. Only the gateway does.
LATENCY: the first lookup for a given identity adds a round trip to the Konnect region; after that, the gateway caches.`);

  // ───────────── D6 Mapping to Consumers and Groups ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Mapping principals to Consumers and groups", { placeholder: "title" });
  h.kicker(s, "D  ·  Bridging to existing gateway config");
  // center principal
  s.addShape(T.roundRect, { x: 4.9, y: 2.3, w: 3.5, h: 1.5, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" }, objectName: "Principal centre" });
  s.addText([{ text: "PRINCIPAL", options: { bold: true, color: C.accent1, fontSize: 10, charSpacing: 2, breakLine: true } }, { text: "workshop-demo-client", options: { bold: true, color: C.background1, fontSize: 16 } }], { x: 5.1, y: 2.3, w: 3.1, h: 1.5, margin: 0, valign: "middle", isTextBox: true });
  // left
  s.addShape(T.roundRect, { x: 0.6, y: 1.85, w: 3.7, h: 2.4, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" } });
  h.chip(s, "Identity", 0.85, 2.05, 1.2, "dark", 0.28);
  s.addText("control_plane_consumer", { x: 0.85, y: 2.45, w: 3.3, h: 0.35, fontSize: 14, bold: true, fontFace: "Courier New", color: C.text1, margin: 0, isTextBox: true });
  s.addText("Links to one Consumer in one control plane. That Consumer's plugins and groups apply to the principal's traffic.", { x: 0.85, y: 2.95, w: 3.3, h: 1.2, fontSize: 13, color: C.text2, margin: 0, valign: "top", isTextBox: true });
  // right
  s.addShape(T.roundRect, { x: 9.0, y: 1.85, w: 3.73, h: 2.4, rectRadius: 0.08, fill: { color: C.accent1 }, line: { type: "none" } });
  h.chip(s, "Metadata", 9.25, 2.05, 1.3, "dark", 0.28);
  s.addText("consumer_groups", { x: 9.25, y: 2.45, w: 3.3, h: 0.35, fontSize: 14, bold: true, fontFace: "Courier New", color: C.text1, margin: 0, isTextBox: true });
  s.addText("A reserved key. Its value is a list of Consumer Group UUIDs. A principal can be in many groups, and a group can hold many principals.", { x: 9.25, y: 2.95, w: 3.3, h: 1.2, fontSize: 13, color: C.text1, margin: 0, valign: "top", isTextBox: true });
  h.link(s, 4.35, 3.05, 4.85, 3.05, { dark: false, solid: true, arrow: false });
  h.link(s, 8.45, 3.05, 8.95, 3.05, { dark: false, solid: true, arrow: false });
  // rules
  [["One Consumer per control plane", "At most one Consumer per control plane per principal. Different control planes can each have one."], ["Union of groups", "If the mapped Consumer is in groups C and D and the metadata lists A and B, all four load into the request."], ["Same control plane", "Only groups defined in the gateway's own control plane are loaded. Plugins and groups must share one."]].forEach(([t, d], i) => {
    h.card(s, 0.6 + i * 4.1, 4.5, 3.95, 1.95, t, d, { bodySize: 13, headSize: 16, headGap: 0.45 });
  });
  h.src(s, "Source: developer.konghq.com/identity/principals/ (principal entity mapping; link a principal to Consumer Groups)");
  h.notes(s, `
PRESENTER (3 min). The two bridges back into the Gateway you already run. Read this slide carefully: the second bridge is not what people expect.
BRIDGE 1, CONSUMER: add an identity of type control_plane_consumer to the principal, naming the control plane and the Consumer. When the OpenID Connect plugin hydrates the principal, the mapped Consumer is loaded into the request context just as if the Consumer had authenticated directly. Existing Consumer-scoped plugins keep working, which is what makes migration gradual.
BRIDGE 2, GROUPS: set the reserved metadata key consumer_groups to a list of Consumer Group UUIDs. It is not an identity type. A group can map to many principals and a principal to many groups.
RULES: at most one Consumer per control plane per principal. If the principal is mapped to a Consumer that belongs to its own groups, the gateway loads the union of both sets. Only groups from the gateway's own control plane are loaded, and groups must be in the same control plane and workspace as the plugin.
COMMON ERROR: people try to add groups through the identities resource. That's the "invented identity type" the brief warns about. It must be metadata.
DEMOS: Demo 4 does the left side. Demo 5 does the right side.`);

  // ───────────── D7 Numbers and behaviours ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("Limits and behaviour to design around", { placeholder: "title" });
  h.kicker(s, "D  ·  Know before you size it", true);
  [["1", "directory per region", "Contact Kong Support for more."], ["100,000", "principals per directory", "Default limit; Support can raise it."], ["100", "uncached lookups per second", "Per directory. Cached lookups do not count."], ["10 min", "default lookup cache", "Smallest of directory TTL, credential TTL and db_cache_ttl."]].forEach(([n, l, d], i) => {
    const x = 0.6 + i * 3.06;
    s.addShape(T.roundRect, { x, y: 1.85, w: 2.95, h: 2.35, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Stat " + l });
    s.addText(n, { x: x + 0.2, y: 1.95, w: 2.55, h: 0.9, fontSize: n.length > 5 ? 34 : 44, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true });
    s.addText(l, { x: x + 0.2, y: 2.8, w: 2.55, h: 0.55, fontSize: 14, bold: true, color: C.background1, margin: 0, valign: "top", isTextBox: true });
    s.addText(d, { x: x + 0.2, y: 3.42, w: 2.55, h: 0.7, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  });
  [["First lookup is slower", "The data plane asks Konnect, in the region that hosts the control plane. After that it serves from cache."], ["A miss is a choice", "Verified token, no principal: 401 by default. Set principals.error_on_miss to false and the request continues with no principal."], ["Metadata can gate plugins", "Conditional plugin execution reads principal.metadata. For example: principal.metadata.tier == \"gold\"."]].forEach(([t, d], i) => {
    h.card(s, 0.6 + i * 4.1, 4.45, 3.95, 2.05, t, d, { dark: true, bodySize: 13, headSize: 16, headGap: 0.45 });
  });
  h.src(s, "Source: developer.konghq.com/identity/principals/ (principal limitations, FAQs) · how-to: configure-oidc-datakit-host-routing-with-principals-metadata", true);
  h.notes(s, `
PRESENTER (3 min). Numbers first, then three behaviours.
NUMBERS (defaults from the docs): one directory per region (ask Support for more); 100,000 principals per directory; a limit of 100 authentication or lookup requests per second per directory, not counting cached ones; and a default 10-minute lookup cache. Other limits if asked: 10 identities per principal, 5 of each credential type, 50 metadata keys, 2 passwords per username.
CACHE: the effective lifetime is the smallest of the directory TTL (10 minutes by default), the credential's TTL, and the gateway's cache configuration (db_cache_ttl). The demo sets db_cache_ttl to 30 seconds so a metadata change shows up quickly. Do not copy that setting into production without thinking about lookup volume.
FIRST LOOKUP: the first time a data plane sees a credential it calls Konnect. That adds latency that varies with network conditions. Later requests are served from cache.
A MISS IS A CHOICE: by default the OpenID Connect plugin returns 401 when it verifies a token but can't match a principal. Set principals.error_on_miss to false to let the request through with no principal; then plugins that read the principal must handle null. Test B shows both.
METADATA GATING: the only way to scope plugins to a principal is conditional plugin execution on its metadata, using fields like principal.id, principal.display_name and principal.metadata.*.
SIZING TIP: if the customer has more than 100 authentications per second that miss the cache, talk to Kong Support before they go live.`);
};
