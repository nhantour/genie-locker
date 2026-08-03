#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { filterRecipes, getJson } from './client.js';

const server = new McpServer({
  name: 'genie-locker',
  version: '0.1.0'
});

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true
};

function result(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    structuredContent: data
  };
}

function failure(error) {
  return {
    isError: true,
    content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }]
  };
}

server.registerTool(
  'genie_status',
  {
    title: 'Check GenieLocker service status',
    description: 'Read current catalog, capacity, sellability, locker counts, and payment-rail status. This never creates or purchases a locker.',
    inputSchema: {},
    annotations: readOnly
  },
  async () => {
    try { return result(await getJson('/api/status')); } catch (error) { return failure(error); }
  }
);

server.registerTool(
  'genie_catalog',
  {
    title: 'List commercial GenieLocker inference SKUs',
    description: 'Read only the lifecycle-verified SKUs that are currently eligible for purchase. Designed or benchmarked recipes are not represented as commercial inventory.',
    inputSchema: {},
    annotations: readOnly
  },
  async () => {
    try { return result(await getJson('/api/catalog')); } catch (error) { return failure(error); }
  }
);

server.registerTool(
  'genie_quote',
  {
    title: 'Quote a private inference locker',
    description: 'Get a live, non-binding price quote. This is read-only and does not reserve capacity, create an account, or spend funds.',
    inputSchema: {
      minutes: z.number().int().min(10).max(1440).default(10).describe('Requested paid duration in minutes.'),
      envelope: z.string().default('l16').describe('GenieLocker model-footprint envelope.'),
      placement: z.enum(['resident']).default('resident').describe('Inference placement. Only the commercial resident route is currently exposed.')
    },
    annotations: readOnly
  },
  async ({ minutes, envelope, placement }) => {
    try { return result(await getJson('/api/quote', { minutes, envelope, placement })); } catch (error) { return failure(error); }
  }
);

server.registerTool(
  'genie_recipes',
  {
    title: 'Find GenieLocker agent and inference recipes',
    description: 'Search the public recipe menu by maturity, category, or text. The stage field is authoritative: only stage=commercial is live inventory.',
    inputSchema: {
      stage: z.enum(['commercial', 'benchmarked', 'designed']).optional().describe('Filter by evidence/commercial maturity.'),
      category: z.string().max(100).optional().describe('Case-insensitive category substring.'),
      query: z.string().max(200).optional().describe('Case-insensitive search across use case, buyer, promise, and recipe name.')
    },
    annotations: readOnly
  },
  async (filters) => {
    try {
      const data = await getJson('/api/recipes');
      const recipes = filterRecipes(data, filters);
      return result({
        ok: true,
        truth_rule: data.truth_rule,
        filters,
        count: recipes.length,
        recipes
      });
    } catch (error) { return failure(error); }
  }
);

server.registerTool(
  'genie_credit_pricing',
  {
    title: 'Read GenieLocker prepaid credit pricing',
    description: 'Read the current credit definition, burn multipliers, tier pricing, and examples. This never creates a wallet or buys credits.',
    inputSchema: {},
    annotations: readOnly
  },
  async () => {
    try { return result(await getJson('/api/credits/pricing')); } catch (error) { return failure(error); }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
