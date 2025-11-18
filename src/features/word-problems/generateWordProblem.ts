import { WordProblem, Difficulty } from '@/types'

interface ProblemTemplate {
  story: (nums: number[]) => string
  question: (nums: number[]) => string
  operation: 'add' | 'subtract' | 'compare'
  theme: WordProblem['theme']
  visualContext?: WordProblem['visualContext']
}

const templates: ProblemTemplate[] = [
  // Animals theme - Addition
  {
    story: ([n1, n2]) => `${n1} puppies were playing in the park. ${n2} more puppies came to join them.`,
    question: () => 'How many puppies are playing now?',
    operation: 'add',
    theme: 'animals',
    visualContext: { items: ['🐶'] }
  },

  // Animals theme - Subtraction
  {
    story: ([n1, n2]) => `There were ${n1} birds sitting on a tree. ${n2} birds flew away.`,
    question: () => 'How many birds are still on the tree?',
    operation: 'subtract',
    theme: 'animals',
    visualContext: { items: ['🐦'] }
  },

  // Animals theme - Comparison
  {
    story: ([n1, n2]) => `The red barn has ${n1} cows. The blue barn has ${n2} cows.`,
    question: ([n1, n2]: number[]) => `How many more cows does the ${n1 > n2 ? 'red' : 'blue'} barn have?`,
    operation: 'compare',
    theme: 'animals',
    visualContext: { items: ['🐄'] }
  },

  // Animals theme - Addition
  {
    story: ([n1, n2]) => `A farmer has ${n1} chickens. She got ${n2} more chickens from the market.`,
    question: () => 'How many chickens does she have now?',
    operation: 'add',
    theme: 'animals',
    visualContext: { items: ['🐔'] }
  },

  // Food theme - Addition
  {
    story: ([n1, n2]) => `You had ${n1} slices of pizza. Your friend gave you ${n2} more slices.`,
    question: () => 'How many pizza slices do you have now?',
    operation: 'add',
    theme: 'food',
    visualContext: { items: ['🍕'] }
  },

  // Food theme - Subtraction
  {
    story: ([n1, n2]) => `There were ${n1} cookies in the jar. You ate ${n2} cookies.`,
    question: () => 'How many cookies are left?',
    operation: 'subtract',
    theme: 'food',
    visualContext: { items: ['🍪'] }
  },

  // Food theme - Comparison
  {
    story: ([n1, n2]) => `Sarah has ${n1} apples. Tom has ${n2} apples.`,
    question: ([n1, n2]: number[]) => `How many more apples does ${n1 > n2 ? 'Sarah' : 'Tom'} have?`,
    operation: 'compare',
    theme: 'food',
    visualContext: { items: ['🍎'] }
  },

  // Food theme - Addition
  {
    story: ([n1, n2]) => `Mom baked ${n1} cupcakes. Then she baked ${n2} more cupcakes.`,
    question: () => 'How many cupcakes did mom bake in total?',
    operation: 'add',
    theme: 'food',
    visualContext: { items: ['🧁'] }
  },

  // Toys theme - Addition
  {
    story: ([n1, n2]) => `You have ${n1} toy cars. Your friend has ${n2} toy cars.`,
    question: () => 'How many toy cars do you both have together?',
    operation: 'add',
    theme: 'toys',
    visualContext: { items: ['🚗'] }
  },

  // Toys theme - Subtraction
  {
    story: ([n1, n2]) => `There were ${n1} balloons at the party. ${n2} balloons popped.`,
    question: () => 'How many balloons are still good?',
    operation: 'subtract',
    theme: 'toys',
    visualContext: { items: ['🎈'] }
  },

  // Toys theme - Comparison
  {
    story: ([n1, n2]) => `The toy store has ${n1} dolls. The gift shop has ${n2} dolls.`,
    question: ([n1, n2]: number[]) => `How many more dolls does the ${n1 > n2 ? 'toy store' : 'gift shop'} have?`,
    operation: 'compare',
    theme: 'toys',
    visualContext: { items: ['🧸'] }
  },

  // Toys theme - Addition
  {
    story: ([n1, n2]) => `Sarah has ${n1} dolls. She got ${n2} more dolls for her birthday.`,
    question: () => 'How many dolls does Sarah have now?',
    operation: 'add',
    theme: 'toys',
    visualContext: { items: ['👧'] }
  },

  // Nature theme - Addition
  {
    story: ([n1, n2]) => `In the garden, there are ${n1} red flowers and ${n2} yellow flowers.`,
    question: () => 'How many flowers are there in total?',
    operation: 'add',
    theme: 'nature',
    visualContext: { items: ['🌸', '🌻'] }
  },

  // Nature theme - Subtraction
  {
    story: ([n1, n2]) => `There were ${n1} apples on the tree. ${n2} apples fell down.`,
    question: () => 'How many apples are still on the tree?',
    operation: 'subtract',
    theme: 'nature',
    visualContext: { items: ['🍎'] }
  },

  // Nature theme - Comparison
  {
    story: ([n1, n2]) => `The big tree has ${n1} birds. The small tree has ${n2} birds.`,
    question: ([n1, n2]: number[]) => `How many more birds does the ${n1 > n2 ? 'big' : 'small'} tree have?`,
    operation: 'compare',
    theme: 'nature',
    visualContext: { items: ['🐦'] }
  },

  // Nature theme - Addition
  {
    story: ([n1, n2]) => `${n1} butterflies were in the garden. ${n2} more butterflies came.`,
    question: () => 'How many butterflies are there now?',
    operation: 'add',
    theme: 'nature',
    visualContext: { items: ['🦋'] }
  },

  // School theme - Addition
  {
    story: ([n1, n2]) => `Tom has ${n1} pencils. His teacher gave him ${n2} more pencils.`,
    question: () => 'How many pencils does Tom have now?',
    operation: 'add',
    theme: 'school',
    visualContext: { items: ['✏️'] }
  },

  // School theme - Subtraction
  {
    story: ([n1, n2]) => `There were ${n1} books on the shelf. ${n2} books were borrowed.`,
    question: () => 'How many books are left on the shelf?',
    operation: 'subtract',
    theme: 'school',
    visualContext: { items: ['📚'] }
  },

  // School theme - Comparison
  {
    story: ([n1, n2]) => `Class A has ${n1} students. Class B has ${n2} students.`,
    question: ([n1, n2]: number[]) => `How many more students does Class ${n1 > n2 ? 'A' : 'B'} have?`,
    operation: 'compare',
    theme: 'school',
    visualContext: { items: ['👦', '👧'] }
  },

  // School theme - Addition
  {
    story: ([n1, n2]) => `In the classroom, ${n1} students are drawing and ${n2} students are reading.`,
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