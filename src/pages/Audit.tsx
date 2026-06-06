import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, ExternalLink, QrCode } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_AUDIT, MOCK_TRADES, formatTimestamp } from '@/lib/argos-mock';
import type { AuditEntry } from '@/lib/argos-types';

const EVENT_COLORS: Record<AuditEntry['eventType'], string> = {
  'News Processed': '#00d4ff',
  'Score Generated': '#8b5cf6',
  'Index Created': '#10b981',
  'Trade Executed': '#f59e0b',
  'Guardian Intervention': '#e53e3e',
  'Rebalance': '#f97316',
};

function AuditCard({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const color = EVENT_COLORS[entry.eventType];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/50 overflow-hidden"
      style={{ background: '#0f1420' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 hover:bg-accent/20 transition-colors text-left"
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
              {entry.eventType}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{formatTimestamp(entry.timestamp)}</span>
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">Agents: {entry.agents.join(', ')}</span>
          </div>
          <p className="text-sm text-foreground">{entry.summary}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1 truncate">#{entry.hash}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30">
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">REASONING CHAIN</p>
                  <pre className="text-xs font-mono text-foreground p-3 rounded border border-border/30 overflow-x-auto" style={{ background: '#141926' }}>
                    {JSON.stringify(entry.details, null, 2)}
                  </pre>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all hover:bg-primary/20"
                    style={{ color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}
                    onClick={() => window.open(`https://etherscan.io/tx/${entry.hash}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" /> Verify On-Chain
                  </button>
                  <span className="text-xs font-mono text-muted-foreground">Hash: {entry.hash}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TradeReceipt({ trade }: { trade: typeof MOCK_TRADES[0] }) {
  return (
    <div className="p-4 rounded-lg border border-border/50" style={{ background: '#0f1420', borderColor: trade.side === 'Buy' ? 'rgba(16,185,129,0.2)' : 'rgba(229,62,62,0.2)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Trade Receipt</p>
          <p className="font-mono font-bold text-lg text-foreground mt-1">{trade.pair}</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{
            background: trade.status === 'Filled' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: trade.status === 'Filled' ? '#10b981' : '#f59e0b',
          }}>
            {trade.status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {[
          { label: 'Side', value: trade.side, color: trade.side === 'Buy' ? '#10b981' : '#e53e3e' },
          { label: 'Amount', value: trade.amount.toString() },
          { label: 'Exec Price', value: `$${trade.executionPrice.toLocaleString()}` },
          { label: 'Slippage', value: `${trade.slippage >= 0 ? '+' : ''}${trade.slippage.toFixed(3)}%` },
          { label: 'Triggered By', value: trade.triggeredBy || 'Manual' },
          { label: 'Time', value: formatTimestamp(trade.timestamp) },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-muted-foreground font-mono">{label}</p>
            <p className="font-mono font-bold text-foreground" style={color ? { color } : {}}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground truncate">{trade.hash}</p>
        <button
          className="flex items-center gap-1 text-xs font-mono transition-colors hover:text-foreground"
          style={{ color: '#00d4ff' }}
          onClick={() => window.open(`https://etherscan.io/tx/${trade.hash}`, '_blank')}
        >
          <ExternalLink className="w-3 h-3" /> View
        </button>
      </div>
    </div>
  );
}

export default function Audit() {
  const [filter, setFilter] = useState<AuditEntry['eventType'] | 'All'>('All');

  const filtered = filter === 'All' ? MOCK_AUDIT : MOCK_AUDIT.filter(e => e.eventType === filter);
  const eventTypes: (AuditEntry['eventType'] | 'All')[] = ['All', 'News Processed', 'Score Generated', 'Index Created', 'Trade Executed', 'Guardian Intervention'];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" style={{ color: '#00d4ff' }} />
          <div>
            <h1 className="font-mono font-bold text-xl text-foreground">Audit Trail</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">Immutable on-chain attestation log</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(EVENT_COLORS).map(([type, color]) => {
            const count = MOCK_AUDIT.filter(e => e.eventType === type).length;
            return (
              <div key={type} className="p-3 rounded-lg border border-border/50 text-center" style={{ background: '#0f1420' }}>
                <p className="font-mono text-xl font-bold" style={{ color }}>{count}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1 leading-tight">{type}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Event Log */}
          <div className="xl:col-span-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className="px-2 py-1 rounded text-xs font-mono transition-all"
                  style={filter === type
                    ? { background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }
                    : { background: 'transparent', color: '#5a6480', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filtered.map(entry => (
                <AuditCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>

          {/* Trade Receipts */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Trade Receipts</p>
            {MOCK_TRADES.map(trade => (
              <TradeReceipt key={trade.id} trade={trade} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
