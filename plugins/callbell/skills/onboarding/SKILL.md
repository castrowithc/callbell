---
name: callbell-onboarding
description: >
  Führt den Nutzer durch die erstmalige Einrichtung dieses Repos: Sicht und Kontext klären, das Gerüst
  ablegen und den Nutzer einweisen, wie die Zusammenarbeit läuft. Passt sich an einen code- oder einen
  ops-Repo an. Nimmt ein optionales Argument: `bare` legt das Gerüst ohne das Gespräch ab, `top-up` bringt
  ein bestehendes Gerüst ergänzend auf den ausgelieferten Stand. Nur auf ausdrücklichen Aufruf
  (/callbell-onboarding), nie automatisch.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-onboarding

## 0. Welcher Modus (lies zuerst das Argument und den Ordner)
Drei Situationen, und nur die erste ist das volle Gespräch. Entscheide, bevor du irgendetwas fragst.

- **`top-up`** (oder jeder Ordner, der bereits `__callbell__/` hat): führe das Gespräch **nicht**. Geh
  direkt zu Schritt 3a. Der Repo ist schon eingerichtet; was er braucht, sind die fehlenden Teile des
  neueren Gerüsts.
- **`bare`**: lege das Gerüst ab und frage nichts. Nimm die Sicht aus `PROJECT TYPE` im Session-Kontext; nur
  wenn dort `unknown` steht, stelle diese eine Frage, denn nichts anderes kann sie beantworten. Mach
  Schritt 3, stempele die Version und hör auf. Kein Zweck, keine Rollen, keine Bereiche, keine Einweisung.
  Schließe damit ab, dass das Gerüst da ist, dass `repo.md` und `roles.md` noch Vorlagen sind und dass
  `/callbell-onboarding` sie ausfüllt, wann immer der Nutzer will. Das gibt es, weil das Gespräch für das
  Aufsetzen eines Projekts richtig ist und viel zu viel, wenn jemand nur den Ordner will, damit die Session
  ein Backlog hat.
- **kein Argument, kein `__callbell__/`**: die volle geführte Einrichtung unten, ab Schritt 1.

Du führst den Nutzer **aktiv** durch die einmalige Einrichtung dieses Repos und bleibst dabei, bis der Repo
die Informationen trägt, die er zum Arbeiten braucht. Arbeite in kurzen Schritten, stelle immer nur
**wenige Fragen auf einmal**, schreibe erst nach Bestätigung und lade jederzeit zu Rückfragen ein. Die
**eine Ausnahme** ist die Frage nach der Vertrautheit (Schritt 1), die strikt für sich gestellt wird und nie
mit einer anderen gebündelt.

Die **Interaktions**sprache wird hier nicht gefragt: sie ist eine Eigenschaft pro Nutzer und über alle
Projekte hinweg, um die sich `callbell-language` selbst kümmert, in jeder Session, auch in denen, die diesen
Skill nie erreichen. Die Sprache der **Inhalte** im Repo (Ordner- und Bereichsnamen) ist eine eigene Achse,
in `repo.md` festgehalten und in Schritt 4 gesetzt.

## 1. Vertrautheit zuerst (eine eigenständige Frage, für sich allein)
**Vor** der Sicht stelle eine eigenständige Frage und **sonst nichts**: kennt der Nutzer das
callbell-Onboarding schon? Zwei Optionen, jede mit einer einzeiligen Beschreibung:
- **Ja, ich kenne es** ("schon gemacht, ich kenne den Ablauf") setzt den **Express-Modus**.
- **Nein, führe mich** ("noch nie, oder nicht oft genug, führ mich durch") setzt den **geführten Modus**.

Die Antwort setzt die **Tiefe des Rests**, und nur das. Sie ändert, wie viel du **erklärst**, nie welche
Projektdaten du **erhebst**: Sicht, Zweck, Rollen und Bereiche werden in beiden Modi gefragt.
- **Geführt:** erkläre unterwegs, halte die Einweisung (Schritt 6) vollständig und biete am Ende den
  Tiefgang zu `__callbell__` an (Schritt 7).
- **Express:** lass das Erklären weg, verdichte die Einweisung auf eine Zeile und nenne am Ende nur den
  Ordner `__callbell__`, ohne Angebot.

## 2. Die Sicht, dann ihre Unterfrage
Lies `PROJECT TYPE` aus dem Session-Kontext (**code** oder **ops**) und **bestätige es mit dem Nutzer**,
bevor du weitermachst: die Ersatzerkennung kann falsch liegen, solange die Sicht nicht in Schritt 4
festgeschrieben ist, nimm sie also nie als gegeben, und frage bei `unknown` oder `ambient` direkt nach.
Dann sofort die zugehörige Unterfrage mit einer einzeiligen Beschreibung:
- **ops:** Personal OS, Business OS oder **Mixed** (Privates und Geschäftliches in einem Repo, typisch für
  Solo-Unternehmer und Freiberufler). Die Wahl hältst du in Schritt 4 in `repo.md` fest.
- **code:** der Technologie-Stack in groben Zügen und in welchem Stadium er ist. Der Weg der Ablage
  (Full/Clean) kommt in Schritt 5.

## 3. Das Gerüst anlegen (sobald die Sicht bekannt ist)
**Wenn dieser Ordner kein `__callbell__/` hat**, wurdest du als geräteweites Plugin in einem leeren Ordner
gestartet (ambient-Modus). Lege das **Projektgerüst** aus der mitgelieferten Kopie des Plugins unter
`${CLAUDE_PLUGIN_ROOT}/skills/callbell-onboarding/scaffold/` in den aktuellen Ordner. Das Plugin liefert
Regeln, Skills, Hook und Regelsatz geräteweit (der Hook spielt sie ein, projektlokal gewinnt), das Gerüst
trägt also **nur Projektzustand**, nie eine zweite Kopie davon:
- Kopiere die gemeinsame Basis wortgetreu: `__callbell__/` (den strukturellen Kopf `README.md`, den
  Kontext, den Gedächtnisindex, die Vorlagengerüste), den Backlog-Index `__callbell__/backlog/BACKLOG.md`
  und die zwei Zonen `__callbell__/zone-import/.gitkeep` und `__callbell__/zone-export/.gitkeep`.
- **`.gitignore`: anhängen, nie ersetzen.** Das Bündel trägt die Regeln als `scaffold/gitignore` (der Punkt
  fehlt, damit die Datei dort wirkungslos ist). Gibt es im Repo keine `.gitignore`, kopiere sie. Ist schon
  eine da, prüfe, ob sie `__callbell__/zone-import/` bereits ignoriert; wenn ja, ändere nichts, wenn nein,
  hänge den Inhalt des Bündels nach einer Leerzeile wortgetreu an (Kommentare eingeschlossen). Jede
  vorhandene Zeile bleibt unangetastet, denn diese Regeln gehören dem Nutzer, und sie zu überschreiben ist
  Datenverlust. Eine Prüfung, kein Zusammenführen, und ein zweiter Lauf ergänzt nichts.
- **Zusätze der Sicht aus `scaffold/_lens/`:** für **ops** kopiere `_lens/ops/framework.md` nach
  `__callbell__/framework.md` und `_lens/ops/templates/*` nach `__callbell__/templates/`; für **code**
  kopiere `_lens/code/docs/framework.md` nach `__callbell__/docs/framework.md`.

- **Stempele die Version, immer und zuletzt.** Lies die `VERSION` des Plugins und schreibe sie in das
  Frontmatter von `repo.md` als `scaffold-version: <version>`. Der Hook vergleicht diesen Stempel mit der
  ausgelieferten `VERSION` und meldet die Abweichung, ein ungestempeltes Gerüst liest sich also für immer
  als veraltet. Das ist das eine Frontmatter-Feld, das der Nutzer nie bearbeitet.

Ein Ordner, der das Gerüst schon trägt, geht stattdessen zu Schritt 3a. Wenn `${CLAUDE_PLUGIN_ROOT}` aus
der Session nicht auflösbar ist, frage den Nutzer nach dem Installationspfad des Plugins.

Lege dann `__callbell__/backlog/task-initial-onboarding.md` an (Vorlage in
`__callbell__/templates/task.md`, `status: active`) und ergänze eine Zeile in
`__callbell__/backlog/BACKLOG.md`. Hake die Schritte unterwegs ab, damit der Stand eine Pause übersteht. Im
Modus **bare** entfällt dieser Task, denn es gibt kein Gespräch zu verfolgen.

## 3a. Top-up: ein bestehendes Gerüst, auf den ausgelieferten Stand gebracht
**Nur ergänzend, und das ist der ganze Entwurf.** Kopiere hinein, was **fehlt**; fasse nichts an, was
**da ist**. Vergleiche keine Inhalte, führe nichts zusammen, biete nicht an, eine Datei zu "aktualisieren",
die der Nutzer bearbeitet hat. Seine `repo.md` gehört ihm, und dass sie nicht verglichen wird, ist genau der
Grund, warum seine Änderungen überleben. Es gibt hier keinen Rückschritt und keinen Migrationspfad; ein
Gerüst, das neuer ist als das Plugin, bleibt in Ruhe.

- Geh das Bündel durch (die gemeinsame Basis plus die Zusätze der Sicht für den `project-type` dieses Repos)
  und ergänze jede Datei, die der Repo nicht hat, samt der nötigen Ordner.
- Wende den Schritt zur `.gitignore` genauso an wie in Schritt 3: prüfen, anhängen wenn die Zonenregeln
  fehlen, nie ersetzen.
- Schreibe `scaffold-version` in `repo.md` zuletzt auf die `VERSION` des Plugins um.
- Melde als Liste, was du ergänzt hast, dazu die Tatsache, dass nichts Bestehendes geändert wurde. Fehlte
  nichts, sag das und stempele nur neu.

Führe das Gespräch nicht und lege keinen Onboarding-Task an: dieser Repo wurde bereits onboardet.

## 4. Kontext erheben und füllen (wenige Fragen pro Schritt, schreiben nach Bestätigung)
- **Struktursprache** (`repo.md`): frage, ob Ordner- und Bereichsnamen der Chatsprache folgen, englisch oder
  etwas anderes sein sollen. Halte es in `repo.md` fest. Namen bleiben ASCII-kebab gemäß
  `callbell-conventions` (Deutsch umschrieben: ae, oe, ue, ss), welche Sprache auch gewählt wird.
- **Zweck** (`repo.md`): was der Repo erreicht, Rahmen, Nichtziele, die beteiligten Personen. Setze
  `project-type: code` oder `project-type: ops` im Frontmatter (die dauerhafte Sicht, die der Hook ausgibt)
  und vermerke den ops-Untertyp (Personal / Business / Mixed) aus Schritt 2.
- **Rollen und Stil** (`roles.md`): deine Rolle, die **Haltung des Agenten** (wie eigenständig: eigenständig
  und strukturiert / vorschlagen dann handeln / eng geführt) und **zwei getrennte Stilachsen**, nämlich
  Ausführlichkeit (knapp gegenüber ausführlich) und Ton (direkt gegenüber warm). Dazu alle **besonderen
  Regeln oder Wünsche** über die festen Regeln hinaus. Hinweis: das ist, wie der Agent *redet und
  entscheidet*, getrennt von der callbell-**Stufe** (muffin/cake/buffet), die regelt, wie faul das *Bauen*
  ist, und die mit `/callbell` gesetzt wird, nicht hier.
- **ops, Bereiche:** lege **keine** feste Auswahl vor. Frage, mit welchen Bereichen der Nutzer starten will,
  im Format `<bereich>-<thema>` (zum Beispiel `business-finance`), oder vorerst mit keinem (faul). Erfinde
  nichts, lege keine leeren Ordner an. Trage die genannten in das Bereichsverzeichnis
  `__callbell__/framework.md` ein.
- **code:** weise auf `__callbell__/docs/` als Ort für die Projektdokumentation hin; die Wurzel bleibt das
  Codeprojekt.
- **Begriffe:** wenn ein eigener Begriff des Nutzers auftaucht, biete an, ihn in `glossary.md` festzuhalten.

## 5. Den Ablagemodus wählen (nur code, erklären und auswählen)
Erkläre die zwei Wege und lass den Nutzer wählen (kein erzwungener Standard):
- **Full:** alles für agentische Arbeit (`.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `__callbell__/`)
  liegt **im** Repo. Aufbau `ordner/repo-from-template`. Einfach, alles an einem Ort.
- **Clean:** die Vorlage liegt **neben** der Codebasis und steuert sie von außen, damit die Codebasis sauber
  bleibt (der heutige Entwicklungsstandard). Aufbau `ordner/{repo-control-from-template/, repo-codebase, …}`.
- Aus Full kann später Clean werden, umgekehrt nicht ohne Weiteres.

## 6. Den Nutzer einweisen
Passe dich an den Modus aus Schritt 1 an. Im **Express-Modus** verdichte die ganze Einweisung auf eine Zeile
(die Trennung der Schichten: `__callbell__/` ist von callbell verwaltet, die Wurzel ist dein Inhalt) und geh
direkt zu Schritt 7. Im **geführten Modus** weise vollständig ein:
- **Rollen:** der Nutzer entscheidet und prüft, der Agent führt strukturiert und weitgehend eigenständig aus.
- **Sprache:** deine Interaktionssprache lebt in deiner persönlichen, maschinenlokalen Agent-Datei
  (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`), nicht im Repo; die Sprache von Inhalt und Struktur lebt in
  `repo.md`.
- **Regeln und Skills:** die Regeln gelten (Konventionen, Frontmatter, Zonen, Backlog, Gedächtnis,
  Datenschutz, Git, bei ops außerdem Struktur und weitere); `/callbell-help` zeigt die Skills.
- **Freigaben:** Struktur- und Schemaänderungen (und neue Bereiche in ops) sowie das Überführen von
  Entwürfen geschehen nur nach Freigabe; Routine im etablierten Rahmen erledigt der Agent selbst.
- **Struktur:** der Pfad sagt WO, das Frontmatter sagt WAS, `status` treibt die Reife. Die von callbell
  verwaltete Schicht ist `__callbell__/`; dein Inhalt sitzt in der Wurzel (Doku in `__callbell__/docs/` bei
  code, flache Bereichsordner `<bereich>-<thema>` bei ops). Die versionierte Arbeitsspur ist
  `__callbell__/backlog/`; die zwei flüchtigen Zonen sind `__callbell__/zone-import/` (Eingaben) und
  `__callbell__/zone-export/` (Ergebnisse).

## 7. Abschluss
- Wenn noch kein Git-Repo initialisiert ist, weise darauf hin und biete `git init` an (erst nach
  Bestätigung).
- Git-Identität (vor dem ersten Commit): wenn `git config user.name`/`user.email` nicht gesetzt ist, frage,
  welchen Namen und welche E-Mail die Commits tragen sollen, üblicherweise den GitHub-Benutzernamen des
  Nutzers und seine GitHub-No-Reply- oder Alias-Adresse, und biete an, das global zu setzen
  (`git config --global`, der freundliche Standard, wenn er noch keine hat) oder nur für diesen Repo. Nutze
  nie eine Identität aus dem Harness oder der Session, und erfinde nie eine (siehe `callbell-git`).
- **Nenne zum Abschluss den Ordner `__callbell__`:** sag klar, dass jetzt ein Ordner `__callbell__/` im
  Projekt liegt, die von callbell verwaltete Schicht für das Projektmanagement (das Backlog) und weitere
  Metadaten (Kontext, Gedächtnis, Vorlagen). Frage im **geführten Modus** danach aktiv, ob der Nutzer
  verstehen will, warum es ihn gibt und was er enthält; erkläre es nur bei einem Ja aus
  `__callbell__/README.md` (der einen Quelle, damit Skill und Ordner nie auseinanderlaufen). Im
  **Express-Modus** genügt dieses Nennen, ohne Angebot.
- Fasse zusammen, was eingerichtet wurde und was der Nutzer als Nächstes tun kann.
- Setze `task-initial-onboarding.md` auf `status: final`, verschiebe ihn nach `__callbell__/backlog/done/`
  und entferne seine Zeile aus `__callbell__/backlog/BACKLOG.md` (der Index listet nur aktive Arbeit).
