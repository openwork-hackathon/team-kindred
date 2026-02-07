import { createConfig, http } from 'wagmi'
import { mainnet, polygon, base, sepolia, baseSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia, base, mainnet, polygon, sepolia],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // Enable server-side rendering support
})
