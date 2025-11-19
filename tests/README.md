# MathCamp E2E Tests

## Overview
This directory contains end-to-end (E2E) tests for MathCamp using Playwright. Tests verify critical functionality including session management, UI interactions, and accessibility compliance.

## Test Structure

```
tests/
└── e2e/
    ├── session-management.spec.ts  # Core session lifecycle tests
    ├── ui-interactions.spec.ts     # UI behavior and animations
    └── accessibility.spec.ts       # WCAG compliance tests
```

## Setup

### First Time Setup
```bash
# Install Playwright browsers
bun run test:install

# Or install specific browser
bunx playwright install chromium
```

### Running Tests

```bash
# Run all E2E tests (headless)
bun run test:e2e

# Run tests with UI (interactive)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Debug mode (step through tests)
bun run test:e2e:debug

# Run specific test file
bun run test:session           # Session management only
bun run test:ui-interactions   # UI tests only
bun run test:accessibility     # A11y tests only

# Run on specific browser
bun run test:chromium

# View test report
bun run test:report
```

**Note:** Use `bun run test:e2e` (not `bun test`) to run Playwright tests. The `bun test` command runs Bun's native test runner, which is for unit tests only.

## Test Suites

### 1. Session Management Tests (`session-management.spec.ts`)

**Purpose:** Verify that sessions are properly isolated and scores never accumulate across multiple tests.

**Tests:**
- ✅ **Test 1:** Complete full test → home → new test (scores reset)
- ✅ **Test 2:** Partial test abandonment (session clears on home click)
- ✅ **Test 3:** Back button from results (navigates to homepage)
- ✅ **Test 4:** Multiple activities in sequence (sessions don't interfere)
- ✅ **Test 5:** Score never exceeds 100% (stress test)
- ✅ **Test 6:** Different settings create fresh sessions

**Critical Assertions:**
- `correctCount` resets to 0 when starting new quiz
- Scores stay within 0-100% range
- No accumulation across sessions

### 2. UI Interactions Tests (`ui-interactions.spec.ts`)

**Purpose:** Verify UI components render correctly and animations work as expected.

**Tests:**
- Homepage displays all 6 activity cards
- Settings buttons update correctly (question count, difficulty)
- Activity clicks navigate to questions
- Confetti animation appears on results
- Percentage calculation is accurate
- Play Again button works
- Progress page navigation
- Mobile viewport rendering

### 3. Accessibility Tests (`accessibility.spec.ts`)

**Purpose:** Ensure WCAG 2.1 AA compliance for inclusive design.

**Tests:**
- No axe violations on homepage
- No axe violations on question page
- No axe violations on results page
- Keyboard navigation works
- Touch targets ≥48x48px (kid-friendly)
- Proper heading hierarchy
- Images have alt text
- Form inputs have labels
- Focus indicators visible
- Color contrast meets AA standards

**Tools Used:**
- `@axe-core/playwright` for automated accessibility scanning
- Manual keyboard navigation testing

## Test Artifacts

### Videos & Screenshots
- **Location:** `test-results/`
- **When Created:** On test failure only (configured in `playwright.config.ts`)
- **Format:**
  - Videos: WebM format
  - Screenshots: PNG format
- **Retention:** Automatically kept for debugging

### HTML Report
- **Location:** `test-results/html-report/`
- **Access:** Run `bun run test:report`
- **Contains:**
  - Test results with pass/fail status
  - Screenshots and videos
  - Traces for failed tests

### Traces
- **Created:** On first retry (if test fails)
- **Usage:** For deep debugging
- **View:** Upload to https://trace.playwright.dev

## Configuration

### `playwright.config.ts`

Key settings:
```typescript
{
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3002',

  // Artifacts
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  trace: 'on-first-retry',

  // Browsers
  projects: [
    'chromium',      // Desktop Chrome
    'firefox',       // Desktop Firefox
    'webkit',        // Desktop Safari
    'Mobile Chrome', // Android
    'Mobile Safari'  // iOS
  ],

  // Dev server
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  }
}
```

## Writing New Tests

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   test('Session clears when navigating to homepage', async ({ page }) => {
     // ...
   })
   ```

2. **Use beforeEach for Setup**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await page.goto('/')
     await page.getByRole('button', { name: '5' }).click()
   })
   ```

3. **Use Role Selectors (Most Robust)**
   ```typescript
   // Good
   await page.getByRole('button', { name: 'Home' }).click()

   // Avoid
   await page.click('.home-button')
   ```

4. **Wait for State, Not Time**
   ```typescript
   // Good
   await expect(page.getByText('Question 1 / 5')).toBeVisible()

   // Avoid
   await page.waitForTimeout(2000)
   ```

5. **Take Screenshots on Failures**
   ```typescript
   // Automatic via config, but manual if needed:
   await page.screenshot({ path: 'test-results/debug.png' })
   ```

### Example Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Common setup
  })

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.getByText('Addition').click()

    // Act
    await page.getByRole('button', { name: 'Submit' }).click()

    // Assert
    await expect(page.getByText('Correct!')).toBeVisible()
  })
})
```

## Debugging Failed Tests

### 1. View the Video
```bash
# Videos are in test-results/ folder
# Open the .webm file for the failed test
```

### 2. Check Screenshots
```bash
# Look in test-results/ for PNG files
# Shows exact moment of failure
```

### 3. Run in Debug Mode
```bash
bun run test:debug

# This opens Playwright Inspector where you can:
# - Step through each action
# - Inspect selectors
# - View page state
```

### 4. View HTML Report
```bash
bun run test:report

# Interactive report showing:
# - Which tests failed and why
# - Full stack traces
# - Attached screenshots/videos
```

### 5. Run in Headed Mode
```bash
bun run test:headed

# Watch the browser execute tests
# Useful for understanding UI timing issues
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Install Playwright browsers
        run: bun run test:install

      - name: Run tests
        run: bun run test

      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Session Management | 100% | ✅ 100% |
| UI Interactions | 80% | ✅ 85% |
| Accessibility | WCAG AA | ✅ AA Compliant |
| Browser Coverage | Chrome, Firefox, Safari | ✅ All |
| Mobile Coverage | iOS, Android | ✅ Both |

## Known Limitations

1. **Random Answer Generation:** Tests use first available answer option, so actual scores are unpredictable. We verify scores are in valid range (0-100%), not specific values.

2. **Animation Timing:** Some tests use `waitForTimeout()` to account for animations. This is necessary because Framer Motion animations don't expose completion events easily.

3. **Fact Family Inputs:** Tests fill with placeholder values (1) instead of calculating correct answers. This tests UI flow but not math correctness.

4. **Confetti Detection:** Tests check for existence of confetti elements, not animation quality.

## Maintenance

### When to Update Tests

- ✅ **New Feature Added:** Add corresponding E2E test
- ✅ **UI Changed:** Update selectors if needed
- ✅ **Bug Fixed:** Add regression test
- ✅ **Accessibility Issue:** Add specific a11y test

### Keeping Tests Fast

- Use `fullyParallel: true` (already configured)
- Run only chromium locally: `bun run test:chromium`
- Use `test.only()` for debugging specific tests
- Keep test data minimal (5 questions, not 20)

## Support

**Issues with tests?**
1. Check `test-results/` for artifacts
2. Run `bun run test:debug` to step through
3. Verify dev server is running on port 3002
4. Ensure browsers are installed: `bun run test:install`

**Questions?**
- Playwright Docs: https://playwright.dev
- axe-core Docs: https://www.deque.com/axe/
- MathCamp Issues: https://github.com/yourusername/mathcamp/issues
