---
paths: ["**/*"]
description: >
  References sparingly and unambiguously: whole files only, nothing already loaded,
  content and docs never point to the meta level, and every reference states its reading obligation.
type: rule
edit: locked
---

# References: when and how to point to other files

Every reference creates maintenance load: when a path or name changes, it has to be updated everywhere.
So keep them sparse and follow fixed rules.

- **Reference whole files only,** never a line or a section (it breaks on every change); within a file,
  "above" or "below" is enough.
- **Reference a file at most once** in the same document.
- **Do not link anything that is always in context anyway** (automatically injected files); a pointer to
  it is redundant.
- **Rules do not duplicate one another;** each rule is self-contained in substance. A backbone rule may
  name a sister rule by its **slug** (`callbell-zones`, `callbell-governance`, and so on) when that rule
  owns the topic. Slugs are stable. Never point to the path, line, or section of another rule, and never
  split a topic artificially just to link it. If something truly belongs in one file, it is merged, not
  linked.
- **Content and docs never point to the meta level.** Content and documentation files do not reference
  governance or framing files (`AGENTS.md`, rules, skills). Dependencies run only from meta to content
  (downward), never back. That way a governance rework breaks no content file, and content stays
  self-contained.
- **Do not create references on your own initiative;** only when the target file is genuinely needed for
  the task. When in doubt, no reference.
- **Every reference states its reading obligation:**
  - Required reading: "Before you do X, read `file.md`."
  - Only when needed: "Details in `file.md` when needed."
  - Not automatic: "Open only if you actually do Y."
