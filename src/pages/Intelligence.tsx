import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_NEWS, MOCK_ASSETS, getRealityScoreColor, formatTimestamp, simulateOracleScore } from '@/lib/argos-mock';
import type { NewsItem } from '@/lib/argos-types';
import { priceEngine } from '@/lib/price-engine';
import { fetchSoSoNews, isApiKeySet } from '@/lib/sosovalue-api';
import type { SoSoNewsItem } from '@/lib/sosovalue-api';
import { LineChart, Line, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  Macro: '#00f0ff',
  Crypto: '#bf5af2',
  Commodity: '#ff9f0a',
  Equity: '#30d158',
};

const SENTIMENT_COLORS: Record<string, string> = {
  Bullish: '#30d158',
  Bearish: '#ff453a',
  Neutral: '#6b7280',
};

// Map SoSoValue category int to our category string
function mapSoSoCategory(cat: number): NewsItem['category'] {
  if (cat === 13) return 'Equity';
  if (cat === 2 || cat === 3) return 'Macro';
  return 'Crypto';
}

// Detect sentiment from title keywords
function detectSentiment(title: string): NewsItem['sentiment'] {
  const lower = title.toLowerCase();
  const bullish = ['surge', 'rally', 'gain', 'rise', 'bull', 'high', 'record', 'inflow', 'approve', 'launch', 'growth', 'up', 'positive'];
  const bearish = ['drop', 'fall', 'crash', 'bear', 'low', 'outflow', 'ban', 'hack', 'loss', 'decline', 'down', 'negative', 'risk'];
  const bScore = bullish.filter(w => lower.includes(w)).length;
  const beScore = bearish.filter(w => lower.includes(w)).length;
  if (bScore > beScore) return 'Bullish';
  if (beScore > bScore) return 'Bearish';
  return 'Neutral';
}

// Convert SoSoValue news item to our NewsItem type
function convertSoSoNews(item: SoSoNewsItem): NewsItem {
  return {
    id: item.id,
    headline: item.title,
    timestamp: new Date(item.release_time),
    source: item.nick_name || item.author || 'SoSoValue',
    category: mapSoSoCategory(item.category),
    sentiment: detectSentiment(item.title),
    affectedAssets: item.matched_currencies.map(c => c.name.toUpperCase()).filter(s => ['BTC', 'ETH', 'SOL', 'BNB', 'AVAX', 'LINK', 'GOLD', 'OIL', 'COPPER', 'SPX'].includes(s)),
    processed: false,
  };
}

// Generate 30-day history for each asset
function generateScoreHistory(symbol: string) {
  const asset = MOCK_ASSETS.find(a => a.symbol === symbol);
  const base = asset?.realityScore ?? 50;
  return Array.from({ length: 30 }, (_, i) => ({
    day: i,
    score: Math.max(5, Math.min(95, base + Math.sin(i * 0.4) * 20 + (Math.sin(i * 1.3) * 8))),
    event: i === 7 || i === 18 || i === 25,
  }));
}

export default function Intelligence() {
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [historyData, setHistoryData] = useState(generateScoreHistory('BTC'));
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    priceEngine.start();
  }, []);

  useEffect(() => {
    setHistoryData(generateScoreHistory(selectedAsset));
  }, [selectedAsset]);

  const loadLiveNews = useCallback(async () => {
    if (!isApiKeySet()) return;
    setLoading(true);
    try {
      const items = await fetchSoSoNews(30);
      if (items.length > 0) {
        const converted = items.map(convertSoSoNews);
        setNews(converted);
        setIsLive(true);
        toast.success(`Loaded ${items.length} live news items from SoSoValue`);
      }
    } catch {
      toast.error('Failed to load live news');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load live news on mount if API key is set
  useEffect(() => {
    if (isApiKeySet()) {
      loadLiveNews();
      // Refresh every 2 minutes
      const interval = setInterval(loadLiveNews, 120000);
      return () => clearInterval(interval);
    }
  }, [loadLiveNews]);

  // Auto-inject new mock news every 45s if not live
  useEffect(() => {
    if (isLive) return;
    const EXTRA_NEWS = [
      { headline: 'Fed minutes reveal hawkish dissent among FOMC members', category: 'Macro' as const, sentiment: 'Bearish' as const, affectedAssets: ['BTC', 'GOLD', 'SPX'] },
      { headline: 'Copper futures surge 4.2% on Shanghai inventory drawdown', category: 'Commodity' as const, sentiment: 'Bullish' as const, affectedAssets: ['COPPER'] },
      { headline: 'Bitcoin open interest hits all-time high of $38B', category: 'Crypto' as const, sentiment: 'Bullish' as const, affectedAssets: ['BTC'] },
    ];
    let idx = 0;
    const interval = setInterval(() => {
      const item = EXTRA_NEWS[idx % EXTRA_NEWS.length];
      const newItem: NewsItem = {
        id: `auto-${Date.now()}`,
        headline: item.headline,
        timestamp: new Date(),
        source: 'SoSoValue Terminal',
        category: item.category,
        sentiment: item.sentiment,
        affectedAssets: item.affectedAssets,
        processed: false,
      };
      setNews(prev => [newItem, ...prev.slice(0, 14)]);
      toast.info('New signal ingested', { description: item.headline.slice(0, 60) + '...' });
      idx++;
    }, 45000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleProcess = async (id: string) => {
    setProcessing(id);
    setExpanded(id);
    toast.info('Oracle processing...', { description: 'Applying neuro-symbolic analysis' });
    await new Promise(r => setTimeout(r, 2200 + Math.random() * 800));

    setNews(prev => prev.map(item => {
      if (item.id !== id) return item;
      const result = simulateOracleScore(item);
      return {
        ...item,
        processed: true,
        realityScore: { ...result, affectedAssets: item.affectedAssets, timestamp: new Date() },
      };
    }));
    setProcessing(null);
    toast.success('Reality Score generated');
  };

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden">
        {/* Left: News feed */}
        <div className="w-[38%] flex flex-col overflow-hidden" style={{ borderRight: '1px solid #1e1e2e' }}>
          <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Intelligence Feed</span>
              {isLive ? (
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" style={{ color: '#30d158' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#30d158' }}>LIVE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" style={{ color: '#6b7280' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>MOCK</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{news.filter(n => n.processed).length}/{news.length} processed</span>
              {isApiKeySet() && (
                <button onClick={loadLiveNews} disabled={loading} className="p-1 transition-colors" style={{ color: '#6b7280' }}>
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {news.map(item => (
              <div key={item.id} style={{ borderBottom: '1px solid #1e1e2e' }}>
                {/* Compact row */}
                <div
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                  style={{ background: expanded === item.id ? '#111118' : 'transparent' }}
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  onMouseEnter={e => { if (expanded !== item.id) (e.currentTarget as HTMLElement).style.background = '#0a0a10'; }}
                  onMouseLeave={e => { if (expanded !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span className="font-mono text-[10px] flex-shrink-0 tabular-nums" style={{ color: '#6b7280' }}>
                    {formatTimestamp(item.timestamp)}
                  </span>
                  <span className="font-mono text-[10px] flex-shrink-0 px-1" style={{ color: CATEGORY_COLORS[item.category], border: `1px solid ${CATEGORY_COLORS[item.category]}30` }}>
                    {item.category.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs flex-1 truncate" style={{ color: '#e8e8ed' }}>{item.headline}</span>
                  <span className="font-mono text-[10px] flex-shrink-0" style={{ color: SENTIMENT_COLORS[item.sentiment] }}>
                    {item.sentiment.slice(0, 1)}
                  </span>
                  {expanded === item.id ? <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} /> : <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />}
                </div>

                {/* Expanded accordion */}
                <AnimatePresence>
                  {expanded === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-1" style={{ background: '#111118' }}>
                        <p className="text-xs mb-2 leading-relaxed" style={{ color: '#6b7280' }}>{item.headline}</p>
                        <div className="flex gap-1.5 mb-3 flex-wrap">
                          {item.affectedAssets.length > 0 ? item.affectedAssets.map(a => (
                            <span key={a} className="font-mono text-[10px] px-1.5 py-0.5" style={{ border: '1px solid #1e1e2e', color: '#6b7280' }}>{a}</span>
                          )) : (
                            <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>No specific assets tagged</span>
                          )}
                        </div>

                        {processing === item.id ? (
                          <div className="flex items-center gap-2 py-2">
                            <span className="font-mono text-xs cursor-blink" style={{ color: '#00f0ff' }}>Oracle processing</span>
                          </div>
                        ) : item.processed && item.realityScore ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Reality Score</span>
                              <span className="font-mono text-sm font-bold tabular-nums" style={{ color: getRealityScoreColor(item.realityScore.score) }}>
                                {item.realityScore.score}/100
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#e8e8ed' }}>{item.realityScore.thesis}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Confidence: {item.realityScore.confidence}%</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleProcess(item.id)}
                            className="font-mono text-xs px-3 py-1.5 transition-colors"
                            style={{ border: '1px solid #00f0ff', color: '#00f0ff', background: 'transparent' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            [ Process with Oracle ]
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Score history chart */}
          <div className="flex-1 flex flex-col" style={{ borderBottom: '1px solid #1e1e2e' }}>
            <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Reality Score History — 30D</span>
              <div className="flex gap-1">
                {['BTC', 'ETH', 'GOLD', 'COPPER', 'OIL'].map(a => (
                  <button
                    key={a}
                    onClick={() => setSelectedAsset(a)}
                    className="font-mono text-[10px] px-2 py-0.5 transition-colors"
                    style={selectedAsset === a
                      ? { border: '1px solid #00f0ff', color: '#00f0ff', background: 'rgba(0,240,255,0.08)' }
                      : { border: '1px solid #1e1e2e', color: '#6b7280', background: 'transparent' }
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <Line type="monotone" dataKey="score" stroke="#00f0ff" strokeWidth={1.5} dot={false} />
                  <ReferenceLine y={50} stroke="#1e1e2e" strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ background: '#0a0a10', border: '1px solid #1e1e2e', borderRadius: 0, fontSize: 11, fontFamily: 'monospace' }}
                    formatter={(v: unknown) => [`${(v as number).toFixed(1)}`, 'Score']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current scores */}
          <div style={{ background: '#0a0a10' }}>
            <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Current Reality Scores</span>
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-6">
              {MOCK_ASSETS.map(asset => (
                <div key={asset.symbol} className="p-3" style={{ borderRight: '1px solid #1e1e2e' }}>
                  <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{asset.symbol}</p>
                  <p className="font-mono text-xl font-bold tabular-nums" style={{ color: getRealityScoreColor(asset.realityScore) }}>{asset.realityScore}</p>
                  <div className="w-full h-0.5 mt-1" style={{ background: '#1e1e2e' }}>
                    <div className="h-full" style={{ width: `${asset.realityScore}%`, background: getRealityScoreColor(asset.realityScore) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}