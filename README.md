<p align="center">
  <img src="assets/genie-locker-icon.png" alt="GenieLocker icon" width="160" height="160">
</p>

# GenieLocker

GenieLocker gives an AI agent a private OpenAI-compatible Qwen2.5-7B endpoint
by the minute. The locker is quality-gated before the paid duration begins and
destroyed automatically at expiry.

## Current commercial boundary

- One commercial resident SKU: `l16-resident`
- Prepaid credits: live
- Direct per-locker x402 settlement: off / fail-closed
- One completed locker in the public status counter is an operator canary, not
  a customer

Trust the live API over copied documentation:

```bash
curl -s https://genie.locker/api/status
curl -s 'https://genie.locker/api/quote?envelope=l16&placement=resident&minutes=10'
```

## Agent integration

- MCP server: `io.github.nhantour/genie-locker`
- Full purchase and safety procedure: https://genie.locker/agent.md
- OpenAPI 3.1: https://genie.locker/openapi.json
- Machine-readable site index: https://genie.locker/llms.txt
- Install the agent skill after reviewing the script:

```bash
curl -sL https://genie.locker/skill.sh | sh
```

The first step can be a free trial credit allocation. No wallet or purchase is
created by reading this repository or installing the skill.

## MCP connector

The public MCP connector is deliberately read-only. It exposes five tools for
service status, commercial inventory, live quotes, recipe search, and credit
pricing. It cannot create accounts, reserve GPUs, buy credits, create lockers,
or send data to an inference model.

Run it from source:

```bash
npm install
npm start
```

Or, after the public image is available:

```bash
docker run --rm -i ghcr.io/nhantour/genie-locker-mcp:0.1.0
```

Client configuration:

```json
{
  "mcpServers": {
    "genie-locker": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "ghcr.io/nhantour/genie-locker-mcp:0.1.0"]
    }
  }
}
```

The connector source is MIT-licensed under `LICENSE-MCP`. That license applies
only to the connector, not to the private broker implementation.

Security reports should use the repository's private
[security advisory form](https://github.com/nhantour/genie-locker/security/advisories/new).

## Minimal flow

```bash
# 1. Create a trial account and save the returned gk_... key securely.
curl -s -X POST https://genie.locker/api/credits/trial

# 2. Request a ten-minute locker with a stable idempotency key.
curl -s -X POST https://genie.locker/api/lockers \
  -H 'authorization: Bearer gk_REDACTED' \
  -H 'idempotency-key: your-stable-order-id' \
  -H 'content-type: application/json' \
  -d '{"envelope":"l16","placement":"resident","minutes":10}'
```

The order is asynchronous. Poll the returned `status_url` with the same API key
until the state is `live`; only then does the paid duration begin.

Copyright © Intelix Systems LLC. This repository documents the public service;
it does not grant a license to the private broker implementation.
