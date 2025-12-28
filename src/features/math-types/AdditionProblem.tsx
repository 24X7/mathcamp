import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedNumber } from '@/components/animations/AnimatedNumber'
import { Problem } from '@/types'

interface AdditionProblemProps {
  problem: Problem
  onAnswer: (answer: number, isCorrect: boolean) => void
}

export const AdditionProblem: React.FC<AdditionProblemProps> = ({ problem, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Parse the problem - detect operation type from the question string
  const detectOperation = () => {
    if (problem.question.includes('×')) return { op: '×', type: 'multiplication' as const }
    if (problem.question.includes('÷')) return { op: '÷', type: 'division' as const }
    if (problem.question.includes('-')) return { op: '-', type: 'subtraction' as const }
    return { op: '+', type: 'addition' as const }
  }
  
  const { op, type: operationType } = detectOperation()
  const parts = problem.question.split(op).map(p => parseInt(p.trim()))
  const num1 = parts[0]
  const num2 = parts[1]
  
  // Get title based on operation type
  const getTitle = () => {
    switch (operationType) {
      case 'multiplication': return "Let's Multiply!"
      case 'division': return "Let's Divide!"
      case 'subtraction': return "Let's Subtract!"
      default: return "Let's Add!"
    }
  }

  // Cleanup timeout on unmount to prevent navigation after user leaves
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    const isCorrect = answer === problem.correctAnswer

    // Wait longer for wrong answers to show feedback (2.5s), faster for correct (1.5s)
    timeoutRef.current = setTimeout(() => {
      onAnswer(answer, isCorrect)
      setSelectedAnswer(null)
      setShowFeedback(false)
      timeoutRef.current = null
    }, isCorrect ? 1500 : 2500)
  }


  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card variant="gradient" padding="large">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-heading font-bold text-primary-600 mb-4">
            {getTitle()}
          </h2>

          {/* Horizontal format for larger screens (md and up) */}
          <div className="hidden md:flex justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
            <AnimatedNumber value={num1 ?? 0} size="huge" color="text-primary-500" />
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-600">{op}</span>
            <AnimatedNumber value={num2 ?? 0} size="huge" color="text-secondary-500" />
            <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-600">=</span>

            {/* Show selected answer or ? */}
            <div className="relative inline-flex items-center gap-3">
              <div className="relative inline-block">
                <motion.span
                  key={selectedAnswer ?? 'question'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-4xl sm:text-5xl md:text-6xl font-bold ${
                    selectedAnswer === null
                      ? 'text-accent-500'
                      : showFeedback && selectedAnswer === problem.correctAnswer
                      ? 'text-green-600'
                      : showFeedback
                      ? 'text-red-600'
                      : 'text-accent-500'
                  }`}
                >
                  {selectedAnswer ?? '?'}
                </motion.span>

                {/* Red X directly on top of wrong answer */}
                {showFeedback && selectedAnswer !== problem.correctAnswer && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl md:text-7xl text-red-600 font-black"
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
                  >
                    ✗
                  </motion.div>
                )}
              </div>

              {/* Show correct answer in green circle for wrong attempts */}
              {showFeedback && selectedAnswer !== problem.correctAnswer && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center flex-shrink-0">
                    {/* Correct answer number appears first */}
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-700 relative z-10"
                    >
                      {problem.correctAnswer}
                    </motion.span>

                    {/* Circle draws around it */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="#22c55e"
                        strokeWidth="4"
                        fill="rgba(34, 197, 94, 0.1)"
                        initial={{ pathLength: 0, rotate: -90 }}
                        animate={{ pathLength: 1, rotate: 0 }}
                        transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
                        style={{ transformOrigin: 'center' }}
                      />
                    </motion.svg>

                    {/* Checkmark appears last */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-2xl sm:text-3xl"
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Vertical format for mobile (< md) */}
          <div className="md:hidden flex flex-col items-center mb-6 sm:mb-8">
            {/* First number (top) */}
            <motion.div
              className="flex items-center justify-end w-48"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AnimatedNumber value={num1 ?? 0} size="huge" color="text-primary-500" />
            </motion.div>

            {/* Operator and second number */}
            <motion.div
              className="flex items-center justify-end w-48 mt-2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-4xl sm:text-5xl font-bold text-gray-600 mr-2">{op}</span>
              <AnimatedNumber value={num2 ?? 0} size="huge" color="text-secondary-500" />
            </motion.div>

            {/* Horizontal line */}
            <motion.div
              className="w-48 border-t-4 border-gray-700 my-3"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            />

            {/* Answer area */}
            <div className="relative flex items-center justify-center w-48 gap-3">
              <div className="relative inline-block">
                <motion.span
                  key={selectedAnswer ?? 'question'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-4xl sm:text-5xl font-bold ${
                    selectedAnswer === null
                      ? 'text-accent-500'
                      : showFeedback && selectedAnswer === problem.correctAnswer
                      ? 'text-green-600'
                      : showFeedback
                      ? 'text-red-600'
                      : 'text-accent-500'
                  }`}
                >
                  {selectedAnswer ?? '?'}
                </motion.span>

                {/* Red X directly on top of wrong answer */}
                {showFeedback && selectedAnswer !== problem.correctAnswer && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl text-red-600 font-black"
                    style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
                  >
                    ✗
                  </motion.div>
                )}
              </div>

              {/* Show correct answer in green circle for wrong attempts - to the right */}
              {showFeedback && selectedAnswer !== problem.correctAnswer && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                    {/* Correct answer number appears first */}
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="text-3xl sm:text-4xl font-bold text-green-700 relative z-10"
                    >
                      {problem.correctAnswer}
                    </motion.span>

                    {/* Circle draws around it */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="35"
                        stroke="#22c55e"
                        strokeWidth="4"
                        fill="rgba(34, 197, 94, 0.1)"
                        initial={{ pathLength: 0, rotate: -90 }}
                        animate={{ pathLength: 1, rotate: 0 }}
                        transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
                        style={{ transformOrigin: 'center' }}
                      />
                    </motion.svg>

                    {/* Checkmark appears last */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                      className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-2xl sm:text-3xl"
                    >
                      ✓
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>


          {/* Answer options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {problem.options?.map((option) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === problem.correctAnswer
              const showResult = showFeedback && isSelected

              return (
                <motion.div
                  key={option}
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
                    onClick={() => !showFeedback && handleAnswer(Number(option))}
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
                selectedAnswer === problem.correctAnswer
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedAnswer === problem.correctAnswer
                ? 'Great job! That\'s correct!'
                : `Nice try! The answer is ${problem.correctAnswer}`}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}