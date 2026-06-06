// Geometric Brownian Motion price simulation engine
// BTC + ETH anchored to real CoinGecko prices
// GOLD, OIL, COPPER, SPX anchored to real Alpha Vantage prices

export interface PriceState {
  symbol: string;
  price: number;
  prevPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  history: { t: number; price: number }[];
}

// Realistic baseline prices (used as fallback)
const BASELINES: Record<string, { price: number; vol: number; drift: number }> = {
  BTC:    { price: 65420,  vol: 0.0018, drift: 0.00002 },
  ETH:    { price: 3380,   vol: 0.0022, drift: 0.00001 },
  GOLD:   { price: 2318,   vol: 0.0006, drift: 0.000005 },
  OIL:    { price: 78.4,   vol: 0.0014, drift: -0.000005 },
  COPPER: { price: 4.82,   vol: 0.0010, drift: 0.000008 },
  SPX:    { price: 5248,   vol: 0.0008, drift: 0.00001 },
};

// CoinGecko ID map for crypto
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

// Alpha Vantage config
const AV_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;

// Box-Muller transform for normal distribution
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Generate initial 24h history using GBM
function generateHistory(symbol: string, points: number = 288): { t: number; price: number }[] {
  const { price, vol, drift } = BASELINES[symbol];
  const dt = 1 / points;
  const history: { t: number; price: number }[] = [];
  let p = price * (1 - (Math.random() * 0.04 - 0.02));
  const now = Date.now();
  for (let i = points; i >= 0; i--) {
    history.push({ t: now - i * (24 * 3600 * 1000 / points), price: p });
    p = p * Math.exp((drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * randn());
  }
  return history;
}

// Fetch real crypto prices from CoinGecko (no key needed)
async function fetchCryptoPrices(): Promise<Record<string, { price: number; change24h: number }>> {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const data = await res.json() as Record<string, { usd: number; usd_24h_change: number }>;
    const result: Record<string, { price: number; change24h: number }> = {};
    for (const [sym, cgId] of Object.entries(COINGECKO_IDS)) {
      if (data[cgId]) result[sym] = { price: data[cgId].usd, change24h: data[cgId].usd_24h_change };
    }
    return result;
  } catch {
    return {};
  }
}

// Fetch Gold price from Alpha Vantage (CURRENCY_EXCHANGE_RATE XAU/USD)
async function fetchGoldPrice(): Promise<{ price: number; change24h: number } | null> {
  if (!AV_KEY) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${AV_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json() as { 'Realtime Currency Exchange Rate'?: { '5. Exchange Rate': string } };
    const rate = data['Realtime Currency Exchange Rate']?.['5. Exchange Rate'];
    if (!rate) return null;
    const price = parseFloat(rate);
    return { price, change24h: 0 }; // AV exchange rate doesn't give 24h change directly
  } catch {
    return null;
  }
}

// Fetch commodity (WTI oil, copper) from Alpha Vantage commodity functions
async function fetchCommodityPrice(fn: string): Promise<{ price: number; change24h: number } | null> {
  if (!AV_KEY) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=${fn}&interval=monthly&apikey=${AV_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json() as { data?: { date: string; value: string }[] };
    const items = data.data;
    if (!items || items.length < 2) return null;
    const latest = parseFloat(items[0].value);
    const prev = parseFloat(items[1].value);
    if (isNaN(latest) || isNaN(prev)) return null;
    const change24h = ((latest - prev) / prev) * 100;
    return { price: latest, change24h };
  } catch {
    return null;
  }
}

// Fetch SPY (S&P 500 proxy) from Alpha Vantage GLOBAL_QUOTE
async function fetchSPXPrice(): Promise<{ price: number; change24h: number } | null> {
  if (!AV_KEY) return null;
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${AV_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json() as { 'Global Quote'?: { '05. price': string; '10. change percent': string } };
    const quote = data['Global Quote'];
    if (!quote) return null;
    const price = parseFloat(quote['05. price']);
    const changePct = parseFloat(quote['10. change percent'].replace('%', ''));
    if (isNaN(price)) return null;
    // SPY ~= SPX/10 roughly; scale to SPX equivalent
    return { price: price * 10, change24h: isNaN(changePct) ? 0 : changePct };
  } catch {
    return null;
  }
}

// Fetch all real prices (rate-limited: stagger requests)
async function fetchAllRealPrices(): Promise<Record<string, { price: number; change24h: number }>> {
  const result: Record<string, { price: number; change24h: number }> = {};

  // Crypto (CoinGecko, single request)
  const crypto = await fetchCryptoPrices();
  Object.assign(result, crypto);

  if (!AV_KEY) return result;

  // Stagger Alpha Vantage requests to respect 5 req/min rate limit
  const avFetches: Array<[string, () => Promise<{ price: number; change24h: number } | null>]> = [
    ['GOLD', fetchGoldPrice],
    ['OIL', () => fetchCommodityPrice('WTI')],
    ['COPPER', () => fetchCommodityPrice('COPPER')],
    ['SPX', fetchSPXPrice],
  ];

  for (const [sym, fetcher] of avFetches) {
    const data = await fetcher();
    if (data) result[sym] = data;
    // Small delay between AV requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  return result;
}

class PriceEngine {
  private states: Map<string, PriceState> = new Map();
  private listeners: Set<(states: Map<string, PriceState>) => void> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private fetchIntervalId: ReturnType<typeof setInterval> | null = null;
  private realPrices: Record<string, { price: number; change24h: number }> = {};

  constructor() {
    for (const symbol of Object.keys(BASELINES)) {
      const history = generateHistory(symbol);
      const prices = history.map(h => h.price);
      const current = prices[prices.length - 1];
      const open = prices[0];
      this.states.set(symbol, {
        symbol,
        price: current,
        prevPrice: current,
        change24h: ((current - open) / open) * 100,
        high24h: Math.max(...prices),
        low24h: Math.min(...prices),
        volume24h: current * (Math.random() * 50000 + 10000),
        history,
      });
    }
  }

  start() {
    if (this.intervalId) return;
    // Fetch real prices immediately, then every 5 minutes (AV free tier: 500/day)
    this.fetchRealPricesAndAnchor();
    this.fetchIntervalId = setInterval(() => this.fetchRealPricesAndAnchor(), 5 * 60 * 1000);
    // GBM tick every 2 seconds for smooth micro-movements
    this.intervalId = setInterval(() => this.tick(), 2000);
  }

  private async fetchRealPricesAndAnchor() {
    const fresh = await fetchAllRealPrices();
    if (Object.keys(fresh).length === 0) return;
    this.realPrices = { ...this.realPrices, ...fresh };
    const updated = new Map(this.states);
    for (const [sym, data] of Object.entries(fresh)) {
      const state = updated.get(sym);
      if (!state) continue;
      const now = Date.now();
      const newHistory = [...state.history.slice(-287), { t: now, price: data.price }];
      updated.set(sym, {
        ...state,
        prevPrice: state.price,
        price: data.price,
        change24h: data.change24h,
        history: newHistory,
      });
    }
    this.states = updated;
    this.listeners.forEach(fn => fn(this.states));
  }

  stop() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
    if (this.fetchIntervalId) { clearInterval(this.fetchIntervalId); this.fetchIntervalId = null; }
  }

  private tick() {
    const now = Date.now();
    const updated = new Map(this.states);
    for (const [symbol, state] of updated) {
      const { vol, drift } = BASELINES[symbol];
      const dt = 2 / (24 * 3600);
      const newPrice = state.price * Math.exp(
        (drift - 0.5 * vol * vol) * dt + vol * Math.sqrt(dt) * randn()
      );
      const newHistory = [...state.history.slice(-287), { t: now, price: newPrice }];
      const open24h = newHistory[0].price;
      const allPrices = newHistory.map(h => h.price);
      const change24h = this.realPrices[symbol]
        ? this.realPrices[symbol].change24h
        : ((newPrice - open24h) / open24h) * 100;
      updated.set(symbol, {
        ...state,
        prevPrice: state.price,
        price: newPrice,
        change24h,
        high24h: Math.max(...allPrices),
        low24h: Math.min(...allPrices),
        history: newHistory,
      });
    }
    this.states = updated;
    this.listeners.forEach(fn => fn(this.states));
  }

  getState(symbol: string): PriceState | undefined {
    return this.states.get(symbol);
  }

  getAllStates(): Map<string, PriceState> {
    return this.states;
  }

  subscribe(fn: (states: Map<string, PriceState>) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

// Singleton
export const priceEngine = new PriceEngine();