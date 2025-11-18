import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Difficulty } from '@/types'

interface SequencePlan {
  stepSize: number
  startNum: number
  correctAnswer: number
}

interface CountingSequenceProps {
  difficulty: Difficulty
  problemCount: number
  currentProblemIndex: number
  sessionPlan?: any[]
  onAnswer: (answer: number, isCorrect: boolean) => void
}

// Generate a complete plan for the entire session at once
const generateSessionPlan = (problemCount: number, difficulty: Difficulty): SequencePlan[] => {
  const plan: SequencePlan[] = []
  const usedAnswers = new Set<number>()
  const stepSizeCounts: Record<number, number> = { 2: 0, 3: 0, 5: 0, 10: 0 }

  for (let i = 0; i < problemCount; i++) {
    let planItem: SequencePlan | null = null
    let attempts = 0
    const maxAttempts = 50

    // Try to find a unique sequence
    while (!planItem && attempts < maxAttempts) {
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

      // Generate random start based on step size
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

      // Check if this answer is unique
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

export const CountingSequence: React.FC<CountingSequenceProps> = ({
  difficulty,
  problemCount,
  currentProblemIndex,
  sessionPlan: passedSessionPlan,
  onAnswer,
}) => {
  // Use passed sessionPlan if available, otherwise generate our own
  const [sessionPlan] = useState<SequencePlan[]>(() =>
    passedSessionPlan && passedSessionPlan.length > 0
      ? passedSessionPlan
      : generateSessionPlan(problemCount, difficulty)
  )
  const [sequence, setSequence] = useState<number[]>([])
  const [stepSize, setStepSize] = useState(1)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [options, setOptions] = useState<number[]>([])

  useEffect(() => {
    if (sessionPlan.length > 0 && currentProblemIndex < sessionPlan.length) {
      generateSequenceFromPlan()
    }
  }, [currentProblemIndex, sessionPlan])

  const generateSequenceFromPlan = () => {
    const plan = sessionPlan[currentProblemIndex]
    const sequenceLength = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6
    const newSequence: number[] = []

    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push(plan.startNum + i * plan.stepSize)
    }

    setStepSize(plan.stepSize)
    setSequence(newSequence)

    // Generate answer options
    const correctAnswer = plan.correctAnswer
    const answerOptions = [correctAnswer]

    // Create wrong answers based on common mistakes
    const wrongAnswerCandidates: number[] = []

    // Common mistake 1: Off by step size
    wrongAnswerCandidates.push(correctAnswer - plan.stepSize)
    wrongAnswerCandidates.push(correctAnswer + plan.stepSize * 2)

    // Common mistake 2: Using last number instead of next
    wrongAnswerCandidates.push(newSequence[newSequence.length - 1])

    // Common mistake 3: Off by 1
    wrongAnswerCandidates.push(correctAnswer - 1)
    wrongAnswerCandidates.push(correctAnswer + 1)

    // Common mistake 4: Half or double the step
    if (plan.stepSize > 1) {
      wrongAnswerCandidates.push(correctAnswer - Math.floor(plan.stepSize / 2))
    }

    // Pick 3 unique wrong answers
    const uniqueWrongAnswers = new Set<number>()
    wrongAnswerCandidates.forEach(answer => {
      if (answer > 0 && answer !== correctAnswer && uniqueWrongAnswers.size < 3) {
        uniqueWrongAnswers.add(answer)
      }
    })

    // If we don't have enough, add random ones
    while (uniqueWrongAnswers.size < 3) {
      const randomWrong = Math.floor(Math.random() * (correctAnswer * 1.5)) + 1
      if (randomWrong !== correctAnswer && !uniqueWrongAnswers.has(randomWrong)) {
        uniqueWrongAnswers.add(randomWrong)
      }
    }

    const allAnswers = [correctAnswer, ...Array.from(uniqueWrongAnswers)]
    setOptions(allAnswers.sort(() => Math.random() - 0.5))
  }

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    const correctAnswer = sessionPlan[currentProblemIndex].correctAnswer
    const isCorrect = answer === correctAnswer

    setTimeout(() => {
      onAnswer(answer, isCorrect)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }, 2000)
  }

  if (!sessionPlan || currentProblemIndex >= sessionPlan.length) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card variant="gradient" padding="large">
        <div className="text-center">
          <motion.div
            className="inline-block text-6xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            🔢
          </motion.div>

          <h2 className="text-3xl font-heading font-bold text-primary-600 mb-6">
            What Comes Next?
          </h2>

          {/* Sequence display */}
          <motion.div
            className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {sequence.map((num, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-lg p-6 min-w-16"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-4xl font-bold text-primary-600">{num}</span>
                </motion.div>
              ))}
              <motion.div
                className="text-4xl font-bold text-primary-400"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: sequence.length * 0.1 }}
              >
                ?
              </motion.div>
            </div>
          </motion.div>

          {/* Answer options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const correctAnswer = sessionPlan[currentProblemIndex].correctAnswer
              const isCorrect = option === correctAnswer
              const showResult = showFeedback && isSelected

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={
                      showResult
                        ? isCorrect
                          ? 'success'
                          : 'error'
                        : 'primary'
                    }
                    size="large"
                    onClick={() => !showFeedback && handleAnswer(option)}
                    disabled={showFeedback}
                    className={`w-full text-white text-3xl font-bold ${
                      showResult && !isCorrect ? 'animate-shake' : ''
                    } ${showResult && isCorrect ? 'animate-pop' : ''}`}
                  >
                    {option}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {showFeedback && (
            <motion.div
              className={`mt-6 text-2xl font-bold ${
                selectedAnswer === sessionPlan[currentProblemIndex].correctAnswer
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedAnswer === sessionPlan[currentProblemIndex].correctAnswer
                ? 'Wonderful! Great counting!'
                : `Good try! The answer is ${sessionPlan[currentProblemIndex].correctAnswer}`}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
