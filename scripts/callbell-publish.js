#!/usr/bin/env node
'use strict';

// Publish: Version eines Plugins stempeln, committen, pushen. Ein Repo, kein Build.
//   1. VERSION des Plugins patch-bumpen (single source der Plugin-Version)
//   2. den Wert in beide Host-Manifeste des Plugins stempeln (formatschonend, nur der Wert)
//   3. git add/commit/push
//
// Der Bump ist noetig, damit `/plugin marketplace update` und
// `codex plugin marketplace upgrade` die Aenderung ueberhaupt ziehen.
//
// Aufruf: node scripts/callbell-publish.js [plugin] [version]
//   plugin:  Ordnername unter plugins/ (Default: callbell, die Collection).
//   version: optionaler semver; sonst Patch-Bump der VERSION-Datei des Plugins.
//   Reihenfolge egal: das semver-Argument ist die Version, das andere der Plugin-Name.
//
// Bootstrap-tolerant: .git ohne Remote -> lokal committet, Push uebersprungen.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Argumente positionsunabhaengig: semver = Version, der Rest = Plugin-Name.
const args = process.argv.slice(2);
const explicitVersion = args.find(a => /^\d+\.\d+\.\d+$/.test(a)) || null;
const plugin = args.find(a => !/^\d+\.\d+\.\d+$/.test(a)) || 'callbell';

const PLUGIN = `plugins/${plugin}`;
const MANIFESTS = [`${PLUGIN}/.claude-plugin/plugin.json`, `${PLUGIN}/.codex-plugin/plugin.json`];

for (const rel of [PLUGIN, ...MANIFESTS]) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.error(`✗ Kein Plugin '${plugin}': ${rel} fehlt.`);
    process.exit(1);
  }
}

function git(args, allowFail = false) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

// Patch-Bump der VERSION-Datei des Plugins; eine explizite Version gewinnt gegen den Bump.
function resolveVersion() {
  const vf = path.join(ROOT, PLUGIN, 'VERSION');
  if (explicitVersion) {
    fs.writeFileSync(vf, explicitVersion + '\n');
    return explicitVersion;
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
console.log(`✓ ${plugin} ${version} gestempelt (VERSION + ${MANIFESTS.length} Manifeste).`);

git(['add', '-A']);
if (!git(['status', '--porcelain'])) {
  console.log('- Nichts zu publishen.');
  process.exit(0);
}

git(['commit', '-m', `Release ${plugin} ${version}`]);
if (!git(['remote'], true)) {
  console.log(`✓ Lokal committet, Push uebersprungen (kein Remote). Release ${plugin} ${version}`);
  process.exit(0);
}

const hasUpstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], true);
if (hasUpstream) git(['push']);
else git(['push', '-u', 'origin', git(['rev-parse', '--abbrev-ref', 'HEAD'])]);
console.log(`✓ Committet + gepusht. Release ${plugin} ${version}`);
