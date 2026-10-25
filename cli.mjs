#!/usr/bin/env node
import { LeviathanClient } from "./index.mjs"
const [command, ...args] = process.argv.slice(2)
const help = `Leviathan Systems public content CLI 1.0.1
Usage:
  leviathan-content list [article|service]
  leviathan-content search <title words>
  leviathan-content read <article:slug|service:slug>
  leviathan-content profile
Output is JSON. All commands read published content. No key or sign-in is required.
`
try {
  const client = new LeviathanClient()
  let data
  if (!command || ["help", "--help", "-h"].includes(command)) { process.stdout.write(help); process.exit(0) }
  else if (["--version", "-v"].includes(command)) { process.stdout.write("1.0.1\n"); process.exit(0) }
  else if (command === "list" && args.length <= 1) data = await client.listResources({ ...(args[0] ? { kind: args[0] } : {}) })
  else if (command === "search" && args.length) data = await client.listResources({ q: args.join(" ") })
  else if (command === "read" && args.length === 1) data = await client.readResource(args[0])
  else if (command === "profile" && !args.length) data = await client.companyProfile()
  else throw new Error("Invalid command. Run leviathan-content --help")
  process.stdout.write(JSON.stringify(data, null, 2) + "\n")
} catch (error) { process.stderr.write(JSON.stringify({ code: error.code || "INVALID_REQUEST", message: error.message, ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}) }) + "\n"); process.exitCode = 1 }
