# Bodowota / ボドヲタ

日本人向けボードゲーム所持管理アプリ「ボドヲタ」。iOS 予定。BGG XML API を利用。

A personal board game collection manager. Records the games you physically own, shows the
basics at a glance (player count, playing time, publisher, cover art) so you can pick what
to play, and tracks crowdfunding pledges alongside the shelf so undelivered games stay
visible.

Game data comes from [BoardGameGeek](https://boardgamegeek.com/) via its XML API, and every
game links back to its BGG page. **Status: pre-release, in development.**

## Repository layout

```
src/
  config.ts        startup configuration + the guardrails on our BGG rate limit
  bgg/             BGG XML API access layer (rate limiter, XML mapping, 202 handling)
  cache/           metadata cache behind a storage-agnostic interface
  collection/      the user's owned/pledged collection
  http/            Hono routes — the JSON API the iOS client talks to
  index.ts         server entry point
test/fixtures/bgg  recorded XML responses; the access layer is tested against these
docs/
  roadmap.md                    milestones M0–M5, and the macOS constraint on releasing
  bgg-api-application.md        what we told BGG we would do
  adr/                          decisions, including the ones left open on purpose
```

## Local development

Requires Node 22+.

```bash
npm install
cp .env.example .env
npm test
```

Run the server:

```bash
npm run dev
```

```bash
curl -s localhost:8787/health
```

## BGG API access

The XML API application was submitted on 2026-09-02 and is **pending review**, so there is
no token yet. That is not a blocker: the access layer is built and tested against recorded
XML fixtures, and the server boots with `BGG_API_TOKEN` empty. When the token arrives it
goes into `.env` and nothing else changes.

Three commitments from that application are enforced in code rather than left to
discipline, because breaking them costs API access:

- **1 request/second to BGG, globally.** `loadConfig` refuses to start if
  `BGG_MAX_REQUESTS_PER_SECOND` is raised above 1.
- **Cache first, ~7 day TTL.** Repeat views of a game cost zero requests.
- **The token never ships in a client binary.** The iOS app talks only to this server.

Read [docs/bgg-api-application.md](docs/bgg-api-application.md) before touching anything in
`src/bgg/`.

## License

TBD.
