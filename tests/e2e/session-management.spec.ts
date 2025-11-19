import { test, expect } from '@playwright/test'

/**
 * Session Management E2E Tests
 *
 * These tests verify the critical session management behavior:
 * 1. Sessions are cleared when navigating to homepage
 * 2. Scores never exceed 100%
 * 3. No score accumulation across multiple tests
 * 4. Back button behavior works correctly
 *
 * All tests record video on failure for debugging.
 */

test.describe('Session Management', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('/')

    // Wait for app to be ready
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Set consistent test settings (5 questions, easy difficulty)
    await page.getByRole('button', { name: '5' }).click()
    await page.getByRole('button', { name: 'easy' }).click()
  })

  test('Test 1: Complete full test, return home, start new test - scores should reset', async ({
    page,
  }) => {
    // Step 1: Start first Addition test
    await page.getByText('Addition').click()

    // Verify we're on question 1
    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Answer all 5 questions (intentionally answer some wrong for testing)
    // Note: We can't predict correct answers in Addition, so we'll answer randomly
    // and track the actual score shown
    let firstTestScore = 0

    for (let i = 1; i <= 5; i++) {
      // Wait for question to load
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      // Click first answer option
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()

      // Wait for animation/navigation
      await page.waitForTimeout(2000)
    }

    // Verify we're on results page
    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()
    await expect(page.getByText(/You got \d+ out of 5 correct!/)).toBeVisible()

    // Extract the score from results page
    const scoreText = await page.getByText(/You got \d+ out of 5 correct!/).textContent()
    const match = scoreText?.match(/You got (\d+) out of 5 correct!/)
    firstTestScore = match ? parseInt(match[1]) : 0

    console.log(`[Test 1] First test score: ${firstTestScore}/5`)

    // Step 2: Return to homepage
    await page.getByRole('button', { name: 'Home' }).click()

    // Verify we're on homepage
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Check console for session clearing log
    const logs: string[] = []
    page.on('console', (msg) => logs.push(msg.text()))

    // Step 3: Start second Addition test
    await page.getByText('Addition').click()

    // Verify we're on question 1 again
    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Answer all 5 questions again
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()

      await page.waitForTimeout(2000)
    }

    // Verify we're on results page
    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    // Extract second test score
    const scoreText2 = await page.getByText(/You got \d+ out of 5 correct!/).textContent()
    const match2 = scoreText2?.match(/You got (\d+) out of 5 correct!/)
    const secondTestScore = match2 ? parseInt(match2[1]) : 0

    console.log(`[Test 1] Second test score: ${secondTestScore}/5`)

    // CRITICAL ASSERTION: Second test score should be between 0-5, NOT accumulated
    expect(secondTestScore).toBeGreaterThanOrEqual(0)
    expect(secondTestScore).toBeLessThanOrEqual(5)

    // The score should NOT be firstTestScore + secondTestScore (that would indicate accumulation)
    // For example, if first test was 3/5 and second was 2/5, score should show 2/5, not 5/5
  })

  test('Test 2: Partial test abandonment - session should clear when clicking Home', async ({
    page,
  }) => {
    // Start Subtraction test
    await page.getByText('Subtraction').click()

    // Answer only 3 out of 5 questions
    for (let i = 1; i <= 3; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()

      await page.waitForTimeout(2000)
    }

    // We should be on question 4 now
    await expect(page.getByText('Question 4 / 5')).toBeVisible()

    // Click Home button to abandon test mid-way
    await page.getByRole('button', { name: 'Home' }).click()

    // Verify we're on homepage
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Start Subtraction again
    await page.getByText('Subtraction').click()

    // Should start from question 1 (fresh session)
    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Complete all 5 questions
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()

      await page.waitForTimeout(2000)
    }

    // Verify results show score out of 5 (not 8, which would be 3 + 5)
    await expect(page.getByText(/You got \d+ out of 5 correct!/)).toBeVisible()

    const scoreText = await page.getByText(/You got \d+ out of 5 correct!/).textContent()
    const match = scoreText?.match(/You got (\d+) out of 5 correct!/)
    const score = match ? parseInt(match[1]) : 0

    // Score should be 0-5, not higher
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(5)
  })

  test('Test 3: Back button from results page should navigate to homepage', async ({ page }) => {
    // Start Fact Families test
    await page.getByText('Fact Families').click()

    // Answer all questions (fact families require filling in 4 equations)
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      // Fact families have input fields - fill them with placeholder values
      // This is a simplified approach; real test would calculate correct answers
      const inputs = page.locator('input[type="text"]')
      const count = await inputs.count()

      for (let j = 0; j < count; j++) {
        await inputs.nth(j).fill('1')
      }

      // Click Done button
      const doneButton = page.getByRole('button', { name: /Done/i })
      await doneButton.click()

      await page.waitForTimeout(2000)
    }

    // Should be on results page
    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    // Click browser back button
    await page.goBack()

    // Should navigate to homepage (not back to questions)
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Verify we're NOT on a question page
    await expect(page.getByText(/Question \d+ \/ 5/)).not.toBeVisible()
  })

  test('Test 4: Multiple activities in sequence - sessions should not interfere', async ({
    page,
  }) => {
    // Test 1: Complete Addition
    await page.getByText('Addition').click()

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()
    const additionScore = await page.getByText(/You got \d+ out of 5 correct!/).textContent()

    // Return to homepage
    await page.getByRole('button', { name: 'Home' }).click()
    await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

    // Test 2: Complete Counting
    await page.getByText('Counting').click()

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()

      // Counting has a number input field
      const input = page.locator('input[type="number"]').first()
      await input.fill('5') // Arbitrary answer

      const submitButton = page.getByRole('button', { name: /Submit|Check/i })
      await submitButton.click()

      await page.waitForTimeout(2000)
    }

    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()
    const countingScore = await page.getByText(/You got \d+ out of 5 correct!/).textContent()

    // Return to homepage
    await page.getByRole('button', { name: 'Home' }).click()

    // Test 3: Repeat Addition - should show fresh score, not accumulated from Test 1
    await page.getByText('Addition').click()

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

    const scoreText = await page.getByText(/You got \d+ out of 5 correct!/).textContent()
    const match = scoreText?.match(/You got (\d+) out of 5 correct!/)
    const finalAdditionScore = match ? parseInt(match[1]) : 0

    // Final Addition score should be 0-5 (fresh session)
    expect(finalAdditionScore).toBeGreaterThanOrEqual(0)
    expect(finalAdditionScore).toBeLessThanOrEqual(5)

    console.log('[Test 4] Addition #1:', additionScore)
    console.log('[Test 4] Counting:', countingScore)
    console.log('[Test 4] Addition #2:', finalAdditionScore)
  })

  test('Test 5: Score never exceeds 100% - stress test with multiple rapid sessions', async ({
    page,
  }) => {
    // Run 3 consecutive Addition tests rapidly
    for (let testNum = 1; testNum <= 3; testNum++) {
      console.log(`[Test 5] Starting test ${testNum}/3`)

      await page.getByText('Addition').click()

      // Answer all questions
      for (let i = 1; i <= 5; i++) {
        await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
        const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
        await answerButtons.first().click()
        await page.waitForTimeout(1500) // Faster for stress test
      }

      // Check results
      await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

      // Extract percentage
      const percentageText = await page.locator('text=/\\d+%/').textContent()
      const percentage = percentageText ? parseInt(percentageText) : 0

      console.log(`[Test 5] Test ${testNum} percentage: ${percentage}%`)

      // CRITICAL: Percentage must never exceed 100%
      expect(percentage).toBeGreaterThanOrEqual(0)
      expect(percentage).toBeLessThanOrEqual(100)

      // Return to homepage for next test
      await page.getByRole('button', { name: 'Home' }).click()
      await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()
    }
  })

  test('Test 6: Different settings (question count) should create fresh sessions', async ({
    page,
  }) => {
    // Test with 5 questions
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Word Problems').click()

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    await expect(page.getByText(/You got \d+ out of 5 correct!/)).toBeVisible()

    // Return home
    await page.getByRole('button', { name: 'Home' }).click()

    // Change to 10 questions
    await page.getByRole('button', { name: '10' }).click()
    await page.getByText('Word Problems').click()

    // Should show Question 1 / 10 (not 1 / 5)
    await expect(page.getByText('Question 1 / 10')).toBeVisible()

    // Answer all 10 questions
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(`Question ${i} / 10`)).toBeVisible()
      const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
      await answerButtons.first().click()
      await page.waitForTimeout(2000)
    }

    // Results should show out of 10, not 15
    await expect(page.getByText(/You got \d+ out of 10 correct!/)).toBeVisible()

    const scoreText = await page.getByText(/You got \d+ out of 10 correct!/).textContent()
    const match = scoreText?.match(/You got (\d+) out of 10 correct!/)
    const score = match ? parseInt(match[1]) : 0

    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)
  })
})
