---
name: help
description: >
  Kurzreferenz zu callbell in diesem Repo: welche Skills der Kern mitbringt, welche Pakete es sonst noch
  gibt und wie Agent und Nutzer zusammenarbeiten. Einmalige Anzeige, kein dauerhafter Modus. Auslöser:
  /callbell:help, "callbell help", "callbell hilfe", "was kann callbell", "welche callbell befehle",
  "wie arbeite ich hier".
type: skill
edit: locked
disable-model-invocation: true
---

# Callbell Hilfe

Zeige diese Karte, wenn du aufgerufen wirst. Einmalig, kein Moduswechsel, nichts wird gespeichert.

Der Kern ist die Schnittstelle zwischen dir und dem Agenten: gemeinsame Normen, ein Gerüst für Backlog und
Gedächtnis, Ablage, Import, Planung und Git. Er trägt keinen eigenen Zweck — was gearbeitet wird,
entscheiden die Pakete.

## Skills

| Skill | Auslöser | Was er tut |
|-------|----------|------------|
| **start** | `/callbell:start` | Der Einstieg: prüft Abhängigkeiten und Gerüst, ergänzt was fehlt, klärt einmalig Zweck und Rollen. Ruf ihn beim Ankommen oder wenn etwas fehlt. |
| **filing** | `/callbell:filing` | Entscheidet, wohin eine Datei gehört und wie der Baum wächst. |
| **plan** | nur `/callbell:plan` | Macht aus einer Idee Arbeitspakete: Warum, Rahmen, Vorgehen, fertig. Du startest ihn; er startet sich nie selbst. |
| **import** | "liegt in der Ablage", `/callbell:import` | Macht aus Rohmaterial in `__callbell__/zone-import/` geschwärzten, abgelegten Inhalt. |
| **commit** | `/callbell:commit`, "committe das" | Committet über eine Nachricht, die du gelesen hast: entworfen, vollständig gezeigt, korrigiert, dann committet und gepusht. |
| **worktree** | `/callbell:worktree` | Git-Worktree für parallele Arbeit, nach dem Merge aufgeräumt. |
| **help** | `/callbell:help` | Diese Karte. |

Codex nutzt dieselben Skills mit dem Präfix `@`; Claude nutzt die `/`-Formen oben.

## Pakete

Der Kern allein entscheidet nicht, *welche* Arbeit getan wird. Dafür gibt es Pakete, die du im selben
Marktplatz einzeln zuschaltest — keines ist vorausgewählt:

| Paket | Wofür |
|-------|-------|
| **callbell-dev** | Code: die faulste Lösung, die wirklich trägt, in drei Stufen, plus ein Review gegen Überbau — für einen Diff oder das ganze Repo. `/callbell-dev:help` |
| **callbell-sysadmin** | Server: eine stille Sicherheitsschicht plus Skills für den Betrieb. `/callbell-sysadmin:help` |

## Wie ihr zusammenarbeitet

- **Rollen:** du entscheidest und prüfst, der Agent führt strukturiert und weitgehend eigenständig aus.
- **Freigaben:** Struktur- oder Schemaänderungen (und neue Bereiche in ops) sowie das Überführen von
  Entwürfen nur nach Freigabe; Routine im etablierten Rahmen erledigt der Agent selbst (siehe
  `callbell-governance`).
- **Struktur:** der Pfad sagt WO, das Frontmatter sagt WAS, `status` treibt die Reife.
- **Zonen:** `__callbell__/zone-import/` (Eingaben) und `__callbell__/zone-export/` (angeforderte
  Ergebnisse), die zwei flüchtigen Puffer. Die versionierte Arbeitsspur ist `__callbell__/backlog/`
  (verwalteter Zustand, keine Zone).

## Namensraum

Die Skills des Kerns tragen keinen Präfix im Namen — der Namensraum `callbell:` trennt sie bereits von
allem anderen. Deine eigenen Skills legst du außerhalb der Pakete an; sie können nicht kollidieren.
Abschalten: "stop callbell" oder "normaler Modus".
