import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { AppLayout } from '@/components/argos/AppLayout';
import { MOCK_TRADES, MOCK_ASSETS, generateOrderbook, formatTimestamp } from '@/lib/argos-mock';
import type { Trade } from '@/lib/argos-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { sepolia } from 'wagmi/chains';

const PAIRS = ['BTC/USDC', 'ETH/USDC', 'COPPER/USDC', 'GOLD/USDC', 'OIL/USDC', 'SPX/USDC'];
const PAIR_PRICES: Record<string, number> = {
  'BTC/USDC': 67180,
  'ETH/USDC': 3612,
  'COPPER/USDC': 4.82,
  'GOLD/USDC': 2290,
  'OIL/USDC': 81.2,
  'SPX/USDC': 5231,
};

// ArgosVault ABI — only the functions we call
const VAULT_ABI = [
  {
    name: 'recordTrade',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'input',
        type: 'tuple',
        components: [
          { name: 'pair',        type: 'string'  },
          { name: 'side',        type: 'string'  },
          { name: 'amount',      type: 'uint256' },
          { name: 'price',       type: 'uint256' },
          { name: 'execPrice',   type: 'uint256' },
          { name: 'slippageBps', type: 'int256'  },
          { name: 'status',      type: 'string'  },
        ],
      },
    ],
    outputs: [{ name: 'id', type: 'uint256' }],
  },
] as const;

const VAULT_ADDRESS = import.meta.env.VITE_ARGOS_VAULT_ADDRESS as `0x${string}` | undefined;

export default function Execution() {
  const { isConnected } = useAccount();
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [pair, setPair] = useState('BTC/USDC');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'TWAP' | 'Iceberg'>('Market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [executing, setExecuting] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<Trade | null>(null);
  const [autoEnabled, setAutoEnabled] = useState<Record<string, boolean>>({ 'Copper Supply Shock Index': true });
  const [orderbook, setOrderbook] = useState(generateOrderbook(PAIR_PRICES[pair]));

  const { writeContract, data: txHash, isPending: isTxPending } = useWriteContract();
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash, chainId: sepolia.id });

  useEffect(() => {
    const midPrice = PAIR_PRICES[pair] || 100;
    setOrderbook(generateOrderbook(midPrice));
    const interval = setInterval(() => {
      setOrderbook(generateOrderbook(midPrice * (1 + (Math.random() - 0.5) * 0.001)));
    }, 2000);
    return () => clearInterval(interval);
  }, [pair]);

  // When on-chain tx confirms, finalize the trade
  useEffect(() => {
    if (isTxConfirmed && txHash && pendingTrade) {
      const confirmedTrade: Trade = {
        ...pendingTrade,
        hash: txHash,
        status: 'Filled',
      };
      setTrades(prev => [confirmedTrade, ...prev]);
      setPendingTrade(null);
      setExecuting(false);
      toast.success('Trade confirmed on-chain', {
        description: (
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline"
          >
            View on Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        ) as unknown as string,
      });
    }
  }, [isTxConfirmed, txHash, pendingTrade]);

  const handleExecute = async () => {
    if (!amount) { toast.error('Enter an amount'); return; }
    setExecuting(true);

    const midPrice = PAIR_PRICES[pair] || 100;
    const slippage = (Math.random() - 0.3) * 0.5;
    const execPrice = midPrice * (1 + slippage / 100);
    const slippageBps = Math.round(slippage * 100);
    const status = Math.random() > 0.2 ? 'Filled' : 'Partial';

    const newTrade: Trade = {
      id: `t${Date.now()}`,
      hash: txHash ?? `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      pair,
      side,
      amount: parseFloat(amount),
      price: orderType === 'Market' ? midPrice : parseFloat(price) || midPrice,
      executionPrice: parseFloat(execPrice.toFixed(2)),
      slippage: parseFloat(slippage.toFixed(3)),
      status,
      timestamp: new Date(),
      triggeredBy: 'Manual',
    };

    // Try on-chain recording if vault address is configured
    if (VAULT_ADDRESS && isConnected) {
      try {
        toast.info('Recording trade on-chain...', { description: `${side} ${amount} ${pair}` });
        setPendingTrade(newTrade);
        writeContract({
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: 'recordTrade',
          chainId: sepolia.id,
          args: [{
            pair,
            side,
            amount: BigInt(Math.round(parseFloat(amount) * 1e8)),
            price: BigInt(Math.round(midPrice * 1e8)),
            execPrice: BigInt(Math.round(execPrice * 1e8)),
            slippageBps: BigInt(slippageBps),
            status,
          }],
        });
        // Don't add to local state yet — wait for confirmation
        setAmount('');
        return;
      } catch (err) {
        console.warn('On-chain recording failed, falling back to local:', err);
        setPendingTrade(null);
      }
    }

    // Fallback: local simulation
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));
    setTrades(prev => [newTrade, ...prev]);
    setExecuting(false);
    setAmount('');
    toast.success(`Order ${status}`, { description: `${side} ${amount} ${pair} @ ${execPrice.toFixed(2)}` });
  };

  const midPrice = PAIR_PRICES[pair] || 100;
  const isOnChain = !!VAULT_ADDRESS;

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-mono font-bold text-xl text-foreground">Execution Terminal</h1>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">SoDEX orderbook interface and trade management</p>
          </div>
          {isOnChain && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded" style={{ border: '1px solid rgba(48,209,88,0.3)', background: 'rgba(48,209,88,0.06)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#30d158' }} />
              <span className="font-mono text-xs" style={{ color: '#30d158' }}>ON-CHAIN</span>
              <a
                href={`https://sepolia.etherscan.io/address/${VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] flex items-center gap-1"
                style={{ color: 'rgba(48,209,88,0.6)' }}
              >
                <ExternalLink className="w-3 h-3" />
                {VAULT_ADDRESS?.slice(0, 6)}...{VAULT_ADDRESS?.slice(-4)}
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Order Entry */}
          <div className="rounded-lg border border-border/50 p-4 space-y-4" style={{ background: '#0f1420' }}>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Order Entry</p>

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1.5 block">PAIR</label>
              <Select value={pair} onValueChange={setPair}>
                <SelectTrigger className="font-mono bg-accent/20 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {PAIRS.map(p => <SelectItem key={p} value={p} className="font-mono">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['Buy', 'Sell'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className="py-2 rounded font-mono text-sm font-bold transition-all"
                  style={side === s
                    ? { background: s === 'Buy' ? 'rgba(16,185,129,0.2)' : 'rgba(229,62,62,0.2)', color: s === 'Buy' ? '#10b981' : '#e53e3e', border: `1px solid ${s === 'Buy' ? 'rgba(16,185,129,0.4)' : 'rgba(229,62,62,0.4)'}` }
                    : { background: 'transparent', color: '#5a6480', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {(['Market', 'Limit', 'TWAP', 'Iceberg'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className="py-1.5 rounded font-mono text-xs transition-all"
                  style={orderType === t
                    ? { background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }
                    : { background: 'transparent', color: '#5a6480', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground mb-1.5 block">AMOUNT</label>
              <Input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                className="font-mono bg-accent/20 border-border/50"
              />
            </div>

            {orderType !== 'Market' && (
              <div>
                <label className="text-xs font-mono text-muted-foreground mb-1.5 block">PRICE</label>
                <Input
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder={midPrice.toString()}
                  type="number"
                  className="font-mono bg-accent/20 border-border/50"
                />
              </div>
            )}

            <div className="p-3 rounded border border-border/30" style={{ background: '#141926' }}>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Mid Price</span>
                <span className="text-foreground">${midPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-mono mt-1">
                <span className="text-muted-foreground">Est. Slippage</span>
                <span style={{ color: '#f59e0b' }}>~0.1-0.3%</span>
              </div>
              {isOnChain && (
                <div className="flex justify-between text-xs font-mono mt-1">
                  <span className="text-muted-foreground">Recording</span>
                  <span style={{ color: '#30d158' }}>On-chain ✓</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleExecute}
              disabled={executing || isTxPending || !amount}
              className="w-full font-mono font-bold"
              style={{ background: side === 'Buy' ? '#10b981' : '#e53e3e', color: 'white' }}
            >
              {(executing || isTxPending) ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {isTxPending ? 'Confirm in wallet...' : 'Executing...'}</> : `${side} ${pair}`}
            </Button>
          </div>

          {/* Orderbook */}
          <div className="rounded-lg border border-border/50 p-4" style={{ background: '#0f1420' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Orderbook</p>
              <span className="font-mono text-xs font-bold text-foreground">{pair}</span>
            </div>

            <div className="space-y-0.5 mb-2">
              <div className="grid grid-cols-3 text-xs font-mono text-muted-foreground pb-1 border-b border-border/30">
                <span>Price</span>
                <span className="text-center">Size</span>
                <span className="text-right">Total</span>
              </div>
              {orderbook.asks.slice(0, 8).reverse().map((ask, i) => (
                <div key={i} className="grid grid-cols-3 text-xs font-mono relative">
                  <div className="absolute inset-0 opacity-10 rounded" style={{ background: '#e53e3e', width: `${Math.min(ask.total / orderbook.asks[orderbook.asks.length - 1].total * 100, 100)}%` }} />
                  <span style={{ color: '#e53e3e' }}>{ask.price.toLocaleString()}</span>
                  <span className="text-center text-muted-foreground">{ask.size.toFixed(4)}</span>
                  <span className="text-right text-muted-foreground">{ask.total.toFixed(4)}</span>
                </div>
              ))}
            </div>

            <div className="py-2 text-center border-y border-border/30 mb-2">
              <span className="font-mono font-bold text-sm text-foreground">${midPrice.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-2 font-mono">Mid</span>
            </div>

            <div className="space-y-0.5">
              {orderbook.bids.slice(0, 8).map((bid, i) => (
                <div key={i} className="grid grid-cols-3 text-xs font-mono relative">
                  <div className="absolute inset-0 opacity-10 rounded" style={{ background: '#10b981', width: `${Math.min(bid.total / orderbook.bids[orderbook.bids.length - 1].total * 100, 100)}%` }} />
                  <span style={{ color: '#10b981' }}>{bid.price.toLocaleString()}</span>
                  <span className="text-center text-muted-foreground">{bid.size.toFixed(4)}</span>
                  <span className="text-right text-muted-foreground">{bid.total.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Control */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border/50 p-4" style={{ background: '#0f1420' }}>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Autonomous Execution</p>
              <div className="space-y-3">
                {['Copper Supply Shock Index', 'Macro Hedge Alpha'].map(idx => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded border border-border/30" style={{ background: '#141926' }}>
                    <div>
                      <p className="text-xs font-mono text-foreground">{idx}</p>
                      <p className="text-xs text-muted-foreground">Auto-execute below $5,000</p>
                    </div>
                    <button
                      onClick={() => setAutoEnabled(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className="relative w-10 h-5 rounded-full transition-all flex-shrink-0"
                      style={{ background: autoEnabled[idx] ? '#00d4ff' : 'rgba(255,255,255,0.1)' }}
                    >
                      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: autoEnabled[idx] ? '22px' : '2px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* On-chain contract info */}
            {isOnChain && (
              <div className="rounded-lg border border-border/50 p-4" style={{ background: '#0f1420' }}>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Contract Info</p>
                <div className="space-y-2">
                  {[
                    { label: 'ArgosVault', addr: import.meta.env.VITE_ARGOS_VAULT_ADDRESS },
                    { label: 'ArgosAudit', addr: import.meta.env.VITE_ARGOS_AUDIT_ADDRESS },
                  ].map(({ label, addr }) => addr && (
                    <div key={label} className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">{label}</span>
                      <a
                        href={`https://sepolia.etherscan.io/address/${addr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs flex items-center gap-1"
                        style={{ color: '#00d4ff' }}
                      >
                        {(addr as string).slice(0, 6)}...{(addr as string).slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trade History */}
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Execution History</p>
          <div className="rounded-lg border border-border/50 overflow-hidden" style={{ background: '#0f1420' }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  {['Hash', 'Pair', 'Side', 'Amount', 'Exec Price', 'Slippage', 'Status', 'Time'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-mono text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade, i) => (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, backgroundColor: 'rgba(0,212,255,0.1)' }}
                    animate={{ opacity: 1, backgroundColor: 'transparent' }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/20 hover:bg-accent/20 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">
                      {trade.hash.startsWith('0x') && trade.hash.length > 20 ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${trade.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                          style={{ color: '#00d4ff' }}
                        >
                          {trade.hash.slice(0, 8)}...{trade.hash.slice(-6)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        trade.hash
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-foreground">{trade.pair}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono font-bold" style={{ color: trade.side === 'Buy' ? '#10b981' : '#e53e3e' }}>
                        {trade.side === 'Buy' ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                        {trade.side}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-foreground">{trade.amount}</td>
                    <td className="px-3 py-2.5 font-mono text-foreground">${trade.executionPrice.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: trade.slippage >= 0 ? '#f59e0b' : '#10b981' }}>
                      {trade.slippage >= 0 ? '+' : ''}{trade.slippage.toFixed(3)}%
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{
                        background: trade.status === 'Filled' ? 'rgba(16,185,129,0.15)' : trade.status === 'Partial' ? 'rgba(245,158,11,0.15)' : 'rgba(90,100,128,0.15)',
                        color: trade.status === 'Filled' ? '#10b981' : trade.status === 'Partial' ? '#f59e0b' : '#5a6480',
                      }}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatTimestamp(trade.timestamp)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}