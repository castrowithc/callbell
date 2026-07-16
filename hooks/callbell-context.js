#!/usr/bin/env node
'use strict';

// SessionStart hook, compatible with Claude Code AND OpenAI Codex.
// Builds the session context and writes it to stdout; both harnesses inject
// SessionStart stdout as context.
//
//   Claude: registered in .claude/settings.json (WITHOUT --rules).
//           Root via $CLAUDE_PROJECT_DIR. Injects the context from __callbell__/context/,
//           the memory index __callbell__/memory/MEMORY.md and the backlog index __callbell__/backlog/BACKLOG.md.
//           On Claude the rules do NOT come from here, but natively from .claude/rules/
//           (otherwise duplicate context).
//   Codex:  registered in .codex/hooks.json WITH --rules.
//           Root via stdin JSON {cwd}. Codex has no Markdown rules folder, so
//           the norms from .claude/rules/ are injected here as well.
//   Plugin (ambient mode): installed per device and started in an arbitrary or empty folder.
//           Two roots then. Project STATE (context, memory, backlog) still comes
//           from the project cwd, only if present. The always-on PAYLOAD (rules + AGENTS.md ruleset)
//           comes from ${CLAUDE_PLUGIN_ROOT}/${PLUGIN_ROOT} when the project carries none of its own.
//           Project-local always wins, so a real project never double-loads its rules.
//
// Scope deliberately narrow: only __callbell__/context/ (onboarding facts, a dynamic complement to
// rules/skills), the memory index, and the backlog index (open work state). The individual
// backlog files, templates, and deeper framework.md stay on demand (cascade), not always on.
//
// YAML frontmatter and pure @-import lines are stripped.

const fs = require('fs');
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

// The lens: resolve the project type once per session, so lens-bearing skills read it
// instead of detecting per skill. Primary = the durable answer onboarding records in
// repo.md frontmatter; fallback = zero-config filesystem detection (for the window before
// onboarding has run, and for the plugin's ambient mode in an arbitrary folder).
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

function resolveProjectType(dir) {
  // Primary: onboarding writes `project-type: code|ops` into repo.md frontmatter.
  const declared = frontmatterOf(path.join(dir, '__callbell__', 'context', 'repo.md'))
    .match(/^project-type:\s*(code|ops)\b/mi);
  if (declared) return declared[1].toLowerCase();
  // Fallback: filesystem markers.
  const has = p => fs.existsSync(path.join(dir, p));
  const codeMarkers = ['package.json', 'tsconfig.json', 'pyproject.toml', 'requirements.txt',
    'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle', 'Gemfile', 'composer.json', 'src'];
  if (codeMarkers.some(has)) return 'code';
  // Positive structural marker of the pristine templates, before any user content exists:
  // devcore ships __callbell__/docs/framework.md, opscore ships __callbell__/framework.md.
  // Check devcore's first, else its markdown-only root would fall through to markdownHeavy -> ops.
  if (has('__callbell__/docs/framework.md')) return 'code';
  if (has('__callbell__/framework.md') || markdownHeavy(dir)) return 'ops';
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

const blocks = [];

// Interaction language now lives natively in AGENTS.md / CLAUDE.md (onboarding writes it there), so the
// hook no longer injects it. Both harnesses load those root files on their own.

// The lens, emitted once. Lens-bearing skills (callbell and the review/audit/debt family) read
// this line instead of detecting the type themselves.
const projectType = resolveProjectType(root);
blocks.push(projectType === 'unknown'
  ? 'PROJECT TYPE: unknown (no code or ops markers yet; derive it from the task, onboarding sets it durably)'
  : 'PROJECT TYPE: ' + projectType);

const contextFiles = collect(path.join(root, '__callbell__', 'context'));
const memoryIndex = path.join(root, '__callbell__', 'memory', 'MEMORY.md');
if (fs.existsSync(memoryIndex)) contextFiles.push(memoryIndex);
const backlogIndex = path.join(root, '__callbell__', 'backlog', 'BACKLOG.md');
if (fs.existsSync(backlogIndex)) contextFiles.push(backlogIndex);

const context = section(contextFiles, root);
if (context.length) {
  blocks.push('Way of working & context (loaded automatically at session start from __callbell__/context/, the memory index, and the backlog index):');
  blocks.push(context.join('\n\n'));
} else if (pluginRoot) {
  blocks.push('No callbell project set up in this folder yet (ambient mode). Skills and rules are active everywhere; run /callbell-onboarding to turn it into a persistent project (it sets the interaction language in AGENTS.md and lays down context, memory, and backlog).');
}

// Always-on payload: the rules (norms) and the minimal AGENTS.md ruleset. Project-local always
// wins; the plugin root is the fallback for ambient mode (an arbitrary or empty folder that carries
// no scaffold of its own). Claude reads project .claude/rules/ natively, so only a host without a
// native rules dir passes --rules (Codex). The plugin-root fallback has no native reader on either
// host, so it injects for both and needs no flag.
const projectRules = collect(path.join(root, '.claude', 'rules'));
if (projectRules.length) {
  if (withRules) {
    const rules = section(projectRules, root);
    if (rules.length) {
      blocks.push('Project rules (norms, always in force):');
      blocks.push(rules.join('\n\n'));
    }
  }
} else if (pluginRoot) {
  const rules = section(collect(path.join(pluginRoot, 'rules')), pluginRoot);
  if (rules.length) {
    blocks.push('Project rules (norms, always in force):');
    blocks.push(rules.join('\n\n'));
  }
  // The AGENTS.md ruleset auto-merges natively only inside the project tree; the plugin's copy sits
  // outside it, so inject it here when the project carries none.
  const ruleset = path.join(pluginRoot, 'AGENTS.md');
  if (fs.existsSync(ruleset)) {
    const body = bodyOf(ruleset);
    if (body) blocks.push('Project ruleset (from AGENTS.md):\n' + body);
  }
}

if (blocks.length) process.stdout.write(blocks.join('\n\n') + '\n');
process.exit(0);
