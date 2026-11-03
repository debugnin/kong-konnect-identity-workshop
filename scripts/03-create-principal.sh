#!/usr/bin/env bash
# Scenario 1, steps 4–5 — create a principal and attach metadata.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var DIRECTORY_ID "Run scripts/02-create-directory.sh first."
assert_plain DIRECTORY_ID; assert_plain PRINCIPAL_NAME

META='{"business_unit":"payments","environment":"workshop"}'
note "display_name : human-readable label; surfaces as principal.display_name in the gateway"
note "metadata     : free-form key/values the gateway can read and use in policy (max 50 keys)"

hdr "Look for an existing principal named '$PRINCIPAL_NAME'"
found=""
if list="$(konnect GET "/v2/directories/$DIRECTORY_ID/principals" 2>/dev/null)"; then
  found="$(printf '%s' "$list" | jfind data display_name "$PRINCIPAL_NAME" || true)"
fi
if [[ -n "$found" ]]; then
  state_set PRINCIPAL_ID "$(printf '%s' "$found" | jget id)"
  ok "reusing principal $PRINCIPAL_ID"
else
  hdr "Create the principal (with metadata in the same call)"
  body="{\"display_name\":\"$PRINCIPAL_NAME\",\"description\":\"Machine client for the Kong Identity workshop\",\"metadata\":$META}"
  resp="$(konnect_show POST "/v2/directories/$DIRECTORY_ID/principals" "$body")"
  state_set PRINCIPAL_ID "$(printf '%s' "$resp" | jget id)"
  ok "created principal $PRINCIPAL_ID"
fi
[[ -n "$PRINCIPAL_ID" ]] || die "No principal id returned"

# Keep our own copy of the metadata. Later scripts send the FULL object on every PATCH,
# so we never depend on whether the API merges or replaces the metadata field.
if [[ ! -s "$GEN_DIR/principal-metadata.json" ]]; then printf '%s\n' "$META" > "$GEN_DIR/principal-metadata.json"; fi

hdr "Verify"
konnect_show GET "/v2/directories/$DIRECTORY_ID/principals/$PRINCIPAL_ID" >/dev/null
ok "PRINCIPAL_ID=$PRINCIPAL_ID"
