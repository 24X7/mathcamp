# PostHog Integration Setup Guide

## Overview

MathCamp uses a **hybrid PostHog integration** that balances product analytics with child privacy:

- **PostHog (Remote)**: Anonymous usage metrics (MAU, DAU, feature usage)
- **Local Storage**: All child learning data (progress, scores, answers)

## Quick Start

### 1. Install Dependencies

Already installed via:
```bash
bun add posthog-js @posthog/react
```

### 2. Set Up PostHog Project

1. Go to [posthog.com](https://posthog.com/) and create an account
2. Create a new project for MathCamp
3. Copy your Project API Key (starts with `phc_`)
4. Note your PostHog host (usually `https://us.i.posthog.com` or `https://eu.i.posthog.com`)

### 3. Configure Environment Variables

Create `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your PostHog credentials:

```env
VITE_POSTHOG_API_KEY=phc_your_api_key_here
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

**Note**: If you don't set these variables, the app will run in **local-only mode** (no cloud analytics).

### 4. Run the App

```bash
bun run dev
```

The app will automatically:
- Initialize PostHog with privacy-first settings
- Start tracking anonymous usage events
- Store all child data locally

## What Gets Tracked

### ✅ PostHog (Anonymous, Aggregated)

**Application Health:**
- `app_started` - App launched
- `session_started` - New learning session began
- `error_occurred` - App error/crash

**Feature Usage:**
- `activity_selected` - Which activity chosen (addition, subtraction, etc.)
- `session_completed` - Session finished (duration bucket, total problems)

**Performance:**
- `performance_metric` - Load times, FPS

**Feature Flags:**
- `feature_flag_evaluated` - Which flags are checked

### 🔒 Local Storage (Private, Never Sent)

**Learning Progress:**
- Individual problem attempts with answers
- Correctness per problem
- Time spent per problem
- Mastery levels by topic
- Achievement unlocks
- Streak counts

## Using the Analytics Service

### In React Components

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const analytics = useAnalytics()

  useEffect(() => {
    // Track app started
    analytics.trackAppStarted()
  }, [])

  const handleButtonClick = () => {
    // Track activity selected
    analytics.trackActivitySelected('addition', 10)
  }

  return <button onClick={handleButtonClick}>Start Addition</button>
}
```

### Feature Flags

```typescript
import { useFeatureFlag } from '@/hooks/useAnalytics'

function MyComponent() {
  const showMultiplication = useFeatureFlag('multiplication-activity')

  return (
    <div>
      {showMultiplication && <MultiplicationActivity />}
    </div>
  )
}
```

## Privacy Configuration

The PostHog integration is configured with strict privacy settings:

```typescript
posthog.init(API_KEY, {
  // CRITICAL: Privacy settings for children's app
  autocapture: false,              // No automatic event capture
  capture_pageview: false,         // Manual pageview tracking only
  disable_session_recording: true, // NEVER record children
  disable_surveys: true,           // No surveys for kids

  // Sanitize accidental PII
  sanitize_properties: (properties) => {
    delete properties.name
    delete properties.email
    delete properties.childId
    delete properties.answer
    delete properties.score
    return properties
  }
})
```

## Feature Flags Setup

### Local Defaults

Feature flags are defined in `src/infrastructure/analytics/FeatureFlagService.ts`:

```typescript
export const LOCAL_FEATURE_FLAGS = {
  'multiplication-activity': false,
  'division-activity': false,
  'new-confetti-animation': true,
  'adaptive-difficulty': true,
  'sound-effects': true,
  'parent-dashboard': true,
}
```

### PostHog Dashboard

1. Log in to PostHog
2. Go to **Feature Flags**
3. Create a new flag (e.g., `multiplication-activity`)
4. Set rollout percentage (0-100%)
5. Deploy changes

The app will:
1. Check PostHog for remote flag value
2. Fall back to local default if unavailable
3. Work offline with local config

## Parent Dashboard

Parents can view their child's detailed progress using local analytics:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function ParentDashboard() {
  const analytics = useAnalytics()
  const data = analytics.exportParentDashboard()

  return (
    <div>
      <h2>Your Child's Progress</h2>
      <p>Total Sessions: {data.stats.totalSessions}</p>
      <p>Total Problems: {data.stats.totalProblems}</p>
      <p>Accuracy: {(data.stats.averageAccuracy * 100).toFixed(1)}%</p>

      <h3>Mastery Levels</h3>
      {data.stats.masteryLevels.map(mastery => (
        <div key={mastery.questionType}>
          {mastery.questionType}: {mastery.level}/100
        </div>
      ))}
    </div>
  )
}
```

## Testing Analytics

### Development Mode

When `import.meta.env.DEV` is true, PostHog runs in debug mode:

```typescript
posthog.debug() // Logs all events to console
```

### Verify Events

1. Open browser DevTools → Console
2. Look for `[PostHog]` logs
3. Events should show:
   - Event name
   - Properties (no PII!)
   - Timestamp

### Check PostHog Dashboard

1. Go to PostHog dashboard
2. Click **Events** → **Live**
3. You should see events appearing in real-time

## Troubleshooting

### No Events in PostHog

**Check:**
- Is `VITE_POSTHOG_API_KEY` set in `.env`?
- Is the API key correct?
- Is PostHog initialized? (Check console for init message)
- Are events being sent? (Check browser DevTools → Network)

### Feature Flags Not Working

**Check:**
- Are flags created in PostHog dashboard?
- Is flag name spelled correctly?
- Is PostHog initialized before checking flag?
- Check local fallback in `LOCAL_FEATURE_FLAGS`

### App Runs Without PostHog

**This is normal!** The app works in local-only mode if:
- `VITE_POSTHOG_API_KEY` is not set
- PostHog initialization fails
- Offline/no internet connection

All child data stays local regardless.

## Privacy Compliance

### COPPA (Children's Online Privacy Protection Act)

✅ **Compliant:**
- No personal information collected without parent consent
- No session recordings of children
- Anonymous device IDs only
- No behavioral tracking beyond feature usage

### GDPR (General Data Protection Regulation)

✅ **Compliant:**
- Data minimization (only collect what's needed)
- Purpose limitation (usage analytics only)
- Right to be forgotten (delete PostHog data)
- No cross-site tracking

### Best Practices

1. **Transparency**: Explain what data is collected in privacy policy
2. **Parental Control**: Parents can view all local data
3. **Data Retention**: Auto-delete old PostHog events (90 days)
4. **Regular Audits**: Review what's being sent to PostHog

## Architecture Files

- `src/infrastructure/analytics/AnalyticsService.ts` - Dual-layer router
- `src/infrastructure/analytics/LocalAnalytics.ts` - Private local storage
- `src/infrastructure/analytics/FeatureFlagService.ts` - Feature flags
- `src/hooks/useAnalytics.ts` - React hooks
- `src/main.tsx` - PostHog initialization

## Resources

- **PostHog Docs**: https://posthog.com/docs/libraries/react
- **Feature Flags**: https://posthog.com/docs/feature-flags
- **Privacy Config**: https://posthog.com/docs/privacy
- **MathCamp Strategy**: See `POSTHOG_STRATEGY.md`

## Support

If you encounter issues:
1. Check this guide
2. Review `POSTHOG_STRATEGY.md`
3. Check PostHog documentation
4. Open an issue in the MathCamp repo
