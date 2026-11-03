# Kong Konnect and Kong Identity: customer enablement workshop

A 90–120 minute, hands-on workshop for customer engineers and platform teams, plus a demo they can rerun themselves.

**Deliverables**

| What | Where |
|---|---|
| 46-slide deck with presenter notes | `presentation/kong-konnect-identity-workshop.pptx` |
| Runnable demo (Keycloak, Kong Gateway 3.16 data plane, Konnect, Kong Identity) | `docker/`, `keycloak/`, `kong/`, `scripts/` |
| Presenter docs | `docs/` |

> **Read this first: validation status.** The scripts were exercised end to end against an **offline mock** of Konnect, Keycloak and the gateway (`tests/run-mock-test.sh`, `tests/run-negative-tests.sh`). That proves script logic, idempotency and failure handling. It does **not** prove Konnect behaves as the mock does. **Nobody has yet run this against a real Konnect org.** Do one clean run (see `docs/execution-checklist.md`) before any customer session, and treat the items in `docs/documentation-references.md` under "Not verified" as open.

## What you need

| You provide | Notes |
|---|---|
| A Konnect org with Kong Identity available | Script `00` checks that the directories API answers. Confirm availability stage with your Kong contact. |
| A Konnect personal access token | Whose user can create control planes and manage Kong Identity. |
| Docker with the `docker compose` v2 plugin | Pulls three images on first run. |
| [decK](https://developer.konghq.com/deck/) 1.69+ | Applies gateway entities. |
| `curl`, `python3`, `openssl`, bash | `python3` replaces `jq`. |
| Internet access | Konnect and Kong Identity are SaaS. This demo cannot run offline. |

Everything else is staged: the Keycloak realm and clients, the upstream, image tags and resource names. Demo secrets are generated into `.generated/` (git-ignored).

## Quick start

```bash
cp environment/.env.example environment/.env     # set KONNECT_TOKEN and KONNECT_REGION
./scripts/00-preflight.sh
./scripts/01-setup-environment.sh                # Keycloak, httpbin, control plane, data plane
./scripts/01b-inspect-keycloak-token.sh          # Demo 1: read the token
./scripts/02-create-directory.sh                 # Demo 2
./scripts/03-create-principal.sh
./scripts/04-create-oidc-identity.sh
./scripts/05-configure-gateway.sh                # Demo 3
./scripts/10-test-authentication.sh basic        # tests A, B, B', C
./scripts/06-create-consumer.sh                  # Demo 4
./scripts/07-link-consumer.sh
./scripts/10-test-authentication.sh consumer
./scripts/08-create-consumer-groups.sh           # Demo 5
./scripts/09-link-consumer-groups.sh standard
./scripts/10-test-authentication.sh groups       # expect 200 200 200 429 429
./scripts/09-link-consumer-groups.sh gold
./scripts/10-test-authentication.sh groups       # expect five 200s
./scripts/99-cleanup.sh                          # asks before each deletion
```

Every script is safe to rerun. Nothing is ever written to a file outside `.generated/`. `deck gateway apply` is used throughout, which only adds and updates.

## Layout

```
presentation/   deck + build script (cd presentation/build && node build-deck.js)
docker/         docker-compose.yml
keycloak/       realm-export.json
kong/           decK state files (service, route, plugins, consumer, groups)
scripts/        00 … 10, 99, lib/common.sh
requests/       demo.http (VS Code REST Client / JetBrains)
environment/    .env.example
architecture/   Mermaid diagrams
tests/          offline mock + test drivers
docs/           workshop guide, walkthrough, troubleshooting, references, checklist
```

## Deviations from the original brief

| Brief | What we did, and why |
|---|---|
| Scenario 1 before Scenario 2 | Keycloak first: the principal's OIDC identity needs the issuer and subject from a real token. |
| `client_id`, `client_secret`, `client_credentials_param_type` in the plugin | Omitted. They belong to the pattern where Kong exchanges credentials; with a bearer token the client already holds, `auth_methods: [bearer]` is correct. |
| `DIRECTORY_ID` for the plugin | The plugin needs the directory **name**. Both are tracked. |
| `kong.yml` / `plugins.yml` as plain YAML | decK state files with environment substitution, applied to a Konnect-managed control plane. |
| Create the directory | Get-or-create: an org has one directory per region. |
| Scenario 5 policy | Rate Limiting Advanced scoped to each Consumer Group (Enterprise plugin). |
| Extra scripts | `00-preflight`, `01b`, `99-cleanup`, and an offline `tests/` harness. |

## Rebuilding the deck

The finished `.pptx` is included; you only need to rebuild to change content. `cd presentation/build && node build-deck.js` needs `pptxgenjs` installed and the `applyTheme` helper that ships with the Claude pptx skill (`/mnt/skills/public/pptx/scripts/apply_theme.js`, path set in `build-deck.js`). Without that helper the deck builds but its theme colours fall back to Office defaults; edit the file in PowerPoint instead if you do not have it.

## Brand and fonts

The deck follows the Kong brand colours (Navy Green, Electric Lime, Bay, White). It uses Arial and Courier New so it renders identically everywhere; to switch to Funnel Sans and Roboto Mono edit the three font constants at the top of `presentation/build/lib.js` and rebuild. The deck contains no logo; add the official one to the title layout.
