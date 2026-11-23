---
adr: 0003
status: 🤔 Proposed
deciders: nlamirault
consulted:
informed:
date: 2026-11-23
spdx-license: Apache-2.0
---

# ADR-0003: Use share messages instead of push notifications for slots

## Context

Three moments of a slot session matter to the players of a group:

- before the deadline, when answers are missing;
- when the fourth player answers OK and the game is on;
- at the deadline, when fewer than four players answered OK and the session is cancelled.

Kancha has no push notifications. `expo-notifications` is not installed. The Kancha issue for notifications about
followed clubs and players (#137) was closed without any notification code, and the sending side,
[frontis#111](https://github.com/pilotariak/frontis/issues/111), is still open. Each group already coordinates in a chat
group.

Adding push would mean a native module and new EAS builds (Expo Go no longer delivers remote notifications on
Android since SDK 53), a permission prompt, push tokens stored by pik, calls to the Expo push service and a scheduler
for reminders.

## Considered Options

1. Push notifications with `expo-notifications`, sent by pik through the Expo push service.
2. Messages prepared by Kancha and sent through the system share sheet into the group chat.
3. Emails sent by pik.

## Pros and Cons

### 1. Push notifications

**Pros:**

- ✅ Players learn about a change without opening anything.

**Cons:**

- ❌ Native change, new builds and a permission prompt that many players decline.
- ❌ pik must store push tokens and send each notification exactly once, for example when the fourth OK
  arrives.
- ❌ Web players get nothing without a separate web push setup.

### 2. Share messages

**Pros:**

- ✅ No native change, no permission, no token, no scheduler.
- ✅ Messages land in the chat group where the players already talk.
- ✅ The share code already exists in `features/share`.

**Cons:**

- ❌ Someone has to press the button.
- ❌ A player who reads neither the app nor the chat misses a late change, such as an OK turned into a KO after the
  game was on.

### 3. Emails

**Pros:**

- ✅ Reaches players who never open the app.

**Cons:**

- ❌ Needs email addresses, which [ADR-0002](0002-identify-slot-players-without-accounts.md) avoids collecting.

## Decision

We will use _option 2_ for the first version. The session screen offers two actions:

- **Relancer**, for any player, shares a reminder with the number of OK answers, the minimum and the invite link.
- **Prévenir**, for the organizer, shares the outcome: game on, or session cancelled with the date of the next one.

## Consequences

### Positive

- ✅ The slots feature ships without a native build or a permission prompt.
- ✅ The session state (on, missing players, cancelled) can be computed from the answers on every read. Nothing has
  to fire exactly once, so pik needs no event log and no locking for it.

### Negative

- ❌ Reminders depend on a player or the organizer remembering to send them.

### Neutral

- ↔️ Adding push later needs a new ADR. pik would then have to store session state changes, so that the notification
  for the fourth OK is sent exactly once. If frontis#111 brings push to Kancha first, slots can reuse its client setup.

## References

- [ADR-0001: Call a dedicated slots service next to Frontis](0001-call-a-dedicated-slots-service.md)
- [ADR-0002: Identify slot players without accounts](0002-identify-slot-players-without-accounts.md)
- [#137: notify me when a club or player I follow has a new result](https://github.com/pilotariak/kancha/issues/137)
- [frontis#111: notify followers when new results are scraped](https://github.com/pilotariak/frontis/issues/111)
