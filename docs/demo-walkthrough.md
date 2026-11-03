# Demo walkthrough

Expected outputs below come from the **offline mock**, so formatting and ids will differ on a real org. What must match is the status codes and the PASS lines.

Prerequisite: `environment/.env` has `KONNECT_TOKEN` and `KONNECT_REGION`; `./scripts/00-preflight.sh` passed.

## 0. Setup

```bash
./scripts/01-setup-environment.sh
```
Expect: secrets generated, Keycloak realm serving discovery, control plane created (or reused), certificate pinned, "data plane is ready". Takes 2–5 minutes first time.

UI to show: Konnect → API Gateway → `kong-identity-workshop` → Data plane nodes.

## Demo 1: read the token (brief Scenario 2)

```bash
./scripts/01b-inspect-keycloak-token.sh
```
Shows the Client Credentials request, the decoded JWT header and claims, and the four claims that matter. Point at `iss`, `sub`, `aud`.

If you want the manual Keycloak UI steps: open http://localhost:8080 (admin, password in `.generated/state.env` as `KC_ADMIN_PASSWORD`) → realm `kong-workshop` → Clients → `workshop-demo-client` → Credentials / Service account roles. The realm is imported from `keycloak/realm-export.json`; nothing needs creating by hand.

Explain: Client ID, Client Secret, Issuer, Subject (in Keycloak, the service-account user id), Audience, Access token.

## Demo 2: provision Kong Identity (Scenario 1)

```bash
./scripts/02-create-directory.sh     # get-or-create the directory
./scripts/03-create-principal.sh     # principal + metadata
./scripts/04-create-oidc-identity.sh # oidc identity from the real issuer + sub
```
Expect: directory id and name; principal id; "Kong Identity now recognises: <issuer> / sub=<uuid>". Payloads are printed (the token never is).

Fields: see slides 36–37. Payloads are also in `requests/demo.http`.

## Demo 3: gateway and tests (Scenario 3)

```bash
./scripts/05-configure-gateway.sh
./scripts/10-test-authentication.sh basic
```
Expect: `8 passed, 0 failed`:
- A: no token → 401
- B: unmapped client → 401 (default `error_on_miss`)
- B′: with `error_on_miss: false` → 200 and `X-Principal-Id: none`; then restored to 401
- C: mapped client → 200; `X-Principal-Id` equals the principal id; `X-Principal-Business-Unit: payments`

Inspect the principal inside the request context:
```bash
TOKEN=$( . scripts/lib/common.sh; demo_token )
curl -s -H "Authorization: Bearer $TOKEN" -H "X-Datakit-Debug-Trace: true" http://localhost:8000/anything
```

## Demo 4: link a Consumer (Scenario 4)

```bash
./scripts/06-create-consumer.sh
./scripts/07-link-consumer.sh
./scripts/10-test-authentication.sh consumer
```
Expect: `X-Consumer-Id` and `X-Consumer-Username` among the echoed headers, plus a Datakit trace excerpt for `GET_CONSUMER`. **Open item:** header presence is the expected evidence, not a documented guarantee. Report what you see.

Migration point: existing Consumer-scoped plugins keep working when a mapped Consumer loads with the principal.

## Demo 5: Consumer Groups (Scenario 5)

```bash
./scripts/08-create-consumer-groups.sh
./scripts/09-link-consumer-groups.sh standard
./scripts/10-test-authentication.sh groups      # 200 200 200 429 429
./scripts/09-link-consumer-groups.sh gold
./scripts/10-test-authentication.sh groups      # waits for cache; then five 200s
```
Group linkage is the reserved `consumer_groups` metadata key. `09` always sends the full metadata object. Wait ~30 s after `09`; the demo sets `db_cache_ttl` to 30 s.

Optional: `./scripts/09-link-consumer-groups.sh both` to discuss multiple groups. The outcome of two group policies is not validated; do not predict it.

## Cleanup

```bash
./scripts/99-cleanup.sh        # prompts; never deletes a pre-existing directory
```
