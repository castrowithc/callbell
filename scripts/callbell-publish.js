#!/usr/bin/env node
'use strict';

// Publish: stamp a plugin's version, commit, push. One repo, no build.
//   1. patch-bump the plugin's VERSION (single source of the plugin version)
//   2. stamp the value into both of the plugin's host manifests (format-preserving, value only)
//   3. git add/commit/push
//
// The bump is needed so `/plugin marketplace update` and
// `codex plugin marketplace upgrade` pull the change at all.
//
// Usage: node scripts/callbell-publish.js [plugin] [version]
//   plugin:  folder name under plugins/ (default: callbell, the collection).
//   version: optional semver; otherwise a patch bump of the plugin's VERSION file.
//   Order doesn't matter: the semver argument is the version, the other is the plugin name.
//
// Bootstrap-tolerant: .git without a remote -> committed locally, push skipped.

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Arguments are position-independent: semver = version, the rest = plugin name.
const args = process.argv.slice(2);
const explicitVersion = args.find(a => /^\d+\.\d+\.\d+$/.test(a)) || null;
const plugin = args.find(a => !/^\d+\.\d+\.\d+$/.test(a)) || 'callbell';

const PLUGIN = `plugins/${plugin}`;
const MANIFESTS = [`${PLUGIN}/.claude-plugin/plugin.json`, `${PLUGIN}/.codex-plugin/plugin.json`];

for (const rel of [PLUGIN, ...MANIFESTS]) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.error(`✗ No plugin '${plugin}': ${rel} missing.`);
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

// Patch-bump the plugin's VERSION file; an explicit version beats the bump.
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
console.log(`✓ ${plugin} ${version} stamped (VERSION + ${MANIFESTS.length} manifests).`);

git(['add', '-A']);
if (!git(['status', '--porcelain'])) {
  console.log('- Nothing to publish.');
  process.exit(0);
}

git(['commit', '-m', `Release ${plugin} ${version}`]);
if (!git(['remote'], true)) {
  console.log(`✓ Committed locally, push skipped (no remote). Release ${plugin} ${version}`);
  process.exit(0);
}

const hasUpstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], true);
if (hasUpstream) git(['push']);
else git(['push', '-u', 'origin', git(['rev-parse', '--abbrev-ref', 'HEAD'])]);
console.log(`✓ Committed + pushed. Release ${plugin} ${version}`);
