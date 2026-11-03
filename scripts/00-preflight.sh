#!/usr/bin/env bash
# Verifies everything the demo needs BEFORE you are in front of a customer.
# Safe to run any number of times. Changes nothing.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
bad=0
fail() { err "$*"; bad=$((bad+1)); }

hdr "Tools"
for c in curl python3 openssl docker; do
  if command -v "$c" >/dev/null 2>&1; then ok "$c"; else fail "$c not found"; fi
done
if command -v deck >/dev/null 2>&1; then ok "deck $(deck version 2>/dev/null | head -n1)"; note "decK 1.69+ recommended"
else fail "decK not found — install from https://developer.konghq.com/deck/"; fi

hdr "Docker"
if docker info >/dev/null 2>&1; then ok "Docker daemon reachable"; else fail "Docker daemon is not running"; fi
if docker compose version >/dev/null 2>&1; then ok "docker compose plugin present"; else fail "'docker compose' (v2 plugin) not available"; fi

hdr "Local ports (must be free before first run)"
for p in 8000 8080 8100; do
  if python3 - "$p" <<'PY'
import socket, sys
s = socket.socket(); s.settimeout(0.5)
sys.exit(0 if s.connect_ex(("127.0.0.1", int(sys.argv[1]))) != 0 else 1)
PY
  then ok "port $p free"
  else warn "port $p is in use (fine if this is the workshop stack already running)"; fi
done

hdr "Konnect"
if [[ -z "${KONNECT_TOKEN:-}" ]]; then
  fail "KONNECT_TOKEN is not set (environment/.env or shell). Create a personal access token in Konnect."
else
  ok "KONNECT_TOKEN is set (value not printed)"
  note "API endpoint: $KONNECT_API_URL  (region: $KONNECT_REGION)"
  if konnect GET '/v2/control-planes?page%5Bsize%5D=1' >/dev/null 2>&1; then ok "token accepted; control-planes API reachable"
  else fail "Konnect rejected the token or the region is wrong (check KONNECT_REGION / token expiry)"; fi
  if konnect GET '/v2/directories' >/dev/null 2>&1; then ok "Kong Identity directories API reachable"
  else warn "Kong Identity directories API did not answer 2xx — your org may lack Kong Identity, or the token lacks Identity permissions. Ask your Kong contact before the session."; fi
fi

hdr "Version floor (from the Kong docs)"
note "Gateway ≥ 3.15 for OpenID Connect principal lookup; 3.16 for the Datakit principal property."
note "Configured image: ${KONG_IMAGE:-kong/kong-gateway:3.16}"
if [[ -n "${CONTROL_PLANE_ID:-}" ]]; then note "State file already holds a control plane id — this looks like a re-run."; fi

echo >&2
if [[ "$bad" -eq 0 ]]; then ok "Preflight passed"; else die "$bad preflight problem(s) — fix them and re-run"; fi
