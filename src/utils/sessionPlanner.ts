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

// Counting Sequence plan - Ensure variety and proper starting numbers
const generateCountingSequencePlan = (
  problemCount: number,
  difficulty: Difficulty
): SessionPlan[] => {
  const plan: SessionPlan[] = []
  const usedAnswers = new Set<number>()
  const stepSizeCounts: Record<number, number> = { 2: 0, 3: 0, 5: 0, 10: 0 }

  for (let i = 0; i < problemCount; i++) {
    let planItem: SessionPlan | null = null
    let attempts = 0

    while (!planItem && attempts < 50) {
      let stepSize: number

      if (difficulty === 'easy') {
        // Easy: 1s and 2s
        stepSize = Math.random() < 0.3 ? 1 : 2
      } else if (difficulty === 'medium') {
        // Medium: Ensure at least one of each 2, 3, 5
        const needsStepSize = [2, 3, 5].find(s => stepSizeCounts[s] === 0 && plan.length < problemCount - 1)
        if (needsStepSize && i < problemCount - 2) {
          stepSize = needsStepSize
        } else {
          const stepChance = Math.random()
          stepSize = stepChance < 0.15 ? 1 : stepChance < 0.35 ? 2 : stepChance < 0.55 ? 3 : 5
        }
      } else {
        // Hard: Ensure at least one of each 2, 3, 5, 10
        const needsStepSize = [2, 3, 5, 10].find(s => stepSizeCounts[s] === 0 && plan.length < problemCount - 1)
        if (needsStepSize && i < problemCount - 3) {
          stepSize = needsStepSize
        } else {
          const stepChance = Math.random()
          stepSize = stepChance < 0.1 ? 1 : stepChance < 0.25 ? 2 : stepChance < 0.4 ? 3 : stepChance < 0.65 ? 5 : 10
        }
      }

      // Generate random start based on step size with PROPER starting numbers
      let startNum: number

      if (stepSize === 2) {
        // For counting by 2s, always start with an even number
        const maxStart = 40
        const randomEven = Math.floor(Math.random() * (maxStart / 2)) * 2 + 2 // 2, 4, 6, 8, etc.
        startNum = randomEven
      } else if (stepSize === 3) {
        // For counting by 3s, always start with a number ending in 0, 3, 6, or 9
        const validStarts = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30]
        startNum = validStarts[Math.floor(Math.random() * validStarts.length)]
      } else if (stepSize === 5) {
        // For counting by 5s, always start with a number ending in 0 or 5
        const validStarts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
        startNum = validStarts[Math.floor(Math.random() * validStarts.length)]
      } else if (stepSize === 10) {
        // For counting by 10s, always start with a number ending in 0 or 5
        const validStarts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
        startNum = validStarts[Math.floor(Math.random() * validStarts.length)]
      } else {
        // For counting by 1s, any number is fine
        const maxStart = 50
        startNum = Math.floor(Math.random() * maxStart) + 1
      }

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

        // Track step size counts
        if (stepSize in stepSizeCounts) {
          stepSizeCounts[stepSize]++
        }
      }

      attempts++
    }

    if (planItem) {
      plan.push(planItem)
    }
  }

  return plan
}
