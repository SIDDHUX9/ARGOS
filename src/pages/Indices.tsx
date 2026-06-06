import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, TrendingUp, TrendingDown, RefreshCw, Trash2, Search, Wifi, WifiOff } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_INDICES } from '@/lib/argos-mock';
import type { Index } from '@/lib/argos-types';
import { fetchSoSoIndexList, fetchSoSoIndexSnapshot, fetchSoSoIndexConstituents, isApiKeySet } from '@/lib/sosovalue-api';
import { toast } from 'sonner';

const AVAILABLE_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65420 },
  { symbol: 'ETH', name: 'Ethereum', price: 3380 },
  { symbol: 'GOLD', name: 'Gold', price: 2318 },
  { symbol: 'OIL', name: 'Crude Oil', price: 78.4 },
  { symbol: 'COPPER', name: 'Copper', price: 4.82 },
  { symbol: 'SPX', name: 'S&P 500', price: 5248 },
  { symbol: 'SOL', name: 'Solana', price: 148 },
  { symbol: 'LINK', name: 'Chainlink', price: 14.2 },
  { symbol: 'AVAX', name: 'Avalanche', price: 32.1 },
  { symbol: 'SILVER', name: 'Silver', price: 27.4 },
];

interface Constituent { symbol: string; weight: number; }

// Convert SoSoValue index data to our Index type
function buildLiveIndex(ticker: string, snapshot: { price: number; '24h_change_pct': number }, constituents: { symbol: string; weight: number }[]): Index {
  return {
    id: ticker,
    name: ticker.toUpperCase(),
    thesis: `SoSoValue ${ticker.toUpperCase()} Index — live data`,
    constituents: constituents.map(c => ({ symbol: c.symbol.toUpperCase(), weight: Math.round(c.weight * 100) })),
    rebalanceLogic: 'ai',
    currentValue: snapshot.price,
    change24h: snapshot['24h_change_pct'] * 100,
    status: 'Active',
    createdAt: new Date(),
  };
}

export default function Indices() {
  const [indices, setIndices] = useState<Index[]>(MOCK_INDICES);
  const [rebalancing, setRebalancing] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [search, setSearch] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loadingLive, setLoadingLive] = useState(false);

  // Composer state
  const [name, setName] = useState('');
  const [thesis, setThesis] = useState('');
  const [basket, setBasket] = useState<Constituent[]>([]);
  const [rebalanceLogic, setRebalanceLogic] = useState<'threshold' | 'time' | 'ai'>('ai');

  const totalWeight = basket.reduce((s, c) => s + c.weight, 0);
  const filteredAssets = AVAILABLE_ASSETS.filter(a =>
    a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadLiveIndices = useCallback(async () => {
    if (!isApiKeySet()) return;
    setLoadingLive(true);
    try {
      const tickers = await fetchSoSoIndexList();
      if (!tickers || tickers.length === 0) { setLoadingLive(false); return; }

      // Fetch first 6 indices in parallel
      const slice = tickers.slice(0, 6);
      const results = await Promise.all(
        slice.map(async ticker => {
          const [snapshot, constituents] = await Promise.all([
            fetchSoSoIndexSnapshot(ticker),
            fetchSoSoIndexConstituents(ticker),
          ]);
          if (!snapshot) return null;
          return buildLiveIndex(ticker, snapshot, constituents);
        })
      );

      const valid = results.filter((r): r is Index => r !== null);
      if (valid.length > 0) {
        setIndices(valid);
        setIsLive(true);
        toast.success(`Loaded ${valid.length} live SSI indices`);
      }
    } catch {
      toast.error('Failed to load live indices');
    } finally {
      setLoadingLive(false);
    }
  }, []);

  useEffect(() => {
    if (isApiKeySet()) {
      loadLiveIndices();
    }
  }, [loadLiveIndices]);

  const addToBasket = (symbol: string) => {
    if (basket.find(c => c.symbol === symbol)) return;
    const even = Math.floor(100 / (basket.length + 1));
    setBasket(prev => [...prev, { symbol, weight: even }]);
  };

  const removeFromBasket = (symbol: string) => {
    setBasket(prev => prev.filter(c => c.symbol !== symbol));
  };

  const updateWeight = (symbol: string, weight: number) => {
    setBasket(prev => prev.map(c => c.symbol === symbol ? { ...c, weight } : c));
  };

  const handleDeploy = async () => {
    if (!name || basket.length < 2) { toast.error('Name and at least 2 assets required'); return; }
    if (totalWeight !== 100) { toast.error(`Weights must sum to 100% (currently ${totalWeight}%)`); return; }
    setDeploying(true);
    await new Promise(r => setTimeout(r, 3000));
    setDeploying(false);
    const newIndex: Index = {
      id: `idx${Date.now()}`,
      name,
      thesis,
      constituents: basket,
      rebalanceLogic,
      currentValue: 10000,
      change24h: 0,
      status: 'Active',
      createdAt: new Date(),
    };
    setIndices(prev => [newIndex, ...prev]);
    setName(''); setThesis(''); setBasket([]);
    toast.success(`${name} deployed`);
  };

  const handleRebalance = async (id: string) => {
    setRebalancing(id);
    await new Promise(r => setTimeout(r, 2500));
    setRebalancing(null);
    toast.success('Index rebalanced');
  };

  const handleDelete = (id: string) => {
    setIndices(prev => prev.filter(i => i.id !== id));
    setDeleteConfirm(null);
    toast.success('Index liquidated');
  };

  return (
    <AppLayout>
      <div className="flex h-full overflow-hidden flex-col">
        {/* Index table */}
        <div className="flex-1 overflow-auto" style={{ borderBottom: '1px solid #1e1e2e' }}>
          <div className="flex items-center justify-between px-3 py-2 sticky top-0" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>My Indices ({indices.length})</span>
              {isLive ? (
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" style={{ color: '#30d158' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#30d158' }}>LIVE SSI</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" style={{ color: '#6b7280' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>MOCK</span>
                </div>
              )}
            </div>
            {isApiKeySet() && (
              <button onClick={loadLiveIndices} disabled={loadingLive} className="p-1 transition-colors" style={{ color: '#6b7280' }}>
                <RefreshCw className={`w-3 h-3 ${loadingLive ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
                {['Name', 'Constituents', 'Value', '24h', 'Logic', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {indices.map(idx => (
                <tr key={idx.id} style={{ borderBottom: '1px solid #1e1e2e' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0a0a10'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td className="px-3 py-2">
                    <p className="font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>{idx.name}</p>
                    <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{idx.thesis.slice(0, 50)}{idx.thesis.length > 50 ? '...' : ''}</p>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {idx.constituents.slice(0, 4).map(c => (
                        <span key={c.symbol} className="font-mono text-[10px] px-1" style={{ border: '1px solid #1e1e2e', color: '#6b7280' }}>
                          {c.symbol} {c.weight}%
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums" style={{ color: '#e8e8ed' }}>
                    {idx.currentValue >= 100 ? idx.currentValue.toLocaleString('en-US', { maximumFractionDigits: 2 }) : idx.currentValue.toFixed(4)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {idx.change24h >= 0 ? <TrendingUp className="w-3 h-3" style={{ color: '#30d158' }} /> : <TrendingDown className="w-3 h-3" style={{ color: '#ff453a' }} />}
                      <span className="font-mono text-xs tabular-nums" style={{ color: idx.change24h >= 0 ? '#30d158' : '#ff453a' }}>
                        {idx.change24h >= 0 ? '+' : ''}{idx.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[10px]" style={{ color: '#6b7280' }}>{idx.rebalanceLogic}</td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5" style={{
                      border: `1px solid ${idx.status === 'Active' ? '#30d15830' : idx.status === 'Deploying' ? '#ff9f0a30' : '#6b728030'}`,
                      color: idx.status === 'Active' ? '#30d158' : idx.status === 'Deploying' ? '#ff9f0a' : '#6b7280',
                    }}>{idx.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRebalance(idx.id)}
                        disabled={rebalancing === idx.id}
                        className="font-mono text-[10px] px-2 py-0.5 transition-colors"
                        style={{ border: '1px solid #1e1e2e', color: '#6b7280' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00f0ff'; (e.currentTarget as HTMLElement).style.color = '#00f0ff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                      >
                        {rebalancing === idx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'rebalance'}
                      </button>
                      {deleteConfirm === idx.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(idx.id)} className="font-mono text-[10px] px-2 py-0.5" style={{ border: '1px solid #ff453a', color: '#ff453a' }}>confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="font-mono text-[10px] px-2 py-0.5" style={{ border: '1px solid #1e1e2e', color: '#6b7280' }}>cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(idx.id)} className="p-1 transition-colors" style={{ color: '#6b7280' }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Composer */}
        <div className="flex overflow-hidden" style={{ height: '45%', borderTop: '1px solid #1e1e2e' }}>
          {/* Asset picker */}
          <div className="w-48 flex flex-col overflow-hidden" style={{ borderRight: '1px solid #1e1e2e' }}>
            <div className="px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Assets</span>
            </div>
            <div className="px-2 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid #1e1e2e' }}>
              <div className="flex items-center gap-1.5 px-2 py-1" style={{ border: '1px solid #1e1e2e', background: '#111118' }}>
                <Search className="w-3 h-3 flex-shrink-0" style={{ color: '#6b7280' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 bg-transparent font-mono text-[10px] outline-none"
                  style={{ color: '#e8e8ed' }}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredAssets.map(asset => {
                const inBasket = basket.find(c => c.symbol === asset.symbol);
                return (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid #1e1e2e', background: inBasket ? 'rgba(0,240,255,0.05)' : 'transparent' }}
                    onClick={() => inBasket ? removeFromBasket(asset.symbol) : addToBasket(asset.symbol)}
                    onMouseEnter={e => { if (!inBasket) (e.currentTarget as HTMLElement).style.background = '#111118'; }}
                    onMouseLeave={e => { if (!inBasket) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold" style={{ color: inBasket ? '#00f0ff' : '#e8e8ed' }}>{asset.symbol}</p>
                      <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{asset.name}</p>
                    </div>
                    {inBasket && <span className="font-mono text-[10px]" style={{ color: '#00f0ff' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basket + config */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: '#6b7280' }}>Index Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Copper Supply Shock Index"
                  className="w-full px-2 py-1.5 font-mono text-xs outline-none transition-colors"
                  style={{ background: '#111118', border: '1px solid #1e1e2e', color: '#e8e8ed' }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = '#00f0ff'; }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = '#1e1e2e'; }}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: '#6b7280' }}>Rebalance Logic</label>
                <div className="flex gap-1">
                  {(['ai', 'threshold', 'time'] as const).map(r => (
                    <button
                      key={r}
                      onClick={() => setRebalanceLogic(r)}
                      className="flex-1 py-1.5 font-mono text-[10px] transition-colors"
                      style={rebalanceLogic === r
                        ? { border: '1px solid #00f0ff', color: '#00f0ff', background: 'rgba(0,240,255,0.08)' }
                        : { border: '1px solid #1e1e2e', color: '#6b7280', background: 'transparent' }
                      }
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {basket.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="font-mono text-xs" style={{ color: '#6b7280' }}>← Select assets to add to basket</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {basket.map(c => (
                    <div key={c.symbol} className="flex items-center gap-3 px-2 py-1.5" style={{ border: '1px solid #1e1e2e', background: '#111118' }}>
                      <span className="font-mono text-xs font-semibold w-14" style={{ color: '#e8e8ed' }}>{c.symbol}</span>
                      <input
                        type="range" min={1} max={99} value={c.weight}
                        onChange={e => updateWeight(c.symbol, Number(e.target.value))}
                        className="flex-1 h-0.5 appearance-none cursor-pointer"
                        style={{ accentColor: '#00f0ff' }}
                      />
                      <span className="font-mono text-xs tabular-nums w-10 text-right" style={{ color: '#00f0ff' }}>{c.weight}%</span>
                      <button onClick={() => removeFromBasket(c.symbol)} className="font-mono text-[10px]" style={{ color: '#ff453a' }}>×</button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-2 py-1" style={{ border: '1px solid #1e1e2e' }}>
                    <span className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Total Weight</span>
                    <span className="font-mono text-xs font-bold tabular-nums" style={{ color: totalWeight === 100 ? '#30d158' : '#ff453a' }}>{totalWeight}%</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleDeploy}
              disabled={deploying || !name || basket.length < 2 || totalWeight !== 100}
              className="w-full py-2 font-mono text-xs transition-colors disabled:opacity-40"
              style={{ border: '1px solid #00f0ff', color: '#00f0ff', background: 'transparent' }}
              onMouseEnter={e => { if (!deploying) (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {deploying ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Deploying via SSI Protocol...</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Plus className="w-3 h-3" /> Deploy Index</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}