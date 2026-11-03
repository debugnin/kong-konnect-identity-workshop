#!/usr/bin/env bash
# Scenario 4, steps 3–4 — add a control_plane_consumer identity to the principal.
# From now on, when this principal is hydrated, the mapped Consumer is loaded too,
# so existing Consumer-scoped plugins keep working during a migration.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
for v in DIRECTORY_ID PRINCIPAL_ID CONTROL_PLANE_ID CONSUMER_ID; do need_var "$v" "Run the earlier scripts first."; assert_plain "$v"; done

note "type control_plane_consumer : 'this principal IS that Consumer, in that control plane'"
note "limit: one Consumer per control plane per principal"

hdr "Existing identities"
ids="$(konnect GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" 2>/dev/null || true)"
already="$(printf '%s' "$ids" | python3 -c '
import sys, json, os
try: d = json.load(sys.stdin)
except Exception: sys.exit(0)
for i in (d.get("data") or []):
    if i.get("type") == "control_plane_consumer" and i.get("consumer_id") == os.environ["CONSUMER_ID"]:
        print("yes"); break
')"
if [[ -n "$already" ]]; then ok "consumer identity already linked"
else
  hdr "Link the Consumer"
  body="{\"type\":\"control_plane_consumer\",\"control_plane_id\":\"$CONTROL_PLANE_ID\",\"consumer_id\":\"$CONSUMER_ID\"}"
  konnect_show POST "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" "$body" >/dev/null
  ok "linked"
fi
hdr "Verify"
konnect_show GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID/identities" >/dev/null
note "Next: ./scripts/10-test-authentication.sh consumer   (allow up to ~30 s for the lookup cache)"
