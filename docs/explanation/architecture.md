# Architecture

## Platform overview

Kancha is the mobile client in the Pilotariak platform — a Basque pelota competition management system. It sits at the edge of a federated GraphQL architecture:

```
Kancha (React Native / Expo)
  │  GraphQL over HTTPS
  ▼
Frontis (GraphQL Gateway, :4000)  — hive-gateway federation
  ├─── specialties (:4004)        — Specialty entities
  ├─── clubs (:4001)              — Club entities
  ├─── competitions (:4002)       — Competition entities
  └─── results (:4005)            — Result, Player entities
```

Kancha never talks directly to subgraphs. All data goes through Frontis.

## Why Expo

Expo provides a single codebase for iOS, Android, and web with a managed build pipeline (EAS). The Kancha web build is deployed to Cloudflare Pages as a progressive fallback. Native and web share 100 % of the business logic and UI components; platform differences are handled by Expo's abstraction layer.

## Navigation structure

Kancha uses Expo Router (file-system routing). The navigation funnel is:

```
(tabs)
  └── competitions
        └── [specialty]
              └── [category]
                    └── [tournament]
                          ├── bracket   — elimination bracket view
                          ├── score     — match scoreboard
                          └── details   — match detail
```

The funnel is linear: users drill from specialty → category → tournament → match. Back navigation returns to the previous selection without resetting the query state.

## Data fetching

GraphQL queries are issued from screen components using the configured `EXPO_PUBLIC_API_URL` endpoint. There is no local cache layer beyond React state — the Frontis gateway handles caching and federation.

## Internationalization

Kancha supports multiple display languages via the i18n subsystem. The language is selected in-app and persisted locally. The data from Frontis is locale-neutral (sport terminology in Basque, French, Spanish).

## Multi-league support

Leagues are fetched at app startup and stored in context. The league picker renders at the root of the competition funnel. Switching leagues re-initializes the funnel from the specialty selection.
