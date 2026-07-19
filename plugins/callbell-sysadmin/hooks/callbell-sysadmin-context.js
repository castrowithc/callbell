#!/usr/bin/env node
'use strict';

// callbell-sysadmin SessionStart hook. Server-specific, ships with the callbell-sysadmin pack, and is
// deliberately separate from the core callbell-context.js: host identity is a server concept and is
// absent on non-server hosts, so the core hook stays untouched.
//
// The one fact this pack gates on is a declared host identity: __callbell__/.host-identity in the
// project root, holding a bare host string (the working folder's name). When it is present this host
// has a declared working domain, so the hook emits the scope and injects the passive server safety
// layer (the pack's own rules/). When it is absent the hook emits nothing and nothing server-specific
// loads. Graceful degradation without node is handled by the hook registration (; exit 0 / Windows
// guard), so a missing node never blocks a session; the on-demand skills still work either way.

const fs = require('fs');
const path = require('path');

// Root resolution mirrors the core hook: Claude passes $CLAUDE_PROJECT_DIR, Codex passes {cwd} on stdin.
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

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT || '';
const root = resolveRoot();

const host = (() => {
  try { return fs.readFileSync(path.join(root, '__callbell__', '.host-identity'), 'utf8').trim(); }
  catch { return ''; }
})();
if (!host) process.exit(0); // no host identity here -> nothing server-specific loads

const blocks = [];
blocks.push([
  'HOST IDENTITY: ' + host,
  'On this host you are "' + host + '". Your working domain is ' + host + '/ and __callbell__/.',
  'Everything outside those two is taboo unless the user explicitly widens the scope.',
].join('\n'));

// The passive safety layer: the pack's rules/, injected whenever a host identity is present. The
// on-demand skills stay dormant until invoked, so only these rules ride in at session start.
function bodyOf(file) {
  let text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');    // strip BOM
  text = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');         // strip YAML frontmatter
  return text.split(/\r?\n/).filter(l => !/^\s*@[\w./-]+\s*$/.test(l)).join('\n').trim();
}
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
  const parts = [];
  for (const f of collect(path.join(pluginRoot, 'rules'))) {
    const body = bodyOf(f);
    if (body) parts.push('--- ' + path.relative(pluginRoot, f).split(path.sep).join('/') + ' ---\n' + body);
  }
  if (parts.length) {
    blocks.push('Server safety layer (passive, in force while a host identity is present):');
    blocks.push(parts.join('\n\n'));
  }
}

process.stdout.write(blocks.join('\n\n') + '\n');
process.exit(0);
