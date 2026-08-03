const DEFAULT_BASE_URL = "https://genie.locker";

export function getBaseUrl(value = process.env.GENIE_BASE_URL) {
  const candidate = (value || DEFAULT_BASE_URL).trim();
  const url = new URL(candidate);
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error('GENIE_BASE_URL must use http or https');
  }
  return url.toString().replace(/\/$/, '');
}

export function apiUrl(path, params = {}, baseUrl = getBaseUrl()) {
  const url = new URL(path, `${baseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

export async function getJson(path, params = {}, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs || 15_000;
  const response = await fetchImpl(apiUrl(path, params, options.baseUrl), {
    headers: {
      accept: 'application/json',
      'user-agent': 'genie-locker-mcp/0.1.0'
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`GenieLocker returned non-JSON data (HTTP ${response.status})`);
  }

  if (!response.ok || data?.ok === false) {
    const detail = data?.error || data?.message || `HTTP ${response.status}`;
    throw new Error(`GenieLocker request failed: ${detail}`);
  }
  return data;
}

export function filterRecipes(data, { stage, category, query } = {}) {
  const recipes = Array.isArray(data?.recipes) ? data.recipes : [];
  const needle = query?.trim().toLowerCase();
  return recipes.filter((recipe) => {
    if (stage && recipe.stage !== stage) return false;
    if (category && !recipe.category?.toLowerCase().includes(category.toLowerCase())) return false;
    if (!needle) return true;
    const searchable = [
      recipe.name,
      recipe.category,
      recipe.promise,
      recipe.buyer,
      ...(recipe.good_for || [])
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(needle);
  });
}
