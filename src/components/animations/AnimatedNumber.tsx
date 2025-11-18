import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface AnimatedNumberProps {
  value: number
  className?: string
  size?: 'small' | 'medium' | 'large' | 'huge'
  color?: string
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  size = 'large',
  color = 'text-primary-600',
}) => {
  const sizes = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
    huge: 'text-8xl',
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        className={clsx(
          'font-mono font-bold inline-block',
          sizes[size],
          color,
          className
        )}
        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}