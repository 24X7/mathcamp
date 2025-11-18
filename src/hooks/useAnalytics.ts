// React hook for accessing analytics services
import { usePostHog } from '@posthog/react'
import { useMemo, useEffect, useState } from 'react'
import { AnalyticsService } from '../infrastructure/analytics/AnalyticsService'
import { FeatureFlagService } from '../infrastructure/analytics/FeatureFlagService'

let analyticsServiceInstance: AnalyticsService | null = null
let featureFlagServiceInstance: FeatureFlagService | null = null

/**
 * Hook to access the analytics service
 * Provides access to both PostHog (anonymous) and Local (private) analytics
 */
export function useAnalytics() {
  const postHog = usePostHog()

  const analyticsService = useMemo(() => {
    if (!analyticsServiceInstance) {
      console.log('[useAnalytics] Creating AnalyticsService, postHog:', !!postHog)
      analyticsServiceInstance = new AnalyticsService(postHog)
    } else if (analyticsServiceInstance && !analyticsServiceInstance['postHog'] && postHog) {
      // PostHog became available, update the instance
      console.log('[useAnalytics] Updating AnalyticsService with postHog')
      analyticsServiceInstance = new AnalyticsService(postHog)
    }
    return analyticsServiceInstance
  }, [postHog])

  return analyticsService
}

/**
 * Hook to access feature flags
 * Checks PostHog first, falls back to local config
 */
export function useFeatureFlags() {
  const postHog = usePostHog()

  const featureFlagService = useMemo(() => {
    if (!featureFlagServiceInstance) {
      featureFlagServiceInstance = new FeatureFlagService(postHog)
    }
    return featureFlagServiceInstance
  }, [postHog])

  return featureFlagService
}

/**
 * Hook to check if a specific feature flag is enabled
 * @param flag Feature flag name
 * @returns boolean indicating if flag is enabled
 */
export function useFeatureFlag(flag: string): boolean {
  const featureFlags = useFeatureFlags()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    featureFlags.isEnabled(flag).then(setEnabled)
  }, [flag, featureFlags])

  return enabled
}
