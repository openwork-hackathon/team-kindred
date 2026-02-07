/**
 * Circle Programmable Wallets Integration
 * User-Controlled Wallets for email/social login
 */

import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

let sdkInstance: W3SSdk | null = null

/**
 * Initialize Circle SDK (singleton)
 */
export function getCircleSDK(): W3SSdk {
  if (sdkInstance) return sdkInstance

  const appId = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY
  if (!appId) {
    throw new Error('Missing NEXT_PUBLIC_CIRCLE_CLIENT_KEY')
  }

  sdkInstance = new W3SSdk({
    appId,
  })

  return sdkInstance
}

/**
 * Circle Wallet User Interface
 */
export interface CircleWallet {
  id: string
  address: string
  blockchain: string
  state: string
  createDate: string
  updateDate: string
}

/**
 * Circle authentication result
 */
export interface CircleAuthResult {
  userToken: string
  encryptionKey: string
  challengeId: string
}
