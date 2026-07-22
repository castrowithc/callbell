---
paths: ["**/*"]
description: >
  The norms that apply in every callbell repo, regardless of scaffold and type: naming and format
  conventions, data protection, git routine, roles and approvals, interaction language, references, and
  writing style.
type: rule
edit: locked
---

# General global callbell rules

These rules supplement the user's and NEVER replace them (CLAUDE.md | AGENTS.md). The user's rules take precedence.
Some may be relaxed or superseded by skills pursuing a specific purpose.

---

## Names and format: conventions

- All names: kebab-case, pure ASCII, no umlauts, no spaces (Müller becomes `mueller`).
  Applies to ALL folder and file names, and only those.
- Date format: ISO `YYYY-MM-DD`. Chronological files may begin with the date
  (`YYYY-MM-DD-topic.md`) and sort themselves correctly that way.

Domain IDs (e.g. case or customer numbers) belong locally to their topic, not globally in the repo.

---

## Data protection

Treat the repo as if it were public:
- The versioned repo carries planning, knowledge, and structure,
  never personal raw data.
- No personal or contact data in versioned files (names bound to a person,
  addresses, phone, email, ID or payment data). Not in memory either.
- Domain identifiers stay local to the topic that needs them (e.g. a case or customer number
  in the part of the repo it belongs to), never scattered globally. Where the repo has a local structure for
  such an entity, that structure sets how the entity is identified.

### Identifying an entity

When filed material belongs to a customer, project, or topic, identify it in this order
and share your choice in every case:

1. Use the existing identifier (a customer number, case number, or the local structure's own
   key).
2. Otherwise read the running context: if the conversation already concerns a specific customer, a specific
   project or topic in the repo, the agent recognizes that and sets the matching identifier.
3. Otherwise ask, so the document is filed correctly and not guessed.

---

## Git routine

Goal: the repo stays in a safe and tidy state at all times. The agent handles git carefully, checks the
state on its own, and reports anything unusual before acting.

### Session start (always)

- `git fetch`, to see what has come in.
- Check `git status` and the divergence from `origin/main`: are there local changes, is the branch
  ahead or behind, are conflicts likely?
- If everything is clean and fast-forward: `git pull` (prefer `--ff-only`). On conflicts or
  unexpected divergence, don't merge blindly, report first.
- Secure uncommitted changes before the pull (commit or stash), so nothing is lost.

### Safety

- No `push --force`
- Rewriting history that's already shared only when the user explicitly wants it, and only within the given scope.
- NEVER commit secrets, credentials, or personal data (see Data protection).
- Never use a real name or a real email from the harness in commits or content.
- When in doubt or on conflicts, stop and ask the user rather than guess.

### Large files (binaries)

- If a stable binary has to go into the repo, it goes through **Git LFS**,
  which replaces the file with a pointer and keeps the history lean.
- When the agent proposes this, it names the prerequisites: `git-lfs` must be installed on every machine.
  The path mapping lives in `.gitattributes` and travels with the repo.

---

## Collaboration: roles and approvals

- The user decides and reviews, the agent executes. The agent works in a structured way and largely
  on its own, but within a scope the user approves.
- The agent doesn't dress up answers unnecessarily. It stays focused, phrases things clearly,
  answers compactly, and gets to the point. The user asks for more when something is unclear.
- The agent uses bold formatting sparingly. It isn't replaced by something else.

### Only after approval

- Structure or schema changes: new structural elements (folders, zones, areas, or topics), renaming
  or moving folders, relaxing or tightening a rule.
- Moving drafts (`status: draft`) into the active state.
- Deletions and anything with outward effect.

### Speak up: decide or ask

- Communication is the norm, not the last resort. The agent asks actively as soon as it hits
  something that needs the user. It doesn't sit out a blocker and doesn't guess its way past it.
- When the work raises a decision the plan didn't cover, the criterion isn't the
  size of the decision but whether something builds on it before the user sees it. A wrong
  decision nothing rests on costs one edit; a wrong decision that becomes the foundation
  costs everything built on it since.
- Decide and record it when nothing in the same run depends on it and the agent is sure
  what the user would want.
- Stop and ask when anything depends on it or there's genuine doubt.
- Confidence alone is never enough, because an agent feels sure even when it isn't. The protection
  comes from joining both conditions: once something builds on the decision, ask, no matter how
  sure it feels. Cosmetic corrections are exempt.

### Recognize the schema, don't change it on your own

The agent notices when the given schema no longer holds: a document fits nowhere cleanly, a
folder overflows, a rule is too narrow or too wide. Then it proposes the adjustment and waits for
approval. It never decides this alone.

### Traceability

Results are filed and presented so the user can follow them by hand:
structured, but not overloaded.

---

## Interaction language

Chat and visible reasoning always follow the user's language. Take it from what they
write, from the first message.

Beyond the session, the user holds this language themselves: a single line in their machine-local
agent file (Claude `~/.claude/CLAUDE.md`, Codex `~/.codex/AGENTS.md`). It's a per-user property
across all projects, never belongs in the repo, and **callbell doesn't manage this file**; the README tells
the user how to set the line.

---

## References: when and how to point at other files

Every reference creates maintenance load: if a path or name changes, it breaks and has to be updated everywhere.
So keep them sparse and follow fixed rules.

- Reference whole files only, NEVER a line or a section (that breaks on every
  change).
- Reference the same file at most once in the same document.
- Don't link anything that's always in context anyway (auto-injected files); a pointer
  to it is redundant.
- Rules don't duplicate each other. Each rule is self-contained in content. Slugs are stable. Never point at the path, line, or section of
  another rule, and never split a topic artificially just to link it. If something really belongs in one
  file, it's merged, not linked.
- Content and docs never point at the meta level. Content and documentation files don't reference
  governance or framing files (`AGENTS.md`, rules, skills). Dependencies run only from the meta level
  to content (downward), never back. So a governance rebuild breaks no content file, and content
  stays self-contained.
- Don't create references on your own initiative. Only when the target file is really needed
  for the task. When in doubt, no reference.
- Every reference names its reading obligation:
  - Required reading: "Before you do X, read `file.md`."
  - Only as needed: "Details as needed in `file.md`."
  - Not automatic: "Only open if you actually do Y."

---

## Writing style when creating files

Applies to every file the agent creates or writes (Markdown, text, Excel, PDF, and so on), in
any format. The reply in the chat is not affected.

- No em dashes or en dashes (— | –) as punctuation. Build sentences from the start so
  none is needed (period, comma, colon). Sentences should sound natural and human.
- German output with real umlauts. Where German is expected, write ä, ö, ü, and ß directly,
  not transcribed as ae, oe, ue, or ss. That reads strongly unnatural.

---

## Different repo types

Callbell distinguishes between dev and ops projects, which the agent must know:
- Dev: classic code bases. May also hold text files as a project wiki or project docs.
- Ops: text-heavy repos like personal OS, business OS, wikis, markdown RAGs.
  May hold code, e.g. as script templates, code documentation, code snippets.
  But also as an operational main repo plus a sub-repo that's gitignored. That brings the advantage that the
  operational layer can live as a private remote repo, while the sub-repo is gitignored and public on its remote.
