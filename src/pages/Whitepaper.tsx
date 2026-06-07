import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ArrowLeft, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Table of Contents ────────────────────────────────────────────────────────
const TOC = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: '1. Introduction' },
  { id: 'problem', label: '2. The Problem' },
  { id: 'architecture', label: '3. System Architecture' },
  { id: 'agents', label: '4. The Agent Swarm' },
  { id: 'reality-score', label: '5. Reality Score Methodology' },
  { id: 'index-protocol', label: '6. SSI Index Protocol' },
  { id: 'execution', label: '7. Execution & SoDEX Integration' },
  { id: 'risk', label: '8. Guardian Risk Framework' },
  { id: 'contracts', label: '9. Smart Contract Architecture' },
  { id: 'data', label: '10. Data Sources & Oracles' },
  { id: 'roadmap', label: '11. Roadmap' },
  { id: 'conclusion', label: '12. Conclusion' },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, title, number, children }: { id: string; title: string; number?: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4 }}
      className="mb-16"
    >
      <div className="flex items-baseline gap-3 mb-6">
        {number && <span className="font-mono text-xs" style={{ color: '#00f0ff' }}>{number}</span>}
        <h2 className="font-mono font-bold text-xl" style={{ color: '#e8e8ed', letterSpacing: '-0.02em' }}>{title}</h2>
      </div>
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {children}
      </div>
    </motion.section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ lineHeight: 1.8 }}>{children}</p>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono font-semibold text-sm mt-8 mb-3" style={{ color: '#e8e8ed' }}>{children}</h3>;
}

function Callout({ color = '#00f0ff', label, children }: { color?: string; label: string; children: React.ReactNode }) {
  return (
    <div className="my-6 p-4 rounded" style={{ background: `${color}08`, border: `1px solid ${color}25`, borderLeft: `3px solid ${color}` }}>
      <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color }}>{label}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{children}</p>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-xs font-mono" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
            {headers.map(h => (
              <th key={h} className="text-left py-2 px-3 uppercase tracking-wider" style={{ color: '#6b7280', fontSize: 10 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3" style={{ color: j === 0 ? '#e8e8ed' : 'rgba(255,255,255,0.5)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeSnip({ children }: { children: string }) {
  return (
    <pre className="my-4 p-4 rounded text-xs overflow-x-auto" style={{ background: '#050507', border: '1px solid #1e1e2e', color: '#00f0ff', fontFamily: 'monospace', lineHeight: 1.7 }}>
      {children}
    </pre>
  );
}

// ─── TOC Sidebar ──────────────────────────────────────────────────────────────
function TocSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile TOC toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 w-full px-4 py-2.5 font-mono text-xs"
          style={{ border: '1px solid #1e1e2e', background: '#0a0a10', color: '#6b7280' }}
        >
          <span className="flex-1 text-left">Table of Contents</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <div className="mt-1" style={{ border: '1px solid #1e1e2e', background: '#0a0a10' }}>
            {TOC.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-mono text-xs transition-colors"
                style={{ color: '#6b7280', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#00f0ff'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#6b7280'; }}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-8">
          <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>Contents</p>
          <nav className="space-y-0.5">
            {TOC.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-2 py-1.5 font-mono text-xs rounded transition-colors"
                style={{ color: '#6b7280', textDecoration: 'none' }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = '#00f0ff'; (e.target as HTMLElement).style.background = 'rgba(0,240,255,0.05)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = '#6b7280'; (e.target as HTMLElement).style.background = 'transparent'; }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #1e1e2e' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#6b7280' }}>Contracts (Sepolia)</p>
            {[
              { label: 'ArgosAudit', addr: '0x1C6d...1Eaa' },
              { label: 'ArgosIndex', addr: '0x7471...3c68' },
              { label: 'ArgosVault', addr: '0xf32C...6936' },
            ].map(c => (
              <div key={c.label} className="mb-2">
                <p className="font-mono text-[10px]" style={{ color: '#e8e8ed' }}>{c.label}</p>
                <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>{c.addr}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Whitepaper() {
  return (
    <div className="min-h-screen" style={{ background: '#050507', color: '#e8e8ed' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3" style={{ background: 'rgba(5,5,7,0.95)', borderBottom: '1px solid #1e1e2e', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-mono text-xs transition-colors" style={{ color: '#6b7280', textDecoration: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00f0ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <div className="w-px h-4" style={{ background: '#1e1e2e' }} />
          <div className="flex items-center gap-2">
            <img src="/assets/argos.png" alt="ARGOS" className="w-5 h-5 object-contain" />
            <span className="font-mono text-xs font-bold" style={{ color: '#00f0ff' }}>ARGOS</span>
            <span className="font-mono text-xs" style={{ color: '#6b7280' }}>// Whitepaper v1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,240,255,0.08)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.2)' }}>
            SoSoValue Buildathon 2025
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-16 text-center" style={{ borderBottom: '1px solid #1e1e2e', background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.04) 0%, transparent 70%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: '#00f0ff' }}>Technical Whitepaper</p>
          <h1 className="font-mono font-bold mb-4" style={{ fontSize: 'clamp(28px, 5vw, 48px)', letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.1 }}>
            ARGOS: Reality Arbitrage Engine
          </h1>
          <p className="font-mono text-sm mb-6 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            An autonomous multi-agent system that bridges off-chain macro reality with on-chain execution through structured intelligence, adversarial risk management, and cryptographic audit trails.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Network', value: 'Sepolia / EVM' },
              { label: 'Built for', value: 'SoSoValue Buildathon' },
              { label: 'License', value: 'MIT' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>{item.label}</p>
                <p className="font-mono text-xs font-bold" style={{ color: '#e8e8ed' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        <TocSidebar />

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl">

          {/* Abstract */}
          <Section id="abstract" title="Abstract">
            <P>
              ARGOS (Autonomous Reality Grounding and Orchestration System) is a production-grade, multi-agent financial intelligence platform that continuously monitors macro-economic signals, generates structured Reality Scores, constructs and deploys on-chain indices, and executes trades through a Guardian-protected execution pipeline.
            </P>
            <P>
              The system is composed of five specialized AI agents — The Scribe, The Oracle, The Architect, The Executor, and The Guardian — each responsible for a distinct layer of the macro-to-on-chain arbitrage pipeline. All agent decisions are cryptographically attested on-chain via the ArgosAudit contract, creating an immutable, verifiable audit trail.
            </P>
            <Callout color="#00f0ff" label="Core Thesis">
              Macro reality consistently diverges from on-chain asset pricing. ARGOS quantifies this divergence as a Reality Score and autonomously exploits it through structured index construction and Guardian-approved trade execution.
            </Callout>
          </Section>

          {/* Introduction */}
          <Section id="introduction" title="Introduction" number="1.">
            <P>
              The global financial system operates across two increasingly divergent layers: the off-chain world of macro-economic signals, geopolitical events, commodity supply shocks, and central bank policy — and the on-chain world of tokenized assets, decentralized exchanges, and smart contract-governed indices.
            </P>
            <P>
              Traditional quantitative trading systems are designed for one layer or the other. Macro hedge funds operate in TradFi with limited on-chain exposure. DeFi protocols react to on-chain price feeds but lack structured macro intelligence. ARGOS bridges this gap by creating a closed-loop system that ingests macro signals, scores their impact on on-chain assets, and executes structured positions through a fully auditable, Guardian-protected pipeline.
            </P>
            <P>
              Built for the SoSoValue Buildathon, ARGOS integrates directly with the SoSoValue Terminal for structured news ingestion and the SSI (SoSoValue Index) protocol for on-chain index deployment. The system is designed to be production-ready, with real smart contracts deployed on Sepolia testnet and a live data pipeline anchored to CoinGecko and AlphaVantage price feeds.
            </P>
          </Section>

          {/* Problem */}
          <Section id="problem" title="The Problem: Reality Dislocation" number="2.">
            <H3>2.1 The Macro-to-On-Chain Gap</H3>
            <P>
              On-chain asset prices are determined by decentralized market participants who may not have access to, or may not have processed, the latest macro-economic signals. This creates systematic dislocations — periods where the on-chain price of an asset diverges meaningfully from its fair value as implied by off-chain macro reality.
            </P>
            <P>
              Examples of such dislocations include: a copper supply shock that has not yet been priced into tokenized copper derivatives; a Federal Reserve rate cut signal that has been priced into equities but not into crypto assets; or a geopolitical event that has moved commodity futures but not on-chain commodity indices.
            </P>
            <H3>2.2 The Intelligence Gap</H3>
            <P>
              Existing DeFi protocols lack structured macro intelligence. Price oracles (Chainlink, Pyth) provide accurate price feeds but no interpretation layer. There is no on-chain system that can ingest a news article, reason about its macro implications, score its impact on specific assets, and autonomously construct a position to exploit the resulting dislocation.
            </P>
            <H3>2.3 The Audit Gap</H3>
            <P>
              Autonomous trading systems operating in DeFi lack accountability. When an agent makes a decision — whether to buy, sell, rebalance, or intervene — there is typically no verifiable record of the reasoning chain that led to that decision. ARGOS addresses this through cryptographic attestation of every agent decision on-chain.
            </P>
            <Table
              headers={['Dislocation Type', 'Example', 'ARGOS Response']}
              rows={[
                ['Supply Shock', 'Chilean copper mine strike', 'Oracle scores 88/100 → Architect deploys CSSI index'],
                ['Monetary Policy', 'Fed rate cut signal', 'Oracle scores 72/100 → Executor buys BTC/GOLD'],
                ['Institutional Flow', 'BlackRock ETF inflows', 'Oracle scores 79/100 → Executor increases BTC weight'],
                ['Demand Contraction', 'China PMI miss', 'Oracle scores 23/100 → Guardian blocks OIL trade'],
              ]}
            />
          </Section>

          {/* Architecture */}
          <Section id="architecture" title="System Architecture" number="3.">
            <P>
              ARGOS is structured as a five-layer pipeline, with each layer handled by a specialized agent. The pipeline is unidirectional — signals flow from macro reality through intelligence, construction, execution, and finally to the audit trail — but the Guardian operates as a cross-cutting concern that can intervene at any layer.
            </P>
            <CodeSnip>{`MACRO REALITY
    │
    ▼
[THE SCRIBE] ──── SoSoValue Terminal API
    │               Structured news ingestion
    │               Sentiment classification
    ▼
[THE ORACLE] ──── Reality Score Engine
    │               Confidence-weighted scoring (0-100)
    │               Thesis + counterpoint generation
    │               Asset impact mapping
    ▼
[THE ARCHITECT] ── SSI Index Protocol
    │               Constituent weight optimization
    │               On-chain index deployment (ArgosIndex.sol)
    │               AI-driven rebalancing
    ▼
[THE EXECUTOR] ─── SoDEX Orderbook
    │               Guardian pre-approval gate
    │               Slippage budget enforcement
    │               ArgosVault.recordTrade() on-chain
    ▼
[THE GUARDIAN] ─── Cross-cutting risk layer
    │               Circuit breakers (max drawdown, volatility)
    │               Adversarial debate engine
    │               Intervention logging
    ▼
[ARGOSAUDIT.SOL] ─ Immutable attestation registry
                    keccak256 event hashes
                    On-chain proof of reasoning`}</CodeSnip>
            <H3>3.1 Data Flow</H3>
            <P>
              The Scribe polls the SoSoValue Terminal API every 2 minutes for structured macro news. Each news item is classified by sentiment (Bullish/Bearish/Neutral), category (Macro/Crypto/Commodity/Equity), and affected assets. The Scribe routes processed items to the Oracle queue.
            </P>
            <P>
              The Oracle processes each queued item with a 2–4 second reasoning window, generating a Reality Score (0–100), confidence percentage, investment thesis, and structured counterpoints. Scores above 70 trigger Architect consideration; scores below 30 trigger Guardian review of existing positions.
            </P>
            <H3>3.2 State Management</H3>
            <P>
              All price state is managed through a singleton GBM (Geometric Brownian Motion) price engine anchored to real market data. BTC and ETH prices are anchored to CoinGecko (60-second polling). Commodity prices (GOLD, OIL, COPPER, SPX) are anchored to AlphaVantage (5-minute polling, respecting free tier limits of 5 calls/minute).
            </P>
          </Section>

          {/* Agents */}
          <Section id="agents" title="The Agent Swarm" number="4.">
            <H3>4.1 The Scribe — News Ingestion & Structuring</H3>
            <P>
              The Scribe is responsible for ingesting, parsing, and structuring macro news from the SoSoValue Terminal. It operates on a 2-minute polling cycle and maintains a deduplication cache to prevent reprocessing. Each ingested item is enriched with sentiment classification and asset impact mapping before being routed to the Oracle.
            </P>
            <Callout color="#bf5af2" label="Scribe Data Contract">
              Input: Raw SoSoValue news item (title, content, release_time, matched_currencies) → Output: Structured NewsItem with sentiment, category, affectedAssets, and processed flag.
            </Callout>

            <H3>4.2 The Oracle — Reality Score Generation</H3>
            <P>
              The Oracle is the core intelligence layer of ARGOS. It receives structured news items from the Scribe and generates Reality Scores using a neuro-symbolic reasoning approach that combines sentiment analysis, asset correlation modeling, and macro regime detection.
            </P>
            <P>
              The Reality Score (0–100) represents the Oracle's confidence that a macro signal will translate into a measurable on-chain price dislocation. A score of 100 indicates near-certain dislocation; a score of 0 indicates the signal has already been fully priced in or is irrelevant to on-chain assets.
            </P>
            <Table
              headers={['Score Range', 'Interpretation', 'Agent Action']}
              rows={[
                ['80–100', 'High-conviction dislocation', 'Architect deploys/rebalances index'],
                ['60–79', 'Moderate dislocation', 'Executor considers position'],
                ['40–59', 'Ambiguous signal', 'Monitor, no action'],
                ['20–39', 'Weak/priced-in signal', 'Guardian reviews existing positions'],
                ['0–19', 'No dislocation', 'No action'],
              ]}
            />

            <H3>4.3 The Architect — Index Construction & Rebalancing</H3>
            <P>
              The Architect constructs SSI-compatible indices from Oracle signals. When a high-conviction dislocation is detected, the Architect selects constituent assets, computes optimal weights using a modified mean-variance optimization constrained to sum to 10,000 basis points, and deploys the index on-chain via the ArgosIndex contract.
            </P>
            <P>
              Rebalancing is triggered by one of three mechanisms: AI-driven (Oracle score change exceeds threshold), time-based (weekly), or threshold-based (constituent weight drifts more than 5% from target).
            </P>

            <H3>4.4 The Executor — Trade Execution via SoDEX</H3>
            <P>
              The Executor manages trade execution through the SoDEX orderbook interface. All trades require Guardian pre-approval before submission. The Executor supports four order types: Market, Limit, TWAP (Time-Weighted Average Price), and Iceberg. Slippage budgets are enforced per-trade, and partial fills are handled gracefully.
            </P>
            <P>
              Each executed trade is recorded on-chain via ArgosVault.recordTrade(), creating an immutable record with the trade parameters, execution price, slippage, and a keccak256 audit hash that is simultaneously attested to ArgosAudit.
            </P>

            <H3>4.5 The Guardian — Risk Management & Circuit Breakers</H3>
            <P>
              The Guardian is a cross-cutting risk agent that operates at every layer of the pipeline. It maintains four primary circuit breakers: maximum daily loss (default 3%), maximum position size (default 20% of AUM), volatility halt (default 25% 24h volatility), and autonomous execution threshold (default $5,000 per trade).
            </P>
            <P>
              The Guardian also operates an adversarial debate engine: for each Oracle thesis, the Guardian generates a structured counterpoint and adjusts the effective confidence score. If the Guardian's counterpoint reduces confidence below the execution threshold, the trade is blocked and the intervention is logged to the Audit Trail.
            </P>
          </Section>

          {/* Reality Score */}
          <Section id="reality-score" title="Reality Score Methodology" number="5.">
            <H3>5.1 Score Computation</H3>
            <P>
              The Reality Score is computed as a weighted combination of four sub-scores: Sentiment Score (S), Asset Correlation Score (C), Macro Regime Score (R), and Novelty Score (N). The final score is bounded to [0, 100].
            </P>
            <CodeSnip>{`RealityScore = clamp(
  w_s * SentimentScore(news)
  + w_c * CorrelationScore(news, assets)
  + w_r * RegimeScore(macro_context)
  + w_n * NoveltyScore(news, history),
  0, 100
)

Default weights:
  w_s = 0.35  (sentiment)
  w_c = 0.30  (asset correlation)
  w_r = 0.20  (macro regime)
  w_n = 0.15  (novelty)`}</CodeSnip>
            <H3>5.2 Confidence Calibration</H3>
            <P>
              The confidence percentage represents the Oracle's epistemic certainty about the score, not the score itself. A score of 88 with 91% confidence is a stronger signal than a score of 88 with 45% confidence. Confidence is calibrated using historical accuracy of similar signals and the quality of the source data.
            </P>
            <H3>5.3 Counterpoint Generation</H3>
            <P>
              For every thesis, the Oracle generates 2–3 structured counterpoints representing the strongest arguments against the signal. These counterpoints are surfaced in the Intelligence Feed and used by the Guardian's adversarial debate engine to stress-test the thesis before execution.
            </P>
          </Section>

          {/* Index Protocol */}
          <Section id="index-protocol" title="SSI Index Protocol" number="6.">
            <H3>6.1 Index Construction</H3>
            <P>
              ARGOS indices are ERC-20 tokens deployed via the ArgosIndex contract. Each index has a name, symbol, investment thesis, constituent assets with weights in basis points (summing to 10,000), and a rebalancing logic type (AI, threshold, or time-based).
            </P>
            <CodeSnip>{`// ArgosIndex constructor
constructor(
  string _name,          // "Copper Supply Shock Index"
  string _symbol,        // "CSSI"
  string _thesis,        // Investment thesis
  string[] _symbols,     // ["COPPER", "GOLD", "OIL"]
  uint16[] _weightsBps,  // [6000, 2500, 1500] = 100%
  uint256 _initialSupply,// 1000 * 10^18
  address _auditContract // ArgosAudit address
)`}</CodeSnip>
            <H3>6.2 Rebalancing</H3>
            <P>
              When the Architect triggers a rebalance, the new constituent weights are computed and submitted to the ArgosIndex contract via the rebalance() function. The rebalance event is attested to ArgosAudit with the old and new weight vectors, creating a verifiable history of index composition changes.
            </P>
            <H3>6.3 Index Valuation</H3>
            <P>
              Index value is computed as the weighted sum of constituent asset prices, normalized to the initial supply. The price engine provides real-time constituent prices anchored to live market data, ensuring index valuations reflect current market conditions.
            </P>
          </Section>

          {/* Execution */}
          <Section id="execution" title="Execution & SoDEX Integration" number="7.">
            <H3>7.1 Order Types</H3>
            <Table
              headers={['Order Type', 'Description', 'Use Case']}
              rows={[
                ['Market', 'Immediate execution at best available price', 'High-conviction, time-sensitive signals'],
                ['Limit', 'Execute only at specified price or better', 'Precise entry/exit with price discipline'],
                ['TWAP', 'Split order over time to minimize market impact', 'Large positions in illiquid markets'],
                ['Iceberg', 'Show only partial order size to market', 'Large positions without revealing intent'],
              ]}
            />
            <H3>7.2 Slippage Management</H3>
            <P>
              Each trade has a slippage budget enforced by the Executor. The budget is computed as a function of order size, market depth (from the SoDEX orderbook), and current volatility. Trades that would exceed the slippage budget are either split into smaller tranches (TWAP) or rejected by the Guardian.
            </P>
            <H3>7.3 On-Chain Recording</H3>
            <P>
              Every executed trade is recorded on-chain via ArgosVault.recordTrade(TradeInput). The TradeInput struct contains the pair, side, amount, intended price, execution price, slippage in basis points, and status. A keccak256 hash of these parameters is computed and simultaneously attested to ArgosAudit.
            </P>
          </Section>

          {/* Risk */}
          <Section id="risk" title="Guardian Risk Framework" number="8.">
            <H3>8.1 Circuit Breakers</H3>
            <Table
              headers={['Breaker', 'Default', 'Trigger', 'Action']}
              rows={[
                ['Max Daily Loss', '3%', 'Portfolio loss exceeds threshold', 'Block all new trades for 24h'],
                ['Max Position Size', '20%', 'Single position exceeds % of AUM', 'Reject oversized orders'],
                ['Volatility Halt', '25%', '24h asset volatility exceeds threshold', 'Halt autonomous execution'],
                ['Autonomous Threshold', '$5,000', 'Trade size exceeds limit', 'Require manual approval'],
              ]}
            />
            <H3>8.2 Adversarial Debate Engine</H3>
            <P>
              The Guardian's adversarial debate engine is inspired by red-team methodologies used in institutional risk management. For each Oracle thesis, the Guardian constructs the strongest possible counterargument, considering: USD strength effects on commodity prices, correlated asset dampening, liquidity conditions, and circuit breaker status.
            </P>
            <P>
              The debate outcome is expressed as a confidence adjustment (positive or negative basis points). If the adjusted confidence falls below the execution threshold, the trade is blocked. The full debate — thesis, counterpoint, and verdict — is logged to the Audit Trail.
            </P>
            <H3>8.3 Portfolio Risk Metrics</H3>
            <P>
              The Guardian continuously monitors four portfolio-level risk metrics: Sharpe Ratio (risk-adjusted return), Maximum Drawdown (largest peak-to-trough decline), Volatility (annualized), and Concentration Risk (Herfindahl-Hirschman Index of position weights). Alerts are triggered when any metric breaches its configured threshold.
            </P>
          </Section>

          {/* Contracts */}
          <Section id="contracts" title="Smart Contract Architecture" number="9.">
            <H3>9.1 ArgosAudit.sol</H3>
            <P>
              The attestation registry. Stores keccak256 event hashes with event type, summary, and timestamp. Immutable once written. Provides a verifiable on-chain record of every ARGOS agent decision.
            </P>
            <CodeSnip>{`// Deployed: 0x1C6d6d7222d9e16BF2B0DbCc3cD6aE4DF5CA1Eaa (Sepolia)
function attest(
  bytes32 eventHash,
  string calldata eventType,
  string calldata summary
) external returns (uint256 attestationId)`}</CodeSnip>

            <H3>9.2 ArgosIndex.sol</H3>
            <P>
              ERC-20 index token with on-chain constituent weights. Supports rebalancing by the Architect agent. Each rebalance is attested to ArgosAudit. Deployed once per index.
            </P>
            <CodeSnip>{`// Deployed: 0x7471915D3f58Fac8F5f769A8f4cD63Af35753c68 (Sepolia, CSSI)
function rebalance(
  string[] calldata newSymbols,
  uint16[] calldata newWeightsBps
) external onlyOwner`}</CodeSnip>

            <H3>9.3 ArgosVault.sol</H3>
            <P>
              Execution vault with Guardian circuit breakers. Accepts ETH deposits, records trade intents on-chain, and integrates with ArgosAudit for attestations. The Guardian can halt the vault via setHalt(). Designed to be extended with Uniswap V3 swap execution.
            </P>
            <CodeSnip>{`// Deployed: 0xf32Cdb427e1Cf99A72BBE4Cf024798cb6FD06936 (Sepolia)
function recordTrade(TradeInput calldata input)
  external onlyExecutorOrOwner notHalted
  returns (uint256 id)

// Guardian circuit breaker
function setHalt(bool _halted, string calldata reason)
  external onlyGuardianOrOwner`}</CodeSnip>

            <H3>9.4 Security Considerations</H3>
            <P>
              All contracts use role-based access control (owner, guardian, executor). The vault implements a daily loss accumulator with automatic reset. The audit contract is append-only — attestations cannot be modified or deleted. All contracts are deployed with Solidity 0.8.20 with overflow protection enabled by default.
            </P>
          </Section>

          {/* Data */}
          <Section id="data" title="Data Sources & Oracles" number="10.">
            <Table
              headers={['Data Source', 'Assets', 'Cadence', 'Integration']}
              rows={[
                ['SoSoValue Terminal', 'Macro news, SSI indices', '2 min', 'REST API (x-soso-api-key)'],
                ['CoinGecko', 'BTC, ETH', '60 sec', 'Public API (no key required)'],
                ['AlphaVantage', 'GOLD, OIL, COPPER, SPX', '5 min', 'REST API (VITE_ALPHA_VANTAGE_KEY)'],
                ['GBM Price Engine', 'All assets', 'Real-time', 'Internal simulation (anchored to above)'],
                ['Sepolia RPC', 'On-chain state', 'On-demand', 'wagmi / viem'],
              ]}
            />
            <H3>10.1 Price Engine</H3>
            <P>
              The GBM (Geometric Brownian Motion) price engine provides real-time price simulation for all tracked assets. It is anchored to live market data from CoinGecko and AlphaVantage, ensuring that simulated prices remain within realistic bounds of actual market prices. The engine uses a single source of truth pattern — all pages and components subscribe to the same price engine instance.
            </P>
            <H3>10.2 SoSoValue Integration</H3>
            <P>
              ARGOS integrates with the SoSoValue Terminal API for structured macro news ingestion and SSI index data. The integration uses the x-soso-api-key authentication header. When the API key is configured, the Intelligence Feed and Indices pages display live data with a LIVE badge; when not configured, they fall back to realistic mock data.
            </P>
          </Section>

          {/* Roadmap */}
          <Section id="roadmap" title="Roadmap" number="11.">
            <Table
              headers={['Phase', 'Milestone', 'Status']}
              rows={[
                ['Phase 1', 'Core agent swarm (Scribe, Oracle, Architect, Executor, Guardian)', '✓ Complete'],
                ['Phase 1', 'Seven-page terminal UI with institutional design', '✓ Complete'],
                ['Phase 1', 'Smart contracts deployed on Sepolia (Audit, Index, Vault)', '✓ Complete'],
                ['Phase 1', 'SoSoValue Terminal API integration', '✓ Complete'],
                ['Phase 2', 'Uniswap V3 swap execution in ArgosVault', 'Planned'],
                ['Phase 2', 'SIWE authentication with persistent sessions', 'Planned'],
                ['Phase 2', 'Multi-network support (Arbitrum, Base)', 'Planned'],
                ['Phase 2', 'Real-time WebSocket price feeds', 'Planned'],
                ['Phase 3', 'Mainnet deployment with production API keys', 'Future'],
                ['Phase 3', 'DAO governance for circuit breaker parameters', 'Future'],
                ['Phase 3', 'Cross-chain index deployment', 'Future'],
              ]}
            />
          </Section>

          {/* Conclusion */}
          <Section id="conclusion" title="Conclusion" number="12.">
            <P>
              ARGOS demonstrates that the gap between macro reality and on-chain asset pricing is not just a theoretical inefficiency — it is a systematic, exploitable dislocation that can be quantified, scored, and acted upon by an autonomous agent swarm.
            </P>
            <P>
              By combining structured intelligence (SoSoValue Terminal), adversarial risk management (The Guardian), on-chain index construction (SSI Protocol), and cryptographic audit trails (ArgosAudit), ARGOS creates a closed-loop system that is simultaneously more intelligent, more accountable, and more autonomous than any existing DeFi protocol.
            </P>
            <P>
              The system is designed to be production-ready from day one: real smart contracts on Sepolia, live data feeds from CoinGecko and AlphaVantage, and a direct integration with the SoSoValue Terminal API. The path to mainnet is a matter of configuration, not architecture.
            </P>
            <Callout color="#30d158" label="Built for SoSoValue Buildathon 2025">
              ARGOS is submitted as a demonstration of what becomes possible when structured macro intelligence (SoSoValue Terminal) is combined with autonomous on-chain execution. We believe this represents a new category of DeFi application: the Reality Arbitrage Engine.
            </Callout>

            <div className="mt-12 pt-8" style={{ borderTop: '1px solid #1e1e2e' }}>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#6b7280' }}>References & Links</p>
              <div className="space-y-2">
                {[
                  { label: 'SoSoValue Terminal API', url: 'https://sosovalue.gitbook.io/soso-value-api-doc' },
                  { label: 'ArgosAudit on Sepolia Etherscan', url: 'https://sepolia.etherscan.io/address/0x1C6d6d7222d9e16BF2B0DbCc3cD6aE4DF5CA1Eaa' },
                  { label: 'ArgosIndex (CSSI) on Sepolia Etherscan', url: 'https://sepolia.etherscan.io/address/0x7471915D3f58Fac8F5f769A8f4cD63Af35753c68' },
                  { label: 'ArgosVault on Sepolia Etherscan', url: 'https://sepolia.etherscan.io/address/0xf32Cdb427e1Cf99A72BBE4Cf024798cb6FD06936' },
                  { label: 'Uniswap V3 Sepolia Router', url: 'https://docs.uniswap.org/contracts/v3/reference/deployments' },
                ].map(ref => (
                  <a
                    key={ref.label}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs transition-colors"
                    style={{ color: '#6b7280', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00f0ff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {ref.label}
                  </a>
                ))}
              </div>
            </div>
          </Section>
        </main>
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 text-center" style={{ borderTop: '1px solid #1e1e2e', background: '#0a0a10' }}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/assets/argos.png" alt="ARGOS" className="w-5 h-5 object-contain" />
          <span className="font-mono text-xs font-bold" style={{ color: '#00f0ff' }}>ARGOS</span>
          <span className="font-mono text-xs" style={{ color: '#6b7280' }}>Reality Arbitrage Engine</span>
        </div>
        <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>
          Whitepaper v1.0 · SoSoValue Buildathon 2025 · MIT License
        </p>
      </footer>
    </div>
  );
}