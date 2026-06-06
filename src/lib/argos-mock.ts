import type { NewsItem, Asset, AgentStatus, Index, Trade, AuditEntry, RiskMetrics, CircuitBreaker, OrderbookEntry } from './argos-types';

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSparkline(base: number, length: number, seed: number): number[] {
  return Array.from({ length }, (_, i) => {
    const noise = (seededRandom(seed + i) - 0.5) * base * 0.1;
    return Math.max(0, base + noise + i * (seededRandom(seed + i + 100) - 0.5) * 2);
  });
}

export const MOCK_ASSETS: Asset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    offChainPrice: 67420,
    onChainPrice: 67180,
    realityScore: 72,
    dislocation: 0.36,
    confidence: 84,
    change24h: 2.3,
    priceHistory: generateSparkline(67000, 24, 1),
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    offChainPrice: 3540,
    onChainPrice: 3612,
    realityScore: 41,
    dislocation: -2.03,
    confidence: 91,
    change24h: -1.2,
    priceHistory: generateSparkline(3500, 24, 2),
  },
  {
    symbol: 'GOLD',
    name: 'Gold',
    offChainPrice: 2318,
    onChainPrice: 2290,
    realityScore: 88,
    dislocation: 1.22,
    confidence: 76,
    change24h: 0.8,
    priceHistory: generateSparkline(2300, 24, 3),
  },
  {
    symbol: 'OIL',
    name: 'Crude Oil',
    offChainPrice: 78.4,
    onChainPrice: 81.2,
    realityScore: 23,
    dislocation: -3.57,
    confidence: 88,
    change24h: -2.1,
    priceHistory: generateSparkline(79, 24, 4),
  },
  {
    symbol: 'COPPER',
    name: 'Copper',
    offChainPrice: 4.82,
    onChainPrice: 4.79,
    realityScore: 61,
    dislocation: 0.63,
    confidence: 69,
    change24h: 1.4,
    priceHistory: generateSparkline(4.8, 24, 5),
  },
  {
    symbol: 'SPX',
    name: 'S&P 500',
    offChainPrice: 5248,
    onChainPrice: 5231,
    realityScore: 55,
    dislocation: 0.32,
    confidence: 73,
    change24h: 0.4,
    priceHistory: generateSparkline(5240, 24, 6),
  },
];

export const MOCK_AGENTS: AgentStatus[] = [
  {
    id: 'scribe',
    name: 'The Scribe',
    role: 'News Ingestion & Structuring',
    status: 'Scanning',
    lastActivity: new Date(Date.now() - 45000),
    activityLog: ['Ingested 3 macro news items', 'Parsed Fed statement', 'Flagged copper supply disruption'],
    sparkline: [2, 5, 3, 8, 4, 7, 6, 9, 5, 8, 7, 10],
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    role: 'Reality Score Generation',
    status: 'Reasoning',
    lastActivity: new Date(Date.now() - 12000),
    activityLog: ['Generated score for BTC: 72', 'Analyzing ETH dislocation', 'Processing oil supply data'],
    sparkline: [4, 6, 5, 9, 7, 8, 6, 10, 8, 9, 7, 11],
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'Index Construction & Rebalancing',
    status: 'Idle',
    lastActivity: new Date(Date.now() - 300000),
    activityLog: ['Rebalanced Copper Supply Index', 'Created Macro Hedge Index', 'Adjusted weights for volatility'],
    sparkline: [1, 2, 1, 3, 2, 4, 3, 2, 4, 3, 5, 4],
  },
  {
    id: 'executor',
    name: 'The Executor',
    role: 'Trade Execution via SoDEX',
    status: 'Monitoring',
    lastActivity: new Date(Date.now() - 180000),
    activityLog: ['Executed BTC buy 0.5 BTC @ 67,180', 'Monitoring ETH position', 'Awaiting Oracle signal'],
    sparkline: [3, 4, 3, 5, 4, 6, 5, 7, 6, 5, 7, 6],
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    role: 'Risk Management & Circuit Breakers',
    status: 'Monitoring',
    lastActivity: new Date(Date.now() - 60000),
    activityLog: ['Blocked OIL trade: max drawdown exceeded', 'Adjusted ETH confidence -13%', 'All circuit breakers nominal'],
    sparkline: [8, 7, 9, 8, 10, 9, 8, 10, 9, 11, 10, 9],
  },
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    headline: 'Federal Reserve signals potential rate cut in Q3 amid cooling inflation data',
    timestamp: new Date(Date.now() - 600000),
    source: 'SoSoValue Terminal',
    category: 'Macro',
    sentiment: 'Bullish',
    affectedAssets: ['BTC', 'ETH', 'GOLD', 'SPX'],
    processed: true,
    realityScore: { score: 72, confidence: 84, thesis: 'Rate cuts historically boost risk assets and gold', counterpoints: ['Inflation may re-accelerate', 'Labor market remains tight'], affectedAssets: ['BTC', 'ETH', 'GOLD'], timestamp: new Date(Date.now() - 580000) },
  },
  {
    id: 'n2',
    headline: 'Chilean copper mine strike enters third week, global supply deficit widens',
    timestamp: new Date(Date.now() - 1200000),
    source: 'SoSoValue Terminal',
    category: 'Commodity',
    sentiment: 'Bullish',
    affectedAssets: ['COPPER'],
    processed: true,
    realityScore: { score: 88, confidence: 91, thesis: 'Supply shock creates significant upward price pressure', counterpoints: ['Chinese demand slowdown may offset', 'Strategic reserves could be released'], affectedAssets: ['COPPER'], timestamp: new Date(Date.now() - 1180000) },
  },
  {
    id: 'n3',
    headline: 'OPEC+ announces surprise production cut of 500k barrels/day effective immediately',
    timestamp: new Date(Date.now() - 1800000),
    source: 'SoSoValue Terminal',
    category: 'Commodity',
    sentiment: 'Bullish',
    affectedAssets: ['OIL'],
    processed: false,
  },
  {
    id: 'n4',
    headline: 'Ethereum ETF inflows hit record $840M in single day as institutional demand surges',
    timestamp: new Date(Date.now() - 2400000),
    source: 'SoSoValue Terminal',
    category: 'Crypto',
    sentiment: 'Bullish',
    affectedAssets: ['ETH'],
    processed: false,
  },
  {
    id: 'n5',
    headline: 'US CPI data shows 2.8% YoY, below consensus estimate of 3.1%',
    timestamp: new Date(Date.now() - 3600000),
    source: 'SoSoValue Terminal',
    category: 'Macro',
    sentiment: 'Bullish',
    affectedAssets: ['BTC', 'ETH', 'GOLD', 'SPX'],
    processed: true,
    realityScore: { score: 65, confidence: 78, thesis: 'Below-consensus CPI reduces rate hike probability', counterpoints: ['Core services inflation remains sticky', 'One data point insufficient for trend'], affectedAssets: ['BTC', 'GOLD', 'SPX'], timestamp: new Date(Date.now() - 3580000) },
  },
  {
    id: 'n6',
    headline: 'China manufacturing PMI contracts for second consecutive month, 48.2 vs 50.1 expected',
    timestamp: new Date(Date.now() - 4800000),
    source: 'SoSoValue Terminal',
    category: 'Macro',
    sentiment: 'Bearish',
    affectedAssets: ['COPPER', 'OIL', 'SPX'],
    processed: false,
  },
  {
    id: 'n7',
    headline: 'BlackRock Bitcoin ETF surpasses $20B AUM milestone in record time',
    timestamp: new Date(Date.now() - 7200000),
    source: 'SoSoValue Terminal',
    category: 'Crypto',
    sentiment: 'Bullish',
    affectedAssets: ['BTC'],
    processed: true,
    realityScore: { score: 79, confidence: 87, thesis: 'Institutional adoption accelerating, supply pressure increasing', counterpoints: ['ETF flows can reverse quickly', 'Regulatory risk remains'], affectedAssets: ['BTC'], timestamp: new Date(Date.now() - 7180000) },
  },
];

export const MOCK_INDICES: Index[] = [
  {
    id: 'idx1',
    name: 'Copper Supply Shock Index',
    thesis: 'Long copper and related commodities during supply disruptions',
    constituents: [
      { symbol: 'COPPER', weight: 60 },
      { symbol: 'GOLD', weight: 25 },
      { symbol: 'OIL', weight: 15 },
    ],
    rebalanceLogic: 'ai',
    currentValue: 10842,
    change24h: 3.2,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: 'idx2',
    name: 'Macro Hedge Alpha',
    thesis: 'Diversified hedge against macro uncertainty using crypto and commodities',
    constituents: [
      { symbol: 'BTC', weight: 40 },
      { symbol: 'GOLD', weight: 35 },
      { symbol: 'ETH', weight: 25 },
    ],
    rebalanceLogic: 'threshold',
    currentValue: 24180,
    change24h: 1.8,
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
];

export const MOCK_TRADES: Trade[] = [
  {
    id: 't1',
    hash: '0x7f3a...b2c1',
    pair: 'BTC/USDC',
    side: 'Buy',
    amount: 0.5,
    price: 67200,
    executionPrice: 67180,
    slippage: 0.03,
    status: 'Filled',
    timestamp: new Date(Date.now() - 180000),
    triggeredBy: 'Oracle Signal',
  },
  {
    id: 't2',
    hash: '0x4e8b...f9d2',
    pair: 'ETH/USDC',
    side: 'Sell',
    amount: 2.0,
    price: 3600,
    executionPrice: 3612,
    slippage: -0.33,
    status: 'Filled',
    timestamp: new Date(Date.now() - 3600000),
    triggeredBy: 'Manual',
  },
  {
    id: 't3',
    hash: '0x9c2d...a4e7',
    pair: 'COPPER/USDC',
    side: 'Buy',
    amount: 1000,
    price: 4.80,
    executionPrice: 4.82,
    slippage: 0.42,
    status: 'Partial',
    timestamp: new Date(Date.now() - 7200000),
    triggeredBy: 'Index Rebalance',
  },
];

export const MOCK_AUDIT: AuditEntry[] = [
  {
    id: 'a1',
    hash: '0xf4a2b8c1d3e5f6a7',
    eventType: 'Score Generated',
    timestamp: new Date(Date.now() - 45000),
    agents: ['Oracle'],
    summary: 'Reality Score generated for BTC: 72/100 (Confidence: 84%)',
    details: { asset: 'BTC', score: 72, confidence: 84, thesis: 'Rate cut expectations boost risk assets' },
  },
  {
    id: 'a2',
    hash: '0x3b7c9d2e4f1a8b5c',
    eventType: 'Trade Executed',
    timestamp: new Date(Date.now() - 180000),
    agents: ['Executor', 'Guardian'],
    summary: 'BTC/USDC Buy 0.5 BTC @ 67,180 USDC — Approved by Guardian',
    details: { pair: 'BTC/USDC', side: 'Buy', amount: 0.5, price: 67180, slippage: 0.03 },
  },
  {
    id: 'a3',
    hash: '0x8e1f3a6b9c2d5e7f',
    eventType: 'Guardian Intervention',
    timestamp: new Date(Date.now() - 600000),
    agents: ['Guardian'],
    summary: 'Blocked OIL trade: Max daily loss threshold exceeded (4.2% vs 3% limit)',
    details: { blockedTrade: 'OIL/USDC Sell', reason: 'Max daily loss exceeded', currentLoss: '4.2%', limit: '3%' },
  },
  {
    id: 'a4',
    hash: '0x2c5d8e1f4a7b0c3d',
    eventType: 'Index Created',
    timestamp: new Date(Date.now() - 86400000 * 3),
    agents: ['Architect'],
    summary: 'Copper Supply Shock Index deployed with 3 constituents',
    details: { indexName: 'Copper Supply Shock Index', constituents: ['COPPER', 'GOLD', 'OIL'], totalValue: 10842 },
  },
  {
    id: 'a5',
    hash: '0x6f9a2b5c8d1e4f7a',
    eventType: 'News Processed',
    timestamp: new Date(Date.now() - 1200000),
    agents: ['Scribe', 'Oracle'],
    summary: 'Chilean copper mine strike processed — Reality Score: 88/100',
    details: { headline: 'Chilean copper mine strike enters third week', score: 88, confidence: 91 },
  },
];

export const MOCK_RISK_METRICS: RiskMetrics = {
  sharpeRatio: 2.14,
  maxDrawdown: -8.3,
  volatility: 18.7,
  concentrationRisk: 42,
};

export const MOCK_CIRCUIT_BREAKERS: CircuitBreaker = {
  maxDailyLoss: 3,
  maxPositionSize: 20,
  volatilityHalt: 25,
  autonomousThreshold: 5000,
};

export function generateOrderbook(midPrice: number, spread: number = 0.002): { bids: OrderbookEntry[]; asks: OrderbookEntry[] } {
  const bids: OrderbookEntry[] = [];
  const asks: OrderbookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < 12; i++) {
    const bidPrice = midPrice * (1 - spread * (i + 1));
    const askPrice = midPrice * (1 + spread * (i + 1));
    const bidSize = parseFloat((seededRandom(i * 7 + 1) * 2 + 0.1).toFixed(4));
    const askSize = parseFloat((seededRandom(i * 7 + 2) * 2 + 0.1).toFixed(4));
    bidTotal += bidSize;
    askTotal += askSize;
    bids.push({ price: parseFloat(bidPrice.toFixed(2)), size: bidSize, total: parseFloat(bidTotal.toFixed(4)) });
    asks.push({ price: parseFloat(askPrice.toFixed(2)), size: askSize, total: parseFloat(askTotal.toFixed(4)) });
  }

  return { bids, asks };
}

export function getRealityScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#00d4ff';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#f97316';
  return '#e53e3e';
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export function simulateOracleScore(newsItem: { headline: string; sentiment: string; affectedAssets: string[] }): { score: number; confidence: number; thesis: string; counterpoints: string[] } {
  const hash = newsItem.headline.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const base = seededRandom(hash) * 60 + 20;
  const sentimentBoost = newsItem.sentiment === 'Bullish' ? 15 : newsItem.sentiment === 'Bearish' ? -15 : 0;
  const score = Math.min(100, Math.max(0, Math.round(base + sentimentBoost)));
  const confidence = Math.round(seededRandom(hash + 1) * 30 + 60);

  const theses: Record<string, string> = {
    Bullish: 'Positive macro catalyst detected — on-chain assets likely underpriced relative to off-chain reality',
    Bearish: 'Negative macro signal — on-chain assets may be overpriced relative to fundamental reality',
    Neutral: 'Mixed signals detected — dislocation opportunity requires further confirmation',
  };

  const counterpoints = [
    'Market may have already priced in this information',
    'Correlated assets could dampen the effect',
    'Liquidity conditions may limit execution efficiency',
  ];

  return { score, confidence, thesis: theses[newsItem.sentiment] || theses.Neutral, counterpoints: counterpoints.slice(0, 2) };
}
