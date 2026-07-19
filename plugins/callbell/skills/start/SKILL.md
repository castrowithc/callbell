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

**Er läuft jedes Mal.** Eine Abhängigkeit kann zwischen zwei Sitzungen verschwinden — ein neuer Rechner,
eine Deinstallation, ein geänderter PATH. Deshalb wird bei jedem Lauf geprüft und nie zwischengespeichert.

**Die eine Regel, an der dieser Skill hängt: in einem eingerichteten Repo sagst du eine Zeile.** Nenne
nie, was bereits da ist. Ein Lauf ohne Befund ist eine Zeile und der Übergang zur eigentlichen Arbeit,
sonst ruft ihn niemand ein viertes Mal auf — und dann ist er kein Einstieg mehr.

## 1. Prüfen (ein Aufruf)

```
node ${CLAUDE_PLUGIN_ROOT}/scripts/callbell-doctor.js [--lens ops|code]
```

Setze `--lens`, sobald du den Typ kennst: `ops` für ein textgetragenes Repo, `code` für eine Codebasis.
Der Session-Kontext gibt ihn als `PROJECT TYPE` aus; steht dort `unknown`, lass das Argument weg und
hol es nach, sobald der Typ feststeht.

**Schlägt der Aufruf selbst fehl, ist das die Antwort: Node fehlt.** Das ist der einzige Befund, der die
Arbeit anhält statt sie zu begleiten — der Kontext-Hook ist selbst Node, also laden ohne ihn weder
Regeln noch Kontext noch Backlog, und es bleiben nur die von Hand aufgerufenen Skills. Sag das klar,
nenne [nodejs.org](https://nodejs.org), und dass Windows nach der Installation ein neues Terminal
braucht, damit der PATH greift. Mach ohne Node nicht weiter.

Das Skript meldet `MISSING`, `NOTES`, `CREATED` — und `OK: nothing missing.`, wenn nichts anliegt. Es
berichtet **nur Fehlendes**; was da ist, taucht nicht auf.

## 2. Berichten und ergänzen

Fasse `MISSING` in der Sprache des Nutzers zusammen, kurz, ohne die Skriptzeilen zu zitieren. `NOTES`
erwähnst du nur, wenn sie für den nächsten Schritt zählen.

Was ohne Rückfrage ergänzt werden darf, ist das Gerüst und die `.gitignore`:

```
node ${CLAUDE_PLUGIN_ROOT}/scripts/callbell-doctor.js --apply [--lens ops|code]
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

## 3. Zweck und Rollen (einmalig, im Ruleset)

Der Agent braucht zwei Dinge über das Gerüst hinaus: **was dieses Repo ist** und **mit wem er arbeitet**.
Beides lebt in der `AGENTS.md` des Nutzers, nicht in einer callbell-eigenen Datei.

- **Es gibt eine `AGENTS.md` oder `CLAUDE.md` und sie trägt beides schon** — dann bist du fertig. Frag
  nichts. Das ist der Normalfall ab dem zweiten Lauf.
- **Es gibt eine, aber ohne diese Angaben** — führe das Gespräch unten und **hänge an, ersetze nie**.
  Diese Datei gehört dem Nutzer, dieselbe Regel wie bei der `.gitignore`.
- **Es gibt keine** — lege sie aus `${CLAUDE_PLUGIN_ROOT}/scaffold/agents-template.md` an und fülle sie
  im Gespräch. Schreibe erst nach Bestätigung.

Das Gespräch ist kurz, zwei Fragen auf einmal, nicht mehr:
1. **Zweck und Rahmen** — wofür der Repo da ist, was bewusst nicht dazugehört, und ob er privat ist
   (der Agent nimmt sonst öffentlich an).
2. **Rollen und Stil** — wer der Nutzer ist, wie eigenständig der Agent handeln soll, und die zwei
   getrennten Achsen Ausführlichkeit (knapp oder ausführlich) und Ton (direkt oder warm).

Die **Interaktionssprache** wird hier nicht gefragt: sie gilt pro Nutzer über alle Projekte und lebt in
seiner maschinenlokalen Agent-Datei, worum sich `callbell-language` kümmert.

## 4. Abschluss

Ein bis zwei Sätze, nicht mehr. Nenne, dass `__callbell__/` jetzt da ist und die von callbell verwaltete
Schicht trägt (Backlog, Gedächtnis, Zonen, Vorlagen); der Ordner erklärt sich in seiner `README.md`
selbst, wenn der Nutzer nachfragt. Verweise auf `/callbell:help` für die Skills. Erkläre den Rest nicht
ungefragt — wer mehr wissen will, fragt.

War nichts zu tun, ist der Abschluss die eine Zeile aus Schritt 1 und du gehst zur Arbeit über.
