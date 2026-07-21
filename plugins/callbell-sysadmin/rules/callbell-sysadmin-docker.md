---
paths: ["**/*"]
description: >
  Richtlinie für Docker-Stacks: niemals Secret-Werte ausgeben oder persistieren (das eigene Compose zum
  Dokumentieren zu lesen ist in Ordnung), kein docker.sock/privileged/host-net ohne Rückfrage, kein :latest
  oder root, keine hartcodierten Secrets, SMTP-Platzhalter.
type: rule
edit: locked
---

# Docker-Stacks: Richtlinie und Verbote

## Grundsatz
Lesen zum Verstehen oder Dokumentieren ist erlaubt. Secret-**Werte** auszugeben oder sie ins Repo zu
schreiben (git, dann push), ist verboten. Der Schutz liegt auf den *Werten*, nicht auf der Struktur.

## Secrets: immer tabu
- **Niemals `.env`-Werte ausgeben** im Chat oder in eine Repo-Datei schreiben.
- **Niemals `docker exec … printenv` ausführen oder das `docker inspect`-env-Feld lesen.** Beides löst Secret-Werte auf.
- Variablen-**Namen** dürfen genannt werden. **Werte** nie.
- Für einen neuen Stack ein `.env`-Template mit Platzhaltern anlegen; der Nutzer füllt es aus.
- Niemals Secrets hartcodieren (siehe unten). Taucht je ein Inline-Secret in einer Compose-Datei auf, wird
  der Wert **nicht** übernommen.

## Lesen zum Dokumentieren: erlaubt
- Die **eigene** `compose.yaml`/`*.yml` eines Stacks darf gelesen werden, um genau diesen Stack zu
  dokumentieren (Image, Ports, Volumes, env-*Keys*, Netzwerke).
- `.env.example`/`.env.template` (öffentliche Key-Templates) dürfen gelesen und genutzt werden. Gibt es kein
  lokales Template, nimm die Key-Liste aus dem offiziellen Upstream-Repo.
- `.env`-*Werte* bleiben draußen. Sie leben in `.env`, nicht in der Compose-Datei.

## Keine Konventionen von anderen Stacks kopieren
- **Schau nicht in die Compose-Dateien anderer Stacks, um Konventionen zu lernen**, nicht mal "nur zum
  Nachsehen". Es geht um Cargo-Culting, nicht ums Dokumentieren des eigenen Stacks.
- Folge stattdessen deinen eigenen etablierten Stack-Konventionen (Struktur, Sicherheit, Muster).

## Sicherheit für neue Stacks
- Prüfe die offiziellen Docker-Docs oder -Repos (Image, Variablen, Volumes).
- **Niemals docker.sock mounten** ohne den Nutzer ausdrücklich zu fragen.
- **Niemals privileged setzen.**
- **Niemals `network_mode: host` setzen** ohne ausdrückliche Rückfrage.
- **Niemals `:latest` oder ein ungetaggtes Image verwenden.** Immer eine konkrete Version pinnen für einen
  reproduzierbaren Zustand.
- **Vermeide `user: root` im Container.** Setze einen unprivilegierten User, wo die App es erlaubt.
- **Niemals Secrets hartcodieren.** Nur über `.env` oder Platzhalter, nie in Compose oder Image.
- Ermittle alle sicherheitsrelevanten App-Variablen und konfiguriere sie restriktiv (Registrierung,
  Telemetrie, Debug, API-Zugriff, Rate-Limiting).

## SMTP
- Nimm nicht an, welche Domain als Absender genutzt wird.
- Nutze einen Platzhalter: `noreply@<domain>`.
- Die Absender-Domain kann von der Dienst-Domain abweichen.
- Bei Unklarheit: fragen.
