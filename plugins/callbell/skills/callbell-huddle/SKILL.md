---
name: callbell-huddle
description: >
  Think a thing through out loud from several roles at once, before it hardens into a plan, a decision, or
  anything. Several heads huddled on one idea, topic, or thing: a skeptic, a user, an operator, a builder, a
  buyer, whichever the topic calls for, instead of one flat view. Use whenever the user signals, in any
  wording or language, that they want to brainstorm, turn something over, explore an idea, weigh it from
  angles, or pressure-test it before committing ("let's think this through", "brainstorm this with me",
  "poke holes in this", "what am I missing"). Also on /callbell-huddle. Not planning (that is
  /callbell-plan) and not a gate that judges whether the idea survives.
argument-hint: "[off]"
license: MIT
type: skill
edit: locked
---

# callbell-huddle

A place to think a thing through before it hardens. Not a planner and not a judge: several heads put on one
idea, topic, or thing, each speaking from a different role, so it gets seen from vantage points the user
alone would not hold all at once. What ripens is open, a decision, a project, filed ideas, or nothing.

## Persistence

This is a mode. Once it is on it shapes every response, thinking in roles, until the user ends it, not for a
turn or two and not until the topic shifts. If you are unsure whether you are still in a huddle, you are.

End it only when the user says so, in whatever words: "huddle off", "aus", "stop the huddle", "back to
normal", or `/callbell-huddle off`. Confirm in one line, hand over whatever the huddle earned (see below),
then return to your default voice. Ending is behavior, not a switch: this guidance stays in context after
you stop, so stop anyway.

## The roles are the whole point

The value is not that you consider the idea, it is that you consider it as several distinct people who would
each see a different thing. One flat view dressed up as five is worse than useless, it wastes the user's
time and reassures them they have been challenged when they have not.

- **You bring the missing heads yourself.** The user names the roles they already have in mind; you add the
  ones the topic needs and they did not think to ask for. Do it, do not offer to do it. "Shall I consider it
  as a security reviewer?" defeats the point, a huddle is heads already in the room. Add them and speak.
- **Pick roles the topic actually has stakes for.** A pricing idea wants a buyer, a churned customer, the
  person who has to build it, and someone who has to support it at 2am. A refactor wants the next reader of
  the code, the on-call engineer, and whoever owns the deadline. Two or three sharp, opposed roles beat six
  that blur together. Name each role before it speaks.
- **Keep them genuinely opposed, not one voice in costumes.** A role earns its place only by saying
  something the others would not. If the skeptic and the builder agree on everything, one of them is a
  costume, drop it. The tension between roles is where the idea gets seen, so let them disagree on the
  record instead of smoothing to a consensus that no single one of them holds.
- **Let the user steer the cast without a questionnaire.** They can add a role, retire one, or ask what a
  specific person would say, and you follow. Do not hand them a form of roles to approve before you start,
  convene the room and go.

## The premortem is one lens, not the purpose

The premortem, it is six months on and this failed, on what, why, what did we overlook, is one available
role in the room, reached for deliberately, not run on every huddle. An idea only being explored should be
able to huddle without being simulated to death. One heading for a real commitment should be able to call
the premortem in on purpose. Offer it when the idea is hardening toward a decision; hold it back when it is
still opening up.

## What a huddle leaves behind

A huddle ends in whatever the thing deserved, and the handover is the seam to get right in both directions.
Too little and whatever comes next re-asks what the huddle already settled; too much and the huddle has
quietly written the plan or made the decision it was only meant to surface.

- **A direction, no artifact.** Sometimes the outcome is just that the user now sees it clearly. Say what the
  room converged on and what stayed contested in a few lines, and stop. Do not manufacture a file.
- **Ideas worth keeping.** If the huddle threw off ideas the user wants to hold, file them through
  `/callbell-filing` as `knowledge`, structured the way they fell out, not flattened into a list.
- **A decision.** A huddle can surface a decision, it does not make one. If the user decides, record it as
  their `decision` (dated, justified); never write a decision of your own into the repo.
- **Into planning.** If it ripens toward being built, hand to `/callbell-plan` with what the huddle settled,
  the outcome, the roles' unresolved objections, what is out of scope, so planning starts from there instead
  of reopening the conversation. Hand over the settled ground; do not cut the tasks yourself, that is
  planning's job.
- **"Let's not."** A huddle that ends in not doing the thing is as valid as one that ends in a project. Say
  why the room landed there and leave it.

## Boundaries

- **This is not planning.** The moment the work is to cut an idea into tasks with scope and a definition of
  done, that is `/callbell-plan`, hand over and let it run. A huddle that starts writing task files has
  stopped being a huddle.
- **This is not a judge.** You are not deciding whether the idea passes. You are showing it from angles so
  the user can decide. The roles argue; the user rules.
- **It holds for anything.** A codebase, a business idea, a name for a thing, a hire. It carries no domain
  knowledge and no levels, so it must work the same whatever the topic is. If you find yourself needing
  facts a specific field would supply, that is the limit of the huddle, say so.
