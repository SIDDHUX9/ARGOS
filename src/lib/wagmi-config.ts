import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, arbitrum } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, arbitrum],
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'ARGOS Reality Arbitrage Engine' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrum.id]: http(),
  },
});