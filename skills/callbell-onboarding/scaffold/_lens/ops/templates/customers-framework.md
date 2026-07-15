---
description: >
  How work is done in the customer area: identification, search, filing per customer, and the
  data guardrails. An overlay for the area, applies and is read when work happens there.
type: meta
edit: locked
---

# Framework: Customers

<!-- Template. Copy it to <area>-customers/framework.md (for example business-customers/framework.md)
and adapt it. It describes how work is done in the customer area. -->

## Identification
- A customer is identified by **<ID scheme> + short name** (for example a case or customer number plus a
  descriptive short name). Set the scheme here once.
- One subfolder `<id>/` per customer with an `index.md` as the header; further files below it follow the
  general filing rules.

## Search
- Search first by the `<id>` (unique), then by the short name. When unclear, ask instead of guessing.

## Filing per customer
- `<id>/index.md`: the customer's master record (short name, status, what it is about). **No** contact
  data.
- Cases, facts, decisions as typed files under `<id>/` (see `callbell-filing`).

## Data guardrails
- **No contact data** (address, phone, email, payment data) in the repo, not even when it is posted by
  accident. The agent points it out and does not take it in.
- Master data and communication live in the source system (CRM/mailbox); here only what is needed for
  planning (see `callbell-data-protection`).
