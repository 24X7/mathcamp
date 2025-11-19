import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Home } from 'lucide-react'

export const Route = createFileRoute('/progress')({
  component: ProgressScreen,
})

function ProgressScreen() {
  const navigate = useNavigate()
  const { progress } = useProgress()
  const analytics = useAnalytics()

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/progress', {
      game_mode: 'progress',
    })
  }, [analytics])

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Card variant="gradient" padding="large">
        <div className="text-center">
          <h2 className="text-4xl font-heading font-bold text-primary-600 mb-6">Your Progress</h2>
          {progress && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-600">{progress.totalProblems}</div>
                <div className="text-sm text-gray-600">Total Problems</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">{progress.correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-3xl font-bold text-orange-600">{progress.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {progress.totalProblems > 0
                    ? Math.round((progress.correctAnswers / progress.totalProblems) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          )}
          <div className="mb-8">
            <h3 className="text-2xl font-heading font-bold text-gray-700 mb-4">Achievements</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {progress?.achievements.map((achievement) => (
                <div key={achievement.id} className="text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-bold">{achievement.name}</div>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="primary"
            size="large"
            onClick={() => navigate({ to: '/' })}
            icon={<Home />}
          >
            Back to Menu
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
