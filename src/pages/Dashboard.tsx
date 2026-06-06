import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_AGENTS, MOCK_ASSETS, MOCK_AUDIT, getRealityScoreColor, formatTimestamp } from '@/lib/argos-mock';
import type { AgentStatus } from '@/lib/argos-types';
import { priceEngine } from '@/lib/price-engine';
import type { PriceState } from '@/lib/price-engine';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const STATUS_COLORS: Record<AgentStatus['status'], string> = {
  Idle: '#6b7280',
  Scanning: '#00f0ff',
  Reasoning: '#bf5af2',
  Executing: '#ff9f0a',
  Monitoring: '#30d158',
  Alert: '#ff453a',
};

const pnlData = (() => {
  let v = 100000;
  return Array.from({ length: 96 }, (_, i) => {
    v = v * (1 + (Math.sin(i * 0.3) * 0.002 + (Math.random() - 0.45) * 0.003));
    return { i, v };
  });
})();

const portfolioValue = pnlData[pnlData.length - 1].v;
const pnl24h = portfolioValue - pnlData[pnlData.length - 25].v;
const pnlPct = (pnl24h / pnlData[pnlData.length - 25].v) * 100;

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState<typeof MOCK_ASSETS[0] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [prices, setPrices] = useState<Map<string, PriceState>>(priceEngine.getAllStates());

  useEffect(() => {
    priceEngine.start();
    const unsub = priceEngine.subscribe(states => setPrices(new Map(states)));
    return unsub;
  }, []);

  useEffect(() => {
    const statuses: AgentStatus['status'][] = ['Idle', 'Scanning', 'Reasoning', 'Executing', 'Monitoring'];
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        lastActivity: Math.random() > 0.7 ? new Date() : a.lastActivity,
        status: Math.random() > 0.88 ? statuses[Math.floor(Math.random() * statuses.length)] : a.status,
      })));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const assetsWithLivePrices = MOCK_ASSETS.map(a => {
    const live = prices.get(a.symbol);
    return {
      ...a,
      offChainPrice: live?.price ?? a.offChainPrice,
      change24h: live?.change24h ?? a.change24h,
      onChainPrice: live ? live.price * (1 + (a.dislocation / 100)) : a.onChainPrice,
    };
  });

  return (
    <AppLayout>
      <div className="p-4 space-y-3 h-full overflow-auto">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            { label: 'Portfolio Value', value: `$${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: 'Total AUM', color: '#e8e8ed' },
            { label: '24h P&L', value: `${pnl24h >= 0 ? '+' : ''}$${Math.abs(pnl24h).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, color: pnl24h >= 0 ? '#30d158' : '#ff453a' },
            { label: 'Active Agents', value: `${agents.filter(a => a.status !== 'Idle').length}/5`, sub: 'Running', color: '#00f0ff' },
            { label: 'Pending Trades', value: '2', sub: 'Awaiting fill', color: '#ff9f0a' },
          ].map(card => (
            <div key={card.label} className="p-3" style={{ background: '#0a0a10', border: '1px solid #1e1e2e' }}>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#6b7280' }}>{card.label}</p>
              <p className="font-mono text-lg font-bold tabular-nums leading-none" style={{ color: card.color }}>{card.value}</p>
              <p className="font-mono text-[10px] mt-1" style={{ color: '#6b7280' }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Opportunities table — 8 cols */}
          <div className="xl:col-span-8" style={{ border: '1px solid #1e1e2e' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Active Opportunities</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#00f0ff' }} />
                <span className="font-mono text-[10px]" style={{ color: '#00f0ff' }}>LIVE</span>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                  {['Asset', 'Score', 'Off-Chain', 'On-Chain', 'Disloc.', 'Conf.', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-mono text-[10px] uppercase tracking-wider" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assetsWithLivePrices.map((asset) => (
                  <tr
                    key={asset.symbol}
                    className="transition-colors row-flash"
                    style={{ borderBottom: '1px solid #1e1e2e' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111118'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td className="px-3 py-2 font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>{asset.symbol}</td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-bold tabular-nums" style={{ color: getRealityScoreColor(asset.realityScore) }}>
                        {asset.realityScore}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums" style={{ color: '#e8e8ed' }}>
                      {asset.offChainPrice >= 100 ? `$${asset.offChainPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${asset.offChainPrice.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums" style={{ color: '#e8e8ed' }}>
                      {asset.onChainPrice >= 100 ? `$${asset.onChainPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${asset.onChainPrice.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs font-semibold tabular-nums" style={{ color: asset.dislocation >= 0 ? '#30d158' : '#ff453a' }}>
                      {asset.dislocation >= 0 ? '+' : ''}{asset.dislocation.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums" style={{ color: '#6b7280' }}>{asset.confidence}%</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => { setSelectedAsset(asset); setSheetOpen(true); }}
                        className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] transition-colors"
                        style={{ border: '1px solid #1e1e2e', color: '#6b7280' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00f0ff'; (e.currentTarget as HTMLElement).style.color = '#00f0ff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                      >
                        <Eye className="w-3 h-3" /> view
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Agent status — 4 cols */}
          <div className="xl:col-span-4" style={{ border: '1px solid #1e1e2e' }}>
            <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Agent Swarm</span>
            </div>
            {agents.map(agent => {
              const color = STATUS_COLORS[agent.status];
              return (
                <div key={agent.id} className="px-3 py-2.5" style={{ borderBottom: '1px solid #1e1e2e' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-medium" style={{ color: '#e8e8ed' }}>{agent.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: agent.status !== 'Idle' ? 'pulse-live 2s infinite' : 'none' }} />
                      <span className="font-mono text-[10px]" style={{ color }}>{agent.status}</span>
                    </div>
                  </div>
                  <div className="h-5 mb-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={agent.sparkline.map((v, i) => ({ v, i }))}>
                        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="font-mono text-[10px] truncate" style={{ color: '#6b7280' }}>{agent.activityLog[0]}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* P&L chart — 7 cols */}
          <div className="xl:col-span-7" style={{ border: '1px solid #1e1e2e' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Portfolio Equity Curve</span>
              <span className="font-mono text-xs font-bold" style={{ color: pnl24h >= 0 ? '#30d158' : '#ff453a' }}>
                {pnl24h >= 0 ? '+' : ''}{pnlPct.toFixed(2)}% 24h
              </span>
            </div>
            <div className="p-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pnlData}>
                  <Line type="monotone" dataKey="v" stroke="#30d158" strokeWidth={1.5} dot={false} />
                  <Tooltip
                    contentStyle={{ background: '#0a0a10', border: '1px solid #1e1e2e', borderRadius: 0, fontSize: 11, fontFamily: 'monospace' }}
                    formatter={(v: unknown) => [`$${(v as number).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Portfolio']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit log — 5 cols */}
          <div className="xl:col-span-5" style={{ border: '1px solid #1e1e2e' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Recent Events</span>
              <RefreshCw className="w-3 h-3" style={{ color: '#6b7280' }} />
            </div>
            {MOCK_AUDIT.slice(0, 5).map(entry => (
              <div key={entry.id} className="flex items-start gap-2 px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e' }}>
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{
                  background: entry.eventType === 'Guardian Intervention' ? '#ff453a' : entry.eventType === 'Trade Executed' ? '#ff9f0a' : '#00f0ff',
                }} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] truncate" style={{ color: '#e8e8ed' }}>{entry.summary}</p>
                  <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{formatTimestamp(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reasoning slide-over */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="border-l" style={{ background: '#0a0a10', borderColor: '#1e1e2e', maxWidth: 400 }}>
          <SheetHeader>
            <SheetTitle className="font-mono text-sm" style={{ color: '#e8e8ed' }}>Oracle Reasoning</SheetTitle>
          </SheetHeader>
          {selectedAsset && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3" style={{ border: '1px solid #1e1e2e' }}>
                <div>
                  <p className="font-mono font-bold text-lg" style={{ color: '#e8e8ed' }}>{selectedAsset.symbol}</p>
                  <p className="font-mono text-xs" style={{ color: '#6b7280' }}>{selectedAsset.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-3xl font-bold tabular-nums" style={{ color: getRealityScoreColor(selectedAsset.realityScore) }}>{selectedAsset.realityScore}</p>
                  <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Reality Score</p>
                </div>
              </div>
              <div className="p-3" style={{ border: '1px solid #1e1e2e', background: '#111118' }}>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>Thesis</p>
                <p className="text-xs leading-relaxed" style={{ color: '#e8e8ed' }}>
                  Rate cut expectations and institutional inflows are creating upward pressure. On-chain pricing lags off-chain reality by {Math.abs(selectedAsset.dislocation).toFixed(2)}%.
                </p>
              </div>
              <div className="p-3" style={{ border: '1px solid #1e1e2e', background: '#111118' }}>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: '#6b7280' }}>Counterpoints</p>
                <ul className="space-y-1.5">
                  <li className="text-xs flex items-start gap-2" style={{ color: '#6b7280' }}>
                    <span style={{ color: '#ff453a' }}>▸</span> Market may have already priced in this information
                  </li>
                  <li className="text-xs flex items-start gap-2" style={{ color: '#6b7280' }}>
                    <span style={{ color: '#ff453a' }}>▸</span> Correlated assets could dampen the effect
                  </li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 text-center" style={{ border: '1px solid #1e1e2e' }}>
                  <p className="font-mono text-lg font-bold tabular-nums" style={{ color: '#e8e8ed' }}>{selectedAsset.confidence}%</p>
                  <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Confidence</p>
                </div>
                <div className="p-3 text-center" style={{ border: '1px solid #1e1e2e' }}>
                  <p className="font-mono text-lg font-bold tabular-nums" style={{ color: selectedAsset.dislocation >= 0 ? '#30d158' : '#ff453a' }}>
                    {selectedAsset.dislocation >= 0 ? '+' : ''}{selectedAsset.dislocation.toFixed(2)}%
                  </p>
                  <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>Dislocation</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}