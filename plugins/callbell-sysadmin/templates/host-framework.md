---
description: >
  Der Rahmen eines Hosts: wofür diese Maschine da ist, wie auf ihr gearbeitet wird und was auf ihr
  tabu ist. Gilt für alles, was in dieser Domäne geschieht.
type: meta
edit: shared
---

# Rahmen: <host>

<!-- Vorlage. Kopiere sie nach <host>/framework.md und passe sie an. Sie beschreibt, wie auf diesem
Host gearbeitet wird — nicht, was auf ihm steht. Das steht in der index.md daneben. -->

## Wofür dieser Host da ist
<!-- Ein bis drei Sätze. Der Zweck ist das Einzige, was der Agent nicht selbst auslesen kann, deshalb
steht er hier zuerst. Beispiel: "Produktiver Docker-Host für die Kundenanwendungen. Kein Staging, kein
Bauen auf der Maschine." -->

## Wie hier gearbeitet wird
<!-- Nur die Abweichungen von dem, was das Pack ohnehin vorgibt. Was der Baseline entspricht, gehört
nicht hierher: es doppelt zu schreiben heißt, es zweimal pflegen zu müssen. -->

- **Wartungsfenster:** <!-- wann Neustarts und Updates erlaubt sind, oder "jederzeit" -->
- **Wer entscheidet:** <!-- wer freigibt, bevor etwas Zerstörendes läuft -->
- **Besonderheiten:** <!-- was auf dieser Maschine anders ist als üblich und einen Agenten sonst stolpern
lässt -->

## Was hier tabu ist
<!-- Konkret und benannt. Eine Liste von Pfaden, Diensten oder Vorgängen, die nicht angefasst werden,
auch wenn sie technisch erreichbar sind. Leer lassen ist erlaubt, raten nicht. -->

## Verweise
- `index.md` — der Bestand dieses Hosts: was auf ihm läuft und wie er aufgebaut ist.
