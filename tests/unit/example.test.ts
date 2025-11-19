import { describe, test, expect } from 'bun:test'

/**
 * Example Bun unit test
 *
 * This demonstrates how to write unit tests using Bun's native test runner.
 * These tests are separate from Playwright E2E tests.
 *
 * Run with: bun test
 */

describe('Example Unit Tests', () => {
  test('math operations work correctly', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
  })

  test('string operations work correctly', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
    expect('world'.length).toBe(5)
    expect('test'.includes('es')).toBe(true)
  })

  test('array operations work correctly', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
    expect(arr.map((x) => x * 2)).toEqual([2, 4, 6])
  })
})

/**
 * Future unit tests should go in this directory:
 * - tests/unit/utils/*.test.ts - Utility function tests
 * - tests/unit/generators/*.test.ts - Problem generator tests
 * - tests/unit/hooks/*.test.ts - React hook tests (with happy-dom)
 *
 * For E2E tests, see tests/e2e/ and run with: bun run test:e2e
 */
