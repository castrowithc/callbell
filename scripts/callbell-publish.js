#!/usr/bin/env node
'use strict';

// Publish: Version stempeln, committen, pushen. Ein Repo, kein Build.
//   1. VERSION patch-bumpen (single source der Plugin-Version)
//   2. den Wert in beide Host-Manifeste stempeln (formatschonend, nur der Wert)
//   3. git add/commit/push
//
// Der Bump ist noetig, damit `/plugin marketplace update` und
// `codex plugin marketplace upgrade` die Aenderung ueberhaupt ziehen.
//
// Aufruf: node scripts/callbell-publish.js [version]
//   version: optional semver; sonst Patch-Bump der VERSION-Datei.
//
// Bootstrap-tolerant: .git ohne Remote -> lokal committet, Push uebersprungen.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFESTS = ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json'];

function git(args, allowFail = false) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

// Patch-Bump der VERSION-Datei; ein Argument gewinnt gegen den Bump.
function resolveVersion() {
  const arg = process.argv[2];
  const vf = path.join(ROOT, 'VERSION');
  if (arg) {
    fs.writeFileSync(vf, arg.trim() + '\n');
    return arg.trim();
  }
  const cur = fs.existsSync(vf) ? fs.readFileSync(vf, 'utf8').trim() : '0.1.0';
  const m = cur.match(/^(\d+)\.(\d+)\.(\d+)$/);
  const next = m ? `${m[1]}.${m[2]}.${Number(m[3]) + 1}` : '0.1.0';
  fs.writeFileSync(vf, next + '\n');
  return next;
}

const version = resolveVersion();
for (const rel of MANIFESTS) {
  const file = path.join(ROOT, rel);
  const text = fs.readFileSync(file, 'utf8').replace(/("version":\s*")[^"]*(")/, `$1${version}$2`);
  fs.writeFileSync(file, text);
}
console.log(`✓ Version ${version} gestempelt (VERSION + ${MANIFESTS.length} Manifeste).`);

git(['add', '-A']);
if (!git(['status', '--porcelain'])) {
  console.log('- Nichts zu publishen.');
  process.exit(0);
}

git(['commit', '-m', `Release ${version}`]);
if (!git(['remote'], true)) {
  console.log(`✓ Lokal committet, Push uebersprungen (kein Remote). Release ${version}`);
  process.exit(0);
}

const hasUpstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], true);
if (hasUpstream) git(['push']);
else git(['push', '-u', 'origin', git(['rev-parse', '--abbrev-ref', 'HEAD'])]);
console.log(`✓ Committet + gepusht. Release ${version}`);
