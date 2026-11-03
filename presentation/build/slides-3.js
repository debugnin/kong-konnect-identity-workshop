// Section C: Account identity and access management
module.exports = function (pres, h) {
  const C = h.C, T = pres.ShapeType;
  const SEC = "C. Account access";
  pres.addSection({ title: SEC });

  // ───────────── C divider ─────────────
  let s = pres.addSlide({ masterName: "KONG_SECTION", sectionTitle: SEC });
  s.addText("C", { x: 0.8, y: 1.9, w: 2.4, h: 2.8, fontSize: 160, bold: true, color: C.accent1, margin: 0, isTextBox: true, valign: "top" });
  s.addText("Account identity and access", { placeholder: "title" });
  s.addText("15 minutes  ·  Concept\nHow people and machines get into Konnect, and how that differs from how API clients get into your APIs.", { placeholder: "body" });
  h.notes(s, `
PRESENTER (30 sec). Transition: "Section C is about a word that means four different things in this product: 'identity'. Before we get to Kong Identity, I want to separate the four."`);

  // ───────────── C1 Four kinds of who are you ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Four kinds of “who are you?”", { placeholder: "title" });
  h.kicker(s, "C  ·  The distinction that saves hours");
  const quads = [
    ["1", "Human to the Konnect platform", "An employee logs in to Konnect.", "Built-in login, or SSO through your IdP (OIDC or SAML).", "Teams and roles"],
    ["2", "Machine to the Konnect APIs", "Automation calls the Konnect API.", "A personal access token, or a system account token.", "Roles on the token's identity"],
    ["3", "API client to Kong Gateway", "A caller reaches your API through a data plane.", "An authentication plugin on a service or route: key-auth, OpenID Connect and others.", "Consumers, plugins"],
    ["4", "Kong Identity principals", "A central record of an API client, usable across Kong products.", "Credentials, identities and metadata, held in a directory.", "Directories and principals"],
  ];
  quads.forEach(([n, t, who, how, gov], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.15, y = 1.8 + row * 2.4, w = 5.95, hh = 2.25, hi = i === 3;
    s.addShape(T.roundRect, { x, y, w, h: hh, rectRadius: 0.08, fill: { color: hi ? C.text1 : C.accent5 }, line: { type: "none" }, objectName: "Plane " + n });
    h.step(s, n, x + 0.25, y + 0.22, hi);
    s.addText(t, { x: x + 0.85, y: y + 0.2, w: w - 1.1, h: 0.46, fontSize: 18, bold: true, color: hi ? C.background1 : C.text1, margin: 0, valign: "middle", isTextBox: true });
    s.addText([
      { text: who, options: { breakLine: true, bold: true } },
      { text: how, options: { breakLine: true } },
      { text: "Governed by: " + gov, options: { color: hi ? C.accent1 : C.text2, bold: true } },
    ], { x: x + 0.3, y: y + 0.85, w: w - 0.6, h: hh - 1.0, fontSize: 14, color: hi ? C.background2 : C.text2, margin: 0, valign: "top", isTextBox: true, paraSpaceAfter: 6 });
  });
  s.addText("A principal is not a Konnect user and not a Dev Portal developer. It is an external client, workload or human that authenticates to a gateway.", { x: 0.6, y: 6.58, w: 12.1, h: 0.35, fontSize: 13, bold: true, color: C.text1, margin: 0, isTextBox: true });
  h.src(s, "");
  h.notes(s, `
PRESENTER (4 min). This is the most important slide in Section C. Take your time.
1. HUMAN TO KONNECT: an employee opens cloud.konghq.com. They authenticate with Konnect's built-in login or through SSO with your identity provider. What they can do afterwards is decided by teams and roles.
2. MACHINE TO KONNECT APIS: a pipeline calls the Konnect API, for example to create a control plane. It authenticates with a token: a personal access token (tied to a person) or a system account token (a non-human identity). The demo's KONNECT_TOKEN is a personal access token.
3. API CLIENT TO KONG GATEWAY: a caller reaches one of your APIs. An authentication plugin on the service or route checks its credentials. This has nothing to do with who can log in to Konnect.
4. KONG IDENTITY: a central record of the API client in plane 3. Credentials, identities and metadata live in a directory. The gateway can use the record to authenticate the client or enrich a client that was already authenticated.
SAY: "Principals describe your API clients. They are not Konnect users and they are not Dev Portal developers. The docs say so explicitly."
ASK: "Which of these four is your team confused about most?" You'll usually get plane 3 versus plane 4.`);

  // ───────────── C2 Teams, roles, RBAC ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("Teams, roles and RBAC", { placeholder: "title" });
  h.kicker(s, "C  ·  Users, teams, roles", true);
  // chain
  [["User", 0.6], ["Team", 3.1], ["Role", 5.6], ["Resource", 8.1]].forEach(([t, x], i, a) => {
    h.node(s, t, x, 1.95, 1.9, i === 2 ? "ai" : "focal", 0.55);
    if (i < a.length - 1) h.link(s, x + 1.94, 2.22, a[i + 1][1] - 0.04, 2.22);
  });
  s.addText("many teams per user", { x: 2.3, y: 2.55, w: 1.9, h: 0.3, fontSize: 11, color: C.background2, margin: 0, isTextBox: true });
  s.addText("a role names an action set", { x: 4.6, y: 2.55, w: 2.4, h: 0.3, fontSize: 11, color: C.background2, margin: 0, isTextBox: true });
  s.addText("one, or all, of a type", { x: 7.3, y: 2.55, w: 2.0, h: 0.3, fontSize: 11, color: C.background2, margin: 0, isTextBox: true });
  // predefined teams
  s.addText("PREDEFINED TEAMS", { x: 0.6, y: 3.15, w: 4, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  ["Organization Admin", "Org Admin (Read Only)", "Control Plane Admin", "Analytics Admin", "Analytics Viewer", "Portal Admin", "API Product Admin", "API Product Developer"].forEach((t, i) => {
    h.node(s, t, 0.6 + (i % 2) * 2.95, 3.5 + Math.floor(i / 2) * 0.52, 2.8, "pill", 0.4);
  });
  // principles
  const pr = [["Roles add up", "A user in two teams gets both teams' access."], ["More access wins", "Two roles on the same entity: the broader one applies."], ["Scoped to a region", "Teams and roles can be tied to one geo."], ["Who can manage this", "Organization Admin team, or the Identity Admin role."]];
  pr.forEach(([t, d], i) => {
    const x = 6.8, y = 3.1 + i * 0.85;
    s.addShape(T.roundRect, { x, y, w: 5.93, h: 0.75, rectRadius: 0.08, fill: { color: C.accent6 }, line: { color: C.accent4, width: 1 } });
    s.addText(t, { x: x + 0.2, y, w: 1.9, h: 0.75, fontSize: 14, bold: true, color: C.accent1, margin: 0, valign: "middle", isTextBox: true });
    s.addText(d, { x: x + 2.1, y, w: 3.7, h: 0.75, fontSize: 13, color: C.background1, margin: 0, valign: "middle", isTextBox: true });
  });
  h.src(s, "Source: developer.konghq.com/konnect-platform/teams-and-roles/  ·  predefined teams cannot be modified or deleted", true);
  h.notes(s, `
PRESENTER (3 min). Konnect's RBAC in one picture.
USERS belong to TEAMS. Teams hold ROLES. A role predefines access to a resource type, and can be scoped to one instance (one control plane) or all of them.
PREDEFINED TEAMS (can't be edited or deleted): Organization Admin, Organization Admin (Read Only), Control Plane Admin, Analytics Admin, Analytics Viewer, Portal Admin, API Product Admin and API Product Developer. Create custom teams when none fit.
FOUR RULES from the docs: roles are additive across teams; where two roles touch the same entity, the one with more access wins; teams and roles can be assigned to a geo, then only reach objects in that geo; and you must be in Organization Admin or hold Identity Admin to manage users, teams and roles.
EXAMPLES TO USE: "Deployer" can create, edit and delete services, routes and plugins on a control plane but can't write partials. "Plugin Admin" can administer plugins. "Viewer" is read-only on a control plane. There is also an Identity role for authorization servers (Admin, Viewer).
SSO LINK: when IdP team mapping is on, users and teams become read-only inside Konnect. Next slides.`);

  // ───────────── C3 Built-in vs SSO ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Built-in login or SSO", { placeholder: "title" });
  h.kicker(s, "C  ·  Authenticating humans");
  const hd = (t) => ({ text: t, options: { bold: true, color: C.accent1, fill: { color: C.text1 }, fontSize: 13 } });
  const c = (t, o = {}) => ({ text: t, options: { fontSize: 13, color: C.text1, valign: "middle", ...o } });
  s.addTable([
    [hd(""), hd("Built-in"), hd("OIDC SSO"), hd("SAML SSO")],
    [c("What it is", { bold: true }), c("Konnect manages the login."), c("Your IdP authenticates over OpenID Connect."), c("Your IdP authenticates over SAML 2.0.")],
    [c("Supported IdPs", { bold: true }), c("n/a"), c("Any OIDC provider. Verified: Okta, Azure AD, Oracle IDCS, Keycloak."), c("Any SAML provider. Same verified list.")],
    [c("Where you configure it", { bold: true }), c("Default."), c("Organization settings, Authentication scheme. Or /identity-providers and /authentication-settings."), c("Same settings page. Konnect then generates a Single Sign-On URL and Audience URI for your IdP.")],
    [c("How users sign in", { bold: true }), c("cloud.konghq.com"), c("cloud.konghq.com/login/<your-path>"), c("cloud.konghq.com/login/<your-path>")],
  ], { x: 0.6, y: 1.75, w: 12.1, colW: [2.2, 2.4, 3.8, 3.7], rowH: 0.62, border: { type: "solid", color: C.background2, pt: 1 }, fill: { color: C.background1 }, margin: [0.05, 0.12, 0.05, 0.12], objectName: "SSO comparison" });
  [["One method at a time", "You can combine built-in with OIDC or with SAML. Combining OIDC and SAML is not supported."], ["Keep built-in on while testing", "Turn it off only after the IdP login works. Otherwise you can lock yourself out."], ["The login path is global", "It must be unique across all Konnect organizations."]].forEach(([t, d], i) => {
    h.card(s, 0.6 + i * 4.1, 5.15, 3.95, 1.4, t, d, { bodySize: 13, headSize: 16, headGap: 0.45, fill: i === 1 ? C.accent1 : C.accent5, bodyColor: i === 1 ? C.text1 : undefined });
  });
  h.src(s, "Source: developer.konghq.com/konnect-platform/sso/");
  h.notes(s, `
PRESENTER (3 min). Konnect supports any OIDC or SAML-compliant provider. The docs list Okta, Azure Active Directory, Oracle Identity Cloud Service and Keycloak as verified out of the box.
CONFIGURE: Organization settings, Authentication scheme, or the /identity-providers endpoint to create the provider and /authentication-settings (oidc_auth_enabled) to switch it on. For SAML, once you save, Konnect generates a Single Sign-On URL and Audience URI that you paste into your IdP, replacing placeholders.
LOGIN: users go to cloud.konghq.com/login/<your path>. The path is any alphanumeric string, no slash needed, and unique across ALL Konnect organizations.
THREE RULES: (1) you can combine built-in with either OIDC or SAML, never both SAML and OIDC; (2) keep built-in on while you test, and only turn it off once the IdP flow works; (3) SSO for the platform and SSO for Dev Portals are separate settings; enabling one doesn't enable the other.
WE DO NOT LIVE-CONFIGURE THIS in the workshop. It changes how your whole org logs in, and the IdP must be reachable from Konnect's cloud. We walk through the example next.`);

  // ───────────── C4 Employee access through your IdP ─────────────
  s = pres.addSlide({ masterName: "KONG_DARK", sectionTitle: SEC });
  s.addText("Employee access through your IdP", { placeholder: "title" });
  h.kicker(s, "C  ·  Worked example  ·  group to team mapping", true);
  [["Employee", 0.6, "pill"], ["Your IdP", 2.85, "focal"], ["Konnect login path", 5.1, "focal"], ["Team mapping", 7.35, "ai"], ["Team and roles", 9.6, "focal"]].forEach(([t, x, k], i, a) => {
    h.node(s, t, x, 1.9, 2.05, k, 0.55);
    if (i < a.length - 1) h.link(s, x + 2.09, 2.17, a[i + 1][1] - 0.04, 2.17);
  });
  s.addText("signs in", { x: 0.6, y: 2.5, w: 2.0, h: 0.28, fontSize: 11, color: C.background2, align: "center", margin: 0, isTextBox: true });
  s.addText("sends a groups claim", { x: 2.6, y: 2.5, w: 2.5, h: 0.28, fontSize: 11, color: C.background2, align: "center", margin: 0, isTextBox: true });
  s.addText("group names to teams", { x: 6.9, y: 2.5, w: 2.5, h: 0.28, fontSize: 11, color: C.background2, align: "center", margin: 0, isTextBox: true });
  // example mapping table
  const th = (t) => ({ text: t, options: { bold: true, color: C.text1, fill: { color: C.accent1 }, fontSize: 12 } });
  const tc = (t, o = {}) => ({ text: t, options: { fontSize: 12, color: C.background1, fill: { color: C.accent6 }, ...o } });
  s.addTable([
    [th("IdP group (example)"), th("Konnect team (example)"), th("What they can do")],
    [tc("konnect-platform-admins"), tc("Organization Admin"), tc("Everything in the org")],
    [tc("konnect-api-developers"), tc("Custom: API developers"), tc("Deploy services, routes, plugins on one control plane")],
    [tc("konnect-auditors"), tc("Organization Admin (Read Only)"), tc("View everything, change nothing")],
  ], { x: 0.6, y: 3.15, w: 7.4, colW: [2.6, 2.4, 2.4], rowH: 0.55, border: { type: "solid", color: C.accent4, pt: 1 }, margin: [0.05, 0.1, 0.05, 0.1], valign: "middle", objectName: "Group mapping example" });
  s.addText("EXAMPLE NAMES — YOURS WILL DIFFER", { x: 0.6, y: 5.45, w: 7, h: 0.25, fontSize: 10, bold: true, color: C.accent2, charSpacing: 1.5, margin: 0, isTextBox: true });
  // behaviours
  h.card(s, 8.3, 3.15, 4.43, 3.3, "What happens at login", { bullets: ["Groups sync when the user logs in", "First login creates the account with the mapped roles", "Remove a user from the IdP group and the Konnect account is deactivated", "Users and teams become read-only inside Konnect", "Save needs at least one group mapped"] }, { dark: true, bodySize: 13, headSize: 16, headGap: 0.45 });
  h.src(s, "Source: developer.konghq.com/konnect-platform/sso/ (team mapping configuration, FAQs)", true);
  h.notes(s, `
PRESENTER (4 min). The practical answer to "how do we manage employee access to Konnect from our IdP?"
FLOW: an employee goes to cloud.konghq.com/login/<your path>. Konnect sends them to your IdP. The IdP authenticates them and includes a groups claim in the token. Konnect maps each group to a Konnect team. The team's roles decide what they can do.
THE TABLE IS AN EXAMPLE. Group names and team names are placeholders. A realistic setup: a platform-admins group mapped to Organization Admin; an API-developers group mapped to a custom team with the Deployer role on specific control planes; an auditors group mapped to Organization Admin (Read Only).
TWO MAPPING MODES in Organization settings, Team Mappings: "Konnect Mapping Enabled" means an admin maps new users to teams, so approval is two steps (the user logs in and gets an access error until an admin maps them). "IdP Mapping Enabled" assigns teams from the group claims automatically.
BEHAVIOUR from the docs: group membership syncs when a user logs in. Removing a user from a mapped IdP group deactivates the Konnect account. When IdP mapping is on, an org admin can see users but can't edit their team membership in Konnect. You need at least one group mapped to save.
SESSION: users sign in again after 24 hours of inactivity, or after 7 days regardless; that sign-in refreshes group membership. There is no back-channel logout, so changes aren't instant.`);

  // ───────────── C5 Entra ID and Keycloak ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Microsoft Entra ID and Keycloak notes", { placeholder: "title" });
  h.kicker(s, "C  ·  IdP specifics");
  h.card(s, 0.6, 1.8, 5.95, 3.7, "Microsoft Entra ID", { bullets: ["Kong publishes a dedicated guide: Configure SAML SSO for Konnect with Microsoft Entra ID", "Azure AD is on the verified IdP list", "Users with many groups (over about 150) can get a groups claim in a non-standard form. Filter groups at the IdP", "Add Konnect as an application, add users, set claims in your tenant"] }, { bodySize: 14, headGap: 0.55, fill: C.accent5 });
  h.card(s, 6.78, 1.8, 5.95, 3.7, "Keycloak", { bullets: ["Keycloak is on the verified IdP list", "Create a confidential OIDC client for Konnect with the redirect URI Konnect gives you", "Add a Group Membership mapper that emits a groups claim", "The issuer and endpoints must be reachable from Konnect's cloud, so a laptop Keycloak will not work for platform SSO"] }, { bodySize: 14, headGap: 0.55, fill: C.background2 });
  s.addShape(T.roundRect, { x: 0.6, y: 5.7, w: 12.13, h: 0.8, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" } });
  s.addText([{ text: "In the live demo  ", options: { bold: true, color: C.accent1 } }, { text: "Keycloak is the IdP for API clients (plane 3), not for Konnect platform login (plane 1). That is why a laptop Keycloak works there.", options: { color: C.background1 } }], { x: 0.9, y: 5.7, w: 11.6, h: 0.8, fontSize: 14, margin: 0, valign: "middle", isTextBox: true });
  h.src(s, "Source: developer.konghq.com/konnect-platform/sso/");
  h.notes(s, `
PRESENTER (3 min).
ENTRA ID: Kong publishes a complete guide, "Configure SAML SSO for Konnect with Microsoft Entra ID", linked from the SSO page. Use that rather than improvising. One gotcha called out in the SSO FAQ: when a user belongs to a very large number of groups (over roughly 150), the IdP may send the groups claim in a non-standard way and authentication breaks. The fix is group filtering at the IdP; Microsoft documents it.
KEYCLOAK: it's on the verified list. The specifics on the slide (confidential client, the redirect URI Konnect gives you, a Group Membership mapper that emits a groups claim) follow the pattern of the Okta example in the Kong docs, so mark them as "confirm": I have not validated a Konnect platform login against Keycloak end to end. Reachability is simple logic: Konnect runs in Kong's cloud, so it has to be able to reach your IdP's discovery and token endpoints.
DEMO LINK: in the live demo Keycloak runs on a laptop. It's used as an external IdP for API CLIENTS (plane 3), not for Konnect platform SSO (plane 1). That's fine, because the data plane is on the same Docker network. Make that distinction out loud.
HONESTY: if someone asks for the exact Keycloak settings, say you'll send validated steps after the session. Don't improvise.`);

  // ───────────── C6 Machine access to Konnect ─────────────
  s = pres.addSlide({ masterName: "KONG_CONTENT", sectionTitle: SEC });
  s.addText("Machines calling the Konnect API", { placeholder: "title" });
  h.kicker(s, "C  ·  Plane 2");
  h.card(s, 0.6, 1.8, 3.7, 3.3, "Personal access token", "Belongs to a person. Carries that person's roles. Good for exploring and for this workshop. Revoke it from the user's token list.", { bodySize: 14, tag: "Used in the demo", tagW: 1.7 });
  h.card(s, 4.5, 1.8, 3.7, 3.3, "System account token", "A non-human identity with its own roles and tokens. Managed by the Identity Admin role. The natural fit for pipelines.", { bodySize: 14, tag: "For automation", tagW: 1.9, fill: C.background2 });
  s.addShape(T.roundRect, { x: 8.4, y: 1.8, w: 4.33, h: 3.3, rectRadius: 0.08, fill: { color: C.text1 }, line: { type: "none" } });
  s.addText("EVERY REQUEST", { x: 8.7, y: 2.0, w: 3.7, h: 0.28, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("Authorization: Bearer $KONNECT_TOKEN", { x: 8.7, y: 2.45, w: 3.8, h: 0.7, fontSize: 14, fontFace: "Courier New", color: C.background1, margin: 0, valign: "top", isTextBox: true });
  s.addText("Regional host: https://<region>.api.konghq.com", { x: 8.7, y: 3.35, w: 3.8, h: 0.8, fontSize: 14, fontFace: "Courier New", color: C.accent1, margin: 0, valign: "top", isTextBox: true });
  s.addText("The token never goes in a file in the repo. Scripts read it from your environment.", { x: 8.7, y: 4.25, w: 3.8, h: 0.7, fontSize: 12, color: C.background2, margin: 0, valign: "top", isTextBox: true });
  s.addShape(T.roundRect, { x: 0.6, y: 5.4, w: 12.13, h: 1.0, rectRadius: 0.08, fill: { color: C.accent5 }, line: { type: "none" } });
  s.addText([{ text: "Not the same as an API client.  ", options: { bold: true } }, { text: "A token that calls the Konnect API is plane 2. A client that calls your API through a data plane is plane 3, and its record in Kong Identity is plane 4." }], { x: 0.9, y: 5.4, w: 11.6, h: 1.0, fontSize: 15, color: C.text1, margin: 0, valign: "middle", isTextBox: true });
  h.src(s, "Sources: developer.konghq.com/konnect-platform/teams-and-roles/ (Identity role) · developer.konghq.com/how-to/configure-kong-identity-oidc/");
  h.notes(s, `
PRESENTER (2 min). Plane 2.
PERSONAL ACCESS TOKEN: tied to a person, carries that person's roles. The Konnect docs' own tutorials start by creating one from the Konnect PAT page and exporting KONNECT_TOKEN. The workshop does the same. Admins with the Identity role can list and revoke user tokens.
SYSTEM ACCOUNT TOKEN: the predefined Identity Admin role covers creating system accounts and their tokens. A system account is a non-human identity with its own roles; it's the natural fit for pipelines, because it doesn't disappear when someone leaves. The docs list the capability; for the setup steps, send the customer to the system accounts documentation (I haven't covered it here).
REQUESTS: every call sends the token as a Bearer header to the regional host.
SECURITY POINT: the token never lands in the repo. environment/.env is git-ignored and the scripts also accept values already exported in your shell.
DON'T CONFUSE: this is plane 2. Your API clients in the demo (the Keycloak client) are plane 3 and 4.`);
};
