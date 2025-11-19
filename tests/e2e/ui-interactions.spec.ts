import { test, expect } from '@playwright/test'

/**
 * UI Interactions E2E Tests
 *
 * Tests for:
 * - Animations and transitions
 * - Button interactions
 * - Navigation flows
 * - Visual feedback (confetti, etc.)
 */

test.describe('UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Set to 5 questions, easy difficulty
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'easy' }).click()
  })

  test('Homepage displays all activity cards', async ({ page }) => {
    // Verify all 6 activities are shown
    await expect(page.getByText('Addition')).toBeVisible()
    await expect(page.getByText('Subtraction')).toBeVisible()
    await expect(page.getByText('Fact Families')).toBeVisible()
    await expect(page.getByText('Word Problems')).toBeVisible()
    await expect(page.getByText('Counting')).toBeVisible()
    await expect(page.getByText('Number Sequences')).toBeVisible()

    // Verify emojis are visible
    await expect(page.locator('text=➕')).toBeVisible()
    await expect(page.locator('text=➖')).toBeVisible()
    await expect(page.locator('text=🏠')).toBeVisible()
    await expect(page.locator('text=📖')).toBeVisible()
    await expect(page.locator('text=🔢')).toBeVisible()
    await expect(page.locator('text=⬆️')).toBeVisible()
  })

  test('Settings buttons update correctly', async ({ page }) => {
    // Test question count selector
    const button5 = page.getByRole('button', { name: '5' }).first()
    const button10 = page.getByRole('button', { name: '10' })
    const button20 = page.getByRole('button', { name: '20' })

    // Click 10
    await button10.click()
    await expect(button10).toHaveClass(/bg-blue-600/)
    await expect(button5).not.toHaveClass(/bg-blue-600/)

    // Click 20
    await button20.click()
    await expect(button20).toHaveClass(/bg-blue-600/)
    await expect(button10).not.toHaveClass(/bg-blue-600/)

    // Test difficulty selector
    const easyBtn = page.getByRole('button', { name: 'easy' })
    const mediumBtn = page.getByRole('button', { name: 'medium' })
    const hardBtn = page.getByRole('button', { name: 'hard' })

    await mediumBtn.click()
    await expect(mediumBtn).toHaveClass(/bg-blue-600/)
    await expect(easyBtn).not.toHaveClass(/bg-blue-600/)

    await hardBtn.click()
    await expect(hardBtn).toHaveClass(/bg-blue-600/)
    await expect(mediumBtn).not.toHaveClass(/bg-blue-600/)
  })

  test('Activity card click navigates to questions', async ({ page }) => {
    await page.getByText('Addition').click()

    // Should navigate to first question
    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Home button should be visible
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible()
  })

  test('Confetti animation appears on results page', async ({ page }) => {
    await page.getByText('Addition').click()

    // Answer all questions
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5'`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    // Results page should show
    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    // Check for confetti elements (they have specific styles)
    // Confetti creates div elements with absolute positioning
    const confettiElements = page.locator('div[style*="position: fixed"]')
    const count = await confettiElements.count()

    // Should have confetti pieces (at least 1)
    expect(count).toBeGreaterThan(0)
  })

  test('Results page displays correct percentage calculation', async ({ page }) => {
    await page.getByText('Addition').click()

    // Answer all questions (we'll answer randomly)
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    // Extract score
    const scoreText = await page.getByText(/You got \d+ out of 5 correct!/).textContent()
    const match = scoreText?.match(/You got (\d+) out of 5 correct!/)
    const correct = match ? parseInt(match[1]) : 0

    // Calculate expected percentage
    const expectedPercentage = Math.round((correct / 5) * 100)

    // Verify percentage displayed matches calculation
    const percentageElement = page.locator('div.text-6xl.font-bold.text-accent-500')
    await expect(percentageElement).toHaveText(`${expectedPercentage}%`)
  })

  test('Play Again button starts fresh quiz', async ({ page }) => {
    await page.getByText('Subtraction').click()

    // Complete first quiz
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    // Click "Play Again"
    await page.getByRole('button', { name: 'Play Again' }).click()

    // Should start at question 1 with fresh session
    await expect(page.getByText('Question 1 / 5')).toBeVisible()
  })

  test('Progress button navigates to progress page', async ({ page }) => {
    await page.getByRole('button', { name: 'Progress' }).click()

    // Should be on progress page
    await expect(page.getByRole('heading', { name: /Progress|Statistics|Your Stats/i })).toBeVisible()

    // Should have back button or home button
    const homeButton = page.getByRole('button', { name: /Home|Back/i })
    await expect(homeButton).toBeVisible()
  })

  test('Mobile viewport renders correctly', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that cards stack vertically on mobile
      const cards = page.locator('div[class*="grid-cols"]')
      await expect(cards).toBeVisible()

      // Buttons should be large enough for touch
      const additionCard = page.getByText('Addition')
      const box = await additionCard.boundingBox()

      // Minimum 48px touch target (accessibility requirement)
      expect(box?.height).toBeGreaterThanOrEqual(48)
    }
  })
})
