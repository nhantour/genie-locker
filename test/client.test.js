import assert from 'node:assert/strict';
import test from 'node:test';
import { apiUrl, filterRecipes, getBaseUrl, getJson } from '../src/client.js';

test('base URL and query parameters are normalized', () => {
  assert.equal(getBaseUrl('https://example.com/'), 'https://example.com');
  assert.equal(apiUrl('/api/quote', { minutes: 10, empty: undefined }, 'https://example.com').toString(), 'https://example.com/api/quote?minutes=10');
});

test('unsupported base URL schemes fail closed', () => {
  assert.throws(() => getBaseUrl('file:///tmp/data'), /http or https/);
});

test('recipe filters preserve the commercial boundary', () => {
  const data = { recipes: [
    { name: 'Private Assistant', stage: 'commercial', category: 'private endpoint', good_for: ['analysis'] },
    { name: 'Coding Room', stage: 'benchmarked', category: 'confidential coding', buyer: 'engineering team' }
  ] };
  assert.deepEqual(filterRecipes(data, { stage: 'commercial' }).map((r) => r.name), ['Private Assistant']);
  assert.deepEqual(filterRecipes(data, { query: 'engineering' }).map((r) => r.name), ['Coding Room']);
});

test('client parses a successful JSON response', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: true, value: 7 }), { status: 200 });
  assert.deepEqual(await getJson('/api/status', {}, { baseUrl: 'https://example.com', fetchImpl }), { ok: true, value: 7 });
});

test('client returns a bounded API error', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ ok: false, error: 'unavailable' }), { status: 503 });
  await assert.rejects(() => getJson('/api/status', {}, { baseUrl: 'https://example.com', fetchImpl }), /unavailable/);
});
