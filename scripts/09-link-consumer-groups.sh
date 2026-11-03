#!/usr/bin/env bash
# Scenario 5, steps 2–3 — map the principal to Consumer Group(s) via the RESERVED
# metadata key `consumer_groups` (a list of group UUIDs). Not an identity type.
#
#   ./09-link-consumer-groups.sh standard | gold | both | none
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
mode="${1:-standard}"
for v in DIRECTORY_ID PRINCIPAL_ID CG_STANDARD_ID CG_GOLD_ID; do need_var "$v" "Run the earlier scripts (08) first."; assert_plain "$v"; done

case "$mode" in
  standard) ids="\"$CG_STANDARD_ID\"" ;;
  gold)     ids="\"$CG_GOLD_ID\"" ;;
  both)     ids="\"$CG_STANDARD_ID\",\"$CG_GOLD_ID\"" ;;
  none)     ids="" ;;
  *) die "usage: $0 standard|gold|both|none" ;;
esac

# Send the FULL metadata object every time (read-modify-write from our local copy).
base="$GEN_DIR/principal-metadata.json"; [[ -s "$base" ]] || echo '{}' > "$base"
body="$(python3 - "$base" "$ids" <<'PY'
import json, sys
meta = json.load(open(sys.argv[1]))
ids = [i.strip().strip('"') for i in sys.argv[2].split(",") if i.strip()]
if ids: meta["consumer_groups"] = ids
else:   meta.pop("consumer_groups", None)
print(json.dumps({"metadata": meta}))
PY
)"
hdr "Set consumer_groups = $mode"
note "Groups must live in the same control plane as the plugin. If the principal also has a"
note "mapped Consumer, the gateway loads the UNION of both sets of groups."
konnect_show PATCH "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID" "$body" >/dev/null
state_set CURRENT_GROUP "$mode"
ok "principal now mapped to: $mode"
note "The gateway caches lookups (this demo sets db_cache_ttl=30). Next: ./scripts/10-test-authentication.sh groups"
