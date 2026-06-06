import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';

const WALLET_OPTIONS = [
  { id: 'metamask' as const, name: 'MetaMask', icon: '🦊', desc: 'Browser extension wallet' },
  { id: 'walletconnect' as const, name: 'WalletConnect', icon: '🔗', desc: 'Scan with mobile wallet' },
  { id: 'coinbase' as const, name: 'Coinbase Wallet', icon: '🔵', desc: 'Coinbase smart wallet' },
];

export function WalletButton() {
  const { address, network, isConnecting, isConnected, connect, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

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
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors text-sm font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-foreground">{truncated}</span>
          <span className="text-muted-foreground text-xs hidden sm:block">{network}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1 w-52 glass-panel rounded-lg z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-border/50">
                  <p className="text-xs text-muted-foreground">Connected Wallet</p>
                  <p className="text-sm font-mono text-foreground mt-0.5">{truncated}</p>
                  <p className="text-xs text-primary mt-0.5">{network}</p>
                </div>
                <div className="p-1">
                  <button onClick={copyAddress} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/50 rounded transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy Address
                  </button>
                  <button onClick={() => { window.open(`https://etherscan.io/address/${address}`, '_blank'); setShowDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent/50 rounded transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> View on Explorer
                  </button>
                  <button onClick={() => { disconnect(); setShowDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-crimson hover:bg-crimson/10 rounded transition-colors" style={{ color: '#e53e3e' }}>
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
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
      <Button
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        className="gap-2 font-mono text-sm"
        style={{ background: '#00d4ff', color: '#0b0f19' }}
      >
        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-panel border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-foreground">Connect Wallet</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Select a wallet to connect to ARGOS</p>
          <div className="space-y-2">
            {WALLET_OPTIONS.map(wallet => (
              <button
                key={wallet.id}
                onClick={async () => { setShowModal(false); await connect(wallet.id); }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all text-left"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground">{wallet.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Demo mode — no real transactions
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
