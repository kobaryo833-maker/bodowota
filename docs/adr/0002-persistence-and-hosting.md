# ADR 0002 — Persistence and hosting

Date: 2026-09-02
Status: **Open — deliberately deferred to M3**

## Context
Two things need to be stored: the BGG metadata cache (write-once, read-many, 7-day TTL)
and the user's own collection (small, must not be lost). Where the service runs is
coupled to this choice, and one requirement constrains it more than it looks:

**the 1 req/sec limit to BGG must hold globally.** A single long-lived process makes that
trivial. A serverless runtime with many short-lived isolates does not — it needs an
external lock or a queue, which is real extra complexity.

## Interim decision
Keep it repo-contained: an in-memory cache plus a JSON file for durability, both behind a
`CacheStore` / `CollectionStore` interface. Nothing above the interface knows the
difference. This lets M1 and M2 finish without prejudging deployment.

## Options to decide at M3
1. **SQLite + Fly.io or a small VPS** — one long-lived process, so the global rate limit
   is a plain in-process queue. Local dev and production are the same shape. Cheapest to
   reason about. Current lean.
2. **Cloudflare Workers + D1/KV** — generous free tier, no cold-start cost to me, but the
   global 1 req/sec queue needs a Durable Object to serialize through. Extra moving part
   in exactly the place where breaking the rate limit costs API access.
3. **Postgres (Supabase/Neon)** — only worth it if real multi-user accounts and
   cross-device sync arrive. Overkill for a single-user collection manager today.

## Decision criteria (write the answer here at M3)
- Does the rate limiter still provably serialize in the chosen runtime?
- Can I restore the collection from a backup without a console?
- Monthly cost at zero users.
