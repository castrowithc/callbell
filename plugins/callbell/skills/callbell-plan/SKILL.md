---
name: callbell-plan
description: >
  Aus einer Idee einen Plan machen: sie im Gespräch klären, dann in sich geschlossene Arbeitspakete (Tasks)
  zuschneiden, mit Warum, Rahmen, Vorgehen und Definition of Done. Wird vom Nutzer mit /callbell-plan
  gestartet, nie von allein: nur der Nutzer weiß, ob er das gebaut haben will oder noch darüber nachdenkt,
  und von außen sehen diese beiden gleich aus.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-plan

Die Planungssitzung: eine Idee geht hinein, ein Projekt und seine Arbeitspakete kommen heraus. Danach ist
das erledigt, und die Arbeit wächst von dort im Gespräch weiter.

Der Nutzer hat das bewusst gestartet, die Absicht zu bauen steht also fest: rolle nicht neu auf, ob er das
will. Offen ist noch, *was* er will, und das ist die Arbeit unten.

Planung ist ein **Gespräch, kein Formular**. Reiche dem Nutzer nie eine Vorlage zum Ausfüllen. Die
Checkliste unten gehört dir: prüfe daran, was er dir gegeben hat, und frage nach dem, was fehlt.

## Frage, diese ganze Phase über

Fragen sind der Sinn dieser Phase, nicht ihr Versagen. Rate dich nicht zu einem Plan, der sich gut liest
und nichts bedeutet.

- **Nenne deine Annahmen**, statt sie zu vergraben. Hat eine Anforderung zwei Lesarten, stelle beide zur
  Wahl und lass den Nutzer entscheiden; wähle nicht stillschweigend eine.
- **Widersprich** bei Unklarem oder Widersprüchlichem. Ein Plan auf einem Missverständnis kostet mehr, als
  die Frage gekostet hätte.
- **Nur kosmetische Entscheidungen sind deine** während der Planung (Formulierung, Benennung, Reihenfolge,
  die nichts ändert).

## 1. Kläre, was für eine Art Idee das ist

Tu das zuerst, denn es entscheidet, wie du arbeitest:

- **Im Kopf des Nutzers ausgereift:** deine Aufgabe ist **herausholen**, nicht miterfinden. Frage, spiegle
  zurück und halte deine eigenen Einfälle heraus, solange sie nicht erbeten sind. Ergänzen treibt das
  Ergebnis hier weg von dem, was er wirklich will.
- **Halbgar:** denk wirklich mit. Biete Optionen an, benenne Abwägungen, bring eine Empfehlung.
- **Von einem anderen Agenten erzeugt** (ein Plan, eine Spezifikation, eine Analyse, die dir übergeben
  wurde): sei hier am skeptischsten. Das ist geprüfte Plausibilität, nicht geprüfte Absicht, und es liest
  sich fertiger, als es ist. Geh es mit dem Nutzer durch, statt es zu übernehmen.

## 2. Kläre diese Achsen, bevor du zuschneidest

Deine Checkliste, nicht die des Nutzers. Frage nach dem, was seine Eingabe nicht schon abdeckt:

- **Ergebnis:** was existiert danach, das jetzt nicht existiert?
- **Warum:** wozu ist es da? Ohne das kann kein Paket etwas eigenständig entscheiden.
- **Nicht im Rahmen:** was gehört ausdrücklich nicht dazu? Die Grenze ist die nützliche Hälfte.
- **Was schon da ist:** was wird wiederverwendet statt neu gebaut? Sieh in den Repo, nimm keine grüne Wiese
  an.
- **Prüfung:** wie wird jedes Ergebnis geprüft? Etwas Beobachtbares, nicht "sieht richtig aus".
- **Risiko:** was ist unklar, was könnte den Plan hinfällig machen?

## 3. In Arbeitspakete schneiden

Ein **Paket ist eine Task-Datei** (`task-<slug>.md`, Vorlage in `__callbell__/templates/`), und sie trägt
Warum, Rahmen, Vorgehen und Definition of Done: genug, dass ohne weitere Rückfragen daran gearbeitet werden
kann. Das ist keine Liste von Zwischenständen ("Schritt 3 von 7"); jedes Paket sagt "hier ist alles, was du
brauchst".

- **Schneide es auf eine Session zu**, bevor der Kontext ausgeht. Das ist die Spanne, in der ein Agent
  zusammenhängend plant und arbeitet. **Kannst du die Größe nicht schätzen, ist die Arbeit nicht
  verstanden: zerlege sie.**
- **Ein Paket nennt nie ein anderes Paket.** Reihenfolge und Abhängigkeit gehen ausschließlich in die
  Aufstellung (`BACKLOG.md` oder die `index.md` des Projekts). Ein späteres Paket liest kein früheres: es
  braucht dessen *Ergebnis*, und das liegt im Repo. Einen Dateinamen in einen Task-Rumpf zu schreiben *ist*
  die Anweisung, ihn zu lesen, also schreib ihn nicht.
- **Mehrere zusammengehörige Pakete** sind ein Grund, einen Projektordner
  `__callbell__/backlog/<projekt>/` vorzuschlagen. Schlage ihn vor, erkläre ihn in einem Satz, und lege ihn
  **erst nach Freigabe** an. Gruppiere innerhalb eines großen Projekts in der
  `index.md` mit Überschriften (Backend, Frontend). Eine Überschrift ist Gruppierung genug; sie wird nie
  eine Dateiebene.
- Neue Pakete starten mit `status: draft`. **Im Entwurf sterben die Annahmen:** forme sie mit dem Nutzer,
  bis sie tragen, dann gehen sie auf `active`.

## Fertig

Wenn die Pakete stehen und keine Fragen offen sind, ist diese Sitzung vorbei: sag das und hör auf zu
planen. Von hier an wächst die Arbeit im Gespräch, und ein aktives Paket neu zuzuschneiden ist normal (sag
es, wenn du es tust, nie stillschweigend).

Beachte, dass ein Skill sich nicht selbst abschalten kann: dieser Text bleibt im Kontext, bis er
wegkomprimiert wird. Der Ausstieg betrifft das Verhalten, nicht das Freiwerden von Platz.
