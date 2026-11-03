#!/usr/bin/env bash
# Scenario 1, steps 6–7 — link the principal to the Keycloak client with an `oidc` identity.
# The identity must match the token EXACTLY: same issuer URL, same claim name and value.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var DIRECTORY_ID "Run scripts/02-create-directory.sh first."
need_var PRINCIPAL_ID "Run scripts/03-create-principal.sh first."
need_var OIDC_SUBJECT "Run scripts/01b-inspect-keycloak-token.sh first (it reads sub from a real token)."
assert_plain DIRECTORY_ID; assert_plain PRINCIPAL_ID; assert_plain OIDC_ISSUER
assert_plain OIDC_SUBJECT; assert_plain OIDC_CLAIM_NAME

note "type   oidc          : 'authenticated elsewhere — find the principal by what the token says'"
note "issuer                : $OIDC_ISSUER"
note "claim.name / value    : $OIDC_CLAIM_NAME = $OIDC_SUBJECT"

hdr "Existing identities"
ids="$(konnect GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" 2>/dev/null || true)"
already="$(printf '%s' "$ids" | python3 -c '
import sys, json, os
try: d = json.load(sys.stdin)
except Exception: sys.exit(0)
for i in (d.get("data") or []):
    c = i.get("claim") or {}
    if i.get("type") == "oidc" and i.get("issuer") == os.environ["OIDC_ISSUER"] and c.get("value") == os.environ["OIDC_SUBJECT"]:
        print(i.get("id", "yes")); break
')"
if [[ -n "$already" ]]; then
  ok "identity already present ($already)"
else
  hdr "Add the OIDC identity"
  body="{\"type\":\"oidc\",\"issuer\":\"$OIDC_ISSUER\",\"claim\":{\"name\":\"$OIDC_CLAIM_NAME\",\"value\":\"$OIDC_SUBJECT\"}}"
  konnect_show POST "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" "$body" >/dev/null
  ok "identity added"
fi

hdr "Verify the principal and its identities"
konnect_show GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID" >/dev/null
konnect_show GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" >/dev/null
ok "Kong Identity now recognises: $OIDC_ISSUER  /  $OIDC_CLAIM_NAME=$OIDC_SUBJECT"
