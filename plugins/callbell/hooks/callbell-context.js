#!/usr/bin/env node
'use strict';

// SessionStart hook, compatible with Claude Code AND OpenAI Codex.
// Builds the session context and writes it to stdout; both harnesses inject
// SessionStart stdout as context.
//
//   Claude: registered by the plugin itself, via hooks/callbell-hooks.json (WITHOUT --rules).
//           Root via $CLAUDE_PROJECT_DIR. Injects the memory index __callbell__/memory/MEMORY.md
//           and the backlog index __callbell__/backlog/BACKLOG.md.
//           On Claude the project's own rules do NOT come from here, but natively from .claude/rules/
//           (otherwise duplicate context).
//   Codex:  registered by the plugin too, through the `hooks` entry in .codex-plugin/plugin.json.
//           Until 0.134.0 Codex ran no plugin-local hooks at all (openai/codex#16430), which is why the
//           README used to ask the user for a config-layer entry in ~/.codex/hooks.json carrying --rules.
//           The runtime has caught up: field-verified on 2026-07-20, plugin 0.1.18, Codex on Windows.
//           The manual entry is therefore gone, and --rules is only honoured for anyone still running one.
//           One gate is left, and it has no Claude equivalent: a plugin-bundled hook is non-managed, so
//           Codex skips it until the user trusts it via `/hooks`. Trust hangs on the hash of the hook
//           DEFINITION — the command entry in callbell-hooks.json — NOT of this script's contents. So an
//           update that only changes this file keeps the trust: verified 2026-07-21 against Codex's hook
//           docs (learn.chatgpt.com/docs/hooks) and the owner's own install, where plugins auto-update and
//           the hook stays trusted across versions. The gate therefore costs ONCE, at the very first install
//           before the first trust — a version bump does not re-trigger it. It would return only if the
//           command string in callbell-hooks.json changed, so that string stays fixed. For that one
//           first-ever session before any trust, nothing injected here may be a precondition for a skill.
//           Root via stdin JSON {cwd}. Codex has no Markdown rules folder, so the norms from
//           .claude/rules/ are injected here as well.
//   Plugin (ambient mode): installed per device and started in an arbitrary or empty folder.
//           Two roots then. Project STATE (context, memory, backlog) still comes
//           from the project cwd, only if present. The always-on PAYLOAD (rules + AGENTS.md ruleset)
//           comes from ${CLAUDE_PLUGIN_ROOT}/${PLUGIN_ROOT} when the project carries none of its own.
//           Project-local always wins, so a real project never double-loads its rules.
//           The plugin's rules come in two groups: rules/core/ always, rules/scaffold/ only where
//           __callbell__/ exists. A repo without a scaffold is not billed for norms it cannot use.
//
// Scope deliberately narrow: the memory index and the backlog index (open work state). The individual
// backlog files, templates, and deeper framework.md stay on demand (cascade), not always on. Purpose
// and roles are not here at all — they live in the user's own AGENTS.md, which the host already loads.
//
// YAML frontmatter and pure @-import lines are stripped.

const fs = require('fs');
const path = require('path');

// Set when running as a plugin: the plugin's own root, carrying the bundled always-on payload.
// Claude exposes CLAUDE_PLUGIN_ROOT; Codex exposes PLUGIN_ROOT (and the legacy alias). Empty otherwise.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';

// Which host is this? Codex sets its own PLUGIN_ROOT plus CLAUDE_PLUGIN_ROOT for compatibility; Claude
// sets only the latter. PLUGIN_ROOT on its own is therefore the marker. The test used to be
// `PLUGIN_ROOT && !CLAUDE_PLUGIN_ROOT`, which is never true anywhere: the negation was the defect, not
// the variable. It was then replaced by the --rules flag, which held only as long as Codex was
// registered by hand. Registered by the manifest, the same flagless hooks.json serves both hosts, and
// the flag silently made every Codex session look like Claude. The flag stays honoured for a user who
// still runs the old manual entry.
const codexHost = !!process.env.PLUGIN_ROOT || process.argv.includes('--rules');

function resolveRoot() {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  if (!process.stdin.isTTY) {
    try {
      const raw = fs.readFileSync(0, 'utf8');
      const payload = raw ? JSON.parse(raw) : null;
      if (payload && typeof payload.cwd === 'string' && payload.cwd) return payload.cwd;
    } catch { /* no or invalid JSON on stdin -> fallback */ }
  }
  return process.cwd();
}

const root = resolveRoot();

// Two independent questions, two answers. They used to be welded into one word, which typed a
// documentation-heavy software repo as `code` and let the structural payload arrive anyway, ungated.
//
//   The LENS  — what kind of repo is this: primarily executable code, or primarily markdown steering a
//               topic? It picks the ladder rungs and the shortcut-comment syntax. Lens-bearing skills read
//               it instead of detecting per skill.
//   The SCAFFOLD — is there a `__callbell__/` here at all? Nothing else can answer it, and the rule
//               injection gates on it.
//
// A repo can be any combination: a software project run with agents is `code` WITH a scaffold, and that is
// exactly the case the fused version got wrong.
function markdownHeavy(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return false; }
  const files = entries.filter(e => e.isFile() && !e.name.startsWith('.'));
  if (files.length < 3) return false;
  const md = files.filter(e => /\.(md|markdown)$/i.test(e.name)).length;
  return md * 2 > files.length; // majority markdown, no recursion (root only, cheap)
}

// One fact, no inference: is there a scaffold in this folder?
function hasScaffold(dir) {
  try { return fs.statSync(path.join(dir, '__callbell__')).isDirectory(); }
  catch { return false; }
}

// Derived, never declared. A stored lens needs somewhere to live and someone to keep it true, and both
// cost more than the heuristic is worth: `/callbell:start` reports what is missing by looking at the
// files, so nothing here depends on a field a user could leave stale.
//
// Code markers first: a markdown-only root would otherwise fall through to markdownHeavy -> ops.
function resolveProjectType(dir) {
  const has = p => fs.existsSync(path.join(dir, p));
  const codeMarkers = ['package.json', 'tsconfig.json', 'pyproject.toml', 'requirements.txt',
    'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'src'];
  if (codeMarkers.some(has)) return 'code';
  if (markdownHeavy(dir)) return 'ops';
  // A scaffold with no code markers is someone steering a topic in markdown. markdownHeavy alone misses
  // this: a steering repo whose root holds only AGENTS.md and CLAUDE.md has too few files to count.
  if (hasScaffold(dir)) return 'ops';
  return 'unknown';
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
// than the tail. Measured 2026-07-18 (Claude Code 2.1.214) by bisection with a throwaway hook, verified by
// asking a tool-less session to quote a marker at the end of the output: everything up to 10 001 characters
// arrives, 10 025 does not. It counts characters, not lines — 9 000 characters over 3 000 lines still
// arrive. BUDGET keeps a margin under that for the wrapper the harness adds around our text.
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

// The two facts, emitted once each. Lens-bearing skills (callbell and the review/audit/debt family) read
// PROJECT TYPE instead of detecting the type themselves.
//
// Plus, when running as a plugin, the resolved plugin root. A skill that has to run a bundled script
// cannot name one: `${CLAUDE_PLUGIN_ROOT}` is substituted in HOOK COMMANDS ONLY, and skill markdown is
// prompt text the host passes through verbatim, so on Codex the agent receives the literal and the call
// fails (field-checked 2026-07-20, it cost `start` its scaffold step). Here the value is real, already
// substituted by the host, and correct for the running version, so one line hands it to every skill.
const projectType = resolveProjectType(root);
const scaffold = hasScaffold(root);
push([
  projectType === 'unknown'
    ? 'PROJECT TYPE: unknown (noch keine Code- oder Ops-Marker; leite ihn aus der anstehenden Aufgabe ab)'
    : 'PROJECT TYPE: ' + projectType,
  scaffold
    ? 'CALLBELL SCAFFOLD: yes (__callbell__/ ist vorhanden; seine Normen sind in Kraft)'
    : 'CALLBELL SCAFFOLD: no (kein __callbell__/ hier, also kein Backlog, keine Zonen und keine Memory-Ebene; die Normen, die sie regeln, sind nicht geladen und gelten nicht)',
  ...(pluginRoot ? ['CALLBELL PLUGIN ROOT: ' + pluginRoot.split(path.sep).join('/')
    + ' (mitgelieferte Skripte und Templates liegen hier)'] : []),
].join('\n'));

// Project STATE, and only the two indices. Purpose and roles live in the user's own AGENTS.md, which the
// host loads natively — carrying a second copy of them from here would double the payload and give the
// two a way to disagree.
const stateFiles = [
  path.join(root, '__callbell__', 'memory', 'MEMORY.md'),
  path.join(root, '__callbell__', 'backlog', 'BACKLOG.md'),
].filter(f => fs.existsSync(f));

const state = section(stateFiles, root);
if (state.length) {
  push('Projektstatus (automatisch beim Sitzungsstart geladen: der Memory-Index und der Backlog-Index):');
  push(state.join('\n\n'));
} else if (pluginRoot) {
  push('In diesem Ordner ist noch kein callbell-Projekt eingerichtet (Ambient-Modus). Skills und Regeln sind überall aktiv, aber dieser Ordner hat kein Backlog und kein Memory. `/callbell:start` richtet eines ein: erstellt das Gerüst und meldet es und fragt nach git, Ruleset und Zweck.');
}

// Always-on payload: the rules (norms) and the minimal AGENTS.md ruleset.
//
// Precedence runs PER FILE, not all-or-nothing. The all-or-nothing version had a silent failure mode
// that cost the user everything: a repo carrying a single unrelated rule of its own took the project
// branch, and on Claude (which passes no --rules) that branch emits nothing — so every callbell norm
// vanished because the user had written one rule. Now a project rule only displaces the plugin rule
// of the SAME file name, which is what "project-local wins" was always meant to mean, and the case it
// exists for (a repo pinning its own copy of a callbell rule) still works.
//
// Who reads what, since it resolves per host: Claude reads project .claude/rules/ natively and must
// therefore never receive them from here, or they arrive twice. Codex reads nothing natively and gets
// them from here. The plugin's own rules have no native reader anywhere and are injected on both.
const projectRules = collect(path.join(root, '.claude', 'rules'));
if (codexHost && projectRules.length) {
  // Pointed at, not injected, for the same reason as the plugin's own rules below: a project's rule set
  // has no size limit either, and the agent can open a file that sits in the repo it is working in.
  push('Projekt-Normen. Lies diese Dateien JETZT, bevor du antwortest, und befolge sie die ganze '
    + 'Sitzung über:\n' + projectRules.map(f => '- ' + f.split(path.sep).join('/')).join('\n'));
}
if (pluginRoot) {
  // The rules are POINTED AT, not injected. A pointer costs ~80 characters where a body costs ten
  // thousand, so the budget stops being a constraint and the norms can grow to any size.
  //
  // This replaced inlining on 2026-07-19, after folding seven core rules into one produced a file
  // larger than the entire budget — it could never be inlined, so the norms were resident nowhere.
  // Verified before adopting: a hook emitting nothing but `Lies <path>` was followed, including
  // through a three-file chain where each file pointed at the next.
  //
  // Both groups are read NOW; they differ only in WHEN they apply at all:
  //   core/     — always.
  //   scaffold/ — only where a __callbell__/ exists, because a repo without one cannot act on them.
  //               Where it does exist they are as binding as the core, so they are not deferred.
  //
  // The absolute path comes from the host's own substitution of CLAUDE_PLUGIN_ROOT / PLUGIN_ROOT, so
  // the install version, the cache directory, and the host are all irrelevant here.
  const owned = new Set(projectRules.map(f => path.basename(f)));
  const abs = f => f.split(path.sep).join('/');
  const kernel = collect(path.join(pluginRoot, 'rules', 'core'))
    .filter(f => !owned.has(path.basename(f)));
  // Scaffold norms apply only where a scaffold exists, but where it does they are read now like the
  // core, not deferred to on-arrival.
  const scaffoldRules = scaffold
    ? collect(path.join(pluginRoot, 'rules', 'scaffold')).filter(f => !owned.has(path.basename(f)))
    : [];
  const readNow = kernel.concat(scaffoldRules);

  if (readNow.length) {
    push('Callbell-Normen. Lies diese Dateien JETZT, bevor du antwortest, und befolge sie die ganze '
      + 'Sitzung über:\n' + readNow.map(f => '- ' + abs(f)).join('\n'));
  }
  // The AGENTS.md ruleset auto-merges natively only inside the project tree; the plugin's copy sits
  // outside it, so inject it here — but only when the project carries no root ruleset of its own,
  // which the host has then already loaded.
  const hasOwnRuleset = ['AGENTS.md', 'CLAUDE.md'].some(f => fs.existsSync(path.join(root, f)));
  const ruleset = path.join(pluginRoot, 'AGENTS.md');
  if (!hasOwnRuleset && fs.existsSync(ruleset)) {
    const body = bodyOf(ruleset);
    if (body) push('Projekt-Ruleset (aus AGENTS.md):\n' + body);
  }
}

const out = blocks.join('\n\n');
// A guarantee, not a hope: nothing leaves this script over budget. If a future edit adds an unbudgeted
// path, this catches it here rather than in a user's session where the symptom is silence.
if (out.length > BUDGET) {
  process.stderr.write('callbell: Payload ' + out.length + ' über Budget ' + BUDGET + ', abgeschnitten\n');
  process.stdout.write(out.slice(0, BUDGET) + '\n');
} else if (out) {
  process.stdout.write(out + '\n');
}
process.exit(0);
