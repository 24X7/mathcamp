import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProblemType } from '@/types'
import { getSettings } from '@/utils/localStorage'
import { generateSessionPlan, SessionPlan } from '@/utils/sessionPlanner'

// Session state manager that persists across navigations
export class SessionManager {
  private static instance: SessionManager
  private sessions: Map<string, {
    sessionId: string
    sessionPlan: SessionPlan[]
    correctCount: number
    sessionStartTime: number
  }> = new Map()

  static getInstance() {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  getOrCreateSession(activity: string, startSessionFn: () => string) {
    if (!this.sessions.has(activity)) {
      const settings = getSettings()
      this.sessions.set(activity, {
        sessionId: startSessionFn(),
        sessionPlan: generateSessionPlan(
          activity as ProblemType,
          settings.problemCount,
          settings.difficulty
        ),
        correctCount: 0,
        sessionStartTime: Date.now(),
      })
    }
    return this.sessions.get(activity)!
  }

  incrementCorrectCount(activity: string) {
    const session = this.sessions.get(activity)
    if (session) {
      session.correctCount++
    }
  }

  clearSession(activity: string) {
    this.sessions.delete(activity)
  }

  clearAllSessions() {
    this.sessions.clear()
  }
}

export const Route = createFileRoute('/$activity')({
  beforeLoad: ({ params }) => {
    // This runs before the route loads and provides context to child routes
    // We'll provide a session manager that child routes can use
    return {
      sessionManager: SessionManager.getInstance(),
      activityParam: params.activity,
    }
  },
  component: ActivityLayout,
})

function ActivityLayout() {
  return <Outlet />
}
