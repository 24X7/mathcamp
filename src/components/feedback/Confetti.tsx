import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  rotation: number
}

interface ConfettiProps {
  trigger: boolean
  type?: 'regular' | 'fireworks'
  onComplete?: () => void
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, type = 'regular', onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  const colors = [
    '#f87171', // red
    '#fbbf24', // yellow
    '#34d399', // green
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fb923c', // orange
  ]

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = []
      const pieceCount = type === 'fireworks' ? 150 : 50

      for (let i = 0; i < pieceCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 1,
          rotation: Math.random() * 360,
        })
      }
      setPieces(newPieces)

      const timer = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, type === 'fireworks' ? 4000 : 3500)

      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => {
        const isFireworks = type === 'fireworks'
        const size = isFireworks ? Math.random() * 8 + 4 : 3 // 4-12px for fireworks, 3px regular
        const sparkle = isFireworks && Math.random() > 0.5

        return (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: piece.x,
              backgroundColor: piece.color,
              borderRadius: sparkle ? '50%' : '2px',
              width: size,
              height: size,
              boxShadow: isFireworks ? `0 0 ${size * 2}px ${piece.color}` : 'none',
            }}
            initial={{
              y: -20,
              rotate: 0,
              opacity: 1,
              scale: isFireworks ? 0 : 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: piece.rotation,
              opacity: 0,
              scale: isFireworks ? [0, 1.5, 1, 0.5, 0] : 1,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'easeIn',
              scale: isFireworks ? {
                duration: piece.duration,
                times: [0, 0.2, 0.5, 0.8, 1],
              } : undefined,
            }}
          />
        )
      })}
    </div>
  )
}