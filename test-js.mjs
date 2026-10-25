import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { once } from "node:events"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"
import { LeviathanClient, LeviathanAPIError } from "./index.mjs"

test("JavaScript client follows cursor pages on the same origin and reads exact catalog IDs", async () => {
  const seen = []
  const server = createServer((req, res) => {
    seen.push(req.url)
    assert.equal(req.headers["leviathan-api-version"], "1")
    res.setHeader("Content-Type", "application/json")
    const url = new URL(req.url, "http://localhost")
    if (url.pathname.startsWith("/api/v1/resources/")) res.end(JSON.stringify({ id: "service:rack", markdown: "# Rack", canonical: "https://www.leviathansystems.co/services/rack" }))
    else res.end(JSON.stringify({ items: [{ id: "service:rack" }], total: 2, next_cursor: url.searchParams.has("cursor") ? null : "next-page", next: "https://untrusted.invalid/ignored" }))
  })
  server.listen(0, "127.0.0.1"); await once(server, "listening")
  try {
    const client = new LeviathanClient({ baseUrl: `http://127.0.0.1:${server.address().port}` })
    const pages = []
    for await (const page of client.resourcePages({ q: "rack", kind: "service", limit: 1 })) pages.push(page)
    assert.equal(pages.length, 2)
    assert.ok(seen.every(url => url.startsWith("/api/v1/resources?") && url.includes("q=rack") && url.includes("kind=service")))
    assert.match((await client.readResource(pages[0].items[0].id)).markdown, /^# Rack/)
    assert.ok(seen.at(-1).endsWith("service%3Arack"))
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)) }
})

test("JavaScript client exposes typed HTTP errors without automatic retries", async () => {
  let calls = 0
  const client = new LeviathanClient({ fetch: async () => { calls++; return Response.json({ code: "RATE_LIMITED", detail: "Retry later" }, { status: 429, headers: { "Retry-After": "8" } }) } })
  await assert.rejects(client.companyProfile(), error => error instanceof LeviathanAPIError && error.status === 429 && error.code === "RATE_LIMITED" && error.retryAfter === "8")
  assert.equal(calls, 1)
  const malformed = new LeviathanClient({ fetch: async () => Response.json(null) })
  await assert.rejects(malformed.companyProfile(), error => error.code === "INVALID_RESPONSE")
  assert.throws(() => client.readResource("../../private"), TypeError)
  assert.throws(() => client.listResources({ limit: 51 }), TypeError)
  assert.throws(() => new LeviathanClient({ baseUrl: "https://user:secret@example.com" }), TypeError)
})

test("CLI help/version and invalid inputs have stable output and exit codes", () => {
  const cli = fileURLToPath(new URL("./cli.mjs", import.meta.url))
  const help = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" })
  assert.equal(help.status, 0); assert.match(help.stdout, /public content CLI/)
  const invalid = spawnSync(process.execPath, [cli, "read", "../../private"], { encoding: "utf8" })
  assert.equal(invalid.status, 1); assert.equal(JSON.parse(invalid.stderr).code, "INVALID_REQUEST")
  const version = spawnSync(process.execPath, [cli, "--version"], { encoding: "utf8" })
  assert.equal(version.stdout.trim(), "1.0.1")
})
