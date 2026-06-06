# ARGOS — AI-Powered Execution Intelligence Platform

> **Autonomous agent swarm + on-chain execution vault for cross-asset alpha discovery.**

ARGOS is a full-stack AI trading intelligence platform. It runs a swarm of specialised AI agents that ingest macro and crypto news, score market dislocations using a proprietary **Reality Score**, compose weighted asset indices, and record every decision immutably on the Ethereum blockchain through a suite of Solidity smart contracts.

---

## ✦ What It Does

```
Market News ──► Oracle (AI) ──► Reality Score ──► Trade Intent ──► ArgosVault (Solidity) ──► Audit Trail
       ↑                                                    ↓
  SoSoValue API                                 Guardian Circuit Breaker
```

1. **Intelligence** — Ingests live financial news (SoSoValue API or mock), runs each headline through a neuro-symbolic Oracle to produce a 0-100 *Reality Score* indicating how much the on-chain price diverges from fundamental reality.
2. **Indices** — Lets you compose custom ERC-20 index tokens from any basket of crypto + commodity assets with configurable AI, threshold, or time-based rebalancing logic.
3. **Execution** — An AI Executor agent proposes trades; a Guardian agent validates or blocks them before any on-chain action.
4. **Audit Trail** — Every ARGOS event (news processed, score generated, trade executed, guardian intervention) is hashed and attested to on-chain via `ArgosAudit.sol`.
5. **Risk** — Real-time portfolio risk metrics, drawdown limits, and the Guardian's daily-loss circuit breaker.
6. **Deploy** — A step-by-step interactive guide to deploy all three smart contracts on Sepolia testnet directly from Remix IDE — no Hardhat or Node.js required.

---

## 🖥 Pages

| Route | Description |
|---|---|
| `/` | Landing page — product overview and feature highlights |
| `/auth` | Email OTP authentication (Convex Auth) |
| `/dashboard` | Live portfolio value, 24h P&L, agent swarm status, active opportunities table |
| `/intelligence` | Oracle news feed, Reality Score history charts, live SoSoValue data |
| `/indices` | Index composer and management, live SSI data when API key is set |
| `/execution` | Trade execution log, agent reasoning, Guardian approval flow |
| `/audit` | Immutable on-chain audit trail with Etherscan deep links |
| `/risk` | Risk metrics, drawdown analysis, circuit breaker controls |
| `/deploy` | Interactive 7-step smart contract deployment guide |

---

## 🏗 Architecture

```
argos/
├── src/
│   ├── pages/              # Full-page React components (one per route)
│   ├── components/
│   │   ├── argos/          # AppLayout, WalletButton, WalletConnect
│   │   └── ui/             # Shadcn/Radix primitive components
│   ├── lib/
│   │   ├── argos-mock.ts   # Mock agents, assets, news, audit data
│   │   ├── argos-types.ts  # Shared TypeScript types
│   │   ├── price-engine.ts # Simulated live price feed (WebSocket-like)
│   │   └── sosovalue-api.ts# SoSoValue live market data integration
│   └── hooks/              # Custom React hooks
├── contracts/              # Solidity smart contracts (deploy via Remix)
│   ├── ArgosAudit.sol      # Immutable on-chain event attestation registry
│   ├── ArgosIndex.sol      # ERC-20 index token with constituent weights
│   └── ArgosVault.sol      # Execution vault with Guardian circuit breaker
└── convex/                 # Convex backend (auth, DB, server actions)
```

---

## ⛓ Smart Contracts

All contracts target **Solidity 0.8.20** and are deployed on **Ethereum Sepolia** testnet.

### `ArgosAudit.sol`
Immutable event registry. Any ARGOS module can call `attest(bytes32 hash, string eventType, string summary)` to permanently record an action on-chain. Deploy this **first** — both other contracts depend on it.

### `ArgosIndex.sol`
ERC-20 token representing a weighted asset basket. Constructor takes the index name, symbol, thesis, constituent symbols, weights in basis points (must sum to 10 000), initial supply, and the ArgosAudit address. Deploy **once per index** you create in the app.

```
_name:          "Copper Supply Shock Index"
_symbol:        "CSSI"
_thesis:        "Long copper and related commodities during supply disruptions"
_symbols:       ["COPPER", "GOLD", "OIL"]
_weightsBps:    [6000, 2500, 1500]   // 60% + 25% + 15% = 100%
_initialSupply: 1000000000000000000000
_auditContract: 0x<ArgosAudit address>
```

### `ArgosVault.sol`
Execution vault with three roles: **Owner**, **Guardian** (can halt all trading via circuit breaker), and **Executor** (can submit trade records). Key features:
- `deposit()` / `withdraw()` — fund the vault with ETH
- `recordTrade(pair, side, amount, price, execPrice, slippageBps, status)` — records a Guardian-approved trade and attests to ArgosAudit
- `setHalt(bool, reason)` — Guardian emergency stop
- `setMaxDailyLoss(uint256)` — daily loss limit in wei
- Daily loss accumulator resets automatically each UTC day

> **Note:** The `recordTrade` function was refactored to avoid the Solidity "stack too deep" compiler error. Local variable scoping and pre-built string variables keep stack depth within the 16-slot EVM limit.

**Deployed addresses (Sepolia)**

| Contract | Address |
|---|---|
| ArgosAudit | `0x1C6d6d7222d9e16BF2B0DbCc3cD6aE4DF5CA1Eaa` |
| ArgosVault | *(deploy via `/deploy` guide)* |
| ArgosIndex (CSSI) | `0x7471915D3f58Fac8F5f769A8f4cD63Af35753c68` |

---

## 🤖 Agent Swarm

ARGOS runs five concurrent AI agents, each with a distinct role:

| Agent | Status Cycle | Responsibility |
|---|---|---|
| **Oracle** | Scanning → Reasoning | Processes news, generates Reality Scores |
| **Executor** | Reasoning → Executing | Proposes and submits trade intents |
| **Guardian** | Monitoring → Alert | Validates trades, triggers circuit breakers |
| **Indexer** | Idle → Scanning | Monitors index constituent weights and triggers rebalances |
| **Risk** | Monitoring | Tracks drawdown, exposure, and daily loss limits |

Agent status is polled every 4 seconds with live sparkline activity charts on the Dashboard.

---

## 🔌 Integrations

### SoSoValue API (Market Data)
Set `VITE_SOSOVALUE_API_KEY` to enable live market intelligence:
- Real-time news feed with sentiment detection
- Live index snapshots and constituent weights
- News refreshes every 2 minutes automatically

### Wallet / Web3 (wagmi + RainbowKit)
Connect any EVM wallet. Once contracts are deployed and address env vars are set, the app reads on-chain state via `useReadContract` and submits trades via `useWriteContract`.

### Convex (Backend & Auth)
All user sessions, persisted agent state, and server-side actions run on Convex. Authentication uses Email OTP via `@convex-dev/auth`.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) `>= 1.2`
- A [Convex](https://convex.dev) account (free tier works)

### Installation

```bash
# 1. Clone and install
git clone https://github.com/SIDDHUX9/ARGOS.git
cd ARGOS
bun install

# 2. Start Convex backend (keep this running in a separate terminal)
bun convex dev

# 3. Start the frontend dev server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Environment Variables

Create `.env.local`:

```env
# Convex (required)
CONVEX_DEPLOYMENT=your-deployment-slug
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# SoSoValue market data (optional — enables live news & indices)
VITE_SOSOVALUE_API_KEY=your-key

# Smart contract addresses after Sepolia deployment (optional)
VITE_ARGOS_AUDIT_ADDRESS=0x...
VITE_ARGOS_VAULT_ADDRESS=0x...
VITE_ARGOS_INDEX_CSSI=0x...
VITE_CHAIN_ID=11155111
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, TypeScript 5.9 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4, Shadcn UI, Radix UI primitives |
| **Animation** | Framer Motion, tw-animate-css |
| **3D / WebGL** | Three.js, @react-three/fiber, @react-three/drei |
| **Charts** | Recharts |
| **Web3** | wagmi v2, viem v2, RainbowKit v2 |
| **Backend** | Convex (functions, database, real-time subscriptions) |
| **Auth** | @convex-dev/auth (Email OTP) |
| **Smart Contracts** | Solidity 0.8.20, deployed on Ethereum Sepolia |
| **Package Manager** | Bun 1.2 |

---

## 🛠 Available Scripts

```bash
bun run dev          # Start Vite dev server
bun convex dev       # Start Convex backend (run in parallel)
bun run build        # Production build (tsc + vite build)
bun run type-check   # TypeScript type checking only
bun run lint         # ESLint
bun run format       # Prettier
bun run preview      # Preview production build locally
bun run test         # Run tests
bun run test:watch   # Tests in watch mode
```

---

## 📋 Smart Contract Deployment

The app has a built-in interactive deployment guide at `/deploy`. It walks you through:

1. Installing MetaMask and getting Sepolia ETH from a faucet
2. Downloading all 3 `.sol` contract files
3. Deploying `ArgosAudit.sol` (no constructor args)
4. Deploying `ArgosIndex.sol` (one per index, with basket constructor args)
5. Deploying `ArgosVault.sol` (guardian, executor, audit contract addresses)
6. Wiring the deployed addresses back to the frontend via env vars
7. Verifying contracts on Sepolia Etherscan (optional but recommended)

No Hardhat, no Node.js — everything runs in [Remix IDE](https://remix.ethereum.org) in your browser.

---

## 📁 Project Conventions

See [VLY.md](./VLY.md) for detailed development conventions, component patterns, and backend integration guidelines.

---

## License

MIT
