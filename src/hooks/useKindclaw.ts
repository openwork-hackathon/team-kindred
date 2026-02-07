/**
 * $KINDCLAW Token Hooks
 * ERC-20 token for staking in reviews and voting
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { parseEther, type Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

const KINDCLAW = CONTRACTS.baseSepolia.kindclaw

/**
 * Hook for checking KINDCLAW balance
 */
export function useKindclawBalance(address: Address | undefined) {
  return useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

/**
 * Hook for checking KINDCLAW allowance
 */
export function useKindclawAllowance(
  owner: Address | undefined,
  spender: Address
) {
  return useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner,
      refetchInterval: 3000, // Refresh every 3s
    },
  })
}

/**
 * Hook for approving KINDCLAW spending
 */
export function useApproveKindclaw() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (spender: Address, amount: bigint) => {
    writeContract({
      address: KINDCLAW.address,
      abi: KINDCLAW.abi,
      functionName: 'approve',
      args: [spender, amount],
      chainId: baseSepolia.id,
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for minting KINDCLAW (faucet)
 */
export function useMintKindclaw() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const mint = async (to: Address, amount: bigint) => {
    writeContract({
      address: KINDCLAW.address,
      abi: KINDCLAW.abi,
      functionName: 'mint',
      args: [to, amount],
      chainId: baseSepolia.id,
    })
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for KINDCLAW metadata
 */
export function useKindclawMetadata() {
  const name = useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'name',
  })

  const symbol = useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'symbol',
  })

  const decimals = useReadContract({
    address: KINDCLAW.address,
    abi: KINDCLAW.abi,
    functionName: 'decimals',
  })

  return {
    name: name.data as string | undefined,
    symbol: symbol.data as string | undefined,
    decimals: decimals.data as number | undefined,
  }
}
