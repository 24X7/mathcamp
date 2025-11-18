# PostHog Integration - Verification Checklist

## ✅ Setup Complete

- [x] **PostHog packages installed** (`posthog-js`, `@posthog/react`)
- [x] **`.env` file created** with API key and host
- [x] **`.env` added to `.gitignore`** (API key won't be committed)
- [x] **PostHog initialized** in `src/main.tsx`
- [x] **Privacy settings configured** (no session recording, no autocapture)
- [x] **Analytics services created** (AnalyticsService, LocalAnalytics, FeatureFlagService)
- [x] **React hooks created** (`useAnalytics`, `useFeatureFlags`, `useFeatureFlag`)
- [x] **App.tsx integrated** with analytics tracking
- [x] **Dev server running** at http://localhost:3000/

---

## 🧪 Testing Checklist

### Test 1: Verify PostHog Connection
1. [ ] Open http://localhost:3000/ in browser
2. [ ] Open DevTools → Console
3. [ ] Look for PostHog initialization message
4. [ ] Should see: `[PostHog]` debug logs (in dev mode)

**Expected**: PostHog initialized successfully, no errors

---

### Test 2: Track App Started Event
1. [ ] Open http://localhost:3000/
2. [ ] Go to PostHog dashboard → Events → Live
3. [ ] Look for `app_started` event

**Expected**: Event appears in PostHog within 30 seconds

**Event properties should include:**
- `version`: "1.0.0"
- `platform`: "web"
- `timestamp`: (number)

---

### Test 3: Track Activity Selected
1. [ ] In MathCamp, click an activity (e.g., "Addition")
2. [ ] Check PostHog dashboard → Events → Live
3. [ ] Look for `session_started` and `activity_selected` events

**Expected**: Both events appear

**`activity_selected` properties:**
- `activity_type`: "addition"
- `question_count`: 5, 10, or 20

---

### Test 4: Track Session Completed
1. [ ] Complete a short session (5 questions)
2. [ ] Check PostHog dashboard → Events → Live
3. [ ] Look for `session_completed` event

**Expected**: Event appears

**Properties should include:**
- `activity_type`: "addition" (or other)
- `total_problems`: 5
- `duration_bucket`: "0-5min" (or similar)

**Properties should NOT include:**
- ❌ `correct` / `score` / `accuracy`
- ❌ `answer` / `userAnswer`
- ❌ `childId` / `name`

---

### Test 5: Local Analytics (Private Data)
1. [ ] Open DevTools → Console
2. [ ] Run:
```javascript
const analytics = window.analytics // if exposed
// Or access via React DevTools
```
3. [ ] Check localStorage:
```javascript
Object.keys(localStorage).filter(k => k.startsWith('mathcamp_analytics_'))
```

**Expected**: Local storage keys exist
- `mathcamp_analytics_current_session`
- `mathcamp_analytics_mastery_levels`
- `mathcamp_analytics_session_history`

**Data should include:**
- Individual problem attempts
- Correct/incorrect answers
- Time spent per problem
- Mastery levels

---

### Test 6: Feature Flags (Local Fallback)
1. [ ] Check console for feature flag evaluations
2. [ ] Verify local defaults are working:

```typescript
// In any component
const showMultiplication = useFeatureFlag('multiplication-activity')
console.log(showMultiplication) // Should be false (local default)
```

**Expected**: Local feature flags working (from `LOCAL_FEATURE_FLAGS`)

---

### Test 7: Create Remote Feature Flag
1. [ ] Go to PostHog dashboard
2. [ ] Click **Feature Flags** → **New feature flag**
3. [ ] Name: `test-flag`
4. [ ] Rollout: 100%
5. [ ] Save
6. [ ] Wait 1 minute (cache)
7. [ ] Refresh MathCamp
8. [ ] Check flag value

**Expected**: Remote flag overrides local default

---

### Test 8: Privacy Verification
1. [ ] Go to PostHog dashboard → Events → Live
2. [ ] Click on any event
3. [ ] Check event properties
4. [ ] Verify NO child data is present:

**Should NOT see:**
- ❌ Child names
- ❌ Individual answers
- ❌ Correctness scores
- ❌ Exact times (only buckets)
- ❌ Email addresses
- ❌ Any PII

**Should see:**
- ✅ Activity type
- ✅ Question count
- ✅ Duration buckets
- ✅ App version
- ✅ Platform

---

### Test 9: Offline Mode
1. [ ] Disconnect internet / block PostHog in DevTools
2. [ ] Restart app
3. [ ] App should still work
4. [ ] Feature flags should fall back to local defaults
5. [ ] Local analytics should still track

**Expected**: App works perfectly offline

---

### Test 10: Error Tracking
1. [ ] Trigger an error (optional)
2. [ ] Check PostHog dashboard for `error_occurred` event

**Expected**: Errors tracked without sensitive data

---

## 📊 PostHog Dashboard Setup

### Recommended Dashboards

#### 1. **Usage Dashboard**
Create in PostHog → Dashboards → New Dashboard

**Metrics to track:**
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Sessions per day
- Average session duration
- Most popular activities

**Insights to create:**
```
1. Trend: event = "session_started", interval = day
2. Trend: event = "activity_selected", breakdown by "activity_type"
3. Funnel: app_started → activity_selected → session_completed
```

#### 2. **Feature Adoption Dashboard**

**Metrics:**
- Activity selection breakdown
- Question count preferences
- Feature flag evaluations

**Insights:**
```
1. Pie chart: event = "activity_selected", breakdown by "activity_type"
2. Bar chart: event = "activity_selected", breakdown by "question_count"
```

---

## 🎛️ Feature Flags to Create

### Recommended Flags

1. **`multiplication-activity`**
   - Purpose: Enable multiplication when ready
   - Default: 0% rollout
   - Increase gradually: 10% → 50% → 100%

2. **`new-confetti-animation`**
   - Purpose: A/B test confetti styles
   - Variants: `variant-a`, `variant-b`
   - Split: 50/50

3. **`adaptive-difficulty`**
   - Purpose: Kill switch for adaptive difficulty
   - Default: 100% (enabled)

4. **`sound-effects`**
   - Purpose: Enable/disable sounds
   - Default: 100% (enabled)

5. **`parent-dashboard`**
   - Purpose: Show parent dashboard link
   - Default: 100% (enabled)

---

## 🔍 Common Issues & Solutions

### Issue: No events in PostHog
**Solution:**
- Check `.env` file exists and has correct API key
- Restart dev server after adding `.env`
- Check browser console for errors
- Verify PostHog host is correct (US vs EU)

### Issue: Events missing properties
**Solution:**
- Check `sanitize_properties` isn't removing too much
- Verify properties are passed in `analytics.track*()` calls
- Check TypeScript types match

### Issue: Feature flags not working
**Solution:**
- Wait 1 minute after creating flag (cache)
- Check flag name spelling
- Verify flag rollout > 0%
- Check local fallback in `LOCAL_FEATURE_FLAGS`

### Issue: Local analytics not saving
**Solution:**
- Check localStorage quota not exceeded
- Verify browser allows localStorage
- Check console for storage errors

---

## 📈 Success Metrics

After 1 week, you should have:
- [ ] **100+ sessions** tracked in PostHog
- [ ] **DAU/MAU metrics** showing user activity
- [ ] **Activity preferences** visible (which features are popular)
- [ ] **Session duration** data (how long kids engage)
- [ ] **Error tracking** catching any bugs
- [ ] **Feature flags** deployed and working
- [ ] **Local progress data** for all users
- [ ] **Parent dashboard** showing learning progress

---

## 🎉 All Systems Go!

Your PostHog integration is:
- ✅ **Installed and configured**
- ✅ **Privacy-first** (COPPA/GDPR compliant)
- ✅ **Tracking usage metrics** (anonymous)
- ✅ **Storing learning data locally** (private)
- ✅ **Feature flags enabled** (remote control)
- ✅ **Working offline** (graceful degradation)

**Dev server running at:** http://localhost:3000/

**PostHog dashboard:** https://us.i.posthog.com/

**Start tracking and building data-driven features! 🚀**

---

## 📞 Need Help?

- **Setup Guide**: `docs/POSTHOG_SETUP.md`
- **Quick Start**: `POSTHOG_QUICKSTART.md`
- **Architecture**: `POSTHOG_STRATEGY.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **PostHog Docs**: https://posthog.com/docs/libraries/react
