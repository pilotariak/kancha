---
adr: 0002
status: 🤔 Proposed
deciders: nlamirault
consulted:
informed:
date: 2026-11-23
spdx-license: Apache-2.0
---

# ADR-0002: Identify slot players without accounts

## Context

Kancha has no accounts and no sign-in today. The slots feature ([ADR-0001](0001-call-a-dedicated-slots-service.md))
stores its data in pik and needs to know who acts on a slot. Two kinds of actions carry very different stakes:

- **Organizer actions** (create a slot, cancel a date, compose a session, manage the list of names, rotate the invite
  code) change the slot for everyone. They must not be open to anyone who has the link.
- **A player's answer** (OK, Dispo or KO for one session) is low stakes, but it decides whether the session takes place.
  If anyone can change anyone's answer, the "game on" state cannot be trusted.

The players are groups of friends, five to about ten per slot, and many play only now and then. Some of them answer from
a browser on the Kancha website, without installing the app. A sign-up step loses exactly those players.

A player often belongs to several slots, for example one every Wednesday and one every other Thursday. Whatever
identifies a player has to be kept, and recovered when lost, once per person, not once per slot.

On the web, Safari deletes a website's script-writable storage after seven days of browser use without a visit. A web
player of a slot that meets every other week loses whatever the page stored between two sessions. Links opened from a
messaging app may also open in that app's built-in browser, whose storage is separate from Safari's.

## Considered Options

1. No player identity: anyone with the link can set any player's answer, and the organizer has a private admin link
   (the Framadate model).
2. An invite link, a name chosen once, and a token per slot membership kept on the device.
3. An invite link, a name chosen once, one player token per device shared by all the slots of that device, and
   recovery started by an organizer.
4. Sign in with Apple and Google.
5. A magic link sent by email.
6. AT Protocol (Bluesky) sign-in, as in Plaza.

## Pros and Cons

### 1. No player identity

**Pros:**

- ✅ Nothing for players to keep or recover. A player who lost their browser storage picks their name again.
- ✅ The smallest service: only the organizer link needs a secret.

**Cons:**

- ❌ Anyone with the link can turn another player's OK into a KO, by mistake or as a joke. The session state, the one
  thing the feature must get right, can no longer be trusted.
- ❌ A link posted outside the group lets strangers write answers until the code is rotated.

### 2. Token per slot membership

**Pros:**

- ✅ No account, no email, no password. Joining takes one link and one tap.
- ✅ Each slot is isolated: a leaked token gives access to one slot only.

**Cons:**

- ❌ A player in three slots holds three tokens. On the web, losing the browser storage loses all three, and each one
  has to be recovered separately.
- ❌ Recovery rests on the player: a personal link per slot, to keep somewhere safe.

### 3. Player token per device, recovery by an organizer

**Pros:**

- ✅ No account, no email, no password, as in option 2.
- ✅ One token per device, whatever the number of slots. Recovering it restores every slot at once.
- ✅ Players keep nothing. The organizer already knows every player and sends a recovery link privately.

**Cons:**

- ❌ A stolen player token reaches every slot of that player, not one.
- ❌ Recovery depends on an organizer being reachable.

### 4. Sign in with Apple and Google

**Pros:**

- ✅ Strong identity that survives a new phone or a cleared browser.

**Cons:**

- ❌ A sign-up step that occasional players skip.
- ❌ App Store rules follow: an app that offers Google sign-in must also offer Sign in with Apple or an equivalent
  (guideline 4.8), and an app that creates accounts must let users delete them from the app (guideline 5.1.1(v)).
- ❌ Personal data (email, provider id) to store, protect and delete.

### 5. Magic link by email

**Pros:**

- ✅ No password, and it works on every device.

**Cons:**

- ❌ Stores email addresses, and needs an email sending service and its deliverability.
- ❌ One more step every time a device or a browser is new.

### 6. AT Protocol sign-in

**Pros:**

- ✅ Reuses the Plaza work on the AT Protocol.

**Cons:**

- ❌ Every player needs a Bluesky account.
- ❌ AT Protocol records are public, and answers are private to the group.

## Decision

We propose _option 3_, with these rules:

- **Two levels of access.** Every write sends a player token. pik allows organizer actions only for a member whose role
  is `organizer`.
- **One player per device.** The first slot created or joined on a device returns a player token. Joining another slot
  from the same device links the new member to the same player. `GET /me` lists the player's slots. pik stores only the
  SHA-256 hash of the token.
- **Schema.** `players (id, token_hash, created_at)` holds the device identity. `members (id, slot_id, player_id,
  display_name, role)` holds a name in a slot. A member without a `player_id` is a name that nobody has claimed yet.
- **Invite code.** Creating a slot returns the slot id and an invite code of eight characters, without 0, O, 1 or I.
  The code is only used to join. After joining, every call uses the slot id and the player token. Rotating the code
  therefore does not affect members who already joined.
- **Co-organizers.** An organizer can make another member an organizer. The creation flow suggests naming a second
  one, so that a lost phone does not leave a slot without an organizer.
- **Recovery by an organizer.** An organizer can create a recovery link for a member: single use, valid for 24 hours,
  sent privately. Opening it links the member to the device's player and keeps the member's answers. Releasing a name
  stays available for a name claimed by mistake.
- **Personal link as a fallback.** After a player picks a name, Kancha offers a personal link, `/slot/me#t=…`, that
  restores the token without an organizer. It is optional, not a step of the flow. The token sits in the URL fragment,
  which the browser does not send to the server or its logs. The link works like a password: it is never posted in the
  group chat.
- **Storage.** The app keeps the token in secure storage on native. On the web, it is an `HttpOnly` cookie set by pik
  ([ADR-0004](0004-call-pik-on-its-own-origin-from-the-web-build.md)), or browser storage if Safari does not keep it.
- **The organizer stays in charge of the list.** An organizer can close the list, release a name, rotate the invite
  code and answer for a member who never joined.
- **Rate limits.** pik rate-limits slot creation, name claims and the use of recovery links.

## Consequences

### Positive

- ✅ No sign-up step: a player can answer from the link the organizer posted in the group chat.
- ✅ Kancha stores no email address, phone number or location for this feature.
- ✅ A lost phone or a cleared browser costs one message from an organizer, whatever the number of slots.

### Negative

- ❌ The trust model is a group of friends. Anyone who has the invite link can claim a name that nobody has claimed yet.
  Organizers see who joined and can release a name.
- ❌ A token stored by a messaging app's built-in browser does not exist in Safari, and the other way round. The player
  then needs a recovery link or the personal link.
- ❌ Organizers carry the recovery work.

### Neutral

- ↔️ Passkeys could later protect a player token without an account: they sync through iCloud Keychain and Google
  Password Manager and survive a new phone. They need a native module and development builds, and a `webcredentials`
  entry next to the universal links files. That would need a new ADR.
- ↔️ Real accounts can come later by linking players to an account. That would also need a new ADR.

## References

- [ADR-0001: Call a dedicated slots service next to Frontis](0001-call-a-dedicated-slots-service.md)
- [ADR-0004: Call pik on its own origin from the web build](0004-call-pik-on-its-own-origin-from-the-web-build.md)
- [pik: the slots service](https://github.com/pilotariak/pik)
- [WebKit: Full Third-Party Cookie Blocking and More (7-day cap on script-writable storage)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Framadate](https://framadate.org/)
