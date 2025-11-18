import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y?: number
  color: string
  delay: number
  duration: number
  rotation: number
  angle?: number
  distance?: number
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

      if (type === 'fireworks') {
        // Create multiple HUGE firework bursts at different positions
        const burstCount = 5
        const piecesPerBurst = 30

        for (let burst = 0; burst < burstCount; burst++) {
          const burstX = (burst % 3) * (window.innerWidth / 3) + window.innerWidth / 6
          const burstY = Math.random() * (window.innerHeight / 2) + window.innerHeight / 4
          const burstDelay = burst * 0.5

          for (let i = 0; i < piecesPerBurst; i++) {
            const angle = (Math.PI * 2 * i) / piecesPerBurst
            const distance = 150 + Math.random() * 200 // MUCH bigger explosion radius

            newPieces.push({
              id: burst * piecesPerBurst + i,
              x: burstX,
              y: burstY,
              color: colors[Math.floor(Math.random() * colors.length)],
              delay: burstDelay,
              duration: 1.5 + Math.random() * 0.5,
              rotation: Math.random() * 360,
              angle,
              distance,
            })
          }
        }
      } else {
        // Regular confetti falling from top
        const pieceCount = 100
        for (let i = 0; i < pieceCount; i++) {
          newPieces.push({
            id: i,
            x: Math.random() * window.innerWidth,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 0.5,
            duration: 2.5 + Math.random() * 1,
            rotation: Math.random() * 360,
          })
        }
      }

      setPieces(newPieces)

      const timer = setTimeout(() => {
        setPieces([])
        onComplete?.()
      }, type === 'fireworks' ? 5000 : 4000)

      return () => clearTimeout(timer)
    }
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => {
        const isFireworks = type === 'fireworks'
        const size = isFireworks ? Math.random() * 16 + 12 : Math.random() * 6 + 4 // 12-28px for HUGE fireworks, 4-10px regular
        const sparkle = isFireworks ? Math.random() > 0.2 : Math.random() > 0.4

        if (isFireworks && piece.angle !== undefined && piece.distance !== undefined) {
          // Firework burst - explode outward from center point
          const endX = piece.x + Math.cos(piece.angle) * piece.distance
          const endY = (piece.y || 0) + Math.sin(piece.angle) * piece.distance

          return (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                backgroundColor: piece.color,
                borderRadius: '50%',
                width: size,
                height: size,
                boxShadow: `0 0 ${size * 3}px ${piece.color}`,
                willChange: 'transform, opacity',
              }}
              initial={{
                x: piece.x,
                y: piece.y,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: endX,
                y: endY,
                opacity: [0, 1, 0.8, 0],
                scale: [0, 1.2, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.1, 0.25, 1],
                times: [0, 0.2, 0.7, 1],
              }}
            />
          )
        }

        // Regular confetti - fall from top
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
              boxShadow: `0 0 ${size}px ${piece.color}`,
              willChange: 'transform, opacity',
            }}
            initial={{
              y: -20,
              rotate: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              y: window.innerHeight + 20,
              rotate: piece.rotation,
              opacity: 0,
              scale: 0.8,
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}