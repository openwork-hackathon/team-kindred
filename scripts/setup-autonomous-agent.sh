#!/bin/bash
# Setup script for Kindred Autonomous Agent (Builder Quest)

set -e

echo "🚀 Setting up Kindred Autonomous Agent..."

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required but not installed"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm required but not installed"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm add viem tsx

# Create .env.agent if not exists
if [ ! -f .env.agent ]; then
  echo "📝 Creating .env.agent template..."
  cat > .env.agent << 'EOF'
# Autonomous Agent Configuration

# Agent wallet private key (DO NOT COMMIT!)
AGENT_PRIVATE_KEY=0x...

# Base Sepolia RPC
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Twitter credentials (optional)
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# Agent configuration
AGENT_NAME="Kindred Autonomous Agent"
AGENT_TWITTER="@Kindred_rone"
REVIEWS_PER_DAY=3
VOTES_PER_DAY=5
POSTS_PER_DAY=2
EOF
  echo "✅ Created .env.agent - Please fill in your credentials!"
  echo "⚠️  You need to add AGENT_PRIVATE_KEY"
else
  echo "✅ .env.agent already exists"
fi

# Create agent wallet (if needed)
echo ""
echo "🔑 To create a new agent wallet, run:"
echo "   cast wallet new"
echo ""
echo "Then add the private key to .env.agent"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add AGENT_PRIVATE_KEY to .env.agent"
echo "2. Fund the agent wallet with BASE_SEPOLIA ETH and KIND tokens"
echo "3. Run: pnpm tsx scripts/autonomous-agent.ts"
echo "4. Set up cron: crontab -e"
echo "   0 */8 * * * cd /path/to/team-kindred && pnpm tsx scripts/autonomous-agent.ts"
