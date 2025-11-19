import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'react-vendor': ['react', 'react-dom'],
          'posthog-vendor': ['posthog-js', '@posthog/react'],
          'animation-vendor': ['framer-motion'],
          'router-vendor': ['@tanstack/react-router'],

          // Feature chunks - split by activity type
          'math-features': [
            './src/features/math-types/AdditionProblem.tsx',
            './src/features/math-types/problemGenerator.ts',
          ],
          'fact-family-features': [
            './src/features/fact-families/FactFamilyHouse.tsx',
            './src/features/fact-families/generateFactFamily.ts',
          ],
          'word-problem-features': [
            './src/features/word-problems/WordProblemGenerator.tsx',
            './src/features/word-problems/generateWordProblem.ts',
          ],
          'counting-features': [
            './src/features/counting/CountingExercise.tsx',
            './src/features/counting/CountingSequence.tsx',
          ],

          // Analytics chunk
          'analytics': [
            './src/infrastructure/analytics/AnalyticsService.ts',
            './src/infrastructure/analytics/LocalAnalytics.ts',
            './src/infrastructure/analytics/FeatureFlagService.ts',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Slightly increase limit for better chunking
  },
})