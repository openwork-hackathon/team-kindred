/**
 * Smart Contract Configuration
 * Addresses and ABIs for Kindred contracts
 */

import KindredCommentABI from './abi/KindredComment.json'
import KindTokenABI from './abi/KindToken.json'

export const CONTRACTS = {
  // Base Sepolia (testnet)
  baseSepolia: {
    kindToken: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindredCommentABI,
    },
  },
  // Base (mainnet)
  base: {
    kindToken: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindredCommentABI,
    },
  },
} as const

export type SupportedChainId = keyof typeof CONTRACTS

/**
 * Get contract config for a chain
 */
export function getContract(
  chain: SupportedChainId,
  contractName: 'kindToken' | 'kindredComment'
) {
  return CONTRACTS[chain][contractName]
}
