# Architecture diagrams

Mermaid source; GitHub, GitLab, VS Code and most wikis render it. The same diagrams are in the deck.
Everything marked **Konnect SaaS** runs in Kong's cloud; everything marked **local** runs in Docker on the presenter's laptop.

## 1. Konnect: who owns what

```mermaid
flowchart TB
  C[Customer organisation]
  subgraph K[Kong Konnect - SaaS]
    O[Organization<br/>users, teams, roles, SSO]
    CP[Gateway control plane<br/>configuration lives here]
    KI[Kong Identity<br/>directories and principals<br/>one directory per region]
  end
  DP1[Data plane node<br/>runs the traffic]
  DP2[Data plane node]
  U[Upstream APIs]
  C --> O --> CP
  O --> KI
  CP -- config over mTLS --> DP1
  CP -- config over mTLS --> DP2
  DP1 --> U
  DP2 --> U
  DP1 -. principal lookup over mTLS .-> KI
```

## 2. Four kinds of "who are you?" (the distinction customers confuse)

```mermaid
flowchart LR
  subgraph A[1. Human to Konnect platform]
    H[Employee] --> SSO[Built-in login or SSO<br/>OIDC / SAML] --> KP[Konnect UI]
  end
  subgraph B[2. Machine to Konnect APIs]
    M[Automation / CI] --> PAT[Personal access token<br/>or system account token] --> KA[Konnect API]
  end
  subgraph C[3. API client to Kong Gateway]
    CL[API client] --> PL[Auth plugin on a service or route<br/>key-auth, OIDC, ...] --> GW[Data plane]
  end
  subgraph D[4. Identity of that client, managed centrally]
    PR[Kong Identity principal<br/>credentials, identities, metadata]
  end
  GW -. optional lookup .-> PR
```

## 3. Demo architecture

```mermaid
flowchart TB
  subgraph LOCAL[Local - docker compose]
    CLI[Client<br/>curl / scripts]
    KC[Keycloak<br/>external IdP]
    DP[Kong Gateway data plane 3.16<br/>OpenID Connect + Datakit]
    HB[httpbin upstream<br/>echoes headers]
  end
  subgraph KONNECT[Konnect SaaS]
    CPL[Control plane]
    DIR[Kong Identity directory<br/>principal + oidc identity + metadata]
    CONS[Consumer + Consumer Groups<br/>in the control plane]
  end
  CLI -- 1. client_credentials --> KC
  KC -- 2. access token --> CLI
  CLI -- 3. Authorization: Bearer --> DP
  DP -- verify signature via JWKS --> KC
  DP -- 4. lookup iss + sub --> DIR
  DIR -- principal + metadata --> DP
  DIR -. control_plane_consumer identity .-> CONS
  DIR -. consumer_groups metadata key .-> CONS
  CPL -- config --> DP
  DP -- 5. request + X-Principal-* headers --> HB
```

## 4. Request sequence (Test C)

```mermaid
sequenceDiagram
  participant C as Client
  participant K as Keycloak
  participant G as Kong data plane
  participant I as Kong Identity (Konnect)
  participant U as Upstream
  C->>K: POST /token (client_credentials)
  K-->>C: JWT (iss, sub, aud)
  C->>G: GET /anything + Bearer JWT
  G->>K: fetch JWKS (cached)
  G->>G: verify signature, issuer, audience, expiry
  G->>I: lookup principal by iss + sub (mTLS, cached)
  I-->>G: id, display_name, metadata
  Note over G: mapped Consumer and Consumer Groups<br/>loaded into request context
  G->>U: request + X-Principal-* headers
  U-->>G: 200
  G-->>C: 200
```

## 5. Authenticate vs hydrate

```mermaid
flowchart LR
  subgraph AU[Authenticate: Kong Identity holds the secret]
    A1[Client sends API key or username/password] --> A2[Gateway plugin checks it against the directory] --> A3[Principal + metadata in context]
  end
  subgraph HY[Hydrate: the IdP already authenticated]
    H1[Client sends OIDC token] --> H2[OpenID Connect plugin verifies it] --> H3[Gateway looks up principal by iss + claim] --> H4[Principal + metadata in context]
  end
```

## 6. Principal anatomy

```mermaid
flowchart TB
  P[Principal<br/>display_name, description]
  P --> CR[Credentials<br/>API key, username/password<br/>authenticate at the gateway]
  P --> ID[Identities<br/>how other systems recognise it]
  P --> MD[Metadata<br/>key/value pairs]
  ID --> I1[oidc: issuer + claim]
  ID --> I2[auth_server_client]
  ID --> I3[control_plane_consumer]
  ID --> I4[custom: key + value]
  MD --> M1[any keys: business_unit, tier...]
  MD --> M2[reserved: consumer_groups = list of group UUIDs]
```
