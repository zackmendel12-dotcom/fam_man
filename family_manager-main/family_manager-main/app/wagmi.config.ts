import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask({
      dappMetadata: { name: 'BaseFam - Smart Family Wallet' },
    }),
    coinbaseWallet({
      appName: 'BaseFam - Smart Family Wallet',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
  },
  ssr: true,
});
