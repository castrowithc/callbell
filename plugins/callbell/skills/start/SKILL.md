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

Meldet das Skript ein fehlendes Gerüst oder eine fehlende `.gitignore`, **lege sie sofort an**. Ohne
Rückfrage, ohne Ankündigung, im selben Zug:

```
node <plugin-root>/scripts/callbell-doctor.js --apply
```

Das Skript kopiert nur, was **fehlt**. Es vergleicht nie Inhalte, überschreibt nie und hängt an die
`.gitignore` an, statt sie zu ersetzen — die Zeilen darin gehören dem Nutzer, und sie zu überschreiben
wäre Datenverlust.

Drei Befunde brauchen dagegen eine Entscheidung und werden **gefragt, nie getan**:
- **kein Git-Repo** — biete `git init` an.
- **Git-Identität fehlt** — frage, welchen Namen und welche E-Mail die Commits tragen sollen, üblich der
  GitHub-Name und die No-Reply-Adresse. Nimm nie eine Identität aus der Session und erfinde nie eine.
  Biete global (`--global`) oder nur für dieses Repo an.
- **kein Ruleset** — siehe Schritt 3.

Will der Nutzer eine Prüfung dauerhaft loswerden (typisch `git lfs`), trag ihren Schlüssel in
`~/.callbell/settings.json` unter `mute` ein: `{"mute": ["git lfs"]}`. Dort stehen **Entscheidungen des
Nutzers**, nie Befunde, und **nie ein Pfad** — ein Wert, der einen Pfad braucht, um zu gelten, gehört ins
Projekt, weil Pfade bei jedem Umbenennen, Klonen und Worktree brechen.

### Dann der Bericht

Zwei Zeilen, in der Sprache des Nutzers, ohne die Skriptzeilen zu zitieren. Erst was entstanden ist, dann
was fehlt, jeweils mit Namen statt in Fließtext:

```
✅ Angelegt: __callbell__/, .gitignore
❗ Fehlt: Git-Repo, Ruleset (AGENTS.md / CLAUDE.md)

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

**Erst die Zieldatei bestimmen, dann lesen, dann fragen.** Das Skript sagt, welche Rulesets es gibt; welche
davon die inhaltliche ist, entscheidest du:

- **Genau eine da** (`AGENTS.md` oder `CLAUDE.md`) — die ist es.
- **Beide da und eine importiert die andere** (eine Zeile, die nur aus `@datei.md` besteht) — dann gilt die
  importierte. Die importierende ist eine Weiche, kein Inhalt, und etwas dort anzuhängen schreibt am
  eigentlichen Ruleset vorbei.
- **Beide da, ohne Verbindung** — frag, welche gilt. Zwei Rulesets nebeneinander sind eine Aussage über das
  Repo, die du nicht raten kannst.
- **Keine da** — lege **beide** an: `AGENTS.md` aus `<plugin-root>/scaffold/agents-template.md`
  trägt den Inhalt, und die `CLAUDE.md` daneben besteht aus der einen Zeile `@AGENTS.md`. Codex liest nur
  `AGENTS.md`, Claude bevorzugt `CLAUDE.md`; die Weiche bedient damit beide Hosts, ohne den Inhalt zu
  doppeln. Gedoppelt wäre er sofort zweierlei, sobald einer der beiden gepflegt wird.

**Lies die Zieldatei, bevor du fragst, und frag nur nach dem, was fehlt.** Zweck und Rollen sind zwei
getrennte Befunde, nicht einer:

- **Beides steht schon da** — du bist fertig, frag nichts. Das ist der Normalfall ab dem zweiten Lauf.
- **Eins von beidem steht da** — frag nur nach dem anderen. Was beschrieben ist, wird nicht noch einmal
  aufgemacht; danach zu fragen sagt dem Nutzer, dass du seine Datei nicht gelesen hast.
- **Nichts davon steht da** — beide Fragen, siehe unten.

Ergänzt wird immer durch **Anhängen, nie durch Ersetzen**. Die Datei gehört dem Nutzer, dieselbe Regel wie
bei der `.gitignore`. Geschrieben wird erst nach Bestätigung.

Das Gespräch ist kurz, höchstens zwei Fragen, und die auf einmal. **Stelle sie als Text, nie über ein
Auswahlwerkzeug.** Beide Antworten sind frei, und vorgegebene Optionen legten dem Nutzer sein eigenes
Projekt in den Mund.

1. **Zweck und Rahmen** — wofür der Repo da ist, was bewusst nicht dazugehört, und ob er privat ist
   (der Agent nimmt sonst öffentlich an).
2. **Rollen und Stil** — wer der Nutzer ist, wie eigenständig der Agent handeln soll, und die zwei
   getrennten Achsen Ausführlichkeit (knapp oder ausführlich) und Ton (direkt oder warm).

Die **Interaktionssprache** wird hier nicht gefragt: sie gilt pro Nutzer über alle Projekte und lebt in
seiner maschinenlokalen Agent-Datei, worum sich `callbell-language` kümmert.

## 4. Abschluss

Ein bis zwei Sätze, nicht mehr. Nenne, dass `__callbell__/` jetzt da ist und die von callbell verwaltete
Schicht trägt (Backlog, Gedächtnis, Zonen, Vorlagen); der Ordner erklärt sich in seiner `README.md`
selbst, wenn der Nutzer nachfragt. Auf `callbell:help` hast du in Schritt 2 schon gezeigt, also nicht
noch einmal. Erkläre den Rest nicht ungefragt, wer mehr wissen will, fragt.

War nichts zu tun, ist der Abschluss die eine Zeile aus Schritt 1 und du gehst zur Arbeit über.
