---
name: leviathan-batch-retrieval
description: Retrieve a selected set of Leviathan service and article records for a source pack. Use when a researcher needs several known catalog entries together with canonical URLs, available Markdown and per-item recovery.
---

# Retrieve a public source pack

1. Search `GET https://www.leviathansystems.co/api/v1/resources?q=rack&limit=5` using a short title phrase relevant to the question. Retain each selected result's exact catalog ID and canonical URL.
2. Group up to 20 selected IDs in one GET to `/api/v1/resources/batch`. Repeat the `ids` parameter for each ID. A single-resource read is sufficient when only one ID is needed.
3. Inspect each item's status. Keep successful items in their returned order. For a missing item, search again for that title. For a 413, split the request into smaller groups. On 429, wait for the interval in `Retry-After`.
4. Return the title, canonical source link and supported finding from each relevant document. When native Markdown is absent, retrieve the canonical page or its `.md` twin. Distinguish service descriptions from educational articles when describing Leviathan's work.

Example using one service and one article:

```sh
curl --get https://www.leviathansystems.co/api/v1/resources/batch \
  --data-urlencode 'ids=service:rack-and-stack' \
  --data-urlencode 'ids=article:gpu-deployment-timeline'
```

The API is anonymous. The [batch API reference](https://www.leviathansystems.co/developers#batch) documents the 1 MiB response limit and per-item error codes.
