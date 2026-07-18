# Callbell

*[English](README.md) · [Deutsch](README.de.md)*

**Ein Experte, umgeben von Experten.** Du bist der Experte; die Agents und Sub-Agents sind Experten, die
für dich arbeiten. Und die Kommunikation dazwischen ist **faul**: die schlankste Lösung, die wirklich
trägt, statt Aufwand auf Vorrat. Der Name ist die Metapher, eine **Call Bell** (Service-Glocke): du
klingelst, die Experten kommen. Deshalb trägt alles, was callbell liefert, das Präfix `callbell`.

Callbell ist **nicht** auf Coding begrenzt. Es ist ein Rahmen für agentische Solo-Arbeit, für Devs und
Non-Devs gleichermaßen.

## Ein Plugin

Callbell ist ein **Plugin**, einmal pro Gerät installiert und in jedem Ordner aktiv. Es trägt die Skills,
die Normen und einen Session-Hook, der den Kontext liefert. Es gibt nichts zu kopieren und nichts zu
wählen.

Das Plugin bedient beide Arten von Arbeit aus einer Installation. Ein Session-Hook löst zur Laufzeit die
**Linse** auf: ob ein Repo primär ausführbarer Code ist oder primär Markdown, das ein Thema steuert. Die
faule Skill-Familie liest diese Linse und passt sich an. Code-Projekte bekommen die Code-Ausprägung,
operative Arbeit (Personal OS, Business OS, Wiki & Docs) die Ops-Ausprägung plus das Ablage-System, und der
Backbone darunter ist geteilt: Konventionen, Frontmatter, Zonen, Backlog, Memory, Datenschutz, Git.

## Nutzung

1. Das Plugin aus dem Marketplace **installieren**.
2. Arbeiten. Die Skills und Normen sind sofort aktiv, in jedem Ordner.
3. Optional `/callbell-onboarding` starten: der Agent führt dich durch das Setup und legt ein dauerhaftes
   Projekt-Scaffold an (Kontext, Memory, Backlog, Zonen). Ein Scaffold anzulegen ist eine bewusste
   Handlung und passiert deshalb nie automatisch.

**Das Höchste, worum callbell dich je bittet: Node im PATH.** Der Session-Hook, der die Normen und den
Projektkontext liefert, läuft über Node — `node` muss also im PATH sein (Nix/nvm: im PATH der
*non-interactive* Shell). Fehlt es, bricht nichts lautstark: die Skills funktionieren weiter, nur die
Always-on-Normen und der Kontext bleiben still, statt bei jedem Prompt zu erroren.

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
    Kontext und Regeln. Läuft unter Claude wie unter Codex.
- `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` — die Marketplace-Kataloge, einer
  je Host, die die Collection und etwaige Packs listen.
- `node scripts/callbell-publish.js` — Version stempeln, committen, pushen.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
