---
name: callbell-import
description: >
  Take raw material the user dropped in __callbell__/_import/ and turn it into filed knowledge. Use this whenever
  the user signals, in any wording or language, that they placed something for you to process ("it is
  in the inbox", "I put something in there", "liegt in der Ablage", "ho caricato un file"), or names
  __callbell__/_import/ directly. Covers binaries (images, PDF, Office, exports) and text (Markdown, txt, Obsidian
  notes, Claude Code Web exports). Converts to Markdown, redacts per callbell-data-protection, files the
  result through the template's placement logic, then moves the original to the processed archive. Also
  use on "process my import", "convert this file", "callbell-import", or "/callbell-import".
type: skill
edit: locked
---

# Import: raw material becomes filed knowledge

The `__callbell__/_import/` zone is the inbound workbench (see `callbell-zones`): the user drops raw material there,
the agent turns it into something the repo can hold. `__callbell__/_import/` itself is volatile and unversioned; only
the converted, redacted result becomes durable content in its proper place.

This skill is the procedure. What each type means and where it goes is set by `callbell-frontmatter` and
the repo's filing conventions; how sensitive data is handled is set by `callbell-data-protection`.

## Recognize the trigger

The user rarely says "run the import skill". They say, in their own language, that they left something
for you: "it is in the inbox", "I dropped a file", "liegt in der Ablage", and so on. Read the intent, not
a fixed phrase. When such a cue appears, or the user names `__callbell__/_import/`, look there.

## Steps

1. **Inventory.** List what is in `__callbell__/_import/` (ignore the `processed/` archive). Report what you found and
   what you intend to do before you change anything of substance.
2. **Convert to Markdown.** Read each item and render its content as Markdown: binaries (image, PDF,
   Office) by extracting and describing their content, text and notes (Markdown, txt, Obsidian, web
   exports) by cleaning them up. Preserve meaning, drop noise.
3. **Redact while converting.** Apply `callbell-data-protection`: sensitive data does not flow into the
   filed, versioned file. Replace it in place with a placeholder in the document's own language, for
   example `[social security number redacted]` or `[Sozialversicherungsnummer geschwärzt]`. Report every
   redaction so the user can decide exceptions per file.
4. **Identify the entity.** Determine which customer, project, or topic the material belongs to, following
   the precedence in `callbell-data-protection` (a customer number if one exists, else the running
   context if it already concerns a specific entity, else ask). Communicate what you chose either way.
5. **Decide the destination.** From the content, work out what should happen and propose it: migrate into
   an existing project, stand up a new project (only after approval, see `callbell-governance`), or file
   it at the right place. File the converted result at its proper place following the repo's filing
   conventions.
6. **Tag the provenance.** On the filed file, add a `tags:` entry `imported-<type>` (vocabulary below) so
   the origin stays greppable. The file keeps its normal content `type`; the tag is additive.
7. **Archive the original.** Move the consumed original into `__callbell__/_import/processed/<yyyy-mm>/` (the month it
   was processed). It stays there, volatile and unversioned, until cleanup.
8. **Report.** Summarize what was converted, where it went, every redaction, and the entity you assigned,
   so the user can follow it by hand and correct anything.

## Provenance tags

The filed file carries one `imported-<type>` tag, so a later search finds all imports (`imported-*`) or a
specific kind (`imported-pdf`):

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

`__callbell__/_import/` must not grow without bound. The month buckets `__callbell__/_import/processed/<yyyy-mm>/` make cleanup
simple: an old month can be cleared in one move. Moving a consumed original into `processed/` is routine,
the agent does it on its own. **Purging a bucket is a deletion**, so the agent proposes it and waits for
approval (see `callbell-governance`); it never clears the archive on its own. Use calendar weeks
(`<yyyy-Www>`) instead of months only when the weekly volume is high enough to warrant it.

## Boundaries

- **The filed result is redacted, the archived original is not.** Real data survives only in `__callbell__/_import/`
  and its `processed/` archive, both unversioned. Nothing personal reaches a versioned file. This holds
  regardless of whether the repo is public or private (see `callbell-data-protection`).
- **No new structure on your own.** A new project or area is a structural change: propose it, file into
  the existing schema otherwise (see `callbell-governance`).
- **Deliverables go the other way.** Finished outputs the user asks to take out of the repo belong in
  `__callbell__/_export/`, not here (see `callbell-zones`).
