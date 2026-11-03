# Workshop guide

Target audience: customer engineers, platform administrators, API developers, infrastructure teams. Presenter: a Kong Solutions Architect. Duration: about 105 minutes.

## Run of show

| Min | Block | Slides | Type | Goal |
|---|---|---|---|---|
| 5 | Opening | 1–3 | Concept | Set the contract; walk the prerequisites. Read the slide 3 notes first: they hold the availability caveats |
| 15 | A. Konnect | 4–9 | Concept | Control plane vs data plane; who owns what; regions |
| 20 | B. Navigating | 10–17 | Concept + 5 min live tour | Six areas, four questions each; tools and workflows |
| 15 | C. Account access | 18–24 | Concept | Four kinds of "who are you?"; RBAC; SSO; machine access |
| 15 | D. Kong Identity | 25–32 | Concept | Five nouns; authenticate vs hydrate; mapping; limits |
| 30 | Live demo | 33–41 | Live | Five demos, one request path |
| 5 | Wrap-up | 42–44 | Concept | Migration path; takeaways; references |
| — | Appendix | 45–46 | Reference | Troubleshooting; repo map |

If you run long, shorten B. Do not shorten the demo.

## Brief-to-slide map

| Brief requirement | Slides |
|---|---|
| A: what Konnect is, architecture, org/regions, CP vs DP, config flow, Konnect vs Gateway | 5–9, 16 |
| Architecture diagram Customer → … → Upstream | 6 |
| B: twelve UI areas, each with what/why/when/watch-for | 11–17 |
| C: users, teams, roles, RBAC, built-in, SSO (OIDC, SAML), Entra and Keycloak, group mapping | 20–23 |
| C: service accounts and API authentication; the four distinctions | 19, 24 |
| C: external IdP example for employee access | 22 |
| D: directory, principal, credential, identity, metadata, consumer mapping | 27–31 |
| D: pipeline diagram and authenticate vs hydrate | 29–30 |
| Demo scenarios 1–5 | 35–41 (run order in the table below) |

## Demo order

| Run order | Demo | Brief scenario | Scripts |
|---|---|---|---|
| 1 | Read the token | 2 | 01b |
| 2 | Provision Kong Identity | 1 | 02, 03, 04 |
| 3 | Gateway tests | 3 | 05, `10 basic` |
| 4 | Consumer link | 4 | 06, 07, `10 consumer` |
| 5 | Consumer Groups | 5 | 08, 09, `10 groups` |

## Facts to be strict about

- Gateway 3.15+ for principal lookup in the OpenID Connect plugin; 3.16 for Datakit's principal property.
- Principals are Konnect-only.
- One directory per region; the plugin takes the **name**.
- Consumer Groups map through the reserved `consumer_groups` metadata key. Never through identities.
- A principal is not a Konnect user or a Dev Portal developer.
- Do not say "GA". The docs carry no beta label; that is not a GA statement. Confirm with Kong. This caveat is in the presenter notes only; the slides do not show status flags.

## Customer-provided vs staged

Customer: `KONNECT_TOKEN`, `KONNECT_REGION`, Docker, decK. Everything else is staged and listed in `environment/.env.example`.

## Handling the open items live

Say what you see. If `X-Consumer-*` headers do not appear in Demo 4, show the Datakit trace instead and report it to Kong afterwards. Customers trust a presenter who debugs calmly.

## Presenter notes

Every slide has notes with: what to say, timing, the exact commands, doc sources and caveats. Lines headed "BRIEF MAPPING" are for the presenter; delete them before sharing the deck externally.
