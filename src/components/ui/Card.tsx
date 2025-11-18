import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient'
  padding?: 'small' | 'medium' | 'large'
  interactive?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'medium',
  interactive = false,
  ...props
}) => {
  const baseStyles = 'rounded-3xl transition-all duration-300'

  const variants = {
    default: 'bg-white/90 backdrop-blur-sm shadow-xl',
    elevated: 'bg-white shadow-2xl',
    bordered: 'bg-white/80 border-4 border-primary-200 shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-blue-50 shadow-xl',
  }

  const paddings = {
    small: 'p-4',
    medium: 'p-6 md:p-8',
    large: 'p-8 md:p-12',
  }

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:scale-105 active:scale-100'
    : ''

  return (
    <motion.div
      className={clsx(
        baseStyles,
        variants[variant],
        paddings[padding],
        interactiveStyles,
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={interactive ? { y: -4 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}