#!/usr/bin/env node
'use strict';
// Setup for the callbell Claude Code statusline. Idempotent, re-runnable.
// Copies the renderer to ~/.callbell/statusline.js (a stable path that survives plugin updates, since the
// statusLine command runs without CLAUDE_PLUGIN_ROOT), lays down a default widget config if none exists,
// and points ~/.claude/settings.json at it with a 60s refresh. Keeps everything else in both files.

const fs = require('fs');
const os = require('os');
const path = require('path');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT;
if (!pluginRoot) {
    console.error('CLAUDE_PLUGIN_ROOT is not set — run this from a Claude Code session with the plugin loaded.');
    process.exit(1);
}

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
const DEFAULTS = {
    layout: 'wrap',
    separator: ' │ ',
    widgets: ['model', 'thinking', 'dir', 'branch', 'diff', 'out', 'context', 'cost', 'reset', 'weekly-reset', 'method']
};
const existed = fs.existsSync(configFile);
let config = {};
if (existed) { try { config = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch { config = {}; } }
let changed = !existed;
for (const key of Object.keys(DEFAULTS)) {
    if (!(key in config)) { config[key] = DEFAULTS[key]; changed = true; }
}
if (changed) {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n');
    done.push((existed ? 'config topped up (new fields) at ' : 'default config written to ') + configFile);
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
