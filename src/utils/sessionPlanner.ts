import { Difficulty } from '@/types'

export interface SessionPlan {
  [key: string]: any
}

/**
 * Generates a complete session plan for a given activity type
 * Ensures proper distribution and zero repetition within the session
 */
export const generateSessionPlan = (
  activityType: string,
  problemCount: number,
  difficulty: Difficulty
): SessionPlan[] => {
  switch (activityType) {
    case 'addition':
    case 'subtraction':
      return generateArithmeticPlan(problemCount, difficulty, activityType)
    case 'fact-family':
      return generateFactFamilyPlan(problemCount, difficulty)
    case 'word-problem':
      return generateWordProblemPlan(problemCount, difficulty)
    case 'counting':
      return generateCountingPlan(problemCount, difficulty)
    case 'counting-sequence':
      return generateCountingSequencePlan(problemCount, difficulty)
    default:
      return []
  }
}

// Arithmetic plan (Addition/Subtraction)
const generateArithmeticPlan = (
  problemCount: number,
  difficulty: Difficulty,
  type: string
): SessionPlan[] => {
  const plan: SessionPlan[] = []
  const usedAnswers = new Set<number>()

  let maxNum1: number, maxNum2: number
  if (difficulty === 'easy') {
    maxNum1 = 5
    maxNum2 = 5
  } else if (difficulty === 'medium') {
    maxNum1 = 10
    maxNum2 = 10
  } else {
    maxNum1 = 15
    maxNum2 = 10
  }

  for (let i = 0; i < problemCount; i++) {
    let planItem: SessionPlan | null = null
    let attempts = 0

    while (!planItem && attempts < 30) {
      const num1 = Math.floor(Math.random() * maxNum1) + 1
      const num2 = Math.floor(Math.random() * maxNum2) + 1

      let answer: number
      if (type === 'subtraction') {
        // Ensure positive result
        const larger = Math.max(num1, num2)
        const smaller = Math.min(num1, num2)
        answer = larger - smaller
      } else {
        answer = num1 + num2
      }

      if (!usedAnswers.has(answer)) {
        planItem = { num1, num2, answer }
        usedAnswers.add(answer)
      }
      attempts++
    }

    if (planItem) {
      plan.push(planItem)
    }
  }

  return plan
}

// Fact Family plan
const generateFactFamilyPlan = (problemCount: number, difficulty: Difficulty): SessionPlan[] => {
  const plan: SessionPlan[] = []
  const usedSums = new Set<number>()

  let maxNum: number
  if (difficulty === 'easy') {
    maxNum = 10
  } else if (difficulty === 'medium') {
    maxNum = 15
  } else {
    maxNum = 20
  }

  for (let i = 0; i < problemCount; i++) {
    let planItem: SessionPlan | null = null
    let attempts = 0

    while (!planItem && attempts < 30) {
      const num1 = Math.floor(Math.random() * maxNum) + 1
      const num2 = Math.floor(Math.random() * maxNum) + 1
      const sum = num1 + num2

      if (!usedSums.has(sum)) {
        planItem = { numbers: [num1, num2, sum] as [number, number, number] }
        usedSums.add(sum)
      }
      attempts++
    }

    if (planItem) {
      plan.push(planItem)
    }
  }

  return plan
}

// Word Problem plan
const generateWordProblemPlan = (problemCount: number, difficulty: Difficulty): SessionPlan[] => {
  const plan: SessionPlan[] = []
  const themes = ['animals', 'food', 'toys', 'nature', 'school']
  const operations = ['add', 'subtract', 'compare']
  const usedCombos = new Set<string>()

  for (let i = 0; i < problemCount; i++) {
    let planItem: SessionPlan | null = null
    let attempts = 0

    while (!planItem && attempts < 30) {
      const theme = themes[Math.floor(Math.random() * themes.length)]
      const operation = operations[Math.floor(Math.random() * operations.length)]
      const combo = `${theme}-${operation}`

      if (!usedCombos.has(combo)) {
        planItem = { theme, operation }
        usedCombos.add(combo)
      }
      attempts++
    }

    if (planItem) {
      plan.push(planItem)
    }
  }

  return plan
}

// Counting plan
const generateCountingPlan = (problemCount: number, difficulty: Difficulty): SessionPlan[] => {
  const plan: SessionPlan[] = []

  for (let i = 0; i < problemCount; i++) {
    // Counting generates randomly each time, but we'll create a plan slot for it
    const layout = difficulty === 'easy'
      ? ['line', 'scattered'][Math.floor(Math.random() * 2)]
      : difficulty === 'medium'
      ? ['line', 'scattered', 'grid'][Math.floor(Math.random() * 3)]
      : ['scattered', 'line', 'grid'][Math.floor(Math.random() * 3)]

    plan.push({ layout, index: i })
  }

  return plan
}

// Counting Sequence plan - Equal distribution with no back-to-back repeats
const generateCountingSequencePlan = (
  problemCount: number,
  difficulty: Difficulty
): SessionPlan[] => {
  const plan: SessionPlan[] = []
  const usedAnswers = new Set<number>()
  const allStepSizes = [1, 2, 5, 10]
  let lastStepSize: number | null = null

  for (let i = 0; i < problemCount; i++) {
    let planItem: SessionPlan | null = null
    let attempts = 0

    while (!planItem && attempts < 50) {
      // Get available step sizes (exclude the last one to prevent back-to-back)
      const availableSteps = lastStepSize !== null
        ? allStepSizes.filter(step => step !== lastStepSize)
        : allStepSizes

      // Randomly pick from available steps with equal probability
      const stepSize = availableSteps[Math.floor(Math.random() * availableSteps.length)]

      // Generate random start based on step size
      const maxStart = stepSize === 1 ? 50 : stepSize === 2 ? 40 : stepSize === 5 ? 30 : 20
      const startNum = Math.floor(Math.random() * maxStart) + 1

      // Calculate correct answer
      const sequenceLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6
      let lastNum = startNum
      for (let j = 0; j < sequenceLength; j++) {
        lastNum = startNum + j * stepSize
      }
      const correctAnswer = lastNum + stepSize

      // Check if this answer hasn't been used before
      if (!usedAnswers.has(correctAnswer)) {
        planItem = { stepSize, startNum, correctAnswer }
        usedAnswers.add(correctAnswer)
        lastStepSize = stepSize
      }

      attempts++
    }

    if (planItem) {
      plan.push(planItem)
    }
  }

  return plan
}
