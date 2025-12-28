/**
 * Centralized answer option generator with built-in validation.
 * Ensures exactly one correct answer and all options are unique.
 */

export interface AnswerOptionsResult {
  /** Array of answer options including the correct answer, shuffled */
  options: number[]
  /** Whether valid options could be generated (false means problem should be regenerated) */
  isValid: boolean
}

/**
 * Generates a validated set of answer options for math problems.
 * 
 * @param correctAnswer - The correct answer to include in options
 * @param count - Number of options to generate (default: 4)
 * @param minValue - Minimum allowed value for wrong answers (default: 0)
 * @returns Object with options array and validity flag
 * 
 * @example
 * const { options, isValid } = generateAnswerOptions(7)
 * // options might be [5, 7, 9, 8] - shuffled, guaranteed unique
 * // isValid will be true if all 4 unique options were generated
 */
export function generateAnswerOptions(
  correctAnswer: number,
  count: number = 4,
  minValue: number = 0
): AnswerOptionsResult {
  const options = new Set<number>([correctAnswer])
  
  // Track attempts to prevent infinite loops
  let attempts = 0
  const maxAttempts = 100
  
  // Range for generating wrong answers
  // Use wider range for larger answers to ensure variety
  const maxOffset = Math.max(5, Math.ceil(correctAnswer * 0.5))
  
  while (options.size < count && attempts < maxAttempts) {
    attempts++
    
    // Generate offset: never 0 to ensure wrong answer differs from correct
    const offsetMagnitude = Math.floor(Math.random() * maxOffset) + 1
    const offsetSign = Math.random() > 0.5 ? 1 : -1
    const wrongAnswer = correctAnswer + (offsetSign * offsetMagnitude)
    
    // Validate: must be >= minValue and not already in options
    if (wrongAnswer >= minValue && !options.has(wrongAnswer)) {
      options.add(wrongAnswer)
    }
  }
  
  // Check if we got enough unique options
  const isValid = options.size >= count
  
  if (!isValid) {
    // Fallback: fill remaining with sequential numbers
    let fallback = correctAnswer + 1
    while (options.size < count) {
      if (!options.has(fallback) && fallback >= minValue) {
        options.add(fallback)
      }
      fallback++
      // Safety: prevent infinite fallback loop
      if (fallback > correctAnswer + 20) break
    }
  }
  
  // Convert to array and shuffle
  const optionsArray = Array.from(options)
  shuffleArray(optionsArray)
  
  // Final validation: ensure exactly one correct answer
  const correctCount = optionsArray.filter(opt => opt === correctAnswer).length
  const finalIsValid = correctCount === 1 && optionsArray.length === count
  
  return {
    options: optionsArray,
    isValid: finalIsValid
  }
}

/**
 * Fisher-Yates shuffle - mutates array in place
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * Validates that an options array has exactly one correct answer.
 * Useful for debugging or testing.
 */
export function validateAnswerOptions(
  options: number[],
  correctAnswer: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check for exactly one correct answer
  const correctCount = options.filter(opt => opt === correctAnswer).length
  if (correctCount === 0) {
    errors.push('No correct answer in options')
  } else if (correctCount > 1) {
    errors.push(`Multiple correct answers found (${correctCount})`)
  }
  
  // Check for duplicates
  const uniqueCount = new Set(options).size
  if (uniqueCount !== options.length) {
    errors.push(`Duplicate options found (${options.length - uniqueCount} duplicates)`)
  }
  
  // Check all are numbers
  if (options.some(opt => typeof opt !== 'number' || isNaN(opt))) {
    errors.push('Invalid option values (non-number or NaN)')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
