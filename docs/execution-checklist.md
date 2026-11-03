# Execution checklist

## A. One clean validation run (do this once, days before the session)

This is the step nobody has done yet. Allow 45 minutes. Keep the terminal output.

- [ ] `cp environment/.env.example environment/.env`; set `KONNECT_TOKEN` and `KONNECT_REGION`
- [ ] `./scripts/00-preflight.sh` passes with no warnings you cannot explain
- [ ] `./scripts/01-setup-environment.sh` completes; data plane node visible in Konnect with the label `created-by:identity-workshop`
- [ ] `01b`: `iss` equals `http://keycloak:8080/realms/kong-workshop`; `aud` contains `kong-workshop-api`
- [ ] `02`, `03`, `04` complete; principal and `oidc` identity visible in the Konnect UI (Identity → Principals)
- [ ] `05` completes
- [ ] `10 basic`: **8 passed, 0 failed**
- [ ] `06`, `07`, `10 consumer`: note whether `X-Consumer-*` headers appeared or only the trace did
- [ ] `08`, `09 standard`, `10 groups`: `200 200 200 429 429`
- [ ] `09 gold`, `10 groups`: five `200`
- [ ] `99-cleanup.sh` removes everything it created and leaves a pre-existing directory alone
- [ ] Write down every deviation from this document and send them to the workshop owner

## B. Questions to settle with your Kong contact first

- [ ] Is Kong Identity enabled for the customer's org, and what is its availability stage?
- [ ] Is the customer on a deployment type (serverless, dedicated cloud gateway) with a different network path?

## C. Day before

- [ ] Run `00` to `05` against the customer-facing org or a clean one
- [ ] Pull images: `docker compose --env-file .generated/compose.env -f docker/docker-compose.yml pull`
- [ ] Open `demo.http` in your editor; confirm environment variables resolve
- [ ] Prepare a read-only Konnect user for the UI tour
- [ ] Read the notes on slides 3, 31, 40 and 41; they hold the honest caveats

## D. Session

- [ ] Scripts `00` to `05` already run; data plane connected
- [ ] Terminal font large; token never shown on screen (scripts never print it)
- [ ] Keep `docs/troubleshooting.md` open

## E. After

- [ ] `./scripts/99-cleanup.sh` (confirm each prompt)
- [ ] Leave the repo with the customer; `environment/.env` and `.generated/` are not in git
