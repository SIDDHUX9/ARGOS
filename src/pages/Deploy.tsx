import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, Copy, AlertTriangle, Zap, Shield, FileText } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const copy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
      style={{ border: '1px solid #1e1e2e', color: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#00f0ff'; (e.currentTarget as HTMLElement).style.borderColor = '#00f0ff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; }}
    >
      <Copy className="w-3 h-3" /> Copy
    </button>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ border: '1px solid #1e1e2e', background: '#050507', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
      {label && (
        <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', overflowX: 'auto', margin: 0, lineHeight: 1.7 }}>
        {code}
      </pre>
    </div>
  );
}

// ─── Info box ─────────────────────────────────────────────────────────────────
function InfoBox({ type, children }: { type: 'info' | 'warn' | 'success'; children: React.ReactNode }) {
  const colors = {
    info:    { bg: 'rgba(0,240,255,0.06)',  border: 'rgba(0,240,255,0.2)',  text: '#00f0ff' },
    warn:    { bg: 'rgba(255,159,10,0.06)', border: 'rgba(255,159,10,0.2)', text: '#ff9f0a' },
    success: { bg: 'rgba(48,209,88,0.06)',  border: 'rgba(48,209,88,0.2)',  text: '#30d158' },
  }[type];
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, padding: '10px 14px', marginTop: 12 }}>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: colors.text, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

// ─── Contract card ────────────────────────────────────────────────────────────
function ContractCard({ icon: Icon, name, file, color, desc }: { icon: React.ElementType; name: string; file: string; color: string; desc: string }) {
  return (
    <a
      href={`/${file}`}
      download={file.split('/').pop()}
      style={{ display: 'block', border: `1px solid ${color}30`, background: `${color}08`, borderRadius: 6, padding: '14px 16px', textDecoration: 'none', transition: 'border-color 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}60`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}30`; }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#e8e8ed' }}>{name}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7280', marginLeft: 'auto' }}>↓ download</span>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{desc}</p>
      <p style={{ fontFamily: 'monospace', fontSize: 10, color: color, marginTop: 6 }}>{file.split('/').pop()}</p>
    </a>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 'prereqs',
    title: 'Prerequisites',
    description: 'Get MetaMask, Sepolia ETH, and open Remix IDE',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          You need three things before deploying: a wallet with Sepolia testnet ETH, the Remix browser IDE, and the contract files downloaded below.
        </p>

        <div className="space-y-3">
          {[
            { n: '1', title: 'Install MetaMask', desc: 'Download from metamask.io and create or import a wallet.', link: 'https://metamask.io', linkLabel: 'metamask.io' },
            { n: '2', title: 'Add Sepolia Testnet', desc: 'In MetaMask → Settings → Networks → Add Network → Sepolia. Or use Chainlist.', link: 'https://chainlist.org/?search=sepolia&testnets=true', linkLabel: 'chainlist.org' },
            { n: '3', title: 'Get free Sepolia ETH', desc: 'Use the Alchemy or Infura faucet. You need ~0.05 ETH for all 3 contracts.', link: 'https://sepoliafaucet.com', linkLabel: 'sepoliafaucet.com' },
            { n: '4', title: 'Open Remix IDE', desc: 'Remix is a browser-based Solidity IDE — no installation needed.', link: 'https://remix.ethereum.org', linkLabel: 'remix.ethereum.org' },
          ].map(item => (
            <div key={item.n} style={{ display: 'flex', gap: 12, padding: '10px 14px', border: '1px solid #1e1e2e', background: '#0a0a10', borderRadius: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#00f0ff', fontWeight: 700, minWidth: 20 }}>{item.n}.</span>
              <div>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', fontWeight: 600, marginBottom: 2 }}>{item.title}</p>
                <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', fontSize: 11, color: '#00f0ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <ExternalLink className="w-3 h-3" /> {item.linkLabel}
                </a>
              </div>
            </div>
          ))}
        </div>

        <InfoBox type="info">
          All deployments use Sepolia testnet — no real money required. You can migrate to mainnet or Arbitrum later by changing the network in MetaMask.
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'download',
    title: 'Download the Contracts',
    description: 'Three Solidity files — ArgosAudit, ArgosIndex, ArgosVault',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          Download all three contracts. Deploy them in this order: <strong style={{ color: '#e8e8ed' }}>ArgosAudit first</strong>, then ArgosIndex, then ArgosVault (both need the Audit address).
        </p>
        <div className="space-y-3">
          <ContractCard icon={FileText} name="ArgosAudit" file="contracts/ArgosAudit.sol" color="#00f0ff"
            desc="Immutable attestation registry. Records every ARGOS event as a keccak256 hash on-chain. Deploy this first." />
          <ContractCard icon={Zap} name="ArgosIndex" file="contracts/ArgosIndex.sol" color="#bf5af2"
            desc="ERC-20 index token with on-chain constituent weights. Deploy once per index you create in the Indices page." />
          <ContractCard icon={Shield} name="ArgosVault" file="contracts/ArgosVault.sol" color="#30d158"
            desc="Execution vault with Guardian circuit breakers. Records trades on-chain and optionally attests to ArgosAudit." />
        </div>
        <InfoBox type="warn">
          ArgosIndex is deployed once per index. If you create 3 indices in the app, you deploy ArgosIndex 3 times with different constructor arguments.
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'audit',
    title: 'Deploy ArgosAudit.sol',
    description: 'The attestation registry — deploy this first',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          ArgosAudit has no constructor arguments. It's the simplest contract to deploy.
        </p>

        <div className="space-y-3">
          {[
            'In Remix, click the folder icon → "Create new file" → name it ArgosAudit.sol',
            'Paste the full contents of the downloaded ArgosAudit.sol file',
            'Click the Solidity compiler tab (second icon) → set compiler to 0.8.20 → click "Compile ArgosAudit.sol"',
            'Click the Deploy tab (third icon) → set Environment to "Injected Provider - MetaMask"',
            'Make sure MetaMask is on Sepolia testnet',
            'Under "Contract" select ArgosAudit → click orange "Deploy" button',
            'Confirm the transaction in MetaMask',
            'Copy the deployed contract address from "Deployed Contracts" section',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', borderLeft: '2px solid #1e1e2e' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#00f0ff', minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <InfoBox type="success">
          Save the ArgosAudit contract address — you'll need it for ArgosVault and to wire the frontend.
        </InfoBox>

        <CodeBlock label="Verify on Sepolia Etherscan" code={`https://sepolia.etherscan.io/address/YOUR_ARGOS_AUDIT_ADDRESS`} />
      </div>
    ),
  },
  {
    id: 'index',
    title: 'Deploy ArgosIndex.sol',
    description: 'ERC-20 index token — one deployment per index',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          ArgosIndex takes constructor arguments. Here's an example for the "Copper Supply Shock Index" from the app.
        </p>

        <CodeBlock label="Constructor arguments — Copper Supply Shock Index" code={`_name:          "Copper Supply Shock Index"
_symbol:        "CSSI"
_thesis:        "Long copper and related commodities during supply disruptions"
_symbols:       ["COPPER","GOLD","OIL"]
_weightsBps:    [6000, 2500, 1500]   // must sum to 10000 (= 60% + 25% + 15%)
_initialSupply: 1000000000000000000000  // 1000 tokens (18 decimals)
_auditContract: 0xYOUR_ARGOS_AUDIT_ADDRESS  // from previous step`} />

        <CodeBlock label="Constructor arguments — Macro Hedge Alpha" code={`_name:          "Macro Hedge Alpha"
_symbol:        "MHA"
_thesis:        "Diversified hedge against macro uncertainty"
_symbols:       ["BTC","GOLD","ETH"]
_weightsBps:    [4000, 3500, 2500]   // 40% + 35% + 25% = 10000
_initialSupply: 1000000000000000000000
_auditContract: 0xYOUR_ARGOS_AUDIT_ADDRESS`} />

        <div className="space-y-3 mt-4">
          {[
            'Create ArgosIndex.sol in Remix and paste the contract code',
            'Compile with Solidity 0.8.20',
            'In Deploy tab, expand the Deploy section to see constructor fields',
            'Fill in the fields exactly as shown above (use the array syntax for _symbols and _weightsBps)',
            'Click Deploy and confirm in MetaMask',
            'Copy the deployed index token address',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', borderLeft: '2px solid #1e1e2e' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#bf5af2', minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <InfoBox type="info">
          Weights are in basis points (bps). 10000 bps = 100%. So 60% = 6000, 25% = 2500, 15% = 1500. They must always sum to exactly 10000.
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'vault',
    title: 'Deploy ArgosVault.sol',
    description: 'Execution vault with Guardian circuit breakers',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          ArgosVault takes 3 constructor arguments: guardian address, executor address, and the ArgosAudit address.
          For testing, use your own wallet address for all three.
        </p>

        <CodeBlock label="Constructor arguments" code={`_guardian:      0xYOUR_WALLET_ADDRESS   // can block trades
_executor:      0xYOUR_WALLET_ADDRESS   // can record trades
_auditContract: 0xYOUR_ARGOS_AUDIT_ADDRESS`} />

        <div className="space-y-3 mt-4">
          {[
            'Create ArgosVault.sol in Remix and paste the contract code',
            'Compile with Solidity 0.8.20',
            'Fill in the 3 constructor fields (use your wallet address for guardian and executor)',
            'Click Deploy and confirm in MetaMask',
            'Copy the deployed vault address',
            'Optional: send a small amount of Sepolia ETH to the vault via the deposit() function',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', borderLeft: '2px solid #1e1e2e' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#30d158', minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <InfoBox type="warn">
          The vault's recordTrade() now takes a single TradeInput struct (to avoid stack-too-deep). It records trade metadata on-chain but doesn't execute real swaps. To add real Uniswap V3 swaps, wire the ISwapRouter interface (address: 0xE592427A0AEce92De3Edee1F18E0157C05861564 on Sepolia).
        </InfoBox>

        <CodeBlock label="Updated recordTrade signature (struct input)" code={`// Call recordTrade with a struct — avoids stack-too-deep
ArgosVault.recordTrade({
  pair:        "BTC/USDC",
  side:        "Buy",
  amount:      500000000000000000,  // 0.5 ETH in wei
  price:       6718000000000,       // price * 1e8
  execPrice:   6718000000000,
  slippageBps: 3,                   // 0.03% slippage
  status:      "Filled"
})`} />

        <InfoBox type="success">
          This contract was updated to fix a "stack too deep" compiler error. The fix wraps all 7 trade parameters into a TradeInput struct, reducing stack depth. Make sure you use the latest ArgosVault.sol from the download page.
        </InfoBox>
      </div>
    ),
  },
  {
    id: 'wire',
    title: 'Wire Addresses to the Frontend',
    description: 'Add contract addresses to the app so pages go live',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          After deploying, add the contract addresses to the frontend environment. Go to <strong style={{ color: '#e8e8ed' }}>API Keys → Frontend</strong> in the vly dashboard and add these variables:
        </p>

        <CodeBlock label="Frontend environment variables (API Keys → Frontend tab)" code={`VITE_ARGOS_AUDIT_ADDRESS=0x...      # ArgosAudit deployed address
VITE_ARGOS_VAULT_ADDRESS=0x...      # ArgosVault deployed address
VITE_ARGOS_INDEX_CSSI=0x...         # Copper Supply Shock Index token
VITE_ARGOS_INDEX_MHA=0x...          # Macro Hedge Alpha token
VITE_CHAIN_ID=11155111              # Sepolia chain ID`} />

        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7, marginTop: 12 }}>
          Once set, the Audit Trail page will link to real Sepolia Etherscan transactions, the Indices page will show real on-chain token balances, and the Execution page will record trades on-chain via ArgosVault.
        </p>

        <InfoBox type="success">
          The frontend already uses wagmi for wallet connection. Adding these env vars is all that's needed to activate on-chain reads via useReadContract and writes via useWriteContract.
        </InfoBox>

        <CodeBlock label="Verify all 3 contracts on Sepolia Etherscan" code={`ArgosAudit:  https://sepolia.etherscan.io/address/VITE_ARGOS_AUDIT_ADDRESS
ArgosVault:  https://sepolia.etherscan.io/address/VITE_ARGOS_VAULT_ADDRESS
ArgosIndex:  https://sepolia.etherscan.io/address/VITE_ARGOS_INDEX_CSSI`} />
      </div>
    ),
  },
  {
    id: 'verify',
    title: 'Verify Contracts on Etherscan (Optional)',
    description: 'Make source code publicly readable on Etherscan',
    content: (
      <div className="space-y-4">
        <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', lineHeight: 1.7 }}>
          Verifying makes the contract ABI and source code public on Etherscan, which is required for the "Verify On-Chain" button in the Audit Trail to work properly.
        </p>

        <div className="space-y-3">
          {[
            'Go to sepolia.etherscan.io and search for your contract address',
            'Click "Contract" tab → "Verify and Publish"',
            'Select: Compiler Type = Solidity (Single file), Compiler Version = 0.8.20, License = MIT',
            'Paste the full contract source code',
            'Click "Verify and Publish"',
            'Repeat for all 3 contracts',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', borderLeft: '2px solid #1e1e2e' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#ff9f0a', minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
              <p style={{ fontFamily: 'monospace', fontSize: 12, color: '#e8e8ed', lineHeight: 1.5 }}>{step}</p>
            </div>
          ))}
        </div>

        <InfoBox type="info">
          Verification is optional for functionality but recommended for transparency. The ARGOS Audit Trail "Verify On-Chain" button will link to the verified contract page.
        </InfoBox>
      </div>
    ),
  },
];

// ─── Step accordion ───────────────────────────────────────────────────────────
function StepCard({ step, index, completed, active, onToggle }: {
  step: Step;
  index: number;
  completed: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ border: `1px solid ${active ? 'rgba(0,240,255,0.3)' : '#1e1e2e'}`, background: '#0a0a10', borderRadius: 6, overflow: 'hidden', transition: 'border-color 0.15s' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: active ? 'rgba(0,240,255,0.04)' : 'transparent' }}
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <div className="flex-shrink-0">
          {completed
            ? <CheckCircle2 className="w-4 h-4" style={{ color: '#30d158' }} />
            : <Circle className="w-4 h-4" style={{ color: active ? '#00f0ff' : '#1e1e2e' }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6b7280', minWidth: 24 }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: active ? '#e8e8ed' : '#9ca3af' }}>
              {step.title}
            </span>
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', marginTop: 2, paddingLeft: 32 }}>
            {step.description}
          </p>
        </div>
        {active ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: '#6b7280' }} />}
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 20px 16px', borderTop: '1px solid #1e1e2e' }}>
              <div style={{ paddingTop: 16 }}>
                {step.content}
              </div>
              <button
                onClick={() => onToggle()}
                className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
                style={{ border: '1px solid #30d158', color: '#30d158', fontFamily: 'monospace', fontSize: 11, background: 'transparent' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(48,209,88,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <CheckCircle2 className="w-3 h-3" /> Mark complete & continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Deploy() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    if (activeStep === index) {
      // Mark complete and advance
      setCompleted(prev => new Set([...prev, index]));
      setActiveStep(Math.min(index + 1, STEPS.length - 1));
    } else {
      setActiveStep(index);
    }
  };

  const progress = Math.round((completed.size / STEPS.length) * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#050507', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e2e', background: '#0a0a10', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/assets/argos.png" alt="ARGOS" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        <div>
          <p style={{ fontSize: 10, color: '#00f0ff', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 2 }}>ARGOS // Smart Contract Deployment</p>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#e8e8ed', letterSpacing: '-0.02em' }}>Deploy Guide</h1>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 4, background: '#1e1e2e', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#00f0ff', transition: 'width 0.3s', borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{progress}%</span>
          </div>
          <a href="/dashboard" style={{ fontSize: 11, color: '#6b7280', textDecoration: 'none', border: '1px solid #1e1e2e', padding: '4px 10px', borderRadius: 4 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e8e8ed'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
          >← Dashboard</a>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ border: '1px solid rgba(0,240,255,0.15)', background: 'rgba(0,240,255,0.04)', borderRadius: 6, padding: '16px 20px', marginBottom: 28 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#ff9f0a' }} />
            <div>
              <p style={{ fontSize: 12, color: '#e8e8ed', fontWeight: 600, marginBottom: 4 }}>3 contracts · Sepolia testnet · ~0.05 ETH gas · ~15 minutes</p>
              <p style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.6 }}>
                Deploy ArgosAudit → ArgosIndex (once per index) → ArgosVault. Then add the addresses to the API Keys tab to activate on-chain features in the app.
                No Hardhat or Node.js required — everything runs in the Remix browser IDE.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              completed={completed.has(i)}
              active={activeStep === i}
              onToggle={() => toggleStep(i)}
            />
          ))}
        </div>

        {/* Done state */}
        {completed.size === STEPS.length && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24, border: '1px solid rgba(48,209,88,0.3)', background: 'rgba(48,209,88,0.06)', borderRadius: 6, padding: '20px 24px', textAlign: 'center' }}
          >
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: '#30d158' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e8e8ed', marginBottom: 6 }}>All contracts deployed!</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>
              Add the contract addresses to API Keys → Frontend, then navigate to the Audit Trail to see on-chain attestations.
            </p>
            <a href="/audit" style={{ display: 'inline-block', padding: '8px 20px', border: '1px solid #30d158', color: '#30d158', fontSize: 12, textDecoration: 'none', borderRadius: 4 }}>
              → Open Audit Trail
            </a>
          </motion.div>
        )}

        <p style={{ fontSize: 10, color: '#1e1e2e', textAlign: 'center', marginTop: 32 }}>
          ARGOS Deploy Guide · Sepolia Testnet · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
