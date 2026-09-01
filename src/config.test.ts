import { describe, expect, it } from 'vitest'
import { ConfigError, loadConfig } from './config.ts'

const minimal = {} satisfies Record<string, string | undefined>

describe('loadConfig', () => {
  it('boots with no environment at all, using the documented defaults', () => {
    const config = loadConfig(minimal)
    expect(config.port).toBe(8787)
    expect(config.bgg.baseUrl).toBe('https://boardgamegeek.com/xmlapi2')
    expect(config.bgg.maxRequestsPerSecond).toBe(1)
    expect(config.bgg.cacheTtlMs).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it('treats a missing or blank BGG token as "not yet approved" rather than an error', () => {
    expect(loadConfig(minimal).bgg.token).toBeNull()
    expect(loadConfig({ BGG_API_TOKEN: '   ' }).bgg.token).toBeNull()
    expect(loadConfig({ BGG_API_TOKEN: ' abc123 ' }).bgg.token).toBe('abc123')
  })

  it('refuses a rate limit above the 1 req/sec we promised BGG', () => {
    expect(() => loadConfig({ BGG_MAX_REQUESTS_PER_SECOND: '5' })).toThrow(ConfigError)
    expect(() => loadConfig({ BGG_MAX_REQUESTS_PER_SECOND: '5' })).toThrow(/XML API application/)
  })

  it('allows a rate limit below the promised ceiling', () => {
    expect(loadConfig({ BGG_MAX_REQUESTS_PER_SECOND: '0.5' }).bgg.maxRequestsPerSecond).toBe(0.5)
  })

  it.each(['0', '-1', 'fast'])('rejects a nonsensical rate limit: %s', (value) => {
    expect(() => loadConfig({ BGG_MAX_REQUESTS_PER_SECOND: value })).toThrow(ConfigError)
  })

  it('rejects a non-https or malformed BGG base url', () => {
    expect(() => loadConfig({ BGG_API_BASE_URL: 'http://boardgamegeek.com/xmlapi2' })).toThrow(/https/)
    expect(() => loadConfig({ BGG_API_BASE_URL: 'not a url' })).toThrow(/valid URL/)
  })

  it('strips a trailing slash from the base url so path joins stay predictable', () => {
    expect(loadConfig({ BGG_API_BASE_URL: 'https://example.com/xmlapi2/' }).bgg.baseUrl).toBe(
      'https://example.com/xmlapi2',
    )
  })

  it.each(['0', '70000', '8787.5', 'eight'])('rejects an invalid port: %s', (value) => {
    expect(() => loadConfig({ PORT: value })).toThrow(ConfigError)
  })

  it('rejects a non-positive cache ttl', () => {
    expect(() => loadConfig({ BGG_CACHE_TTL_DAYS: '0' })).toThrow(ConfigError)
  })
})
