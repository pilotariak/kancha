---
adr: 0004
status: ✅ Accepted
deciders: nlamirault
consulted:
informed:
date: 2026-11-23
spdx-license: Apache-2.0
---

# ADR-0004: Call pik on its own origin from the web build

## Context

[ADR-0002](0002-identify-slot-players-without-accounts.md) gives each device a player token for the slots feature. The
app keeps it in secure storage. The web build is the hard case:

- Safari deletes a website's script-writable storage (`localStorage`, IndexedDB, cookies written with
  `document.cookie`) after seven days of browser use without a visit. A web player of a slot that meets every other week
  loses a token kept there between two sessions.
- A cookie set by the server with `HttpOnly` is not script-writable. Safari still shortens server-set cookies in some
  setups where the API is not served from the site's own address. Which setups exactly has to be checked, not assumed.
- Links opened from a messaging app may open in that app's built-in browser, whose storage is separate from Safari's.
  No storage choice fixes that case.

The Kancha website is a static Expo export deployed to Cloudflare Pages (`kancha-website`) with
`wrangler pages deploy dist`. The repo has no `functions/` directory and no Wrangler configuration. `public/_redirects`
sends every path to `index.html`. `public/_headers` sets no Content-Security-Policy, so no `connect-src` rule restricts
which origins the page can call.

pik ([`pilotariak/pik`](https://github.com/pilotariak/pik)) is a Cloudflare Worker with its own D1 database
([ADR-0001](0001-call-a-dedicated-slots-service.md)), at `https://pik.pilotariak.com`. The native app calls it at
`EXPO_PUBLIC_PIK_URL`. In development, pik runs at `http://localhost:8787` and the web build at `http://localhost:8081`,
served by the Expo dev server (Metro), which forwards no path to another server.

## Considered Options

1. pik on its own origin, the token in browser storage, CORS for `https://kancha.pilotariak.com`.
2. pik on its own subdomain of `pilotariak.com`, the token in an `HttpOnly` cookie set by pik, CORS with credentials.
3. pik behind `https://kancha.pilotariak.com/api/*`: a Pages Function forwards the requests to pik through a service
   binding, and the token is an `HttpOnly` cookie on the Kancha origin.

## Pros and Cons

### 1. Own origin, browser storage

**Pros:**

- ✅ No change to the Kancha web deployment.

**Cons:**

- ❌ Safari deletes the token after seven days without a visit. Web players depend on a recovery link or their personal
  link every other week.
- ❌ The token is readable by any script on the page.

### 2. Own subdomain, cookie set by pik

**Pros:**

- ✅ The token is out of reach of page scripts.
- ✅ No change to the Kancha web deployment.
- ✅ One base URL for every build: the web build calls pik at `EXPO_PUBLIC_PIK_URL`, like the native app.
- ✅ The web build reaches a local pik in development, with no forward to set up in the Expo dev server.

**Cons:**

- ❌ Credentialed CORS on every call, and cookie behaviour that depends on how Safari judges the API's address.
- ❌ The web and native builds authenticate differently, and the web one is the harder to test.
- ❌ pik keeps a list of the origins allowed to call it with the cookie, one per environment.

### 3. Same origin through a Pages Function

**Pros:**

- ✅ The cookie belongs to the site itself, which is the case Safari treats best.
- ✅ No CORS: the page calls its own origin.
- ✅ The token is out of reach of page scripts.

**Cons:**

- ❌ The web deployment changes: a `functions/api/[[path]].ts` file at the repo root, picked up by
  `wrangler pages deploy`, and a service binding to pik, set in a new Wrangler configuration for Pages or in the
  dashboard.
- ❌ Every web call goes through one more hop, and Pages Function requests count toward the Workers request quota.
- ❌ The `/* /index.html 200` rule in `public/_redirects` must not catch `/api/*`. That has to be checked on a preview
  deployment.
- ❌ Pages does not apply `public/_headers` to responses from Functions, so pik sets its own security headers.
- ❌ The Expo dev server does not forward `/api`, so the web build has no slots in development without a proxy of its
  own.

## Decision

We choose _option 2_. This ADR first proposed option 3: it was dropped so that the web build calls pik like the native
app, in development as in production.

The rules:

- Every build calls pik at `EXPO_PUBLIC_PIK_URL` followed by `/api/v1`: `https://pik.pilotariak.com` in production,
  `http://localhost:8787` in development.
- pik sets the token in a cookie with `HttpOnly`, `Secure`, `SameSite=Lax` and `Path=/api`. `kancha.pilotariak.com` and
  `pik.pilotariak.com` belong to the same site, and so do two ports of `localhost`, so a `SameSite=Lax` cookie goes with
  the web build's calls.
- The web build calls pik with `credentials: "include"`. The native app sends the token in an `Authorization: Bearer`
  header and calls with `credentials: "omit"`, so that its cookie jar never keeps pik's cookie.
- pik answers CORS for a list of allowed origins only, set per environment: `https://kancha.pilotariak.com` in
  production, `http://localhost:8081` in development. It echoes the request's origin, never `*`, allows credentials,
  answers the preflight, and sets these headers on every response, errors included. The same list drives the check of
  the `Origin` header on every write that comes with the cookie.

Still to check: that Safari for iOS keeps pik's cookie more than seven days without a visit. If it does not, we fall
back to option 1 and the recovery paths of ADR-0002.

## Consequences

### Positive

- ✅ One base URL for every build, and the web build can be tried against a local pik with `bunx expo start --web`.
- ✅ The Kancha web deployment stays a static export: no Function and no binding to a second Worker.
- ✅ The token stays out of reach of page scripts.

### Negative

- ❌ pik must answer CORS correctly. A missing header on an error response hides pik's problem from the page, which then
  shows a network error.
- ❌ Web players on Safari may still lose their token after seven days, until the check above is done.
- ❌ Players who answer from a messaging app's built-in browser still lose their token when they switch to Safari.

### Neutral

- ↔️ Preview deployments of the website have their own origins: they need a pik environment that is not production
  and that allows them.
- ↔️ If `public/_headers` gains a Content-Security-Policy, its `connect-src` must allow pik's origin.

## References

- [ADR-0001: Call a dedicated slots service next to Frontis](0001-call-a-dedicated-slots-service.md)
- [ADR-0002: Identify slot players without accounts](0002-identify-slot-players-without-accounts.md)
- [pik: the slots service](https://github.com/pilotariak/pik)
- [pik#18: answer CORS for the Kancha web origins](https://github.com/pilotariak/pik/issues/18)
- [#156: forward /api to pik from the Kancha website (option 3, not planned)](https://github.com/pilotariak/kancha/issues/156)
- [WebKit: Full Third-Party Cookie Blocking and More (7-day cap on script-writable storage)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [MDN: CORS requests with credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS#requests_with_credentials)
- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value)
