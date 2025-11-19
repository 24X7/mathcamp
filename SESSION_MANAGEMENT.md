# Session Management & Routing Architecture

## Overview
MathCamp uses a **dual-layer session management system** to handle quiz sessions and progress tracking. This document explains how sessions are created, managed, and cleared to ensure accurate score tracking.

---

## Architecture Components

### 1. SessionManager (Singleton)
**Location:** `src/routes/$activity.tsx:7-54`

The `SessionManager` is a singleton class that persists quiz session state across route navigations within a single browser session.

```typescript
export class SessionManager {
  private static instance: SessionManager
  private sessions: Map<string, {
    sessionId: string          // UUID for progress tracking
    sessionPlan: SessionPlan[]  // Pre-generated questions
    correctCount: number        // Number of correct answers
    sessionStartTime: number    // Timestamp (ms)
  }> = new Map()

  static getInstance(): SessionManager
  getOrCreateSession(activity: string, startSessionFn: () => string): Session
  incrementCorrectCount(activity: string): void
  clearSession(activity: string): void
  clearAllSessions(): void
}
```

**Key Characteristics:**
- ✅ **Singleton Pattern**: One instance per browser tab
- ✅ **Activity-Keyed**: Separate sessions for 'addition', 'subtraction', etc.
- ✅ **Persists Across Routes**: Survives navigation within `/$activity/question/$number`
- ⚠️ **NOT Persisted to localStorage**: Cleared on page refresh
- 🔄 **Cleared on Homepage**: Prevents score accumulation across tests

---

### 2. ProgressProvider (React Context)
**Location:** `src/hooks/useProgress.tsx`

The `ProgressProvider` manages long-term progress data stored in localStorage.

```typescript
interface UserProgress {
  userId: string
  totalProblems: number
  correctAnswers: number
  currentStreak: number
  longestStreak: number
  favoriteActivity: ProblemType
  sessions: Session[]         // Historical sessions
  achievements: Achievement[]
  lastActiveDate: Date
}
```

**Key Characteristics:**
- ✅ **Persisted to localStorage**: Survives page refresh
- ✅ **Global State**: Available throughout the app
- ✅ **Historical Data**: Tracks all completed sessions
- 🎯 **Achievement Tracking**: Unlocks badges based on performance

---

## Session Lifecycle

### Phase 1: Session Creation
**Trigger:** User clicks an activity on the homepage (e.g., "Addition")

```
1. Homepage (/)
   └─> User clicks "Addition"

2. Navigate to /addition/question/1
   └─> $activity.tsx beforeLoad hook runs
       └─> Provides sessionManager to child routes

3. QuestionScreen mounts
   └─> Calls sessionManager.getOrCreateSession('addition', startSession)
       └─> Check: Does sessions.has('addition')?
           ├─> NO:  Create new session
           │   ├─> Call startSession() to get UUID
           │   ├─> Generate session plan (N questions)
           │   └─> Set correctCount = 0
           └─> YES: Return existing session (AVOIDED with homepage clearing)
```

**Created Session:**
```javascript
{
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  sessionPlan: [
    { type: 'addition', operand1: 3, operand2: 5, ... },
    { type: 'addition', operand1: 7, operand2: 2, ... },
    // ... N questions
  ],
  correctCount: 0,
  sessionStartTime: 1700000000000
}
```

---

### Phase 2: Question Answering
**Trigger:** User submits an answer

```
1. User answers question
   └─> QuestionScreen.handleAnswer(answer, isCorrect)

2. If correct:
   └─> sessionManager.incrementCorrectCount(activity)
       └─> sessions.get('addition').correctCount++

3. Save to ProgressProvider:
   └─> addProblemAttempt({ ...problem, userAnswer, isCorrect })
       └─> Persisted to localStorage

4. Navigate to next question or results:
   ├─> If NOT last question:
   │   └─> navigate({ to: '/$activity/question/$number',
   │                   params: { number: currentNumber + 1 },
   │                   replace: true })  // Prevents back button
   │
   └─> If last question:
       └─> navigate({ to: '/$activity/results',
                      search: { correct: finalCount, total: N },
                      replace: true })  // Prevents back button
```

**Example Flow (5 questions):**
```
Question 1: Answer correct   → correctCount: 0 → 1
Question 2: Answer incorrect → correctCount: 1 (no change)
Question 3: Answer correct   → correctCount: 1 → 2
Question 4: Answer incorrect → correctCount: 2 (no change)
Question 5: Answer correct   → correctCount: 2 → 3
Results:    Show 3/5 = 60%
```

---

### Phase 3: Results & Session End
**Trigger:** User completes all questions

```
1. Navigate to /addition/results?correct=3&total=5&sessionId=...
   └─> ResultsScreen mounts

2. Display results:
   └─> Show: "You got 3 out of 5 correct!" (60%)
   └─> Trigger confetti animation

3. End session in ProgressProvider:
   └─> endSession(sessionId)
       └─> Mark session as completed in localStorage
       └─> Update totalProblems, correctAnswers, streaks
       └─> Check for new achievements

4. SessionManager state:
   └─> sessions.get('addition') STILL EXISTS with correctCount: 3
       └─> ⚠️ CRITICAL: Will be cleared when user navigates to homepage
```

---

### Phase 4: Session Cleanup (CRITICAL)
**Trigger:** User navigates to homepage

```
1. User clicks "Home" button (or browser back button from results)
   └─> Navigate to /

2. Homepage beforeLoad hook runs:
   └─> const sessionManager = SessionManager.getInstance()
   └─> sessionManager.clearAllSessions()
       └─> sessions.clear()  // Wipes entire Map
   └─> console.log('[MenuScreen beforeLoad] Cleared all SessionManager sessions')

3. SessionManager state:
   └─> sessions: Map(0) {}  ✅ Empty!

4. Why this matters:
   └─> If user starts "Addition" again, getOrCreateSession() will create
       a FRESH session with correctCount: 0 (not reuse old session with
       correctCount: 3, which would cause score accumulation)
```

**Without this cleanup:**
```javascript
// BAD: What would happen without clearAllSessions()
Test 1: Answer 3/5 correctly → correctCount: 3 → Results: 60%
Click Home
Test 2: Start Addition again
        └─> getOrCreateSession() finds existing session
        └─> Returns session with correctCount: 3 ❌
        └─> Answer 2/5 correctly → correctCount: 3 → 4 → 5
        └─> Results: 5/5 = 100% ❌ (WRONG! Should be 2/5 = 40%)
```

**With cleanup:**
```javascript
// GOOD: Current behavior with clearAllSessions()
Test 1: Answer 3/5 correctly → correctCount: 3 → Results: 60%
Click Home → clearAllSessions() → sessions.clear()
Test 2: Start Addition again
        └─> getOrCreateSession() creates NEW session
        └─> correctCount: 0 ✅
        └─> Answer 2/5 correctly → correctCount: 2
        └─> Results: 2/5 = 40% ✅ (CORRECT!)
```

---

## Navigation & History Management

### Back Button Behavior

#### During Quiz (Question Screen)
**Goal:** Prevent users from navigating backwards through questions

```
Question 1 → Question 2 → Question 3
     ↑            ↑            ↑
  (blocked)   (blocked)   (current)
```

**Implementation:** `navigate({ replace: true })`
- Replaces current history entry instead of pushing new one
- Prevents history stack accumulation
- Back button has no previous questions to go to

**File:** `src/routes/$activity/question/$number.tsx:142-146`

#### On Results Page
**Goal:** Back button returns to homepage, not questions

```
Results Page → [Back Button] → Homepage
     ↑                              ↑
(popstate handler)          (clearAllSessions)
```

**Implementation:** Custom popstate handler

**File:** `src/routes/$activity/results.tsx:40-54`
```typescript
useEffect(() => {
  const handlePopState = (e: PopStateEvent) => {
    e.preventDefault()
    navigate({ to: '/', replace: true })
  }

  // Add dummy history entry so back button has somewhere to go
  window.history.pushState(null, '', window.location.href)
  window.addEventListener('popstate', handlePopState)

  return () => window.removeEventListener('popstate', handlePopState)
}, [navigate])
```

---

## TanStack Router Integration

### Route Context Passing
**Pattern:** `beforeLoad` hook provides SessionManager to child routes

**Parent Route:** `src/routes/$activity.tsx:56-60`
```typescript
export const Route = createFileRoute('/$activity')({
  beforeLoad: ({ params }) => {
    return {
      sessionManager: SessionManager.getInstance(),
      activityParam: params.activity,
    }
  },
  component: ActivityLayout,
})
```

**Child Route:** `src/routes/$activity/question/$number.tsx:26`
```typescript
function QuestionScreen() {
  const { sessionManager } = Route.useRouteContext()
  const session = sessionManager.getOrCreateSession(activity, startSession)
  // ...
}
```

**Why beforeLoad?**
- ✅ Runs before component mounts
- ✅ Guaranteed to execute on every navigation
- ✅ Provides type-safe context to child routes
- ✅ Official TanStack Router pattern for parent-to-child data flow

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Homepage (/)          │
              │  beforeLoad:           │
              │  clearAllSessions() ✅  │
              └────────────┬───────────┘
                           │ Click Activity
                           ▼
         ┌─────────────────────────────────┐
         │  /$activity/question/$number    │
         │                                 │
         │  1. Get sessionManager from     │
         │     Route.useRouteContext()     │
         │                                 │
         │  2. getOrCreateSession()        │
         │     └─> Create if not exists   │
         │                                 │
         │  3. handleAnswer(answer)        │
         │     ├─> incrementCorrectCount() │
         │     │   (SessionManager)        │
         │     │                           │
         │     └─> addProblemAttempt()    │
         │         (ProgressProvider)      │
         └────────────┬────────────────────┘
                      │ Last Question
                      ▼
         ┌─────────────────────────────────┐
         │  /$activity/results             │
         │                                 │
         │  1. Display score from search   │
         │     params (correct/total)      │
         │                                 │
         │  2. endSession(sessionId)       │
         │     └─> Save to localStorage   │
         │         (ProgressProvider)      │
         │                                 │
         │  3. checkAchievements()         │
         │                                 │
         │  4. SessionManager still has    │
         │     session (correctCount: N)   │
         └────────────┬────────────────────┘
                      │ Click Home
                      ▼
              ┌────────────────────────┐
              │  Homepage (/)          │
              │  beforeLoad:           │
              │  clearAllSessions() ✅  │
              │  (SessionManager now   │
              │   empty for next test) │
              └────────────────────────┘
```

---

## State Comparison

### SessionManager (In-Memory, Temporary)
| Property | Scope | Persistence | Purpose |
|----------|-------|-------------|---------|
| sessionId | Single test | Until homepage | Link to ProgressProvider |
| sessionPlan | Single test | Until homepage | Pre-generated questions |
| correctCount | Single test | Until homepage | Real-time score tracking |
| sessionStartTime | Single test | Until homepage | Duration calculation |

**Cleared:** When user navigates to homepage (any route)

### ProgressProvider (localStorage, Permanent)
| Property | Scope | Persistence | Purpose |
|----------|-------|-------------|---------|
| userId | Global | Forever | Anonymous identifier |
| totalProblems | Global | Forever | Lifetime statistics |
| correctAnswers | Global | Forever | Lifetime statistics |
| sessions[] | Global | Forever | Historical session data |
| achievements[] | Global | Forever | Unlocked badges |
| streaks | Global | Forever | Engagement tracking |

**Cleared:** Only by user action (clear browser data) or manual reset

---

## Testing Scenarios

### ✅ Scenario 1: Normal Completion
```
1. Homepage → Click "Addition"
2. Answer 5 questions (3 correct)
3. Results: 3/5 = 60% ✅
4. Click Home
5. Click "Addition" again
6. Answer 5 questions (2 correct)
7. Results: 2/5 = 40% ✅ (NOT 5/5 = 100%)
```

### ✅ Scenario 2: Partial Test Abandonment
```
1. Homepage → Click "Subtraction"
2. Answer 3/10 questions (2 correct)
3. Click Home (abandon test)
4. SessionManager cleared ✅
5. Click "Subtraction" again
6. Answer 10 questions (5 correct)
7. Results: 5/10 = 50% ✅ (NOT 7/10 = 70%)
```

### ✅ Scenario 3: Back Button from Results
```
1. Complete test: 4/5 = 80%
2. View results page
3. Press browser back button
4. → Navigate to homepage (popstate handler) ✅
5. → SessionManager cleared (beforeLoad) ✅
6. Start new test
7. → Fresh session with correctCount: 0 ✅
```

### ✅ Scenario 4: Multiple Activities
```
1. Complete "Addition": 3/5 = 60%
2. Home → Complete "Counting": 4/5 = 80%
3. Home → Complete "Addition": 2/5 = 40% ✅
   (NOT 5/5 = 100% from session #1)
```

---

## Common Pitfalls (Avoided)

### ❌ Pitfall 1: Not Clearing on Homepage
**Problem:** SessionManager persists old correctCount values
**Result:** Scores accumulate across tests, can exceed 100%
**Solution:** `clearAllSessions()` in homepage `beforeLoad`

### ❌ Pitfall 2: Using React State Instead of Singleton
**Problem:** State resets on component unmount
**Result:** Lose session data when navigating between questions
**Solution:** SessionManager singleton persists across route changes

### ❌ Pitfall 3: Not Using `replace: true`
**Problem:** History stack accumulates every question
**Result:** Back button navigates through all questions
**Solution:** `navigate({ replace: true })` for question progression

### ❌ Pitfall 4: Clearing Too Early
**Problem:** Clear session before results page loads
**Result:** Results page shows 0/0 = 0%
**Solution:** Only clear on homepage navigation, not on results

---

## Debugging

### Console Logs to Watch
```javascript
// Homepage load
[MenuScreen beforeLoad] Cleared all SessionManager sessions

// Question answering
[handleAnswer] { question: 1, isCorrect: true, finalCorrectCount: 1, total: 5, isLastQuestion: false }
[handleAnswer] { question: 5, isCorrect: false, finalCorrectCount: 3, total: 5, isLastQuestion: true }

// Results page
[Results] Regular confetti (not 100%)
// or
[Results] ✨✨✨ FIREWORKS TIME ✨✨✨
```

### Inspecting State
```javascript
// In browser console
SessionManager.getInstance().sessions
// Expected on homepage: Map(0) {}
// Expected during test: Map(1) { 'addition' => {...} }

// ProgressProvider state (localStorage)
JSON.parse(localStorage.getItem('mathcamp_progress'))
```

---

## Migration Notes

### Before Fix (Buggy Behavior)
- SessionManager sessions NEVER cleared
- Scores accumulated across multiple tests
- Users could exceed 100% by repeatedly taking tests

### After Fix (Current Behavior)
- SessionManager cleared on every homepage navigation
- Each test starts with `correctCount: 0`
- Maximum possible score: 100%
- Back button properly handled

---

## Related Files

| File | Purpose |
|------|---------|
| `src/routes/$activity.tsx` | SessionManager singleton definition |
| `src/routes/index.tsx` | Homepage with session cleanup |
| `src/routes/$activity/question/$number.tsx` | Question screen with session usage |
| `src/routes/$activity/results.tsx` | Results display and session end |
| `src/hooks/useProgress.tsx` | ProgressProvider for localStorage |
| `src/utils/sessionPlanner.ts` | Generate session plans |

---

## Future Improvements

### Potential Enhancements
1. **Session Recovery**: Save SessionManager state to sessionStorage for tab recovery
2. **Pause/Resume**: Allow users to pause mid-session and resume later
3. **Multi-Tab Sync**: Share SessionManager state across browser tabs (BroadcastChannel)
4. **Session Analytics**: Track abandonment rate, average completion time
5. **Smart Clearing**: Only clear session for specific activity when starting new test

### Not Recommended
❌ **Persist SessionManager to localStorage**: Would defeat the purpose of session isolation
❌ **Allow backwards navigation**: Contradicts educational design (no cheating)
❌ **Manual session management**: Current automatic system is child-friendly
