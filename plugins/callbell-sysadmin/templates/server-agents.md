# <repo-name>

<!-- Vorlage für die AGENTS.md eines Server-Arbeitsordners. Kopiere sie in den Repo-Root und passe die
spitzen Klammern an. Was ein solcher Ordner ist, ist jedes Mal fast dasselbe — deshalb eine Vorlage und
kein Interview. -->

Der Arbeitsordner für die Administration von <Host oder Hosts>. Von hier aus wird betrieben, dokumentiert
und nachgeschlagen.

## Aufbau
- Ein Ordner je Host, benannt wie der Host. Alles über eine Maschine liegt in ihrer Domäne: `framework.md`
  sagt, wie auf ihr gearbeitet wird, `index.md` was auf ihr steht, alles Weitere wächst darunter.
- `__callbell__/` ist die gemeinsame Mitte: Gedächtnis, Arbeitsspur, Zonen, Vorlagen. Sie gehört keinem
  Host.
- `__callbell__/.host-identity` nennt die Domäne, in der eine Sitzung arbeitet. Leer heißt: von der eigenen
  Maschine aus per Fernwartung, ohne gesetzte Domäne.

Host-Material gehört in die Domäne, nie in `__callbell__/`.

## Zweck und Rahmen
<!-- Wofür dieser Ordner da ist und was bewusst nicht dazugehört. Ob das Repo privat ist — der Agent nimmt
sonst öffentlich an. -->

## Rollen
<!-- Wer der Nutzer ist, wie eigenständig der Agent handeln soll, wie ausführlich und in welchem Ton. -->

## Was hier nie hineingehört
Zugangsdaten in jeder Form: Schlüssel, Passwörter, Tokens, `.env`-Dateien mit Inhalt. Sie leben auf dem
Host und im Passwortspeicher, nicht in einem versionierten Ordner. Ein privates Repo ist keine Ausnahme,
denn Sichtbarkeit lässt sich ändern und die Historie bleibt.
