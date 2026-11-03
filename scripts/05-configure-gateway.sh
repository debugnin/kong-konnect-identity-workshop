#!/usr/bin/env bash
# Scenario 3 — Service, Route, OpenID Connect plugin (bearer + principals), Datakit inspector.
source "$(dirname "${BASH_SOURCE[0]}")/lib/common.sh"
need_var CONTROL_PLANE_ID "Run scripts/01-setup-environment.sh first."
need_var DIRECTORY_NAME   "Run scripts/02-create-directory.sh first."
need_var DECK_TOKEN_SALT  "Run scripts/01-setup-environment.sh first."

hdr "Configuration that will be applied"
note "issuer              $OIDC_ISSUER"
note "auth_methods        bearer"
note "audience            $API_AUDIENCE"
note "principals.enabled  true"
note "principals.directory $DIRECTORY_NAME   (the NAME, not the id)"
note "error_on_miss       (default) — verified token + no principal ⇒ 401"

deck_apply kong/kong.yml kong/plugins.yml

hdr "Confirm what Konnect holds"
plugins="$(konnect GET "$(cp_path)/plugins")"
printf '%s' "$plugins" | python3 -c '
import sys, json
for p in json.load(sys.stdin).get("data", []):
    print("    plugin:", p.get("name"))' >&2
printf '%s' "$plugins" | grep -q '"openid-connect"' || die "openid-connect plugin not found in the control plane"

hdr "Wait for the data plane to receive the config"
wait_for "gateway answers 401 on /anything (OIDC plugin active)" "$PROPAGATION_TIMEOUT" \
  bash -c "[[ \"\$(curl -s -o /dev/null -w '%{http_code}' $PROXY_URL/anything)\" == 401 ]]"
ok "Try it:  ./scripts/10-test-authentication.sh basic"
