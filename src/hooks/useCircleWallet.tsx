'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCircleSDK } from '@/lib/circle'
import type { CircleWallet } from '@/lib/circle'

export function useCircleWallet() {
  const [wallet, setWallet] = useState<CircleWallet | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK on mount
  useEffect(() => {
    try {
      getCircleSDK()
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  /**
   * Connect wallet (email login)
   */
  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sdk = getCircleSDK()
      
      // Execute login flow
      await sdk.execute('LOGIN', {
        deviceToken: '', // Will be handled by SDK
        deviceEncryptionKey: '', // Will be handled by SDK
      })

      // Get user's wallets
      const response = await sdk.getWalletTokens()
      
      if (response && response.length > 0) {
        const firstWallet = response[0]
        setWallet(firstWallet)
        setAddress(firstWallet.address)
        setIsConnected(true)
      } else {
        throw new Error('No wallets found')
      }
    } catch (err: any) {
      console.error('[CircleWallet] Connect failed:', err)
      setError(err.message || 'Failed to connect')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      const sdk = getCircleSDK()
      await sdk.execute('LOGOUT')
      
      setWallet(null)
      setAddress(null)
      setIsConnected(false)
    } catch (err: any) {
      console.error('[CircleWallet] Disconnect failed:', err)
      setError(err.message || 'Failed to disconnect')
    }
  }, [])

  /**
   * Sign message
   */
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!wallet) {
      setError('No wallet connected')
      return null
    }

    try {
      const sdk = getCircleSDK()
      const result = await sdk.execute('SIGN_MESSAGE', {
        message,
      })
      
      return result.signature || null
    } catch (err: any) {
      console.error('[CircleWallet] Sign message failed:', err)
      setError(err.message || 'Failed to sign message')
      return null
    }
  }, [wallet])

  /**
   * Send transaction
   */
  const sendTransaction = useCallback(async (params: {
    to: string
    value?: string
    data?: string
  }): Promise<string | null> => {
    if (!wallet) {
      setError('No wallet connected')
      return null
    }

    try {
      const sdk = getCircleSDK()
      const result = await sdk.execute('SEND_TRANSACTION', {
        to: params.to,
        value: params.value || '0',
        data: params.data || '0x',
      })
      
      return result.txHash || null
    } catch (err: any) {
      console.error('[CircleWallet] Send transaction failed:', err)
      setError(err.message || 'Failed to send transaction')
      return null
    }
  }, [wallet])

  return {
    wallet,
    address,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
  }
}
