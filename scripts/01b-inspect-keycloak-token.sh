#!/usr/bin/env bash
# Scenario 2 — get a Client Credentials token from Keycloak and read it like Kong will.
# Also records the issuer and subject that Kong Identity must match (script 04).
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"

hdr "Request: Client Credentials grant"
note "POST $KEYCLOAK_URL_HOST/realms/$KEYCLOAK_REALM/protocol/openid-connect/token"
note "grant_type=client_credentials  client_id=$DEMO_CLIENT_ID  client_secret=•••• (generated, in .generated/state.env)"
tok="$(demo_token)" || die "Could not get a token. Is Keycloak up and the realm imported? See docs/troubleshooting.md"

hdr "JWT header"
decode_jwt "$tok" header | sed 's/^/    /' >&2
hdr "JWT claims (what the OpenID Connect plugin verifies)"
decode_jwt "$tok" payload | sed 's/^/    /' >&2

claims="$(decode_jwt "$tok" payload)"
iss="$(printf '%s' "$claims" | jget iss)"
sub="$(printf '%s' "$claims" | jget sub)"
aud="$(printf '%s' "$claims" | jget aud)"
azp="$(printf '%s' "$claims" | jget azp)"

hdr "The claims that matter"
printf '    %-10s %s\n' "iss"  "$iss   ← who issued it. Goes in the plugin's issuer AND the principal's OIDC identity" >&2
printf '    %-10s %s\n' "sub"  "$sub   ← who it is. Keycloak uses the service-account USER id, not the client id" >&2
printf '    %-10s %s\n' "aud"  "$aud   ← who it is for. Must contain '$API_AUDIENCE' (plugin 'audience')" >&2
printf '    %-10s %s\n' "azp"  "$azp   ← the client that asked (not used for lookup here)" >&2

[[ "$iss" == "$OIDC_ISSUER" ]] || warn "iss ($iss) differs from OIDC_ISSUER ($OIDC_ISSUER). The gateway must be able to reach the iss URL, and Kong Identity matches on it exactly."
printf '%s' "$aud" | grep -q "$API_AUDIENCE" || warn "Audience '$API_AUDIENCE' is not in the token — the audience mapper in keycloak/realm-export.json did not apply."

state_set OIDC_ISSUER "$iss"
state_set OIDC_SUBJECT "$sub"
ok "recorded OIDC_ISSUER and OIDC_SUBJECT for script 04"

hdr "Second client (will have NO principal — used in Test B)"
utok="$(unmapped_token)" && printf '    sub = %s\n' "$(decode_jwt "$utok" payload | jget sub)" >&2
