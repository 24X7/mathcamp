// Dual-layer analytics service - routes events to PostHog (anonymous) or Local (private)
import type PostHog from 'posthog-js'
import { LocalAnalytics } from './LocalAnalytics'
import type { ProblemAttempt, SessionSummary } from './types'
import type { ProblemType } from '../../types'

const APP_VERSION = '1.0.0'

export class AnalyticsService {
  private localAnalytics: LocalAnalytics

  constructor(private postHog: PostHog | null) {
    this.localAnalytics = new LocalAnalytics()
  }

  /**
   * Track app started
   * PostHog: Anonymous app launch
   * Local: Nothing
   */
  trackAppStarted(): void {
    console.log('[AnalyticsService] trackAppStarted called, postHog:', !!this.postHog)
    if (this.postHog) {
      try {
        this.postHog.capture('app_started', {
          version: APP_VERSION,
          platform: 'web',
          timestamp: Date.now(),
        })
        console.log('[AnalyticsService] app_started event sent')
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send app_started event:', error)
      }
    } else {
      console.warn('[AnalyticsService] PostHog not initialized, event not sent')
    }
  }

  /**
   * Track session started
   * PostHog: Anonymous session count
   * Local: Create detailed session
   */
  trackSessionStart(activityType: ProblemType): void {
    if (this.postHog) {
      try {
        this.postHog.capture('session_started', {
          version: APP_VERSION,
          platform: 'web',
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send session_started event:', error)
      }
    }

    // Local: Full session tracking
    this.localAnalytics.createSession(activityType)
  }

  /**
   * Track activity selected
   * PostHog: Feature usage (which activity)
   * Local: Record preference for recommendations
   */
  trackActivitySelected(activityType: ProblemType, questionCount: number): void {
    if (this.postHog) {
      try {
        this.postHog.capture('activity_selected', {
          activity_type: activityType,
          question_count: questionCount,
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send activity_selected event:', error)
      }
    }

    // Local: Track preferences
    this.localAnalytics.recordActivityPreference(activityType)
  }

  /**
   * Track problem answered
   * PostHog: NOTHING - too detailed, contains learning data
   * Local: Everything (answer, correctness, time, hints)
   */
  trackProblemAnswered(attempt: ProblemAttempt): void {
    // PostHog: DO NOT SEND - this is private learning data

    // Local: Full tracking
    this.localAnalytics.recordAttempt(attempt)
  }

  /**
   * Track session completed
   * PostHog: Aggregated metrics only (NO scores, NO correctness)
   * Local: Full session details
   */
  trackSessionCompleted(summary: SessionSummary): void {
    if (this.postHog) {
      try {
        this.postHog.capture('session_completed', {
          activity_type: summary.type,
          total_problems: summary.total,
          duration_bucket: this.bucketDuration(summary.duration),
          // NO accuracy, NO scores - privacy first!
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send session_completed event:', error)
      }
    }

    // Local: Full details
    this.localAnalytics.completeSession(summary)
  }

  /**
   * Track error occurred
   * PostHog: Error tracking for debugging
   * Local: Nothing
   */
  trackError(error: Error, context?: Record<string, any>): void {
    if (this.postHog) {
      try {
        this.postHog.capture('error_occurred', {
          error_message: error.message,
          error_stack: error.stack?.substring(0, 500), // Truncate
          context,
          version: APP_VERSION,
        })
      } catch (captureError) {
        console.warn('[AnalyticsService] Failed to send error_occurred event:', captureError)
      }
    }
  }

  /**
   * Track performance metric
   * PostHog: App performance monitoring
   * Local: Nothing
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    if (this.postHog) {
      try {
        this.postHog.capture('performance_metric', {
          metric,
          value,
          unit,
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send performance_metric event:', error)
      }
    }
  }

  /**
   * Track feature flag evaluated
   * PostHog: Which flags are being used
   * Local: Nothing
   */
  trackFeatureFlagEvaluated(flag: string, enabled: boolean): void {
    if (this.postHog) {
      try {
        this.postHog.capture('feature_flag_evaluated', {
          flag,
          enabled,
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send feature_flag_evaluated event:', error)
      }
    }
  }

  /**
   * Get local analytics (for parent dashboard)
   */
  getLocalAnalytics(): LocalAnalytics {
    return this.localAnalytics
  }

  /**
   * Export parent dashboard data
   */
  exportParentDashboard() {
    return this.localAnalytics.exportForParent()
  }

  /**
   * Bucket duration for privacy (no exact times to PostHog)
   */
  private bucketDuration(ms: number): string {
    if (ms < 5 * 60 * 1000) return '0-5min'
    if (ms < 10 * 60 * 1000) return '5-10min'
    if (ms < 20 * 60 * 1000) return '10-20min'
    return '20+min'
  }

  /**
   * Track pageview
   * PostHog: Pageview tracking for web analytics
   * Local: Nothing
   */
  trackPageView(path: string, context?: Record<string, any>): void {
    if (this.postHog) {
      try {
        this.postHog.capture('$pageview', {
          $current_url: typeof window !== 'undefined' ? window.location.href : '',
          $pathname: path,
          ...context,
        })
      } catch (error) {
        console.warn('[AnalyticsService] Failed to send pageview:', error)
      }
    }
  }

  /**
   * Identify user (optional, for future use)
   * Only use anonymous IDs, never real names
   */
  identifyUser(anonymousId: string): void {
    if (this.postHog) {
      // Use device ID or random UUID, never child's name
      this.postHog.identify(anonymousId)
    }
  }

  /**
   * Reset analytics (clear local data)
   */
  reset(): void {
    if (this.postHog) {
      this.postHog.reset()
    }
    this.localAnalytics.clearAll()
  }
}
