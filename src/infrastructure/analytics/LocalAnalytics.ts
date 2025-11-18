// Local analytics - stores all child learning data privately
import type { ProblemAttempt, LocalSession, MasteryLevel, SessionSummary } from './types'
import type { ProblemType } from '../../types'

const STORAGE_KEY_PREFIX = 'mathcamp_analytics_'

export class LocalAnalytics {
  private currentSession: LocalSession | null = null

  /**
   * Create a new learning session
   */
  createSession(activityType: ProblemType): LocalSession {
    this.currentSession = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      activityType,
      attempts: [],
      achievements: [],
    }

    this.saveCurrentSession()
    return this.currentSession
  }

  /**
   * Record a problem attempt with full details
   */
  recordAttempt(attempt: ProblemAttempt): void {
    if (!this.currentSession) {
      console.warn('No active session. Creating one.')
      this.createSession(attempt.type)
    }

    this.currentSession!.attempts.push(attempt)
    this.saveCurrentSession()

    // Update mastery levels
    this.updateMasteryLevel(attempt)
  }

  /**
   * Record activity preference (for recommendations)
   */
  recordActivityPreference(type: ProblemType): void {
    const preferences = this.getActivityPreferences()
    preferences[type] = (preferences[type] || 0) + 1
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}activity_preferences`,
      JSON.stringify(preferences)
    )
  }

  /**
   * Complete the current session
   */
  completeSession(summary: SessionSummary): void {
    if (!this.currentSession) {
      console.warn('No active session to complete')
      return
    }

    this.currentSession.endTime = Date.now()

    // Save to session history
    const history = this.getSessionHistory()
    history.push({
      ...this.currentSession,
      summary,
    })
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}session_history`,
      JSON.stringify(history.slice(-100)) // Keep last 100 sessions
    )

    this.currentSession = null
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_session`)
  }

  /**
   * Update mastery level for a question type
   */
  private updateMasteryLevel(attempt: ProblemAttempt): void {
    const masteryLevels = this.getMasteryLevels()
    const existing = masteryLevels.get(attempt.type) || {
      questionType: attempt.type,
      level: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      averageTime: 0,
      lastPracticed: 0,
      trend: 'stable' as const,
    }

    existing.questionsAttempted++
    if (attempt.correct) {
      existing.questionsCorrect++
    }

    // Update average time (exponential moving average)
    const alpha = 0.3
    existing.averageTime =
      existing.averageTime === 0
        ? attempt.timeMs
        : alpha * attempt.timeMs + (1 - alpha) * existing.averageTime

    // Calculate mastery level (weighted by accuracy and speed)
    const accuracy = existing.questionsCorrect / existing.questionsAttempted
    existing.level = Math.min(100, Math.round(accuracy * 100))

    existing.lastPracticed = Date.now()

    // Save updated mastery
    masteryLevels.set(attempt.type, existing)
    this.saveMasteryLevels(masteryLevels)
  }

  /**
   * Get mastery levels for all question types
   */
  getMasteryLevels(): Map<ProblemType, MasteryLevel> {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}mastery_levels`)
    if (!stored) return new Map()

    const obj = JSON.parse(stored)
    return new Map(Object.entries(obj)) as Map<ProblemType, MasteryLevel>
  }

  /**
   * Save mastery levels
   */
  private saveMasteryLevels(levels: Map<ProblemType, MasteryLevel>): void {
    const obj = Object.fromEntries(levels)
    localStorage.setItem(`${STORAGE_KEY_PREFIX}mastery_levels`, JSON.stringify(obj))
  }

  /**
   * Get session history
   */
  getSessionHistory(): any[] {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}session_history`)
    return stored ? JSON.parse(stored) : []
  }

  /**
   * Get activity preferences
   */
  getActivityPreferences(): Record<ProblemType, number> {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}activity_preferences`)
    return stored ? JSON.parse(stored) : {}
  }

  /**
   * Save current session to localStorage
   */
  private saveCurrentSession(): void {
    if (this.currentSession) {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}current_session`,
        JSON.stringify(this.currentSession)
      )
    }
  }

  /**
   * Get overall statistics
   */
  getStats() {
    const history = this.getSessionHistory()
    const masteryLevels = this.getMasteryLevels()

    let totalProblems = 0
    let totalCorrect = 0
    let totalTime = 0

    history.forEach((session: any) => {
      session.attempts?.forEach((attempt: ProblemAttempt) => {
        totalProblems++
        if (attempt.correct) totalCorrect++
        totalTime += attempt.timeMs
      })
    })

    return {
      totalSessions: history.length,
      totalProblems,
      totalCorrect,
      averageAccuracy: totalProblems > 0 ? totalCorrect / totalProblems : 0,
      averageTime: totalProblems > 0 ? totalTime / totalProblems : 0,
      masteryLevels: Array.from(masteryLevels.values()),
    }
  }

  /**
   * Export data for parent dashboard
   */
  exportForParent() {
    return {
      stats: this.getStats(),
      recentSessions: this.getSessionHistory().slice(-10),
      masteryLevels: this.getMasteryLevels(),
      activityPreferences: this.getActivityPreferences(),
    }
  }

  /**
   * Clear all local analytics data
   */
  clearAll(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_KEY_PREFIX)
    )
    keys.forEach((key) => localStorage.removeItem(key))
    this.currentSession = null
  }
}
