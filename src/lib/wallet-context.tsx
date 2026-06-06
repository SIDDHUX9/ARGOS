import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';

interface WalletState {
  address: string | null;
  network: string | null;
  isConnecting: boolean;
  isConnected: boolean;
}

interface WalletContextType extends WalletState {
  connect: (walletType: 'metamask' | 'walletconnect' | 'coinbase') => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Simulate wallet addresses for demo
const DEMO_ADDRESSES: Record<string, string> = {
  metamask: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  walletconnect: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
  coinbase: '0x9A2F4B8C1D3E5F7A0B2C4D6E8F0A1B3C5D7E9F2A',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    network: null,
    isConnecting: false,
    isConnected: false,
  });

  const connect = useCallback(async (walletType: 'metamask' | 'walletconnect' | 'coinbase') => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const address = DEMO_ADDRESSES[walletType];
    setState({
      address,
      network: 'Ethereum Mainnet',
      isConnecting: false,
      isConnected: true,
    });
    
    toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, {
      description: 'Ethereum Mainnet',
    });
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, network: null, isConnecting: false, isConnected: false });
    toast.info('Wallet disconnected');
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
