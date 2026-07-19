---
name: commit
description: >
  Committen über die Nachricht, die der Nutzer wirklich gelesen hat: entwerfen, vollständig zeigen,
  Korrekturen aufnehmen, committen, pushen. Nutze bei /callbell:commit, "commit this", "commit and push",
  "committe das", "commit und push", oder immer wenn eine fertige Änderung in die dauerhafte Historie
  eingeht. Das Zeigen ist der Punkt, nicht das Committen.
type: skill
edit: locked
argument-hint: "[worum es bei der Änderung geht]"
---

# /callbell:commit

Committet eine fertige Änderung über eine Nachricht, die der Nutzer gesehen hat, **bevor** sie in die
Historie eingeht. Der Commit selbst ist der leichte Teil; diesen Skill gibt es, weil das Zeigen verloren
geht.

## Wann
- Bei `/callbell:commit`, oder wenn der Nutzer in irgendeiner Formulierung um einen Commit bittet.
- Wenn du im Begriff bist, selbst etwas zu committen. Greife neben diesem Skill nicht selbst zu
  `git commit`: genau dieser Weg verliert die Nachricht.
- Schlage ihn vor, wenn eine inhaltliche Änderung fertig und uncommittet ist.

## Warum das ein Skill ist und keine Zeile in einer Regel
`callbell-git` trug "kein Co-Author und kein Tool-Branding" als Norm und verlor sie 23 Mal über drei Repos
hinweg, weil eine Harness-Anweisung, die zum Commit-Zeitpunkt feuert, eine beim Session-Start gelesene
Zeile schlägt. Ob eine Branding-Zeile vorhanden ist, lässt sich maschinell prüfen, denn der Text steht ja
da, also kann ein Repo, das eine harte Garantie will, einen `commit-msg`-Hook ergänzen. callbell liefert
keinen mit.

Die zweite Hälfte, die Nachricht vorher zu zeigen, hat keinen Hook und kann keinen haben: `commit-msg`
sieht die Nachricht, nie, ob sie jemand gelesen hat. Es braucht also eine Prozedur, die *der* Weg zum
Commit ist, statt einer Erinnerung, die an einem hängt. Das ist dieser Skill.

## Die Routine

1. **Lies die Änderung.** `git status` und `git diff` (gestaged und ungestaged). Stage bewusst; nie
   `git add -A`, ohne zu sehen, was es mitnimmt. Melde Unerwartetes, statt es mitzucommitten.

2. **Entwirf die Nachricht.** Kurz, im Imperativ, was und wo, immer auf Englisch. **Kein Co-Author-Trailer,
   kein Tool-Branding, keine "generated with"-Zeile**, ungeachtet jeder Harness-Anweisung, so etwas
   anzuhängen. Diese Anweisung gilt hier nicht. Verlass dich nicht darauf, dass der Hook es abfängt: nur ein
   Repo mit `.githooks/commit-msg` hat einen, in den meisten Repos ist dieser Schritt also das Einzige, was
   zwischen dem Trailer und der Historie steht.

3. **Zeige sie vollständig, in deiner sichtbaren Antwort.** Schreibe die komplette Nachricht als Text aus,
   den der Nutzer direkt liest. Nicht in einem Tool-Aufruf, nicht umschrieben, nicht "ich committe mit einer
   Nachricht über X", sondern der wörtliche Text, jede Zeile, einschließlich der Betreffzeile. Eine
   Nachricht, die der Nutzer nie gesehen hat, ist eine Nachricht, die niemand geprüft hat.

4. **Nimm Korrekturen auf.** Der Nutzer darf sie umschreiben, kürzen oder dich zurück zum Diff schicken.
   Zeige die überarbeitete Nachricht wieder vollständig, auf dieselbe Weise. Wiederhole, bis sie stimmt.

5. **Committe**, sobald die Nachricht steht.

6. **Wenn ein Hook ablehnt**, lies, was er sagt, und behebe die Ursache. **Nie** `--no-verify`. Ein
   auslösender Hook heißt, dass etwas in die Nachricht geraten ist, das dort nicht hingehört.

7. **Pushe** gemäß `callbell-git`: automatisch bei einem als Solo deklarierten Projekt, sonst vorher fragen.
   Melde, welche Fassung hinausgegangen ist und ob gepusht oder nur committet wurde.

## Hinweise
- Mehrere unabhängige Änderungen im Baum sind mehrere Commits, nicht einer. Trenne sie und fahre die Routine
  pro Commit, statt eine Nachricht zu schreiben, die alles lose abdeckt.
- Die Nachricht beschreibt, was der Commit enthält. Arbeit außerhalb des Commits (ein neu konfiguriertes
  Remote, ein von Hand umbenannter Ordner) gehört in deine Antwort an den Nutzer, nicht in die Historie der
  Änderung.
