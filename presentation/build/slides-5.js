// Live demo, wrap-up and appendix
module.exports = function (pres, h) {
  const C = h.C, T = pres.ShapeType;
  const DEMO = "Live demo";
  let th, tc, hd, c;

  // ───────────── Demo divider ─────────────
  pres.addSection({ title: DEMO });
  let s = pres.addSlide({ masterName: "KONG_SECTION", sectionTitle: DEMO });
  s.addText("5", { x: 0.8, y: 1.9, w: 2.4, h: 2.8, fontSize: 160, bold: true, color: C.accent1, margin: 0, isTextBox: true, valign: "top" });
  s.addText("Live demo: token to policy", { placeholder: "title" });
  s.addText("30 minutes  ·  Hands-on\nFive demos, one request path. Every step is a script in the repo, so you can rerun all of it.", { placeholder: "body" });
  h.notes(s, `
PRESENTER (30 sec). BEFORE YOU START: scripts 00 to 05 should already have run so the only thing you do live is the interesting part. If you prefer to start from zero, allow an extra five minutes for script 01 (the data plane needs to connect to Konnect).
RUN ORDER, with the demo numbers: 1 Read the token (01b), 2 Provision Kong Identity (02, 03, 04), 3 Gateway tests (05, 10 basic), 4 Consumer link (06, 07, 10 consumer), 5 Consumer Groups (08, 09, 10 groups).
Note the brief numbers the Keycloak scenario second; we run it first because the principal's OIDC identity needs the issuer and subject from a real token.
IF SOMETHING BREAKS: docs/troubleshooting.md has the eight most likely failures. Say what you see. Customers trust a presenter who debugs calmly.`);

  // ───────────── Demo setup ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo setup: what is staged", { placeholder: "title" });
  h.kicker(s, "Demo  ·  Environment", true);
  // diagram
  s.addShape(T.roundRect, { x: 0.6, y: 1.85, w: 6.2, h: 3.2, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 }, objectName: "Local zone" });
  s.addText("LOCAL  ·  DOCKER COMPOSE", { x: 0.85, y: 1.98, w: 5, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  h.node(s, "Client (curl)", 0.85, 2.45, 1.75, "ai", 0.46);
  h.node(s, "Keycloak", 3.2, 2.45, 1.75, "focal", 0.46);
  h.node(s, "Kong data plane 3.16", 0.85, 3.55, 2.4, "lime", 0.5);
  h.node(s, "httpbin", 4.2, 3.55, 1.75, "pill", 0.5);
  h.link(s, 2.65, 2.68, 3.15, 2.68);
  h.link(s, 1.7, 2.95, 1.7, 3.5);
  h.link(s, 3.3, 3.8, 4.15, 3.8);
  s.addText("token", { x: 2.5, y: 2.2, w: 0.8, h: 0.22, fontSize: 10, color: C.background2, margin: 0, isTextBox: true });
  s.addText("Bearer", { x: 1.78, y: 3.1, w: 0.9, h: 0.22, fontSize: 10, color: C.background2, margin: 0, isTextBox: true });
  s.addText("verifies the token against Keycloak's keys", { x: 0.85, y: 4.3, w: 5.3, h: 0.5, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  s.addShape(T.roundRect, { x: 7.05, y: 1.85, w: 2.45, h: 3.2, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 }, objectName: "Konnect zone" });
  s.addText("KONNECT SAAS", { x: 7.25, y: 1.98, w: 2.1, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  h.node(s, "Control plane", 7.25, 2.45, 2.05, "focal", 0.46);
  h.node(s, "Kong Identity", 7.25, 3.2, 2.05, "ai", 0.46);
  s.addText("directory, principal, identities, metadata", { x: 7.25, y: 3.8, w: 2.05, h: 0.9, fontSize: 11, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  h.link(s, 6.0, 3.8, 7.2, 2.7, { dot: true, width: 1 });
  // ownership table
  th = (t, hi) => ({ text: t, options: { bold: true, color: C.text1, fill: { color: hi ? C.accent1 : C.background2 }, fontSize: 12, valign: "middle" } });
  tc = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.background1, fill: { color: C.accent6 }, valign: "middle", ...o } });
  s.addTable([
    [th("YOURS", true)],
    [tc("KONNECT_TOKEN")],
    [tc("KONNECT_REGION")],
    [th("STAGED FOR YOU")],
    [tc("Keycloak realm and two clients")],
    [tc("httpbin upstream")],
    [tc("Gateway image and names")],
    [tc("Demo secrets, generated")],
  ], { x: 9.75, y: 1.85, w: 2.98, colW: [2.98], rowH: 0.42, border: { type: "solid", color: C.accent4, pt: 1 }, margin: [0.03, 0.1, 0.03, 0.1], objectName: "Ownership" });
  s.addShape(T.roundRect, { x: 0.6, y: 5.3, w: 12.13, h: 1.2, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 } });
  s.addText([
    { text: "Scripts 00 and 01  ", options: { bold: true, color: C.accent1 } }, { text: "check your tools and token, start Keycloak and httpbin, create the control plane, pin a certificate and start the data plane. Re-runnable. Nothing secret is written outside .generated/.", options: { color: C.background1 } },
  ], { x: 0.9, y: 5.3, w: 11.6, h: 1.2, fontSize: 15, margin: 0, valign: "middle", isTextBox: true });
  h.notes(s, `
PRESENTER (2 min). What's real and what's local.
LEFT, LOCAL: Docker Compose runs Keycloak (the external IdP), httpbin (the upstream, which echoes the headers it receives), and one Kong Gateway 3.16 data plane. A curl client calls Keycloak for a token and then the gateway.
RIGHT, KONNECT: the control plane and Kong Identity are Konnect SaaS. They need internet and your account. The data plane reaches them over mutual TLS.
OWNERSHIP: two values are yours, the token and the region. Everything else is a staged default with a safe name. Secrets (the Keycloak client secrets, the Keycloak admin password, the decK token salt) are generated into .generated/state.env, which is git-ignored.
SAY: "If you want to rerun this later, the only thing you need to supply is your own Konnect token."
HONESTY: the first run needs the data plane to download an image and connect; if it's slow, fill the gap with Section D's limits slide.`);

  // ───────────── Demo 1: read the token ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 1: read the token", { placeholder: "title" });
  h.kicker(s, "Demo 1  ·  script 01b", true);
  h.code(s, `$ ./scripts/01b-inspect-keycloak-token.sh

POST /realms/kong-workshop/protocol/openid-connect/token
  grant_type=client_credentials
  client_id=workshop-demo-client
  client_secret=****

{
  ⟦"iss": "http://keycloak:8080/realms/kong-workshop",⟧
  ⟦"sub": "<service-account user id>",⟧
  ⟦"aud": ["kong-workshop-api"],⟧
  "azp": "workshop-demo-client",
  "exp": 1790000000
}`, 0.6, 1.85, 6.4, 4.65, { size: 12 });
  th = (t) => ({ text: t, options: { bold: true, color: C.text1, fill: { color: C.accent1 }, fontSize: 12, valign: "middle" } });
  tc = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.background1, fill: { color: C.accent6 }, valign: "middle", ...o } });
  s.addTable([
    [th("Term"), th("What it is")],
    [tc("Client ID", { bold: true }), tc("The app's public name at the IdP. Not secret.")],
    [tc("Client secret", { bold: true }), tc("The app's password for the IdP. Never in the repo.")],
    [tc("Issuer (iss)", { bold: true }), tc("Who minted the token. A URL. Must match exactly.")],
    [tc("Subject (sub)", { bold: true }), tc("Who it is about. In Keycloak: the service-account user, not the client ID.")],
    [tc("Audience (aud)", { bold: true }), tc("Who it is for. The gateway rejects tokens meant for someone else.")],
    [tc("Access token", { bold: true }), tc("The signed JWT sent as a Bearer token.")],
  ], { x: 7.25, y: 1.85, w: 5.48, colW: [1.6, 3.88], rowH: 0.56, border: { type: "solid", color: C.accent4, pt: 1 }, margin: [0.04, 0.1, 0.04, 0.1], objectName: "Terms" });
  s.addText("The two highlighted claims are what Kong Identity must match. Script 04 reads them from a real token.", { x: 7.25, y: 6.05, w: 5.48, h: 0.5, fontSize: 12, color: C.accent2, margin: 0, valign: "top", isTextBox: true });
  h.notes(s, `
PRESENTER (4 min, live). Run ./scripts/01b-inspect-keycloak-token.sh. It requests a token with the Client Credentials grant and prints the decoded header and claims.
POINT AT: iss, sub and aud. These three decide everything that follows.
CLIENT ID versus SECRET: the ID is the app's public name. The secret is its password at the IdP. The secret was generated by script 01; you never typed it.
ISSUER: a URL. The OpenID Connect plugin uses it to discover Keycloak's keys. Kong Identity uses it, with a claim, to find the principal. It must match exactly, including scheme, host, port and path. The issuer is http://keycloak:8080/... because that's how the gateway container reaches Keycloak, even though you reached it at localhost:8080.
SUBJECT: who the token is about. GOTCHA: in Keycloak, the sub of a client-credentials token is the service-account USER's UUID, not the client ID. That's why script 01b reads the real value instead of assuming.
AUDIENCE: who the token is for. A realm mapper adds kong-workshop-api. The plugin's audience setting must match.
SECOND CLIENT: the script also prints the sub of workshop-unmapped-client. It's valid at Keycloak, and we won't create a principal for it. It's Test B.
BRIEF MAPPING: this is Scenario 2.`);

  // ───────────── Demo 2a: directory + principal ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 2: provision Kong Identity", { placeholder: "title" });
  h.kicker(s, "Demo 2  ·  scripts 02 and 03", true);
  h.code(s, `GET  https://<region>.api.konghq.com/v2/directories
  ⟦{ "data": [ ] }⟧          # none yet: one per region

POST /v2/directories
{
  "name": "kong-identity-directory",
  "description": "Directory for the workshop",
  "allow_all_control_planes": true
}
← ⟦201 { "id": "<uuid>", "name": "kong-identity-directory" }⟧`, 0.6, 1.85, 6.05, 3.15, { size: 12 });
  h.code(s, `POST /v2/directories/{directoryId}/principals
{
  "display_name": "workshop-demo-client",
  "description": "Machine client for the workshop",
  "metadata": {
    "business_unit": "payments",
    "environment": "workshop"
  }
}
← ⟦201 { "id": "<uuid>", … }⟧`, 6.8, 1.85, 5.93, 3.15, { size: 12 });
  [["name", "What the plugin calls it. The directory name, not its ID, goes in principals.directory."], ["allow_all_control_planes", "Any control plane in this region may look principals up."], ["display_name", "Appears in the gateway as principal.display_name."], ["metadata", "Free-form pairs. Read in the gateway as principal.metadata.*."]].forEach(([k, d], i) => {
    const x = 0.6 + i * 3.1;
    s.addShape(T.roundRect, { x, y: 5.2, w: 2.95, h: 1.3, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
    s.addText([{ text: k, options: { bold: true, color: C.accent1, fontFace: "Courier New", fontSize: 12, breakLine: true } }, { text: d, options: { color: C.background2, fontSize: 12 } }], { x: x + 0.15, y: 5.28, w: 2.65, h: 1.15, margin: 0, valign: "top", isTextBox: true });
  });
  h.notes(s, `
PRESENTER (4 min, live). Run ./scripts/02-create-directory.sh then ./scripts/03-create-principal.sh. Both print the request and the response, never the token.
AUTHENTICATE FIRST: every call carries Authorization: Bearer with the Konnect token. Script 02 starts by proving the token works.
DIRECTORY: GET /v2/directories first, because an organization can have only one directory per region. If you try to create a second you will see a 403. So the script looks for one and creates only if the list is empty. If the customer already has a directory, the script reuses it and cleanup will never delete it.
FIELDS: name is the value the OpenID Connect plugin takes in principals.directory; allow_all_control_planes lets any control plane in the region do lookups.
PRINCIPAL: display_name is what the gateway shows as principal.display_name. Metadata is optional; here a business unit and an environment. Metadata can be set at creation as shown, or later with PATCH.
THE RESPONSES: the slide shows only the fields the scripts read (id, name). The real response has more; the script prints all of it.
BRIEF MAPPING: Scenario 1, steps 1 to 5.`);

  // ───────────── Demo 2b: oidc identity ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 2: link the principal to Keycloak", { placeholder: "title" });
  h.kicker(s, "Demo 2  ·  script 04", true);
  h.code(s, `POST /v2/directories/{directoryId}/principals/{principalId}/identities
{
  "type": "oidc",
  ⟦"issuer": "http://keycloak:8080/realms/kong-workshop",⟧
  "claim": {
    ⟦"name": "sub",⟧
    ⟦"value": "<sub from the token>"⟧
  }
}

# verify
GET /v2/directories/{directoryId}/principals/{principalId}
GET /v2/directories/{directoryId}/principals/{principalId}/identities`, 0.6, 1.85, 7.4, 3.6, { size: 12 });
  [["type", "oidc: find this principal from an external IdP token."], ["issuer", "Exactly the token's iss."], ["claim.name", "Usually sub. Any claim in the token can be used."], ["claim.value", "The claim's value for this client."]].forEach(([k, d], i) => {
    const y = 1.85 + i * 0.9;
    s.addShape(T.roundRect, { x: 8.25, y, w: 4.48, h: 0.8, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
    s.addText([{ text: k, options: { bold: true, color: C.accent1, fontFace: "Courier New", fontSize: 12, breakLine: true } }, { text: d, options: { color: C.background2, fontSize: 12 } }], { x: 8.4, y, w: 4.2, h: 0.8, margin: 0, valign: "middle", isTextBox: true });
  });
  h.card(s, 0.6, 5.65, 12.13, 0.85, null, "The number one failure: the issuer or the subject differs from the token by one character. Script 01b prints the exact values and script 04 reads them, so nobody types them.", { dark: true, bodySize: 14, headGap: 0, fill: C.accent6, lineColor: C.accent1 });
  h.notes(s, `
PRESENTER (3 min, live). Run ./scripts/04-create-oidc-identity.sh.
WHAT IT DOES: adds an identity of type oidc to the principal. Kong Identity will now recognise a token whose issuer equals this issuer AND whose sub equals this value.
MATCHING IS EXACT: issuer URL and claim must match the token character for character. The script takes both from a real token (state written by 01b) so there is no typing.
THE CLAIM: sub is the default and the one the docs use most. The docs say any claim in the token can be used. We use sub in the demo because it is the documented default; I haven't validated alternatives.
VERIFY: the script GETs the principal and its identities. Point at the identities list.
IDEMPOTENT: if the identity already exists the script says so. Issuer plus claim must be unique within a directory, so adding the same identity to a different principal would fail.
PRODUCTION NOTE: one client usually maps to one principal, but one principal can have several identities: for example one per environment's IdP.
BRIEF MAPPING: Scenario 1, steps 6 and 7.`);

  // ───────────── Demo 3a: gateway config ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 3: the OpenID Connect plugin", { placeholder: "title" });
  h.kicker(s, "Demo 3  ·  script 05  ·  kong/plugins.yml", true);
  h.code(s, `plugins:
  - name: openid-connect
    service: workshop-httpbin
    config:
      ⟦issuer: http://keycloak:8080/realms/kong-workshop⟧
      ⟦auth_methods: [bearer]⟧
      ⟦audience: [kong-workshop-api]⟧
      principals:
        ⟦enabled: true⟧
        ⟦directory: kong-identity-directory⟧
      cache_tokens_salt: <generated>`, 0.6, 1.85, 7.0, 3.35, { size: 12 });
  [["issuer", "Where the plugin finds Keycloak's keys."], ["auth_methods: bearer", "Client already holds a token."], ["audience", "Must be in the token's aud."], ["principals.enabled", "Look the principal up after verifying."], ["principals.directory", "The directory's name."]].forEach(([k, d], i) => {
    const y = 1.85 + i * 0.68;
    s.addShape(T.roundRect, { x: 7.85, y, w: 4.88, h: 0.6, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
    s.addText([{ text: k + "   ", options: { bold: true, color: C.accent1, fontFace: "Courier New", fontSize: 11 } }, { text: d, options: { color: C.background1, fontSize: 12 } }], { x: 8.0, y, w: 4.65, h: 0.6, margin: 0, valign: "middle", isTextBox: true });
  });
  h.card(s, 0.6, 5.4, 12.13, 1.1, null, [
    { text: "A common mix-up.  ", options: { bold: true, color: C.accent1 } },
    { text: "client_id, client_secret and client_credentials_param_type belong to the pattern where Kong exchanges credentials for a token. Here the client already holds a Keycloak token, so none of them are needed." },
  ], { dark: true, bodySize: 14, headGap: 0, fill: C.accent6, lineColor: C.accent1 });
  h.notes(s, `
PRESENTER (4 min, live). Run ./scripts/05-configure-gateway.sh, which uses decK to apply kong/kong.yml (a service and a route) and kong/plugins.yml.
WALK THE FIVE LINES: issuer is where the plugin discovers Keycloak's signing keys. auth_methods bearer says "the client presents a token in the Authorization header". audience must appear in the token's aud claim. principals.enabled turns on the lookup after verification. principals.directory is the directory NAME.
cache_tokens_salt: decK 1.59 and later needs it so syncs don't regenerate session credentials. Script 01 generates it once.
THE BRIEF'S CONFIG SKETCH: it listed client_id, client_secret, auth_methods and client_credentials_param_type. That is a valid pattern, but a different one: Kong itself exchanges client credentials sent in a Basic header for a token at the IdP. It's what the Kong Identity authorization-server tutorial does. In our flow the client fetches the token from Keycloak itself, so bearer is correct. If a customer wants Kong to do the exchange, it's a small change.
ALSO APPLIED: the Datakit plugin, which we'll use to show what the gateway knows. It copies principal fields into headers that httpbin echoes. It needs Gateway 3.16.
BRIEF MAPPING: Scenario 3, steps 1 to 7. Every parameter here appears in Kong's published how-to guides for the plugin with principals.`);

  // ───────────── Demo 3b: tests ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 3: tests A, B and C", { placeholder: "title" });
  h.kicker(s, "Demo 3  ·  ./scripts/10-test-authentication.sh basic", true);
  th = (t) => ({ text: t, options: { bold: true, color: C.text1, fill: { color: C.accent1 }, fontSize: 12, valign: "middle" } });
  tc = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.background1, fill: { color: C.accent6 }, valign: "middle", ...o } });
  s.addTable([
    [th("Test"), th("Request"), th("Expect"), th("What it proves")],
    [tc("A", { bold: true }), tc("No Authorization header"), tc("401", { bold: true, color: C.accent1 }), tc("Nothing to verify, nothing to look up.")],
    [tc("B", { bold: true }), tc("Valid token from the unmapped client"), tc("401", { bold: true, color: C.accent1 }), tc("Verified at the IdP, unknown to Kong Identity. Default error_on_miss.")],
    [tc("B′", { bold: true }), tc("Same, with principals.error_on_miss: false"), tc("200, principal none", { bold: true, color: C.accent1 }), tc("The miss is now your choice. The request continues with no principal.")],
    [tc("C", { bold: true }), tc("Valid token from the mapped client"), tc("200, principal found", { bold: true, color: C.accent1 }), tc("Principal and metadata hydrated into the request context.")],
  ], { x: 0.6, y: 1.85, w: 12.13, colW: [0.7, 3.5, 2.4, 5.53], rowH: 0.62, border: { type: "solid", color: C.accent4, pt: 1 }, margin: [0.04, 0.12, 0.04, 0.12], objectName: "Tests table" });
  h.code(s, `# what httpbin received in Test C: the principal inside the gateway request context
X-Principal-Id               ⟦<the principal's UUID in Kong Identity>⟧
X-Principal-Name             workshop-demo-client
X-Principal-Business-Unit    ⟦payments⟧          # hydrated metadata`, 0.6, 5.1, 12.13, 1.4, { size: 12 });
  h.notes(s, `
PRESENTER (5 min, live). Run ./scripts/10-test-authentication.sh basic. It prints each request, the status, and a PASS or FAIL, and exits non-zero if any check fails.
TEST A: no token, 401. Cheap and obvious, but it proves the plugin is active.
TEST B: a perfectly valid Keycloak token from a client that has no principal. Default behaviour is 401. Say: "The token is fine. Kong Identity has never heard of this client."
TEST B-PRIME: the script applies kong/plugins.error-on-miss-false.yml, waits for the data plane to pick it up, repeats the request with a fresh token, and sees 200. The upstream shows X-Principal-Id: none because there is no principal. Then the script restores the default. LEAVE THIS RUNNING; it takes about a minute and it's the most persuasive moment of Section 3.
TEST C: the mapped client gets 200. The upstream echoes X-Principal-Id equal to the principal's UUID in Kong Identity and X-Principal-Business-Unit payments, which came from the metadata we set. Those headers are written by the Datakit plugin reading kong.client.principal.
SHOW INSIDE THE REQUEST CONTEXT: if time allows, call with X-Datakit-Debug-Trace: true and show the GET_PRINCIPAL node's output.
BRIEF MAPPING: Test A, B, C as specified. Inspecting the authenticated principal: Datakit trace and headers.`);

  // ───────────── Demo 4: consumer linkage ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 4: link a Consumer", { placeholder: "title" });
  h.kicker(s, "Demo 4  ·  scripts 06, 07  ·  ./10 consumer", true);
  h.code(s, `# 06: a traditional Consumer (decK)
consumers:
  - username: workshop-demo-consumer

# 07: add a second identity to the SAME principal
POST …/principals/{principalId}/identities
{
  ⟦"type": "control_plane_consumer",⟧
  "control_plane_id": "<control plane id>",
  "consumer_id": "<consumer id>"
}`, 0.6, 1.85, 6.3, 3.9, { size: 12 });
  s.addShape(T.roundRect, { x: 7.15, y: 1.85, w: 5.58, h: 1.7, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
  s.addText([{ text: "BEFORE LINKING", options: { bold: true, color: C.accent2, fontSize: 10, charSpacing: 2, breakLine: true } }, { text: "X-Principal-Id          <uuid>", options: { fontFace: "Courier New", color: C.background1, fontSize: 12, breakLine: true } }, { text: "no X-Consumer-* headers", options: { fontFace: "Courier New", color: C.background2, fontSize: 12 } }], { x: 7.35, y: 1.95, w: 5.2, h: 1.5, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 4 });
  s.addShape(T.roundRect, { x: 7.15, y: 3.7, w: 5.58, h: 2.05, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent1, width: 1 } });
  s.addText([{ text: "AFTER LINKING", options: { bold: true, color: C.accent1, fontSize: 10, charSpacing: 2, breakLine: true } }, { text: "X-Principal-Id          <uuid>", options: { fontFace: "Courier New", color: C.background1, fontSize: 12, breakLine: true } }, { text: "X-Consumer-Id           ", options: { fontFace: "Courier New", color: C.background1, fontSize: 12 } }, { text: "<consumer id>", options: { fontFace: "Courier New", color: C.accent1, bold: true, fontSize: 12, breakLine: true } }, { text: "X-Consumer-Username     ", options: { fontFace: "Courier New", color: C.background1, fontSize: 12 } }, { text: "workshop-demo-consumer", options: { fontFace: "Courier New", color: C.accent1, bold: true, fontSize: 12 } }], { x: 7.35, y: 3.8, w: 5.2, h: 1.85, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 4 });
  h.notes(s, `
PRESENTER (4 min, live). Run ./scripts/06-create-consumer.sh, ./scripts/07-link-consumer.sh, then ./scripts/10-test-authentication.sh consumer.
WHY: you already have Consumers with plugins attached. You don't want to redo that to adopt principals. A control_plane_consumer identity says "this principal IS that Consumer in that control plane". When the OpenID Connect plugin hydrates the principal, the mapped Consumer is loaded into the request context just as if the Consumer had authenticated directly, so Consumer-scoped plugins keep working during the migration.
STEPS: 06 creates a Consumer with decK and retrieves its ID. 07 posts the second identity to the same principal. The limit is one Consumer per control plane per principal.
EVIDENCE: before linking, httpbin sees only principal headers. After linking, Kong's usual Consumer headers appear. The test script also prints the Datakit trace for the GET_CONSUMER node.
HONESTY: the exact set of headers the gateway adds for a principal-mapped Consumer is the one thing in this demo I could not confirm from the docs. If the headers don't appear, the trace is the proof, and the script prints a clear message either way. Don't claim more than you see on screen.
ALLOW TIME: the lookup is cached; the demo sets a 30 second db_cache_ttl so the script may wait up to that long.
BRIEF MAPPING: Scenario 4, steps 1 to 6.`);

  // ───────────── Demo 5: consumer groups ─────────────
  s = pres.addSlide({ masterName: "KONG_DEMO", sectionTitle: DEMO });
  s.addText("Demo 5: map to Consumer Groups", { placeholder: "title" });
  h.kicker(s, "Demo 5  ·  scripts 08, 09  ·  ./10 groups", true);
  h.code(s, `# 09 standard: the reserved metadata key, NOT an identity
PATCH …/principals/{principalId}
{
  "metadata": {
    "business_unit": "payments",
    "environment": "workshop",
    ⟦"consumer_groups": ["<tier-standard id>"]⟧
  }
}

# 08: group-scoped policy (decK)
plugins:
  - name: rate-limiting-advanced
    consumer_group: tier-standard
    config: { limit: [3], window_size: [30] }`, 0.6, 1.85, 6.5, 4.2, { size: 12 });
  const th2 = (t) => ({ text: t, options: { bold: true, color: C.text1, fill: { color: C.accent1 }, fontSize: 12, valign: "middle" } });
  const tc2 = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.background1, fill: { color: C.accent6 }, valign: "middle", ...o } });
  s.addTable([
    [th2("Principal mapped to"), th2("5 requests, 30 s window")],
    [tc2("tier-standard (3 per 30 s)", { bold: true }), tc2("200 200 200 429 429", { fontFace: "Courier New", color: C.accent1 })],
    [tc2("tier-gold (10 per 30 s)", { bold: true }), tc2("200 200 200 200 200", { fontFace: "Courier New", color: C.accent1 })],
  ], { x: 7.35, y: 1.85, w: 5.38, colW: [2.9, 2.48], rowH: 0.65, border: { type: "solid", color: C.accent4, pt: 1 }, margin: [0.04, 0.1, 0.04, 0.1], objectName: "Group results" });
  h.card(s, 7.35, 3.95, 5.38, 2.1, "Watch for", { bullets: ["Send the whole metadata object each time", "Allow up to 30 s for the gateway cache to refresh", "Rate Limiting Advanced is an Enterprise plugin"] }, { dark: true, bodySize: 13, headSize: 16, headGap: 0.45, fill: C.accent6, lineColor: C.accent1 });
  h.src(s, "A principal can be in several groups; whether two group policies combine is not shown in this demo.", true);
  h.notes(s, `
PRESENTER (5 min, live). Run ./scripts/08-create-consumer-groups.sh, ./scripts/09-link-consumer-groups.sh standard, ./scripts/10-test-authentication.sh groups, then ./scripts/09-link-consumer-groups.sh gold and the test again.
WHAT 08 DOES: creates two Consumer Groups, tier-standard and tier-gold, and a Rate Limiting Advanced plugin on each: three requests per 30 seconds for standard, ten for gold. Consumer Groups are how the gateway applies a policy to a set of callers; a plugin scoped to a group applies to everyone in it.
WHAT 09 DOES: PATCHes the principal's metadata with the reserved key consumer_groups, a list of group UUIDs. NOT an identity type. The script sends the full metadata object each time, so it doesn't matter whether the API merges or replaces.
WHAT 10 SHOWS: mapped to standard, five requests give 200 200 200 429 429. Move the principal to gold and, once the gateway refreshes its cache (up to 30 seconds in this demo), five requests all succeed. The policy changed without touching the gateway config, because the principal's metadata did.
MULTIPLE GROUPS: the docs say a principal can be mapped to many groups and a group to many principals, and that groups from a mapped Consumer are added to the principal's own. The demo doesn't combine two rate limits; the script's "both" mode exists for experiments, and I have not validated the outcome. Don't predict it.
POLICY DIRECTION: the docs say the only way to scope a plugin to a principal directly is conditional plugin execution on its metadata, for example principal.metadata.tier == "gold". Consumer Groups give you the other route.
BRIEF MAPPING: Scenario 5, steps 1 to 6.`);

  // ───────────── Wrap: migration path ─────────────
  pres.addSection({ title: "Wrap-up" });
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "Wrap-up" });
  s.addText("A migration path from Consumers to principals", { placeholder: "title" });
  h.kicker(s, "Wrap-up  ·  What to do on Monday");
  [["Stand up", "Create the directory. Add principals next to your Consumers. Clients notice nothing."], ["Add the identity", "Attach the identity your clients already use: oidc, auth_server_client or custom."], ["Link Consumers", "Add control_plane_consumer identities so Consumer-scoped plugins keep applying."], ["Move policy", "Shift rules to metadata and Consumer Groups. Retire Consumers when nothing depends on them."]].forEach(([t, d], i) => {
    const x = 0.6 + i * 3.1;
    s.addShape(T.roundRect, { x, y: 1.9, w: 2.9, h: 3.3, rectRadius: 0.08, fill: { color: i === 3 ? C.text1 : C.accent5 }, line: { type: "none" }, objectName: "Migration step " + (i + 1) });
    h.step(s, i + 1, x + 0.25, 2.1, i === 3);
    s.addText(t, { x: x + 0.25, y: 2.7, w: 2.4, h: 0.5, fontSize: 19, bold: true, color: i === 3 ? C.background1 : C.text1, margin: 0, valign: "top", isTextBox: true });
    s.addText(d, { x: x + 0.25, y: 3.3, w: 2.45, h: 1.8, fontSize: 14, color: i === 3 ? C.background2 : C.text2, margin: 0, valign: "top", isTextBox: true });
    if (i < 3) h.link(s, x + 2.93, 3.55, x + 3.07, 3.55, { dark: false, solid: true });
  });
  s.addShape(T.roundRect, { x: 0.6, y: 5.5, w: 12.13, h: 0.95, rectRadius: 0.08, fill: { color: C.accent1 }, line: { type: "none" } });
  s.addText("Hydration means you can start at step 1 without changing a single client credential. This sequence is a suggestion built from the docs' migration note, not a Kong-mandated process.", { x: 0.9, y: 5.5, w: 11.6, h: 0.95, fontSize: 14, bold: true, color: C.text1, margin: 0, valign: "middle", isTextBox: true });
  h.notes(s, `
PRESENTER (3 min). Turn the demo into a plan.
1 STAND UP: create the directory and a few principals beside your existing Consumers. Nothing changes for clients.
2 ADD THE IDENTITY: attach whichever identity matches how the client already authenticates: oidc for an external IdP, auth_server_client for Kong Identity's own auth server, custom for something else.
3 LINK CONSUMERS: add control_plane_consumer identities. The docs say a mapped Consumer loads as if it authenticated directly, so your Consumer-scoped plugins carry on working while you migrate.
4 MOVE POLICY: shift rules to metadata (conditional plugin execution) and Consumer Groups, then retire Consumers once nothing refers to them.
CAVEAT: the four steps are my reading of the docs' statement that the mapping "allows existing Consumer-scoped plugins to function while you migrate to principals". It isn't an official process. Say so.
ASK: "Which of your APIs would be the pilot?" Write the answer down; it becomes the follow-up.`);

  // ───────────── Wrap: takeaways ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: "Wrap-up" });
  s.addText("What to take away", { placeholder: "title" });
  h.kicker(s, "Wrap-up", true);
  [
    ["Konnect splits configuration from traffic.", "Kong hosts the control plane. You choose where data planes run."],
    ["“Who are you?” means four things.", "Humans to Konnect. Machines to Konnect. Clients to the gateway. Their record in Kong Identity."],
    ["A principal is a central record of an API client.", "Identities find it. Metadata describes it."],
    ["Hydrate after your IdP, authenticate when Kong Identity holds the secret.", "Hydration lets you adopt Kong Identity without moving credentials."],
    ["Consumers and groups link in two different ways.", "An identity for the Consumer. A reserved metadata key for groups."],
  ].forEach(([a, b], i) => {
    const y = 1.8 + i * 0.95;
    h.step(s, i + 1, 0.6, y + 0.1, true);
    s.addText([{ text: a, options: { bold: true, color: C.background1, fontSize: 18, breakLine: true } }, { text: b, options: { color: C.background2, fontSize: 14 } }], { x: 1.25, y, w: 7.1, h: 0.9, margin: 0, valign: "top", isTextBox: true });
  });
  h.card(s, 8.6, 1.85, 4.13, 4.5, "Next steps", { bullets: ["Rerun the demo yourself: scripts 00 to 10", "Choose one API for a principal pilot", "Decide your SSO group-to-team mapping"] }, { dark: true, bodySize: 14, headSize: 18, headGap: 0.5, fill: C.accent6, lineColor: C.accent1 });
  h.notes(s, `
PRESENTER (3 min). Read the five lines; don't add new material.
Then the right-hand card: four concrete next steps. Ask each person to pick one and say it out loud.
The second step is honesty: the availability stage of Kong Identity is not settled by the public documentation, so the customer should confirm it before they build on it.
LEAVE-BEHIND: the repo (scripts, compose, Keycloak realm, decK files), this deck, and docs/workshop-guide.md. Remind them that the only value they supply is their own Konnect token.
CLOSE: "What did I not cover that you need for Monday?"`);

  // ───────────── References ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: "Wrap-up" });
  s.addText("Documentation references", { placeholder: "title" });
  h.kicker(s, "Wrap-up  ·  Checked 31 October 2026", true);
  const L = (t, u) => ({ text: t, options: { hyperlink: { url: u, tooltip: u }, color: C.accent1, fontSize: 13, breakLine: true, paraSpaceAfter: 7 } });
  const refsL = [
    ["Konnect", "https://developer.konghq.com/konnect/"], ["Kong Identity", "https://developer.konghq.com/identity/"], ["Principals and directories", "https://developer.konghq.com/identity/principals/"],
    ["Konnect SSO", "https://developer.konghq.com/konnect-platform/sso/"], ["Teams and roles", "https://developer.konghq.com/konnect-platform/teams-and-roles/"],
  ];
  const refsR = [
    ["OpenID Connect plugin reference", "https://developer.konghq.com/plugins/openid-connect/reference/"], ["Authenticate OAuth clients with Kong Identity", "https://developer.konghq.com/how-to/authenticate-oauth-clients-with-kong-identity/"],
    ["Configure the OIDC plugin with Kong Identity", "https://developer.konghq.com/how-to/configure-kong-identity-oidc/"], ["Datakit host routing with principals", "https://developer.konghq.com/how-to/configure-oidc-datakit-host-routing-with-principals-metadata/"],
    ["decK", "https://developer.konghq.com/deck/"],
  ];
  s.addText(refsL.map(([t, u]) => L(t, u)), { x: 0.6, y: 1.85, w: 5.9, h: 4.3, margin: 0, valign: "top", isTextBox: true });
  s.addText(refsR.map(([t, u]) => L(t, u)), { x: 6.85, y: 1.85, w: 5.9, h: 4.3, margin: 0, valign: "top", isTextBox: true });
  s.addText("The full list, with what each page was used for, is in docs/documentation-references.md.", { x: 0.6, y: 6.3, w: 12, h: 0.3, fontSize: 12, color: C.accent2, margin: 0, isTextBox: true });
  h.notes(s, `
PRESENTER (1 min). Every claim in this deck traces to one of these pages. They're live links.
Kong's docs change quickly; when something here disagrees with the site, trust the site and tell the Kong team so the deck gets updated.
The repo's docs/documentation-references.md lists what each page was used for and flags the things the docs did not settle.`);

  // ───────────── Appendix: troubleshooting ─────────────
  pres.addSection({ title: "Appendix" });
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "Appendix" });
  s.addText("Appendix: when something fails", { placeholder: "title" });
  h.kicker(s, "Appendix  ·  Troubleshooting");
  hd = (t) => ({ text: t, options: { bold: true, color: C.accent1, fill: { color: C.text1 }, fontSize: 12 } });
  c = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.text1, valign: "middle", ...o } });
  s.addTable([
    [hd("Symptom"), hd("Likely cause"), hd("Fix")],
    [c("401 for the mapped client", { bold: true }), c("Principal's sub differs from the token's (Keycloak uses the service-account user id)"), c("Rerun 01b then 04")],
    [c("403 creating a directory", { bold: true }), c("One already exists in this region"), c("Script 02 reuses it")],
    [c("Plugin cannot find the directory", { bold: true }), c("The ID was used where the NAME is required"), c("principals.directory is the name")],
    [c("Metadata or group change not visible", { bold: true }), c("Lookup cache (30 s here, 10 min by default)"), c("Wait; test uses fresh tokens")],
    [c("Data plane never ready", { bold: true }), c("Cert not pinned, wrong region, or outbound 443 blocked"), c("Read script 01 output; docker logs kong-dp")],
    [c("401 for every token", { bold: true }), c("Issuer unreachable from the container, or audience missing"), c("Run 01b; check iss and aud")],
    [c("decK error about the salt", { bold: true }), c("decK 1.59+ needs cache_tokens_salt"), c("Script 01 sets DECK_TOKEN_SALT")],
    [c("Consumer headers absent", { bold: true }), c("Cache not yet refreshed, or header names differ"), c("Wait 30 s; use the Datakit trace")],
  ], { x: 0.6, y: 1.75, w: 12.13, colW: [3.0, 5.4, 3.73], rowH: 0.55, border: { type: "solid", color: C.background2, pt: 1 }, fill: { color: C.background1 }, margin: [0.04, 0.1, 0.04, 0.1], objectName: "Troubleshooting" });
  h.src(s, "More detail in docs/troubleshooting.md");
  h.notes(s, `
APPENDIX. Use this when something fails live. Each row is also in docs/troubleshooting.md with the exact commands.
THE TWO MOST COMMON: the mapped client gets 401 because the principal's sub isn't the token's sub, and a metadata change that "doesn't work" because of the lookup cache.
DEBUGGING TOOLS: set the plugin's display_errors to true, raise the gateway log level to debug and filter the error log for openid-connect, or temporarily turn off verify_signature, verify_claims or verify_nonce. The OIDC plugin page documents those.`);

  // ───────────── Appendix: repo map ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: "Appendix" });
  s.addText("Appendix: repo map and run order", { placeholder: "title" });
  h.kicker(s, "Appendix  ·  For the presenter");
  h.code(s, `kong-konnect-identity-workshop/
├── presentation/   this deck and its build script
├── docker/         docker-compose.yml
├── keycloak/       realm-export.json
├── kong/           decK state files
├── scripts/        00 … 10, 99
├── requests/       demo.http
├── environment/    .env.example
├── architecture/   diagrams (Mermaid)
├── tests/          offline mock tests
└── docs/           guides, troubleshooting`, 0.6, 1.8, 5.9, 4.5, { size: 12, onDark: true });
  s.addShape(T.roundRect, { x: 6.8, y: 1.8, w: 5.93, h: 4.5, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" } });
  s.addText("RUN ORDER", { x: 7.05, y: 1.95, w: 4, h: 0.28, fontSize: 10, bold: true, color: C.text2, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText([
    ["00", "preflight"], ["01", "setup environment"], ["01b", "read the token"], ["02, 03, 04", "directory, principal, identity"], ["05", "gateway config"], ["10 basic", "tests A, B, C"], ["06, 07, 10 consumer", "Consumer link"], ["08, 09, 10 groups", "Consumer Groups"], ["99", "cleanup"],
  ].map(([a, b], i, arr) => ({ text: a + "   " + b, options: { breakLine: i < arr.length - 1, fontFace: "Courier New", fontSize: 13, color: C.text1, paraSpaceAfter: 5 } })), { x: 7.05, y: 2.35, w: 5.5, h: 3.8, margin: 0, valign: "top", isTextBox: true });
  h.notes(s, `
APPENDIX for the presenter. The deck and scripts are one deliverable. The run order matches the demo slides. Scripts are idempotent; rerun any of them. Cleanup (99) asks before each deletion in Konnect, and never deletes a directory the workshop didn't create.
Offline tests: tests/run-mock-test.sh exercises every script against a mock. A green run proves the scripts follow the docs; it doesn't prove Konnect behaves the same. Only a run against a real Konnect org does.`);
};
