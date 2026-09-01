# Bodowota — Roadmap

Last updated: 2026-09-02
Status: BGG XML API application submitted, **pending review**

## Decisions (fixed)

| Area | Choice |
|---|---|
| Backend | TypeScript + Hono |
| Runtime | Node 22 (`node --experimental-strip-types` not needed; we compile with tsc) |
| Tests | Vitest, against recorded XML fixtures (no network, no token required) |
| Client | iOS app, SwiftUI |
| Persistence | **Open** — see ADR 0002. Repo-contained for now. |
| Hosting | **Open** — see ADR 0002. |

## Hard constraint: macOS Monterey 12.7.6

This shapes the whole iOS half of the plan, so it is stated up front.

- Monterey 12.7.6 caps you at **Xcode 14.2** → iOS SDK 16.2, Swift 5.7.
- Development and Simulator work fine. **App Store / TestFlight submission does not**:
  since April 2025 Apple requires builds made with the iOS 18 SDK (Xcode 16), which needs
  macOS 14.5+ (Sonoma).
- Therefore: build the app on Monterey, but **releasing requires a macOS upgrade** (or a
  newer Mac / a CI mac runner) at M5. Check whether your Mac model supports Sonoma before
  M4 ends.
- Consequences for the iOS code, decided now to avoid a rewrite later:
  - Deployment target **iOS 16**.
  - **Do not use SwiftData** (iOS 17+) or the `@Observable` macro (iOS 17+).
    Use `ObservableObject` + Core Data or GRDB.swift.
  - `NavigationStack`, `Swift Charts`, `AsyncImage` are all available on iOS 16. Fine.

## Milestones

### M0 — Scaffolding & decisions  ← **STEP 1, in progress**
Goal: a repo you can run `npm test` in, and a written record of the open decisions.
- [ ] `git init`, `.gitignore`, npm project, TypeScript strict, Vitest
- [ ] Directory layout for the backend
- [ ] ADR 0001 (backend stack), ADR 0002 (persistence/hosting — deliberately open)
- [ ] README with local dev instructions
Exit: `npm test` passes on a trivial test. No BGG token needed.

### M1 — BGG access layer (the part the application promised)
Goal: every promise made in the API application exists as tested code.
- [ ] Serial request queue, hard-capped at 1 req/sec, single global queue
- [ ] Exponential backoff on 429/5xx, bounded retries
- [ ] HTTP 202 handling for `/xmlapi2/collection` (poll-until-ready with backoff)
- [ ] XML → typed domain objects for `thing`, `search`, `collection`
- [ ] Persistent cache interface with 7-day TTL, cache-first reads
- [ ] Recorded XML fixtures + unit tests for all of the above
Exit: full test coverage of the access layer with zero network calls.
Note: this is the milestone to finish while the application is pending. It needs no token.

### M2 — Internal HTTP API + contract
Goal: a JSON API the iOS client can code against, frozen before iOS work starts.
- [ ] `GET /api/games/:bggId`, `GET /api/search?q=`, `POST /api/import/bgg`
- [ ] Collection CRUD (owned games, play status, notes)
- [ ] OpenAPI document generated from the route definitions
- [ ] Auth: single-user token to start; no user accounts yet
Exit: `curl` can drive the whole app. OpenAPI spec handed to the iOS side.

### M3 — Persistence + Gamefound
- [ ] Resolve ADR 0002, swap the storage implementation in behind the interface
- [ ] Gamefound public API client for pledge tracking (own rate limit + cache)
- [ ] Pledged-but-undelivered games surfaced alongside owned games
Exit: data survives a restart; pledges show up.

### M4 — iOS client (requires the Mac)
- [ ] Xcode 14.2 project, iOS 16 target, SwiftUI
- [ ] Collection list, game detail, add-by-search, BGG import
- [ ] **BGG attribution + links back to BGG pages** (promised in the application)
- [ ] Offline read of the local collection
Exit: runs on a device.

### M5 — Release prep  (blocked on macOS upgrade)
- [ ] macOS 14.5+ / Xcode 16 available
- [ ] If monetization is on the table by now: contact BGG and re-apply for commercial
      access BEFORE shipping it (promised in field 12 of the application)
- [ ] Privacy policy, App Store metadata, screenshots

## While the application is pending

M0 → M1 → M2 need no BGG token. Fixtures stand in for the live API. When the token
arrives, the only change is dropping it into the config; if the access layer is done
right, nothing else moves.
