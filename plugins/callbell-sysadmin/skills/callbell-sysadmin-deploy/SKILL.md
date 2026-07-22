---
name: callbell-sysadmin-deploy
description: >
  Richtet einen neuen Docker-Stack nach festen Konventionen ein: Verzeichnisaufbau, Pflichtangaben in
  compose, Capabilities, Netz, Reverse Proxy, Platzhalter für SMTP und OIDC, sicherheitsrelevante
  Variablen, Abnahmeliste. Starte es, indem du /callbell-sysadmin-deploy tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Einen Docker-Stack einrichten: Konventionen und Vorgehen

Gilt für jeden Docker-Host. Was je Server anders ist (Aufbau des Reverse Proxy, Liste der Stacks, SMTP- und
Auth-Anbieter, konkrete Adressen und Ports), gehört in die Domäne dieses Hosts (Ordner `<host>/`). Dieser
Skill liefert **Struktur, Muster und Ablauf**.

## Verzeichnisaufbau

Ein Verzeichnis je Stack, alle unter einem gemeinsamen Elternordner. Dieses Vorgehen nutzt
`/opt/stack/<dienstname>/` und bleibt durchgehend dabei. Legt der Host seine Stacks bereits woanders ab,
gewinnt diese Konvention: ein bestehender Aufbau, den alle kennen, schlägt einen neuen, den nur dieser Skill
kennt. Entscheide dich für einen und halte ihn, welcher es auch ist.

```
/opt/stack/<dienstname>/
  compose.yaml          # Compose-Definition
  .env                  # Geheimnisse und konfigurierbare Werte (NIE lesen, NIE ausgeben)
  .env.example          # dieselben Werte als Vorlage
  data/                 # dauerhafte Daten
    <unterordner>/      # etwa postgres/, app/, media/
```

## compose.yaml: Pflichtangaben

### Anwendungscontainer

```yaml
services:
  <dienst>:
    image: <registry>/<image>:<genaue-version>     # genaue Version, nie :latest
    container_name: <dienstname>
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    # cap_add: nur wenn nötig (Übersicht unten)
    pids_limit: 256                                # Startwert, siehe Hinweis unter dem Datenbankblock
    ports:
      - "127.0.0.1:<host-port>:<container-port>"   # nur localhost
    environment:
      TZ: <Gebiet/Stadt>
      # Geheimnisse über ${VARIABLE} aus der .env
    volumes:
      - ./data/<unterordner>:/pfad/im/container
    depends_on:
      <db-dienst>:
        condition: service_healthy
    networks:
      - default
```

### Datenbankcontainer (PostgreSQL bevorzugt)

```yaml
  <dienst>-db:
    image: postgres:<hauptversion>-alpine
    container_name: <dienstname>-db
    restart: unless-stopped
    pids_limit: 128
    environment:
      POSTGRES_DB: <dienst>
      POSTGRES_USER: <dienst>
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U <benutzer> -d <datenbank>"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - default
```

> **Zu den Zahlen bei `pids_limit`:** 256 für eine Anwendung und 128 für Datenbank oder Cache sind
> Startwerte, die für übliche Ein-Dienst-Stacks tragen, keine Vorschriften. Worauf es ankommt, ist, dass es
> die Grenze überhaupt gibt, damit ein entlaufener Prozess die Prozesstabelle des Hosts nicht erschöpfen
> kann. Eine Anwendung, die berechtigterweise mehr forkt (ein Worker-Pool, eine Browser-Engine, ein
> CI-Runner), bekommt eine höhere Zahl; finde sie, indem du den Container unter echter Last beobachtest,
> nicht indem du sie nach dem ersten Absturz anhebst.

### Redis/Valkey (falls nötig)

```yaml
  <dienst>-redis:
    image: redis:<hauptversion>-alpine             # oder valkey/valkey:<version>
    container_name: <dienstname>-redis
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

## Übersicht der Capabilities

Die meisten Anwendungscontainer brauchen **keine** Capabilities (`cap_drop: ALL` genügt). Fang ohne
`cap_add` an; erst wenn der Start scheitert, gib die einzelne benötigte zurück:

| Capability | Wann nötig |
|---|---|
| CHOWN | Entrypoint führt `chown` auf dem Datenverzeichnis aus |
| SETGID, SETUID | Entrypoint wechselt den Benutzer über `setpriv`/`gosu` |
| DAC_OVERRIDE | Dateizugriff über die normalen Rechte hinaus |
| SYS_PTRACE | Sandbox-Mechanismen (etwa gvisor) |
| NET_BIND_SERVICE | bindet auf Ports unter 1024 |

## Netz und Reverse Proxy

- **Kein externes Docker-Netz:** jeder Stack hat sein eigenes internes Netz.
- Portbindung immer auf `127.0.0.1`; der Reverse Proxy verbindet sich über `127.0.0.1:<port>`.
- Den nächsten freien Port auf dem Server suchen; nach der Einrichtung in der Domäne dieses Hosts
  (Ordner `<host>/`) festhalten.
- Der Reverse Proxy beendet TLS; als Standard die Sicherheitsheader HSTS, X-Content-Type-Options und
  X-XSS-Protection; Forward Auth nur für Anwendungen ohne eigene OIDC-Anbindung. Der konkrete Aufbau
  (Caddy/Traefik/nginx) steht je Server in der Domäne dieses Hosts.

## SMTP

Dein Relay-Anbieter, ein eigener SMTP-Benutzer je Dienst. Platzhalter:

```env
SMTP_HOST=<smtp-relay-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-benutzer>
SMTP_PASSWORD=<smtp-passwort>
SMTP_FROM=noreply@<domain>
```

Absender- und Dienstdomäne können sich unterscheiden: nichts annehmen, Platzhalter setzen oder fragen.

## Anmeldung: OIDC über einen Identitätsanbieter

Nutze einen OIDC-Identitätsanbieter (Authentik, Keycloak, Zitadel, Authelia oder einen gehosteten); die
konkrete Adresse steht je Server in der Domäne dieses Hosts. Je Dienst im Anbieter von Hand anlegen: einen
Client- oder Provider-Eintrag (OAuth2/OpenID) plus eine verknüpfte Anwendung.

**Übernimm Endpunktpfade nirgendwoher, auch nicht von hier.** Jeder Anbieter legt sie anders, und ein
falscher Pfad scheitert als verwirrende Weiterleitung statt als klarer Fehler. Hol sie aus dem
Discovery-Dokument des Anbieters, das jeder OIDC-konforme Anbieter ausliefert:

```bash
curl -s https://<oidc-host>/.well-known/openid-configuration | jq '{issuer, authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri}'
```

Bilde das Ergebnis auf die Variablennamen ab, die die Anwendung verwendet. Die Namen unterscheiden sich je
Anwendung; verbreitet sind diese:

```env
OIDC_CLIENT_ID=<vom-anbieter>
OIDC_CLIENT_SECRET=<vom-anbieter>
OIDC_ISSUER=<issuer, aus dem Discovery-Dokument>
OIDC_AUTH_URL=<authorization_endpoint>
OIDC_TOKEN_URL=<token_endpoint>
OIDC_USERINFO_URL=<userinfo_endpoint>
OIDC_SCOPES=openid email profile
```

Viele Anwendungen brauchen nur den Issuer und finden den Rest selbst. Setz die einzelnen Endpunkte nur dort,
wo die Anwendung keine eigene Discovery hat.

## Sicherheitsrelevante Variablen der Anwendung

| Aspekt | Empfehlung |
|---|---|
| Registrierung | abschalten (`SIGNUPS_ALLOWED=false` oder ähnlich) |
| Einladungen | nur durch Administratoren |
| Telemetrie | abschalten |
| Debug-Modus | aus (`APP_DEBUG=false`) |
| Rate Limiting | einschalten, wenn vorhanden |
| Passworthinweise | abschalten, wenn möglich |
| API-Zugriff | einschränken und absichern (JWT-Secret, API-Schlüssel aus der .env) |
| Session und Cookie | `SESSION_SECURE_COOKIE=true` bei HTTPS |
| Vertrauenswürdige Proxys | nur `127.0.0.1` |

## Vorlage für die .env

Die `.env` wird vom Agenten **nicht** angelegt und **nicht** gelesen: nur eine Vorlage mit Platzhaltern, die
festhält, welche Werte gebraucht werden:

```env
# === Datenbank ===
POSTGRES_PASSWORD=<starkes-passwort-erzeugen>
# === Geheimnisse der Anwendung ===
APP_KEY=<erzeugter-schluessel>
# === SMTP ===
SMTP_USERNAME=<smtp-benutzer>
SMTP_PASSWORD=<smtp-passwort>
SMTP_FROM=noreply@<domain>
# === OIDC ===
OIDC_CLIENT_ID=<vom-anbieter>
OIDC_CLIENT_SECRET=<vom-anbieter>
```

## Typische Ausnahmen von den Verboten (mit Freigabe)

- **docker.sock** (`:ro`): etwa ein Outpost des Identitätsanbieters oder ein Reverse Proxy, der Container
  selbst entdeckt.
- **network_mode: host:** etwa RustDesk (UDP Hole Punching).

## Abnahmeliste für neue Stacks

1. [ ] Image auf eine genaue Version festgelegt
2. [ ] `security_opt: [no-new-privileges:true]` auf Anwendungscontainern
3. [ ] `cap_drop: [ALL]`, nur minimales `cap_add`, falls nötig
4. [ ] `pids_limit` überhaupt gesetzt, mit einem für diese Anwendung gewählten Wert
5. [ ] Port nur auf `127.0.0.1` gebunden
6. [ ] Healthchecks für Datenbank und Redis
7. [ ] Volumes unter `./data/`
8. [ ] Geheimnisse über `${VARIABLE}`, nicht fest eingetragen
9. [ ] Registrierung abgeschaltet
10. [ ] Telemetrie abgeschaltet
11. [ ] Debug-Modus aus
12. [ ] OIDC eingerichtet (sofern die Anwendung es unterstützt)
13. [ ] SMTP mit Platzhaltern
14. [ ] Eintrag im Reverse Proxy mit Sicherheitsheadern
15. [ ] Port in der Domäne dieses Hosts festgehalten
16. [ ] Stack in der Domäne dieses Hosts festgehalten
17. [ ] Bei einem Datenbankcontainer: als Dump-Ziel ergänzen (Skill `callbell-sysadmin-backup`)
18. [ ] Den Nutzer fragen, ob ein Commit angelegt werden soll
