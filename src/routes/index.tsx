import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Settings, ProblemType } from '@/types'
import { getSettings, saveSettings } from '@/utils/localStorage'
import { Trophy } from 'lucide-react'
import { SessionManager } from './$activity'

export const Route = createFileRoute('/')({
  component: MenuScreen,
  beforeLoad: () => {
    // CRITICAL: Clear all SessionManager sessions when returning to homepage
    // This prevents double-counting scores when starting a new game after
    // completing a previous session
    const sessionManager = SessionManager.getInstance()
    sessionManager.clearAllSessions()
    console.log('[MenuScreen beforeLoad] Cleared all SessionManager sessions')
  },
})

function MenuScreen() {
  const navigate = useNavigate()
  const analytics = useAnalytics()
  const [settings, setSettings] = useState<Settings>(getSettings())

  // Track app started (once on mount)
  useEffect(() => {
    console.log('[MenuScreen] Component mounted, tracking app start')
    analytics.trackAppStarted()
  }, [analytics])

  // Track page view
  useEffect(() => {
    analytics.trackPageView('/', { game_mode: 'menu' })
  }, [analytics])

  const activities: { type: ProblemType; name: string; emoji: string; color: string }[] = [
    { type: 'addition', name: 'Addition', emoji: '➕', color: 'bg-blue-500' },
    { type: 'subtraction', name: 'Subtraction', emoji: '➖', color: 'bg-red-500' },
    { type: 'multiplication', name: 'Multiplication', emoji: '✖️', color: 'bg-teal-500' },
    { type: 'division', name: 'Division', emoji: '➗', color: 'bg-amber-500' },
    { type: 'fact-family', name: 'Fact Families', emoji: '🏠', color: 'bg-orange-500' },
    { type: 'word-problem', name: 'Word Problems', emoji: '📖', color: 'bg-green-500' },
    { type: 'counting', name: 'Counting', emoji: '🔢', color: 'bg-pink-500' },
    { type: 'counting-sequence', name: 'Number Sequences', emoji: '⬆️', color: 'bg-purple-500' },
  ]

  const startGame = (activity: ProblemType) => {
    // Track analytics
    analytics.trackSessionStart(activity)
    analytics.trackActivitySelected(activity, settings.problemCount)

    // Navigate to the first question
    navigate({
      to: '/$activity/question/$number',
      params: { activity, number: '1' },
    })
  }

  return (
    <motion.div
      key="menu"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-6xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.h1
          className="text-6xl md:text-8xl font-heading font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          MathCamp
        </motion.h1>
        <motion.p
          className="text-2xl font-body text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Fun Math Learning for Kids!
        </motion.p>
      </div>

      {/* Question count and difficulty selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        {/* Question count */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-heading font-bold text-gray-800 text-center mb-4">
            How many questions?
          </h3>
          <div className="flex justify-center gap-3">
            {[5, 10, 20].map((count) => (
              <motion.button
                key={count}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newSettings = { ...settings, problemCount: count }
                  setSettings(newSettings)
                  saveSettings(newSettings)
                }}
                className={`px-6 py-3 rounded-lg font-heading font-bold text-lg transition-all ${
                  settings.problemCount === count
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                {count}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Difficulty */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-heading font-bold text-gray-800 text-center mb-4">
            Difficulty Level
          </h3>
          <div className="flex justify-center gap-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <motion.button
                key={level}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newSettings = { ...settings, difficulty: level }
                  setSettings(newSettings)
                  saveSettings(newSettings)
                }}
                className={`px-6 py-3 rounded-lg font-heading font-bold text-lg capitalize transition-all ${
                  settings.difficulty === level
                    ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border-2 border-gray-300'
                }`}
              >
                {level}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.type}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="elevated"
              padding="medium"
              interactive
              onClick={() => startGame(activity.type)}
              className="cursor-pointer min-h-[180px] sm:min-h-[160px]"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className={`${activity.color} rounded-full p-6 sm:p-6 mb-4`}>
                  <span className="text-5xl sm:text-5xl">{activity.emoji}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-gray-800">{activity.name}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant="secondary"
          size="large"
          onClick={() => navigate({ to: '/progress' })}
          icon={<Trophy />}
        >
          Progress
        </Button>
      </div>
    </motion.div>
  )
}
