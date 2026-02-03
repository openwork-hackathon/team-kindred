import { Router } from 'express';
import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { base } from 'viem/chains';

const router = Router();

// Contract addresses (Base Mainnet)
const CONTRACTS = {
  MCV2_Bond: '0xc5a076cad94176c2996B32d8466Be1cE757FAa27' as const,
  MCV2_Token: '0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df' as const,
  MCV2_ZapV1: '0x91523b39813F3F4E406ECe406D0bEAaA9dE251fa' as const,
  OPENWORK: '0x299c30DD5974BF4D5bFE42C340CA40462816AB07' as const,
};

// Token config (will be set after deployment)
const TOKEN_CONFIG = {
  name: 'Kindred Token',
  symbol: 'KIND',
  address: null as string | null, // Set after deployment
  mintClubUrl: 'https://mint.club/token/base/KIND',
  bondingCurve: {
    maxSupply: '1000000',
    mintRoyalty: 100, // 1%
    burnRoyalty: 100, // 1%
    steps: [
      { range: '100000', price: '0.001' },
      { range: '500000', price: '0.005' },
      { range: '1000000', price: '0.01' },
    ],
  },
};

// Minimal ABI for reading bond data
const BOND_ABI = [
  {
    inputs: [{ name: 'token', type: 'address' }],
    name: 'getDetail',
    outputs: [
      {
        components: [
          { name: 'mintRoyalty', type: 'uint16' },
          { name: 'burnRoyalty', type: 'uint16' },
          { name: 'reserveToken', type: 'address' },
          { name: 'maxSupply', type: 'uint128' },
          { name: 'reserveBalance', type: 'uint128' },
          { name: 'currentSupply', type: 'uint128' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'token', type: 'address' }, { name: 'tokensToMint', type: 'uint128' }],
    name: 'getReserveForToken',
    outputs: [{ type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Create viem client
const client = createPublicClient({
  chain: base,
  transport: http(),
});

// GET /token/info - Get token information
router.get('/info', async (req, res) => {
  try {
    const info = {
      ...TOKEN_CONFIG,
      contracts: CONTRACTS,
      chain: 'base',
      chainId: 8453,
      deployed: TOKEN_CONFIG.address !== null,
    };

    // If token is deployed, fetch on-chain data
    if (TOKEN_CONFIG.address) {
      try {
        const detail = await client.readContract({
          address: CONTRACTS.MCV2_Bond,
          abi: BOND_ABI,
          functionName: 'getDetail',
          args: [TOKEN_CONFIG.address as `0x${string}`],
        });

        info['onChain'] = {
          currentSupply: formatEther(BigInt(detail.currentSupply)),
          reserveBalance: formatEther(BigInt(detail.reserveBalance)),
          maxSupply: formatEther(BigInt(detail.maxSupply)),
        };
      } catch (e) {
        // Token not yet deployed or error reading
        console.warn('Could not fetch on-chain data:', e);
      }
    }

    res.json(info);
  } catch (error) {
    console.error('Error fetching token info:', error);
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// GET /token/price - Get current token price
router.get('/price', async (req, res) => {
  try {
    if (!TOKEN_CONFIG.address) {
      // Return estimated price from bonding curve config
      return res.json({
        deployed: false,
        estimatedPrice: TOKEN_CONFIG.bondingCurve.steps[0].price,
        currency: 'OPENWORK',
        note: 'Token not yet deployed. Showing initial price.',
      });
    }

    // Fetch actual price from bonding curve
    const priceForOne = await client.readContract({
      address: CONTRACTS.MCV2_Bond,
      abi: BOND_ABI,
      functionName: 'getReserveForToken',
      args: [TOKEN_CONFIG.address as `0x${string}`, parseEther('1')],
    });

    res.json({
      deployed: true,
      price: formatEther(priceForOne),
      currency: 'OPENWORK',
      tokenAddress: TOKEN_CONFIG.address,
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// GET /token/curve - Get bonding curve visualization data
router.get('/curve', (req, res) => {
  const { steps } = TOKEN_CONFIG.bondingCurve;
  
  // Generate data points for chart
  const dataPoints = [];
  let prevRange = 0;
  
  for (const step of steps) {
    const range = parseFloat(step.range);
    const price = parseFloat(step.price);
    
    // Add start of segment
    dataPoints.push({
      supply: prevRange,
      price: price,
    });
    
    // Add end of segment
    dataPoints.push({
      supply: range,
      price: price,
    });
    
    prevRange = range;
  }

  res.json({
    curve: dataPoints,
    config: TOKEN_CONFIG.bondingCurve,
    chartType: 'step',
  });
});

// GET /token/quote/:amount - Get quote for buying/selling
router.get('/quote/:amount', async (req, res) => {
  try {
    const amount = req.params.amount;
    const action = (req.query.action as string) || 'buy';

    if (!TOKEN_CONFIG.address) {
      // Estimate from config
      const amountNum = parseFloat(amount);
      let estimatedCost = 0;
      let remaining = amountNum;
      
      for (const step of TOKEN_CONFIG.bondingCurve.steps) {
        const stepSize = parseFloat(step.range);
        const stepPrice = parseFloat(step.price);
        const inThisStep = Math.min(remaining, stepSize);
        
        estimatedCost += inThisStep * stepPrice;
        remaining -= inThisStep;
        
        if (remaining <= 0) break;
      }
      
      // Add royalty
      const royaltyBps = action === 'buy' 
        ? TOKEN_CONFIG.bondingCurve.mintRoyalty 
        : TOKEN_CONFIG.bondingCurve.burnRoyalty;
      const royalty = estimatedCost * (royaltyBps / 10000);
      
      return res.json({
        deployed: false,
        action,
        amount,
        estimatedCost: estimatedCost.toFixed(6),
        royalty: royalty.toFixed(6),
        total: (estimatedCost + royalty).toFixed(6),
        currency: 'OPENWORK',
        note: 'Estimate only. Token not yet deployed.',
      });
    }

    // Get actual quote from contract
    const cost = await client.readContract({
      address: CONTRACTS.MCV2_Bond,
      abi: BOND_ABI,
      functionName: 'getReserveForToken',
      args: [TOKEN_CONFIG.address as `0x${string}`, parseEther(amount)],
    });

    res.json({
      deployed: true,
      action,
      amount,
      cost: formatEther(cost),
      currency: 'OPENWORK',
    });
  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({ error: 'Failed to get quote' });
  }
});

// POST /token/set-address - Set token address after deployment (admin only)
router.post('/set-address', (req, res) => {
  const { address, adminKey } = req.body;
  
  // Simple admin check (in production, use proper auth)
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  
  TOKEN_CONFIG.address = address;
  
  res.json({ 
    success: true, 
    message: 'Token address updated',
    address,
  });
});

export { router as tokenRoutes };
