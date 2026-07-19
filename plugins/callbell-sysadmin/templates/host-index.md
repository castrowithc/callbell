---
description: >
  Der Bestand eines Hosts: die Grundlagen, die man sonst bei jeder Sitzung neu erheben müsste.
type: knowledge
edit: shared
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <host>

<!-- Vorlage. Kopiere sie nach <host>/index.md. Was hier steht, hat der Agent von der Maschine
gelesen — nicht vom Nutzer erfragt. Fragen kostet den Nutzer Zeit für etwas, das ein Befehl weiß. -->

## System
| | |
|---|---|
| Hostname | |
| Distribution | <!-- cat /etc/os-release --> |
| Init | <!-- ps -p1 -o comm= --> |
| Paketmanager | |
| Provider | |
| CPU / RAM / Disk | |

## Zugang
<!-- Admin-Benutzer, SSH-Port, Authentisierungsweg. Niemals Schlüssel, Passwörter oder Tokens: die
Datenschutznorm des Kerns gilt hier unverändert, und dieses Repo kann öffentlich werden. -->

## Was hier läuft
<!-- Dienste, Stacks, Anwendungen. Eine Zeile pro Sache, mit dem, was man wissen muss, um sie nicht
versehentlich zu treffen. Wächst mit; ein neuer Dienst kommt hier dazu, solange er keine eigene Datei
braucht. -->

## Sicherung
<!-- Ob gesichert wird, wohin, wie oft — und wann zuletzt eine Wiederherstellung bewiesen wurde. Eine
laufende Sicherung ohne bewiesene Wiederherstellung ist keine Sicherung. -->

## Härtung
<!-- Der Stand gegenüber der Baseline und jede bewusste Abweichung mit ihrem Grund. -->
