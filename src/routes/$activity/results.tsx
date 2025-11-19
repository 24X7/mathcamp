import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Confetti } from '@/components/feedback/Confetti'
import { ProblemType } from '@/types'
import { Home, RotateCcw } from 'lucide-react'

type ResultsSearch = {
  correct: number
  total: number
  sessionId: string
  duration: number
}

export const Route = createFileRoute('/$activity/results')({
  component: ResultsScreen,
  validateSearch: (search: Record<string, unknown>): ResultsSearch => {
    return {
      correct: Number(search.correct) || 0,
      total: Number(search.total) || 1,
      sessionId: String(search.sessionId) || '',
      duration: Number(search.duration) || 0,
    }
  },
})

function ResultsScreen() {
  const { activity } = Route.useParams()
  const { correct, total, sessionId, duration } = Route.useSearch()
  const navigate = useNavigate()
  const { endSession, checkAchievements } = useProgress()
  const analytics = useAnalytics()
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiType, setConfettiType] = useState<'regular' | 'fireworks'>('regular')

  // Override back button to go to home instead of questions
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      navigate({ to: '/', replace: true })
    }

    // Add a new history entry so back button has somewhere to go
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])

  // End session and track analytics on mount
  useEffect(() => {
    if (sessionId) {
      endSession(sessionId)
      checkAchievements()

      // Track analytics
      analytics.trackSessionCompleted({
        id: sessionId,
        type: activity as ProblemType,
        total,
        correct,
        duration,
        startTime: Date.now() - duration,
        endTime: Date.now(),
      })
    }

    // Track page view
    analytics.trackPageView(`/${activity}/results`, {
      game_mode: 'results',
      activity,
    })

    // Trigger confetti after a short delay
    setTimeout(() => {
      const got100Percent = correct === total
      if (got100Percent) {
        console.log('[Results] ✨✨✨ FIREWORKS TIME ✨✨✨')
        setConfettiType('fireworks')
        setShowConfetti(true)
      } else {
        console.log('[Results] Regular confetti (not 100%)')
        setConfettiType('regular')
        setShowConfetti(true)
      }
    }, 300)
  }, [sessionId, activity, correct, total, duration, analytics, endSession, checkAchievements])

  const startNewGame = () => {
    navigate({
      to: '/$activity/question/$number',
      params: { activity, number: '1' },
    })
  }

  return (
    <>
      <motion.div
        key="results"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="max-w-2xl mx-auto"
      >
        <Card variant="gradient" padding="large">
          <div className="text-center">
            <motion.div
              className="text-8xl mb-4"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              🎉
            </motion.div>
            <h2 className="text-4xl font-heading font-bold text-primary-600 mb-4">Great Job!</h2>
            <p className="text-2xl font-body text-gray-700 mb-6">
              You got {correct} out of {total} correct!
            </p>
            <div className="text-6xl font-bold text-accent-500 mb-8">
              {Math.round((correct / total) * 100)}%
            </div>
            <div className="flex justify-center gap-4">
              <Button
                variant="primary"
                size="large"
                onClick={startNewGame}
                icon={<RotateCcw />}
              >
                Play Again
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => navigate({ to: '/' })}
                icon={<Home />}
              >
                Home
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <Confetti trigger={showConfetti} type={confettiType} onComplete={() => setShowConfetti(false)} />
    </>
  )
}
