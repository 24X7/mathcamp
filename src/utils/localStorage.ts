import { UserProgress, Settings } from '@/types'

const STORAGE_KEYS = {
  PROGRESS: 'mathcamp_progress',
  SETTINGS: 'mathcamp_settings',
  USER_ID: 'mathcamp_user_id',
} as const

// Generate or retrieve user ID
export const getUserId = (): string => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

// Progress management
export const getProgress = (): UserProgress | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading progress:', error)
    return null
  }
}

export const saveProgress = (progress: UserProgress): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
    return true
  } catch (error) {
    console.error('Error saving progress:', error)
    return false
  }
}

export const initializeProgress = (): UserProgress => {
  const userId = getUserId()
  const initialProgress: UserProgress = {
    userId,
    totalProblems: 0,
    correctAnswers: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteActivity: 'counting',
    sessions: [],
    achievements: [],
    lastActiveDate: new Date(),
  }
  saveProgress(initialProgress)
  return initialProgress
}

// Settings management
export const getSettings = (): Settings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }

  // Return default settings
  return {
    soundEnabled: true,
    musicEnabled: false,
    animationSpeed: 'normal',
    fontSize: 'medium',
    theme: 'light',
    difficulty: 'easy',
    problemCount: 10,
    timeMode: false,
  }
}

export const saveSettings = (settings: Settings): boolean => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}

// Clear all data (for debugging/reset)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PROGRESS)
  localStorage.removeItem(STORAGE_KEYS.SETTINGS)
  localStorage.removeItem(STORAGE_KEYS.USER_ID)
}