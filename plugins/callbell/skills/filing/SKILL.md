---
name: filing
description: >
  Entscheide, wohin eine Datei gehört und wie der Ordnerbaum wächst. Nutze dies,
  wann immer du eine Inhaltsdatei anlegst, platzierst, verschiebst, promotest
  oder umstrukturierst: welcher Bereichsordner, flach-mit-Präfix vs. ein
  Typ-Ordner, welche Zone (work / zone-import / zone-export), und wie ein
  Entwurf über seinen Status aktiv wird. Nutze es auch bei "wo gehört das hin",
  "strukturier das um", "promote das", "callbell-filing" oder "/callbell:filing".
type: skill
edit: locked
---

# Ablage: wohin eine Datei gehört und wie der Baum wächst

Dieser Skill platziert Inhalt im Projekt **außerhalb** von `__callbell__/`. Diese Schicht wird von ihrer
eigenen Regel abgelegt (`callbell-scaffold-rules`), nie von Hand, und nichts hier gilt für sie.

## Der Pfad ist die strukturelle Wahrheit

- **Keine `domain/area/topic`-Hierarchie.** Der Bereichsordner ist die oberste Ebene; Tiefe wächst nur in
  ihm, und nur dort, wo sie gebraucht wird.
- Bereich und Thema leben im **Ordnernamen**, nie im Frontmatter.
- Der Typ ist auch im Pfad sichtbar: als Präfix `<type>-<name>.md`, solange die Ablage flach bleibt, oder
  als Ordner `<type>/`, sobald gruppiert. **Wo Pfad und Frontmatter sich widersprechen, gewinnt das
  Frontmatter.** Rohzonen tragen gar keinen Typ.

Bereichsordner sind eine **ops**-Struktur, und ihr Register ebenso. In einem ops-Repo steht in
`__callbell__/framework.md`, welche Bereiche und Themen existieren; der Agent nutzt nur, was dort steht, und
legt keinen neuen Bereich ohne Freigabe an. Diese Datei wird nicht mit dem Scaffold ausgeliefert — sie
entsteht mit dem ersten Bereich, und bis dahin gibt es keine Bereiche zu registrieren. Ein **Code**-Repo
hat kein Bereichsregister und braucht keins: die Wurzel ist das Code-Projekt, und Dokumentation liegt unter
`__callbell__/docs/`. Lies die Linse, bevor du zum Register greifst.

## Erst nach einer Vorlage schauen

Bevor du eine wiederkehrende Bereichsstruktur neu erfindest (zum Beispiel Kunden, Projekte, Objekte), prüfe
`__callbell__/templates/` auf eine passende Vorlage und instanziiere sie. Welche Vorlagen da sind, hängt von
der Linse ab — das Kundenmuster wird nur mit dem **ops**-Scaffold ausgeliefert, in einem Code-Repo suchst du
also nicht danach. Wo es existiert, funktioniert es so: Der Bereich `business-customers/` bekommt eine
`framework.md` (wie identifizieren, wie suchen, welche Daten nie hineinfließen) und einen Unterordner
`<id>/index.md` pro Kunde. Nur wenn keine Vorlage passt, baust du deine eigene und schlägst dem Nutzer vor,
das Muster als Vorlage festzuhalten.

## Zuerst der Bereichsordner

Operativer Inhalt lebt in einem flachen Wurzelordner `<area>-<topic>` (zum Beispiel `business-finance/`).
Wähle erst den richtigen Bereichsordner (aus dem Register), dann platziere die Datei darin. Passt nichts
sauber oder läuft ein Bereich über: rate nicht, schlag eine Anpassung vor und warte auf Freigabe.

## Standard-Platzierung und die >5-Schwelle

- **Standard: flach mit einem Typ-Präfix**, also `<area>-<topic>/<type>-<name>.md` (zum Beispiel
  `business-finance/fact-<name>.md`).
- **Ein Typ-Ordner, sobald mehr als 5 Dateien desselben Typs** in einem Ordner liegen → verschiebe sie in
  `<type>/` (jetzt ist der Ordner der Typ; das Präfix entfällt).
- **Unterthemen** entscheidet der Owner, nicht die Dateizahl. Die >5-Schwelle erzeugt nur einen Typ-Ordner,
  nie ein neues Thema. `fact` und `knowledge` dürfen groß werden, ohne geteilt zu werden.

## Typ → Platzierung

| `type` | Platzierung |
|---|---|
| `fact` · `knowledge` · `history` | Flach mit Präfix `<area>-<topic>/<type>-<name>.md`; sobald mehr als 5 desselben Typs → ein `<type>/`-Ordner. |
| `playbook` | Neben dem wiederkehrenden Prozess, dem es dient (`<area>-<topic>/[<subtopic>/]playbooks/`); sonst flach `playbook-<name>.md`. |
| `decision` | Zentral und datiert im Bereich: `<area>-<topic>/decisions/YYYY-MM-DD-….md`. Strukturelle und Meta-Entscheidungen betreffen das Framework, nicht einen Bereich. |
| `meta` | Flach, kein Präfix: `<area>-<topic>/framework.md` (Wurzel der Kaskade: ops `__callbell__/framework.md`, code `__callbell__/docs/framework.md` — jeweils angelegt, wenn zuerst gebraucht). |
| `task` | In `__callbell__/backlog/`, dem versionierten Arbeitspfad. Ort und Lebenszyklus sind keine Ablageentscheidung. |
| `memory` | In `__callbell__/memory/`, erschlossen über seinen Index. Ebenfalls keine Ablageentscheidung. |

Regeln und Skills werden nie von Hand platziert. Sie werden mit dem Plugin ausgeliefert und in die Session
injiziert; eine Kopie davon im Repo ist ein Defekt, keine Platzierung.

**Vorrang** (entscheide in dieser Reihenfolge): eine zentrale `decision` → `meta`/Framework (flach) →
`playbook` (Prozess) → der Rest, flach mit Präfix.

## Verweise (Inhaltsmodell)

- **Inhalt verweist nie auf Meta.** Inhaltstypen (`fact`/`knowledge`/`playbook`/`history`) zitieren keine
  Meta- oder Rahmendatei (`AGENTS.md`, `framework.md`, Regeln, Skills). Abhängigkeiten laufen nur von Meta
  zu Inhalt (abwärts), nie zurück. So bricht ein Governance-Umbau keine Inhaltsdatei, und Inhalt bleibt
  selbstständig.
- `[[…]]` auf andere Inhaltsdateien ist erlaubt.
- Die einzige Ausnahme: eine `decision`, deren Gegenstand die Struktur selbst ist.

## Zonen

Die zwei `__callbell__/`-Zonen werden zentral verwaltet. Für die Ablage relevant:

- **`<area>-<topic>/work/`**: die Werkbank des Bereichs: rohe, kopflose Arbeit in Arbeit, interne
  Unterstruktur erlaubt (zum Beispiel `work/2025/`). Sie hält die Bereichsebene **lesbar**:
  `<area>-<topic>/` sollte nur Typ-Ordner (und flache Typ-Dateien) zeigen. Alles, was sonst fremde Ordner
  erzeugen würde (Jahre, Ad-hoc-Gruppen), wandert in `work/` statt die Typ-Ordner zu verstecken.
- **`__callbell__/zone-import/`** (Wurzel): rohe externe Eingaben, flüchtig, gitignored.
- **`__callbell__/zone-export/`** (Wurzel): angeforderte menschliche Lieferobjekte, **nur auf ausdrückliche
  Anfrage**, ohne Typen, ohne Frontmatter. Nicht Teil der Wissensbasis; der Agent legt hier von sich aus
  nichts ab.

## Entwurf und Reife über den Status

Es gibt **keine separate Entwurfszone**. Ein Entwurf ist eine Datei mit `status: draft` an ihrem richtigen
Platz, und sie reift dort an Ort und Stelle. "Promotion" ist ein **Statuswechsel** (`draft → active`), kein
Verschieben; er braucht Freigabe.

- **`fact`/`knowledge`** werden direkt im richtigen `<area>-<topic>/` angelegt, erst `status: draft`, dann
  `status: active`.
- **`decision`**: `status: draft`, solange sie abgewogen wird; bei Freigabe `status: active`, Datum =
  Freigabedatum (nicht Entwurfsdatum), datiert in `decisions/…`.
- **Stehende Regeln** eines Bereichs wandern in seine `framework.md`.
- **Backlog**: Reife und Abschluss folgen dem eigenen Lebenszyklus des Backlogs, nicht diesem Skill.

## Faule Tiefe: zwei getrennte Schwellen

Ordner erscheinen mit ihrer ersten Datei, nie leer auf Vorrat. **Zwei verschiedene Dinge, zwei Schwellen:**

- **Eine Unterebene (Unterthema): ab der 2. Datei derselben Art.** Eine einzelne Datei bleibt flach; die
  zweite erzeugt die benannte Unterebene. Ein Bereich darf direkt zu Typen gehen
  (`<area>-<topic>/knowledge/`), solange es nur ein Feld gibt.
- **Ein Typ-Ordner: ab mehr als 5 Dateien desselben Typs** (siehe oben).

**Migrations-Invariante:** vor dem zweiten Unterthema hebe erst das flache Material in die erste benannte
Unterebene, dann füge das neue daneben hinzu. Beispiel: `business-finance/knowledge/` plus ein neues
Unterthema → erst `business-finance/<subtopic-1>/knowledge/`, dann `business-finance/<subtopic-2>/`.

## Kaskade

Eine `framework.md` pro Bereich oder Unterthema, **faul und als Overlay**: sie entsteht nur, wenn der Ordner
eigene, wachsende Arbeitsregeln braucht (was das Rückgrat aus `AGENTS.md`, Regeln und Skills nicht schon
abdeckt), und sie beschreibt, wie dort gearbeitet wird (Suche, Identifikation, lokale Leitplanken). Sie wird
nur gelesen, wenn dort gearbeitet wird. Kein verschachteltes `AGENTS.md`/`CLAUDE.md` unten in der Tiefe: die
Kaskade läuft allein über die `framework.md`-Dateien per Pfad (von der Wurzel gelesen), nicht über
Harness-Auto-Loading.

## Platzierungsgrenzen

- **Kein Asset-Speicher.** Dies ist eine Planungsschicht, kein Speicher für Massen-, Medien- oder
  *wechselnde* Binärdateien. Erlaubt: ein kleines, stabiles Bild, wenn es *das* Artefakt ist (zum Beispiel
  ein Diagramm). Große Dateien → ein Dateispeicher oder Git LFS; flüchtige Eingaben →
  `__callbell__/zone-import/`.
- **Selten aber wichtig → ein Playbook.** Eine Prozedur, die nur ein paar Mal im Jahr gebraucht wird, lebt
  als eigenes Playbook und wird anderswo mit einem Einzeiler-Verweis referenziert, damit die Pflichtlektüre
  schlank bleibt.
- **Ein Playbook ist neutral und wiederkehrend.** Es beschreibt die wiederholbare Prozedur (bei Werkzeugen:
  Felder, Optionen, Formulare, was wohin gehört), frei von fall- oder jahresspezifischen Zahlen; konkrete
  Werte → der richtige `fact` oder die `work/`-Zone.
