# PostHog Integration Strategy - MathCamp

## 🎯 Hybrid Privacy-First Approach

### Core Principle
**Two-Layer Analytics**: Anonymous usage metrics go to PostHog; all child learning data stays local.

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTION                      │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌─────────────────────┐
    │  POSTHOG CLOUD  │         │  LOCAL STORAGE      │
    │  (Anonymous)    │         │  (Private)          │
    └─────────────────┘         └─────────────────────┘
             │                            │
    ┌────────┴─────────┐         ┌────────┴──────────┐
    │ • MAU/DAU        │         │ • Mastery levels  │
    │ • Session count  │         │ • Problem history │
    │ • Feature usage  │         │ • Achievements    │
    │ • App errors     │         │ • Streaks         │
    │ • Load times     │         │ • Answer accuracy │
    │ • Feature flags  │         │ • Child progress  │
    └──────────────────┘         └───────────────────┘
         (Remote)                     (Never sent)
```

---

## ✅ PostHog: Safe to Track (Anonymous)

### Application Health
- App launched
- Session started/completed
- App version
- Platform (web/mobile)
- Load time metrics
- Error/crash reports

### Feature Usage (Aggregated)
- Activity selected (addition, subtraction, etc.)
- Number of problems attempted per session
- Session duration (bucketed: 0-5min, 5-10min, etc.)
- Features enabled/disabled

### Example Events
```typescript
// ✅ SAFE - No child data
posthog.capture('session_started', {
  version: '1.0.0',
  platform: 'web',
  timestamp: Date.now()
})

posthog.capture('activity_selected', {
  activity_type: 'addition',
  question_count: 10
})

posthog.capture('session_completed', {
  activity_type: 'fact-family',
  total_problems: 5,
  duration_bucket: '5-10min'
})
```

---

## 🔒 Local Storage: Private Data (Never Sent)

### Child's Learning Progress
- Mastery levels per topic
- Specific answers to problems
- Correctness rates
- Time spent per problem
- Achievements unlocked
- Streak counts
- Skill progression
- Learning trends

### Example Local Events
```typescript
// 🔒 LOCAL ONLY - Too detailed for PostHog
localAnalytics.recordAttempt({
  problemId: 'prob_123',
  questionType: 'addition',
  problem: '5 + 3',
  userAnswer: 8,
  correct: true,
  timeSpent: 4500,
  hintsUsed: 0
})

localAnalytics.updateMastery({
  questionType: 'addition',
  level: 75,  // 0-100 mastery score
  trend: 'improving'
})
```

---

## 🎛️ Feature Flags Strategy

### Remote Control via PostHog
```typescript
// Check flag from PostHog dashboard
const showMultiplication = await featureFlags.isEnabled('multiplication-activity')
const confettiStyle = await featureFlags.getVariant('confetti-animation')

// Fallback to local config if offline
const LOCAL_FLAGS = {
  'multiplication-activity': false,
  'new-confetti-animation': true,
  'adaptive-difficulty': true,
  'sound-effects': true
}
```

### Use Cases
1. **Gradual Rollout**: Enable for 10% → 50% → 100% of users
2. **A/B Testing**: Test different learning approaches
3. **Kill Switch**: Instantly disable buggy features
4. **Beta Access**: Enable experimental features for testers
5. **Platform-Specific**: Different features for mobile vs desktop

---

## 🔐 Privacy Configuration

### PostHog Initialization
```typescript
import posthog from 'posthog-js'

posthog.init('<ph_project_api_key>', {
  api_host: 'https://us.i.posthog.com',

  // CRITICAL: Privacy settings
  autocapture: false,              // No automatic event capture
  capture_pageview: false,         // Manual pageview tracking
  disable_session_recording: true, // NEVER record children
  disable_surveys: true,           // No surveys for kids
  opt_out_capturing_by_default: false,

  // Sanitize accidental PII
  sanitize_properties: (properties) => {
    const sanitized = { ...properties }
    // Remove any child-identifying data
    delete sanitized.name
    delete sanitized.email
    delete sanitized.childId
    delete sanitized.answer
    delete sanitized.score
    return sanitized
  }
})
```

---

## 🏗️ Implementation Architecture

### AnalyticsService (Dual-Layer Router)
```typescript
// src/infrastructure/analytics/AnalyticsService.ts

export class AnalyticsService {
  constructor(
    private postHog: PostHog,           // Remote metrics
    private localAnalytics: LocalAnalytics  // Private data
  ) {}

  // Routes events to appropriate layer
  trackSessionStart(): void {
    // PostHog: Anonymous usage
    this.postHog.capture('session_started', {
      version: APP_VERSION
    })

    // Local: Detailed session data
    this.localAnalytics.createSession()
  }

  trackActivitySelected(type: QuestionType): void {
    // PostHog: Feature usage
    this.postHog.capture('activity_selected', {
      activity_type: type
    })

    // Local: Track for recommendations
    this.localAnalytics.recordActivity(type)
  }

  trackProblemAnswered(attempt: ProblemAttempt): void {
    // PostHog: NOTHING - too detailed

    // Local: Everything
    this.localAnalytics.recordAttempt({
      problemId: attempt.id,
      userAnswer: attempt.answer,
      correct: attempt.correct,
      timeSpent: attempt.timeMs
    })
  }

  trackSessionCompleted(summary: SessionSummary): void {
    // PostHog: Aggregated metrics only
    this.postHog.capture('session_completed', {
      activity_type: summary.type,
      total_problems: summary.total,
      duration_bucket: this.bucketDuration(summary.duration)
      // NO accuracy, NO scores
    })

    // Local: Full details
    this.localAnalytics.completeSession(summary)
  }

  private bucketDuration(ms: number): string {
    if (ms < 5 * 60 * 1000) return '0-5min'
    if (ms < 10 * 60 * 1000) return '5-10min'
    if (ms < 20 * 60 * 1000) return '10-20min'
    return '20+min'
  }
}
```

### LocalAnalytics (Private Storage)
```typescript
// src/infrastructure/analytics/LocalAnalytics.ts

export class LocalAnalytics {
  private storage: IStorageAdapter

  createSession(): Session {
    const session = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      attempts: [],
      achievements: []
    }
    return session
  }

  recordAttempt(attempt: ProblemAttempt): void {
    // Store in localStorage/IndexedDB
    this.storage.append('session_attempts', attempt)

    // Update mastery levels
    this.updateMasteryLevel(attempt)
  }

  getProgress(): UserProgress {
    return this.storage.get('user_progress')
  }

  exportForParent(): ParentDashboardData {
    // Generate parent-friendly report from local data
    return {
      masteryLevels: this.getMasteryLevels(),
      recentSessions: this.getRecentSessions(),
      achievements: this.getAchievements(),
      trends: this.calculateTrends()
    }
  }
}
```

### FeatureFlagService
```typescript
// src/infrastructure/analytics/FeatureFlagService.ts

export class FeatureFlagService {
  constructor(
    private postHog: PostHog,
    private localFlags: Record<string, boolean>
  ) {}

  async isEnabled(flag: string): Promise<boolean> {
    // Try PostHog first (remote control)
    const remote = this.postHog.isFeatureEnabled(flag)

    if (remote !== undefined) {
      return remote
    }

    // Fallback to local config
    return this.localFlags[flag] ?? false
  }

  getVariant(flag: string): string | null {
    return this.postHog.getFeatureFlagVariant(flag)
  }
}

// Local defaults (when offline)
export const LOCAL_FEATURE_FLAGS = {
  'multiplication-activity': false,
  'division-activity': false,
  'new-confetti-animation': true,
  'adaptive-difficulty': true,
  'sound-effects': true,
  'parent-dashboard': true,
}
```

---

## 📋 Events Checklist

### PostHog Events (Anonymous)
- [ ] `app_started` - App launch
- [ ] `session_started` - Learning session began
- [ ] `activity_selected` - Feature usage
- [ ] `session_completed` - Session finished (aggregated)
- [ ] `error_occurred` - App error/crash
- [ ] `feature_flag_evaluated` - Flag checked
- [ ] `performance_metric` - Load time, FPS

### Local Events (Private)
- [ ] `session_created` - New session with ID
- [ ] `problem_generated` - Question created
- [ ] `problem_answered` - Answer submitted (with correctness)
- [ ] `achievement_unlocked` - Badge earned
- [ ] `mastery_updated` - Skill level changed
- [ ] `streak_updated` - Streak count changed
- [ ] `hint_used` - Child asked for help

---

## 🎯 Success Metrics

### PostHog Dashboard (Product Metrics)
- **MAU/DAU**: How many users active?
- **Session frequency**: How often do kids use the app?
- **Feature adoption**: Which activities are popular?
- **Session duration**: How long do kids engage?
- **Retention**: Do kids come back?
- **Performance**: Are load times acceptable?

### Local Dashboard (Learning Metrics)
- **Mastery progression**: Is the child improving?
- **Accuracy by topic**: Where are strengths/weaknesses?
- **Time efficiency**: Getting faster over time?
- **Achievement unlocks**: Motivating progress?
- **Streak tracking**: Building daily habits?

---

## ⚠️ Privacy Compliance

### COPPA (Children's Online Privacy Protection Act)
- ✅ No personal information collected without parent consent
- ✅ No session recordings of children
- ✅ Anonymous device IDs only
- ✅ No behavioral tracking beyond feature usage

### GDPR (General Data Protection Regulation)
- ✅ Data minimization (only collect what's needed)
- ✅ Purpose limitation (usage analytics only)
- ✅ Right to be forgotten (delete PostHog data)
- ✅ No cross-site tracking

### Best Practices
1. **Transparency**: Explain what data is collected in simple terms
2. **Parental control**: Option to disable PostHog entirely
3. **Data retention**: Auto-delete old events (90 days)
4. **Regular audits**: Review what's being sent to PostHog

---

## 🚀 Implementation Phases

### Phase 1: Setup (Week 2)
- [ ] Install `posthog-js` and `@posthog/react`
- [ ] Create PostHog project at posthog.com
- [ ] Configure privacy settings
- [ ] Wrap app in `<PostHogProvider>`

### Phase 2: Analytics Layer (Week 2)
- [ ] Build `AnalyticsService` (dual-layer router)
- [ ] Implement `LocalAnalytics` (private storage)
- [ ] Create `FeatureFlagService` (remote + fallback)

### Phase 3: Integration (Week 3)
- [ ] Add PostHog events to `QuizEngine`
- [ ] Track session lifecycle
- [ ] Track feature usage
- [ ] Test local fallback when offline

### Phase 4: Feature Flags (Week 4)
- [ ] Create flags in PostHog dashboard
- [ ] Integrate with UI components
- [ ] Test gradual rollout
- [ ] Document flag management

---

## 📚 Resources

- **PostHog Docs**: https://posthog.com/docs/libraries/react
- **Feature Flags**: https://posthog.com/docs/feature-flags
- **Privacy Config**: https://posthog.com/docs/privacy
- **COPPA Compliance**: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa

---

## 🎓 Key Takeaways

1. **PostHog = Product Analytics** (anonymous, aggregated)
2. **LocalStorage = Learning Data** (detailed, private)
3. **Feature Flags = Remote Control** (gradual rollouts, A/B tests)
4. **Privacy First = No Child Data to Cloud** (COPPA/GDPR compliant)
5. **Hybrid Approach = Best of Both Worlds** (insights + privacy)

**The API compatibility means we can easily migrate more data to PostHog later if requirements change, but we start privacy-first.**
