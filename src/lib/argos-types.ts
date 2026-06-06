export interface NewsItem {
  id: string;
  headline: string;
  timestamp: Date;
  source: string;
  category: 'Macro' | 'Crypto' | 'Commodity' | 'Equity';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  affectedAssets: string[];
  processed?: boolean;
  realityScore?: RealityScore;
}

export interface RealityScore {
  score: number;
  confidence: number;
  thesis: string;
  counterpoints: string[];
  affectedAssets: string[];
  timestamp: Date;
}

export interface Asset {
  symbol: string;
  name: string;
  offChainPrice: number;
  onChainPrice: number;
  realityScore: number;
  dislocation: number;
  confidence: number;
  change24h: number;
  priceHistory: number[];
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'Idle' | 'Scanning' | 'Reasoning' | 'Executing' | 'Monitoring' | 'Alert';
  lastActivity: Date;
  activityLog: string[];
  sparkline: number[];
}

export interface Index {
  id: string;
  name: string;
  thesis: string;
  constituents: { symbol: string; weight: number }[];
  rebalanceLogic: 'threshold' | 'time' | 'ai';
  currentValue: number;
  change24h: number;
  status: 'Active' | 'Paused' | 'Deploying';
  createdAt: Date;
}

export interface Trade {
  id: string;
  hash: string;
  pair: string;
  side: 'Buy' | 'Sell';
  amount: number;
  price: number;
  executionPrice: number;
  slippage: number;
  status: 'Filled' | 'Partial' | 'Pending' | 'Cancelled';
  timestamp: Date;
  triggeredBy?: string;
}

export interface AuditEntry {
  id: string;
  hash: string;
  eventType: 'News Processed' | 'Score Generated' | 'Index Created' | 'Trade Executed' | 'Guardian Intervention' | 'Rebalance';
  timestamp: Date;
  agents: string[];
  summary: string;
  details: Record<string, unknown>;
}

export interface RiskMetrics {
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  concentrationRisk: number;
}

export interface CircuitBreaker {
  maxDailyLoss: number;
  maxPositionSize: number;
  volatilityHalt: number;
  autonomousThreshold: number;
}

export interface OrderbookEntry {
  price: number;
  size: number;
  total: number;
}
