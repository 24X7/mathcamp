// Analytics types for MathCamp
import type { ProblemType } from '../../types'

export interface SessionSummary {
  id: string
  type: ProblemType
  total: number
  correct: number
  duration: number // milliseconds
  startTime: number
  endTime: number
}

export interface ProblemAttempt {
  id: string
  problemId: string
  type: ProblemType
  problem: string
  answer: string | number
  userAnswer: string | number
  correct: boolean
  timeMs: number
  hintsUsed: number
  attempts: number
  timestamp: number
}

export interface LocalSession {
  id: string
  startTime: number
  endTime?: number
  activityType: ProblemType
  attempts: ProblemAttempt[]
  achievements: string[]
}

export interface MasteryLevel {
  questionType: ProblemType
  level: number // 0-100
  questionsAttempted: number
  questionsCorrect: number
  averageTime: number
  lastPracticed: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface AnalyticsConfig {
  enablePostHog: boolean
  postHogApiKey?: string
  postHogHost?: string
}
