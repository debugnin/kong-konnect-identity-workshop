#!/usr/bin/env bash
# Runs the whole script sequence against tests/mock_env.py in a throw-away copy of the
# project. Needs only bash, python3 (+PyYAML) and curl. Does not touch your .generated/.
#   ./tests/run-mock-test.sh            default path
#   MOCK_PREEXISTING_DIRECTORY=1 …      directory already exists in the org
#   MOCK_PATCH_MERGE=1 …                PATCH merges metadata instead of replacing
set -u
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
W="$(mktemp -d)"; cp -R "$SRC/." "$W/"; rm -rf "$W/.generated"; mkdir -p "$W/.generated"
export MOCK_WORKDIR="$W" ENV_FILE=/dev/null STUB_LOG="$W/docker-calls.log"
export PATH="$W/tests/bin:$PATH"
export KONNECT_TOKEN=mock-token KONNECT_API_URL=http://127.0.0.1:18080 KEYCLOAK_URL_HOST=http://127.0.0.1:18081
export PROXY_URL=http://127.0.0.1:18000 DP_STATUS_URL=http://127.0.0.1:18100 PROPAGATION_TIMEOUT=10 VERBOSE=0
python3 "$W/tests/mock_env.py" >"$W/mock.log" 2>&1 & MOCK_PID=$!
trap 'kill $MOCK_PID 2>/dev/null; rm -rf "$W"' EXIT
for i in $(seq 1 40); do grep -q "mock ready" "$W/mock.log" 2>/dev/null && break; sleep 0.25; done
grep -q "mock ready" "$W/mock.log" || { echo "mock failed to start"; cat "$W/mock.log"; exit 1; }

fails=0
step() { local label="$1"; shift; printf '\n\033[1m### %s\033[0m\n' "$label"
  if "$@" >"$W/out.txt" 2>&1; then echo "    exit 0"; tail -n "${TAIL:-4}" "$W/out.txt" | sed 's/^/    | /'
  else echo "    EXIT NON-ZERO"; cat "$W/out.txt" | sed 's/^/    | /'; fails=$((fails+1)); fi; }
S="$W/scripts"
step "00 preflight"            "$S/00-preflight.sh"
step "01 setup"                "$S/01-setup-environment.sh"
step "01b inspect token"       "$S/01b-inspect-keycloak-token.sh"
step "02 directory"            "$S/02-create-directory.sh"
step "03 principal"            "$S/03-create-principal.sh"
step "04 oidc identity"        "$S/04-create-oidc-identity.sh"
step "05 gateway"              "$S/05-configure-gateway.sh"
TAIL=40 step "10 basic (A, B, B', C)" "$S/10-test-authentication.sh" basic
step "06 consumer"             "$S/06-create-consumer.sh"
step "07 link consumer"        "$S/07-link-consumer.sh"
TAIL=14 step "10 consumer"     "$S/10-test-authentication.sh" consumer
step "08 consumer groups"      "$S/08-create-consumer-groups.sh"
step "09 link → standard"      "$S/09-link-consumer-groups.sh" standard
TAIL=14 step "10 groups (standard)" "$S/10-test-authentication.sh" groups
step "09 link → gold"          "$S/09-link-consumer-groups.sh" gold
sleep 31   # new 30 s rate-limit window, like a presenter pause
TAIL=14 step "10 groups (gold)" "$S/10-test-authentication.sh" groups
echo; echo "=== idempotency: re-run 02–07 and basic tests ==="
for s in 02-create-directory 03-create-principal 04-create-oidc-identity 05-configure-gateway 06-create-consumer 07-link-consumer; do
  step "re-run $s" "$S/$s.sh"; done
step "10 basic again"          "$S/10-test-authentication.sh" basic
python3 - <<PY
import json, urllib.request
req = urllib.request.Request("http://127.0.0.1:18080/_mock/dump", headers={"Authorization": "Bearer mock-token"})
d = json.load(urllib.request.urlopen(req))
print("\nmock end-state: services=%d routes=%d plugins=%s consumers=%d groups=%d" % (
  len(d["services"]), len(d["routes"]), sorted(p["name"]+("@"+p["consumer_group"] if p.get("consumer_group") else "") for p in d["plugins"]), len(d["consumers"]), len(d["groups"])))
PY
# secrets must never reach the repo tree outside .generated (checked BEFORE cleanup wipes them)
SECRET="$(grep -h '^DEMO_CLIENT_SECRET=' "$W/.generated/state.env" | cut -d= -f2)"
if [[ -z "$SECRET" ]]; then echo "leak check could not read the secret"; fails=$((fails+1))
elif grep -rIl --exclude-dir=.generated -e "$SECRET" "$W" 2>/dev/null | grep -q .; then echo "SECRET LEAK into repo files"; fails=$((fails+1))
else echo "no secret found outside .generated/  ✓"; fi
# the directory was created by this run, so cleanup must delete it (and say so)
step "99 cleanup"              "$S/99-cleanup.sh" --yes
python3 - <<PY2 || fails=$((fails+1))
import json, urllib.request
d = json.load(urllib.request.urlopen(urllib.request.Request("http://127.0.0.1:18080/v2/directories", headers={"Authorization": "Bearer mock-token"})))
print("directories left after cleanup:", len(d["data"]))
import sys; sys.exit(0 if (len(d["data"]) == 0 or "${MOCK_PREEXISTING_DIRECTORY:-0}" == "1") else 1)
PY2
echo; if [[ $fails -eq 0 ]]; then echo "ALL MOCK STEPS PASSED"; else echo "$fails STEP(S) FAILED"; fi
exit $fails
