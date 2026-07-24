#!/usr/bin/env node
'use strict';

// SessionStart hook for callbell-sysadmin. Server-specific, travels with the pack, and deliberately kept
// separate from the core hook callbell-context.js: host identity is a server concept and is absent on
// non-servers, so the core hook stays untouched.
//
// The pack hangs on a single fact: __callbell__/.host-identity in the project root. The file has three
// states, distinguishable at the filesystem level:
//
//   missing          -> no server context. The hook emits nothing, nothing server-specific loads.
//   present, empty   -> the user works from their own machine over SSH; the host is named in
//                       conversation. The safety layer loads, no domain is set.
//   present, filled  -> the agent runs on the host; the content is the name of the domain folder.
//
// The empty case must load the safety layer. Administering a box over SSH from a laptop issues the same
// destructive commands as sitting in front of it, and a passive protection layer that guards only one of
// the two guards the wrong one.
//
// Graceful degradation without node is handled by the hook registration (; exit 0 / Windows guard), so a
// missing node never blocks a session; the on-demand skills work either way.

const fs = require('fs');
const path = require('path');

// Root resolution as in the core hook: Claude gives $CLAUDE_PROJECT_DIR, Codex gives {cwd} over stdin.
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

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';
const root = resolveRoot();

// null = file missing, '' = present and empty, otherwise the name of the domain folder.
const host = (() => {
  try { return fs.readFileSync(path.join(root, '__callbell__', '.host-identity'), 'utf8').trim(); }
  catch { return null; }
})();
if (host === null) process.exit(0); // no server context -> nothing server-specific loads

const blocks = [];
if (host) {
  const domainExists = (() => {
    try { return fs.statSync(path.join(root, host)).isDirectory(); }
    catch { return false; }
  })();
  const lines = [
    'HOST IDENTITY: ' + host,
    'On this host you are "' + host + '". Your working domain is ' + host + '/ and __callbell__/.',
    'Everything outside those two is off-limits unless the user explicitly widens the scope.',
  ];
  // The folder is the core of the promise. If it's missing, say so rather than scoping the agent to a path
  // with nothing at it: that silent failure is exactly what the three states exist for.
  if (!domainExists) {
    lines.push('The folder ' + host + '/ does not exist yet. Create it via /callbell-sysadmin-add-host' +
      ' before you file material about this host.');
  }
  blocks.push(lines.join('\n'));
} else {
  blocks.push([
    'HOST IDENTITY: none set (remote administration from the user\'s own machine).',
    'No working domain is set. The user says which host they mean in conversation; ask',
    'before you run anything aimed at a specific host.',
  ].join('\n'));
}

// The passive safety layer: the pack's rules/, POINTED AT (not inlined), in both identity states — the same
// transport the core hook uses. A pointer costs ~80 characters where a rule body costs thousands, so this
// never risks the host's SessionStart cap (over it, the host drops nearly the whole payload) and the safety
// rules can grow to any size. The absolute path is the host's own substitution of the plugin root, so the
// install version and the host are irrelevant. The on-demand skills stay asleep until called, so only these
// rules travel along.
function collect(dir) {
  let out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(collect(full));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

if (pluginRoot) {
  const abs = f => f.split(path.sep).join('/');
  const rules = collect(path.join(pluginRoot, 'rules'));
  if (rules.length) {
    blocks.push('Server safety layer (passive, in force while a host identity is present). Read these files '
      + 'NOW, before you answer, and follow them for the whole session:\n'
      + rules.map(f => '- ' + abs(f)).join('\n'));
  }
}

process.stdout.write(blocks.join('\n\n') + '\n');
process.exit(0);
