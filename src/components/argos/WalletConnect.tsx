import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { mainnet, sepolia, arbitrum } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const CHAINS = [
  { chain: mainnet, label: 'Ethereum' },
  { chain: sepolia, label: 'Sepolia' },
  { chain: arbitrum, label: 'Arbitrum' },
];

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentChain = CHAINS.find(c => c.chain.id === chainId);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied');
    }
    setShowDropdown(false);
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-2.5 py-1.5 font-mono text-xs transition-colors"
          style={{ border: '1px solid #1e1e2e', color: '#e8e8ed', background: '#0a0a10' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#00f0ff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#30d158' }} />
          <span className="tabular-nums">{truncate(address)}</span>
          {balance && (
            <span style={{ color: '#6b7280' }}>
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </span>
          )}
          {currentChain && (
            <span className="hidden sm:block px-1.5 py-0.5 font-mono text-[10px]" style={{ background: '#111118', border: '1px solid #1e1e2e', color: '#6b7280' }}>
              {currentChain.label}
            </span>
          )}
          <ChevronDown className="w-3 h-3" style={{ color: '#6b7280' }} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-1 w-56 z-50"
                style={{ background: '#0a0a10', border: '1px solid #1e1e2e' }}
              >
                <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e1e2e' }}>
                  <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#6b7280' }}>Connected</p>
                  <p className="font-mono text-xs" style={{ color: '#e8e8ed' }}>{truncate(address)}</p>
                  {balance && (
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: '#6b7280' }}>
                      {parseFloat(balance.formatted).toFixed(6)} {balance.symbol}
                    </p>
                  )}
                </div>
                {/* Chain switcher */}
                <div style={{ borderBottom: '1px solid #1e1e2e' }}>
                  <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color: '#6b7280' }}>Network</p>
                  {CHAINS.map(({ chain, label }) => (
                    <button
                      key={chain.id}
                      onClick={() => { switchChain({ chainId: chain.id }); setShowDropdown(false); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 font-mono text-xs transition-colors"
                      style={{ color: chainId === chain.id ? '#00f0ff' : '#6b7280' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111118'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {chainId === chain.id && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00f0ff' }} />}
                      {chainId !== chain.id && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1e1e2e' }} />}
                      {label}
                    </button>
                  ))}
                </div>
                <div className="p-1">
                  <button onClick={copyAddress} className="w-full flex items-center gap-2 px-2 py-1.5 font-mono text-xs transition-colors" style={{ color: '#6b7280' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111118'; (e.currentTarget as HTMLElement).style.color = '#e8e8ed'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                  >
                    <Copy className="w-3 h-3" /> Copy Address
                  </button>
                  <button
                    onClick={() => { window.open(`https://etherscan.io/address/${address}`, '_blank'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 font-mono text-xs transition-colors" style={{ color: '#6b7280' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111118'; (e.currentTarget as HTMLElement).style.color = '#e8e8ed'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
                  >
                    <ExternalLink className="w-3 h-3" /> View on Explorer
                  </button>
                  <button
                    onClick={() => { disconnect(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 font-mono text-xs transition-colors" style={{ color: '#ff453a' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,69,58,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <LogOut className="w-3 h-3" /> Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className="font-mono text-xs px-4 py-1.5 transition-all disabled:opacity-50"
        style={{ border: '1px solid #00f0ff', color: '#00f0ff', background: 'transparent' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        {isPending ? 'Connecting...' : '[ Connect Wallet ]'}
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/80 z-50" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80"
              style={{ background: '#0a0a10', border: '1px solid #1e1e2e' }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1e1e2e' }}>
                <span className="font-mono text-xs font-semibold" style={{ color: '#e8e8ed' }}>Connect Wallet</span>
                <button onClick={() => setShowModal(false)} className="font-mono text-xs" style={{ color: '#6b7280' }}>✕</button>
              </div>
              <div className="p-3 space-y-1">
                {connectors.map(connector => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector });
                      setShowModal(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs transition-colors text-left"
                    style={{ border: '1px solid #1e1e2e', color: '#e8e8ed', background: 'transparent' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#111118'; (e.currentTarget as HTMLElement).style.borderColor = '#00f0ff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; }}
                  >
                    <span style={{ color: '#00f0ff' }}>▸</span>
                    {connector.name}
                  </button>
                ))}
              </div>
              <div className="px-4 py-2" style={{ borderTop: '1px solid #1e1e2e' }}>
                <p className="font-mono text-[10px]" style={{ color: '#6b7280' }}>EVM-compatible wallet required</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
