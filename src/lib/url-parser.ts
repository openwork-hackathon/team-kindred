/**
 * Parse various URL formats to extract project identifiers
 * Supports:
 * - Twitter URLs: https://twitter.com/Uniswap
 * - Project websites: https://uniswap.org
 * - Contract addresses: 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
 * - Direct names: "Uniswap"
 */

export interface ParsedQuery {
  type: 'name' | 'twitter' | 'website' | 'address'
  value: string
  original: string
}

export function parseSearchQuery(input: string): ParsedQuery {
  const trimmed = input.trim()
  
  // 1. Ethereum/Base contract address (0x... with 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return {
      type: 'address',
      value: trimmed.toLowerCase(),
      original: trimmed,
    }
  }
  
  // 2. Twitter URL
  const twitterMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i)
  if (twitterMatch) {
    return {
      type: 'twitter',
      value: twitterMatch[1], // Extract @username
      original: trimmed,
    }
  }
  
  // 3. Website URL
  const urlMatch = trimmed.match(/^https?:\/\/([^\/]+)/i)
  if (urlMatch) {
    const domain = urlMatch[1]
    // Extract project name from domain (e.g., "uniswap" from "uniswap.org")
    const projectName = domain.split('.')[0]
    return {
      type: 'website',
      value: projectName,
      original: trimmed,
    }
  }
  
  // 4. Direct project name
  return {
    type: 'name',
    value: trimmed,
    original: trimmed,
  }
}

/**
 * Convert parsed query to search-friendly format for Ma'at
 */
export function toMaatQuery(parsed: ParsedQuery): string {
  switch (parsed.type) {
    case 'twitter':
      return parsed.value // Send @username to Ma'at
    case 'website':
      return parsed.value // Send domain name
    case 'address':
      return parsed.value // Send contract address
    case 'name':
    default:
      return parsed.value
  }
}

/**
 * Format display text for search results
 */
export function formatQueryDisplay(parsed: ParsedQuery): string {
  switch (parsed.type) {
    case 'twitter':
      return `@${parsed.value} (Twitter)`
    case 'website':
      return `${parsed.value} (Website)`
    case 'address':
      return `${parsed.value.substring(0, 6)}...${parsed.value.substring(38)} (Address)`
    case 'name':
    default:
      return parsed.value
  }
}
