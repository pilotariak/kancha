---
adr: 0001
status: ✅ Accepted
deciders: nlamirault
consulted:
informed:
date: 2026-11-23
spdx-license: Apache-2.0
---

# ADR-0001: Call a dedicated slots service next to Frontis

## Context

Kancha reads all its data from Frontis. Until now the [architecture](../explanation/architecture.md) page stated it
plainly: Kancha never talks directly to subgraphs, and all data goes through Frontis.

The Créneaux (slots) screens break that rule. A slot is a court that a group of friends books at a fixed time, every
week or every other week. For each session, each player answers OK, KO or available if needed, and the session takes
place only when at least four players answer OK. Groups range from five to about ten players.

The prototype in `src/app/(tabs)/slot/` has been hidden since #77. It runs on hardcoded data (`SLOT_CONFIG`,
`mockStatusCounts`) and saves nothing. To ship it, answers must be shared between the players of a group, written by
them and kept private to the group.

[Frontis ADR-0001](https://github.com/pilotariak/frontis/blob/main/docs/adr/0001-keep-slot-data-out-of-frontis.md)
keeps that data out of Frontis. It lives in pik ([`pilotariak/pik`](https://github.com/pilotariak/pik)), a Cloudflare
Worker and a D1 database in their own repository.

## Considered Options

1. Local data only, persisted on the device with the existing Zustand stores.
2. A `slots` subgraph in Frontis, read and written through the existing GraphQL client.
3. A separate HTTPS and JSON client for pik, wrapped in TanStack Query hooks.
4. An external tool (a chat poll, a scheduling site) that Kancha links to.

## Pros and Cons

### 1. Local data only

**Pros:**

- ✅ No backend and no network errors.

**Cons:**

- ❌ Players cannot see each other's answers, which is the whole point of the feature.

### 2. A `slots` subgraph in Frontis

**Pros:**

- ✅ One endpoint and one client for all data.

**Cons:**

- ❌ Rejected on the Frontis side: it would add mutations and end-user authentication to a public, read-only gateway.

### 3. A client for pik

**Pros:**

- ✅ The competitions code and its Frontis queries do not change.
- ✅ Slot data follows the same pattern as Frontis data: TanStack Query hooks, refetch on focus and on pull to refresh,
  no network call from components.
- ✅ Answers can be shown at once with optimistic updates and rolled back if the service refuses them.

**Cons:**

- ❌ A second base URL to configure per environment, and a second source of network errors.
- ❌ The web build calls pik on its own origin, so pik must allow `https://kancha.pilotariak.com` through CORS
  ([ADR-0004](0004-call-pik-on-its-own-origin-from-the-web-build.md)).

### 4. An external tool

**Pros:**

- ✅ Nothing to build or run.

**Cons:**

- ❌ No link with the rest of Kancha: no lineup, no pairs, no game started in Score with the teams filled in.
- ❌ The prototype screens would be dropped.

## Decision

We will use _option 3_: Kancha gets its own client for pik, with TanStack Query hooks, next to the Frontis client.
Kancha keeps reading competition data from Frontis only.

## Consequences

### Positive

- ✅ The slots feature ships without touching the competitions screens or Frontis.
- ✅ Slot data can be removed or replaced without affecting the rest of the app.

### Negative

- ❌ Kancha now talks to two backends. The [architecture](../explanation/architecture.md) page says so.
- ❌ Offline and error states must be designed for a second service.

### Neutral

- ↔️ pik computes session dates, deadlines and session states in the `Europe/Paris` time zone. Kancha displays them and
  does not recompute them, so the date logic lives in one place.
- ↔️ Drawing the pairs for a session stays a pure function in Kancha, tested like `features/score`. pik only stores
  the result.
- ↔️ The web build reaches pik on its own origin, like the native app: see
  [ADR-0004](0004-call-pik-on-its-own-origin-from-the-web-build.md).

## References

- [Frontis ADR-0001: Keep slot data out of Frontis](https://github.com/pilotariak/frontis/blob/main/docs/adr/0001-keep-slot-data-out-of-frontis.md)
- [pik: the slots service](https://github.com/pilotariak/pik)
- [ADR-0002: Identify slot players without accounts](0002-identify-slot-players-without-accounts.md)
- [ADR-0003: Use share messages instead of push notifications for slots](0003-use-share-messages-instead-of-push-notifications.md)
- [ADR-0004: Call pik on its own origin from the web build](0004-call-pik-on-its-own-origin-from-the-web-build.md)
- [#77: hide the Créneaux tab until the screen ships](https://github.com/pilotariak/kancha/issues/77)
