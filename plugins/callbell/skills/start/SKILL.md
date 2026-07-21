---
name: start
description: >
  Der Einstieg in callbell und die erste Station in einem Ordner: prüft Abhängigkeiten und Gerüst,
  ergänzt was fehlt, und klärt einmalig Zweck und Rollen. Läuft jedes Mal, meldet nur Fehlendes und
  hält sich in einem eingerichteten Repo auf eine Zeile. Auslöser: /callbell:start, "einrichten",
  "loslegen", "was fehlt hier", oder ein Ordner, in dem callbell noch nie lief.
type: skill
edit: locked
---

# /callbell:start

Der Weg hinein. Kein Diagnosewerkzeug für den Fehlerfall, sondern die Station, an der eine Sitzung in
einem Ordner beginnt: einmal prüfen, das Fehlende ergänzen, dann arbeiten.

**Der Hook meldet den Zustand jede Sitzung von selbst — dieser Skill ist die Handlung, nicht die Meldung.**
Du rufst ihn, wenn du in einem Ordner ankommst oder wenn etwas fehlt, das nur eine Handlung schließt: ein
Gerüst anlegen, git init, Zweck und Rollen klären. Eine Abhängigkeit kann zwischen zwei Sitzungen
verschwinden — neuer Rechner, Deinstallation, geänderter PATH —, deshalb prüft er bei jedem Lauf neu und
speichert nichts zwischen.

**Die eine Regel, an der dieser Skill hängt: in einem eingerichteten Repo sagst du eine Zeile.** Nenne
nie, was bereits da ist. Ein Lauf ohne Befund ist eine Zeile und der Übergang zur eigentlichen Arbeit,
sonst ruft ihn niemand ein viertes Mal auf — und dann ist er kein Einstieg mehr.

**Ein Sprach-Argument gilt nur diesem Lauf.** Wird der Skill mit einer Sprache aufgerufen (etwa
`/callbell:start deutsch`), führe Prüfung, Rückfragen und Bericht in dieser Sprache. Ein bloßer Aufruf trägt
kein Sprachsignal, anders als eine getippte Nachricht, und dieses Argument ersetzt es. Es gilt allein diesem
Lauf: schreib die Sprache nirgends fest, weder ins Ruleset noch sonstwohin. Wie der Nutzer sie dauerhaft
hält, ist seine Sache und steht in der README, siehe Schritt 3.

`<plugin-root>` unten ist der Ordner, aus dem dieser Skill geladen wurde: der Sitzungskontext nennt ihn
als `CALLBELL PLUGIN ROOT`, sonst liegt er zwei Ebenen über dieser `SKILL.md`. Setz dort nie einen
abgetippten Pfad ein, er trägt die Versionsnummer und ist nach dem nächsten Update falsch.

**Bevor du prüfst, sichere die Normen.** Hat der Sitzungskontext dich schon auf die Kern-Normen gezeigt
(`Callbell norms. Read these files NOW`), ist nichts zu tun — der Hook hat sie geliefert. Andernfalls, und
das ist die erste Codex-Sitzung nach einem Update, in der der Trust-Gate den Hook noch schluckt, lies jetzt
`<plugin-root>/rules/core/*.md`; ist ein `__callbell__/`-Gerüst da oder legst du es in Schritt 2 gerade an,
dann auch `<plugin-root>/rules/scaffold/*.md`. Dieser Skill handelt in genau deren Bereich, also gelten sie
ihm ohne Ausnahme.

## 1. Prüfen (ein Aufruf)

```
node <plugin-root>/scripts/callbell-doctor.js
```

**Schlägt der Aufruf selbst fehl, ist das die Antwort: Node fehlt.** Das ist der einzige Befund, der die
Arbeit anhält statt sie zu begleiten — der Kontext-Hook ist selbst Node, also laden ohne ihn weder
Regeln noch Kontext noch Backlog, und es bleiben nur die von Hand aufgerufenen Skills. Sag das klar,
nenne [nodejs.org](https://nodejs.org), und dass Windows nach der Installation ein neues Terminal
braucht, damit der PATH greift. Mach ohne Node nicht weiter.

Das Skript meldet `MISSING`, `NOTES`, `CREATED` — und `OK: nothing missing.`, wenn nichts anliegt. Es
berichtet **nur Fehlendes**; was da ist, taucht nicht auf.

## 2. Ergänzen, dann berichten

**In dieser Reihenfolge.** Erst tun, dann sagen: der Bericht nennt, was entstanden ist, und kann das nur,
wenn es vorher entstanden ist. Wer hier zuerst berichtet, berichtet über einen Ordner, den er gleich
selbst hätte anlegen sollen, und hört dann auf.

Meldet das Skript ein fehlendes Gerüst, eine fehlende `.gitignore` oder ein fehlendes Ruleset, **lege alles
sofort an**. Ohne Rückfrage, ohne Ankündigung, im selben Zug:

```
node <plugin-root>/scripts/callbell-doctor.js --apply
```

Das Skript kopiert nur, was **fehlt**. Es vergleicht nie Inhalte, überschreibt nie und hängt an die
`.gitignore` an, statt sie zu ersetzen — die Zeilen darin gehören dem Nutzer, und sie zu überschreiben
wäre Datenverlust. Fehlen **beide** Ruleset-Dateien, legt `--apply` sie mit an: `AGENTS.md` aus der Vorlage
trägt den Inhalt, `CLAUDE.md` ist die eine Zeile `@AGENTS.md`. Liegt schon eines von beiden, rührt es keins
an — das gehört dem Nutzer.

Zwei Befunde brauchen dagegen eine Entscheidung und werden **gefragt, nie getan**:
- **kein Git-Repo** — biete `git init` an.
- **Git-Identität fehlt** — frage, welchen Namen und welche E-Mail die Commits tragen sollen, üblich der
  GitHub-Name und die No-Reply-Adresse. Nimm nie eine Identität aus der Session und erfinde nie eine.
  Biete global (`--global`) oder nur für dieses Repo an.

Das Ruleset ist damit als leeres Gerüst da; **gefragt** wird nur sein *Inhalt* — Zweck und Rollen —, und der
wird nachgetragen, siehe Schritt 3. Bleibt er zunächst aus, ist das kein Grund, etwas nicht anzulegen.

Will der Nutzer eine Prüfung dauerhaft loswerden (typisch `git lfs`), trag ihren Schlüssel in
`~/.callbell/settings.json` unter `mute` ein: `{"mute": ["git lfs"]}`. Dort stehen **Entscheidungen des
Nutzers**, nie Befunde, und **nie ein Pfad** — ein Wert, der einen Pfad braucht, um zu gelten, gehört ins
Projekt, weil Pfade bei jedem Umbenennen, Klonen und Worktree brechen.

### Dann der Bericht

Zwei Zeilen, in der Sprache des Nutzers, ohne die Skriptzeilen zu zitieren. Erst was entstanden ist, dann
was fehlt, jeweils mit Namen statt in Fließtext:

```
✅ Angelegt: __callbell__/, .gitignore, AGENTS.md, CLAUDE.md
❗ Fehlt: Git-Repo

Mehr dazu: callbell:help
```

Den Skillnamen **ohne Präfix** nennen. Der Schrägstrich ist die Schreibweise eines einzelnen Hosts, und
andere rufen denselben Skill anders auf.

Eine Zeile entfällt, wenn sie leer wäre. `NOTES` erwähnst du nur, wenn sie für den nächsten Schritt zählen.

**Was bereits da war, steht nirgends.** Der Nutzer will wissen, was passiert ist und was noch aussteht,
nicht was schon vorher stimmte. In einem eingerichteten Repo bleibt es deshalb bei der einen Zeile aus
Schritt 1, und ein `👍` davor genügt.

## 3. Zweck und Rollen (einmalig, im Ruleset)

Der Agent braucht zwei Dinge über das Gerüst hinaus: **was dieses Repo ist** und **mit wem er arbeitet**.
Beides lebt im Ruleset des Nutzers (`AGENTS.md` / `CLAUDE.md`), nicht in einer callbell-eigenen Datei.

**Hier wird nur Inhalt nachgetragen, keine Datei mehr angelegt** — die liegen seit Schritt 2. Bestimme die
inhaltliche Datei, lies sie, frag nur nach dem, was fehlt. Das Skript sagt, welche Rulesets es gibt:

- **Genau eine da** (`AGENTS.md` oder `CLAUDE.md`) — die ist es.
- **Beide da und eine importiert die andere** (eine Zeile, die nur aus `@datei.md` besteht) — dann gilt die
  importierte. Die importierende ist eine Weiche, kein Inhalt, und etwas dort anzuhängen schreibt am
  eigentlichen Ruleset vorbei. Das ist auch der Fall eines frisch angelegten Repos: Schritt 2 hat
  `CLAUDE.md` als `@AGENTS.md`-Weiche geschrieben, also ist `AGENTS.md` die inhaltliche.
- **Beide da, ohne Verbindung** — frag, welche gilt. Zwei Rulesets nebeneinander sind eine Aussage über das
  Repo, die du nicht raten kannst.

**Lies die Zieldatei, bevor du fragst, und frag nur nach dem, was fehlt.** Zweck und Rollen sind zwei
getrennte Befunde, nicht einer:

- **Beides steht schon da** — du bist fertig, frag nichts. Das ist der Normalfall ab dem zweiten Lauf.
- **Eins von beidem steht da** — frag nur nach dem anderen. Was beschrieben ist, wird nicht noch einmal
  aufgemacht; danach zu fragen sagt dem Nutzer, dass du seine Datei nicht gelesen hast.
- **Nichts davon steht da** — beide Fragen, siehe unten.

Ergänzt wird immer durch **Anhängen, nie durch Ersetzen**. Die Datei gehört dem Nutzer, dieselbe Regel wie
bei der `.gitignore`. Geschrieben wird erst nach Bestätigung. **Gibt der Nutzer den Inhalt noch nicht** („nur
ein Testprojekt, Infos folgen"), ist das kein Grund zu drängen: die Dateien liegen als Vorlage, du trägst
nach, wenn es kommt.

Das Gespräch ist kurz, höchstens zwei Fragen, und die auf einmal. **Stelle sie als Text, nie über ein
Auswahlwerkzeug.** Beide Antworten sind frei, und vorgegebene Optionen legten dem Nutzer sein eigenes
Projekt in den Mund.

1. **Zweck und Rahmen** — wofür der Repo da ist, was bewusst nicht dazugehört, und ob er privat ist
   (der Agent nimmt sonst öffentlich an).
2. **Rollen und Stil** — wer der Nutzer ist, wie eigenständig der Agent handeln soll, und die zwei
   getrennten Achsen Ausführlichkeit (knapp oder ausführlich) und Ton (direkt oder warm).

Die **Interaktionssprache** wird hier nicht gefragt und von callbell nicht verwaltet: sie gilt pro Nutzer
über alle Projekte und lebt in seiner maschinenlokalen Agent-Datei (`~/.claude/CLAUDE.md`,
`~/.codex/AGENTS.md`). Wie man sie dort setzt, steht in der README.

## 4. Abschluss

Ein bis zwei Sätze, nicht mehr. Nenne, dass `__callbell__/` jetzt da ist und die von callbell verwaltete
Schicht trägt (Backlog, Gedächtnis, Zonen, Vorlagen); der Ordner erklärt sich in seiner `README.md`
selbst, wenn der Nutzer nachfragt. Auf `callbell:help` hast du in Schritt 2 schon gezeigt, also nicht
noch einmal. Erkläre den Rest nicht ungefragt, wer mehr wissen will, fragt.

War nichts zu tun, ist der Abschluss die eine Zeile aus Schritt 1 und du gehst zur Arbeit über.
