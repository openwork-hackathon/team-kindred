#!/bin/bash
# 🛡️ Vercel Environment Variables Setup Script
# Patrick Collins | 2026-02-05

set -e

cd "$(dirname "$0")/.."

echo "🛡️ Setting up Vercel environment variables..."
echo ""

# Load from .env.local
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  exit 1
fi

source .env.local

echo "📝 Setting DATABASE_URL..."
echo "postgresql://postgres:IBUILDKINDRED49@db.pmfefhiboklhrhxhgsex.supabase.co:5432/postgres?sslmode=require" | \
  vercel env add DATABASE_URL production --force

echo "📝 Setting NEXT_PUBLIC_PRIVY_APP_ID..."
echo "$NEXT_PUBLIC_PRIVY_APP_ID" | \
  vercel env add NEXT_PUBLIC_PRIVY_APP_ID production --force

echo "📝 Setting GOOGLE_GENERATIVE_AI_API_KEY..."
echo "$GOOGLE_GENERATIVE_AI_API_KEY" | \
  vercel env add GOOGLE_GENERATIVE_AI_API_KEY production --force

echo ""
echo "✅ Environment variables set!"
echo ""
echo "🚀 Now redeploy:"
echo "   vercel --prod"
echo ""
