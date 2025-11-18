import { WordProblem, Difficulty } from '@/types'

interface ProblemTemplate {
  story: (nums: number[]) => string
  question: (nums: number[]) => string
  operation: 'add' | 'subtract' | 'compare'
  theme: WordProblem['theme']
  visualContext?: WordProblem['visualContext']
}

// Helper function to handle singular/plural
const plural = (count: number, singular: string, plural: string) => count === 1 ? singular : plural

const templates: ProblemTemplate[] = [
  // Animals theme - Addition
  {
    story: ([n1, n2]) => `${n1} ${plural(n1, 'puppy was', 'puppies were')} playing in the park. ${n2} more ${plural(n2, 'puppy', 'puppies')} came to join them.`,
    question: () => 'How many puppies are playing now?',
    operation: 'add',
    theme: 'animals',
    visualContext: { items: ['🐶'] }
  },

  // Animals theme - Subtraction
  {
    story: ([n1, n2]) => `There ${plural(n1, 'was', 'were')} ${n1} ${plural(n1, 'bird', 'birds')} sitting on a tree. ${n2} ${plural(n2, 'bird', 'birds')} flew away.`,
    question: () => 'How many birds are still on the tree?',
    operation: 'subtract',
    theme: 'animals',
    visualContext: { items: ['🐦'] }
  },

  // Animals theme - Comparison
  {
    story: ([n1, n2]) => `The red barn has ${n1} ${plural(n1, 'cow', 'cows')}. The blue barn has ${n2} ${plural(n2, 'cow', 'cows')}.`,
    question: ([n1, n2]: number[]) => `How many more ${plural(Math.abs(n1-n2), 'cow does', 'cows does')} the ${n1 > n2 ? 'red' : 'blue'} barn have?`,
    operation: 'compare',
    theme: 'animals',
    visualContext: { items: ['🐄'] }
  },

  // Animals theme - Addition
  {
    story: ([n1, n2]) => `A farmer has ${n1} ${plural(n1, 'chicken', 'chickens')}. She got ${n2} more ${plural(n2, 'chicken', 'chickens')} from the market.`,
    question: () => 'How many chickens does she have now?',
    operation: 'add',
    theme: 'animals',
    visualContext: { items: ['🐔'] }
  },

  // Food theme - Addition
  {
    story: ([n1, n2]) => `You had ${n1} ${plural(n1, 'slice', 'slices')} of pizza. Your friend gave you ${n2} more ${plural(n2, 'slice', 'slices')}.`,
    question: () => 'How many pizza slices do you have now?',
    operation: 'add',
    theme: 'food',
    visualContext: { items: ['🍕'] }
  },

  // Food theme - Subtraction
  {
    story: ([n1, n2]) => `There ${plural(n1, 'was', 'were')} ${n1} ${plural(n1, 'cookie', 'cookies')} in the jar. You ate ${n2} ${plural(n2, 'cookie', 'cookies')}.`,
    question: () => 'How many cookies are left?',
    operation: 'subtract',
    theme: 'food',
    visualContext: { items: ['🍪'] }
  },

  // Food theme - Comparison
  {
    story: ([n1, n2]) => `Sarah has ${n1} ${plural(n1, 'apple', 'apples')}. Tom has ${n2} ${plural(n2, 'apple', 'apples')}.`,
    question: ([n1, n2]: number[]) => `How many more ${plural(Math.abs(n1-n2), 'apple does', 'apples does')} ${n1 > n2 ? 'Sarah' : 'Tom'} have?`,
    operation: 'compare',
    theme: 'food',
    visualContext: { items: ['🍎'] }
  },

  // Food theme - Addition
  {
    story: ([n1, n2]) => `Mom baked ${n1} ${plural(n1, 'cupcake', 'cupcakes')}. Then she baked ${n2} more ${plural(n2, 'cupcake', 'cupcakes')}.`,
    question: () => 'How many cupcakes did mom bake in total?',
    operation: 'add',
    theme: 'food',
    visualContext: { items: ['🧁'] }
  },

  // Toys theme - Addition
  {
    story: ([n1, n2]) => `You have ${n1} toy ${plural(n1, 'car', 'cars')}. Your friend has ${n2} toy ${plural(n2, 'car', 'cars')}.`,
    question: () => 'How many toy cars do you both have together?',
    operation: 'add',
    theme: 'toys',
    visualContext: { items: ['🚗'] }
  },

  // Toys theme - Subtraction
  {
    story: ([n1, n2]) => `There ${plural(n1, 'was', 'were')} ${n1} ${plural(n1, 'balloon', 'balloons')} at the party. ${n2} ${plural(n2, 'balloon', 'balloons')} popped.`,
    question: () => 'How many balloons are still good?',
    operation: 'subtract',
    theme: 'toys',
    visualContext: { items: ['🎈'] }
  },

  // Toys theme - Comparison
  {
    story: ([n1, n2]) => `The toy store has ${n1} ${plural(n1, 'doll', 'dolls')}. The gift shop has ${n2} ${plural(n2, 'doll', 'dolls')}.`,
    question: ([n1, n2]: number[]) => `How many more ${plural(Math.abs(n1-n2), 'doll does', 'dolls does')} the ${n1 > n2 ? 'toy store' : 'gift shop'} have?`,
    operation: 'compare',
    theme: 'toys',
    visualContext: { items: ['🧸'] }
  },

  // Toys theme - Addition
  {
    story: ([n1, n2]) => `Sarah has ${n1} ${plural(n1, 'doll', 'dolls')}. She got ${n2} more ${plural(n2, 'doll', 'dolls')} for her birthday.`,
    question: () => 'How many dolls does Sarah have now?',
    operation: 'add',
    theme: 'toys',
    visualContext: { items: ['👧'] }
  },

  // Nature theme - Addition
  {
    story: ([n1, n2]) => `In the garden, there ${plural(n1, 'is', 'are')} ${n1} red ${plural(n1, 'flower', 'flowers')} and ${n2} yellow ${plural(n2, 'flower', 'flowers')}.`,
    question: () => 'How many flowers are there in total?',
    operation: 'add',
    theme: 'nature',
    visualContext: { items: ['🌸', '🌻'] }
  },

  // Nature theme - Subtraction
  {
    story: ([n1, n2]) => `There ${plural(n1, 'was', 'were')} ${n1} ${plural(n1, 'apple', 'apples')} on the tree. ${n2} ${plural(n2, 'apple', 'apples')} fell down.`,
    question: () => 'How many apples are still on the tree?',
    operation: 'subtract',
    theme: 'nature',
    visualContext: { items: ['🍎'] }
  },

  // Nature theme - Comparison
  {
    story: ([n1, n2]) => `The big tree has ${n1} ${plural(n1, 'bird', 'birds')}. The small tree has ${n2} ${plural(n2, 'bird', 'birds')}.`,
    question: ([n1, n2]: number[]) => `How many more ${plural(Math.abs(n1-n2), 'bird does', 'birds does')} the ${n1 > n2 ? 'big' : 'small'} tree have?`,
    operation: 'compare',
    theme: 'nature',
    visualContext: { items: ['🐦'] }
  },

  // Nature theme - Addition
  {
    story: ([n1, n2]) => `${n1} ${plural(n1, 'butterfly was', 'butterflies were')} in the garden. ${n2} more ${plural(n2, 'butterfly', 'butterflies')} came.`,
    question: () => 'How many butterflies are there now?',
    operation: 'add',
    theme: 'nature',
    visualContext: { items: ['🦋'] }
  },

  // School theme - Addition
  {
    story: ([n1, n2]) => `Tom has ${n1} ${plural(n1, 'pencil', 'pencils')}. His teacher gave him ${n2} more ${plural(n2, 'pencil', 'pencils')}.`,
    question: () => 'How many pencils does Tom have now?',
    operation: 'add',
    theme: 'school',
    visualContext: { items: ['✏️'] }
  },

  // School theme - Subtraction
  {
    story: ([n1, n2]) => `There ${plural(n1, 'was', 'were')} ${n1} ${plural(n1, 'book', 'books')} on the shelf. ${n2} ${plural(n2, 'book', 'books')} ${plural(n2, 'was', 'were')} borrowed.`,
    question: () => 'How many books are left on the shelf?',
    operation: 'subtract',
    theme: 'school',
    visualContext: { items: ['📚'] }
  },

  // School theme - Comparison
  {
    story: ([n1, n2]) => `Class A has ${n1} ${plural(n1, 'student', 'students')}. Class B has ${n2} ${plural(n2, 'student', 'students')}.`,
    question: ([n1, n2]: number[]) => `How many more ${plural(Math.abs(n1-n2), 'student does', 'students does')} Class ${n1 > n2 ? 'A' : 'B'} have?`,
    operation: 'compare',
    theme: 'school',
    visualContext: { items: ['👦', '👧'] }
  },

  // School theme - Addition
  {
    story: ([n1, n2]) => `In the classroom, ${n1} ${plural(n1, 'student is', 'students are')} drawing and ${n2} ${plural(n2, 'student is', 'students are')} reading.`,
    question: () => 'How many students are there in total?',
    operation: 'add',
    theme: 'school',
    visualContext: { items: ['👦', '👧'] }
  },
]

export const generateWordProblem = (difficulty: Difficulty): WordProblem => {
  // Pick a random template
  const template = templates[Math.floor(Math.random() * templates.length)]!

  // Generate numbers based on difficulty
  let max1 = 5, max2 = 5

  switch (difficulty) {
    case 'easy':
      max1 = 5
      max2 = 5
      break
    case 'medium':
      max1 = 10
      max2 = 10
      break
    case 'hard':
      max1 = 15
      max2 = 10
      break
  }

  let num1 = Math.floor(Math.random() * max1) + 1
  let num2 = Math.floor(Math.random() * max2) + 1

  // For subtraction, ensure positive result
  if (template.operation === 'subtract' && num2 > num1) {
    [num1, num2] = [num2, num1]
  }

  // For comparison, ensure they're different
  if (template.operation === 'compare') {
    while (num1 === num2) {
      num2 = Math.floor(Math.random() * max2) + 1
    }
  }

  const answer = template.operation === 'add'
    ? num1 + num2
    : template.operation === 'subtract'
    ? num1 - num2
    : Math.abs(num1 - num2) // comparison: absolute difference

  return {
    id: `wp-${Date.now()}-${Math.random()}`,
    story: template.story([num1, num2]),
    question: template.question([num1, num2]),
    answer,
    theme: template.theme,
    visualContext: template.visualContext,
  }
}