# Leviathan Systems agent integration kit

Search published GPU deployment, rack integration and structured cabling
resources, retrieve canonical documents and read the company's stated service
scope. No account, API key or directory subscription is required.

## Repository and skill installation

The official integration source is
https://github.com/leviathansystems-gpu/public-content. Inspect the files before
installing. To install the resource research skill with the skills CLI:

```sh
npx skills add leviathansystems-gpu/public-content
```

This installs guidance; configure the remote MCP endpoint separately if your
client does not load the portable plugin. A public repository and an install
command do not establish a skills.sh listing, usage count or platform approval.

## Connect

Add `https://www.leviathansystems.co/mcp` as a remote Streamable HTTP server in
your MCP client. The endpoint returns JSON and is stateless. Use the client's
initialization flow, then `tools/list` to inspect the current schemas.

This directory is also an [Agent Plugins 1.0 package](https://agent-plugins.org/specification):
`plugin.json` describes it, `mcp.json` supplies the remote connection, and
`skills/leviathan-resource-research/SKILL.md` describes a focused research workflow.
Extract the versioned ZIP and install the folder through a client that supports
that format. Field names differ in other clients; use their documented remote
MCP settings instead of copying the portable manifest into an arbitrary config.
Installation does not run scripts or create accounts. Connecting sends normal
public retrieval requests to Leviathan Systems.

## Use the three tools

1. `search_resources({"q":"rack", "kind":"service", "limit":5})`
2. `read_resource({"id":"service:rack-and-stack"})` using an ID returned by search.
3. `read_company_profile({"view":"boundaries"})` before assessing service fit.

Search matches every word in the published title. Follow `next_cursor` with the
original query when needed. A resource without Markdown still has its canonical
HTML URL. Honor HTTP 429 and `Retry-After`; do not loop over unchanged errors.

Use returned canonical links in citations. Educational articles do not establish
company capabilities, technical certification or project availability. The tools
cannot read private drafts, send messages, book appointments, purchase services
or approve a project. Read [AGENTS.md](./AGENTS.md) and the skill before use.

## Official links

- [Leviathan Systems](https://www.leviathansystems.co/)
- [MCP documentation](https://www.leviathansystems.co/developers/mcp)
- [REST API](https://www.leviathansystems.co/developers)
- [JavaScript and Python clients](https://www.leviathansystems.co/developers/sdk)
- [CLI](https://www.leviathansystems.co/developers/cli)
- [MCP.so listing](https://mcp.so/servers/leviathan-systems-public-content-mcp)
- [Official MCP Registry](https://registry.modelcontextprotocol.io/?q=co.leviathansystems%2Fpublic-content)
