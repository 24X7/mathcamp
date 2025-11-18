// Feature flag service with PostHog remote flags + local fallbacks
import type PostHog from 'posthog-js'

// Local feature flag defaults (used when offline or PostHog unavailable)
export const LOCAL_FEATURE_FLAGS: Record<string, boolean> = {
  // Math activities
  'multiplication-activity': false,
  'division-activity': false,
  'fractions-activity': false,

  // UI features
  'new-confetti-animation': true,
  'sound-effects': true,
  'adaptive-difficulty': true,
  'parent-dashboard': true,

  // Experimental
  'ai-hints': false,
  'voice-input': false,
  'multiplayer-mode': false,
}

export class FeatureFlagService {
  constructor(private postHog: PostHog | null) {}

  /**
   * Check if a feature flag is enabled
   * Tries PostHog first, falls back to local config
   */
  async isEnabled(flag: string): Promise<boolean> {
    if (!this.postHog) {
      return this.getLocalFlag(flag)
    }

    try {
      const remote = this.postHog.isFeatureEnabled(flag)

      // PostHog returns undefined if flag hasn't loaded yet
      if (remote !== undefined) {
        return remote
      }

      // Fallback to local
      return this.getLocalFlag(flag)
    } catch (error) {
      console.warn(`Error checking feature flag ${flag}:`, error)
      return this.getLocalFlag(flag)
    }
  }

  /**
   * Get feature flag variant (for A/B testing)
   */
  getVariant(flag: string): string | boolean | null {
    if (!this.postHog) {
      return null
    }

    try {
      return this.postHog.getFeatureFlag(flag)
    } catch (error) {
      console.warn(`Error getting feature flag variant ${flag}:`, error)
      return null
    }
  }

  /**
   * Get local flag value
   */
  private getLocalFlag(flag: string): boolean {
    return LOCAL_FEATURE_FLAGS[flag] ?? false
  }

  /**
   * Get all enabled flags (for debugging)
   */
  getEnabledFlags(): string[] {
    return Object.entries(LOCAL_FEATURE_FLAGS)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
  }
}
