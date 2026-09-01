# ADR 0001 — Backend on TypeScript + Hono

Date: 2026-09-02
Status: Accepted

## Context
The iOS client must never hold the BGG credentials, so a backend of my own sits in
between. It has to parse XML, enforce 1 req/sec globally, cache aggressively, and expose
a small JSON API. It is a personal project, so maintenance cost matters more than raw
throughput.

## Decision
TypeScript + Hono on Node 22.

## Consequences
- Hono is runtime-agnostic, so the hosting decision (ADR 0002) stays open without a
  rewrite — the same handlers run on Node, Bun, or Cloudflare Workers.
- Strong typing across the XML→domain→JSON boundary, which is where the bugs live.
- Node 22 has `fetch` built in; no HTTP client dependency.
- Rejected: Go (more code for no benefit at this scale), Python/FastAPI (no advantage
  here), Swift/Vapor (would share models with iOS, but narrows hosting a lot and the
  server ecosystem is thinner).
