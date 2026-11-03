#!/usr/bin/env bash
# Stage the whole local environment and connect a data plane to Konnect.
#   1. generate demo secrets (never committed)        4. create control plane in Konnect
#   2. start Keycloak + httpbin                        5. pin a data-plane client certificate
#   3. wait for the Keycloak realm to import          6. start the Kong data plane, wait until ready
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var KONNECT_TOKEN "Set it in environment/.env (see environment/.env.example)."
require_cmd docker; require_cmd openssl; require_cmd python3

hdr "1/6 Generate demo secrets"
for v in DEMO_CLIENT_SECRET UNMAPPED_CLIENT_SECRET KC_ADMIN_PASSWORD DECK_TOKEN_SALT; do
  if [[ -z "$(state_get "$v")" ]]; then state_set "$v" "$(openssl rand -hex 16)"; ok "generated $v (stored in .generated/state.env)"
  else export "$v=$(state_get "$v")"; note "$v already present"; fi
done
{
  echo "KC_ADMIN_PASSWORD=$KC_ADMIN_PASSWORD"
  echo "DEMO_CLIENT_SECRET=$DEMO_CLIENT_SECRET"
  echo "UNMAPPED_CLIENT_SECRET=$UNMAPPED_CLIENT_SECRET"
  echo "API_AUDIENCE=$API_AUDIENCE"
  echo "KONG_IMAGE=${KONG_IMAGE:-kong/kong-gateway:3.16}"
  echo "KEYCLOAK_IMAGE=${KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak:26.0.7}"
  echo "HTTPBIN_IMAGE=${HTTPBIN_IMAGE:-mccutchen/go-httpbin:2.15.0}"
} > "$COMPOSE_ENV"; chmod 600 "$COMPOSE_ENV"
mkdir -p "$GEN_DIR/dp"; touch "$GEN_DIR/dp.env"

hdr "2/6 Start Keycloak and httpbin"
compose up -d keycloak httpbin >&2

hdr "3/6 Wait for the Keycloak realm"
wait_for "Keycloak realm '$KEYCLOAK_REALM' is serving discovery" 180 \
  curl -fsS "$KEYCLOAK_URL_HOST/realms/$KEYCLOAK_REALM/.well-known/openid-configuration"
disc_iss="$(curl -fsS "$KEYCLOAK_URL_HOST/realms/$KEYCLOAK_REALM/.well-known/openid-configuration" | jget issuer)"
note "Keycloak advertises issuer: $disc_iss"
if [[ "$disc_iss" != "$OIDC_ISSUER" ]]; then
  warn "Issuer differs from OIDC_ISSUER ($OIDC_ISSUER). The plugin and the principal identity must use the issuer exactly as the token carries it."
  state_set OIDC_ISSUER "$disc_iss"
fi

hdr "4/6 Control plane in Konnect (get-or-create)"
existing="$(konnect GET "/v2/control-planes?filter%5Bname%5D%5Bcontains%5D=$CONTROL_PLANE_NAME" | jfind data name "$CONTROL_PLANE_NAME" || true)"
if [[ -n "$existing" ]]; then
  cp_json="$existing"; ok "control plane '$CONTROL_PLANE_NAME' already exists"
else
  body="{\"name\":\"$CONTROL_PLANE_NAME\",\"description\":\"Kong Identity workshop (safe to delete)\",\"cluster_type\":\"CLUSTER_TYPE_CONTROL_PLANE\",\"auth_type\":\"pinned_client_certs\",\"labels\":{\"workshop\":\"kong-identity\"}}"
  assert_plain CONTROL_PLANE_NAME
  cp_json="$(konnect_show POST /v2/control-planes "$body")"
fi
state_set CONTROL_PLANE_ID "$(printf '%s' "$cp_json" | jget id)"
cp_ep="$(printf '%s' "$cp_json" | jget config.control_plane_endpoint | sed -E 's#^https?://##')"
tel_ep="$(printf '%s' "$cp_json" | jget config.telemetry_endpoint | sed -E 's#^https?://##')"
[[ -n "$CONTROL_PLANE_ID" && -n "$cp_ep" && -n "$tel_ep" ]] || die "Control plane response is missing id/endpoints; got: $cp_json"
ok "control plane id $CONTROL_PLANE_ID"

hdr "5/6 Data-plane client certificate (pinned)"
if [[ ! -s "$GEN_DIR/dp/tls.crt" || -z "$(state_get DP_CERT_ID)" ]]; then
  openssl req -new -x509 -nodes -newkey rsa:2048 -days 3650 -subj "/CN=kongdp/C=US" \
    -keyout "$GEN_DIR/dp/tls.key" -out "$GEN_DIR/dp/tls.crt" >/dev/null 2>&1
  chmod 600 "$GEN_DIR/dp/tls.key"; chmod 644 "$GEN_DIR/dp/tls.crt"
  cert_body="$(python3 -c 'import json,sys;print(json.dumps({"cert":open(sys.argv[1]).read()}))' "$GEN_DIR/dp/tls.crt")"
  resp="$(konnect POST "/v2/control-planes/$CONTROL_PLANE_ID/dp-client-certificates" "$cert_body")"
  cert_id="$(printf '%s' "$resp" | jget item.id)"; state_set DP_CERT_ID "${cert_id:-pinned}"
  ok "certificate generated and pinned to the control plane"
else
  note "certificate already pinned (id $(state_get DP_CERT_ID))"
fi
cat > "$GEN_DIR/dp.env" <<DPENV
KONG_CLUSTER_CONTROL_PLANE=$cp_ep:443
KONG_CLUSTER_SERVER_NAME=$cp_ep
KONG_CLUSTER_TELEMETRY_ENDPOINT=$tel_ep:443
KONG_CLUSTER_TELEMETRY_SERVER_NAME=$tel_ep
DPENV
chmod 600 "$GEN_DIR/dp.env"

hdr "6/6 Start the Kong Gateway data plane"
compose up -d kong-dp >&2
wait_for "data plane is ready (config received from Konnect)" 240 \
  curl -fsS "$DP_STATUS_URL/status/ready"

hdr "Done"
note "Next:  ./scripts/01b-inspect-keycloak-token.sh   (Scenario 2)"
note "Then:  02 → 03 → 04 → 05 → 10 basic → 06 → 07 → 10 consumer → 08 → 09 → 10 groups"
