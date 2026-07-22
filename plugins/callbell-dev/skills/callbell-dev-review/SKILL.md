---
name: callbell-dev-review
description: >
  Ein bewusster Over-Engineering-Durchgang, den du auf einem Diff oder einem
  ganzen Repo laufen lässt — kein automatischer Check und kein Correctness- oder
  Security-Review. Findet, was zu löschen ist: nachgebaute Standardbibliothek,
  unnötige Abhängigkeiten, spekulative Abstraktionen, tote Flexibilität, eine
  Zeile pro Fund (Stelle, was raus muss, was es ersetzt). Starte ihn durch
  Tippen von /callbell-dev-review, häng "repo" an für einen Durchgang über den
  ganzen Baum. Das Modell startet ihn nicht von selbst; der Nutzer bestimmt den
  Zeitpunkt.
type: skill
edit: locked
disable-model-invocation: true
---

Prüfe Code auf unnötige Komplexität. Eine Zeile pro Fund: Stelle, was raus muss,
was es ersetzt. Das beste Ergebnis ist: es wird kürzer.

## Umfang

**Ein Diff standardmäßig.** Das ist der Normalfall und der billigste: was sich
gerade geändert hat, geprüft bevor es landet.

**Der ganze Baum, wenn verlangt** — "review das Repo", "audit diese Codebasis",
"was kann ich hier löschen" oder `/callbell-dev-review repo`. Gleiche Linse,
gleiche Tags, gleicher Output; nur das Lesen ändert sich. Scanne den Baum statt
des Diffs und sortiere die Funde nach größtem Schnitt zuerst, denn ein
Repo-Durchgang hat keine natürliche Reihenfolge wie ein Diff.

Ist der Umfang aus dem Aufruf nicht offensichtlich und ein Diff existiert, nimm
den Diff und sag es in einer Zeile. Frag nicht.

## Format

`L<Zeile>: <tag> <was>. <Ersatz>.`, oder `<Datei>:L<Zeile>: ...` bei
Diffs über mehrere Dateien.

Tags:

- `delete:` toter Code, ungenutzte Flexibilität, spekulatives Feature. Ersatz: nichts.
- `stdlib:` handgebautes Ding, das die Standardbibliothek mitliefert. Nenn die Funktion.
- `native:` Abhängigkeit oder Code, der tut, was die Plattform schon tut. Nenn das Feature.
- `yagni:` Abstraktion mit einer Implementierung, Config, die niemand setzt, Schicht mit einem Aufrufer.
- `shrink:` gleiche Logik, weniger Zeilen. Zeig die kürzere Form.

## Beispiele

❌ "Diese EmailValidator-Klasse ist vielleicht komplexer als nötig, hast du
überlegt, ob all diese Validierungsregeln in diesem Stadium gebraucht werden?"

✅ `L12-38: stdlib: 27-Zeilen-Validator-Klasse. "@" in E-Mail, 1 Zeile, echte Validierung ist die Bestätigungsmail.`

✅ `L4: native: moment.js importiert für einen einzigen Format-Aufruf. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository mit einer Implementierung. Inline es, bis eine zweite existiert.`

✅ `L52-71: delete: Retry-Wrapper um einen idempotenten lokalen Aufruf. Ersatz: nichts.`

✅ `L30-44: shrink: manuelle Schleife baut ein dict. dict(zip(keys, values)), 1 Zeile.`

## Jagd (Repo-Durchgang)

Wo man schaut, wenn kein Diff zum Folgen da ist: deps, die die Stdlib oder
Plattform schon mitliefert, Interfaces mit einer einzigen Implementierung,
Factories mit einem Produkt, Wrapper, die nur delegieren, Dateien, die genau
eine Sache exportieren, tote Flags und Config, handgebaute Stdlib.

## Bewertung

Schließ mit der einzigen Kennzahl, die zählt: `net: -<N> Zeilen möglich.` Bei
einem Repo-Durchgang häng die Abhängigkeiten an: `net: -<N> Zeilen, -<M> deps
möglich.`

Ist nichts zu schneiden, sag `Schon schlank. Ship.` und stopp.

## Grenzen

Umfang: ausschließlich Over-Engineering und Komplexität. Correctness-Bugs,
Sicherheitslücken und Performance sind ausdrücklich außerhalb des Umfangs. Leite
sie an einen normalen Review-Durchgang, nicht an diesen. Ein einzelner
Smoke-Test oder ein `assert`-basierter Selbstcheck ist das Minimum, das dieser
Pack verlangt, kein Bloat — markier ihn nie zum Löschen. Wendet die Fixes nicht
an, listet sie nur.
"stop" oder "normaler Modus": zurück zum ausführlichen Review-Stil.
