import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WordProblem } from '@/types'

interface WordProblemGeneratorProps {
  problem: WordProblem
  onAnswer: (answer: number, isCorrect: boolean) => void
}

export const WordProblemGenerator: React.FC<WordProblemGeneratorProps> = ({ problem, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // Generate answer options
  const generateOptions = () => {
    const options = [problem.answer]
    while (options.length < 4) {
      const wrongAnswer = problem.answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
      if (wrongAnswer >= 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer)
      }
    }
    return options.sort(() => Math.random() - 0.5)
  }

  const [options, setOptions] = useState<number[]>(() => generateOptions())

  useEffect(() => {
    setOptions(generateOptions())
    setSelectedAnswer(null)
    setShowFeedback(false)
  }, [problem.id])

  const handleAnswer = (answer: number) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    const isCorrect = answer === problem.answer

    setTimeout(() => {
      onAnswer(answer, isCorrect)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }, 2000)
  }

  const getThemeEmoji = () => {
    switch (problem.theme) {
      case 'animals': return '🐶'
      case 'food': return '🍕'
      case 'toys': return '🧸'
      case 'nature': return '🌳'
      case 'school': return '📚'
      default: return '✨'
    }
  }

  const getThemeColor = () => {
    switch (problem.theme) {
      case 'animals': return 'from-yellow-100 to-orange-100'
      case 'food': return 'from-red-100 to-pink-100'
      case 'toys': return 'from-purple-100 to-blue-100'
      case 'nature': return 'from-green-100 to-emerald-100'
      case 'school': return 'from-blue-100 to-indigo-100'
      default: return 'from-gray-100 to-gray-200'
    }
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
            {getThemeEmoji()}
          </motion.div>

          <h2 className="text-3xl font-heading font-bold text-primary-600 mb-6">
            Story Problem
          </h2>

          {/* Story container */}
          <motion.div
            className={`bg-gradient-to-br ${getThemeColor()} rounded-2xl p-6 mb-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl font-body text-gray-800 leading-relaxed mb-4">
              {problem.story}
            </p>
            <p className="text-2xl font-bold text-primary-700">
              {problem.question}
            </p>
          </motion.div>

          {/* Visual context hints */}
          {problem.visualContext && (
            <div className="flex justify-center gap-4 mb-6">
              {problem.visualContext.items?.map((item, index) => (
                <motion.div
                  key={index}
                  className="text-3xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          )}

          {/* Answer options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === problem.answer
              const showResult = showFeedback && isSelected

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
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
                selectedAnswer === problem.answer
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedAnswer === problem.answer
                ? 'Wonderful! You solved the story!'
                : `Good try! The answer is ${problem.answer}`}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}