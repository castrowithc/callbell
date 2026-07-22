---
description: >
  How work is done in the customers area: identification, search, per-customer filing, and the
  data-protection guardrails. An overlay for the area, in force and read when work happens there.
type: meta
edit: locked
---

# Framework: Customers

<!-- Template. Copy it to <area>-customers/framework.md (e.g. business-customers/framework.md)
and adapt it. It describes how work is done in the customers area. -->

## Identification
- A customer is identified by **<ID scheme> + short name** (e.g. a case or customer number plus a
  descriptive short name). The scheme is fixed here once.
- One subfolder `<id>/` per customer with an `index.md` as its head; further files below it follow the
  general filing rules.

## Search
- Search by the `<id>` first (unique), then by the short name. When unclear, ask rather than guess.

## Per-customer filing
- `<id>/index.md`: the customer's master record (short name, status, what it's about). **No** contact data.
- Cases, facts, decisions as typed files under `<id>/` (see `callbell-filing`).

## Data-protection guardrails
- **No contact data** (address, phone, email, payment data) in the repo, not even if it's posted by
  accident. The agent points this out and doesn't take it in.
- Master data and communication live in the source system (CRM/mailbox); here only what's needed for
  planning.
