// SoSoValue API Client
// Base URL: https://openapi.sosovalue.com/openapi/v1
// Auth: x-soso-api-key header
// Set VITE_SOSOVALUE_API_KEY in API Keys tab → Frontend

const SOSO_BASE = 'https://openapi.sosovalue.com/openapi/v1';
const API_KEY = import.meta.env.VITE_SOSOVALUE_API_KEY as string | undefined;

function sosoHeaders(): Record<string, string> {
  return {
    'x-soso-api-key': API_KEY ?? '',
    'Content-Type': 'application/json',
  };
}

// ─── News Feed ────────────────────────────────────────────────────────────────
export interface SoSoNewsItem {
  id: string;
  title: string;
  content: string;
  release_time: number; // ms timestamp
  source_link: string;
  original_link: string;
  author: string;
  nick_name: string;
  author_avatar_url: string;
  feature_image: string;
  category: number;
  tags: string[];
  matched_currencies: { id: string; full_name: string; name: string }[];
  like_count: number;
  impression_count: number;
}

interface SoSoNewsResponse {
  page: number;
  page_size: number;
  total: number;
  list: SoSoNewsItem[];
}

export async function fetchSoSoNews(pageSize = 20, category?: number): Promise<SoSoNewsItem[]> {
  if (!API_KEY) {
    console.warn('[SoSoValue] No API key. Add VITE_SOSOVALUE_API_KEY to API Keys → Frontend.');
    return [];
  }
  try {
    const url = new URL(`${SOSO_BASE}/news`);
    url.searchParams.set('page', '1');
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('language', 'en');
    if (category !== undefined) url.searchParams.set('category', String(category));
    const res = await fetch(url.toString(), {
      headers: sosoHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json() as SoSoNewsResponse;
    return json.list ?? [];
  } catch {
    return [];
  }
}

// ─── Index List ───────────────────────────────────────────────────────────────
export async function fetchSoSoIndexList(): Promise<string[]> {
  if (!API_KEY) return [];
  try {
    const res = await fetch(`${SOSO_BASE}/indices`, {
      headers: sosoHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    return await res.json() as string[];
  } catch {
    return [];
  }
}

// ─── Index Market Snapshot ────────────────────────────────────────────────────
export interface SoSoIndexSnapshot {
  price: number;
  '24h_change_pct': number;
  '7day_roi': number;
  '1month_roi': number;
  '3month_roi': number;
  '1year_roi': number;
  ytd: number;
}

export async function fetchSoSoIndexSnapshot(ticker: string): Promise<SoSoIndexSnapshot | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${SOSO_BASE}/indices/${ticker}/market-snapshot`, {
      headers: sosoHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json() as SoSoIndexSnapshot;
  } catch {
    return null;
  }
}

// ─── Index Constituents ───────────────────────────────────────────────────────
export interface SoSoConstituent {
  currency_id: string;
  symbol: string;
  weight: number; // 0-1
}

export async function fetchSoSoIndexConstituents(ticker: string): Promise<SoSoConstituent[]> {
  if (!API_KEY) return [];
  try {
    const res = await fetch(`${SOSO_BASE}/indices/${ticker}/constituents`, {
      headers: sosoHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    return await res.json() as SoSoConstituent[];
  } catch {
    return [];
  }
}

// ─── Hot News ─────────────────────────────────────────────────────────────────
export async function fetchSoSoHotNews(pageSize = 10): Promise<SoSoNewsItem[]> {
  if (!API_KEY) return [];
  try {
    const url = new URL(`${SOSO_BASE}/news/hot`);
    url.searchParams.set('page', '1');
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('language', 'en');
    const res = await fetch(url.toString(), {
      headers: sosoHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const json = await res.json() as SoSoNewsResponse;
    return json.list ?? [];
  } catch {
    return [];
  }
}

export function isApiKeySet(): boolean {
  return !!API_KEY;
}