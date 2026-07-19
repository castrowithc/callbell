# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**Ein Experte, umgeben von Experten.** Du bist der Experte; die Agents und Sub-Agents sind Experten, die
für dich arbeiten. Und die Kommunikation dazwischen ist **faul**: die schlankste Lösung, die wirklich
trägt, statt Aufwand auf Vorrat. Der Name ist die Metapher, eine **Call Bell** (Service-Glocke): du
klingelst, die Experten kommen. Deshalb trägt alles, was callbell liefert, das Präfix `callbell`.

Callbell ist **nicht** auf Coding begrenzt. Es ist ein Rahmen für agentische Solo-Arbeit, für Devs und
Non-Devs gleichermaßen.

## Der Always-on-Core

Callbells Core ist **ein Plugin**, einmal pro Gerät installiert und in jedem Ordner aktiv. Es trägt die
Skills, die Normen und einen Session-Hook, der den Kontext liefert. Installieren und arbeiten — nichts zu
kopieren, nichts zu konfigurieren. Optionale Zweck-Packs installieren sich genauso aus demselben
Marketplace, nur wenn du sie willst.

Der Core bedient beide Arten von Arbeit aus einer Installation. Ein Session-Hook löst zur Laufzeit die
**Linse** auf: ob ein Repo primär ausführbarer Code ist oder primär Markdown, das ein Thema steuert. Die
faule Skill-Familie liest diese Linse und passt sich an. Code-Projekte bekommen die Code-Ausprägung,
operative Arbeit (Personal OS, Business OS, Wiki & Docs) die Ops-Ausprägung plus das Ablage-System, und der
Backbone darunter ist geteilt: Konventionen, Frontmatter, Zonen, Backlog, Memory, Datenschutz, Git.

## Installation

Den Marketplace einmal hinzufügen, dann daraus installieren, was du willst.

**Claude Code:**

```
claude plugin marketplace add castrowithc/callbell
claude plugin install callbell@callbell
```

**Codex:**

```
codex plugin marketplace add castrowithc/callbell
codex plugin add callbell@callbell
```

Unter Codex folgt ein Handgriff, denn Codex führt Hooks, die in einem Plugin stecken, bisher nicht aus
([openai/codex#16430](https://github.com/openai/codex/issues/16430); das Feature `plugin_hooks` fehlt in
0.134.0). Die Skills installieren und funktionieren, aber der Session-Hook feuert nie — also keine Normen,
kein Projektkontext, keine Linse. Trag ihn selbst in `~/.codex/hooks.json` ein und ersetze beide Pfade durch
die Installationswurzel, die `codex plugin add` ausgegeben hat:

```json
{ "hooks": { "SessionStart": [ { "matcher": "startup|resume",
  "hooks": [ { "type": "command",
    "command": "PLUGIN_ROOT=<installationswurzel> node <installationswurzel>/hooks/callbell-context.js --rules",
    "timeout": 5 } ] } ] } }
```

Codex fragt vor dem ersten Lauf, ob du dem neuen Hook vertraust. Sollte eine spätere Codex-Version
Plugin-Hooks von sich aus ausführen, siehst du den Kontext doppelt — dann diesen Eintrag entfernen.

## Was du installieren kannst

- **`callbell`** — der Always-on-Core: die Normen, der Session-Hook und `/callbell:start` als Einstieg.
  Mehr braucht es nicht.
- **`callbell-sysadmin`** — ein Server-Manager-Pack: eine passive Sicherheitsschicht, die vor zerstörerischen
  Befehlen Erklärung und Bestätigung verlangt, dazu Skills, um einen Linux-Host aufzusetzen, zu härten, zu
  sichern, zu bespielen und zu prüfen. **Vor der Installation:** es ist für die Arbeit *auf einem Server* —
  du brauchst Shell-Zugang zu diesem Host und root oder sudo darauf, und einige Skills setzen Docker voraus,
  wo dein Stack es nutzt. Es bleibt vollständig still, bis du eine Host-Identität deklarierst
  (`__callbell__/.host-identity`); geräteweit installiert kostet es deine Code-Repos also nichts.
  Installation mit `claude plugin install callbell-sysadmin@callbell` bzw.
  `codex plugin add callbell-sysadmin@callbell`.

## Nutzung

1. Wie oben **installieren**.
2. **`/callbell:start`** in dem Ordner ausführen, in dem du arbeiten willst. Er prüft, was da ist — Node,
   git, das Gerüst, dein Ruleset —, meldet nur das Fehlende und bietet an, es anzulegen. Geschrieben wird
   erst, wenn du es sagst. Ruf ihn auf, wann immer du irgendwo neu anfängst; in einem eingerichteten
   Ordner kostet er dich eine Zeile.
3. Arbeiten. Die Skills und Normen sind sofort aktiv, in jedem Ordner.

**Das Höchste, worum callbell dich je bittet: Node im PATH.** Der Session-Hook, der die Normen und den
Projektkontext liefert, läuft über Node — `node` muss also im PATH sein (Nix/nvm: im PATH der
*non-interactive* Shell). Fehlt es, bricht nichts lautstark — keine Fehler, keine abgebrochenen Prompts —,
aber alles, was der Hook liefert, fällt weg: die Always-on-Normen, der Projektkontext, die Memory- und
Backlog-Indizes und die Linse. Die Skills selbst laden und laufen weiter; die linsenlesenden (`callbell`,
`callbell-review`, `callbell-audit`, `callbell-help`) leiten die Linse dann aus der Aufgabe ab, was
unzuverlässiger ist, als sie gesagt zu bekommen. Ein Notbetrieb, kein unterstützter Zustand.

## Der `callbell`-Namensraum

`callbell-*` ist **reserviert** für die vom Plugin gelieferten Skills und Rules. Der faule Flagship-Modus
heißt schlicht `callbell` und flavored sich über die Linse.

Deine **eigenen** Skills legst du **außerhalb** dieses Präfixes an (eigener Name oder eigenes Präfix). So
bleiben Plugin- und User-Skills jederzeit unterscheidbar, auch wenn du sie zwischen Projekten mischst.

## Dieses Repo

Dieses Repo **ist** ein Marketplace: die Always-on-Collection `callbell` plus optionale Zweck-Packs, jedes
ein eigenes installierbares Plugin unter `plugins/`. Es gibt keinen Build-Schritt und nichts wird
generiert: jedes Plugin wird hier direkt geschrieben, und was du liest, ist das, was installiert wird.

- `plugins/callbell/` — die Collection, das, was du installierst und always-on läuft:
  - `skills/` — ein flacher Ordner; die Linse entscheidet zur Laufzeit über Code oder Ops, nicht die Ablage.
  - `rules/core/` — Normen, die in jedem Repo gelten. Immer injiziert.
  - `rules/scaffold/` — Normen, die nur dort etwas bedeuten, wo ein `__callbell__/`-Gerüst existiert
    (Backlog, Zonen, Frontmatter, Memory, Struktur). Nur dort injiziert; ein Repo ohne Gerüst zahlt nichts.
  - `hooks/callbell-context.js` — der SessionStart-Hook: löst die Linse auf, meldet das Gerüst und injiziert
    Kontext und Regeln. Claude führt ihn aus dem Plugin aus; unter Codex muss er von Hand registriert werden
    (siehe Installation).
- `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` — die Marketplace-Kataloge, einer
  je Host, die die Collection und etwaige Packs listen.
- `node scripts/callbell-publish.js` — Version stempeln, committen, pushen.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
