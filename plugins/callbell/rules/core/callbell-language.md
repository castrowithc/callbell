---
paths: ["**/*"]
description: >
  The interaction language is anchored in the user's machine-local agent file, never in the repo. Offer it
  once when none is set and the user writes in another language; write only on confirmation.
type: rule
edit: locked
---

# Interaction Language

Chat and visible reasoning follow the **user's** language, always. Adopt it from what they write, from the
first message, whether or not it is anchored anywhere.

An **anchor** is what makes that survive the session: one plain line in the user's machine-local agent file
(Claude `~/.claude/CLAUDE.md`, Codex `~/.codex/AGENTS.md`). It is a per-user, cross-project property and
never belongs in the repo.

- **Offer when** the user writes in a language other than English **and** no anchor is set: either the
  session reports `NO LANGUAGE ANCHOR`, or that file is in your context and names no language.
- **Once.** One offer per session; if the user declines or ignores it, drop it and do not raise it again.
- **Write only on confirmation** — it is a file outside the repo. Add the single line, in the user's own
  language (German: `Antworte mir immer auf Deutsch (Chat und sichtbares Reasoning).`). No heading, no
  branding: it is their file. Create it if missing; if it already names a language, change nothing.
