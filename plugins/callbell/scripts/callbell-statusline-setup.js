#!/usr/bin/env node
'use strict';
// Setup for the callbell Claude Code statusline. Idempotent, re-runnable.
// Copies the renderer to ~/.callbell/statusline.js (a stable path that survives plugin updates, since the
// statusLine command runs without CLAUDE_PLUGIN_ROOT), lays down a default widget config if none exists,
// and points ~/.claude/settings.json at it with a 60s refresh. Keeps everything else in both files.

const fs = require('fs');
const os = require('os');
const path = require('path');

// The renderer sits next to this script, so resolve the plugin root from here: setup then runs from any
// shell, not only where the host sets CLAUDE_PLUGIN_ROOT (an ad-hoc shell has it empty). Mirrors
// callbell-doctor.js, and matches the skill's "<plugin-root>" instruction working without the env var.
const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT
    || path.resolve(__dirname, '..');

const home = os.homedir();
const callbellDir = path.join(home, '.callbell');
const rendererDst = path.join(callbellDir, 'statusline.js');
const configFile = path.join(callbellDir, 'statusline.json');
const settingsFile = path.join(home, '.claude', 'settings.json');
const done = [];

// 1. ~/.callbell exists
fs.mkdirSync(callbellDir, { recursive: true });

// 2. copy the renderer every run, so a plugin update lands on the stable path
fs.copyFileSync(path.join(pluginRoot, 'scripts', 'callbell-statusline.js'), rendererDst);
done.push('renderer copied to ' + rendererDst);

// 3. config: create with defaults if absent, else top up missing top-level fields (e.g. a new
//    "separator") without ever touching the user's widget choices.
// Widgets are an ordered { name: bool } map: the full menu is always present, a widget shows when true, and
// the key order is the render order. WIDGET_ORDER is the canonical menu and its default order.
const WIDGET_ORDER = ['model', 'thinking', 'dir', 'branch', 'diff', 'out', 'context', 'cost', 'session', 'reset', 'weekly', 'weekly-reset', 'method'];
const DEFAULTS = {
    layout: 'wrap',
    separator: ' • ',
    widgets: Object.fromEntries(WIDGET_ORDER.map(w => [w, true])) // a fresh config gets every widget on
};
const existed = fs.existsSync(configFile);
let config = {};
if (existed) { try { config = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch { config = {}; } }
let changed = !existed;

// Scalar fields: fill if absent, never overwrite the user's value.
for (const key of ['layout', 'separator']) {
    if (!(key in config)) { config[key] = DEFAULTS[key]; changed = true; }
}

// Widgets, all non-destructive:
//   fresh / absent -> the full map, every widget on.
//   legacy array   -> migrate: listed widgets on in their order, the rest appended off below.
//   map            -> keep the user's on/off and order untouched.
if (!existed || config.widgets == null || (typeof config.widgets !== 'object')) {
    config.widgets = { ...DEFAULTS.widgets };
    changed = true;
} else if (Array.isArray(config.widgets)) {
    const migrated = {};
    for (const w of config.widgets) if (typeof w === 'string' && !(w in migrated)) migrated[w] = true;
    config.widgets = migrated;
    changed = true;
}
// Keep the menu complete: any known widget missing from it is appended off, so a widget shipped in a later
// update shows up (off) on the next run. The user's existing keys and their order are left as they are.
for (const w of WIDGET_ORDER) {
    if (!(w in config.widgets)) { config.widgets[w] = false; changed = true; }
}

if (changed) {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
    done.push((existed ? 'config migrated/topped up at ' : 'default config written to ') + configFile);
} else {
    done.push('config left as is at ' + configFile);
}

// 4. point the host statusLine at the stable renderer, keep every other setting
const cmdPath = rendererDst.replace(/\\/g, '/'); // forward slashes: safe in Git Bash and PowerShell
let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch { /* absent or invalid: start fresh */ }
settings.statusLine = { type: 'command', command: `node "${cmdPath}"`, refreshInterval: 60 };
fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');
done.push('statusLine + refreshInterval:60 set in ' + settingsFile);

console.log('callbell statusline set up:\n- ' + done.join('\n- '));
