#!/usr/bin/env node
'use strict';

// The check behind /callbell-start. Reports what is MISSING and nothing else, so a healthy repo
// produces one line and the skill stays worth calling a fourth time.
//
// This script IS the Node check. If Node is absent the call fails, and that failure is the answer —
// on Windows, macOS, and Linux alike. Writing a shell pre-check would mean solving the bootstrap
// twice, so everything the agent needs is gathered here in one call.
//
//   node callbell-doctor.js [--apply] [--target <dir>]
//
// Default is report-only. --apply copies in what is missing and never touches what is there:
// a user's .gitignore lines, a template they changed — all survive, because nothing is ever
// compared by content or overwritten.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { scaffoldTopUp } = require('./callbell-scaffold-topup.js');

const argv = process.argv.slice(2);
const apply = argv.includes('--apply');
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const target = flag('--target') ? path.resolve(flag('--target')) : process.cwd();

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

// The scaffold walk-and-copy lives in callbell-scaffold-topup.js, shared with the session hook so the two
// never disagree on which bundle files a scaffold should carry.

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

// The host appends an attribution trailer to every commit message unless told not to, and the commit
// skill forbids one. Two norms pointing opposite ways is a fight the skill loses eventually: it has to
// win at every single commit, the setting has to be set once. So this reports the setting rather than
// relying on vigilance. Read-only — this is the user's own host configuration and callbell does not
// write into it. Absent ~/.claude/ means the user is not on this host, so there is nothing to say.
const hostSettings = path.join(os.homedir(), '.claude', 'settings.json');
if (fs.existsSync(path.dirname(hostSettings))) {
  let host = {};
  try { host = JSON.parse(fs.readFileSync(hostSettings, 'utf8')); } catch { /* absent or invalid */ }
  // Name what is missing, never what is set: half-configured has to read differently from untouched,
  // or the user who already set one of them concludes their setting had no effect.
  const want = [];
  if (!(host.attribution && host.attribution.commit === '')) want.push('"attribution": {"commit": "", "pr": ""}');
  // Its own key beside attribution, and the docs do not say an empty attribution covers it. One line here
  // against a Co-Authored-By that has to be rewritten out of a shared history later.
  if (host.includeCoAuthoredBy !== false) want.push('"includeCoAuthoredBy": false');
  if (host.includeGitInstructions !== false) want.push('"includeGitInstructions": false');
  if (want.length) {
    notes.push('attribution: the host adds commit text of its own unless told not to. In '
      + hostSettings + ' set ' + want.join(' and ') + '. Takes effect for commits at once, for the '
      + 'instruction itself in the next session.');
  }
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

// One scaffold, no ops/code branch: templates are inert, so an unused one costs a file while a branch
// costs an argument, a code path, and a way to be wrong. The compare-and-copy is scaffoldTopUp, shared
// with the session hook.
const { absent, created: scaffoldCreated } = scaffoldTopUp(target, bundle, { apply });

// Under --apply the gap is fixed in the same pass, so it is reported as CREATED rather than twice.
if (!apply) {
  if (!fs.existsSync(path.join(target, '__callbell__'))) {
    missing.push('scaffold: no __callbell__/ here, so no backlog, memory, or zones.');
  } else if (absent.length) {
    missing.push('scaffold: ' + absent.length + ' file(s) missing — ' + absent.join(', '));
  }
} else {
  created.push(...scaffoldCreated);
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
// A fresh repo gets both files laid down unconditionally, like the scaffold and the .gitignore — the files
// never wait on the information arriving. AGENTS.md from the template carries the content; CLAUDE.md is the
// one-line `@AGENTS.md` switch, so Claude and Codex read the same ruleset without a second copy. Purpose and
// roles are then APPENDED to AGENTS.md when the user shares them (the skill's job). When a ruleset already
// exists it is the user's: the script only reports it, and which file carries the content is a reading job.

const rulesets = ['AGENTS.md', 'CLAUDE.md'].filter(f => fs.existsSync(path.join(target, f)));
if (!rulesets.length) {
  if (!apply) {
    missing.push('ruleset: neither AGENTS.md nor CLAUDE.md — both are created (AGENTS.md from the template, '
      + 'CLAUDE.md as the @AGENTS.md switch); purpose and roles are then appended to AGENTS.md.');
  } else {
    fs.writeFileSync(path.join(target, 'AGENTS.md'),
      fs.readFileSync(path.join(bundle, 'agents-template.md'), 'utf8'));
    fs.writeFileSync(path.join(target, 'CLAUDE.md'), '@AGENTS.md\n');
    created.push('AGENTS.md', 'CLAUDE.md (@AGENTS.md)');
  }
} else {
  notes.push('ruleset: ' + rulesets.join(' + ') + ' present — '
    + (rulesets.length > 1 ? 'decide which one carries the content, read it' : 'read it')
    + ', and ask only for what it does not already state.');
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
