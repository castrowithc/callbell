'use strict';

// Shared scaffold top-up: compare a target's __callbell__/ against the shipped bundle and copy in only
// what is missing. Never compares by content, never overwrites, so a user's changed template survives.
// It is the single source of "which bundle files a scaffold should carry", used by two callers:
//   - callbell-doctor.js, the check behind /callbell-start (--apply writes, default reports).
//   - callbell-context.js, the session hook, which tops it up on every start where a scaffold already
//     exists, so a plugin update that ships new template files lands without the user running start again.
// Keeping the compare in one place is what stops the hook and the doctor from drifting apart.

const fs = require('fs');
const path = require('path');

// Recursive walk of a directory, returning file paths relative to its root.
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

// Compare target/__callbell__ against bundle/__callbell__ (bundle being <pluginRoot>/scaffold). Returns
// { absent, created }. apply=false lists what is missing and writes nothing; apply=true copies each
// missing file in and lists it as created. The compare is by presence only, so it is idempotent: a second
// run over an up-to-date scaffold finds nothing and writes nothing.
function scaffoldTopUp(target, bundle, { apply = false } = {}) {
  const base = path.join(bundle, '__callbell__');
  const absent = walk(base).filter(rel => !fs.existsSync(path.join(target, '__callbell__', rel)));
  const created = [];
  if (apply) {
    for (const rel of absent) {
      copy(path.join(base, rel), path.join(target, '__callbell__', rel));
      created.push('__callbell__/' + rel);
    }
  }
  return { absent, created };
}

module.exports = { walk, copy, scaffoldTopUp };
