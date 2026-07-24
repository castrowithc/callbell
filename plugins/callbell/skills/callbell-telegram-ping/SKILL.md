---
name: callbell-telegram-ping
description: >
  Set up the one-way Telegram channel that pings you when the agent stops and is waiting for you, so you
  learn it away from the terminal. Guides the bot setup, stores the secret outside the repo, and sends a
  test ping. Start it by typing /callbell-telegram-ping.
type: skill
edit: locked
disable-model-invocation: true
---

# /callbell-telegram-ping

Set up a one-way push to Telegram. When the agent stops and waits for you, a message reaches your phone, so
you do not have to sit and watch the session. You still answer at the terminal; the channel only tells you
that waiting has started.

## When
- On the user's direct request. Slash-only: wiring a notification channel is never something to auto-fire.
- Once set up, the ping fires on its own from then on. This skill is for the setup and a manual test, not
  for sending during normal work.

## How it works
On Claude, the plugin's `Notification` hook fires when Claude has been idle waiting for you and runs the send
script. The secret lives in `~/.callbell/telegram.json`, outside every repo, read only, never logged. With
no config the channel is simply off and the session runs unchanged.

Codex has no idle/attention event (only a per-turn `Stop`), so the automatic ping is Claude-only for now. The
send script itself is host-neutral, so a manual test works on Codex too.

## Set up (once)
Walk the user through this; the token must be written by the user, never pasted into the session.

1. **Create a bot.** In Telegram, message `@BotFather`, send `/newbot`, follow the prompts. It returns a
   **bot token** like `123456:ABC-DEF...`.
2. **Get the chat id.** The user sends any message to their new bot, then opens
   `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and reads `message.chat.id` from the JSON.
   (Substitute the real token in that URL. This is the one time the token appears in a URL, in the user's
   own browser, not in the session.)
3. **Store the secret.** The user creates `~/.callbell/telegram.json` themselves, with:
   ```json
   { "token": "123456:ABC-DEF...", "chat_id": "987654321" }
   ```
   Do not offer to write this file for them: keeping the token out of the session transcript is the point.
   The same file works on every machine (same bot, same chat); copy it to each. The `Host` line in the
   message says which machine rang.
4. **Test it.** Run the send script in test mode and report what it prints:
   - Bash: `node "$CLAUDE_PLUGIN_ROOT/scripts/callbell-telegram-notify.js" --test`
   - PowerShell: `node "$env:CLAUDE_PLUGIN_ROOT/scripts/callbell-telegram-notify.js" --test`

   A message should arrive on the user's device. If it says the config is missing or Telegram refused,
   relay that line; it names the cause without ever showing the token.

## The message
A dense header so the phone's lock-screen preview already names the session, then the body:

```
🔔 <host> · <agent>
<dir>/<branch>

<what the agent is waiting on>
```

The body is whatever the host's notification carries. On Claude an idle notification is generic ("Waiting
for your input"), so a finished run and an open question both read as "you are needed"; you tell them apart
from the body once you glance. That is deliberate: both mean the ball is in your court.

## Turning it off
Delete or rename `~/.callbell/telegram.json`. The channel goes quiet; nothing else changes.
