# PostHog Quick Start - 5 Minutes

## Option 1: Run Without PostHog (Local-Only Mode)

**Just run the app - it works immediately:**

```bash
bun run dev
```

✅ **All features work**
✅ **All child data stays local**
❌ No cloud analytics
❌ No remote feature flags

---

## Option 2: Enable PostHog Analytics (Recommended)

### Step 1: Create PostHog Account (2 minutes)

1. Go to **[posthog.com](https://posthog.com/)**
2. Click **"Get started - free"**
3. Create account (email + password)
4. Create a project named **"MathCamp"**

### Step 2: Get API Key (30 seconds)

1. In PostHog dashboard, click **Settings** (gear icon)
2. Click **Project** → **Project API Key**
3. Copy the key (starts with `phc_`)
4. Note the host: `https://us.i.posthog.com` (or `.eu.i` for EU)

### Step 3: Configure App (1 minute)

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and paste your credentials:

```env
VITE_POSTHOG_API_KEY=phc_paste_your_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

### Step 4: Run App (30 seconds)

```bash
bun run dev
```

Open browser to `http://localhost:3000`

### Step 5: Verify Events (1 minute)

1. Go back to **PostHog dashboard**
2. Click **Events** → **Live**
3. Click around in MathCamp
4. Watch events appear in real-time! 🎉

---

## What You'll See in PostHog

### Events Tracked
- `app_started` - When app launches
- `session_started` - When kid starts learning
- `activity_selected` - Which activity chosen
- `session_completed` - When session finishes

### Properties (Anonymous!)
- Activity type (addition, subtraction, etc.)
- Question count (5, 10, 20)
- Duration bucket (0-5min, 5-10min, etc.)
- App version
- Platform (web)

### What You WON'T See (Privacy!)
- ❌ Child's name
- ❌ Individual answers
- ❌ Correctness scores
- ❌ Time per problem
- ❌ Any personal data

---

## Using Feature Flags (Optional)

### Create a Flag in PostHog

1. PostHog dashboard → **Feature Flags**
2. Click **New feature flag**
3. Name: `multiplication-activity`
4. Rollout: **100%** (or less for gradual rollout)
5. Click **Save**

### Use in Code

```typescript
import { useFeatureFlag } from '@/hooks/useAnalytics'

function Menu() {
  const showMultiplication = useFeatureFlag('multiplication-activity')

  return (
    <div>
      {showMultiplication && (
        <button>Multiplication ✖️</button>
      )}
    </div>
  )
}
```

### Test It

1. Refresh MathCamp
2. Flag should be enabled!
3. Toggle in PostHog dashboard
4. Refresh app to see changes

---

## Troubleshooting

### "No events showing in PostHog"

**Check:**
1. Is `.env` file created? (`ls -la .env`)
2. Is API key correct? (Check for typos)
3. Did you restart dev server after adding `.env`?
4. Check browser console for errors

### "Feature flag not working"

**Check:**
1. Is flag created in PostHog dashboard?
2. Is rollout > 0%?
3. Wait 1 minute after creating flag (caching)
4. Check local fallback in `FeatureFlagService.ts`

### "App won't start"

**Fix:**
1. Remove `.env` file temporarily
2. App should work in local-only mode
3. Check `.env.example` for correct format

---

## Next Steps

### Learn More
- **Setup Guide**: `docs/POSTHOG_SETUP.md`
- **Architecture**: `POSTHOG_STRATEGY.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`

### Build Features
1. Track custom events
2. Create more feature flags
3. Build parent dashboard
4. Add A/B tests

### Analyze Data
1. PostHog dashboard → **Insights**
2. Create custom charts
3. Track MAU/DAU
4. Measure retention

---

## Quick Reference

### Environment Variables
```env
VITE_POSTHOG_API_KEY=phc_your_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

### Use Analytics in Code
```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

const analytics = useAnalytics()
analytics.trackActivitySelected('addition', 10)
```

### Use Feature Flags
```typescript
import { useFeatureFlag } from '@/hooks/useAnalytics'

const enabled = useFeatureFlag('my-feature')
```

### View Local Data
```typescript
const analytics = useAnalytics()
const data = analytics.exportParentDashboard()
console.log(data)
```

---

**That's it! You're tracking anonymous usage while keeping kids' data private. 🎉**

Questions? Check `docs/POSTHOG_SETUP.md` or `POSTHOG_STRATEGY.md`.
