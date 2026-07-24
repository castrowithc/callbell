---
description: >
  A host's framework: what this machine is for, how work is done on it, and what's off-limits on it.
  Applies to everything that happens in this domain.
type: meta
edit: locked
---

# Framework: <host>

<!-- Template. Copy it to <host>/framework.md and adapt it. It describes how work is done on this
host, not what's on it. That's in the index.md beside it. -->

## What this host is for
<!-- One to three sentences. The purpose is the one thing the agent can't read off the machine, so it
comes first. Example: "Production Docker host for the customer applications. No staging, no building on
the machine." -->

## How work is done here
<!-- Only the deviations from what the pack already prescribes. What matches the baseline doesn't belong
here: writing it twice means maintaining it twice. -->

- **Maintenance window:** <!-- when reboots and updates are allowed, or "anytime" -->
- **Who decides:** <!-- who approves before anything destructive runs -->
- **Quirks:** <!-- what's different on this machine than usual and would otherwise trip an agent up -->

## What's off-limits here
<!-- Concrete and named. A list of paths, services, or operations not to touch, even when technically
reachable. Leaving it empty is allowed, guessing is not. -->

## References
- `index.md`: this host's inventory, what runs on it and how it's built.
