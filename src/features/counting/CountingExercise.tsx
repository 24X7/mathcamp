import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Difficulty } from '@/types'

interface CountingExerciseProps {
  difficulty: Difficulty
  onAnswer: (answer: number, isCorrect: boolean) => void
}

interface CountableItem {
  id: string
  type: 'pizza' | 'pie' | 'cookie' | 'star' | 'heart' | 'flower' | 'apple' | 'banana'
  color: string
  position: { x: number; y: number }
  isTarget: boolean
}

type LayoutType = 'scattered' | 'line' | 'grid'

export const CountingExercise: React.FC<CountingExerciseProps> = ({ difficulty, onAnswer }) => {
  const [items, setItems] = useState<CountableItem[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [targetType, setTargetType] = useState<string>('')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [options, setOptions] = useState<number[]>([])
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const itemTypes = [
    { type: 'pizza', emoji: '🍕', colors: ['red', 'yellow'] },
    { type: 'pie', emoji: '🥧', colors: ['orange', 'brown'] },
    { type: 'cookie', emoji: '🍪', colors: ['brown', 'chocolate'] },
    { type: 'star', emoji: '⭐', colors: ['yellow', 'gold'] },
    { type: 'heart', emoji: '❤️', colors: ['red', 'pink'] },
    { type: 'flower', emoji: '🌸', colors: ['pink', 'purple'] },
    { type: 'apple', emoji: '🍎', colors: ['red', 'green'] },
    { type: 'banana', emoji: '🍌', colors: ['yellow', 'gold'] },
  ] as const

  useEffect(() => {
    generateItems()
  }, [])

  const generateItems = () => {
    let targetCount: number
    let totalItems: number
    let layout: LayoutType

    switch (difficulty) {
      case 'easy':
        targetCount = Math.floor(Math.random() * 4) + 2 // 2-5 target items
        totalItems = targetCount + Math.floor(Math.random() * 3) + 2 // 4-8 total
        layout = Math.random() > 0.5 ? 'line' : 'grid'
        break
      case 'medium':
        targetCount = Math.floor(Math.random() * 5) + 4 // 4-8 target items
        totalItems = targetCount + Math.floor(Math.random() * 4) + 3 // 7-12 total
        layout = Math.random() > 0.5 ? 'line' : 'grid'
        break
      case 'hard':
        targetCount = Math.floor(Math.random() * 6) + 6 // 6-11 target items
        totalItems = targetCount + Math.floor(Math.random() * 6) + 5 // 11-22 total
        layout = Math.random() > 0.5 ? 'line' : 'grid'
        break
    }

    // Select target type and other types for mixture
    const targetTypeObj = itemTypes[Math.floor(Math.random() * itemTypes.length)]
    const targetTypeString = targetTypeObj.type as string
    setTargetType(targetTypeString)

    // Get other item types for mixing
    const otherTypes = itemTypes.filter(t => t.type !== targetTypeString)

    const newItems: CountableItem[] = []

    // Add target items
    for (let i = 0; i < targetCount; i++) {
      newItems.push({
        id: `target-${i}`,
        type: targetTypeString as any,
        color: targetTypeObj.colors[Math.floor(Math.random() * targetTypeObj.colors.length)],
        position: { x: 0, y: 0 }, // Will be set by layout
        isTarget: true,
      })
    }

    // Add distractor items
    for (let i = 0; i < totalItems - targetCount; i++) {
      const otherType = otherTypes[Math.floor(Math.random() * otherTypes.length)]
      newItems.push({
        id: `distractor-${i}`,
        type: otherType.type as any,
        color: otherType.colors[Math.floor(Math.random() * otherType.colors.length)],
        position: { x: 0, y: 0 }, // Will be set by layout
        isTarget: false,
      })
    }

    // Shuffle items
    newItems.sort(() => Math.random() - 0.5)

    // Apply layout positions
    if (layout === 'line') {
      const itemWidth = 80 / newItems.length
      newItems.forEach((item, index) => {
        item.position = {
          x: 10 + index * itemWidth,
          y: 50,
        }
      })
    } else {
      // Grid layout
      const cols = Math.ceil(Math.sqrt(newItems.length))
      const itemWidth = 80 / cols
      const itemHeight = 80 / cols
      newItems.forEach((item, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        item.position = {
          x: 10 + col * itemWidth + itemWidth / 2,
          y: 10 + row * itemHeight + itemHeight / 2,
        }
      })
    }

    setItems(newItems)
    setCorrectCount(targetCount)

    // Generate answer options
    const opts = [targetCount]
    while (opts.length < 4) {
      const wrong = targetCount + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1)
      if (wrong > 0 && !opts.includes(wrong)) {
        opts.push(wrong)
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5))
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
    const isCorrect = answer === correctCount

    timeoutRef.current = setTimeout(() => {
      onAnswer(answer, isCorrect)
      setSelectedAnswer(null)
      setShowFeedback(false)
      generateItems() // Generate new items for next round
      timeoutRef.current = null
    }, 2000)
  }

  const getItemEmoji = (type: string) => {
    const item = itemTypes.find(t => t.type === type)
    return item?.emoji || '🍕'
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card variant="gradient" padding="large">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary-600 mb-4">
            Count the Items!
          </h2>

          {/* Counting area */}
          <motion.div
            className="relative bg-white/80 rounded-3xl p-8 mb-6 min-h-[400px]"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`absolute text-4xl sm:text-5xl cursor-pointer select-none ${
                    item.isTarget ? 'filter brightness-125' : 'opacity-70'
                  }`}
                  style={{
                    left: `${item.position.x}%`,
                    top: `${item.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  whileHover={{
                    scale: 1.3,
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  {getItemEmoji(item.type)}
                </motion.div>
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin-slow text-6xl">⏳</div>
              </div>
            )}
          </motion.div>

          {/* Question with target emoji */}
          <motion.div
            className="text-xl sm:text-2xl font-bold text-gray-700 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            How many {getItemEmoji(targetType)} do you see?
          </motion.div>

          <motion.div
            className="text-base sm:text-lg text-gray-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            (Ignore the other items!)
          </motion.div>

          {/* Answer options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === correctCount
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
                    className={`w-full text-white text-2xl sm:text-3xl font-bold min-h-[72px] sm:min-h-[80px] ${
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
              className={`mt-6 text-xl sm:text-2xl font-bold ${
                selectedAnswer === correctCount
                  ? 'text-green-600'
                  : 'text-orange-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {selectedAnswer === correctCount
                ? 'Perfect counting! Well done!'
                : `Good try! There were ${correctCount} ${getItemEmoji(targetType)}.`}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}