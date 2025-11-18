import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { UserProgress, Session, AttemptedProblem, Achievement, ProblemType } from '@/types'
import { getProgress, saveProgress, initializeProgress, getUserId } from '@/utils/localStorage'

interface ProgressContextType {
  progress: UserProgress | null
  addProblemAttempt: (problem: AttemptedProblem) => void
  startSession: () => string
  endSession: (sessionId: string) => void
  checkAchievements: () => Achievement[]
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export const ProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  useEffect(() => {
    // Load or initialize progress on mount
    let existingProgress = getProgress()
    if (!existingProgress) {
      existingProgress = initializeProgress()
    }
    setProgress(existingProgress)
  }, [])

  const addProblemAttempt = (problem: AttemptedProblem) => {
    if (!progress || !currentSession) return

    const updatedProgress = { ...progress }
    updatedProgress.totalProblems += 1

    if (problem.isCorrect) {
      updatedProgress.correctAnswers += 1
      updatedProgress.currentStreak += 1
      if (updatedProgress.currentStreak > updatedProgress.longestStreak) {
        updatedProgress.longestStreak = updatedProgress.currentStreak
      }
    } else {
      updatedProgress.currentStreak = 0
    }

    // Update favorite activity
    const activityCounts: Record<string, number> = {}
    updatedProgress.sessions.forEach(session => {
      session.problems.forEach(p => {
        activityCounts[p.type] = (activityCounts[p.type] || 0) + 1
      })
    })
    activityCounts[problem.type] = (activityCounts[problem.type] || 0) + 1

    const favorite = Object.entries(activityCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0] as ProblemType

    updatedProgress.favoriteActivity = favorite
    updatedProgress.lastActiveDate = new Date()

    // Update current session
    currentSession.problems.push(problem)
    currentSession.score = Math.round(
      (currentSession.problems.filter(p => p.isCorrect).length / currentSession.problems.length) * 100
    )

    setProgress(updatedProgress)
    saveProgress(updatedProgress)
  }

  const startSession = (): string => {
    const sessionId = `session-${Date.now()}`
    const newSession: Session = {
      id: sessionId,
      date: new Date(),
      duration: 0,
      problems: [],
      score: 0,
      streakCount: progress?.currentStreak || 0,
    }
    setCurrentSession(newSession)
    return sessionId
  }

  const endSession = (sessionId: string) => {
    if (!progress || !currentSession || currentSession.id !== sessionId) return

    currentSession.duration = Math.floor((Date.now() - new Date(currentSession.date).getTime()) / 1000)

    const updatedProgress = { ...progress }
    updatedProgress.sessions.push(currentSession)

    setProgress(updatedProgress)
    saveProgress(updatedProgress)
    setCurrentSession(null)

    checkAchievements()
  }

  const checkAchievements = (): Achievement[] => {
    if (!progress) return []

    const newAchievements: Achievement[] = []
    const now = new Date()

    // First Problem Achievement
    if (progress.totalProblems >= 1 && !progress.achievements.find(a => a.id === 'first-problem')) {
      newAchievements.push({
        id: 'first-problem',
        name: 'First Steps',
        description: 'Completed your first problem!',
        icon: '🌟',
        unlockedAt: now,
      })
    }

    // 10 Problems Achievement
    if (progress.totalProblems >= 10 && !progress.achievements.find(a => a.id === 'ten-problems')) {
      newAchievements.push({
        id: 'ten-problems',
        name: 'Problem Solver',
        description: 'Completed 10 problems!',
        icon: '🏆',
        unlockedAt: now,
      })
    }

    // Perfect Session Achievement
    const hasPerfectSession = progress.sessions.some(s => s.score === 100 && s.problems.length >= 5)
    if (hasPerfectSession && !progress.achievements.find(a => a.id === 'perfect-session')) {
      newAchievements.push({
        id: 'perfect-session',
        name: 'Perfect Score',
        description: 'Got 100% in a session!',
        icon: '💯',
        unlockedAt: now,
      })
    }

    // Streak Achievement
    if (progress.currentStreak >= 5 && !progress.achievements.find(a => a.id === 'streak-5')) {
      newAchievements.push({
        id: 'streak-5',
        name: 'On Fire',
        description: '5 correct answers in a row!',
        icon: '🔥',
        unlockedAt: now,
      })
    }

    if (newAchievements.length > 0) {
      const updatedProgress = { ...progress }
      updatedProgress.achievements.push(...newAchievements)
      setProgress(updatedProgress)
      saveProgress(updatedProgress)
    }

    return newAchievements
  }

  const resetProgress = () => {
    const newProgress = initializeProgress()
    setProgress(newProgress)
    saveProgress(newProgress)
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        addProblemAttempt,
        startSession,
        endSession,
        checkAchievements,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}