import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Confetti } from '@/components/feedback/Confetti'
import { AdditionProblem } from '@/features/math-types/AdditionProblem'
import { FactFamilyHouse } from '@/features/fact-families/FactFamilyHouse'
import { WordProblemGenerator } from '@/features/word-problems/WordProblemGenerator'
import { CountingExercise } from '@/features/counting/CountingExercise'
import { CountingSequence } from '@/features/counting/CountingSequence'
import { generateProblem } from '@/features/math-types/problemGenerator'
import { generateFactFamily } from '@/features/fact-families/generateFactFamily'
import { generateWordProblem } from '@/features/word-problems/generateWordProblem'
import { ProblemType, Problem, AttemptedProblem } from '@/types'
import { getSettings } from '@/utils/localStorage'
import { Home } from 'lucide-react'

export const Route = createFileRoute('/$activity/question/$number')({
  component: QuestionScreen,
})

function QuestionScreen() {
  const { activity, number } = Route.useParams()
  const { sessionManager } = Route.useRouteContext()
  const navigate = useNavigate()
  const { addProblemAttempt, startSession } = useProgress()
  const analytics = useAnalytics()
  const settings = getSettings()

  // Get or create session from the manager (provided by parent route context)
  const session = sessionManager.getOrCreateSession(activity, startSession)

  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [factFamily, setFactFamily] = useState(generateFactFamily(settings.difficulty))
  const [wordProblem, setWordProblem] = useState(generateWordProblem(settings.difficulty))
  const [showConfetti, setShowConfetti] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const problemIndex = parseInt(number) - 1

  // Generate problem when question number changes
  useEffect(() => {
    // Reset animation state when navigating to new question
    setIsAnimating(false)
    setShowConfetti(false)

    if (
      activity !== 'fact-family' &&
      activity !== 'word-problem' &&
      activity !== 'counting' &&
      activity !== 'counting-sequence'
    ) {
      setCurrentProblem(generateProblem(activity as ProblemType, settings.difficulty))
    } else if (activity === 'fact-family') {
      setFactFamily(generateFactFamily(settings.difficulty))
    } else if (activity === 'word-problem') {
      setWordProblem(generateWordProblem(settings.difficulty))
    }
  }, [number, activity, settings.difficulty])

  // Track page view
  useEffect(() => {
    const path = `/${activity}/question/${number}`
    analytics.trackPageView(path, {
      game_mode: 'playing',
      activity,
      question_number: parseInt(number),
    })
  }, [activity, number, analytics])

  const handleAnswer = (answer: string | number, isCorrect: boolean) => {
    // Prevent multiple submissions during animation
    if (isAnimating) return

    setIsAnimating(true)

    // Show confetti immediately for correct answers
    if (isCorrect) {
      setShowConfetti(true)
      sessionManager.incrementCorrectCount(activity)
    }

    if (currentProblem && session.sessionId) {
      const attemptedProblem: AttemptedProblem = {
        ...currentProblem,
        userAnswer: answer,
        isCorrect,
        timeSpent: 10,
        attempts: 1,
        hintsUsed: 0,
      }
      addProblemAttempt(attemptedProblem)

      // Track analytics
      analytics.trackProblemAnswered({
        id: crypto.randomUUID(),
        problemId: currentProblem.id,
        type: activity as ProblemType,
        problem: currentProblem.question,
        answer: currentProblem.correctAnswer,
        userAnswer: answer,
        correct: isCorrect,
        timeMs: 10000,
        hintsUsed: 0,
        attempts: 1,
        timestamp: Date.now(),
      })
    }

    const currentQuestionNumber = parseInt(number)
    const isLastQuestion = currentQuestionNumber >= settings.problemCount

    // Get updated count after increment (if correct)
    const updatedSession = sessionManager.getOrCreateSession(activity, startSession)
    const finalCorrectCount = updatedSession.correctCount

    console.log('[handleAnswer]', {
      question: currentQuestionNumber,
      isCorrect,
      finalCorrectCount,
      total: settings.problemCount,
      isLastQuestion,
    })

    // Navigate to next question or results
    // Use replace: true to prevent back button from going through all questions
    if (isLastQuestion) {
      navigate({
        to: '/$activity/results',
        params: { activity },
        search: {
          correct: finalCorrectCount,
          total: settings.problemCount,
          sessionId: session.sessionId,
          duration: Date.now() - session.sessionStartTime,
        },
        replace: true,
      })
    } else {
      navigate({
        to: '/$activity/question/$number',
        params: { activity, number: (currentQuestionNumber + 1).toString() },
        replace: true,
      })
    }
  }

  return (
    <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="medium" onClick={() => navigate({ to: '/' })} icon={<Home />}>
            Home
          </Button>
          <span className="text-xl font-bold text-gray-700">
            Question {number} / {settings.problemCount}
          </span>
        </div>

        {activity === 'addition' && currentProblem && (
          <AdditionProblem problem={currentProblem} onAnswer={handleAnswer} />
        )}
        {activity === 'subtraction' && currentProblem && (
          <AdditionProblem problem={currentProblem} onAnswer={handleAnswer} />
        )}
        {activity === 'fact-family' && session.sessionPlan.length > 0 && (
          <FactFamilyHouse
            family={factFamily}
            sessionPlan={session.sessionPlan}
            currentProblemIndex={problemIndex}
            onComplete={(correct) => handleAnswer('', correct)}
          />
        )}
        {activity === 'word-problem' && session.sessionPlan.length > 0 && (
          <WordProblemGenerator
            key={wordProblem.id}
            problem={wordProblem}
            sessionPlan={session.sessionPlan}
            currentProblemIndex={problemIndex}
            onAnswer={handleAnswer}
          />
        )}
        {activity === 'counting' && session.sessionPlan.length > 0 && (
          <CountingExercise
            difficulty={settings.difficulty}
            sessionPlan={session.sessionPlan}
            currentProblemIndex={problemIndex}
            onAnswer={handleAnswer}
          />
        )}
        {activity === 'counting-sequence' && session.sessionPlan.length > 0 && (
          <CountingSequence
            difficulty={settings.difficulty}
            problemCount={settings.problemCount}
            currentProblemIndex={problemIndex}
            sessionPlan={session.sessionPlan}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      <Confetti trigger={showConfetti} type="regular" onComplete={() => setShowConfetti(false)} />
    </motion.div>
  )
}
