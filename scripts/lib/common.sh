#!/usr/bin/env bash
# scripts/lib/common.sh — sourced by every workshop script. Not run directly.
#
# Design rules
#   * No credentials in the repo. Customer values come from environment/.env or
#     your shell; demo secrets are generated into .generated/ (git-ignored).
#   * Idempotent: every script can be re-run safely.
#   * Portable to macOS bash 3.2 (no mapfile, no associative arrays).
#   * JSON handling uses python3 (so there is no jq dependency).

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GEN_DIR="$ROOT_DIR/.generated"
STATE_FILE="$GEN_DIR/state.env"
COMPOSE_FILE="$ROOT_DIR/docker/docker-compose.yml"
COMPOSE_ENV="$GEN_DIR/compose.env"
mkdir -p "$GEN_DIR"
touch "$STATE_FILE"

# ── output helpers ────────────────────────────────────────────────────────────
if [[ -t 2 ]]; then
  C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'; C_RED=$'\033[31m'; C_GRN=$'\033[32m'
  C_YEL=$'\033[33m'; C_CYN=$'\033[36m'; C_OFF=$'\033[0m'
else
  C_DIM=''; C_BOLD=''; C_RED=''; C_GRN=''; C_YEL=''; C_CYN=''; C_OFF=''
fi
log()   { printf '%s==>%s %s\n' "$C_CYN" "$C_OFF" "$*" >&2; }
ok()    { printf '%s ✓ %s %s\n' "$C_GRN" "$C_OFF" "$*" >&2; }
warn()  { printf '%s !  %s%s\n' "$C_YEL" "$*" "$C_OFF" >&2; }
err()   { printf '%s ✗  %s%s\n' "$C_RED" "$*" "$C_OFF" >&2; }
die()   { err "$*"; exit 1; }
hdr()   { printf '\n%s━━ %s ━━%s\n' "$C_BOLD" "$*" "$C_OFF" >&2; }
note()  { printf '%s    %s%s\n' "$C_DIM" "$*" "$C_OFF" >&2; }

require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1 ${2:-}"; }
need_var()    { [[ -n "${!1:-}" ]] || die "Required variable $1 is not set. ${2:-See environment/.env.example}"; }

# ── env + state loading (shell-exported values always win over files) ─────────
load_env_file() {
  local f="$1" line k v
  [[ -f "$f" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" == *=* ]] || continue
    k="${line%%=*}"; v="${line#*=}"
    v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
    [[ "$k" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    if [[ -z "${!k+x}" ]]; then export "$k=$v"; fi
  done < "$f"
}
load_env_file "${ENV_FILE:-$ROOT_DIR/environment/.env}"
load_env_file "$STATE_FILE"

: "${KONNECT_REGION:=us}"
: "${KONNECT_API_URL:=https://${KONNECT_REGION}.api.konghq.com}"
: "${CONTROL_PLANE_NAME:=kong-identity-workshop}"
: "${KEYCLOAK_REALM:=kong-workshop}"
: "${KEYCLOAK_URL_HOST:=http://localhost:8080}"   # how *your laptop* reaches Keycloak
: "${OIDC_ISSUER:=http://keycloak:8080/realms/${KEYCLOAK_REALM}}"  # how the *gateway* reaches it
: "${API_AUDIENCE:=kong-workshop-api}"
: "${DEMO_CLIENT_ID:=workshop-demo-client}"
: "${UNMAPPED_CLIENT_ID:=workshop-unmapped-client}"
: "${PRINCIPAL_NAME:=workshop-demo-client}"
: "${CONSUMER_USERNAME:=workshop-demo-consumer}"
: "${OIDC_CLAIM_NAME:=sub}"
: "${PROXY_URL:=http://localhost:8000}"
: "${DP_STATUS_URL:=http://localhost:8100}"
: "${PROPAGATION_TIMEOUT:=120}"
: "${VERBOSE:=1}"
export KONNECT_REGION KONNECT_API_URL CONTROL_PLANE_NAME KEYCLOAK_REALM \
       KEYCLOAK_URL_HOST OIDC_ISSUER API_AUDIENCE DEMO_CLIENT_ID \
       UNMAPPED_CLIENT_ID PRINCIPAL_NAME CONSUMER_USERNAME OIDC_CLAIM_NAME \
       PROXY_URL DP_STATUS_URL

state_get() { grep -E "^$1=" "$STATE_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true; }
state_set() {   # state_set KEY VALUE  — persists and exports
  local k="$1" v="$2" tmp
  tmp="$(mktemp)"
  grep -vE "^${k}=" "$STATE_FILE" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  mv "$tmp" "$STATE_FILE"; chmod 600 "$STATE_FILE"
  export "$k=$v"
}

# Values interpolated into JSON payloads must be plain tokens (UUIDs, names, URLs).
assert_plain() {
  local name="$1" val="${!1:-}"
  [[ -n "$val" ]] || die "$name is empty"
  [[ "$val" =~ ^[A-Za-z0-9._:/@+=-]+$ ]] || die "$name contains unexpected characters; refusing to build JSON with it"
}

# ── JSON helpers (python3, stdin → stdout) ────────────────────────────────────
pp() { python3 -m json.tool 2>/dev/null || cat; }
jget() {  # jget data.0.id   (dots; integers index lists; prints "" when missing)
  python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    print(""); sys.exit(0)
for p in sys.argv[1].split("."):
    if p == "": continue
    if isinstance(d, list):
        try: d = d[int(p)]
        except Exception: d = None
    elif isinstance(d, dict):
        d = d.get(p)
    else:
        d = None
    if d is None: break
if d is None: print("")
elif isinstance(d, bool): print("true" if d else "false")
elif isinstance(d, (dict, list)): print(json.dumps(d))
else: print(d)
' "$1"
}
jfind() {  # jfind data field value  → prints the first object in list `data` whose field==value
  python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
for item in (d.get(sys.argv[1]) if isinstance(d, dict) else d) or []:
    if str(item.get(sys.argv[2])) == sys.argv[3]:
        print(json.dumps(item)); break
' "$1" "$2" "$3"
}
decode_jwt() {  # decode_jwt TOKEN [header|payload]
  python3 -c '
import sys, json, base64
tok, part = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "payload")
seg = tok.split(".")[1 if part == "payload" else 0]
seg += "=" * (-len(seg) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(seg)), indent=2))
' "$1" "${2:-payload}"
}

# ── Konnect API ───────────────────────────────────────────────────────────────
# konnect METHOD PATH [JSON_BODY]  → response body on stdout; non-2xx → exit 22.
konnect() {
  local method="$1" path="$2" body="${3:-}" tmp status
  need_var KONNECT_TOKEN "Set it in environment/.env or export it."
  tmp="$(mktemp)"
  local args=(-sS -o "$tmp" -w '%{http_code}' -X "$method" "$KONNECT_API_URL$path"
              -H "Authorization: Bearer $KONNECT_TOKEN" -H 'Accept: application/json')
  if [[ -n "$body" ]]; then args+=(-H 'Content-Type: application/json' --data "$body"); fi
  status="$(curl "${args[@]}")" || { rm -f "$tmp"; die "curl could not reach $KONNECT_API_URL"; }
  if [[ "$status" -ge 200 && "$status" -lt 300 ]]; then
    cat "$tmp"; rm -f "$tmp"
  else
    err "Konnect API $method $path → HTTP $status"
    pp < "$tmp" >&2 || true
    rm -f "$tmp"; return 22
  fi
}
# Same, but prints the request and response (never the token) for the audience.
konnect_show() {
  local method="$1" path="$2" body="${3:-}" out
  if [[ "$VERBOSE" == "1" ]]; then
    printf '\n%s→ %s %s%s\n' "$C_BOLD" "$method" "$KONNECT_API_URL$path" "$C_OFF" >&2
    if [[ -n "$body" ]]; then printf '%s\n' "$body" | pp | sed 's/^/    /' >&2; fi
  fi
  out="$(konnect "$method" "$path" "$body")" || return $?
  if [[ "$VERBOSE" == "1" ]]; then
    printf '%s← response%s\n' "$C_DIM" "$C_OFF" >&2
    printf '%s\n' "$out" | pp | sed 's/^/    /' >&2
  fi
  printf '%s' "$out"
}
cp_path() { need_var CONTROL_PLANE_ID "Run scripts/01-setup-environment.sh first."; printf '/v2/control-planes/%s/core-entities' "$CONTROL_PLANE_ID"; }

# ── decK ──────────────────────────────────────────────────────────────────────
deck_env() {
  need_var KONNECT_TOKEN
  export DECK_KONNECT_TOKEN="$KONNECT_TOKEN"
  export DECK_KONNECT_ADDR="$KONNECT_API_URL"
  export DECK_KONNECT_CONTROL_PLANE_NAME="$CONTROL_PLANE_NAME"
  export DECK_OIDC_ISSUER="$OIDC_ISSUER"
  export DECK_API_AUDIENCE="$API_AUDIENCE"
  export DECK_DIRECTORY_NAME="${DIRECTORY_NAME:-}"
  export DECK_TOKEN_SALT="${DECK_TOKEN_SALT:-}"
}
deck_apply() {  # deck_apply file...   (apply is additive; it never deletes)
  require_cmd deck "— install decK: https://developer.konghq.com/deck/"
  deck_env
  local f args=()
  for f in "$@"; do args+=("$ROOT_DIR/$f"); done
  log "deck gateway apply ${*}"
  deck gateway apply "${args[@]}" >&2
}

# ── Keycloak / proxy helpers ──────────────────────────────────────────────────
# get_token CLIENT_ID CLIENT_SECRET → access token on stdout
get_token() {
  local out
  out="$(curl -sS -X POST "$KEYCLOAK_URL_HOST/realms/$KEYCLOAK_REALM/protocol/openid-connect/token" \
        --data-urlencode grant_type=client_credentials \
        --data-urlencode "client_id=$1" --data-urlencode "client_secret=$2")" \
    || die "Cannot reach Keycloak at $KEYCLOAK_URL_HOST"
  local tok; tok="$(printf '%s' "$out" | jget access_token)"
  if [[ -z "$tok" ]]; then err "Keycloak did not issue a token for client '$1':"; printf '%s\n' "$out" | pp >&2; return 1; fi
  printf '%s' "$tok"
}
demo_token()     { need_var DEMO_CLIENT_SECRET "Run scripts/01-setup-environment.sh first."; get_token "$DEMO_CLIENT_ID" "$DEMO_CLIENT_SECRET"; }
unmapped_token() { need_var UNMAPPED_CLIENT_SECRET "Run scripts/01-setup-environment.sh first."; get_token "$UNMAPPED_CLIENT_ID" "$UNMAPPED_CLIENT_SECRET"; }

# proxy_status [TOKEN] → HTTP status of GET /anything through the gateway
proxy_status() {
  if [[ -n "${1:-}" ]]; then
    curl -sS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $1" "$PROXY_URL/anything" || printf '000'
  else
    curl -sS -o /dev/null -w '%{http_code}' "$PROXY_URL/anything" || printf '000'
  fi
}
# proxy_body TOKEN [extra curl args...] → body (stdout); status in $PROXY_LAST_STATUS is not portable, so use proxy_status for codes
proxy_body() {
  local tok="$1"; shift
  curl -sS -H "Authorization: Bearer $tok" "$@" "$PROXY_URL/anything"
}
# header_value JSON NAME → value of an echoed header (case-insensitive; handles string or list values)
header_value() {
  python3 -c '
import sys, json
want = sys.argv[1].lower()
try: d = json.load(sys.stdin)
except Exception: print(""); sys.exit(0)
for k, v in (d.get("headers") or {}).items():
    if k.lower() == want:
        print(v[0] if isinstance(v, list) and v else v); break
else:
    print("")
' "$2" <<<"$1"
}

wait_for() {  # wait_for "description" timeout_seconds command...
  local desc="$1" timeout="$2"; shift 2
  local start now; start="$(date +%s)"
  while ! "$@" >/dev/null 2>&1; do
    now="$(date +%s)"
    if (( now - start >= timeout )); then err "Timed out after ${timeout}s waiting for: $desc"; return 1; fi
    sleep 3
  done
  ok "$desc"
}

compose() { docker compose --env-file "$COMPOSE_ENV" -f "$COMPOSE_FILE" "$@"; }

# ── test bookkeeping ──────────────────────────────────────────────────────────
PASS=0; FAIL=0
check() {  # check "description" expected actual
  if [[ "$2" == "$3" ]]; then ok "PASS  $1  (got $3)"; PASS=$((PASS+1))
  else err "FAIL  $1  (expected $2, got $3)"; FAIL=$((FAIL+1)); fi
}
summary() {
  printf '\n%s%d passed, %d failed%s\n' "$C_BOLD" "$PASS" "$FAIL" "$C_OFF" >&2
  [[ "$FAIL" -eq 0 ]]
}
