import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressProvider, useProgress } from '@/hooks/useProgress'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Confetti } from '@/components/feedback/Confetti'
import { AdditionProblem } from '@/features/math-types/AdditionProblem'
import { FactFamilyHouse } from '@/features/fact-families/FactFamilyHouse'
import { WordProblemGenerator } from '@/features/word-problems/WordProblemGenerator'
import { CountingExercise } from '@/features/counting/CountingExercise'
import { CountingSequence } from '@/features/counting/CountingSequence'
import { generateProblem } from '@/features/math-types/problemGenerator'
import { generateFactFamily } from '@/features/fact-families/generateFactFamily'
import { generateWordProblem } from '@/features/word-problems/generateWordProblem'
import { Settings, ProblemType, Problem, AttemptedProblem } from '@/types'
import { getSettings, saveSettings } from '@/utils/localStorage'
import { generateSessionPlan, SessionPlan } from '@/utils/sessionPlanner'
import {
  Home,
  Trophy,
  Settings as SettingsIcon,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'

type GameMode = 'menu' | 'playing' | 'results' | 'progress' | 'settings'

function GameContent() {
  const { progress, addProblemAttempt, startSession, endSession, checkAchievements } = useProgress()
  const analytics = useAnalytics()
  const [gameMode, setGameMode] = useState<GameMode>('menu')
  const [currentActivity, setCurrentActivity] = useState<ProblemType>('addition')
  const [settings, setSettings] = useState<Settings>(getSettings())
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [factFamily, setFactFamily] = useState(generateFactFamily(settings.difficulty))
  const [wordProblem, setWordProblem] = useState(generateWordProblem(settings.difficulty))
  const [problemCount, setProblemCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiType, setConfettiType] = useState<'regular' | 'fireworks'>('regular')
  const [sessionPlan, setSessionPlan] = useState<SessionPlan[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)

  // Track app started (once on mount)
  useEffect(() => {
    console.log('[App] Component mounted, tracking app start')
    analytics.trackAppStarted()
  }, [analytics])

  const activities: { type: ProblemType; name: string; emoji: string; color: string }[] = [
    { type: 'addition', name: 'Addition', emoji: '➕', color: 'bg-blue-500' },
    { type: 'subtraction', name: 'Subtraction', emoji: '➖', color: 'bg-red-500' },
    { type: 'fact-family', name: 'Fact Families', emoji: '🏠', color: 'bg-orange-500' },
    { type: 'word-problem', name: 'Word Problems', emoji: '📖', color: 'bg-green-500' },
    { type: 'counting', name: 'Counting', emoji: '🔢', color: 'bg-pink-500' },
    { type: 'counting-sequence', name: 'Number Sequences', emoji: '⬆️', color: 'bg-purple-500' },
  ]

  const startGame = (activity: ProblemType) => {
    setCurrentActivity(activity)
    setGameMode('playing')
    setProblemCount(0)
    setCorrectCount(0)
    const id = startSession()
    setSessionId(id)
    setSessionStartTime(Date.now())

    // Track analytics: session started + activity selected
    analytics.trackSessionStart(activity)
    analytics.trackActivitySelected(activity, settings.problemCount)

    // Generate session plan for this activity
    const plan = generateSessionPlan(activity, settings.problemCount, settings.difficulty)
    setSessionPlan(plan)

    if (activity !== 'fact-family' && activity !== 'word-problem' && activity !== 'counting' && activity !== 'counting-sequence') {
      setCurrentProblem(generateProblem(activity, settings.difficulty))
    }
  }

  const handleAnswer = (answer: string | number, isCorrect: boolean) => {
    if (currentProblem && sessionId) {
      const attemptedProblem: AttemptedProblem = {
        ...currentProblem,
        userAnswer: answer,
        isCorrect,
        timeSpent: 10, // Would track actual time in production
        attempts: 1,
        hintsUsed: 0,
      }
      addProblemAttempt(attemptedProblem)

      // Track analytics: problem answered (local only, detailed)
      analytics.trackProblemAnswered({
        id: crypto.randomUUID(),
        problemId: currentProblem.id,
        type: currentActivity,
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

    setProblemCount(prev => prev + 1)
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
      // Always show confetti on correct answer
      setConfettiType('regular')
      setShowConfetti(true)
    }

    if (problemCount + 1 >= settings.problemCount) {
      endGame()
    } else {
      // Generate next problem
      if (currentActivity !== 'fact-family' && currentActivity !== 'word-problem' && currentActivity !== 'counting' && currentActivity !== 'counting-sequence') {
        setCurrentProblem(generateProblem(currentActivity, settings.difficulty))
      } else if (currentActivity === 'fact-family') {
        setFactFamily(generateFactFamily(settings.difficulty))
      } else if (currentActivity === 'word-problem') {
        setWordProblem(generateWordProblem(settings.difficulty))
      }
      // counting and counting-sequence auto-generate in their components
    }
  }

  const endGame = () => {
    if (sessionId) {
      endSession(sessionId)
      const achievements = checkAchievements()

      // Check if they got 100%
      const got100Percent = correctCount === settings.problemCount
      if (got100Percent) {
        // Big fireworks for 100%!
        setConfettiType('fireworks')
        setShowConfetti(true)
      } else if (achievements.length > 0) {
        // Regular confetti for achievements
        setConfettiType('regular')
        setShowConfetti(true)
      }

      // Track analytics: session completed (aggregated only to PostHog)
      const duration = Date.now() - sessionStartTime
      analytics.trackSessionCompleted({
        id: sessionId,
        type: currentActivity,
        total: problemCount,
        correct: correctCount,
        duration,
        startTime: sessionStartTime,
        endTime: Date.now(),
      })
    }
    setGameMode('results')
  }

  const toggleSound = () => {
    const newSettings = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(to bottom right, rgb(239 246 255), rgb(243 232 255), rgb(252 231 243))' }}>
      <AnimatePresence mode="wait">
        {gameMode === 'menu' && (
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

            {/* Question count selector */}
            <motion.div
              className="bg-white rounded-2xl p-6 mb-8 shadow-lg max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-heading font-bold text-gray-800 text-center mb-4">
                How many questions?
              </h3>
              <div className="flex justify-center gap-4">
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
                    className={`px-8 py-3 rounded-lg font-heading font-bold text-lg transition-all ${
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
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`${activity.color} rounded-full p-6 mb-4`}>
                        <span className="text-5xl">{activity.emoji}</span>
                      </div>
                      <h3 className="text-2xl font-heading font-bold text-gray-800">
                        {activity.name}
                      </h3>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="secondary"
                size="large"
                onClick={() => setGameMode('progress')}
                icon={<Trophy />}
              >
                Progress
              </Button>
              <Button
                variant="ghost"
                size="large"
                onClick={() => setGameMode('settings')}
                icon={<SettingsIcon />}
              >
                Settings
              </Button>
            </div>
          </motion.div>
        )}

        {gameMode === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="ghost"
                  size="medium"
                  onClick={() => setGameMode('menu')}
                  icon={<Home />}
                >
                  Home
                </Button>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-gray-700">
                    Question {problemCount + 1} / {settings.problemCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={toggleSound}
                    icon={settings.soundEnabled ? <Volume2 /> : <VolumeX />}
                  >
                    {settings.soundEnabled ? 'Sound On' : 'Sound Off'}
                  </Button>
                </div>
              </div>

              {currentActivity === 'addition' && currentProblem && (
                <AdditionProblem problem={currentProblem} onAnswer={handleAnswer} />
              )}
              {currentActivity === 'fact-family' && sessionPlan.length > 0 && (
                <FactFamilyHouse
                  family={factFamily}
                  sessionPlan={sessionPlan}
                  currentProblemIndex={problemCount}
                  onComplete={(correct) => handleAnswer('', correct)}
                />
              )}
              {currentActivity === 'word-problem' && sessionPlan.length > 0 && (
                <WordProblemGenerator
                  key={wordProblem.id}
                  problem={wordProblem}
                  sessionPlan={sessionPlan}
                  currentProblemIndex={problemCount}
                  onAnswer={handleAnswer}
                />
              )}
              {currentActivity === 'counting' && sessionPlan.length > 0 && (
                <CountingExercise
                  difficulty={settings.difficulty}
                  sessionPlan={sessionPlan}
                  currentProblemIndex={problemCount}
                  onAnswer={handleAnswer}
                />
              )}
              {currentActivity === 'counting-sequence' && sessionPlan.length > 0 && (
                <CountingSequence
                  difficulty={settings.difficulty}
                  problemCount={settings.problemCount}
                  currentProblemIndex={problemCount}
                  sessionPlan={sessionPlan}
                  onAnswer={handleAnswer}
                />
              )}
              {currentActivity === 'subtraction' && currentProblem && (
                <AdditionProblem problem={currentProblem} onAnswer={handleAnswer} />
              )}
            </div>
          </motion.div>
        )}

        {gameMode === 'results' && (
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
                <h2 className="text-4xl font-heading font-bold text-primary-600 mb-4">
                  Great Job!
                </h2>
                <p className="text-2xl font-body text-gray-700 mb-6">
                  You got {correctCount} out of {problemCount} correct!
                </p>
                <div className="text-6xl font-bold text-accent-500 mb-8">
                  {Math.round((correctCount / problemCount) * 100)}%
                </div>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => startGame(currentActivity)}
                    icon={<RotateCcw />}
                  >
                    Play Again
                  </Button>
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => setGameMode('menu')}
                    icon={<Home />}
                  >
                    Home
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {gameMode === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Card variant="gradient" padding="large">
              <div className="text-center">
                <h2 className="text-4xl font-heading font-bold text-primary-600 mb-6">
                  Your Progress
                </h2>
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
                          : 0}%
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
                  onClick={() => setGameMode('menu')}
                  icon={<Home />}
                >
                  Back to Menu
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {gameMode === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card variant="gradient" padding="large">
              <h2 className="text-4xl font-heading font-bold text-primary-600 mb-8 text-center">
                Settings
              </h2>

              <div className="space-y-6">
                {/* Sound Settings */}
                <div className="bg-white/80 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-700">Sound Effects</h3>
                      <p className="text-sm text-gray-600">Play sounds when answering problems</p>
                    </div>
                    <button
                      onClick={toggleSound}
                      className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? 'translate-x-11' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Difficulty Setting */}
                <div className="bg-white/80 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Difficulty Level</h3>
                  <div className="flex gap-3">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => {
                          const newSettings = { ...settings, difficulty: level }
                          setSettings(newSettings)
                          saveSettings(newSettings)
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold capitalize transition-colors ${
                          settings.difficulty === level
                            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Problem Count Setting */}
                <div className="bg-white/80 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-4">Questions per Session</h3>
                  <div className="flex gap-3">
                    {[5, 10, 20].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          const newSettings = { ...settings, problemCount: count }
                          setSettings(newSettings)
                          saveSettings(newSettings)
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors ${
                          settings.problemCount === count
                            ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Note */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-2">🔒 Privacy First</h3>
                  <p className="text-sm text-blue-700">
                    All your learning data stays on this device. We never send your answers, scores, or personal information to the cloud.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  variant="primary"
                  size="large"
                  onClick={() => setGameMode('menu')}
                  icon={<Home />}
                >
                  Back to Menu
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Confetti trigger={showConfetti} type={confettiType} onComplete={() => setShowConfetti(false)} />
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <GameContent />
    </ProgressProvider>
  )
}