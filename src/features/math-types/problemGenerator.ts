import { Problem, Difficulty, ProblemType } from '@/types'
import { generateAnswerOptions } from '@/utils/generateAnswerOptions'

export const generateAdditionProblem = (difficulty: Difficulty): Problem => {
  let max1, max2

  switch (difficulty) {
    case 'easy':
      max1 = 5
      max2 = 5
      break
    case 'medium':
      max1 = 10
      max2 = 10
      break
    case 'hard':
      max1 = 15
      max2 = 15
      break
  }

  const num1 = Math.floor(Math.random() * max1) + 1
  const num2 = Math.floor(Math.random() * max2) + 1
  const answer = num1 + num2

  // Generate validated answer options
  const { options, isValid } = generateAnswerOptions(answer, 4, 1)
  
  // Regenerate problem if valid options couldn't be generated
  if (!isValid) {
    return generateAdditionProblem(difficulty)
  }

  return {
    id: `add-${Date.now()}-${Math.random()}`,
    type: 'addition',
    question: `${num1} + ${num2}`,
    correctAnswer: answer,
    options,
    difficulty,
    hint: `Count ${num1} objects, then add ${num2} more!`,
  }
}

export const generateSubtractionProblem = (difficulty: Difficulty): Problem => {
  let max1, max2

  switch (difficulty) {
    case 'easy':
      max1 = 10
      max2 = 5
      break
    case 'medium':
      max1 = 15
      max2 = 10
      break
    case 'hard':
      max1 = 20
      max2 = 15
      break
  }

  let num1 = Math.floor(Math.random() * max1) + 1
  let num2 = Math.floor(Math.random() * max2) + 1

  // Ensure num1 > num2 for positive result
  if (num2 > num1) {
    [num1, num2] = [num2, num1]
  }

  const answer = num1 - num2

  // Generate validated answer options (minValue=0 since subtraction can result in 0)
  const { options, isValid } = generateAnswerOptions(answer, 4, 0)
  
  // Regenerate problem if valid options couldn't be generated
  if (!isValid) {
    return generateSubtractionProblem(difficulty)
  }

  return {
    id: `sub-${Date.now()}-${Math.random()}`,
    type: 'subtraction',
    question: `${num1} - ${num2}`,
    correctAnswer: answer,
    options,
    difficulty,
    hint: `Start with ${num1} objects and take away ${num2}!`,
  }
}

export const generateComparisonProblem = (difficulty: Difficulty): Problem => {
  let max

  switch (difficulty) {
    case 'easy':
      max = 10
      break
    case 'medium':
      max = 20
      break
    case 'hard':
      max = 50
      break
  }

  const num1 = Math.floor(Math.random() * max) + 1
  const num2 = Math.floor(Math.random() * max) + 1

  let correctAnswer
  if (num1 > num2) {
    correctAnswer = '>'
  } else if (num1 < num2) {
    correctAnswer = '<'
  } else {
    correctAnswer = '='
  }

  return {
    id: `comp-${Date.now()}-${Math.random()}`,
    type: 'comparison',
    question: `${num1} ? ${num2}`,
    correctAnswer,
    options: ['>', '<', '='],
    difficulty,
    hint: 'Which number is bigger? Use > for bigger, < for smaller, = for same!',
  }
}

export const generateMultiplicationProblem = (difficulty: Difficulty): Problem => {
  let max1, max2

  // Keep factors small for 1st graders learning multiplication
  switch (difficulty) {
    case 'easy':
      max1 = 5  // 1-5
      max2 = 3  // 1-3 (results up to 15)
      break
    case 'medium':
      max1 = 6  // 1-6
      max2 = 5  // 1-5 (results up to 30)
      break
    case 'hard':
      max1 = 10 // 1-10
      max2 = 6  // 1-6 (results up to 60)
      break
  }

  const num1 = Math.floor(Math.random() * max1) + 1
  const num2 = Math.floor(Math.random() * max2) + 1
  const answer = num1 * num2

  // Generate validated answer options
  const { options, isValid } = generateAnswerOptions(answer, 4, 1)
  
  // Regenerate problem if valid options couldn't be generated
  if (!isValid) {
    return generateMultiplicationProblem(difficulty)
  }

  return {
    id: `mul-${Date.now()}-${Math.random()}`,
    type: 'multiplication',
    question: `${num1} × ${num2}`,
    correctAnswer: answer,
    options,
    difficulty,
    hint: `Think of ${num1} groups with ${num2} items in each group!`,
  }
}

export const generateDivisionProblem = (difficulty: Difficulty): Problem => {
  let maxDivisor, maxQuotient

  // Generate division problems that have clean whole number answers
  switch (difficulty) {
    case 'easy':
      maxDivisor = 3   // Divide by 1-3
      maxQuotient = 5  // Results up to 5
      break
    case 'medium':
      maxDivisor = 5   // Divide by 1-5
      maxQuotient = 8  // Results up to 8
      break
    case 'hard':
      maxDivisor = 6   // Divide by 1-6
      maxQuotient = 10 // Results up to 10
      break
  }

  // Generate divisor and quotient first, then calculate dividend
  // This ensures we always get clean whole number answers
  const divisor = Math.floor(Math.random() * maxDivisor) + 1
  const answer = Math.floor(Math.random() * maxQuotient) + 1
  const dividend = divisor * answer

  // Generate validated answer options
  const { options, isValid } = generateAnswerOptions(answer, 4, 1)
  
  // Regenerate problem if valid options couldn't be generated
  if (!isValid) {
    return generateDivisionProblem(difficulty)
  }

  return {
    id: `div-${Date.now()}-${Math.random()}`,
    type: 'division',
    question: `${dividend} ÷ ${divisor}`,
    correctAnswer: answer,
    options,
    difficulty,
    hint: `If you have ${dividend} items and share equally into ${divisor} groups, how many in each group?`,
  }
}

export const generateProblem = (type: ProblemType, difficulty: Difficulty): Problem => {
  switch (type) {
    case 'addition':
      return generateAdditionProblem(difficulty)
    case 'subtraction':
      return generateSubtractionProblem(difficulty)
    case 'multiplication':
      return generateMultiplicationProblem(difficulty)
    case 'division':
      return generateDivisionProblem(difficulty)
    case 'comparison':
      return generateComparisonProblem(difficulty)
    default:
      return generateAdditionProblem(difficulty)
  }
}