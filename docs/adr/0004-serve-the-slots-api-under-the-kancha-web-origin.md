---
adr: 0004
status: 🤔 Proposed
deciders: nlamirault
consulted:
informed:
date: 2026-11-23
spdx-license: Apache-2.0
---

# ADR-0004: Serve the slots API under the Kancha web origin

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
([ADR-0001](0001-call-a-dedicated-slots-service.md)).

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

**Cons:**

- ❌ Credentialed CORS on every call, and cookie behaviour that depends on how Safari judges the API's address.
- ❌ The web and native builds authenticate differently, and the web one is the harder to test.

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

## Decision

We propose _option 3_, provided that a test on Safari for iOS confirms that the cookie survives more than seven days
without a visit. If it does not, we fall back to option 1 and the recovery paths of ADR-0002.

The rules:

- pik sets the token in a cookie with `HttpOnly`, `Secure`, `SameSite=Lax` and `Path=/api`.
- pik accepts the token either from that cookie or from an `Authorization: Bearer` header. It checks the `Origin`
  header on every write that comes with the cookie.
- The Pages Function forwards the method, path, query, body and the cookie and authorization headers, and nothing else.

Still open: whether the native app also calls `https://kancha.pilotariak.com/api`, which gives one base URL for every
build, or calls pik directly, which saves a hop.

## Consequences

### Positive

- ✅ Web players on Safari should keep their token between sessions, so the personal link of ADR-0002 stays a fallback.
- ✅ pik needs no CORS configuration for the website.

### Negative

- ❌ The Kancha web deployment gains a Function and a binding to a second Worker, which a deployment can now break.
- ❌ Players who answer from a messaging app's built-in browser still lose their token when they switch to Safari.

### Neutral

- ↔️ Preview deployments of the website need their own service binding, to a pik environment that is not production.
- ↔️ Once a Wrangler configuration file defines the Pages bindings, it is their source of truth: the same fields can no
  longer be edited in the dashboard.

## References

- [ADR-0001: Call a dedicated slots service next to Frontis](0001-call-a-dedicated-slots-service.md)
- [ADR-0002: Identify slot players without accounts](0002-identify-slot-players-without-accounts.md)
- [pik: the slots service](https://github.com/pilotariak/pik)
- [WebKit: Full Third-Party Cookie Blocking and More (7-day cap on script-writable storage)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [Cloudflare Pages Functions: routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Cloudflare Pages Functions: service bindings](https://developers.cloudflare.com/pages/functions/bindings/#service-bindings)
- [Cloudflare Pages Functions: Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
