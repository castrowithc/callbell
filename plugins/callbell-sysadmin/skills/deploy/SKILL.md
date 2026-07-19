---
name: deploy
description: >
  Set up a new Docker stack to your conventions: directory layout, compose mandatory directives,
  capabilities, network, reverse proxy, SMTP/OIDC placeholders, security variables, sign-off checklist.
  Trigger: "install/deploy a Docker app/stack", a service that needs a new compose stack.
type: skill
edit: locked
---

# Set Up a Docker Stack: Conventions and Procedure

Applies to any Docker host. Server-specific extensions (reverse-proxy setup, stack list, SMTP/auth
provider, concrete URLs/ports) belong in this server's context (its `__callbell__/` scaffold). This skill
provides **structure, patterns, and procedure**.

## Directory Layout

One directory per stack, all of them under a common parent. This procedure uses
`/opt/stack/<service-name>/` and stays consistent with it throughout. If the host already places its
stacks somewhere else, that convention wins: an existing layout everyone knows beats a new one that only
this skill knows. Pick one and hold it, whichever it is.

```
/opt/stack/<service-name>/
  compose.yaml          # Compose definition
  .env                  # Secrets/configurable values (NEVER read/output)
  .env.example          # Secrets/configurable values as a template
  data/                 # Persistent data
    <subdir>/           # e.g. postgres/, app/, media/
```

## compose.yaml: Mandatory Directives

### App Container
```yaml
services:
  <service>:
    image: <registry>/<image>:<exact-version>     # exact version, never :latest
    container_name: <service-name>
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    # cap_add: only if needed (reference below)
    pids_limit: 256                               # starting value, see the note under the DB block
    ports:
      - "127.0.0.1:<host-port>:<container-port>"  # localhost only
    environment:
      TZ: <Area/City>
      # Secrets via ${VARIABLE} from .env
    volumes:
      - ./data/<subdir>:/path/in/container
    depends_on:
      <db-service>:
        condition: service_healthy
    networks:
      - default
```

### Database Container (PostgreSQL preferred)
```yaml
  <service>-db:
    image: postgres:<major>-alpine
    container_name: <service-name>-db
    restart: unless-stopped
    pids_limit: 128
    environment:
      POSTGRES_DB: <service>
      POSTGRES_USER: <service>
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U <user> -d <db>"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default
```

> **On the `pids_limit` figures:** 256 for an app and 128 for a database or cache are starting values that
> hold for typical single-service stacks, not requirements. The point is that the limit exists at all, so a
> runaway process cannot exhaust the host's process table. An app that legitimately forks more (a worker
> pool, a browser engine, a CI runner) gets a higher number; find it by watching the container under real
> load rather than by raising it after the first crash.

### Redis/Valkey (if needed)
```yaml
  <service>-redis:
    image: redis:<major>-alpine                    # or valkey/valkey:<version>
    container_name: <service-name>-redis
    restart: unless-stopped
    pids_limit: 128
    volumes:
      - ./data/redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default
```

## Capabilities Reference

Most app containers need **no** capabilities (`cap_drop: ALL` is enough). Start without `cap_add`
first; only on a startup failure add back the specific ones:

| Capability | When needed |
|---|---|
| CHOWN | Entrypoint runs `chown` on the data directory |
| SETGID, SETUID | Entrypoint switches user via `setpriv`/`gosu` |
| DAC_OVERRIDE | File access beyond normal permissions |
| SYS_PTRACE | Sandbox mechanisms (e.g. gvisor) |
| NET_BIND_SERVICE | Binds to ports < 1024 |

## Network and Reverse Proxy

- **No external Docker network:** each stack has its own internal network.
- Port binding always on `127.0.0.1`; the reverse proxy connects via `127.0.0.1:<port>`.
- Find the next free port on the server; after setup record it in this server's context (its
  `__callbell__/` scaffold).
- The reverse proxy terminates TLS; default security headers HSTS + X-Content-Type-Options +
  X-XSS-Protection; forward auth only for apps without their own OIDC integration. Concrete setup
  (Caddy/Traefik/nginx) per server in this server's context (its `__callbell__/` scaffold).

## SMTP

Your relay provider, one dedicated SMTP user per service. Placeholders:
```env
SMTP_HOST=<smtp-relay-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@<domain>
```
Sender and service domain can differ: do not assume, use a placeholder or ask.

## Authentication: OIDC via an Identity Provider

Use an OIDC identity provider (Authentik, Keycloak, Zitadel, Authelia, or a hosted one); the concrete URL
lives per server in this server's context (its `__callbell__/` scaffold). Create per service manually in
the provider: a client or provider entry (OAuth2/OpenID) plus a linked application.

**Do not copy endpoint paths from anywhere, including from here.** Every provider lays them out
differently, and a wrong path fails as a confusing redirect rather than a clear error. Fetch them from the
provider's own discovery document, which every OIDC-compliant provider serves:

```bash
curl -s https://<oidc-host>/.well-known/openid-configuration | jq '{issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri}'
```

Map what it returns onto whatever variable names the app uses. The names differ per app; these are common:
```env
OIDC_CLIENT_ID=<from-provider>
OIDC_CLIENT_SECRET=<from-provider>
OIDC_ISSUER=<issuer, from the discovery document>
OIDC_AUTH_URL=<authorization_endpoint>
OIDC_TOKEN_URL=<token_endpoint>
OIDC_USERINFO_URL=<userinfo_endpoint>
OIDC_SCOPES=openid email profile
```
Many apps need only the issuer and discover the rest themselves. Set the individual endpoints only where
the app has no discovery of its own.

## Security-Relevant App Variables

| Aspect | Recommendation |
|---|---|
| Registration | Disable (`SIGNUPS_ALLOWED=false` or similar) |
| Invitations | Admin only |
| Telemetry | Disable |
| Debug mode | Off (`APP_DEBUG=false`) |
| Rate limiting | Enable if available |
| Password hints | Disable if possible |
| API access | Restrict/secure (JWT secret, API keys from .env) |
| Session/Cookie | `SESSION_SECURE_COOKIE=true` for HTTPS |
| Trusted proxies | `127.0.0.1` only |

## .env Template

The `.env` is **not** created or read by the agent: only a template with placeholders, documenting the
values needed:
```env
# === Database ===
POSTGRES_PASSWORD=<generate-a-strong-password>
# === App Secrets ===
APP_KEY=<generated-key>
# === SMTP ===
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@<domain>
# === OIDC ===
OIDC_CLIENT_ID=<from-provider>
OIDC_CLIENT_SECRET=<from-provider>
```

## Typical Exceptions to the Prohibitions (with Approval)

- **docker.sock** (`:ro`): e.g. an identity-provider outpost or a reverse proxy that discovers containers.
- **network_mode: host:** e.g. RustDesk (UDP hole punching).

## Checklist for New Stacks

1. [ ] Image pinned to an exact version
2. [ ] `security_opt: [no-new-privileges:true]` on app containers
3. [ ] `cap_drop: [ALL]`, only minimal `cap_add` if needed
4. [ ] `pids_limit` set at all, at a value chosen for this app
5. [ ] Port bound to `127.0.0.1` only
6. [ ] Healthchecks for DB/Redis
7. [ ] Volumes under `./data/`
8. [ ] Secrets via `${VARIABLE}`, not hardcoded
9. [ ] Registration disabled
10. [ ] Telemetry disabled
11. [ ] Debug mode off
12. [ ] OIDC configured (if the app supports it)
13. [ ] SMTP with placeholders
14. [ ] Reverse-proxy entry with security headers
15. [ ] Port recorded in this server's context (its `__callbell__/` scaffold)
16. [ ] Stack recorded in this server's context (its `__callbell__/` scaffold)
17. [ ] For a DB container: add it as a dump target in this server's backup context (skill `callbell-sysadmin:backup`)
18. [ ] Ask the user whether to create a commit
