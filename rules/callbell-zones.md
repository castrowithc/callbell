---
paths: ["**/*"]
description: >
  The core zones (_import, _export, _backlog): what belongs in them, which direction they flow,
  that they are recognizable by the _ prefix and sit outside the typed filing. Backbone, applies in every repo.
type: rule
edit: locked
---

# Zones

Zones are fixed folders under `__callbell__/`, marked with `_`, that sit **outside** the typed filing. They
live in the callbell-managed layer (`__callbell__/`), not in the root beside your content. They are
backbone: they exist in every repo, and their purpose is fixed. The `_` prefix means "zone", not
"hidden". The agent knows them, and the human sorts nothing.

## `__callbell__/_import/`: inbound (user to agent)
Raw inputs the user hands to the agent: CSV, PDF, images, notes, exports from other systems. The agent
converts them to Markdown when needed and files the redacted result in its proper place. `__callbell__/_import/` itself
is **volatile and free of frontmatter**, not part of the knowledge base, and gitignored (the template
`.gitignore` enforces this; the folder stays through `.gitkeep`, its content is not versioned).

The full ingest procedure (recognize, convert, redact, identify, file, archive) is set by the skill
`callbell-import`; redaction of sensitive data is set by `callbell-data-protection`. A consumed original
moves into the archive `__callbell__/_import/processed/<yyyy-mm>/`, one bucket per month, still volatile and
unversioned. This zone **must not grow without bound**: archiving an original is routine, but **purging a
bucket is a deletion** and needs approval (see `callbell-governance`), so an old month is cleared only on
request.

## `__callbell__/_export/`: outbound (agent to user)
Finished deliverables the user requests for use outside the repo (reports, extracts, exports), a single
file or a whole folder of them. **Only on explicit request**, free of frontmatter, not part of the
knowledge base. The agent files nothing here on its own. `__callbell__/_export/` is **gitignored** like `__callbell__/_import/`: a
deliverable often carries exactly the real, unredacted data the user wants to take out, which must never
enter the versioned repo (see `callbell-data-protection`). The zone stays unseeded and comes into being
only when a deliverable is requested; like `__callbell__/_import/` it must not grow without bound, and clearing it is a
deletion that needs approval.

## `__callbell__/_backlog/`: the operational work trail
Epics, stories, and tasks. Unlike `_import`/`_export`, it **carries frontmatter** (the backlog types) and
is versioned. This zone exists from the start with its index `BACKLOG.md`, which loads at session start
through the hook (the counterpart to `MEMORY.md`). `__callbell__/_import/` is likewise ready from the start (a volatile
raw zone, see above); only `__callbell__/_export/` comes into being on request (the agent files nothing there on its
own). The backlog's flow, location, and life cycle are set by `callbell-backlog`.

## Boundaries
- Zones carry **no** type prefix and (except `__callbell__/_backlog/`) no frontmatter.
- No bulk or media storage: large or changing binary files belong in a file store or Git LFS, not in a
  zone. Volatile inputs go to `__callbell__/_import/`.
- The `_` prefix also marks a few root-level backbone **config files** (for example `_user-language.md`):
  agent-known, outside the typed filing, sorted to the top of the root. These are files, not zones, so the
  zone rules above do not apply to them; they follow their own purpose.
