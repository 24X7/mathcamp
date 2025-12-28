// Math problem types
export type ProblemType =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'comparison'
  | 'fact-family'
  | 'word-problem'
  | 'counting'
  | 'counting-sequence'
  | 'pattern'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Problem {
  id: string
  type: ProblemType
  question: string
  correctAnswer: string | number
  options?: (string | number)[]
  visualAids?: VisualAid[]
  hint?: string
  difficulty: Difficulty
  timeLimit?: number // in seconds
}

export interface VisualAid {
  type: 'image' | 'shape' | 'number-line' | 'blocks' | 'pie' | 'pizza'
  data: any
  count?: number
  color?: string
}

// Progress tracking
export interface Session {
  id: string
  date: Date
  duration: number // in seconds
  problems: AttemptedProblem[]
  score: number
  streakCount: number
}

export interface AttemptedProblem extends Problem {
  userAnswer: string | number
  isCorrect: boolean
  timeSpent: number
  attempts: number
  hintsUsed: number
}

export interface UserProgress {
  userId: string
  totalProblems: number
  correctAnswers: number
  currentStreak: number
  longestStreak: number
  favoriteActivity: ProblemType
  sessions: Session[]
  achievements: Achievement[]
  lastActiveDate: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

// Settings
export interface Settings {
  soundEnabled: boolean
  musicEnabled: boolean
  animationSpeed: 'slow' | 'normal' | 'fast'
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'auto'
  difficulty: Difficulty
  problemCount: number
  timeMode: boolean
}

// Fact Family types
export interface FactFamily {
  numbers: [number, number, number] // [a, b, sum]
  operations: {
    addition1: string // a + b = sum
    addition2: string // b + a = sum
    subtraction1: string // sum - a = b
    subtraction2: string // sum - b = a
  }
}

// Word Problem types
export interface WordProblem {
  id: string
  story: string
  question: string
  answer: number
  theme: 'animals' | 'food' | 'toys' | 'nature' | 'school'
  visualContext?: {
    character?: string
    items?: string[]
    setting?: string
  }
}