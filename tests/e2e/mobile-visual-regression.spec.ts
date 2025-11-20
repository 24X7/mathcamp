import { test, expect } from '@playwright/test'

/**
 * Mobile Visual Regression Tests
 *
 * Tests mobile viewport rendering, text scaling, and error states.
 * Captures screenshots for visual inspection.
 *
 * Devices tested:
 * - iPhone 12 (390x844)
 * - iPhone SE (375x667) - Small screen
 * - Pixel 5 (393x851)
 * - Galaxy S8 (360x740) - Small Android
 */

// Configure viewport sizes
const mobileDevices = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Galaxy S8', width: 360, height: 740 },
]

test.describe('Mobile Visual Regression', () => {
  for (const device of mobileDevices) {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      test.use({
        viewport: { width: device.width, height: device.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      })

      test('Homepage renders correctly', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

        // Take full page screenshot
        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-homepage.png`,
          fullPage: true,
        })

        // Check that activity cards are visible and properly sized
        const cards = page.locator('text=Addition')
        await expect(cards).toBeVisible()

        // Verify text is readable (not too small)
        const heading = page.getByRole('heading', { name: 'MathCamp' })
        const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize)
        console.log(`[${device.name}] Homepage title font size: ${fontSize}`)
      })

      test('Addition problem equation scales correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Addition').click()

        // Wait for question to load
        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        // Take screenshot of addition problem
        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-addition-normal.png`,
          fullPage: true,
        })

        // Check equation numbers visibility
        const equation = page.locator('div[class*="text-"]').filter({ hasText: /\d+/ }).first()
        const box = await equation.boundingBox()

        if (box) {
          console.log(`[${device.name}] Equation dimensions: ${box.width}x${box.height}`)
        }

        // Verify plus/minus signs are visible
        const operator = page.locator('text=/[+−-]/')
        await expect(operator).toBeVisible()
      })

      test('Addition problem - wrong answer error state', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Addition').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        // Click any answer (will likely be wrong)
        const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
        await answerButtons.first().click()

        // Wait for feedback to appear (2.5s for wrong, 1.5s for correct)
        await page.waitForTimeout(500)

        // Take screenshot during error state
        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-addition-error.png`,
          fullPage: true,
        })

        // Check if error indicators are visible
        const hasRedX = await page.locator('text=✗').isVisible().catch(() => false)
        const hasGreenCheck = await page.locator('text=✓').isVisible().catch(() => false)

        console.log(`[${device.name}] Error state - Red X: ${hasRedX}, Green Check: ${hasGreenCheck}`)
      })

      test('Subtraction problem equation scales correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Subtraction').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-subtraction-normal.png`,
          fullPage: true,
        })
      })

      test('Subtraction problem - wrong answer error state', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Subtraction').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
        await answerButtons.first().click()
        await page.waitForTimeout(500)

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-subtraction-error.png`,
          fullPage: true,
        })
      })

      test('Word problem text wraps correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Word Problems').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-word-problem.png`,
          fullPage: true,
        })

        // Check if text overflows
        const problemText = page.locator('text=/dog|cat|bird|apple|banana/i').first()
        const textBox = await problemText.boundingBox()

        if (textBox) {
          console.log(`[${device.name}] Word problem text width: ${textBox.width}px`)
          expect(textBox.width).toBeLessThanOrEqual(device.width - 32) // 16px padding each side
        }
      })

      test('Fact Family house renders correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Fact Families').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-fact-family.png`,
          fullPage: true,
        })

        // Check if house SVG fits in viewport
        const house = page.locator('svg').first()
        const svgBox = await house.boundingBox()

        if (svgBox) {
          console.log(`[${device.name}] Fact family house dimensions: ${svgBox.width}x${svgBox.height}`)
          expect(svgBox.width).toBeLessThanOrEqual(device.width)
        }
      })

      test('Counting items render correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Counting').click()

        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-counting.png`,
          fullPage: true,
        })
      })

      test('Results page displays correctly', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Addition').click()

        // Answer all 5 questions quickly
        for (let i = 1; i <= 5; i++) {
          await expect(page.getByText(`Question ${i} / 5`)).toBeVisible()
          const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
          await answerButtons.first().click()
          await page.waitForTimeout(2000)
        }

        await expect(page.getByRole('heading', { name: 'Great Job!' })).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-results.png`,
          fullPage: true,
        })

        // Check if percentage is large enough
        const percentage = page.locator('div.text-6xl').filter({ hasText: /\d+%/ })
        const percentBox = await percentage.boundingBox()

        if (percentBox) {
          console.log(`[${device.name}] Percentage display size: ${percentBox.width}x${percentBox.height}`)
        }
      })

      test('Touch targets meet minimum size (48x48px)', async ({ page }) => {
        await page.goto('/')

        // Check activity card touch targets
        const additionCard = page.getByText('Addition')
        const cardBox = await additionCard.boundingBox()

        if (cardBox) {
          console.log(`[${device.name}] Activity card size: ${cardBox.width}x${cardBox.height}`)
          expect(cardBox.height).toBeGreaterThanOrEqual(48)
        }

        // Check settings buttons
        const button5 = page.getByRole('button', { name: '5' }).first()
        const buttonBox = await button5.boundingBox()

        if (buttonBox) {
          console.log(`[${device.name}] Settings button size: ${buttonBox.width}x${buttonBox.height}`)
          expect(buttonBox.width).toBeGreaterThanOrEqual(48)
          expect(buttonBox.height).toBeGreaterThanOrEqual(48)
        }
      })

      test('Landscape orientation works', async ({ page }) => {
        // Rotate to landscape
        await page.setViewportSize({ width: device.height, height: device.width })

        await page.goto('/')
        await expect(page.getByRole('heading', { name: 'MathCamp' })).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-landscape-homepage.png`,
          fullPage: true,
        })

        // Start a question in landscape
        await page.getByRole('button', { name: '5' }).click()
        await page.getByText('Addition').click()
        await expect(page.getByText('Question 1 / 5')).toBeVisible()

        await page.screenshot({
          path: `test-results/mobile-${device.name.replace(/\s+/g, '-')}-landscape-question.png`,
          fullPage: true,
        })
      })
    })
  }
})

test.describe('Mobile Specific Issues', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE - smallest common size
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })

  test('Text remains readable at smallest viewport', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Addition').click()

    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Get all text elements and check font sizes
    const numbers = page.locator('div[class*="text-"]').filter({ hasText: /^\d+$/ })
    const count = await numbers.count()

    for (let i = 0; i < Math.min(count, 3); i++) {
      const fontSize = await numbers.nth(i).evaluate((el) => {
        const style = window.getComputedStyle(el)
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          width: el.offsetWidth,
          height: el.offsetHeight,
        }
      })

      console.log(`Number ${i + 1} styles:`, fontSize)

      // Font size should be at least 16px for readability
      const size = parseInt(fontSize.fontSize)
      expect(size).toBeGreaterThanOrEqual(16)
    }
  })

  test('Equation components do not overlap', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Addition').click()

    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Get bounding boxes of equation parts
    const numbers = page.locator('div[class*="text-"]').filter({ hasText: /^\d+$/ })
    const count = await numbers.count()

    const boxes = []
    for (let i = 0; i < Math.min(count, 3); i++) {
      const box = await numbers.nth(i).boundingBox()
      if (box) boxes.push(box)
    }

    // Check for overlaps
    for (let i = 0; i < boxes.length - 1; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const box1 = boxes[i]
        const box2 = boxes[j]

        const overlap =
          box1.x < box2.x + box2.width &&
          box1.x + box1.width > box2.x &&
          box1.y < box2.y + box2.height &&
          box1.y + box1.height > box2.y

        if (overlap) {
          console.log(`WARNING: Elements ${i} and ${j} overlap!`, box1, box2)
        }

        expect(overlap).toBe(false)
      }
    }
  })

  test('Error feedback is visible on small screens', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: '5' }).click()
    await page.getByText('Addition').click()

    await expect(page.getByText('Question 1 / 5')).toBeVisible()

    // Click an answer
    const answerButtons = page.locator('button[class*="bg-"]').filter({ hasText: /^\d+$/ })
    const firstButton = answerButtons.first()
    const buttonText = await firstButton.textContent()
    await firstButton.click()

    // Wait for feedback
    await page.waitForTimeout(1000)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/mobile-error-feedback-detail.png',
      fullPage: true,
    })

    // Check if error indicators are within viewport
    const viewport = page.viewportSize()!
    const feedbackElements = page.locator('text=/✓|✗/')

    const feedbackCount = await feedbackElements.count()
    if (feedbackCount > 0) {
      for (let i = 0; i < feedbackCount; i++) {
        const box = await feedbackElements.nth(i).boundingBox()
        if (box) {
          console.log(`Feedback element ${i} position:`, box)
          expect(box.x).toBeGreaterThanOrEqual(0)
          expect(box.y).toBeGreaterThanOrEqual(0)
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
        }
      }
    }
  })
})
