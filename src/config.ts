/**
 * Configuration, validated once at startup.
 *
 * The rate limit and cache TTL here are not tuning knobs: they are commitments made in
 * the BGG XML API application (1 request/second, ~7 day cache). `loadConfig` refuses to
 * start with values that would break those promises, so a careless `.env` edit fails
 * loudly instead of quietly costing us API access.
 */

export interface Config {
  port: number
  bgg: {
    baseUrl: string
    /** Empty until the pending API application is approved. */
    token: string | null
    maxRequestsPerSecond: number
    cacheTtlMs: number
    userAgent: string
  }
}

/** Ceiling promised to BGG. Raising this is a terms violation, not a config change. */
export const MAX_ALLOWED_REQUESTS_PER_SECOND = 1

export class ConfigError extends Error {
  override name = 'ConfigError'
}

type Env = Record<string, string | undefined>

function requireString(env: Env, key: string, fallback?: string): string {
  const raw = env[key]?.trim()
  if (raw) return raw
  if (fallback !== undefined) return fallback
  throw new ConfigError(`${key} is required`)
}

function requireNumber(env: Env, key: string, fallback: number): number {
  const raw = env[key]?.trim()
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value)) throw new ConfigError(`${key} must be a number, got "${raw}"`)
  return value
}

export function loadConfig(env: Env = process.env): Config {
  const port = requireNumber(env, 'PORT', 8787)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`PORT must be an integer between 1 and 65535, got ${port}`)
  }

  const baseUrl = requireString(env, 'BGG_API_BASE_URL', 'https://boardgamegeek.com/xmlapi2')
  let parsedBaseUrl: URL
  try {
    parsedBaseUrl = new URL(baseUrl)
  } catch {
    throw new ConfigError(`BGG_API_BASE_URL must be a valid URL, got "${baseUrl}"`)
  }
  if (parsedBaseUrl.protocol !== 'https:') {
    throw new ConfigError('BGG_API_BASE_URL must use https')
  }

  const maxRequestsPerSecond = requireNumber(
    env,
    'BGG_MAX_REQUESTS_PER_SECOND',
    MAX_ALLOWED_REQUESTS_PER_SECOND,
  )
  if (maxRequestsPerSecond <= 0) {
    throw new ConfigError('BGG_MAX_REQUESTS_PER_SECOND must be greater than 0')
  }
  if (maxRequestsPerSecond > MAX_ALLOWED_REQUESTS_PER_SECOND) {
    throw new ConfigError(
      `BGG_MAX_REQUESTS_PER_SECOND must not exceed ${MAX_ALLOWED_REQUESTS_PER_SECOND}: ` +
        'we committed to that limit in our XML API application',
    )
  }

  const cacheTtlDays = requireNumber(env, 'BGG_CACHE_TTL_DAYS', 7)
  if (cacheTtlDays <= 0) throw new ConfigError('BGG_CACHE_TTL_DAYS must be greater than 0')

  // A token is optional on purpose: the access layer is built against fixtures while the
  // application is pending, so the server must boot without one.
  const token = env['BGG_API_TOKEN']?.trim() || null

  const userAgent = requireString(env, 'BGG_USER_AGENT', 'Bodowota/0.1 (+https://github.com/kobaryo833-maker/bodowota)')

  return {
    port,
    bgg: {
      baseUrl: parsedBaseUrl.toString().replace(/\/$/, ''),
      token,
      maxRequestsPerSecond,
      cacheTtlMs: cacheTtlDays * 24 * 60 * 60 * 1000,
      userAgent,
    },
  }
}
