---
name: leviathan-deployment-estimate
description: Run Leviathan's public GPU deployment estimator when comparing GPU counts and platform scenarios. Report rack groups, assumed IT power and the facility allowance with the inputs that produced them.
---

# Estimate GPU deployment requirements

Ask for a positive whole GPU count and one of the supported scenarios: H100/H200 HGX air-cooled (`h100-air`), H100/H200 HGX liquid-cooled (`h100-liquid`), `gb200` or `gb300`. Use only counts from 1 through 1,000,000. For other platforms, explain which scenario inputs are missing.

Connect to the [planning MCP server](https://www.leviathansystems.co/mcp/planning) over Streamable HTTP. Initialize the client, list its tools and call `estimate_deployment`. For example, `{"platform":"gb300","gpus":144}` returns two rack groups at 72 assumed GPUs per rack and 140 assumed kW per rack, for an IT subtotal of 0.28 MW.

Return the platform, GPU count, assumed GPUs and kW per rack, rounded rack groups, IT subtotal and facility multiplier. For comparisons, hold the other inputs constant and show each result in its own row. Cite the [web estimator](https://www.leviathansystems.co/tools/gpu-deployment-estimator), which uses the same calculation.

For a budget or schedule, direct the reader to [project pricing](https://www.leviathansystems.co/pricing). Actual capacity, availability and a quotation require a scoped project. No customer contact details are needed for this calculation.
