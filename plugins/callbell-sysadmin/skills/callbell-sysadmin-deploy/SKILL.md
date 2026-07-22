---
name: callbell-sysadmin-deploy
description: >
  Sets up a new Docker stack by fixed conventions: directory layout, required compose settings,
  capabilities, network, reverse proxy, SMTP and OIDC placeholders, security-relevant variables, acceptance
  checklist. Start it by typing /callbell-sysadmin-deploy.
type: skill
edit: locked
disable-model-invocation: true
---

# Setting up a Docker stack: conventions and procedure

Applies to any Docker host. What differs per server (reverse proxy layout, list of stacks, SMTP and auth providers, concrete addresses and ports) belongs in this host's domain (folder `<host>/`). This skill supplies **structure, patterns, and flow**.

## Directory layout

One directory per stack, all under a shared parent. This procedure uses `/opt/stack/<service-name>/` throughout. If the host already keeps its stacks elsewhere, that convention wins: an existing layout everyone knows beats a new one only this skill knows. Pick one and hold it, whichever it is.

```
/opt/stack/<service-name>/
  compose.yaml          # compose definition
  .env                  # secrets and configurable values (NEVER read, NEVER print)
  .env.example          # the same values as a template
  data/                 # persistent data
    <subfolder>/        # e.g. postgres/, app/, media/
```

## compose.yaml: required settings

### Application container

```yaml
services:
  <service>:
    image: <registry>/<image>:<exact-version>      # exact version, never :latest
    container_name: <service-name>
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    # cap_add: only if needed (overview below)
    pids_limit: 256                                # starting value, see the note under the database block
    ports:
      - "127.0.0.1:<host-port>:<container-port>"   # localhost only
    environment:
      TZ: <area/city>
      # secrets via ${VARIABLE} from the .env
    volumes:
      - ./data/<subfolder>:/path/in/container
    depends_on:
      <db-service>:
        condition: service_healthy
    networks:
      - default
```

### Database container (PostgreSQL preferred)

```yaml
  <service>-db:
    image: postgres:<major-version>-alpine
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
      test: ["CMD-SHELL", "pg_isready -U <user> -d <database>"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default
```

> **On the `pids_limit` numbers:** 256 for an application and 128 for a database or cache are starting
> values that hold for ordinary single-service stacks, not rules. What matters is that the limit exists at
> all, so a runaway process can't exhaust the host's process table. An application that legitimately forks
> more (a worker pool, a browser engine, a CI runner) gets a higher number; find it by watching the
> container under real load, not by raising it after the first crash.

### Redis/Valkey (if needed)

```yaml
  <service>-redis:
    image: redis:<major-version>-alpine            # or valkey/valkey:<version>
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

## Capabilities overview

Most application containers need **no** capabilities (`cap_drop: ALL` is enough). Start without `cap_add`; only when startup fails, give back the single one needed:

| Capability | When needed |
|---|---|
| CHOWN | entrypoint runs `chown` on the data directory |
| SETGID, SETUID | entrypoint drops the user via `setpriv`/`gosu` |
| DAC_OVERRIDE | file access beyond the normal permissions |
| SYS_PTRACE | sandbox mechanisms (e.g. gvisor) |
| NET_BIND_SERVICE | binds to ports below 1024 |

## Network and reverse proxy

- **No external Docker network:** each stack has its own internal network.
- Always bind ports to `127.0.0.1`; the reverse proxy connects via `127.0.0.1:<port>`.
- Find the next free port on the server; after setup record it in this host's domain (folder `<host>/`).
- The reverse proxy terminates TLS; by default the security headers HSTS, X-Content-Type-Options, and
  X-XSS-Protection; forward auth only for applications without their own OIDC. The concrete setup
  (Caddy/Traefik/nginx) lives per server in this host's domain.

## SMTP

Your relay provider, a dedicated SMTP user per service. Placeholders:

```env
SMTP_HOST=<smtp-relay-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@<domain>
```

The sender and service domain can differ: assume nothing, set a placeholder or ask.

## Login: OIDC via an identity provider

Use an OIDC identity provider (Authentik, Keycloak, Zitadel, Authelia, or a hosted one); the concrete address lives per server in this host's domain. Create per service by hand in the provider: a client or provider entry (OAuth2/OpenID) plus a linked application.

**Take endpoint paths from nowhere, not even from here.** Every provider lays them out differently, and a wrong path fails as a confusing redirect rather than a clear error. Pull them from the provider's discovery document, which every OIDC-compliant provider serves:

```bash
curl -s https://<oidc-host>/.well-known/openid-configuration | jq '{issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri}'
```

Map the result onto the variable names the application uses. The names differ per application; these are common:

```env
OIDC_CLIENT_ID=<from-provider>
OIDC_CLIENT_SECRET=<from-provider>
OIDC_ISSUER=<issuer, from the discovery document>
OIDC_AUTH_URL=<authorization_endpoint>
OIDC_TOKEN_URL=<token_endpoint>
OIDC_USERINFO_URL=<userinfo_endpoint>
OIDC_SCOPES=openid email profile
```

Many applications need only the issuer and find the rest themselves. Set the individual endpoints only where the application has no discovery of its own.

## Security-relevant application variables

| Aspect | Recommendation |
|---|---|
| Signup | disable (`SIGNUPS_ALLOWED=false` or similar) |
| Invitations | administrators only |
| Telemetry | disable |
| Debug mode | off (`APP_DEBUG=false`) |
| Rate limiting | enable if available |
| Password hints | disable if possible |
| API access | restrict and secure (JWT secret, API keys from the .env) |
| Session and cookie | `SESSION_SECURE_COOKIE=true` on HTTPS |
| Trusted proxies | `127.0.0.1` only |

## .env template

The agent does **not** create and does **not** read the `.env`: only a template with placeholders recording which values are needed:

```env
# === Database ===
POSTGRES_PASSWORD=<generate-a-strong-password>
# === Application secrets ===
APP_KEY=<generated-key>
# === SMTP ===
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=noreply@<domain>
# === OIDC ===
OIDC_CLIENT_ID=<from-provider>
OIDC_CLIENT_SECRET=<from-provider>
```

## Typical exceptions to the prohibitions (with approval)

- **docker.sock** (`:ro`): e.g. an identity-provider outpost or a reverse proxy that discovers containers
  itself.
- **network_mode: host:** e.g. RustDesk (UDP hole punching).

## Acceptance checklist for new stacks

1. [ ] Image pinned to an exact version
2. [ ] `security_opt: [no-new-privileges:true]` on application containers
3. [ ] `cap_drop: [ALL]`, only minimal `cap_add` if needed
4. [ ] `pids_limit` set at all, with a value chosen for this application
5. [ ] Port bound to `127.0.0.1` only
6. [ ] Healthchecks for database and Redis
7. [ ] Volumes under `./data/`
8. [ ] Secrets via `${VARIABLE}`, not hardcoded
9. [ ] Signup disabled
10. [ ] Telemetry disabled
11. [ ] Debug mode off
12. [ ] OIDC set up (if the application supports it)
13. [ ] SMTP with placeholders
14. [ ] Reverse-proxy entry with security headers
15. [ ] Port recorded in this host's domain
16. [ ] Stack recorded in this host's domain
17. [ ] For a database container: add it as a dump target (skill `callbell-sysadmin-backup`)
18. [ ] Ask the user whether to create a commit
