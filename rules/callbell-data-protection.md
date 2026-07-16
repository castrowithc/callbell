---
paths: ["**/*"]
description: >
  Assume the repo is public; no personal or contact data in versioned files; imports are redacted on
  intake and every redaction is reported; master data belongs in the source system; domain IDs stay local.
type: rule
edit: locked
---

# Data Protection

## Assume public
Treat the repo as if it may be published. The versioned repo holds planning, knowledge, and structure,
never personal raw data. Only when `repo.md` states the repo is private does that describe the current
posture, and even then it is **no license to relax**: visibility can change, Git history persists, and a
private repo can be shared later. The norms below hold either way.

- **No personal or contact data in versioned files** (names tied to a person, addresses, phone, email, ID,
  or payment data). Not in memory either. This is the invariant that "assume public" protects.
- **Communication and master data live in their source system** (CRM, mailbox, line-of-business app), not
  here. At most the repo refers to it neutrally.
- **Domain-specific identifiers stay local** to the topic that needs them (for example a case or customer
  number in the part of the repo that owns it), never scattered globally. Where the repo has a local
  structure for such an entity, that structure defines how the entity is identified.

## Intake and redaction
The user may deliberately drop material with personal data into `__callbell__/zone-import/` for the agent to process (see
`callbell-zones`, `callbell-import`). `__callbell__/zone-import/` is volatile and unversioned, so the raw original stays out
of the versioned repo by construction. The **converted, filed** file is where the norm is enforced:

- **Redact while converting.** Sensitive data does not flow into the filed file. Replace it in place with a
  placeholder in the document's own language, for example `[social security number redacted]` or
  `[Sozialversicherungsnummer geschwärzt]`.
- **Always report.** List every redaction so the user can decide, per file, to keep something after all.
  The agent thinks ahead for the user here; it never silently drops or silently keeps sensitive data.

## Identifying an entity
When filed material belongs to a customer, project, or topic, identify it in this order, and communicate
the choice either way:

1. **Use the existing identifier** (a customer number, case number, or the local structure's own key).
2. **Otherwise read the running context:** when the conversation already concerns one specific customer,
   project, or topic in the repo, the agent recognizes that and sets the matching identifier.
3. **Otherwise ask,** so the document can be filed correctly rather than guessed.

Where a part of the repo needs stricter rules (for example which fields may never contain personal data),
they live with that local structure, as a tightening of this norm.
