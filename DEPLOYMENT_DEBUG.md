# 🛡️ Vercel Deployment Debug Guide

## ⚠️ "Application error: a client-side exception"

### 🔍 Step 1: Get Browser Console Error

1. Visit your Vercel URL
2. Open browser console:
   - **Mac:** `Cmd + Option + J`
   - **Windows:** `F12`
3. Refresh page
4. Copy the **red error message** (usually first one)

### 📊 Step 2: Check Vercel Function Logs

1. Go to https://vercel.com/dashboard
2. Click your `team-kindred` project
3. Click **Deployments** tab
4. Click latest deployment (● Ready)
5. Click **View Function Logs** button
6. Look for errors (red lines)

### 🧪 Step 3: Test API Endpoints

Open these URLs in browser:

```
https://your-app.vercel.app/api/health
https://your-app.vercel.app/api/projects
https://your-app.vercel.app/api/leaderboard
```

**Expected:** JSON responses
**If error:** Check database connection

### 🔑 Step 4: Verify Environment Variables

```bash
cd /Users/jhinresh/clawd/team-kindred
vercel env ls
```

**Should see:**
- ✅ DATABASE_URL
- ✅ NEXT_PUBLIC_PRIVY_APP_ID  
- ✅ GOOGLE_GENERATIVE_AI_API_KEY

**If missing:** Re-add with `vercel env add`

### 🐛 Common Errors & Fixes

#### Error: "localStorage is not defined"

**Cause:** Component using browser APIs on server

**Fix:** Wrap with dynamic import:

```typescript
import dynamic from 'next/dynamic'

const MyComponent = dynamic(() => import('./MyComponent'), {
  ssr: false
})
```

#### Error: "Hydration failed"

**Cause:** Server HTML doesn't match client HTML

**Fix:** Use `useIsMounted()` or `'use client'` + `useEffect`

```typescript
import { useIsMounted } from '@/components/ClientOnly'

export function MyComponent() {
  const isMounted = useIsMounted()
  
  if (!isMounted) return null // or loading skeleton
  
  return <div>...</div>
}
```

#### Error: "prisma client is not generated"

**Cause:** Vercel didn't run `prisma generate`

**Fix:** Check `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Then redeploy.

#### Error: "Cannot connect to database"

**Cause:** Wrong DATABASE_URL or database not accessible

**Fix:** 

1. Check DATABASE_URL format:
   ```
   postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
   ```

2. Test connection locally:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

3. Check Supabase project is not paused

### 🧰 Emergency Fixes

#### Force Clean Build

```bash
cd /Users/jhinresh/clawd/team-kindred
rm -rf .next node_modules
npm install
vercel --prod
```

#### Rollback to Working Deployment

1. Vercel Dashboard → Deployments
2. Find last working deployment (● Ready, no errors)
3. Click `...` → **Promote to Production**

#### Check Build Logs

```bash
cd /Users/jhinresh/clawd/team-kindred
vercel logs <deployment-url>
```

Look for:
- ❌ Build errors
- ❌ Runtime errors  
- ❌ Database connection failures

---

## 📝 Report Template

When asking for help, provide:

```
**Error Message:**
[Paste from browser console]

**Deployment URL:**
https://team-kindred-xxx.vercel.app

**Function Logs:**
[Paste from Vercel dashboard]

**Environment Variables:**
[List which are set - don't paste values!]

**What I tried:**
- [ ] Checked browser console
- [ ] Checked Vercel function logs
- [ ] Tested API endpoints
- [ ] Verified environment variables
```

---

**Patrick Collins 🛡️**
