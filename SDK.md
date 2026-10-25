# Leviathan Systems public content clients 1.0.1

Official dependency-free JavaScript/TypeScript and Python clients for the public,
read-only content API. Search published titles, follow cursor pages, read a
catalog resource and retrieve the company profile. No account or API key is
needed. Package publisher authentication is separate from using the API.

## Source installation

Install from the official source repository:

```sh
npm install git+https://github.com/leviathansystems-gpu/public-content.git
python -m pip install git+https://github.com/leviathansystems-gpu/public-content.git
```

Registry availability is shown in the official SDK documentation. The existing
website-hosted 1.0.0 archives remain available with their original signatures.
Version 1.0.1 adds registry metadata and TypeScript declarations; it preserves
the read-only client behavior. The CLI and Python User-Agent report 1.0.1.

## JavaScript and TypeScript

Use Node.js 20 or later. The JavaScript client also supports modern browsers
on the same origin. The package includes declarations for TypeScript clients.

```js
import { LeviathanClient } from 'leviathan-public-content';
const client = new LeviathanClient();
const page = await client.listResources({ kind: 'service', q: 'rack', limit: 5 });
if (page.items.length) {
  const resource = await client.readResource(page.items[0].id);
  console.log(resource.canonical, resource.markdown);
}
```

The CLI prints JSON. After installation:

```sh
leviathan-content --help
leviathan-content search rack integration
leviathan-content read service:rack-and-stack
leviathan-content profile
```

## Python

Use Python 3.10 or later. The client uses only the standard library.

```python
from leviathan_public_content import LeviathanClient
client = LeviathanClient()
page = client.list_resources(kind="service", q="rack", limit=5)
if page["items"]:
    resource = client.read_resource(page["items"][0]["id"])
    print(resource["canonical"], resource["markdown"])
```

## Limits and errors

Search matches all query words in titles. JavaScript `resourcePages(options)`
and Python `resource_pages(**options)` retain the original query and origin.
Restart the search if a content revision invalidates a cursor. A null Markdown
body means read the returned canonical HTML URL.

`LeviathanAPIError` exposes HTTP status, a stable code and the retry interval
(`retryAfter` in JavaScript, `retry_after` in Python). Clients do not retry
automatically. Honor 429 and Retry-After, correct invalid input and keep reads
bounded. The default request timeout is 15 seconds; redirect responses are not
followed. Custom origins must be HTTPS, except localhost/127.0.0.1 for local tests.

Educational resources are not a statement of company capabilities, technical
certification or availability. Read the company profile and confirm the actual
project scope with the team. These clients cannot read private drafts, send
messages, book appointments, purchase services or approve engineering work.

## Official references

- https://www.leviathansystems.co/developers
- https://www.leviathansystems.co/developers/sdk
- https://www.leviathansystems.co/developers/cli
- https://www.leviathansystems.co/developers/mcp
- https://www.leviathansystems.co/openapi.json

The source license remains proprietary; this release does not relicense the
existing clients. No install scripts or runtime third-party dependencies are used.
