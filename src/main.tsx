import React from 'react'
import ReactDOM from 'react-dom/client'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import App from './App'
import './styles/index.css'

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

    // Performance
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug() // Enable debug mode in development
      }
      console.log('[PostHog] Initialized successfully')
      console.log('[PostHog] Config:', ph.config)
      console.log('[PostHog] Is feature flags enabled?', ph.config.hasFeatureFlags)

      // Send a test event immediately
      ph.capture('posthog_initialized', {
        timestamp: new Date().toISOString(),
        test: true
      })
      console.log('[PostHog] Sent test event: posthog_initialized')

      // Manually capture pageview to ensure it's sent
      ph.capture('$pageview', {
        $current_url: window.location.href,
        $host: window.location.host,
        $pathname: window.location.pathname
      })
      console.log('[PostHog] Manually sent $pageview event')

      // Force flush to send events immediately
      setTimeout(() => {
        if (ph._flush) {
          ph._flush()
          console.log('[PostHog] Flushed event queue')
        }
      }, 1000)
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
      <App />
    </PostHogProvider>
  </React.StrictMode>
)