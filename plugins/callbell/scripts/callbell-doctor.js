#!/usr/bin/env node
'use strict';

// The check behind /callbell:start. Reports what is MISSING and nothing else, so a healthy repo
// produces one line and the skill stays worth calling a fourth time.
//
// This script IS the Node check. If Node is absent the call fails, and that failure is the answer —
// on Windows, macOS, and Linux alike. Writing a shell pre-check would mean solving the bootstrap
// twice, so everything the agent needs is gathered here in one call.
//
//   node callbell-doctor.js [--apply] [--lens ops|code] [--target <dir>]
//
// Default is report-only. --apply copies in what is missing and never touches what is there:
// a user's .gitignore lines, a template they changed — all survive, because nothing is ever
// compared by content or overwritten.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const target = flag('--target') ? path.resolve(flag('--target')) : process.cwd();
const lens = ['ops', 'code'].includes(flag('--lens')) ? flag('--lens') : null;

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT
  || path.resolve(__dirname, '..');
const bundle = path.join(pluginRoot, 'scaffold');

// Findings only. Anything already in place is deliberately not reported: the user does not need a
// list of what they already have, and a long clean-run report is what kills a skill like this.
const missing = [];   // blocks or degrades work
const notes = [];     // worth saying once, not worth blocking on
const created = [];   // what --apply actually wrote

function has(cmd, args) {
  try { execFileSync(cmd, args, { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// Recursive walk of the shipped bundle, returning paths relative to its root. The bundle is the
// single source of what a scaffold contains, so this never carries a hardcoded file list and a
// scaffold that grows needs no change here.
function walk(dir, base = dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// --- environment ------------------------------------------------------------
// Checked every run, never cached. The case this skill exists for — a new host, an uninstall, a
// changed PATH — is exactly the case where a stored finding would lie.

if (!has('git', ['--version'])) {
  missing.push('git: not on PATH. Without it there is no version control and no commit skill.');
} else {
  // Only meaningful once git exists; a worktree or submodule has .git as a file, hence existsSync.
  if (!fs.existsSync(path.join(target, '.git'))) {
    missing.push('git repo: this folder is not one. `git init` makes the work trail recoverable.');
  }
  // Checked here rather than asked in conversation: it is an environment fact, and the first commit
  // is where an unset identity turns into a wrong author that is expensive to correct afterwards.
  const identity = ['user.name', 'user.email'].filter(k => {
    try { return !execFileSync('git', ['config', k], { stdio: 'pipe' }).toString().trim(); }
    catch { return true; }
  });
  if (identity.length) {
    missing.push('git identity: ' + identity.join(' and ') + ' unset. Never invent one and never take '
      + 'it from the session — ask the user what their commits should carry.');
  }
}

if (!has('git', ['lfs', 'version'])) {
  notes.push('git lfs: not installed. Only matters once zone-import/ takes large binaries — '
    + 'optional, not a defect.');
}

// --- user-level decisions ---------------------------------------------------
// Machine-wide, agent-independent, and deliberately outside ~/.claude/. It holds what the user has
// DECIDED, never what was found. No paths go in it: a value that needs a path to be meaningful
// belongs in the project, because paths break on every rename, clone, worktree, and WSL spelling.

const settingsDir = path.join(os.homedir(), '.callbell');
const settingsFile = path.join(settingsDir, 'settings.json');
let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch { /* absent or invalid: defaults */ }

// A user who declined a check does not get asked again. Nothing else in this file is read here;
// it grows as decisions accumulate, and an unreadable file simply means no decisions yet.
const muted = new Set(Array.isArray(settings.mute) ? settings.mute : []);
for (const list of [missing, notes]) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (muted.has(list[i].split(':')[0])) list.splice(i, 1);
  }
}

// --- the scaffold -----------------------------------------------------------
// Compared file by file against the shipped bundle. This is what makes a version stamp unnecessary:
// the question "is anything missing" is answered by looking, not by comparing numbers.

// The lens tree mirrors the base tree exactly (_lens/<lens>/__callbell__/...), so both are the same
// walk from a different root and no path mapping is needed. Without --lens only the base is checked,
// and the lens extras are reported as unanswerable rather than silently skipped.
const roots = [path.join(bundle, '__callbell__')];
if (lens) roots.push(path.join(bundle, '_lens', lens, '__callbell__'));

const absent = [];
for (const root of roots) {
  for (const rel of walk(root)) {
    if (!fs.existsSync(path.join(target, '__callbell__', rel))) absent.push({ root, rel });
  }
}

// Under --apply this is about to be fixed, so it is reported as CREATED rather than twice.
if (!apply) {
  if (!fs.existsSync(path.join(target, '__callbell__'))) {
    missing.push('scaffold: no __callbell__/ here, so no backlog, memory, or zones.');
  } else if (absent.length) {
    missing.push('scaffold: ' + absent.length + ' file(s) missing — '
      + absent.map(a => a.rel).join(', '));
  }
}
if (!lens) {
  notes.push('lens: not given, so the ops/code extras were not checked. Re-run with '
    + '--lens ops|code once the repo type is settled.');
}

if (apply) {
  for (const { root, rel } of absent) {
    copy(path.join(root, rel), path.join(target, '__callbell__', rel));
    created.push('__callbell__/' + rel);
  }
}

// --- .gitignore -------------------------------------------------------------
// Append, never replace. These lines belong to the user, and overwriting them is data loss. A
// second run adds nothing, because presence of the zone rule is the whole test.

const gitignore = path.join(target, '.gitignore');
const zoneRule = '__callbell__/zone-import/';
let ignoreText = '';
try { ignoreText = fs.readFileSync(gitignore, 'utf8'); } catch { /* none yet */ }
if (!ignoreText.includes(zoneRule)) {
  if (!apply) {
    missing.push('.gitignore: the zone rules are absent, so scratch material would be committed.');
  } else {
    const add = fs.readFileSync(path.join(bundle, 'gitignore'), 'utf8');
    fs.writeFileSync(gitignore, ignoreText ? ignoreText.replace(/\s*$/, '\n\n') + add : add);
    created.push('.gitignore (appended)');
  }
}

// --- the ruleset ------------------------------------------------------------
// Purpose and roles live in the user's own AGENTS.md, not in a callbell-owned context folder. The
// script only reports which of the two files exist; whether one already carries the information is
// a reading job, and the agent is the one doing it.

const rulesets = ['AGENTS.md', 'CLAUDE.md'].filter(f => fs.existsSync(path.join(target, f)));
if (!rulesets.length) {
  missing.push('ruleset: neither AGENTS.md nor CLAUDE.md. Purpose and roles have nowhere to live.');
} else {
  notes.push('ruleset: ' + rulesets.join(' + ') + ' present — read it and check whether it already '
    + 'states purpose and roles before asking the user anything.');
}

// --- report -----------------------------------------------------------------
// Plain lines, no interpretation required. The agent phrases this for the user in their language;
// the script never guesses which one that is.

const out = [];
if (missing.length) out.push('MISSING\n' + missing.map(m => '- ' + m).join('\n'));
if (notes.length) out.push('NOTES\n' + notes.map(n => '- ' + n).join('\n'));
if (created.length) out.push('CREATED\n' + created.map(c => '- ' + c).join('\n'));
if (!out.length) out.push('OK: nothing missing.');

process.stdout.write(out.join('\n\n') + '\n');
process.exit(0);
