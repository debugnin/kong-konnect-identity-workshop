#!/usr/bin/env bash
# Negative tests: the scripts must fail LOUDLY (non-zero exit, clear message) when something is wrong.
set -u
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
W="$(mktemp -d)"; cp -R "$SRC/." "$W/"; rm -rf "$W/.generated"; mkdir -p "$W/.generated"
export MOCK_WORKDIR="$W" ENV_FILE=/dev/null STUB_LOG="$W/d.log" PATH="$W/tests/bin:$PATH"
export KONNECT_API_URL=http://127.0.0.1:18080 KEYCLOAK_URL_HOST=http://127.0.0.1:18081 PROXY_URL=http://127.0.0.1:18000 DP_STATUS_URL=http://127.0.0.1:18100 PROPAGATION_TIMEOUT=6 VERBOSE=0
python3 "$W/tests/mock_env.py" >"$W/m.log" 2>&1 & MP=$!
trap 'kill $MP 2>/dev/null; rm -rf "$W"' EXIT
for i in $(seq 1 40); do grep -q "mock ready" "$W/m.log" 2>/dev/null && break; sleep 0.25; done
bad=0
expect_fail() { local label="$1"; shift; local out rc; out="$("$@" 2>&1)"; rc=$?
  if [[ $rc -ne 0 ]]; then echo "PASS  $label  (exit $rc)"; echo "$out" | tail -n 2 | sed 's/^/        /'; else echo "FAIL  $label  (exited 0!)"; bad=$((bad+1)); fi; }

KONNECT_TOKEN=wrong expect_fail "1. wrong Konnect token → preflight fails" bash "$W/scripts/00-preflight.sh"
( unset KONNECT_TOKEN; expect_fail "2. no token → setup refuses" bash "$W/scripts/01-setup-environment.sh" ) || true
export KONNECT_TOKEN=mock-token
expect_fail "3. tests before setup → says what to run first" bash "$W/scripts/10-test-authentication.sh" basic
for s in 01-setup-environment 01b-inspect-keycloak-token 02-create-directory 03-create-principal; do bash "$W/scripts/$s.sh" >/dev/null 2>&1 || { echo "setup $s failed unexpectedly"; bad=$((bad+1)); }; done
( cd "$W"; source scripts/lib/common.sh; state_set OIDC_SUBJECT 00000000-0000-0000-0000-000000000000 )
bash "$W/scripts/04-create-oidc-identity.sh" >/dev/null 2>&1; bash "$W/scripts/05-configure-gateway.sh" >/dev/null 2>&1
expect_fail "4. identity with wrong subject → Test C fails, exit non-zero" bash "$W/scripts/10-test-authentication.sh" basic
( cd "$W"; source scripts/lib/common.sh; out="$(get_token workshop-demo-client wrong 2>&1)"; rc=$?
  if [[ $rc -ne 0 && "$out" == *unauthorized_client* ]]; then echo "PASS  5. wrong client secret → Keycloak's error is shown"; else echo "FAIL  5."; exit 1; fi ) || bad=$((bad+1))
( cd "$W"; source scripts/lib/common.sh; ASSERT="x y"; if ( assert_plain ASSERT ) 2>/dev/null; then echo "FAIL  6. assert_plain accepted a value with a space"; exit 1; else echo "PASS  6. unsafe value refused before it can reach a JSON payload"; fi ) || bad=$((bad+1))
echo; [[ $bad -eq 0 ]] && echo "ALL NEGATIVE TESTS PASSED" || echo "$bad NEGATIVE TEST(S) FAILED"
exit $bad
