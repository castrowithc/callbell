---
name: callbell-import
description: >
  Turn raw material the user dropped in __callbell__/zone-import/ into filed knowledge. Use whenever the user
  signals, in any wording or language, that they left something to process ("it's in the inbox", "I dropped a
  file in there"), or names __callbell__/zone-import/ directly.
  Covers binaries (images, PDF, Office, exports) and text (Markdown, txt, Obsidian notes, Claude Code web
  exports). Converts to Markdown, redacts per the data-protection norm, files the result through the repo's
  filing logic, then moves the original to the archive. Also on "process my import", "convert this file",
  "callbell-import", "/callbell-import".
license: MIT
type: skill
edit: locked
---

# Import

The user drops raw material in `__callbell__/zone-import/`; convert it, redact it, and file the result. The zone is transient and unversioned, so only the converted, redacted result becomes permanent content. Take type and placement from `callbell-frontmatter` and the repo's filing conventions; handle sensitive data by the core's data-protection norm.

## Recognize the trigger

The user rarely says "run the import skill". They tell you in their own words, in whatever language they write in, that they left you something: "it's in the inbox", "I dropped a file in there". Read the intent, not a fixed phrase. On any such signal, or when the user names `__callbell__/zone-import/`, go look.

## Steps

1. **Take inventory.** List what sits in `__callbell__/zone-import/` (skip the `processed/` archive). Report what you found and what you plan to do before you change anything.
2. **Convert to Markdown.** Render each piece as Markdown: extract and describe binaries (image, PDF, Office); clean up text and notes (Markdown, txt, Obsidian, web exports). Keep the meaning, drop the noise.
3. **Redact as you convert.** Keep sensitive data out of the filed, versioned file. Replace it in place with a placeholder in the document's language, e.g. `[social security number redacted]`. Report every redaction so the user can decide exceptions per file.
4. **Identify the entity.** Work out which customer, project, or topic the material belongs to, in the data-protection norm's order: an existing identifier first, else the running context, else ask. Say which one you chose.
5. **Set the target.** Read the content, decide what should happen, and propose it: fold into an existing project, set up a new one (only after approval), or file it in place. Then file the converted result per the repo's filing conventions.
6. **Mark the provenance.** Add an `imported-<type>` entry to the filed file's `tags:` (vocabulary below) so its origin stays findable. Keep the normal content `type`; the tag rides on top.
7. **Archive the original.** Move the processed original to `__callbell__/zone-import/processed/<yyyy-mm>/` (the month you processed it). It stays there, transient and unversioned, until cleanup.
8. **Report.** Summarize what you converted, where it went, every redaction, and which entity you assigned, so the user can follow it by hand and correct it.

## Provenance tags

The filed file carries an `imported-<type>` tag so a later search finds all imports (`imported-*`) or one kind (`imported-pdf`):

| Source | Tag |
|---|---|
| PDF | `imported-pdf` |
| Image (any format) | `imported-img` |
| CSV | `imported-csv` |
| Excel or spreadsheet | `imported-xls` |
| Word or document | `imported-doc` |
| Markdown | `imported-md` |
| Plain text | `imported-txt` |

## Archive and cleanup

Don't let `__callbell__/zone-import/` grow without bound. The monthly bins `processed/<yyyy-mm>/` keep cleanup cheap: an old month empties in one move. Move a processed original into `processed/` on your own; that's routine. Emptying a bin is a deletion, so propose it and wait for approval. Never clear the archive yourself. Switch to calendar weeks (`<yyyy-Www>`) only if weekly volume warrants it.

## Limits

- **The filed result is redacted; the archived original is not.** Real data survives only in `__callbell__/zone-import/` and its `processed/` archive, both unversioned. Nothing personal reaches a versioned file, whether the repo is public or private.
- **No new structure on your own.** A new project or area is a structure change: propose it, otherwise file into the existing schema.
- **Results go the other way.** Finished outputs the user wants to take out of the repo belong in `__callbell__/zone-export/`, not here.
