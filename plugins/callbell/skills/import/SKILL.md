---
name: import
description: >
  Nimm Rohmaterial, das der Nutzer in __callbell__/zone-import/ abgelegt hat, und mache abgelegtes Wissen
  daraus. Nutze dies immer, wenn der Nutzer in irgendeiner Formulierung oder Sprache signalisiert, dass er
  etwas zum Verarbeiten hinterlegt hat ("liegt in der Ablage", "ich habe da was reingelegt", "it is in the
  inbox", "ho caricato un file"), oder wenn er __callbell__/zone-import/ direkt nennt. Deckt Binärdateien
  (Bilder, PDF, Office, Exporte) und Text ab (Markdown, txt, Obsidian-Notizen, Claude-Code-Web-Exporte).
  Wandelt nach Markdown, schwärzt gemäß callbell-data-protection, legt das Ergebnis über die Ablagelogik der
  Vorlage ab und verschiebt danach das Original ins Archiv. Nutze es auch bei "verarbeite meinen Import",
  "wandle diese Datei um", "callbell-import" oder "/callbell:import".
type: skill
edit: locked
---

# Import: aus Rohmaterial wird abgelegtes Wissen

Die Zone `__callbell__/zone-import/` ist die eingehende Werkbank (siehe `callbell-zones`): der Nutzer legt
dort Rohmaterial ab, der Agent macht daraus etwas, das der Repo tragen kann. `__callbell__/zone-import/`
selbst ist flüchtig und unversioniert; nur das gewandelte, geschwärzte Ergebnis wird dauerhafter Inhalt an
seinem richtigen Platz.

Dieser Skill ist die Prozedur. Was jeder Typ bedeutet und wohin er gehört, legt `callbell-frontmatter` mit
den Ablagekonventionen des Repos fest; wie mit sensiblen Daten umzugehen ist, legt
`callbell-data-protection` fest.

## Den Auslöser erkennen

Der Nutzer sagt selten "führe den Import-Skill aus". Er sagt in seinen eigenen Worten, dass er dir etwas
hinterlegt hat: "liegt in der Ablage", "ich habe eine Datei reingelegt", "it is in the inbox" und so
weiter. Lies die Absicht, nicht eine feste Formulierung. Wenn so ein Hinweis kommt oder der Nutzer
`__callbell__/zone-import/` nennt, sieh dort nach.

## Schritte

1. **Bestandsaufnahme.** Liste auf, was in `__callbell__/zone-import/` liegt (das Archiv `processed/`
   ausgenommen). Melde, was du gefunden hast und was du vorhast, bevor du inhaltlich etwas änderst.
2. **Nach Markdown wandeln.** Lies jedes Stück und gib seinen Inhalt als Markdown wieder: Binärdateien
   (Bild, PDF, Office), indem du ihren Inhalt herausziehst und beschreibst, Text und Notizen (Markdown,
   txt, Obsidian, Web-Exporte), indem du sie aufräumst. Erhalte den Sinn, wirf das Rauschen weg.
3. **Beim Wandeln schwärzen.** Wende `callbell-data-protection` an: sensible Daten fließen nicht in die
   abgelegte, versionierte Datei. Ersetze sie an Ort und Stelle durch einen Platzhalter in der Sprache des
   Dokuments, zum Beispiel `[Sozialversicherungsnummer geschwärzt]` oder
   `[social security number redacted]`. Melde jede Schwärzung, damit der Nutzer Ausnahmen pro Datei
   entscheiden kann.
4. **Die Entität identifizieren.** Bestimme, zu welchem Kunden, Projekt oder Thema das Material gehört,
   nach der Rangfolge in `callbell-data-protection` (eine Kundennummer, wenn es eine gibt, sonst der
   laufende Kontext, wenn er schon eine bestimmte Entität betrifft, sonst nachfragen). Teile in jedem Fall
   mit, wofür du dich entschieden hast.
5. **Das Ziel festlegen.** Erarbeite aus dem Inhalt, was passieren soll, und schlage es vor: in ein
   bestehendes Projekt überführen, ein neues Projekt aufsetzen (nur nach Freigabe, siehe
   `callbell-governance`) oder an der richtigen Stelle ablegen. Lege das gewandelte Ergebnis nach den
   Ablagekonventionen des Repos an seinem richtigen Platz ab.
6. **Die Herkunft kennzeichnen.** Ergänze an der abgelegten Datei einen `tags:`-Eintrag `imported-<typ>`
   (Vokabular unten), damit die Herkunft auffindbar bleibt. Die Datei behält ihren normalen inhaltlichen
   `type`; der Tag kommt hinzu.
7. **Das Original archivieren.** Verschiebe das verarbeitete Original nach
   `__callbell__/zone-import/processed/<yyyy-mm>/` (der Monat der Verarbeitung). Dort bleibt es, flüchtig
   und unversioniert, bis zum Aufräumen.
8. **Berichten.** Fasse zusammen, was gewandelt wurde, wohin es ging, jede Schwärzung und welche Entität du
   zugeordnet hast, damit der Nutzer es von Hand nachvollziehen und korrigieren kann.

## Herkunfts-Tags

Die abgelegte Datei trägt einen Tag `imported-<typ>`, damit eine spätere Suche alle Importe (`imported-*`)
oder eine bestimmte Art findet (`imported-pdf`):

| Quelle | Tag |
|---|---|
| PDF | `imported-pdf` |
| Bild (jedes Format) | `imported-img` |
| CSV | `imported-csv` |
| Excel oder Tabelle | `imported-xls` |
| Word oder Dokument | `imported-doc` |
| Markdown | `imported-md` |
| Reiner Text | `imported-txt` |

## Archiv und Aufräumen

`__callbell__/zone-import/` darf nicht unbegrenzt wachsen. Die Monatsbehälter
`__callbell__/zone-import/processed/<yyyy-mm>/` machen das Aufräumen einfach: ein alter Monat lässt sich in
einem Zug leeren. Ein verarbeitetes Original nach `processed/` zu verschieben ist Routine, das macht der
Agent selbst. **Einen Behälter zu leeren ist eine Löschung**, also schlägt der Agent es vor und wartet auf
Freigabe (siehe `callbell-governance`); er räumt das Archiv nie von sich aus. Nimm Kalenderwochen
(`<yyyy-Www>`) statt Monaten nur dann, wenn das wöchentliche Aufkommen es rechtfertigt.

## Grenzen

- **Das abgelegte Ergebnis ist geschwärzt, das archivierte Original nicht.** Echte Daten überleben nur in
  `__callbell__/zone-import/` und dessen Archiv `processed/`, beide unversioniert. Nichts Personenbezogenes
  erreicht eine versionierte Datei. Das gilt unabhängig davon, ob der Repo öffentlich oder privat ist
  (siehe `callbell-data-protection`).
- **Keine neue Struktur von dir aus.** Ein neues Projekt oder ein neuer Bereich ist eine Strukturänderung:
  schlage sie vor, lege sonst in das bestehende Schema ab (siehe `callbell-governance`).
- **Ergebnisse gehen den anderen Weg.** Fertige Ausgaben, die der Nutzer aus dem Repo mitnehmen will,
  gehören nach `__callbell__/zone-export/`, nicht hierher (siehe `callbell-zones`).
