---
name: callbell-sysadmin-help
description: >
  Kurzreferenz zu callbell-sysadmin: ob das Pack hier gerade aktiv ist, wie man es einschaltet, welches
  Skill man wann will und welches davon nur liest. Einmalige Anzeige, kein dauerhafter Modus. Starte es,
  indem du /callbell-sysadmin-help tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Callbell Sysadmin Hilfe

Zeige diese Karte, wenn du aufgerufen wirst. Einmalig, kein Moduswechsel, nichts wird gespeichert.

**Sieh zuerst nach, was gilt**, und zeig den passenden der drei Zustände — die Karte soll sagen, was *hier*
los ist, und nicht alle Möglichkeiten aufzählen. Der Zustand steht in `__callbell__/.host-identity`.

## 1. Ist das Pack hier aktiv?

| `.host-identity` | Was das heißt | Was lädt |
|---|---|---|
| fehlt | kein Serverkontext — ein normales Repo, kein Host | nichts Serverspezifisches, und das ist Absicht |
| da, leer | du arbeitest von deiner eigenen Maschine aus per Fernwartung | die Sicherheitsschicht, ohne gesetzte Domäne |
| da, mit Inhalt | der Agent läuft auf dem Host; der Inhalt ist der Domänenordner | die Sicherheitsschicht, Domäne gesetzt |

Die Stille im ersten Fall ist die Funktion, nicht ein Fehler: das Pack ist geräteweit installiert, und ein
Code-Repo soll keinen Servertext bekommen.

## 2. Wie schalte ich es ein?

```
/callbell-sysadmin-start
```

Das legt den Arbeitsordner an: einen Ordner je Host mit `framework.md` und `index.md`, liest den Bestand der
Maschine selbst aus und schreibt die Identität. Es läuft auch auf einem Server, der längst steht — dafür
braucht es keine Neuinstallation.

Ab der **nächsten** Sitzung nennt der Hook die Domäne und die Sicherheitsschicht ist da.

## 3. Welches Skill will ich?

In der Reihenfolge, in der man ihnen begegnet:

| Skill | Wofür | Am System |
|-------|-------|-----------|
| **start** | Arbeitsordner und Host-Domäne anlegen oder eine weitere ergänzen | legt nur Dateien an |
| **setup** | eine frische Maschine von Grund auf hochbringen (Taktgeber für die folgenden) | **verändert** |
| **harden** | auf die Sicherheits-Baseline härten oder eine bestehende Härtung prüfen | **verändert** |
| **backup** | verschlüsselte, ausgelagerte Sicherung einrichten oder nachrüsten | **verändert** |
| **restore-proof** | beweisen, dass die Sicherung wiederherstellbar ist (in Scratch, nie live) | liest, schreibt nur Scratch |
| **deploy** | einen neuen Docker-Stack nach festen Konventionen aufsetzen | **verändert** |
| **docker-update** | einen Stack oder die Docker-Engine aktualisieren | **verändert** |
| **checkup** | Routinefrage „läuft noch alles rund", als datierter Bericht | liest, schreibt den Bericht |
| **incident** | Verdacht, dass jemand am Host war: schnelle Sichtung | **liest nur**, ändert nichts |
| **help** | diese Karte | zeigt nur |

`setup` ist der Taktgeber für eine neue Maschine und ruft `harden`, `backup` und `deploy` der Reihe nach
auf. Auf einem Server, der schon läuft, greifst du die einzeln.

## 4. Was liest und was verändert?

Die Spalte oben ist die kurze Antwort, und vor einem Lauf auf einem Produktivsystem ist sie die wichtigste.
Zwei Dinge dazu:

- **`incident` schreibt bewusst nichts**, auch keinen Bericht auf den Host. Unter Verdacht ist der Host der
  falsche Ort für den Befund.
- **Verändernde Skills entscheiden nicht allein.** Die Sicherheitsschicht verlangt vor zerstörenden
  Befehlen Erklärung und Bestätigung, und kein Skill dieses Packs startet von selbst — jedes wird getippt.

## Namensraum

Die Skills tragen das Pack-Präfix `callbell-sysadmin-` im Namen — so findest du sie alle auf einmal, wenn du
`/callbell-sysadmin` tippst. Codex nutzt dieselben Skills mit dem Präfix `@`. Der Kern liegt darunter und
ist Voraussetzung: `/callbell-help` zeigt dessen Karte.
