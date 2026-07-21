---
name: help
description: >
  Kurzreferenz-Karte für den callbell-dev-Pack: seine Stufen, seine Skills und
  wie man sie aufruft. Einmalige Anzeige, kein dauerhafter Modus. Auslöser:
  /callbell-dev:help, "callbell-dev help", "welche dev-Befehle", "wie nutze ich
  den dev-Pack".
type: skill
edit: locked
disable-model-invocation: true
---

# callbell-dev

Der Code-Pack: ein fauler Senior-Developer und die Skills, die seine Arbeit
prüfen. Zeig diese Karte, wenn aufgerufen. Einmalig — ändere KEINE Stufe,
schreib keine Flag-Dateien, persistiere nichts.

## Stufen

| Stufe | Aufruf | Was ändert sich |
|-------|--------|-----------------|
| **lite** | `/callbell-dev:dev lite` | Bau, was verlangt ist, nenn die faulere Alternative in einer Zeile. |
| **full** | `/callbell-dev:dev` | Die Leiter durchgesetzt: YAGNI → Stdlib → nativ → eine Zeile → Minimum. Standard. |
| **ultra** | `/callbell-dev:dev ultra` | YAGNI-Extremist. Löschen vor Hinzufügen. Stellt Anforderungen infrage, bevor gebaut wird. |

Die Stufe gilt für die Arbeit, für die sie aufgerufen wurde, nicht für die ganze
Session. Ruf sie erneut auf, wenn du sie zurückwillst.

## Skills

| Skill | Aufruf | Was er tut |
|-------|--------|------------|
| **dev** | `/callbell-dev:dev` | Der Faul-Modus selbst. Die einfachste Lösung, die funktioniert. |
| **review** | `/callbell-dev:review` | Over-Engineering-Review eines Diffs: `L42: yagni: Factory, ein Produkt. Inline.` Häng `repo` an für einen Durchgang über den ganzen Baum, sortiert nach größtem Schnitt zuerst. |
| **help** | `/callbell-dev:help` | Diese Karte. |

## Stopp

Sag "stop" oder "normaler Modus". Jederzeit fortsetzen, indem du den Skill
erneut aufrufst.

## Setzt voraus

Den callbell-Core. Dieser Pack entscheidet, *wie* Code gebaut wird; der Core
trägt die Normen, die Ablage und das Gerüst, in dem er gebaut wird.
