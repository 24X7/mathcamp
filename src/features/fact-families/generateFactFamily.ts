import { FactFamily, Difficulty } from '@/types'

export const generateFactFamily = (difficulty: Difficulty): FactFamily => {
  let maxNum: number

  switch (difficulty) {
    case 'easy':
      maxNum = 10
      break
    case 'medium':
      maxNum = 15
      break
    case 'hard':
      maxNum = 20
      break
  }

  // Generate two numbers that sum to a reasonable value
  const num1 = Math.floor(Math.random() * (maxNum / 2)) + 1
  const num2 = Math.floor(Math.random() * (maxNum / 2)) + 1
  const sum = num1 + num2

  return {
    numbers: [num1, num2, sum],
    operations: {
      addition1: `${num1} + ${num2} = ${sum}`,
      addition2: `${num2} + ${num1} = ${sum}`,
      subtraction1: `${sum} - ${num1} = ${num2}`,
      subtraction2: `${sum} - ${num2} = ${num1}`,
    },
  }
}