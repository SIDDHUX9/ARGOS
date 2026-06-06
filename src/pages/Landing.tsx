import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { WalletConnect } from '@/components/argos/WalletConnect';
import { useAccount } from 'wagmi';
import { priceEngine } from '@/lib/price-engine';
import type { PriceState } from '@/lib/price-engine';
import { MOCK_AGENTS, MOCK_ASSETS, MOCK_NEWS, MOCK_INDICES, MOCK_TRADES, getRealityScoreColor, formatTimestamp } from '@/lib/argos-mock';
import { ArrowRight, Zap, Brain, Shield, TrendingUp, Activity, Rss, Layers, Terminal, CheckCircle2, AlertTriangle, Clock, BarChart2, Globe, Lock } from 'lucide-react';

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (Math.abs(value - prev.current) < 0.001) return;
    const start = prev.current;
    const end = value;
    const duration = 400;
    const startTime = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      setDisplay(start + (end - start) * t);
      if (t < 1) requestAnimationFrame(animate);
      else prev.current = end;
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <>{display.toFixed(decimals)}</>;
}

// ─── Live price ticker ────────────────────────────────────────────────────────
function LivePriceTicker({ prices }: { prices: Map<string, PriceState> }) {
  const symbols = ['BTC', 'ETH', 'GOLD', 'OIL', 'COPPER', 'SPX'];
  const items = [...symbols, ...symbols];
  return (
    <div className="overflow-hidden" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="ticker-track flex whitespace-nowrap py-2">
        {items.map((sym, i) => {
          const state = prices.get(sym);
          const price = state?.price ?? MOCK_ASSETS.find(a => a.symbol === sym)?.offChainPrice ?? 0;
          const change = state?.change24h ?? MOCK_ASSETS.find(a => a.symbol === sym)?.change24h ?? 0;
          const up = change >= 0;
          return (
            <div key={i} className="inline-flex items-center gap-3 px-6" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>{sym}</span>
              <span className="font-mono text-xs tabular-nums" style={{ color: '#e8e8ed' }}>
                {price >= 100 ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${price.toFixed(2)}`}
              </span>
              <span className="font-mono text-xs tabular-nums font-semibold" style={{ color: up ? '#30d158' : '#ff453a' }}>
                {up ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ARGOS logo image ─────────────────────────────────────────────────────────
function ArgosLogo({ size = 28 }: { size?: number }) {
  return (
    <img src="/assets/argos.png" alt="ARGOS" width={size} height={size} style={{ objectFit: 'contain' }} />
  );
}

const STATS = [
  { label: 'Assets Monitored', value: '847' },
  { label: 'Reality Scores / Day', value: '12,400' },
  { label: 'Avg Dislocation', value: '2.3%' },
  { label: 'Guardian Accuracy', value: '94.7%' },
];

// ─── Features bento grid ──────────────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    icon: Brain,
    label: 'The Oracle',
    tag: 'Reality Scoring',
    desc: 'Neuro-symbolic reasoning engine that generates Reality Scores from macro signals, news sentiment, and on-chain divergence.',
    color: '#00f0ff',
    span: 'lg:col-span-2',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    bullets: ['Confidence-weighted scoring', 'Counterpoint generation', 'Asset impact mapping'],
  },
  {
    icon: Shield,
    label: 'The Guardian',
    tag: 'Risk Management',
    desc: 'Real-time circuit breakers, adversarial red-team reasoning, and autonomous intervention when risk thresholds are breached.',
    color: '#30d158',
    span: 'lg:col-span-1',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
    bullets: ['Max drawdown circuit breakers', 'Adversarial debate engine', 'Audit-logged interventions'],
  },
  {
    icon: Activity,
    label: 'The Scribe',
    tag: 'News Ingestion',
    desc: 'Ingests structured macro news from SoSoValue Terminal, parses sentiment, and routes signals to the Oracle for scoring.',
    color: '#bf5af2',
    span: 'lg:col-span-1',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80',
    bullets: ['SoSoValue Terminal feed', 'Sentiment classification', 'Asset impact mapping'],
  },
  {
    icon: Zap,
    label: 'The Executor',
    tag: 'Trade Execution',
    desc: 'Autonomous trade execution via SoDEX with Guardian-approved risk gates, slippage budgets, and partial fill handling.',
    color: '#ff9f0a',
    span: 'lg:col-span-1',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    bullets: ['SoDEX orderbook integration', 'Slippage & latency simulation', 'Guardian pre-approval'],
  },
  {
    icon: Layers,
    label: 'The Architect',
    tag: 'Index Construction',
    desc: 'Constructs and rebalances SSI indices from Oracle signals. Deploys on-chain with simulated transaction receipts.',
    color: '#ff453a',
    span: 'lg:col-span-1',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
    bullets: ['AI-driven rebalancing', 'SSI index deployment', 'Constituent weight optimization'],
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-px h-8" style={{ background: '#00f0ff' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#00f0ff' }}>Features</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff', letterSpacing: '-0.03em', maxWidth: 600 }}>
            Five agents.<br />One autonomous reality engine.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520 }}>
            Each agent is purpose-built for a specific layer of the macro-to-on-chain pipeline. Together they form a closed-loop arbitrage system.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {FEATURE_CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`rounded-2xl overflow-hidden group cursor-default transition-all ${card.span}`}
              style={{ background: 'rgba(10,10,16,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${card.color}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              {/* Image header */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'brightness(0.4) saturate(0.6)' }}
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, rgba(10,10,16,1) 100%)` }} />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20`, border: `1px solid ${card.color}40`, backdropFilter: 'blur(8px)' }}>
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.6)', color: card.color, border: `1px solid ${card.color}30`, backdropFilter: 'blur(8px)' }}>{card.tag}</span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <h3 className="font-mono font-bold text-sm mb-2" style={{ color: '#e8e8ed' }}>{card.label}</h3>
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.desc}</p>
                <ul className="space-y-1.5">
                  {card.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: card.color }} />
                      <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Intelligence section ─────────────────────────────────────────────────────
function IntelligenceSection() {
  const [activeNews, setActiveNews] = useState(0);

  return (
    <section id="intelligence" className="relative z-10 py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-px h-8" style={{ background: '#bf5af2' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#bf5af2' }}>Intelligence</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff', letterSpacing: '-0.03em', maxWidth: 600 }}>
            Macro reality,<br />scored in real-time.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520 }}>
            The Scribe ingests structured news from SoSoValue Terminal. The Oracle generates Reality Scores with thesis, confidence, and counterpoints.
          </p>
        </motion.div>

        {/* Bento grid: 3 cols */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* News feed — col 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Rss className="w-3.5 h-3.5" style={{ color: '#bf5af2' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Feed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#bf5af2' }} />
                <span className="font-mono text-[10px]" style={{ color: '#bf5af2' }}>LIVE</span>
              </div>
            </div>
            <div>
              {MOCK_NEWS.slice(0, 5).map((item, i) => (
                <div
                  key={item.id}
                  className="px-4 py-3 cursor-pointer transition-all"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: activeNews === i ? 'rgba(191,90,242,0.06)' : 'transparent' }}
                  onClick={() => setActiveNews(i)}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                      background: item.sentiment === 'Bullish' ? 'rgba(48,209,88,0.1)' : item.sentiment === 'Bearish' ? 'rgba(255,69,58,0.1)' : 'rgba(255,159,10,0.1)',
                      color: item.sentiment === 'Bullish' ? '#30d158' : item.sentiment === 'Bearish' ? '#ff453a' : '#ff9f0a',
                    }}>{item.sentiment}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: activeNews === i ? '#e8e8ed' : 'rgba(255,255,255,0.55)' }}>{item.headline}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {item.affectedAssets.slice(0, 3).map(sym => (
                      <span key={sym} className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>{sym}</span>
                    ))}
                    {item.processed && <CheckCircle2 className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: '#30d158' }} />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Oracle score — col 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" style={{ color: '#00f0ff' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Oracle Score</span>
              </div>
            </div>
            {(() => {
              const item = MOCK_NEWS[activeNews];
              const rs = item?.realityScore;
              if (!rs) return (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Oracle processing...</p>
                  </div>
                </div>
              );
              return (
                <div className="p-5">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="text-center">
                      <div className="font-mono font-bold tabular-nums" style={{ fontSize: 56, lineHeight: 1, color: getRealityScoreColor(rs.score) }}>{rs.score}</div>
                      <div className="font-mono text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>REALITY SCORE</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Confidence</span>
                        <span className="font-mono text-xs font-bold" style={{ color: '#e8e8ed' }}>{rs.confidence}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${rs.confidence}%`, background: getRealityScoreColor(rs.score) }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {rs.affectedAssets.map(sym => (
                          <span key={sym} className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,240,255,0.08)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.15)' }}>{sym}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)' }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(0,240,255,0.5)' }}>Thesis</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{rs.thesis}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,69,58,0.04)', border: '1px solid rgba(255,69,58,0.1)' }}>
                    <p className="font-mono text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,69,58,0.5)' }}>Counterpoints</p>
                    {rs.counterpoints.map((cp, i) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255,69,58,0.5)' }} />
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{cp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* Asset scores — col 3 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5" style={{ color: '#ff9f0a' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Asset Scores</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_ASSETS.map(asset => (
                <div key={asset.symbol} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold" style={{ color: '#e8e8ed' }}>{asset.symbol}</span>
                      <span className="font-mono text-[10px] ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{asset.name}</span>
                    </div>
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color: getRealityScoreColor(asset.realityScore) }}>{asset.realityScore}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${asset.realityScore}%`, background: getRealityScoreColor(asset.realityScore) }} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="font-mono text-[10px]" style={{ color: asset.dislocation >= 0 ? '#30d158' : '#ff453a' }}>
                      {asset.dislocation >= 0 ? '+' : ''}{asset.dislocation.toFixed(2)}% disloc.
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{asset.confidence}% conf.</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Indices section ──────────────────────────────────────────────────────────
function IndicesSection({ prices }: { prices: Map<string, PriceState> }) {
  return (
    <section id="indices" className="relative z-10 py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-px h-8" style={{ background: '#ff9f0a' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#ff9f0a' }}>Indices</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff', letterSpacing: '-0.03em', maxWidth: 600 }}>
            AI-constructed indices.<br />On-chain deployed.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520 }}>
            The Architect builds SSI indices from Oracle signals and deploys them on-chain. Rebalancing is autonomous, threshold-triggered, or AI-driven.
          </p>
        </motion.div>

        {/* Bento: 2 index cards + 1 image card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Image card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 rounded-2xl overflow-hidden relative"
            style={{ border: '1px solid rgba(255,255,255,0.07)', minHeight: 280 }}
          >
            <img
              src="https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80"
              alt="Index Architecture"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.35) saturate(0.5)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,159,10,0.15) 0%, transparent 60%)' }} />
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,159,10,0.15)', border: '1px solid rgba(255,159,10,0.3)' }}>
                <Layers className="w-5 h-5" style={{ color: '#ff9f0a' }} />
              </div>
              <h3 className="font-mono font-bold text-base mb-2" style={{ color: '#ffffff' }}>SSI Index Architect</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Construct, deploy, and rebalance on-chain indices from macro signals. AI-driven weight optimization.
              </p>
            </div>
          </motion.div>

          {/* Index cards */}
          {MOCK_INDICES.map((index, i) => (
            <motion.div
              key={index.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="lg:col-span-1 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>{index.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(48,209,88,0.1)', color: '#30d158', border: '1px solid rgba(48,209,88,0.2)' }}>{index.status}</span>
              </div>
              <div className="p-4">
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{index.thesis}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <div className="font-mono font-bold text-xl tabular-nums" style={{ color: '#e8e8ed' }}>${index.currentValue.toLocaleString()}</div>
                    <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Index Value</div>
                  </div>
                  <div>
                    <div className="font-mono font-bold text-xl tabular-nums" style={{ color: index.change24h >= 0 ? '#30d158' : '#ff453a' }}>
                      {index.change24h >= 0 ? '+' : ''}{index.change24h}%
                    </div>
                    <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>24h Change</div>
                  </div>
                </div>
                {/* Constituent bars */}
                <div className="space-y-2">
                  {index.constituents.map(c => {
                    const live = prices.get(c.symbol);
                    const asset = MOCK_ASSETS.find(a => a.symbol === c.symbol);
                    const price = live?.price ?? asset?.offChainPrice ?? 0;
                    return (
                      <div key={c.symbol}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] font-semibold" style={{ color: '#e8e8ed' }}>{c.symbol}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              {price >= 100 ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${price.toFixed(2)}`}
                            </span>
                            <span className="font-mono text-[10px] font-bold" style={{ color: '#ff9f0a' }}>{c.weight}%</span>
                          </div>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${c.weight}%`, background: 'rgba(255,159,10,0.6)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                    {index.rebalanceLogic === 'ai' ? 'AI Rebalance' : index.rebalanceLogic === 'threshold' ? 'Threshold' : 'Time-based'}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {index.constituents.length} constituents
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Execution section ────────────────────────────────────────────────────────
function ExecutionSection({ prices }: { prices: Map<string, PriceState> }) {
  return (
    <section id="execution" className="relative z-10 py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-px h-8" style={{ background: '#ff453a' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#ff453a' }}>Execution</span>
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff', letterSpacing: '-0.03em', maxWidth: 600 }}>
            Autonomous execution.<br />Guardian-approved.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 520 }}>
            The Executor routes trades through SoDEX with real slippage, latency, and partial fills. Every trade is pre-approved by the Guardian.
          </p>
        </motion.div>

        {/* Bento: image + trades + guardian */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trades table — col 1-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" style={{ color: '#ff453a' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Recent Executions</span>
              </div>
              <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>via SoDEX</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {['Pair', 'Side', 'Amount', 'Price', 'Exec. Price', 'Slippage', 'Status', 'Time'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TRADES.map(trade => {
                    const live = prices.get(trade.pair.split('/')[0]);
                    const execPrice = live?.price ?? trade.executionPrice;
                    return (
                      <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>{trade.pair}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{
                            background: trade.side === 'Buy' ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)',
                            color: trade.side === 'Buy' ? '#30d158' : '#ff453a',
                            border: `1px solid ${trade.side === 'Buy' ? 'rgba(48,209,88,0.2)' : 'rgba(255,69,58,0.2)'}`,
                          }}>{trade.side}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>{trade.amount}</td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {trade.price >= 100 ? `$${trade.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${trade.price.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums" style={{ color: '#e8e8ed' }}>
                          {execPrice >= 100 ? `$${execPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${execPrice.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs tabular-nums" style={{ color: Math.abs(trade.slippage) > 0.3 ? '#ff9f0a' : 'rgba(255,255,255,0.4)' }}>
                          {trade.slippage >= 0 ? '+' : ''}{trade.slippage.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{
                            background: trade.status === 'Filled' ? 'rgba(48,209,88,0.1)' : trade.status === 'Partial' ? 'rgba(255,159,10,0.1)' : 'rgba(255,255,255,0.05)',
                            color: trade.status === 'Filled' ? '#30d158' : trade.status === 'Partial' ? '#ff9f0a' : 'rgba(255,255,255,0.4)',
                          }}>{trade.status}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatTimestamp(trade.timestamp)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Guardian panel — col 3 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,16,0.9)' }}
          >
            {/* Image header */}
            <div className="relative h-36 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80"
                alt="Guardian"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.3) saturate(0.4)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(10,10,16,1) 100%)' }} />
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: '#30d158' }} />
                <span className="font-mono text-xs font-bold" style={{ color: '#e8e8ed' }}>The Guardian</span>
                <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#30d158' }} />
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Max Daily Loss', value: '3%', status: 'OK', ok: true },
                { label: 'Max Position Size', value: '20%', status: 'OK', ok: true },
                { label: 'Volatility Halt', value: '25%', status: 'OK', ok: true },
                { label: 'Autonomous Threshold', value: '$5,000', status: 'ACTIVE', ok: true },
              ].map(cb => (
                <div key={cb.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{cb.label}</div>
                    <div className="font-mono text-xs font-bold" style={{ color: '#e8e8ed' }}>{cb.value}</div>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(48,209,88,0.1)', color: '#30d158', border: '1px solid rgba(48,209,88,0.2)' }}>{cb.status}</span>
                </div>
              ))}
              <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(255,69,58,0.06)', border: '1px solid rgba(255,69,58,0.15)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#ff453a' }} />
                  <span className="font-mono text-[10px] font-bold" style={{ color: '#ff453a' }}>Last Intervention</span>
                </div>
                <p className="font-mono text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Blocked OIL trade: Max daily loss threshold exceeded (4.2% vs 3% limit)
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Landing ─────────────────────────────────────────────────────────────
export default function Landing() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [prices, setPrices] = useState<Map<string, PriceState>>(priceEngine.getAllStates());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add('dark');
    priceEngine.start();
    const unsub = priceEngine.subscribe(states => setPrices(new Map(states)));
    return unsub;
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000000', color: '#e8e8ed' }}>
      {/* Background video */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
          style={{ opacity: 0.15, transform: 'scale(1.1)', objectPosition: 'center bottom' }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260215_121759_424f8e9c-d8bd-4974-9567-52709dfb6842.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: 'linear-gradient(to top, #000000, transparent)' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <ArgosLogo size={28} />
            <span className="font-mono font-bold text-sm tracking-widest" style={{ color: '#e8e8ed' }}>ARGOS</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', href: '#features' },
              { label: 'Intelligence', href: '#intelligence' },
              { label: 'Indices', href: '#indices' },
              { label: 'Execution', href: '#execution' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#e8e8ed'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
              >{item.label}</a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#30d158' }} />
            <span className="font-mono text-xs" style={{ color: '#30d158' }}>LIVE</span>
          </div>
          <WalletConnect />
        </div>
      </nav>

      {/* Ticker */}
      <div className="relative z-10">
        <LivePriceTicker prices={prices} />
      </div>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em', color: '#ffffff' }}
          >
            Reality is mispriced.
            <br />
            <span style={{ color: '#00f0ff' }}>We find it first.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg leading-relaxed mb-10 mx-auto"
            style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 600 }}
          >
            ARGOS is an autonomous agent swarm that bridges off-chain macro reality with on-chain execution. Five AI agents read macro news, score assets, construct indices, and execute arbitrage.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <WalletConnect />
            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', borderRadius: 6, textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            >
              Explore Features <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px mb-16"
            style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}
          >
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-5 px-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="font-mono font-bold text-2xl tabular-nums" style={{ color: '#00f0ff' }}>{stat.value}</span>
                <span className="font-mono text-xs mt-1 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Dashboard preview bento */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full max-w-5xl mx-auto"
        >
          {/* Bento grid preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Main preview image */}
            <div className="md:col-span-2 rounded-2xl overflow-hidden relative" style={{ border: '1px solid rgba(255,255,255,0.08)', minHeight: 220 }}>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
                alt="ARGOS War Room Dashboard"
                className="w-full h-full object-cover absolute inset-0"
                style={{ filter: 'brightness(0.35) saturate(0.5)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.08) 0%, transparent 60%)' }} />
              <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff453a' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff9f0a' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#30d158' }} />
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>ARGOS // War Room</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#00f0ff' }} />
                    <span className="font-mono text-[10px]" style={{ color: '#00f0ff' }}>LIVE</span>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs font-bold mb-1" style={{ color: '#e8e8ed' }}>War Room Terminal</div>
                  <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Multi-agent dashboard with live opportunities, portfolio, and agent swarm status</div>
                </div>
              </div>
            </div>

            {/* Agent status mini */}
            <div className="md:col-span-1 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,10,16,0.9)' }}>
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Agent Swarm</span>
              </div>
              {MOCK_AGENTS.map(agent => (
                <div key={agent.id} className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{agent.name.replace('The ', '')}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{
                      background: agent.status === 'Idle' ? '#6b7280' : agent.status === 'Scanning' || agent.status === 'Monitoring' ? '#00f0ff' : '#ff9f0a',
                      animation: agent.status !== 'Idle' ? 'pulse-live 2s infinite' : 'none',
                    }} />
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{agent.status}</span>
                  </div>
                </div>
              ))}
              <div className="px-3 py-2.5 flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.04)', borderTop: '1px solid rgba(0,240,255,0.08)' }}>
                <span className="font-mono text-[10px]" style={{ color: 'rgba(0,240,255,0.6)' }}>Connect wallet to access →</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Four Sections ── */}
      <FeaturesSection />
      <IntelligenceSection />
      <IndicesSection prices={prices} />
      <ExecutionSection prices={prices} />

      {/* CTA section */}
      <section className="relative z-10 py-24 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)' }}>
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#00f0ff' }} />
                <span className="font-mono text-xs" style={{ color: '#00f0ff' }}>Ready to enter the War Room?</span>
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                Connect your wallet.<br />Start finding alpha.
              </h2>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 420 }}>
                Access the full ARGOS terminal — live agent swarm, index architect, and autonomous execution engine.
              </p>
              <div className="flex items-center gap-4">
                <WalletConnect />
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>EVM wallet required</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-3"
            >
              {[
                { icon: Globe, label: 'Multi-chain', desc: 'Mainnet, Sepolia, Arbitrum', color: '#00f0ff' },
                { icon: Shield, label: 'Guardian Protected', desc: 'Every trade pre-approved', color: '#30d158' },
                { icon: Brain, label: 'AI-Powered', desc: 'Oracle Reality Scores', color: '#bf5af2' },
                { icon: BarChart2, label: 'Live Data', desc: 'Real-time price engine', color: '#ff9f0a' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="font-mono text-xs font-bold mb-1" style={{ color: '#e8e8ed' }}>{item.label}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.6)' }}>
        <div className="flex items-center gap-3">
          <ArgosLogo size={20} />
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>ARGOS v2.0</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="font-mono text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#e8e8ed'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
          >GitHub</a>
          <a href="https://sosovalue.com" target="_blank" rel="noopener noreferrer" className="font-mono text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = '#e8e8ed'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
          >SoSoValue</a>
        </div>
      </footer>
    </div>
  );
}