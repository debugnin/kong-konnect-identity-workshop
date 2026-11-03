#!/usr/bin/env bash
# Scenario 3 tests (A, B, C) plus the Consumer and Consumer Group checks.
#   ./10-test-authentication.sh basic      Tests A, B (both error_on_miss modes), C
#   ./10-test-authentication.sh consumer   Scenario 4: the mapped Consumer is in the request context
#   ./10-test-authentication.sh groups     Scenario 5: group-scoped policy for the current mapping
#   ./10-test-authentication.sh all
# Exits non-zero if any check fails.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
mode="${1:-basic}"
need_var PRINCIPAL_ID "Run scripts 02–05 first."

show_hdrs() {  # show_hdrs BODY — print the headers Kong derived from principal/consumer
  python3 -c '
import sys, json
d = json.loads(sys.stdin.read() or "{}")
for k, v in sorted((d.get("headers") or {}).items()):
    if k.lower().startswith(("x-principal", "x-consumer", "x-credential", "x-anonymous")):
        print("    %-30s %s" % (k, v[0] if isinstance(v, list) and v else v))' <<<"$1" >&2
}

test_basic() {
  hdr "Test A — no access token"
  note "Expected: 401. Nothing to verify, nothing to look up."
  check "request without a token is rejected" 401 "$(proxy_status)"

  hdr "Test B — valid token, but NO matching principal (default error_on_miss)"
  note "The token is perfectly valid at Keycloak. Kong Identity has never heard of this client."
  check "verified token + no principal ⇒ 401" 401 "$(proxy_status "$(unmapped_token)")"

  hdr "Test B′ — same token with principals.error_on_miss: false"
  deck_apply kong/plugins.error-on-miss-false.yml
  # (polling below uses fresh tokens so the plugin's token cache cannot hide the change)
  start="$(date +%s)"; code=000
  while :; do
    code="$(proxy_status "$(unmapped_token)")"
    [[ "$code" == 200 ]] && break
    (( $(date +%s) - start > PROPAGATION_TIMEOUT )) && break; sleep 3
  done
  check "verified token + no principal ⇒ 200 (principal is null)" 200 "$code"
  if [[ "$code" == 200 ]]; then
    body="$(proxy_body "$(unmapped_token)")"
    note "Headers Kong sent upstream (principal is absent, so Datakit wrote 'none'):"
    show_hdrs "$body"
    check "X-Principal-Id is 'none' for the unmapped client" none "$(header_value "$body" X-Principal-Id)"
  fi
  hdr "Restore the default (error_on_miss true)"
  deck_apply kong/plugins.yml
  start="$(date +%s)"
  while :; do
    code="$(proxy_status "$(unmapped_token)")"
    [[ "$code" == 401 ]] && break
    (( $(date +%s) - start > PROPAGATION_TIMEOUT )) && break; sleep 3
  done
  check "default behaviour restored (401)" 401 "$code"

  hdr "Test C — valid token AND a matching principal"
  tok="$(demo_token)"
  code="$(proxy_status "$tok")"
  check "mapped client is authenticated" 200 "$code"
  body="$(proxy_body "$(demo_token)")"
  note "What the upstream received — this is the principal inside the gateway request context:"
  show_hdrs "$body"
  check "principal id in the request context matches Kong Identity" "$PRINCIPAL_ID" "$(header_value "$body" X-Principal-Id)"
  check "principal metadata was hydrated (business_unit)" payments "$(header_value "$body" X-Principal-Business-Unit)"
}

test_consumer() {
  need_var CONSUMER_ID "Run scripts 06 and 07 first."
  hdr "Scenario 4 — the mapped Consumer is loaded into the request context"
  start="$(date +%s)"; body=""
  while :; do
    body="$(proxy_body "$(demo_token)")"
    [[ "$(header_value "$body" X-Consumer-Id)" == "$CONSUMER_ID" ]] && break
    (( $(date +%s) - start > PROPAGATION_TIMEOUT )) && break; sleep 3
  done
  show_hdrs "$body"
  check "X-Consumer-Id equals the linked Consumer" "$CONSUMER_ID" "$(header_value "$body" X-Consumer-Id)"
  check "X-Consumer-Username equals the Consumer's username" "$CONSUMER_USERNAME" "$(header_value "$body" X-Consumer-Username)"
  hdr "Datakit trace: GET_CONSUMER node output"
  trace="$(proxy_body "$(demo_token)" -H 'X-Datakit-Debug-Trace: true')"
  printf '%s' "$trace" | python3 -c '
import sys
t = sys.stdin.read()
i = t.find("GET_CONSUMER")
print("    …" + t[max(0, i-20):i+400].replace("\n", " ") + "…" if i >= 0 else "    (no GET_CONSUMER entry found in trace output)")' >&2
}

test_groups() {
  grp="${CURRENT_GROUP:-$(state_get CURRENT_GROUP)}"; grp="${grp:-none}"
  hdr "Scenario 5 — group-scoped policy; principal is mapped to: $grp"
  note "Rate limit counters are per group, in a 30 s fixed window. Re-running inside 30 s may start mid-window."
  case "$grp" in
    standard)
      # wait until the cache serves the standard mapping (first 429 or a full 3x200 run proves it)
      codes=""; for i in 1 2 3 4 5; do codes="$codes $(proxy_status "$(demo_token)")"; done
      note "status codes:$codes"
      set -- $codes
      check "first three requests allowed (limit 3 / 30 s)" "200 200 200" "$1 $2 $3"
      check "fourth request is rate limited by tier-standard" 429 "$4"
      check "fifth request is rate limited by tier-standard" 429 "$5" ;;
    gold)
      note "Waiting for the gateway to pick up the new group mapping (up to ${PROPAGATION_TIMEOUT}s)…"
      start="$(date +%s)"; code=000
      while :; do code="$(proxy_status "$(demo_token)")"; [[ "$code" == 200 ]] && break
        (( $(date +%s) - start > PROPAGATION_TIMEOUT )) && break; sleep 3; done
      check "request allowed once tier-gold is in effect" 200 "$code"
      codes=""; for i in 1 2 3 4 5; do codes="$codes $(proxy_status "$(demo_token)")"; done
      note "status codes:$codes"
      set -- $codes
      check "five more requests all allowed (limit 10 / 30 s)" "200 200 200 200 200" "$*" ;;
    *)
      codes=""; for i in 1 2 3 4 5; do codes="$codes $(proxy_status "$(demo_token)")"; done
      note "status codes:$codes"
      set -- $codes
      check "no group ⇒ no group-scoped policy ⇒ all allowed" "200 200 200 200 200" "$*" ;;
  esac
  body="$(proxy_body "$(demo_token)" 2>/dev/null || true)"
  note "metadata as hydrated (X-Principal-Consumer-Groups): $(header_value "$body" X-Principal-Consumer-Groups)"
}

case "$mode" in
  basic) test_basic ;;
  consumer) test_consumer ;;
  groups) test_groups ;;
  all) test_basic; test_consumer; test_groups ;;
  *) die "usage: $0 basic|consumer|groups|all" ;;
esac
summary
