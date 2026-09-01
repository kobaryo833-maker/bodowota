import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { loadConfig } from './config.ts'

const config = loadConfig()
const app = new Hono()

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    // Surfaced so it is obvious at a glance whether the pending BGG application has
    // been wired up yet, without exposing the token itself.
    bggTokenConfigured: config.bgg.token !== null,
  }),
)

serve({ fetch: app.fetch, port: config.port }, ({ port }) => {
  console.log(`bodowota-server listening on http://localhost:${port}`)
})
