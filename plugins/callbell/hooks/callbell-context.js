#!/usr/bin/env node
'use strict';

// SessionStart hook, compatible with Claude Code AND OpenAI Codex.
// Builds the session context and writes it to stdout; both harnesses inject SessionStart stdout as
// context. It fires on startup, resume, clear, and after a compact (see callbell-hooks.json), so the
// same payload is restored when a compact drops it out of the window.
//
//   Claude: registered by the plugin via hooks/callbell-hooks.json. Root via $CLAUDE_PROJECT_DIR.
//   Codex:  registered by the plugin through the `hooks` entry in .codex-plugin/plugin.json. Root via
//           stdin JSON {cwd}. One gate has no Claude equivalent: a plugin-bundled hook is non-managed,
//           so Codex skips it until the user trusts it via `/hooks`. Trust hangs on the hash of the hook
//           DEFINITION — the command entry in callbell-hooks.json — NOT of this script's contents, so an
//           update that only changes this file keeps the trust (verified 2026-07-21 against Codex's hook
//           docs and the owner's own install). The gate costs ONCE, at the very first install before the
//           first trust; a version bump does not re-trigger it. For that one first-ever session before
//           any trust, nothing injected here may be a precondition for a skill.
//
// WHAT THIS HOOK INJECTS — only two things, both the plugin's own or the project's own callbell state:
//   1. Two facts: is a __callbell__/ scaffold present here, and (as a plugin) where the plugin root is.
//   2. Project STATE: the memory index and the backlog index, when the scaffold carries them.
//   3. The always-on PAYLOAD: the plugin's rules (POINTED AT, not inlined) and, in a folder with no
//      ruleset of its own, the plugin's AGENTS.md.
//
// WHAT IT NEVER TOUCHES — the user's own material. Nothing from .claude/, .codex/, a project's own
// rules folder or its AGENTS.md/CLAUDE.md is ever read for content or injected. That material is the
// user's; the harness loads it natively, and duplicating it here would only spend the session budget
// twice. The single exception is a bare existence check (does a root ruleset exist at all?), used only
// to avoid doubling the plugin's own generic ruleset on top of one the host has already loaded — a file
// is never opened, a directory is never walked.
//
// The project type is deliberately NOT computed. A hook runs at the session root, but "is this a
// codebase" is answered per working path — a repo can steer in markdown here while its code lives in a
// sibling or nested repo — so any guess at the root is a guess in the wrong place. Skills that need a
// lens resolve it where they run, against the path they act on.
//
// YAML frontmatter and pure @-import lines are stripped.

const fs = require('fs');
const path = require('path');

// The scaffold top-up (used further down). Loaded defensively: an older bundle running beside a newer
// hook might not carry the shared module, and a missing top-up must never break context injection.
let scaffoldTopUp = null;
try { ({ scaffoldTopUp } = require('../scripts/callbell-scaffold-topup.js')); }
catch { /* older bundle without the shared module: skip the top-up */ }

// Set when running as a plugin: the plugin's own root, carrying the bundled always-on payload.
// Claude exposes CLAUDE_PLUGIN_ROOT; Codex exposes PLUGIN_ROOT (and the legacy alias). Empty otherwise.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';

function resolveRoot() {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  if (!process.stdin.isTTY) {
    try {
      const raw = fs.readFileSync(0, 'utf8').replace(/^﻿/, ''); // tolerate a stdin BOM
      const payload = raw ? JSON.parse(raw) : null;
      if (payload && typeof payload.cwd === 'string' && payload.cwd) return payload.cwd;
    } catch { /* no or invalid JSON on stdin -> fallback */ }
  }
  return process.cwd();
}

const root = resolveRoot();

// One fact, no inference: is there a scaffold in this folder? Nothing else can answer it, and the
// scaffold-rule injection gates on it.
function hasScaffold(dir) {
  try { return fs.statSync(path.join(dir, '__callbell__')).isDirectory(); }
  catch { return false; }
}

function collect(dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collect(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

function bodyOf(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/^﻿/, ''); // strip BOM
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');       // strip YAML frontmatter
  return text
    .split(/\r?\n/)
    .filter(line => !/^\s*@[\w./-]+\s*$/.test(line))                // strip pure @-import lines
    .join('\n')
    .trim();
}

function section(files, base) {
  const parts = [];
  for (const f of files) {
    const rel = path.relative(base, f).split(path.sep).join('/');
    const body = bodyOf(f);
    if (body) parts.push(`--- ${rel} ---\n${body}`);
  }
  return parts;
}

// The host caps what a SessionStart hook may put into the session. Over the cap it does not truncate: it
// saves the WHOLE payload to a file and shows a ~2 KB preview, so going over loses nearly everything rather
// than the tail. Measured 2026-07-18 (Claude Code 2.1.214) by bisection: everything up to 10 001 characters
// arrives, 10 025 does not. It counts characters, not lines. BUDGET keeps a margin under that for the
// wrapper the harness adds around our text.
//
// Since the rules became pointers this only governs the injected blocks that are left — the memory and
// backlog indices, and the AGENTS.md ruleset in ambient mode. Those are project state, small, and worth
// having verbatim. It stays as the guarantee at the bottom of the file, not as a live constraint.
const BUDGET = 9000;
const blocks = [];
let used = 0;

// Returns false when the block does not fit, so the caller can announce instead of inline.
function push(text) {
  const cost = text.length + 2; // the '\n\n' join
  if (used + cost > BUDGET) return false;
  blocks.push(text);
  used += cost;
  return true;
}

// The facts, emitted once each: the scaffold state, plus (when running as a plugin) the resolved plugin
// root. The root matters because a skill that has to run a bundled script cannot name one:
// `${CLAUDE_PLUGIN_ROOT}` is substituted in HOOK COMMANDS ONLY, and skill markdown is prompt text the
// host passes through verbatim, so on Codex the agent would receive the literal and the call would fail
// (field-checked 2026-07-20, it cost `start` its scaffold step). Here the value is real, already
// substituted by the host, and correct for the running version, so one line hands it to every skill.
const scaffold = hasScaffold(root);

// A scaffold that already exists is topped up to the current bundle. A plugin update can ship new template
// files, and the design is that the user need not re-run /callbell-start to get them: the gap is filled
// here and the user is told what was added, never asked, because the added files are needed. This is the
// one place the hook writes rather than only reporting; it copies only missing files, never overwrites,
// and is wrapped so a failure here never costs the context below. It is idempotent, so resume and compact
// starts are a no-op once the scaffold is current.
let toppedUp = [];
if (pluginRoot && scaffold && scaffoldTopUp) {
  try { toppedUp = scaffoldTopUp(root, path.join(pluginRoot, 'scaffold'), { apply: true }).created; }
  catch { /* a top-up failure must not break context injection */ }
}

push([
  scaffold
    ? 'CALLBELL SCAFFOLD: yes (__callbell__/ is present; its norms are in force)'
    : 'CALLBELL SCAFFOLD: no (no __callbell__/ here, so no backlog, no zones, and no memory layer; the norms that govern them are not loaded and do not apply)',
  ...(pluginRoot ? ['CALLBELL PLUGIN ROOT: ' + pluginRoot.split(path.sep).join('/')
    + ' (bundled scripts and templates live here)'] : []),
].join('\n'));

// Report what the top-up added, so the agent tells the user. Not silent (the user should know what
// changed), never a question (the files are needed, that is why they ship).
if (toppedUp.length) {
  push('SCAFFOLD TOPPED UP: a plugin update added ' + toppedUp.length + ' missing file(s) to the scaffold, '
    + 'applied automatically: ' + toppedUp.join(', ') + '. Tell the user what was added.');
}

// Project STATE, and only the two indices. Purpose and roles live in the user's own AGENTS.md, which the
// host loads natively — carrying a second copy of them from here would double the payload and give the
// two a way to disagree.
const stateFiles = [
  path.join(root, '__callbell__', 'memory', 'MEMORY.md'),
  path.join(root, '__callbell__', 'backlog', 'BACKLOG.md'),
].filter(f => fs.existsSync(f));

const state = section(stateFiles, root);
if (state.length) {
  push('Project status (loaded automatically at session start: the memory index and the backlog index):');
  push(state.join('\n\n'));
} else if (pluginRoot) {
  push('No callbell project is set up in this folder yet (ambient mode). Skills and rules are active everywhere, but this folder has no backlog and no memory. `/callbell-start` sets one up: it creates the scaffold, reports it, and asks about git, ruleset, and purpose.');
}

// Always-on payload: the plugin's own rules and, in a bare folder, its minimal AGENTS.md ruleset. Both
// are the plugin's, never the user's.
if (pluginRoot) {
  // The rules are POINTED AT, not injected. A pointer costs ~80 characters where a body costs ten
  // thousand, so the budget stops being a constraint and the norms can grow to any size. This replaced
  // inlining on 2026-07-19; verified that a hook emitting nothing but `Read <path>` is followed, including
  // through a chain where each file points at the next. The plugin's rules have no native reader on either
  // host, so they are injected on both — a project's own .claude/rules/ are the user's and are not.
  //
  // Both groups are read NOW; they differ only in WHEN they apply at all:
  //   core/     — always.
  //   scaffold/ — only where a __callbell__/ exists, because a repo without one cannot act on them.
  //               Where it does exist they are as binding as the core, so they are not deferred.
  //
  // The absolute path comes from the host's own substitution of CLAUDE_PLUGIN_ROOT / PLUGIN_ROOT, so the
  // install version, the cache directory, and the host are all irrelevant here.
  const abs = f => f.split(path.sep).join('/');
  const kernel = collect(path.join(pluginRoot, 'rules', 'core'));
  const scaffoldRules = scaffold ? collect(path.join(pluginRoot, 'rules', 'scaffold')) : [];
  const readNow = kernel.concat(scaffoldRules);

  if (readNow.length) {
    push('Callbell norms. Read these files NOW, before you answer, and follow them for the whole '
      + 'session:\n' + readNow.map(f => '- ' + abs(f)).join('\n'));
  }
  // The AGENTS.md ruleset auto-merges natively only inside the project tree; the plugin's copy sits
  // outside it, so inject it here — but only when the project carries no root ruleset of its own, which
  // the host has then already loaded. This is an existence check, not a read of the user's file.
  const hasOwnRuleset = ['AGENTS.md', 'CLAUDE.md'].some(f => fs.existsSync(path.join(root, f)));
  const ruleset = path.join(pluginRoot, 'AGENTS.md');
  if (!hasOwnRuleset && fs.existsSync(ruleset)) {
    const body = bodyOf(ruleset);
    if (body) push('Project ruleset (from AGENTS.md):\n' + body);
  }
}

const out = blocks.join('\n\n');
// A guarantee, not a hope: nothing leaves this script over budget. If a future edit adds an unbudgeted
// path, this catches it here rather than in a user's session where the symptom is silence.
if (out.length > BUDGET) {
  process.stderr.write('callbell: payload ' + out.length + ' over budget ' + BUDGET + ', truncated\n');
  process.stdout.write(out.slice(0, BUDGET) + '\n');
} else if (out) {
  process.stdout.write(out + '\n');
}
process.exit(0);
