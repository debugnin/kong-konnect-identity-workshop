#!/usr/bin/env bash
# Scenario 1, steps 1–3 — authenticate to the Konnect API, then get-or-create the directory.
# A Konnect org has ONE directory per region, so an existing one is reused, never duplicated.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var KONNECT_TOKEN

hdr "Authenticate: Bearer \$KONNECT_TOKEN against $KONNECT_API_URL"
konnect GET '/v2/directories' >/dev/null && ok "token accepted"

hdr "Look for an existing directory"
list="$(konnect_show GET /v2/directories)"
dir_id="$(printf '%s' "$list" | jget data.0.id)"
if [[ -n "$dir_id" ]]; then
  dir_name="$(printf '%s' "$list" | jget data.0.name)"
  ok "reusing directory '$dir_name' ($dir_id)"
  # Remember who created it: a re-run must never turn "ours" into "pre-existing".
  [[ -n "$(state_get DIRECTORY_CREATED_BY_WORKSHOP)" ]] || state_set DIRECTORY_CREATED_BY_WORKSHOP "no"
else
  hdr "None found — create one"
  body='{"name":"kong-identity-directory","description":"Directory for the Kong Identity workshop","allow_all_control_planes":true}'
  note "name: how the OpenID Connect plugin refers to it (principals.directory)"
  note "allow_all_control_planes: any control plane in this region may look principals up"
  resp="$(konnect_show POST /v2/directories "$body")"
  dir_id="$(printf '%s' "$resp" | jget id)"; dir_name="$(printf '%s' "$resp" | jget name)"
  state_set DIRECTORY_CREATED_BY_WORKSHOP "yes"
fi
[[ -n "$dir_id" && -n "$dir_name" ]] || die "Could not determine directory id/name"
state_set DIRECTORY_ID "$dir_id"
state_set DIRECTORY_NAME "$dir_name"
ok "DIRECTORY_ID=$DIRECTORY_ID"
ok "DIRECTORY_NAME=$DIRECTORY_NAME   ← this one goes into the plugin config"
