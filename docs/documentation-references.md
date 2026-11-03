# Documentation references

All pages read on **31 October 2026**. Kong's docs change quickly. If a page disagrees with this repo, trust the page and fix the repo.

## Pages and what they were used for

| Page | Used for |
|---|---|
| https://developer.konghq.com/konnect/ | Section A: what Konnect is, applications, data plane hosting options, tools |
| https://developer.konghq.com/identity/ | Section D overview, supported plugins, concepts |
| https://developer.konghq.com/identity/principals/ | Directories, principals, identity types, metadata, limits, caching, entity mapping, all API payloads |
| https://developer.konghq.com/konnect-platform/sso/ | Section C: OIDC/SAML SSO, verified IdPs, team mapping behaviour |
| https://developer.konghq.com/konnect-platform/teams-and-roles/ | Section C: predefined teams, roles, additive access, geo assignment |
| https://developer.konghq.com/plugins/openid-connect/reference/ | Plugin is Enterprise; supported deployments; version list (reference table did not render) |
| https://developer.konghq.com/plugins/openid-connect/changelog/ | Principal lookup added in 3.15.0.0 |
| https://developer.konghq.com/how-to/authenticate-oauth-clients-with-kong-identity/ | `principals.enabled`, `principals.directory`, `cache_tokens_salt`, directory-by-name, one directory per org |
| https://developer.konghq.com/how-to/configure-kong-identity-oidc/ | Konnect API shapes, bearer config, token request |
| https://developer.konghq.com/how-to/configure-oidc-datakit-host-routing-with-principals-metadata/ | `kong.client.principal` via Datakit, `X-Datakit-Debug-Trace`, `error_on_miss` default (401) and `false`, Gateway 3.16 |
| https://developer.konghq.com/gateway/datakit | Datakit node types, debug trace |
| https://developer.konghq.com/gateway/cp-dp-communication/ | Pinned and CA-signed data plane certificates |
| https://docs.konghq.com/konnect/gateway-manager/configuration/consumer-groups | decK example: `rate-limiting-advanced` with `consumer_group:` |
| https://developer.konghq.com/deck/ | decK apply vs sync |

## Confirmed in the docs

- Gateway 3.15+ for OpenID Connect principal lookup; 3.16 for the Datakit principal property. Principals are Konnect-only.
- OpenID Connect is an Enterprise plugin; Konnect provisions the licence.
- One directory per region by default; the plugin takes the directory **name**.
- `consumer_groups` metadata key (list of group UUIDs) maps groups; groups from a mapped Consumer are unioned; groups must be in the gateway's control plane.
- `control_plane_consumer` identity: at most one Consumer per control plane per principal.
- Default lookup cache is the smallest of directory TTL (10 min), credential TTL and `db_cache_ttl`.
- Limits: 100,000 principals per directory, 10 identities, 50 metadata keys, 100 uncached lookups/s per directory.
- Verified SSO IdPs: Okta, Azure AD, Oracle IDCS, Keycloak. OIDC and SAML cannot be combined.

## Not verified. Treat as open until a real run settles them

| Item | Why it matters | How the repo copes |
|---|---|---|
| Kong Identity availability stage (GA vs preview) and org entitlement | Customer commitments | Flagged in the presenter notes only (not on slides); script 00 checks API reachability only |
| Full `principals.*` plugin field list | Reference table did not render | Only fields shown in Kong's how-tos are used |
| `X-Consumer-*` headers for a principal-mapped Consumer | Demo 4 evidence | Datakit trace of `GET_CONSUMER` is the fallback; test prints both |
| Datakit runs `GET_CONSUMER` when nothing consumes its output | Same | Shown in trace; if absent, rely on headers |
| Response bodies of GET principal / identities, create-control-plane, `dp-client-certificates` (`item.id`) | Script parsing | Parsing is tolerant; failures print the body |
| Control plane create payload (`cluster_type`, `auth_type: pinned_client_certs`) | Script 01 | Error body printed on failure |
| `db_cache_ttl=30` shortening principal lookup cache | Demos 4 and 5 timing | Tests poll with fresh tokens up to 120 s |
| Rate Limiting Advanced honouring groups loaded via principals | Demo 5 | If no 429, see troubleshooting |
| Keycloak `${VAR}` substitution in realm import | Client secrets | Token fetch fails with a clear Keycloak error |
| Image tags `kong-gateway:3.16`, `keycloak:26.0.7`, `go-httpbin:2.15.0` | Startup | Overridable in `.env` |
| Keycloak settings for Konnect *platform* SSO | Slide 23 | Flagged in the slide 23 presenter notes only; validate before promising specifics |
| System account setup steps | Slide 24 | Capability cited only |
