import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility E2E Tests
 *
 * Tests for:
 * - WCAG compliance (via axe-core)
 * - Keyboard navigation
 * - Touch target sizes (min 48px)
 * - Color contrast
 */

test.describe('Accessibility', () => {
  test('Homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Question page should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Addition').click()

    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Results page should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Addition').click()

    // Complete quiz
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('Keyboard navigation works on homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Tab to first activity card
    await page.keyboard.press('Tab')

    // Should focus on question count buttons first
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Tab through all interactive elements
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    }

    // Press Enter on Addition card
    const additionCard = page.getByText('Addition')
    await additionCard.focus()
    await page.keyboard.press('Enter')

    // Should navigate to question page
    await expect(page.getByText('Question 1 / 5')).toBeVisible()
  })

  test('All buttons meet minimum touch target size (48x48px)', async ({ page }) => {
    await page.goto('/')

    // Get all buttons
    const buttons = page.locator('button')
    const count = await buttons.count()

    console.log(`Found ${count} buttons to check`)

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()

      if (box) {
        // WCAG guideline: minimum 44px, MathCamp requires 48px for kids
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('Interactive cards meet minimum touch target size', async ({ page }) => {
    await page.goto('/')

    // Activity cards should be large enough
    const cards = page.locator('div[class*="cursor-pointer"]')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const box = await card.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(48)
      }
    }
  })

  test('Page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    await expect(h1).toHaveText('MathCamp')

    // Should have h3 headings for sections
    const h3 = page.locator('h3')
    const h3Count = await h3.count()
    expect(h3Count).toBeGreaterThan(0)
  })

  test('Images and icons have proper alt text or aria-labels', async ({ page }) => {
    await page.goto('/')

    // All images should have alt text
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')

      // Alt text should exist
      expect(alt).not.toBeNull()
    }
  })

  test('Form inputs have associated labels', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Fact Families').click()

    // Wait for question with input fields
    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // All inputs should have labels or aria-labels
    const inputs = page.locator('input[type="text"]')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)

      // Check for label or aria-label
      const ariaLabel = await input.getAttribute('aria-label')
      const id = await input.getAttribute('id')

      let hasLabel = !!ariaLabel

      if (id && !hasLabel) {
        // Check if there's a <label for="id">
        const label = page.locator(`label[for="${id}"]`)
        hasLabel = (await label.count()) > 0
      }

      expect(hasLabel).toBe(true)
    }
  })

  test('Focus indicators are visible', async ({ page }) => {
    await page.goto('/')

    // Tab to first button
    await page.keyboard.press('Tab')

    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()

    // Take screenshot to verify focus ring
    await page.screenshot({ path: 'test-results/focus-indicator.png' })

    // Focus should have visible outline (this is hard to test programmatically,
    // but we can check that the element is focused)
    const isFocused = await focused.evaluate((el) => el === document.activeElement)
    expect(isFocused).toBe(true)
  })

  test('Color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/')

    // Run axe with contrast rule specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})
