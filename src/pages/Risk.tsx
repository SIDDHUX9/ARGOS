import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_RISK_METRICS, MOCK_CIRCUIT_BREAKERS, MOCK_AUDIT } from '@/lib/argos-mock';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GUARDIAN_LOGS = [
  { id: 'g1', timestamp: new Date(Date.now() - 600000), action: 'Blocked', summary: 'Blocked OIL/USDC Sell: Max daily loss threshold exceeded (4.2% vs 3% limit)', severity: 'high' },
  { id: 'g2', timestamp: new Date(Date.now() - 3600000), action: 'Adjusted', summary: 'Adjusted ETH confidence from 85% to 72%: USD strength may suppress risk assets', severity: 'medium' },
  { id: 'g3', timestamp: new Date(Date.now() - 7200000), action: 'Approved', summary: 'Approved BTC/USDC Buy 0.5 BTC with reduced position size (0.5 → 0.35 BTC)', severity: 'low' },
  { id: 'g4', timestamp: new Date(Date.now() - 86400000), action: 'Halted', summary: 'Volatility halt triggered: BTC 24h volatility reached 28.4% (threshold: 25%)', severity: 'high' },
];

const ADVERSARIAL_DEBATES = [
  {
    id: 'd1',
    asset: 'COPPER',
    oracle: { thesis: 'Bullish on copper due to Chilean mine strike supply shock. 3-week disruption creates significant deficit.', confidence: 85 },
    guardian: { counterpoint: 'USD strength may suppress commodity prices. Chinese manufacturing PMI contraction reduces demand outlook.', adjustment: -13 },
    verdict: 'Approved with reduced position size (60% → 40% of index weight)',
    approved: true,
  },
  {
    id: 'd2',
    asset: 'OIL',
    oracle: { thesis: 'OPEC+ surprise cut of 500k bbl/day creates immediate supply deficit. Bullish signal.', confidence: 78 },
    guardian: { counterpoint: 'Current daily loss at 4.2% exceeds 3% circuit breaker. Trade blocked regardless of signal quality.', adjustment: -78 },
    verdict: 'Blocked: Circuit breaker triggered. Max daily loss exceeded.',
    approved: false,
  },
];

function MetricCard({ label, value, unit, color, description }: { label: string; value: number; unit: string; color: string; description: string }) {
  return (
    <div className="p-4 rounded-lg border border-border/50" style={{ background: '#0f1420' }}>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className="font-mono text-2xl font-bold" style={{ color }}>{value}{unit}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export default function Risk() {
  const [breakers, setBreakers] = useState(MOCK_CIRCUIT_BREAKERS);
  const [expandedDebate, setExpandedDebate] = useState<string | null>('d1');

  const updateBreaker = (key: keyof typeof breakers, value: number) => {
    setBreakers(prev => ({ ...prev, [key]: value }));
    toast.success('Circuit breaker updated', { description: `${key} set to ${value}` });
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6" style={{ color: '#00d4ff' }} />
          <div>
            <h1 className="font-mono font-bold text-xl text-foreground">Risk Guardian</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Portfolio risk management and circuit breakers</p>
          </div>
        </div>

        {/* Risk Metrics */}
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Portfolio Risk Metrics</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Sharpe Ratio" value={MOCK_RISK_METRICS.sharpeRatio} unit="" color="#10b981" description="Risk-adjusted return (>2 is excellent)" />
            <MetricCard label="Max Drawdown" value={MOCK_RISK_METRICS.maxDrawdown} unit="%" color="#e53e3e" description="Largest peak-to-trough decline" />
            <MetricCard label="Volatility" value={MOCK_RISK_METRICS.volatility} unit="%" color="#f59e0b" description="Annualized portfolio volatility" />
            <MetricCard label="Concentration" value={MOCK_RISK_METRICS.concentrationRisk} unit="%" color="#8b5cf6" description="Top position as % of portfolio" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Circuit Breakers */}
          <div className="rounded-lg border border-border/50 p-4" style={{ background: '#0f1420' }}>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Circuit Breaker Settings</p>
            <div className="space-y-4">
              {[
                { key: 'maxDailyLoss' as const, label: 'Max Daily Loss', unit: '%', desc: 'Halt all trading if daily P&L drops below this threshold' },
                { key: 'maxPositionSize' as const, label: 'Max Position Size', unit: '%', desc: 'Maximum single position as % of portfolio' },
                { key: 'volatilityHalt' as const, label: 'Volatility Halt', unit: '%', desc: 'Halt autonomous trading if 24h volatility exceeds this' },
                { key: 'autonomousThreshold' as const, label: 'Auto-Execute Limit', unit: '$', desc: 'Max USD value for autonomous execution without confirmation' },
              ].map(({ key, label, unit, desc }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-foreground">{label}</label>
                    <span className="text-xs font-mono" style={{ color: '#00d4ff' }}>{breakers[key]}{unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={key === 'autonomousThreshold' ? 100 : 1}
                      max={key === 'autonomousThreshold' ? 50000 : 50}
                      value={breakers[key]}
                      onChange={e => setBreakers(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                      onMouseUp={e => updateBreaker(key, Number((e.target as HTMLInputElement).value))}
                      className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#00d4ff' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guardian Logs */}
          <div className="rounded-lg border border-border/50 p-4" style={{ background: '#0f1420' }}>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">Guardian Intervention Log</p>
            <div className="space-y-2">
              {GUARDIAN_LOGS.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded border border-border/30" style={{ background: '#141926' }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {log.action === 'Blocked' || log.action === 'Halted' ? (
                      <XCircle className="w-4 h-4" style={{ color: '#e53e3e' }} />
                    ) : log.action === 'Approved' ? (
                      <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold" style={{
                        color: log.action === 'Blocked' || log.action === 'Halted' ? '#e53e3e' : log.action === 'Approved' ? '#10b981' : '#f59e0b'
                      }}>{log.action}</span>
                      <span className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{log.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adversarial Review */}
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Adversarial Review Panel</p>
          <div className="space-y-3">
            {ADVERSARIAL_DEBATES.map(debate => (
              <div key={debate.id} className="rounded-lg border border-border/50 overflow-hidden" style={{ background: '#0f1420' }}>
                <button
                  onClick={() => setExpandedDebate(expandedDebate === debate.id ? null : debate.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-foreground">{debate.asset}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{
                      background: debate.approved ? 'rgba(16,185,129,0.15)' : 'rgba(229,62,62,0.15)',
                      color: debate.approved ? '#10b981' : '#e53e3e',
                      border: `1px solid ${debate.approved ? 'rgba(16,185,129,0.3)' : 'rgba(229,62,62,0.3)'}`,
                    }}>
                      {debate.approved ? 'Approved' : 'Blocked'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">Oracle: {debate.oracle.confidence}% → Guardian: {Math.max(0, debate.oracle.confidence + debate.guardian.adjustment)}%</span>
                  </div>
                  {expandedDebate === debate.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {expandedDebate === debate.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-border/30">
                        <div className="mt-3 p-3 rounded border border-border/30" style={{ background: '#141926' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono font-bold" style={{ color: '#8b5cf6' }}>ORACLE</span>
                            <span className="text-xs text-muted-foreground font-mono">Confidence: {debate.oracle.confidence}%</span>
                          </div>
                          <p className="text-sm text-foreground">{debate.oracle.thesis}</p>
                        </div>
                        <div className="p-3 rounded border border-border/30" style={{ background: '#141926' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono font-bold" style={{ color: '#e53e3e' }}>GUARDIAN</span>
                            <span className="text-xs font-mono" style={{ color: '#e53e3e' }}>Confidence adjusted {debate.guardian.adjustment}%</span>
                          </div>
                          <p className="text-sm text-foreground">{debate.guardian.counterpoint}</p>
                        </div>
                        <div className="p-3 rounded border" style={{
                          background: debate.approved ? 'rgba(16,185,129,0.05)' : 'rgba(229,62,62,0.05)',
                          borderColor: debate.approved ? 'rgba(16,185,129,0.2)' : 'rgba(229,62,62,0.2)',
                        }}>
                          <span className="text-xs font-mono font-bold" style={{ color: debate.approved ? '#10b981' : '#e53e3e' }}>VERDICT: </span>
                          <span className="text-sm text-foreground">{debate.verdict}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
