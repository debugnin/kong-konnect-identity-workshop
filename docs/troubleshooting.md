# Troubleshooting

Start with `./scripts/00-preflight.sh`. It changes nothing and names the first thing that is wrong.

| Symptom | Likely cause | Fix |
|---|---|---|
| Preflight: "Konnect rejected the token" | Wrong or expired token, or wrong `KONNECT_REGION` | Create a new personal access token; set the region your org uses |
| Preflight warns the directories API did not answer | Kong Identity not enabled for the org, or the token's user lacks Identity permissions | Ask your Kong contact; give the user Identity Admin or Organization Admin |
| Script 01 stuck on "data plane is ready" | Certificate not pinned, wrong region, outbound 443 to Konnect blocked, or image pull failed | `docker compose --env-file .generated/compose.env -f docker/docker-compose.yml logs kong-dp`; rerun 01 |
| Script 01: control plane response missing endpoints | Konnect response shape differs from what the script reads | The script prints the response; adjust the `jget` paths in 01 |
| Keycloak never answers | Slow first start or port 8080 busy | `docker compose … logs keycloak`; free port 8080 |
| 01b: "Could not get a token" / `unauthorized_client` | Realm secret placeholders not substituted | Check `docker compose … logs keycloak` for the import; if `${DEMO_CLIENT_SECRET}` is literal, set the secret in the Keycloak admin console to the value in `.generated/state.env` |
| 01b warns `iss` differs from `OIDC_ISSUER` | Keycloak hostname setting not applied | Confirm `KC_HOSTNAME: http://keycloak:8080` in the compose file. The plugin issuer and the principal identity must equal the token's `iss` exactly |
| 02: 403 when creating a directory | One already exists in the region | Script 02 reuses it. Nothing to do |
| Test C returns 401 for the mapped client | Principal's `sub` ≠ token's `sub` (Keycloak uses the service-account user id), or issuer differs | Rerun 01b then 04; compare `GET …/identities` with the token claims |
| Plugin "cannot find directory" | The directory **ID** was used where the **name** is required | `DIRECTORY_NAME` is what goes in `principals.directory` |
| Every token gets 401, including mapped | Issuer unreachable from the data plane container, or audience missing | `docker exec` into `kong-dp` and `curl http://keycloak:8080/realms/kong-workshop/.well-known/openid-configuration`; check `aud` contains `kong-workshop-api` |
| decK complains about `cache_tokens_salt` | decK 1.59+ requires it | Script 01 generates `DECK_TOKEN_SALT`; run 01 first, and run decK through the scripts |
| decK: environment variable not set | Script not run via the library | Run the numbered scripts, not `deck` directly, or export the `DECK_*` variables from `scripts/lib/common.sh` |
| Metadata or group change not visible | Lookup cache. Demo sets `db_cache_ttl=30`; default is up to 10 min | Wait. Tests poll with fresh tokens up to `PROPAGATION_TIMEOUT` (default 120 s) |
| Consumer headers absent after linking (Demo 4) | Cache not yet refreshed, or the gateway does not add `X-Consumer-*` for principal-mapped Consumers | Wait 30 s; read the Datakit trace the test prints. Report which one you saw |
| No 429 in the groups test | Plugin does not see groups loaded via the principal, or the cache still serves the old mapping | Check `X-Principal-Consumer-Groups`; wait for the cache; confirm the plugin is `rate-limiting-advanced` scoped with `consumer_group` |
| Second run of the groups test fails | Mid-window counters (30 s fixed window) | Wait 31 s and rerun |

## Debugging the OpenID Connect plugin

From the plugin documentation: set the gateway log level to `debug` and filter the error log for `openid-connect`; set `config.display_errors: true`; temporarily set `verify_nonce`, `verify_claims` or `verify_signature` to `false` to isolate a failure. Revert afterwards.

For Datakit, add `X-Datakit-Debug-Trace: true` to a request to get a node-by-node trace.

## Inspecting state

```bash
cat .generated/state.env          # ids and generated secrets (never share)
./scripts/01b-inspect-keycloak-token.sh
```

## Offline tests

`tests/run-mock-test.sh` and `tests/run-negative-tests.sh` need only bash, python3 with PyYAML, and curl. A pass means the scripts are internally consistent. It says nothing about Konnect.
