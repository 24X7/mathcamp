import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles/index.css'

// Polyfill for crypto.randomUUID (Safari compatibility)
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    ) as `${string}-${string}-${string}-${string}-${string}`
  }
}

// Create the router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// PostHog configuration - Privacy-first for children's app
// NOTE: Set your PostHog API key and host in environment variables
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

// Only initialize PostHog if API key is provided
if (POSTHOG_API_KEY) {
  posthog.init(POSTHOG_API_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2025-05-24',
    person_profiles: 'identified_only', // Create profiles only for identified users

    // CRITICAL: Privacy settings for children's app
    autocapture: false, // No automatic event capture
    capture_pageview: true, // Enable pageview for web analytics
    capture_pageleave: true, // Track when user leaves
    disable_session_recording: true, // NEVER record children
    disable_surveys: true, // No surveys for kids
    opt_out_capturing_by_default: false,

    // Error handling - silence ad blocker errors
    advanced_disable_decide: false, // Keep feature flags
    disable_compression: false, // Keep compression
    disable_persistence: false, // Keep persistence
    persistence: 'localStorage', // Use localStorage

    // Request settings - reduce retries to minimize console spam
    batch_max_attempts: 3, // Reduce from default (many retries)
    xhr_headers: {}, // No custom headers needed

    // Silence verbose logging in production
    loaded: (ph) => {
      // Only enable debug in dev mode
      if (import.meta.env.DEV) {
        console.log('[PostHog] Initialized successfully')
      }

      // Suppress PostHog's error logging by overriding console methods temporarily
      // This prevents "ERR_BLOCKED_BY_CLIENT" spam in console
      const originalError = console.error
      const originalWarn = console.warn

      // Filter out PostHog retry/fetch errors
      console.error = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        if (
          message.includes('[PostHog.js]') &&
          (message.includes('Failed to fetch') ||
           message.includes('Enqueued failed request') ||
           message.includes('ERR_BLOCKED_BY_CLIENT'))
        ) {
          // Silently ignore - ad blocker is blocking, this is expected
          return
        }
        originalError.apply(console, args)
      }

      console.warn = (...args: any[]) => {
        const message = args[0]?.toString() || ''
        if (message.includes('[PostHog.js]') && message.includes('retry')) {
          // Silently ignore retry warnings
          return
        }
        originalWarn.apply(console, args)
      }
    },

    // Sanitize properties to prevent accidental PII leakage
    before_send: (event) => {
      // Remove any child-identifying data from properties
      if (event.properties) {
        delete event.properties.name
        delete event.properties.email
        delete event.properties.childId
        delete event.properties.answer
        delete event.properties.score
        delete event.properties.correctness
      }
      return event
    },
  })
} else {
  console.warn(
    'PostHog API key not found. Analytics will use local-only mode. ' +
    'Set VITE_POSTHOG_API_KEY in .env to enable PostHog.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <RouterProvider router={router} />
    </PostHogProvider>
  </React.StrictMode>
)