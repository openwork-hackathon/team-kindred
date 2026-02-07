/**
 * Hooks for SimpleSwap contract integration
 */

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { parseEther, parseUnits, type Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

const SWAP_CONTRACT = CONTRACTS.baseSepolia.simpleSwap

/**
 * Hook for swapping ETH to USDC
 */
export function useSwapETHForUSDC() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const swapETHForUSDC = async (ethAmount: string, minUSDCOut: string = '0') => {
    const value = parseEther(ethAmount)
    const minAmount = parseUnits(minUSDCOut, 6) // USDC has 6 decimals
    
    writeContract({
      address: SWAP_CONTRACT.address,
      abi: SWAP_CONTRACT.abi,
      functionName: 'swapETHForUSDC',
      args: [minAmount],
      value,
      chainId: baseSepolia.id,
    })
  }

  return {
    swapETHForUSDC,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for swapping USDC to ETH
 */
export function useSwapUSDCForETH() {
  const { writeContract, data: hash, isPending, isError, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const swapUSDCForETH = async (usdcAmount: string, minETHOut: string = '0') => {
    const amount = parseUnits(usdcAmount, 6)
    const minAmount = parseEther(minETHOut)
    
    writeContract({
      address: SWAP_CONTRACT.address,
      abi: SWAP_CONTRACT.abi,
      functionName: 'swapUSDCForETH',
      args: [amount, minAmount],
      chainId: baseSepolia.id,
    })
  }

  return {
    swapUSDCForETH,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  }
}

/**
 * Hook for getting swap output estimate
 */
export function useGetSwapOutput(
  user: Address | undefined,
  ethToUsdc: boolean,
  amountIn: string
) {
  const amount = ethToUsdc ? parseEther(amountIn || '0') : parseUnits(amountIn || '0', 6)
  
  return useReadContract({
    address: SWAP_CONTRACT.address,
    abi: SWAP_CONTRACT.abi,
    functionName: 'getSwapOutput',
    args: user ? [user, ethToUsdc, amount] : undefined,
    query: {
      enabled: !!user && parseFloat(amountIn || '0') > 0,
      refetchInterval: 10000, // Refetch every 10s
    },
  })
}

/**
 * Hook for checking if user can trade
 */
export function useCanTrade(user: Address | undefined) {
  return useReadContract({
    address: SWAP_CONTRACT.address,
    abi: SWAP_CONTRACT.abi,
    functionName: 'canTrade',
    args: user ? [user] : undefined,
    query: {
      enabled: !!user,
    },
  })
}

/**
 * Hook for getting contract balances
 */
export function useSwapBalances() {
  return useReadContract({
    address: SWAP_CONTRACT.address,
    abi: SWAP_CONTRACT.abi,
    functionName: 'getBalances',
  })
}
