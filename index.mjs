export class LeviathanAPIError extends Error {
  constructor(message, { status = 0, code = "NETWORK_ERROR", retryAfter = null } = {}) {
    super(message); this.name = "LeviathanAPIError"; this.status = status; this.code = code; this.retryAfter = retryAfter
  }
}
export class LeviathanClient {
  constructor({ baseUrl = "https://www.leviathansystems.co", timeoutMs = 15000, fetch: fetcher = globalThis.fetch } = {}) {
    const origin = new URL(baseUrl)
    if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/" || (origin.protocol !== "https:" && !(origin.protocol === "http:" && ["localhost", "127.0.0.1"].includes(origin.hostname)))) throw new TypeError("baseUrl must be an HTTPS origin, or a local development origin")
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60000) throw new TypeError("timeoutMs must be from 1 to 60000")
    this.origin = origin.origin; this.timeoutMs = timeoutMs; this.fetcher = fetcher
  }
  async request(path) {
    let response
    try { response = await this.fetcher(this.origin + path, { headers: { Accept: "application/json", "Leviathan-API-Version": "1" }, signal: AbortSignal.timeout(this.timeoutMs), redirect: "error" }) }
    catch { throw new LeviathanAPIError("The content request could not complete. Retry after checking connectivity.") }
    let data
    try { data = await response.json() } catch { throw new LeviathanAPIError("The server returned an unreadable response", { status: response.status, code: "INVALID_RESPONSE" }) }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new LeviathanAPIError("The server returned an invalid document", { status: response.status, code: "INVALID_RESPONSE" })
    if (!response.ok) throw new LeviathanAPIError(data.detail || "Content request failed", { status: response.status, code: data.code || "HTTP_ERROR", retryAfter: response.headers.get("retry-after") })
    return data
  }
  listResources({ q, kind, limit = 20, cursor } = {}) {
    if (q !== undefined && (typeof q !== "string" || q.length > 200)) throw new TypeError("q must be a string of at most 200 characters")
    if (kind !== undefined && !["article", "service"].includes(kind)) throw new TypeError("kind must be article or service")
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new TypeError("limit must be from 1 to 50")
    if (cursor !== undefined && (typeof cursor !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(cursor))) throw new TypeError("cursor must come from a previous resource page")
    const params = new URLSearchParams({ limit: String(limit) })
    if (q !== undefined) params.set("q", q)
    if (kind !== undefined) params.set("kind", kind)
    if (cursor !== undefined) params.set("cursor", cursor)
    return this.request(`/api/v1/resources?${params}`)
  }
  async *resourcePages(options = {}) {
    let cursor = options.cursor
    const seen = new Set()
    do {
      const page = await this.listResources({ ...options, cursor })
      yield page
      cursor = page.next_cursor || undefined
      if (cursor && seen.has(cursor)) throw new LeviathanAPIError("The server repeated a cursor", { code: "INVALID_RESPONSE" })
      if (cursor) seen.add(cursor)
    } while (cursor)
  }
  readResource(id) {
    if (typeof id !== "string" || id.length > 210 || !/^(article|service):[a-z0-9-]+$/.test(id)) throw new TypeError("Use an article:slug or service:slug catalog ID")
    return this.request(`/api/v1/resources/${encodeURIComponent(id)}`)
  }
  companyProfile() { return this.request("/api/machine/home") }
}
