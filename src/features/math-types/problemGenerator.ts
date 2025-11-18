import { Problem, Difficulty, ProblemType } from '@/types'

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

  // Generate wrong options
  const options = [answer]
  while (options.length < 4) {
    const wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
    if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5)

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

  // Generate wrong options
  const options = [answer]
  while (options.length < 4) {
    const wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
    if (wrongAnswer >= 0 && !options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5)

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

export const generateProblem = (type: ProblemType, difficulty: Difficulty): Problem => {
  switch (type) {
    case 'addition':
      return generateAdditionProblem(difficulty)
    case 'subtraction':
      return generateSubtractionProblem(difficulty)
    case 'comparison':
      return generateComparisonProblem(difficulty)
    default:
      return generateAdditionProblem(difficulty)
  }
}