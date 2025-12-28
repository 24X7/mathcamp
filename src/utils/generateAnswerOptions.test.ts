import { describe, expect, it } from 'bun:test'
import { generateAnswerOptions, validateAnswerOptions } from './generateAnswerOptions'

describe('generateAnswerOptions', () => {
  it('generates exactly 4 unique options by default', () => {
    const { options, isValid } = generateAnswerOptions(10)
    
    expect(isValid).toBe(true)
    expect(options.length).toBe(4)
    expect(new Set(options).size).toBe(4) // All unique
  })

  it('includes the correct answer exactly once', () => {
    for (let i = 0; i < 20; i++) {
      const correctAnswer = Math.floor(Math.random() * 20) + 1
      const { options, isValid } = generateAnswerOptions(correctAnswer)
      
      expect(isValid).toBe(true)
      const correctCount = options.filter(opt => opt === correctAnswer).length
      expect(correctCount).toBe(1)
    }
  })

  it('handles small answers (edge case)', () => {
    // This was the bug - small answers could cause infinite loops
    const { options, isValid } = generateAnswerOptions(1, 4, 0)
    
    expect(isValid).toBe(true)
    expect(options.length).toBe(4)
    expect(options).toContain(1)
  })

  it('handles answer of 0', () => {
    const { options, isValid } = generateAnswerOptions(0, 4, 0)
    
    expect(isValid).toBe(true)
    expect(options.length).toBe(4)
    expect(options).toContain(0)
  })

  it('respects minValue constraint', () => {
    const { options } = generateAnswerOptions(5, 4, 2)
    
    expect(options.every(opt => opt >= 2)).toBe(true)
  })

  it('generates different shuffled orders', () => {
    // Run multiple times and check that we get different orderings
    const results = new Set<string>()
    
    for (let i = 0; i < 10; i++) {
      const { options } = generateAnswerOptions(10)
      results.add(options.join(','))
    }
    
    // Should have at least 2 different orderings in 10 runs
    expect(results.size).toBeGreaterThanOrEqual(2)
  })

  it('generates custom count of options', () => {
    const { options, isValid } = generateAnswerOptions(10, 6)
    
    expect(isValid).toBe(true)
    expect(options.length).toBe(6)
  })
})

describe('validateAnswerOptions', () => {
  it('validates correct options', () => {
    const { isValid, errors } = validateAnswerOptions([5, 7, 9, 11], 7)
    
    expect(isValid).toBe(true)
    expect(errors.length).toBe(0)
  })

  it('detects missing correct answer', () => {
    const { isValid, errors } = validateAnswerOptions([5, 8, 9, 11], 7)
    
    expect(isValid).toBe(false)
    expect(errors).toContain('No correct answer in options')
  })

  it('detects duplicate correct answers', () => {
    const { isValid, errors } = validateAnswerOptions([7, 7, 9, 11], 7)
    
    expect(isValid).toBe(false)
    expect(errors.some(e => e.includes('Multiple correct answers'))).toBe(true)
  })

  it('detects duplicate options', () => {
    const { isValid, errors } = validateAnswerOptions([5, 7, 9, 9], 7)
    
    expect(isValid).toBe(false)
    expect(errors.some(e => e.includes('Duplicate'))).toBe(true)
  })
})
