---
paths: ["**/*"]
description: >
  Policy for Docker stacks: never print or persist secret values (reading your own compose to document is
  fine), no docker.sock/privileged/host-net without asking, no :latest or root, no hardcoded secrets, SMTP
  placeholders.
license: MIT
type: rule
edit: locked
---

# Docker stacks: policy and prohibitions

## Principle
Reading to understand or document is allowed. Printing secret **values** or writing them into the repo (git, then push) is forbidden. The protection is on the *values*, not the structure.

## Secrets: always off-limits
- **Never print `.env` values** in the chat or write them into a repo file.
- **Never run `docker exec … printenv` or read the `docker inspect` env field.** Both resolve secret values.
- Variable **names** may be named. **Values** never.
- For a new stack, create a `.env` template with placeholders; the user fills it in.
- Never hardcode secrets (see below). If an inline secret ever appears in a compose file, the value is
  **not** carried over.

## Reading to document: allowed
- A stack's **own** `compose.yaml`/`*.yml` may be read to document that exact stack (image, ports, volumes,
  env *keys*, networks).
- `.env.example`/`.env.template` (public key templates) may be read and used. If there's no local template,
  take the key list from the official upstream repo.
- `.env` *values* stay out. They live in `.env`, not in the compose file.

## Don't copy conventions from other stacks
- **Don't look into other stacks' compose files to learn conventions**, not even "just to check". That's
  cargo-culting, not documenting your own stack.
- Instead, follow your own established stack conventions (structure, security, patterns).

## Security for new stacks
- Check the official Docker docs or repos (image, variables, volumes).
- **Never mount docker.sock** without explicitly asking the user.
- **Never set privileged.**
- **Never set `network_mode: host`** without explicitly asking.
- **Never use `:latest` or an untagged image.** Always pin a concrete version for a reproducible state.
- **Avoid `user: root` in the container.** Set an unprivileged user where the app allows it.
- **Never hardcode secrets.** Only via `.env` or placeholders, never in compose or the image.
- Determine all security-relevant app variables and configure them restrictively (signup, telemetry, debug,
  API access, rate limiting).

## SMTP
- Don't assume which domain is used as the sender.
- Use a placeholder: `noreply@<domain>`.
- The sender domain can differ from the service domain.
- When unclear: ask.
