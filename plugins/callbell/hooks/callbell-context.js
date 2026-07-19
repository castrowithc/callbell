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
//   Codex:  registered by the USER, in a config-layer ~/.codex/hooks.json, WITH --rules.
//           Not by the plugin: Codex does not execute plugin-local hooks (openai/codex#16430, open,
//           reproduced through 0.130.0; `codex features list` reports plugin_hooks as not yet enabled).
//           The bundled hooks.json is registered in the Codex manifest anyway — it is the correct
//           declaration and starts working the day the runtime catches up — but until then the
//           config-layer entry is what actually runs:
//
//             { "hooks": { "SessionStart": [ { "matcher": "startup|resume",
//               "hooks": [ { "type": "command",
//                 "command": "PLUGIN_ROOT=<install-path> node <install-path>/hooks/callbell-context.js --rules",
//                 "timeout": 5 } ] } ] } }
//
//           Because that entry sits outside any plugin, Codex sets no PLUGIN_ROOT for it and it must
//           set its own; without it the script finds no payload and injects only project state.
//           Root via stdin JSON {cwd}. Codex has no Markdown rules folder, so the norms from
//           .claude/rules/ are injected here as well.
//           Note that Codex also sets CLAUDE_PLUGIN_ROOT as a compatibility alias, so the environment
//           cannot be used to tell the two hosts apart — only the --rules flag can.
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
const os = require('os');
const path = require('path');

const withRules = process.argv.includes('--rules');
// Set when running as a plugin: the plugin's own root, carrying the bundled always-on payload.
// Claude exposes CLAUDE_PLUGIN_ROOT; Codex exposes PLUGIN_ROOT (and the legacy alias). Empty otherwise.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';

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
function frontmatterOf(file) {
  try {
    const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    return m ? m[1] : '';
  } catch { return ''; }
}

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

// The interaction language drifts against English rules unless one line in the user's machine-local agent
// file holds it — and most users do not know that file exists. So report when it does not.
//
// Only the ABSENCE of the file is reported, and only the part the agent cannot see for itself: the host
// loads that file's contents natively, so if it exists the agent reads it and judges whether it names a
// language. What the agent cannot notice is a file that was never there. Once an anchor exists this emits
// nothing, so the mechanic costs nothing after the first session. `callbell-language` says what to do.
//
// The host is told apart by the `--rules` flag, not by the environment: Codex sets CLAUDE_PLUGIN_ROOT
// as a compatibility alias alongside its own PLUGIN_ROOT, so the old `PLUGIN_ROOT && !CLAUDE_PLUGIN_ROOT`
// test was never true there and pointed Codex users at Claude's anchor file. Only the Codex
// registration passes --rules, which makes the flag the one reliable signal we control.
function missingLanguageAnchor() {
  const file = withRules
    ? path.join(os.homedir(), '.codex', 'AGENTS.md')   // Codex
    : path.join(os.homedir(), '.claude', 'CLAUDE.md'); // Claude
  try { return fs.readFileSync(file, 'utf8').trim() ? null : file; }
  catch { return file; } // missing or unreadable: same outcome for the user
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
// Everything below is assembled against this budget. What does not fit is not dropped silently: it is
// announced with its path, so the session knows the norm exists and where to read it.
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

// One line per rule that was not inlined: what it governs and where to read it. The wording comes from the
// rule's own frontmatter description, so a reworded rule updates its own pointer and the two cannot drift.
function pointer(file, base) {
  const desc = frontmatterOf(file).match(/^description:\s*>?\s*([\s\S]*?)(?=^\S|\Z)/m);
  let text = desc ? desc[1].replace(/\s+/g, ' ').trim() : '';
  if (text.length > 140) text = text.slice(0, 137) + '...';
  const rel = path.relative(base, file).split(path.sep).join('/');
  return '- ' + path.basename(file, '.md') + ' (' + rel + '): ' + text;
}

// The two facts, emitted once each. Lens-bearing skills (callbell and the review/audit/debt family) read
// PROJECT TYPE instead of detecting the type themselves.
const projectType = resolveProjectType(root);
const scaffold = hasScaffold(root);
push([
  projectType === 'unknown'
    ? 'PROJECT TYPE: unknown (no code or ops markers yet; derive it from the task at hand)'
    : 'PROJECT TYPE: ' + projectType,
  scaffold
    ? 'CALLBELL SCAFFOLD: yes (__callbell__/ is present; its norms are in force)'
    : 'CALLBELL SCAFFOLD: no (no __callbell__/ here, so no backlog, zones, or memory layer; the norms that govern them are not loaded and do not apply)',
].join('\n'));

// Reported only when absent, so this line disappears for good once an anchor exists.
const anchorFile = missingLanguageAnchor();
if (anchorFile) {
  push('NO LANGUAGE ANCHOR: ' + anchorFile.split(path.sep).join('/') +
    ' is missing or empty (see callbell-language).');
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
  push('Project state (loaded automatically at session start: the memory index and the backlog index):');
  push(state.join('\n\n'));
} else if (pluginRoot) {
  push('No callbell project set up in this folder yet (ambient mode). Skills and rules are active everywhere, but this folder has no backlog or memory. `/callbell:start` checks what is missing and lays it down — nothing is written until you ask.');
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
// them via --rules. The plugin's own rules have no native reader anywhere and are injected on both.
const projectRules = collect(path.join(root, '.claude', 'rules'));
if (withRules && projectRules.length) {
  const rules = section(projectRules, root);
  if (rules.length) {
    push('Project rules (norms, always in force):');
    push(rules.join('\n\n'));
  }
}
if (pluginRoot) {
  // Two groups, and since 2026-07-18 they mean two different things rather than two sizes.
  //
  // `core/` is the always-on KERNEL: inlined here, in the order below, for as much as the budget allows.
  // `scaffold/` is the CASCADE: never inlined, only announced. Those norms govern specific activities
  // (filing, backlog, frontmatter, zones, memory) and are read when that activity happens — the same
  // shape the framework.md cascade already has, and the reason they are the ones demoted.
  //
  // Ordered by filename. The kernel used to be seven files ranked by what it costs to be missing; they
  // have since been folded into one, so the ranking had nothing left to rank and its name list pointed
  // at files that no longer exist. Should the kernel ever split again, the order comes back with it.
  const owned = new Set(projectRules.map(f => path.basename(f)));
  const kernel = collect(path.join(pluginRoot, 'rules', 'core'))
    .filter(f => !owned.has(path.basename(f)));

  // The cascade: announced always, inlined never. Gated on the scaffold, because a repo without one
  // cannot act on these at all.
  const cascade = scaffold
    ? collect(path.join(pluginRoot, 'rules', 'scaffold')).filter(f => !owned.has(path.basename(f)))
    : [];

  // Reserve the announcement's worst case BEFORE inlining anything. Measured first without this, and the
  // announcement was the block that fell out when the budget got tight — losing the very index that says
  // which norms exist. The index is what makes deferral honest, so it is paid for first and the kernel
  // competes for what is left.
  const NOTICE = 'Callbell norms not inlined here. They are in force all the same — read the file before '
    + 'you act in its area, the way a framework.md is read on arrival:\n';
  const lines = new Map(kernel.concat(cascade).map(f => [f, pointer(f, pluginRoot)]));
  const reserve = kernel.concat(cascade).length
    ? NOTICE.length + [...lines.values()].join('\n').length + 2
    : 0;

  // The heading is only pushed once a body is known to fit behind it. Announcing "always in force" and
  // then listing nothing under it is worse than silence: it reads as though the norms arrived.
  const deferred = [];
  let heading = false;
  const HEADING = 'Callbell rules (norms from the plugin, always in force):';
  for (const f of kernel) {
    const [body] = section([f], pluginRoot);
    if (!body) continue;
    // Cost of this rule, plus the heading if it is not paid for yet.
    const cost = body.length + 2 + (heading ? 0 : HEADING.length + 2);
    if (used + cost > BUDGET - reserve) { deferred.push(f); continue; }
    if (!heading) { push(HEADING); heading = true; }
    push(body);
  }

  const announced = deferred.concat(cascade);
  if (announced.length) push(NOTICE + announced.map(f => lines.get(f)).join('\n'));
  // The AGENTS.md ruleset auto-merges natively only inside the project tree; the plugin's copy sits
  // outside it, so inject it here — but only when the project carries no root ruleset of its own,
  // which the host has then already loaded.
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
