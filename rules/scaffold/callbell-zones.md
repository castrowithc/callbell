---
paths: ["**/*"]
description: >
  The two I/O zones (zone-import, zone-export): volatile, gitignored buffers for material coming in and
  going out, marked by the zone- prefix and sitting outside the versioned state. Backbone, every repo.
type: rule
edit: locked
---

# Zones

A **zone** is a volatile, gitignored **I/O buffer** inside `__callbell__/`: a place where raw material
comes in or a finished deliverable goes out, never part of the versioned knowledge base. There are exactly
two, and they carry the `zone-` prefix so they stand apart from the versioned managed state (`context/`,
`memory/`, `templates/`, `backlog/`) that fills the rest of `__callbell__/`. They are backbone: they exist
in every repo, ready from the start (kept through `.gitkeep`), and the agent knows them by name, so the
human sorts nothing.

The `backlog/` is **not** a zone: it is versioned, carries frontmatter, and is the operational work trail,
governed by `callbell-backlog`. It belongs with the managed state, not with these buffers.

## `__callbell__/zone-import/`: inbound (user to agent)
Raw inputs the user hands to the agent: CSV, PDF, images, notes, exports from other systems. The agent
converts them to Markdown when needed and files the redacted result in its proper place.
`__callbell__/zone-import/` itself is **volatile and free of frontmatter**, not part of the knowledge base,
and gitignored (the template `.gitignore` enforces this; the folder stays through `.gitkeep`, its content
is not versioned).

The full ingest procedure (recognize, convert, redact, identify, file, archive) is set by the skill
`callbell-import`; redaction of sensitive data is set by `callbell-data-protection`. A consumed original
moves into the archive `__callbell__/zone-import/processed/<yyyy-mm>/`, one bucket per month, still volatile
and unversioned. This zone **must not grow without bound**: archiving an original is routine, but **purging
a bucket is a deletion** and needs approval (see `callbell-governance`), so an old month is cleared only on
request.

## `__callbell__/zone-export/`: outbound (agent to user)
Finished deliverables the user requests for use outside the repo (reports, extracts, exports), a single
file or a whole folder of them. **Only on explicit request**, free of frontmatter, not part of the
knowledge base. The folder is ready from the start (kept through `.gitkeep`), but the agent files nothing
here on its own. `__callbell__/zone-export/` is **gitignored** like `__callbell__/zone-import/`: a
deliverable often carries exactly the real, unredacted data the user wants to take out, which must never
enter the versioned repo (see `callbell-data-protection`). Like `__callbell__/zone-import/` it must not
grow without bound, and clearing it is a deletion that needs approval.

## Boundaries
- A zone carries **no** frontmatter and its content is **never** versioned; the `zone-` prefix is its only
  marker.
- No bulk or media storage: large or changing binary files belong in a file store or Git LFS, not in a
  zone. Volatile inputs go to `__callbell__/zone-import/`.
- The two zones sit beside the versioned managed state (`context/`, `memory/`, `templates/`, `backlog/`);
  the `zone-` prefix is what tells a buffer apart from that state.
