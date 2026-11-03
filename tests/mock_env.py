#!/usr/bin/env python3
"""
Offline mock of the pieces the workshop scripts talk to.

WHAT THIS IS: a test harness that checks the *scripts* (control flow, idempotency,
JSON building/parsing, state handling, assertions) without Konnect, Keycloak,
Docker or a network.

WHAT THIS IS NOT: evidence that Kong behaves this way. Every behaviour below is
copied from Kong's published documentation (see docs/documentation-references.md),
so a green run here proves "the scripts do what we think the docs say" — nothing
more. Only a run against real Konnect proves the demo.

Ports: Konnect API 18080 · Keycloak 18081 · gateway proxy 18000 · DP status 18100
Env:   MOCK_WORKDIR (where .generated/state.env lives), MOCK_PREEXISTING_DIRECTORY=1,
       MOCK_PATCH_MERGE=1 (PATCH merges metadata instead of replacing it)
"""
import base64, hashlib, json, os, re, sys, threading, time, uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ISSUER = "http://keycloak:8080/realms/kong-workshop"
AUDIENCE = "kong-workshop-api"
S = {  # shared state
    "cps": {}, "directories": {}, "principals": {}, "identities": {},
    "services": {}, "routes": {}, "plugins": [], "consumers": {}, "groups": {},
    "counters": {}, "log": [],
}
LOCK = threading.Lock()
WORKDIR = os.environ.get("MOCK_WORKDIR", ".")


def new_id():
    return str(uuid.uuid4())


def read_state_env():
    out = {}
    try:
        for line in open(os.path.join(WORKDIR, ".generated", "state.env")):
            if "=" in line:
                k, v = line.rstrip("\n").split("=", 1)
                out[k] = v
    except FileNotFoundError:
        pass
    return out


class Base(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        return raw

    def send(self, code, obj=None, headers=None):
        data = json.dumps(obj if obj is not None else {}).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(data)


# ───────────────────────────── Konnect API ─────────────────────────────
class Konnect(Base):
    def auth_ok(self):
        if self.headers.get("Authorization", "") != "Bearer mock-token":
            self.send(401, {"message": "unauthorized"})
            return False
        return True

    def route(self, method):
        if not self.auth_ok():
            return
        u = urlparse(self.path)
        p = u.path
        q = parse_qs(u.query)
        raw = self.body()
        try:
            b = json.loads(raw) if raw else {}
        except Exception:
            return self.send(400, {"message": "bad json"})
        with LOCK:
            S["log"].append((method, p))
            return self.dispatch(method, p, q, b)

    def dispatch(self, m, p, q, b):
        # ── control planes
        if p == "/v2/control-planes" and m == "GET":
            data = list(S["cps"].values())
            for k, v in q.items():
                if k.startswith("filter[name]"):
                    data = [c for c in data if v[0] in c["name"]]
            return self.send(200, {"data": data})
        if p == "/v2/control-planes" and m == "POST":
            for need in ("name", "cluster_type", "auth_type"):
                if need not in b:
                    return self.send(400, {"message": f"missing {need}"})
            cid = new_id()
            sub = cid[:8]
            S["cps"][cid] = {"id": cid, "name": b["name"], "config": {
                "control_plane_endpoint": f"https://{sub}.us.cp0.konghq.com",
                "telemetry_endpoint": f"https://{sub}.us.tp0.konghq.com"}}
            return self.send(201, S["cps"][cid])
        m1 = re.fullmatch(r"/v2/control-planes/([^/]+)", p)
        if m1 and m == "DELETE":
            S["cps"].pop(m1.group(1), None)
            return self.send(204)
        m1 = re.fullmatch(r"/v2/control-planes/([^/]+)/dp-client-certificates", p)
        if m1 and m == "POST":
            if "BEGIN CERTIFICATE" not in b.get("cert", ""):
                return self.send(400, {"message": "cert must be PEM"})
            return self.send(201, {"item": {"id": new_id()}})
        # ── core entities
        m1 = re.fullmatch(r"/v2/control-planes/([^/]+)/core-entities/(plugins|consumers|consumer_groups)(?:/([^/]+))?", p)
        if m1 and m == "GET":
            kind, name = m1.group(2), m1.group(3)
            if kind == "plugins":
                return self.send(200, {"data": S["plugins"]})
            store = S["consumers"] if kind == "consumers" else S["groups"]
            if name:
                e = store.get(name)
                return self.send(200, e) if e else self.send(404, {"message": "not found"})
            return self.send(200, {"data": list(store.values())})
        # ── directories
        if p == "/v2/directories" and m == "GET":
            return self.send(200, {"data": list(S["directories"].values())})
        if p == "/v2/directories" and m == "POST":
            if S["directories"]:
                return self.send(403, {"message": "directory already exists for region"})
            if not b.get("name"):
                return self.send(400, {"message": "name required"})
            did = new_id()
            S["directories"][did] = {"id": did, "name": b["name"], "description": b.get("description", "")}
            return self.send(201, S["directories"][did])
        m1 = re.fullmatch(r"/v2/directories/([^/]+)", p)
        if m1 and m == "DELETE":
            S["directories"].pop(m1.group(1), None)
            return self.send(204)
        # ── principals
        m1 = re.fullmatch(r"/v2/directories/([^/]+)/principals", p)
        if m1:
            did = m1.group(1)
            if did not in S["directories"]:
                return self.send(404, {"message": "directory not found"})
            if m == "GET":
                return self.send(200, {"data": [x for x in S["principals"].values() if x["directory_id"] == did]})
            if m == "POST":
                if not b.get("display_name"):
                    return self.send(400, {"message": "display_name required"})
                pid = new_id()
                S["principals"][pid] = {"id": pid, "directory_id": did, "display_name": b["display_name"],
                                         "description": b.get("description", ""), "metadata": b.get("metadata", {})}
                S["identities"][pid] = []
                return self.send(201, S["principals"][pid])
        m1 = re.fullmatch(r"/v2/directories/([^/]+)/principals/([^/]+)", p)
        if m1:
            pid = m1.group(2)
            pr = S["principals"].get(pid)
            if not pr:
                return self.send(404, {"message": "principal not found"})
            if m == "GET":
                return self.send(200, pr)
            if m == "PATCH":
                if "metadata" in b:
                    if os.environ.get("MOCK_PATCH_MERGE") == "1":
                        pr["metadata"].update(b["metadata"])
                    else:
                        pr["metadata"] = b["metadata"]
                return self.send(200, pr)
            if m == "DELETE":
                S["principals"].pop(pid, None); S["identities"].pop(pid, None)
                return self.send(204)
        m1 = re.fullmatch(r"/v2/directories/([^/]+)/principals/([^/]+)/identities", p)
        if m1:
            pid = m1.group(2)
            if pid not in S["principals"]:
                return self.send(404, {"message": "principal not found"})
            if m == "GET":
                return self.send(200, {"data": S["identities"][pid]})
            if m == "POST":
                t = b.get("type")
                if t == "oidc":
                    if not (b.get("issuer") and (b.get("claim") or {}).get("name") and (b.get("claim") or {}).get("value")):
                        return self.send(400, {"message": "oidc identity needs issuer + claim.name + claim.value"})
                    for plist in S["identities"].values():
                        for i in plist:
                            if i.get("type") == "oidc" and i["issuer"] == b["issuer"] and i["claim"] == b["claim"]:
                                return self.send(409, {"message": "issuer+claim must be unique in a directory"})
                elif t == "control_plane_consumer":
                    if not (b.get("control_plane_id") and b.get("consumer_id")):
                        return self.send(400, {"message": "needs control_plane_id + consumer_id"})
                else:
                    return self.send(400, {"message": "unsupported identity type in mock"})
                ident = dict(b); ident["id"] = new_id()
                S["identities"][pid].append(ident)
                return self.send(201, ident)
        # ── test-harness back door used by the fake `deck`
        if p == "/_mock/apply" and m == "POST":
            return self.apply_state(b)
        if p == "/_mock/dump":
            return self.send(200, {k: S[k] for k in ("services", "routes", "plugins", "consumers", "groups")})
        return self.send(404, {"message": f"mock has no route {m} {p}"})

    def apply_state(self, d):
        for svc in d.get("services") or []:
            S["services"][svc["name"]] = svc
            for r in svc.get("routes") or []:
                S["routes"][r["name"]] = r
        for c in d.get("consumers") or []:
            e = S["consumers"].setdefault(c["username"], {"id": new_id()})
            e.update(c)
        for g in d.get("consumer_groups") or []:
            e = S["groups"].setdefault(g["name"], {"id": new_id()})
            e.update(g)
        for pl in d.get("plugins") or []:
            key = (pl["name"], pl.get("service"), pl.get("consumer_group"))
            S["plugins"] = [x for x in S["plugins"] if (x["name"], x.get("service"), x.get("consumer_group")) != key]
            pl = dict(pl); pl["id"] = new_id()
            S["plugins"].append(pl)
        return self.send(200, {"ok": True})

    do_GET = lambda self: self.route("GET")
    do_POST = lambda self: self.route("POST")
    do_PATCH = lambda self: self.route("PATCH")
    do_DELETE = lambda self: self.route("DELETE")


# ───────────────────────────── Keycloak ────────────────────────────────
def b64(d):
    return base64.urlsafe_b64encode(json.dumps(d).encode()).rstrip(b"=").decode()


def client_sub(client_id):  # stable per client, like a service-account user id
    return str(uuid.UUID(hashlib.md5(("sa-" + client_id).encode()).hexdigest()))


class Keycloak(Base):
    def do_GET(self):
        if self.path.endswith("/.well-known/openid-configuration"):
            return self.send(200, {"issuer": ISSUER, "token_endpoint": ISSUER + "/protocol/openid-connect/token"})
        self.send(404, {})

    def do_POST(self):
        if not self.path.endswith("/protocol/openid-connect/token"):
            return self.send(404, {})
        form = parse_qs(self.body().decode())
        cid = (form.get("client_id") or [""])[0]
        sec = (form.get("client_secret") or [""])[0]
        st = read_state_env()
        good = {"workshop-demo-client": st.get("DEMO_CLIENT_SECRET"), "workshop-unmapped-client": st.get("UNMAPPED_CLIENT_SECRET")}
        if (form.get("grant_type") or [""])[0] != "client_credentials" or not good.get(cid) or good[cid] != sec:
            return self.send(401, {"error": "unauthorized_client", "error_description": "Invalid client or Invalid client credentials"})
        now = int(time.time())
        claims = {"exp": now + 900, "iat": now, "jti": new_id(), "iss": ISSUER, "aud": [AUDIENCE],
                  "sub": client_sub(cid), "typ": "Bearer", "azp": cid, "clientId": cid}
        tok = ".".join([b64({"alg": "RS256", "typ": "JWT", "kid": "mock"}), b64(claims), "c2ln"])
        self.send(200, {"access_token": tok, "token_type": "Bearer", "expires_in": 900})


# ───────────────────────────── Gateway proxy ───────────────────────────
class Proxy(Base):
    def do_GET(self):
        with LOCK:
            return self.handle_req()

    def handle_req(self):
        oidc = next((p for p in S["plugins"] if p["name"] == "openid-connect"), None)
        if not oidc:
            return self.send(404, {"message": "no Route matched with those values"})
        cfg = oidc.get("config", {})
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return self.send(401, {"message": "Unauthorized"})
        try:
            seg = auth.split(".")[1]
            seg += "=" * (-len(seg) % 4)
            claims = json.loads(base64.urlsafe_b64decode(seg))
        except Exception:
            return self.send(401, {"message": "Unauthorized"})
        if claims.get("iss") != cfg.get("issuer") or claims.get("exp", 0) < time.time():
            return self.send(401, {"message": "Unauthorized"})
        if cfg.get("audience") and not set(cfg["audience"]) & set(claims.get("aud") or []):
            return self.send(401, {"message": "Unauthorized"})
        principal = consumer = None
        pc = cfg.get("principals") or {}
        if pc.get("enabled"):
            directory = next((d for d in S["directories"].values() if d["name"] == pc.get("directory")), None)
            if not directory:
                return self.send(500, {"message": "directory not found"})
            for pid, idents in S["identities"].items():
                pr = S["principals"][pid]
                if pr["directory_id"] != directory["id"]:
                    continue
                for i in idents:
                    if i["type"] == "oidc" and i["issuer"] == claims["iss"] and claims.get(i["claim"]["name"]) == i["claim"]["value"]:
                        principal = pr
            if principal is None and pc.get("error_on_miss", True):
                return self.send(401, {"message": "Unauthorized"})
        groups = []
        if principal:
            for i in S["identities"][principal["id"]]:
                if i["type"] == "control_plane_consumer":
                    consumer = next((c for c in S["consumers"].values() if c["id"] == i["consumer_id"]), None)
            ids = (principal["metadata"] or {}).get("consumer_groups") or []
            groups = [g["name"] for g in S["groups"].values() if g["id"] in ids]
        # group-scoped rate limiting (fixed 30 s window)
        for gname in groups:
            rl = next((p for p in S["plugins"] if p["name"] == "rate-limiting-advanced" and p.get("consumer_group") == gname), None)
            if not rl:
                continue
            win = int(time.time() // rl["config"]["window_size"][0])
            key = (gname, win)
            S["counters"][key] = S["counters"].get(key, 0) + 1
            if S["counters"][key] > rl["config"]["limit"][0]:
                return self.send(429, {"message": "API rate limit exceeded"})
        hdrs = {}
        if consumer:
            hdrs["X-Consumer-Id"] = [consumer["id"]]
            hdrs["X-Consumer-Username"] = [consumer["username"]]
        if any(p["name"] == "datakit" for p in S["plugins"]):
            md = (principal or {}).get("metadata") or {}
            hdrs["X-Principal-Id"] = [principal["id"] if principal else "none"]
            hdrs["X-Principal-Name"] = [principal["display_name"] if principal else "none"]
            hdrs["X-Principal-Business-Unit"] = [md.get("business_unit", "none")]
            hdrs["X-Principal-Consumer-Groups"] = [",".join(md.get("consumer_groups") or [])]
        out = {"headers": hdrs, "url": "http://mock/anything"}
        if self.headers.get("X-Datakit-Debug-Trace"):
            out["trace"] = [{"node": "GET_PRINCIPAL", "status": "NODE_COMPLETE"},
                            {"node": "GET_CONSUMER", "status": "NODE_COMPLETE",
                             "value": consumer or None}]
        self.send(200, out)


class Status(Base):
    def do_GET(self):
        self.send(200, {"ok": True})


def serve(port, handler):
    srv = ThreadingHTTPServer(("127.0.0.1", port), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


if __name__ == "__main__":
    if os.environ.get("MOCK_PREEXISTING_DIRECTORY") == "1":
        did = new_id()
        S["directories"][did] = {"id": did, "name": "customer-existing-dir", "description": "pre-existing"}
    serve(18080, Konnect); serve(18081, Keycloak); serve(18000, Proxy); serve(18100, Status)
    print("mock ready", flush=True)
    while True:
        time.sleep(1)
