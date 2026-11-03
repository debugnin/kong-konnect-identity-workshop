#!/usr/bin/env bash
# Scenario 4, steps 1–2 — create a traditional Kong Consumer and capture its id.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var CONTROL_PLANE_ID "Run scripts/01-setup-environment.sh first."
assert_plain CONSUMER_USERNAME

deck_apply kong/consumer.yml
hdr "Retrieve the Consumer id"
resp="$(konnect_show GET "$(cp_path)/consumers/$CONSUMER_USERNAME")"
state_set CONSUMER_ID "$(printf '%s' "$resp" | jget id)"
[[ -n "$CONSUMER_ID" ]] || die "Consumer id not found"
ok "CONSUMER_ID=$CONSUMER_ID"
