---
name: callbell-worktree
description: >
  Richtet einen Git-Worktree für parallele Arbeit ein: ein neuer Branch in einem eigenen Ordner, dieselbe
  Git-Datenbank. Auf Anfrage oder nach einem Vorschlag; räumt nach dem Merge wieder auf.
type: skill
edit: locked
argument-hint: "[branch-name]"
---

# /callbell-worktree

Richtet über `git worktree` einen zweiten Arbeitsstrang ein, ohne den offenen Stand im Hauptordner
wegzuräumen. Für mehrere Sessions oder Themen gleichzeitig.

## Wann
- Auf direkte Anfrage des Nutzers.
- Oder wenn parallele oder kollidierende Arbeit aufkommt (ein neuer Strang, während ein Branch offen ist):
  schlage einen Worktree vor, erkläre ihn in ein bis zwei Sätzen und lege ihn erst nach Freigabe an (ein
  neues Strukturelement, siehe `callbell-governance`).
- Schlage für einen parallelen Strang außerdem ein eigenes Backlog-Projekt
  `__callbell__/backlog/<projekt>/` vor: es isoliert die Backlog-Änderungen dieses Strangs, damit die
  Worktrees nicht auf gemeinsamen Dateien kollidieren (siehe `callbell-backlog`).

## Einrichten
1. Zustand prüfen (`git status`), offene Änderungen im Hauptordner sichern (committen oder stashen).
2. Branch-Namen festlegen (aus dem Argument oder mit einer kurzen Rückfrage), sprechend und in kebab-case.
3. Den Worktree als Geschwisterordner neben dem Repo anlegen, benannt `<repo>-wt-<zweck>`:
   `git worktree add ../<repo>-wt-<zweck> -b <branch>`.
4. Dem Nutzer Ort und Branch nennen und wie er dorthin wechselt.

**Der Infix `-wt-` trägt Last, er ist keine Verzierung.** Ein Worktree entsteht oft innerhalb des
Arbeitsbaums eines anderen Repos (ein Repo verschachtelt in einem Repo, ein Steuerungs-Repo, das eine
Codebasis führt), und dieses äußere Repo muss ihn ignorieren. `*-wt-*/` fängt jeden Worktree in jeder Tiefe
und sonst nichts. Sie stattdessen `<repo>-<zweck>` zu nennen, würde das äußere Repo zwingen, ein ganzes
Namenspräfix zu ignorieren, was dann jeden künftigen Ordner verschluckt, der zufällig genauso anfängt, in
einem callbell-Repo eingeschlossen die Projektordner `backlog/<repo>-*`.

Halte den Zweck im Ordnernamen fest und nicht eine wiederverwendbare Platznummer: der Name ist das, was
einen nicht gemergten Worktree auffällig macht, und das, was klarmacht, dass der Ordner weg sein sollte,
sobald der Strang gemergt ist.

## Aufräumen
- Sobald der Strang gemergt oder verworfen ist: `git worktree remove <ort>` und den Branch aufräumen. Keine
  verwaisten Worktrees hinterlassen.
- `git worktree list` zeigt, was offen ist.

## Grenzen
- Nie denselben Branch gleichzeitig in zwei Worktrees auschecken (Git verbietet das).
- Der Worktree teilt die Git-Datenbank, aber nicht den lokalen Arbeitszustand: Umgebungsdateien (`.env`,
  lokale Konfigurationen) bei Bedarf erneut bereitstellen.
