import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'ghost'
  size?: 'small' | 'medium' | 'large' | 'huge'
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'large',
  children,
  className,
  disabled = false,
  loading = false,
  icon,
  ...props
}) => {
  const baseStyles = 'font-heading font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 no-select shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-400/40',
    secondary: 'bg-green-500 hover:bg-green-600 text-white shadow-green-400/40',
    accent: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-400/40',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/40',
    error: 'bg-red-400 hover:bg-red-500 text-white shadow-red-300/40',
    ghost: 'bg-white hover:bg-gray-100 text-gray-900 border-4 border-gray-300 shadow-gray-300/30',
  }

  const sizes = {
    small: 'text-lg px-4 py-2 min-h-[48px]',
    medium: 'text-xl px-6 py-3 min-h-[56px]',
    large: 'text-2xl px-8 py-4 min-h-[64px]',
    huge: 'text-3xl px-10 py-5 min-h-[72px]',
  }

  return (
    <motion.button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {loading ? (
        <div className="animate-spin-slow">
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : (
        <>
          {icon && <span className="text-current">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  )
}