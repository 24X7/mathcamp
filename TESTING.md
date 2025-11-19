# MathCamp Testing Guide

## Quick Start

```bash
# 1. Install Playwright browsers (first time only)
bun run test:install

# 2. Run all E2E tests
bun run test:e2e

# 3. View test report
bun run test:report
```

## Test Commands

### Unit Tests (Bun)

```bash
# Run Bun unit tests (tests/unit/)
bun test

# Run unit tests in watch mode
bun test --watch

# Run specific test file
bun test tests/unit/example.test.ts
```

**Note:** Bun unit tests are in `tests/unit/` and use Bun's native test runner.

### E2E Tests (Playwright)

```bash
# Run all E2E tests (headless, all browsers)
bun run test:e2e

# Interactive mode with UI
bun run test:e2e:ui

# Watch tests run in browser (headed mode)
bun run test:e2e:headed

# Debug mode (step through tests)
bun run test:e2e:debug

# Run specific test suite
bun run test:session           # Session management tests
bun run test:ui-interactions   # UI interaction tests
bun run test:accessibility     # Accessibility tests

# Run on specific browser only
bun run test:chromium          # Chrome only (fastest)

# View HTML test report
bun run test:report
```

## Important Notes

### ⚠️ Use Correct Command

- **✅ Correct:** `bun run test:e2e`
- **❌ Wrong:** `bun test` (this runs Bun's unit test runner, not Playwright)

Playwright tests MUST be run with `bunx playwright test` or the npm scripts that use it.

### 📦 Test Artifacts

When tests fail, Playwright automatically generates:

- **Videos:** `test-results/*.webm`
- **Screenshots:** `test-results/*.png`
- **Traces:** `test-results/*.zip`
- **HTML Report:** `test-results/html-report/`

All artifacts are **gitignored** but kept locally for debugging.

## Test Suites

### 1. Session Management (6 tests)
**File:** `tests/e2e/session-management.spec.ts`

Verifies critical session lifecycle:
- ✅ Sessions reset when returning to homepage
- ✅ Scores never exceed 100%
- ✅ No accumulation across multiple tests
- ✅ Back button behavior works correctly

**Run:** `bun run test:session`

### 2. UI Interactions (8 tests)
**File:** `tests/e2e/ui-interactions.spec.ts`

Tests UI behavior:
- Homepage displays all activities
- Settings buttons work
- Animations appear (confetti)
- Navigation flows correctly
- Mobile viewport rendering

**Run:** `bun run test:ui-interactions`

### 3. Accessibility (10 tests)
**File:** `tests/e2e/accessibility.spec.ts`

WCAG 2.1 AA compliance:
- No accessibility violations
- Keyboard navigation works
- Touch targets ≥48px
- Color contrast passes
- Proper ARIA labels

**Run:** `bun run test:accessibility`

## Debugging Failed Tests

### Step 1: View HTML Report
```bash
bun run test:report
```
Opens interactive report with:
- Test results
- Screenshots at failure point
- Videos of test execution
- Full error stack traces

### Step 2: Run in Debug Mode
```bash
bun run test:e2e:debug
```
Opens Playwright Inspector to:
- Step through each action
- Inspect selectors
- View page state
- Modify tests live

### Step 3: Run in Headed Mode
```bash
bun run test:e2e:headed
```
Watch browser execute tests in real-time.

## Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Session Management | 6 | ✅ Critical flows covered |
| UI Interactions | 8 | ✅ All major UI elements |
| Accessibility | 10 | ✅ WCAG AA compliant |
| **Total** | **24** | **100% E2E coverage** |

## CI/CD Integration

### GitHub Actions

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

      - name: Install Playwright
        run: bun run test:install

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

## Project Structure

```
mathcamp/
├── tests/
│   ├── e2e/                           # Playwright E2E tests
│   │   ├── session-management.spec.ts
│   │   ├── ui-interactions.spec.ts
│   │   └── accessibility.spec.ts
│   ├── unit/                          # Future Bun unit tests
│   └── README.md                      # Detailed test docs
├── test-results/                      # Gitignored artifacts
│   ├── *.webm                         # Videos
│   ├── *.png                          # Screenshots
│   └── html-report/                   # Interactive report
├── playwright.config.ts               # Playwright configuration
└── bunfig.toml                        # Bun test configuration
```

## Configuration Files

### `playwright.config.ts`
- Configures browsers (Chrome, Firefox, Safari, Mobile)
- Sets base URL (http://localhost:3002)
- Enables video/screenshot on failure
- Auto-starts dev server

### `bunfig.toml`
- Configures Bun's test runner
- Excludes Playwright tests
- Points to `tests/unit/` for future unit tests

## FAQs

### Q: Why does `bun test` fail?
**A:** `bun test` runs Bun's native test runner, not Playwright. Use `bun run test:e2e` instead.

### Q: Where are test videos stored?
**A:** In `test-results/` directory (gitignored). View them in the HTML report with `bun run test:report`.

### Q: Can I run tests on only one browser?
**A:** Yes! Use `bun run test:chromium` to run on Chrome only (fastest option).

### Q: How do I debug a failing test?
**A:**
1. Run `bun run test:report` to see what failed
2. Run `bun run test:e2e:debug` to step through
3. Check videos in `test-results/`

### Q: Do tests run in parallel?
**A:** Yes, tests run in parallel across files by default (configured in `playwright.config.ts`).

### Q: Can I run tests in watch mode?
**A:** Use `bun run test:e2e:ui` for interactive mode with live updates.

## Best Practices

1. **Always install browsers first:**
   ```bash
   bun run test:install
   ```

2. **Run chromium only during development:**
   ```bash
   bun run test:chromium  # Faster than all browsers
   ```

3. **Use debug mode for failing tests:**
   ```bash
   bun run test:e2e:debug
   ```

4. **Check the report after failures:**
   ```bash
   bun run test:report
   ```

5. **Keep dev server running:**
   - Playwright auto-starts it, but if you have it running, tests start faster

## Resources

- **Detailed Test Docs:** [tests/README.md](./tests/README.md)
- **Session Architecture:** [SESSION_MANAGEMENT.md](./SESSION_MANAGEMENT.md)
- **Playwright Docs:** https://playwright.dev
- **Axe Accessibility:** https://www.deque.com/axe/

## Support

**Tests not working?**
1. Ensure browsers are installed: `bun run test:install`
2. Check dev server is accessible: http://localhost:3002
3. View logs in `test-results/`
4. Run in debug mode: `bun run test:e2e:debug`

**Found a bug in tests?**
Open an issue with:
- Test command used
- Error message
- Video/screenshot from `test-results/`
