---
name: incident
description: >
  Verdachtsdurchgang für einen Host, an dem jemand gewesen sein könnte: eine schnelle, nur lesende Sichtung
  von Zugang, Persistenz, Prozessen, Netz und Containern, verglichen mit dem, was über den Host
  festgehalten ist, danach gezieltes Nachfassen bei allem, was nicht zusammenpasst. Durchsucht nie das
  Dateisystem und ändert nie etwas. Starte es, indem du /callbell-sysadmin:incident tippst.
type: skill
edit: locked
disable-model-invocation: true
---

# Server-Vorfall: Sichtung, gezieltes Nachfassen, Reaktion

Für einen Host unter Verdacht. Der Routinedurchgang fragt, ob der laufende Zustand noch zur Baseline passt.
Dieser stellt eine andere Frage: hat sich hier jemand Zugang, Persistenz oder einen Brückenkopf verschafft.
Die Abweichungsprüfung beantwortet sie nicht, denn ein Angreifer mit root lässt die Baseline intakt.

**Abgrenzung, damit hier nichts doppelt steht:** `callbell-sysadmin:checkup` ist der regelmäßige
Gesundheitsdurchgang und schreibt einen datierten Bericht. Dieser läuft auf Verdacht, sammelt andere
Belege und schreibt nichts auf die Platte.

## Zwei Regeln, die alles Folgende prägen

**Der Host bleibt benutzbar.** Das läuft auf einem Produktivsystem. Ein Durchgang, der die Ein- und Ausgabe
sättigt, reißt die Dienste mit, und der Seitencache, den er verdrängt, hält die Datenbank noch lange danach
langsam. Die Sichtung liest deshalb nur bekannte Pfade und Kernelzustand. Sie durchsucht das Dateisystem
nie. Verlangen die Belege eine Suche über das ganze Dateisystem, geschieht das auf einer Kopie, nicht hier.

**Dieser Skill sammelt und erklärt, er entscheidet nicht.** Er gibt dem Betreiber Belege und eine Lesart
davon. Jede Handlung, jeder Befehl, der den Host verändert, jede Entscheidung zu isolieren oder neu
aufzusetzen, gehört ihm. Wo er etwas will, das dieser Skill nicht tut, ist die Antwort, es in der Sitzung
gemeinsam zu erarbeiten, und nicht, den Skill zu weiten, bis er von selbst handelt.

## Schritt 1: zuerst die Aufzeichnungen lesen

Bevor du irgendetwas sammelst, lies, was die Domäne des Hosts über ihn selbst sagt: Zweck, festgehaltene
Dienste, Benutzer, Stack und Ports. Das macht aus jedem späteren Block eine Gegenüberstellung statt einer
Liste, und genau darin liegt der Unterschied zwischen Sichtung und Starren auf Ausgaben.

Gibt es keine Aufzeichnungen, ist das ein Arbeitszustand und kein Fehler. Der realistische Vorfall ist der,
bei dem dieses Pack installiert wird, *weil* der Verdacht schon besteht. Dann läuft der Vergleich gegen das,
was für einen Host dieser Art normal ist, und jeder Befund sagt das dazu. Erhebe eine nicht überprüfbare
Beobachtung nie zu einem Befund, damit die Lesart entschlossener wirkt.

Sag, auf welcher der beiden Grundlagen du stehst, bevor du irgendetwas berichtest.

## Schritt 2: Sichtung

Führ die Begleitdatei `incident.sh` dieses Skill-Ordners aus. Sie drosselt sich selbst (Ein-/Ausgabeklasse
idle, nice 19), begrenzt jeden Block mit einer Zeitschranke und ist auf einem normalen Host in Sekunden
durch:

```bash
sudo bash incident.sh
```

Leite die Ausgabe nicht in eine Datei auf dem Host um. Siehe „Keine Berichtsdatei" weiter unten.

Die Blöcke sind nach Flüchtigkeit geordnet, nicht nach Wichtigkeit: Sockets und Prozesse verschwinden bei
einem Neustart oder wenn ein Prozess endet, während `authorized_keys` und cron-Einträge bleiben. Sammle
zuerst, was vergeht.

| Block | Was er beantwortet | Warum er billig ist |
|---|---|---|
| Lauschende und ausgehende Verbindungen | Ist etwas erreichbar, oder ruft etwas hinaus? | Socket-Tabelle des Kernels |
| Prozesse | Läuft etwas aus einer gelöschten Datei oder einem seltsamen Pfad? | nur `/proc` |
| Anmeldungen und sudo | Wer ist tatsächlich hereingekommen, und was hat er ausgeführt? | eine Protokolldatei, nur das Ende |
| Privilegierte Konten, `authorized_keys` | Wer *kann* hereinkommen? | eine Handvoll bekannter Dateien |
| cron, systemd-Units, Shell-Init, `ld.so.preload` | Wie käme jemand zurück? | bekannte Verzeichnisse, aufgelistet statt durchsucht |
| Docker | Container und Images gegen den festgehaltenen Stack | API des Daemons |

Der größte Wert je Kosten steht oben: eine Hintertür muss erreichbar sein oder hinausrufen, also wiegt ein
nicht festgehaltener Lauschender oder eine unerklärte ausgehende Verbindung schwerer als alles andere in
der Liste.

## Schritt 3: gezielt nachfassen

Die Sichtung liefert eine Handvoll Dinge, die nicht zusammenpassen. Jedem wird eigens nachgegangen, und was
zu tun ist, folgt aus dem Befund und nicht aus einem vorab geschriebenen Skript.

Ein nicht festgehaltener Lauschender auf einem Port heißt: welcher Prozess, welche Datei, wann zuletzt
geändert, wem gehört sie, was startet sie. Ein unerklärter cron-Eintrag heißt: was ruft er auf, wann tauchte
die Datei auf, welchem Konto gehört sie. Ein Schlüssel, den niemand kennt, heißt: wann wurde die Datei
zuletzt geschrieben, von welchem Konto, und passt eine Anmeldung im Protokoll zu dieser Zeit.

Das sind je eine Handvoll billiger Befehle, weil das Ziel bekannt ist. Es ist zugleich der Schritt, in dem
eine Suche über das ganze Dateisystem der bequeme Ersatz fürs Nachdenken gewesen wäre, zum Hundertfachen
der Kosten.

## Schritt 4: sichern, bevor sich etwas ändert

Deuten die Belege auf eine laufende Kompromittierung, halte das Flüchtige fest, bevor du irgendeine
Handlung vorschlägst: Prozessliste, Socketliste, die einschlägigen Protokollauszüge, in die Sitzung. Auf
einem Host, auf den es ankommt, schlag einen Snapshot beim Anbieter vor, bevor irgendetwas angefasst wird.

Einen Dienst neu zu starten, um aufzuräumen, kann die einzige Spur davon zerstören, wie der Brückenkopf
funktionierte. Erst Snapshot, dann untersuchen, und nichts ändern, bevor der Betreiber entschieden hat.

## Schritt 5: die Entscheidung übergeben

Benenne, was die Belege tragen, wie sicher das ist und was offen bleibt. Dann leg die Möglichkeiten dar, mit
dem, was jede kostet, falls die Lesart falsch ist. Einen Host, dessen Zustand sich nicht erklären lässt,
**isoliert** man, statt ihn aufzuräumen: ihn vom Netz zu nehmen bewahrt Spuren, ihn zu säubern zerstört sie.

Führ nur aus, wozu der Betreiber zugestimmt hat, und sag danach klar, was sich geändert hat und was
unangetastet blieb. Die Sicherheitsschicht des Packs verlangt vor zerstörenden Befehlen ohnehin Erklärung
und Bestätigung, und genau für diese Lage gibt es sie.

## Tiefe Untersuchung gehört auf eine Kopie

Manche Fragen brauchen wirklich eine Suche über das ganze Dateisystem: wurde eine Systemdatei ersetzt, gibt
es eine SUID-Datei, die niemand installiert hat, was wurde sonst noch an dem Tag geschrieben, an dem der
Einbruch begann. Diese Fragen werden auf einem Snapshot beantwortet, anderswo eingehängt, nie auf dem
laufenden Host. Zwei Gründe, und der zweite entscheidet:

1. Kosten. Das ganze Dateisystem abzugehen und jede Paketdatei zu prüfen ist schwere Ein- und Ausgabe und
   verdrängt den Seitencache, auf den die laufenden Dienste angewiesen sind.
2. Vertrauen. Ein Rootkit kann `find`, `ls`, `ps` und den Paketprüfer belügen, denn sie alle fragen den
   Kernel, den es bereits unterwandert hat. Auf dem laufenden Host ist ein solcher Scan teuer **und**
   unzuverlässig, die schlechteste verfügbare Kombination.

Der Weg ist also: das Volume beim Anbieter snapshotten, an eine getrennte Maschine hängen und die schweren
Werkzeuge dort gegen ein Dateisystem laufen lassen, das niemand verteidigt. `debsums -c` oder `rpm -Va` für
die Paketintegrität, ein Durchgang über SUID/SGID und einer über Änderungszeiten rund um das vermutete
Fenster. Scanner wie `rkhunter`, `chkrootkit` oder `Lynis` gehören ebenfalls dorthin. Installiere nie einen
Scanner auf dem verdächtigen Host: er schreibt auf die Platte, verändert den Paketzustand und verrät dem,
gegen den ermittelt wird, dass gesucht wird.

Will der Betreiber trotzdem einen tiefen Scan im laufenden Betrieb, ist das seine Entscheidung und sein
Befehl. Es liegt außerhalb dessen, was dieser Skill tut, und der Grund steht in den zwei Punkten oben und
nicht in einer Vorliebe.

## Keine Berichtsdatei

Anders als beim Routine-Checkup wird der Befund nicht auf den Host geschrieben. Unter Verdacht ist der Host
der falsche Ort dafür: die Datei ist von dem manipulierbar, gegen den ermittelt wird, und sie verrät, dass
gesucht wurde und wonach. Der Befund lebt in der Sitzung. Will der Betreiber ihn aufbewahren, wird er auf
sein Wort hin außerhalb des Hosts gesichert.

## Aufbau der Lesart

Berichte in der Sitzung, in dieser Form:

```markdown
# Vorfallsichtung: <host>, JJJJ-MM-TT

## Grundlage
<Festgehaltene Aufzeichnungen vorhanden, oder beurteilt gegen das für diese Art Host Normale. Ein Satz.>

## Zusammenfassung
<1 bis 3 Sätze: was die Belege tragen, wie sicher, was offen bleibt.>

## Passte nicht zusammen
### [BEFUND|NOTIZ|NICHT PRÜFBAR] <Titel>
- <Beobachtung mit Beleg> (Grundlage: Aufzeichnung | normal für diesen Host)
- <was das gezielte Nachfassen ergab>

## Passte zur Aufzeichnung
- <Blöcke, die sauber zurückkamen, je eine Zeile>

## Möglichkeiten
1. <Möglichkeit, und was sie kostet, falls die Lesart falsch ist>

## Von hier aus nicht beantwortet
- <was den Snapshot-Weg braucht, und welche Frage es klären würde>
```

Marker: `[BEFUND]` braucht eine Erklärung oder eine Reaktion · `[NOTIZ]` erwähnenswert, für sich genommen
nicht verdächtig · `[NICHT PRÜFBAR]` beobachtet, von diesem Host aus nicht beurteilbar.
