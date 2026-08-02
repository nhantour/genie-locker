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

- Full purchase and safety procedure: https://genie.locker/agent.md
- OpenAPI 3.1: https://genie.locker/openapi.json
- Machine-readable site index: https://genie.locker/llms.txt
- Install the agent skill after reviewing the script:

```bash
curl -sL https://genie.locker/skill.sh | sh
```

The first step can be a free trial credit allocation. No wallet or purchase is
created by reading this repository or installing the skill.

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
