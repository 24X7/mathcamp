import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FactFamily } from '@/types'
import { Check, X } from 'lucide-react'

interface FactFamilyHouseProps {
  family: FactFamily
  onComplete: (correct: boolean) => void
}

interface FactEquation {
  id: string
  label: string
  operation: 'addition1' | 'addition2' | 'subtraction1' | 'subtraction2'
  parts: {
    firstNum: number
    operator: '+' | '-'
    secondNum: number
  }
  answer: number
}

export const FactFamilyHouse: React.FC<FactFamilyHouseProps> = ({ family, onComplete }) => {
  const { numbers } = family
  const [num1, num2, sum] = numbers
  const [isComplete, setIsComplete] = useState(false)

  // Create all four equations that need to be filled in
  const equations: FactEquation[] = [
    {
      id: 'add1',
      label: 'First Addition',
      operation: 'addition1',
      parts: { firstNum: num1, operator: '+', secondNum: num2 },
      answer: sum,
    },
    {
      id: 'add2',
      label: 'Commutative Addition',
      operation: 'addition2',
      parts: { firstNum: num2, operator: '+', secondNum: num1 },
      answer: sum,
    },
    {
      id: 'sub1',
      label: 'First Subtraction',
      operation: 'subtraction1',
      parts: { firstNum: sum, operator: '-', secondNum: num1 },
      answer: num2,
    },
    {
      id: 'sub2',
      label: 'Second Subtraction',
      operation: 'subtraction2',
      parts: { firstNum: sum, operator: '-', secondNum: num2 },
      answer: num1,
    },
  ]

  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({
    add1: '',
    add2: '',
    sub1: '',
    sub2: '',
  })

  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean | null>>({
    add1: null,
    add2: null,
    sub1: null,
    sub2: null,
  })

  // Reset state when family changes (new problem)
  useEffect(() => {
    setUserAnswers({
      add1: '',
      add2: '',
      sub1: '',
      sub2: '',
    })
    setCheckedAnswers({
      add1: null,
      add2: null,
      sub1: null,
      sub2: null,
    })
    setIsComplete(false)
  }, [family.numbers[0], family.numbers[1], family.numbers[2]])

  const handleInputChange = (id: string, value: string) => {
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setUserAnswers(prev => ({ ...prev, [id]: value }))
      // Reset check state when user modifies answer
      setCheckedAnswers(prev => ({ ...prev, [id]: null }))
    }
  }

  const checkAnswer = (id: string) => {
    const equation = equations.find(e => e.id === id)
    if (!equation) return

    const userAnswer = parseInt(userAnswers[id])
    if (!userAnswer && userAnswer !== 0) return // Don't check if empty

    const isCorrect = userAnswer === equation.answer

    if (!isCorrect) {
      // Mark as wrong but allow them to try again
      setCheckedAnswers(prev => ({ ...prev, [id]: false }))
      return
    }

    // Mark as correct
    setCheckedAnswers(prev => ({ ...prev, [id]: true }))
  }

  const handleDoneClick = () => {
    // Verify all answers are correct
    const allCorrect = equations.every(equation => {
      const userAnswer = parseInt(userAnswers[equation.id])
      return userAnswer === equation.answer
    })

    if (allCorrect) {
      setIsComplete(true)
      setTimeout(() => onComplete(true), 1500)
    }
  }

  // Simple check: all answers filled in and all are mathematically correct
  const areAllAnswersCorrect = equations.every(equation => {
    const userAnswer = userAnswers[equation.id]
    if (userAnswer === '') return false // Not filled in
    return parseInt(userAnswer) === equation.answer // Is correct
  })

  const handleKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      checkAnswer(id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card variant="gradient" padding="large">
        <div className="text-center">
          <h2 className="text-3xl font-heading font-bold text-primary-600 mb-6">
            Fact Family House
          </h2>

          {/* House visualization */}
          <div className="relative mx-auto mb-8" style={{ width: '100%', maxWidth: '400px' }}>
            {/* Roof - Contains the sum */}
            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid meet">
                <polygon
                  points="150,10 10,140 290,140"
                  fill="#f97316"
                  stroke="#ea580c"
                  strokeWidth="4"
                />
              </svg>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-accent-600">{sum}</span>
              </div>
            </motion.div>

            {/* House body */}
            <motion.div
              className="bg-yellow-300 border-4 border-yellow-400 rounded-lg mx-auto"
              style={{ width: '280px', height: '200px' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Windows with numbers */}
              <div className="flex justify-around pt-6 px-4">
                <motion.div
                  className="bg-blue-300 border-4 border-blue-400 rounded-lg w-20 h-20 flex items-center justify-center shadow-md"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-2xl font-bold text-white">{num1}</span>
                </motion.div>
                <motion.div
                  className="bg-green-300 border-4 border-green-400 rounded-lg w-20 h-20 flex items-center justify-center shadow-md"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-2xl font-bold text-white">{num2}</span>
                </motion.div>
              </div>

              {/* Door with instruction */}
              <div className="mt-4 flex justify-center">
                <div className="bg-red-400 border-4 border-red-500 rounded-t-3xl w-24 h-28 flex items-center justify-center">
                  <div className="text-center text-xs font-bold text-white px-2">
                    Fill in the answers below!
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Fact family equations with input fields */}
          <div className="space-y-4 mb-8">
            {equations.map((equation, index) => {
              const isAnswered = userAnswers[equation.id] !== ''
              const isChecked = checkedAnswers[equation.id] !== null
              const isCorrect = checkedAnswers[equation.id] === true
              const isWrong = checkedAnswers[equation.id] === false

              return (
                <motion.div
                  key={equation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`bg-white/90 rounded-2xl py-4 px-6 border-4 transition-all ${
                    isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isWrong
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-4">
                      {/* First number */}
                      <div className="bg-blue-100 rounded-lg px-6 py-3">
                        <span className="text-3xl font-bold text-blue-700">
                          {equation.parts.firstNum}
                        </span>
                      </div>

                      {/* Operator */}
                      <div className="text-4xl font-bold text-gray-700">
                        {equation.parts.operator}
                      </div>

                      {/* Second number */}
                      <div className="bg-green-100 rounded-lg px-6 py-3">
                        <span className="text-3xl font-bold text-green-700">
                          {equation.parts.secondNum}
                        </span>
                      </div>

                      {/* Equals sign */}
                      <div className="text-4xl font-bold text-gray-700">=</div>

                      {/* Input field */}
                      <input
                        type="text"
                        value={userAnswers[equation.id]}
                        onChange={(e) => handleInputChange(equation.id, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, equation.id)}
                        placeholder="?"
                        className={`w-16 h-16 text-3xl font-bold text-center rounded-lg border-4 focus:outline-none transition-all ${
                          isCorrect
                            ? 'bg-green-300 border-green-600 text-green-800'
                            : isWrong
                            ? 'bg-red-300 border-red-600 text-red-800'
                            : 'bg-yellow-100 border-yellow-400 text-gray-800 focus:border-yellow-600'
                        }`}
                        disabled={isCorrect}
                      />
                    </div>

                    {/* Feedback only - no check button needed */}
                    {(isCorrect || isWrong) && (
                      <div className="flex items-center justify-center gap-4 mt-2">
                        {isCorrect && (
                          <motion.div
                            className="flex items-center gap-2 text-green-600 font-bold text-lg"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          >
                            <Check size={24} />
                            Correct!
                          </motion.div>
                        )}

                        {isWrong && (
                          <motion.div
                            className="flex items-center gap-2 text-red-600 font-bold text-lg"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                          >
                            <X size={24} />
                            Try again!
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Success message */}
          {isComplete && (
            <motion.div
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-3xl font-heading font-bold text-green-600 mb-2">
                Perfect! You mastered the family!
              </h3>
              <p className="text-lg text-gray-700">
                These four facts are all connected through {num1}, {num2}, and {sum}!
              </p>
            </motion.div>
          )}

          {/* Progress indicator and Done button */}
          {!isComplete && (
            <div className="mt-8 text-center space-y-4">
              <p className="text-lg text-gray-600">
                Equations completed: {Object.values(checkedAnswers).filter(v => v === true).length}/4
              </p>
              <p className="text-sm text-gray-500">
                💡 Hint: Type your answer and press Enter to check!
              </p>

              {/* Done button - only enabled when all are correct */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant={areAllAnswersCorrect ? "success" : "ghost"}
                  size="huge"
                  onClick={handleDoneClick}
                  disabled={!areAllAnswersCorrect}
                  className={`text-2xl font-bold w-full ${
                    areAllAnswersCorrect
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-gray-600 bg-gray-200'
                  }`}
                >
                  {areAllAnswersCorrect ? '✓ Done - All Correct!' : '⏳ Fill in all answers...'}
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}