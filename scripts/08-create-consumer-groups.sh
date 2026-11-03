#!/usr/bin/env bash
# Scenario 5, steps 1 — two Consumer Groups, each with a group-scoped rate limit.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var CONTROL_PLANE_ID "Run scripts/01-setup-environment.sh first."
deck_apply kong/consumer-groups.yml
for g in standard gold; do
  resp="$(konnect GET "$(cp_path)/consumer_groups/tier-$g")"
  id="$(printf '%s' "$resp" | jget consumer_group.id)"; [[ -n "$id" ]] || id="$(printf '%s' "$resp" | jget id)"
  [[ -n "$id" ]] || die "Consumer group tier-$g not found"
  state_set "CG_$(printf '%s' "$g" | tr 'a-z' 'A-Z')_ID" "$id"
  ok "tier-$g = $id"
done
note "tier-standard: 3 requests / 30 s      tier-gold: 10 requests / 30 s   (Rate Limiting Advanced, per group)"
