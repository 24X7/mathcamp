# MathCamp Architecture

## Overview
MathCamp is an interactive math learning application designed for 1st graders, built with Bun, React, and TanStack Router. The application prioritizes fun, engagement, and effective learning through animated interfaces and gamification.

## Core Principles
1. **Child-First Design**: Every UI decision should consider 6-7 year old users
2. **Privacy-Focused**: No data leaves the device, all progress stored locally
3. **Accessibility**: Large touch targets, clear audio cues, simple navigation
4. **Progressive Difficulty**: Adaptive learning that grows with the child
5. **Positive Reinforcement**: Celebrate attempts, not just correct answers

## Technical Stack
- **Runtime**: Bun
- **Framework**: React 19
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context + Local Storage
- **Icons**: Lucide React
- **Build Tool**: Vite

## Directory Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Card, Modal)
│   ├── animations/      # Animation wrappers and transitions
│   ├── feedback/        # Success, error, progress indicators
│   └── layout/          # Layout components
├── features/            # Feature modules
│   ├── math-types/      # Different math question types
│   ├── fact-families/   # Fact families learning module
│   ├── word-problems/   # Word problem generator
│   ├── counting/        # Visual counting exercises
│   └── progress/        # Progress tracking and reporting
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── routes/              # TanStack Router route definitions
├── styles/              # Global styles and themes
└── assets/              # Images, sounds, fonts
```

## Component Architecture

### Base Components
All components should:
- Be fully typed with TypeScript
- Support className prop for styling overrides
- Include ARIA labels for accessibility
- Have large, touch-friendly hit areas (min 48x48px)
- Use semantic HTML elements

### Animation Guidelines
- Use spring animations for natural feel
- Keep animations under 300ms for responsiveness
- Provide reduce-motion alternatives
- Use entrance/exit animations for feedback
- Implement subtle hover states

### State Management
```typescript
// Local storage keys
PROGRESS_KEY = 'mathcamp_progress'
SETTINGS_KEY = 'mathcamp_settings'
USER_PROFILE_KEY = 'mathcamp_profile'

// Context providers
- ThemeProvider: Dark/light/auto themes
- ProgressProvider: Track learning progress
- AudioProvider: Sound effects and music
- SettingsProvider: User preferences
```

## Feature Modules

### Math Types Module
Implements various question types:
- Addition (with visual aids)
- Subtraction (with visual aids)
- Comparison (greater than, less than, equal)
- Patterns and sequences
- Time telling (basic)

### Fact Families Module
- Visual triangle/house representations
- Interactive number bonds
- Animated relationship demonstrations
- Practice modes with varying difficulty

### Word Problems Module
Themes:
- Animals and pets
- Food (pizza, cookies, fruits)
- Toys and games
- Nature and outdoors
- School supplies

Generation rules:
- Simple, single-step problems for beginners
- Gradually introduce two-step problems
- Use familiar contexts and objects
- Include visual representations

### Counting Module
Visual objects:
- Colorful shapes
- Food items (pizzas, pies, cookies)
- Animals
- Toys
- Nature elements (flowers, stars)

Features:
- Drag and drop counting
- Group counting (by 2s, 5s, 10s)
- Skip counting
- Number recognition

## Development Rules

### Code Style
1. Use functional components with hooks
2. Implement proper error boundaries
3. Memoize expensive computations
4. Use descriptive variable names
5. Comment complex logic
6. Keep components under 200 lines

### Performance
1. Lazy load routes and heavy components
2. Optimize images (WebP format, appropriate sizes)
3. Implement virtual scrolling for long lists
4. Use React.memo for pure components
5. Debounce user inputs where appropriate

### Testing Strategy
1. Unit tests for utility functions
2. Component testing for UI elements
3. Integration tests for user flows
4. Accessibility testing with screen readers
5. Performance testing on low-end devices

### Accessibility Requirements
1. WCAG 2.1 AA compliance minimum
2. Keyboard navigation support
3. Screen reader compatibility
4. High contrast mode support
5. Font size adjustability
6. Color blind friendly palettes

### Security Considerations
1. No external API calls
2. Sanitize any user inputs
3. Use Content Security Policy
4. Implement rate limiting for actions
5. Regular dependency updates

## Design System

### Colors
```css
--primary: Fun, bright blue
--secondary: Cheerful green
--accent: Playful orange
--success: Encouraging green
--error: Gentle red (not alarming)
--warning: Friendly yellow
```

### Typography
- Headings: Round, friendly fonts (e.g., Quicksand, Comfortably Numb)
- Body: Clear, readable fonts (e.g., Open Sans, Nunito)
- Numbers: Distinct, easy-to-read (e.g., Roboto Mono)

### Spacing
- Use consistent 8px grid system
- Generous padding for touch targets
- Clear visual hierarchy with whitespace

### Feedback Patterns
1. **Success**: Confetti animation + cheerful sound
2. **Incorrect**: Gentle shake + encouraging message
3. **Progress**: Visual progress bars with milestones
4. **Achievements**: Badge/sticker collection
5. **Streaks**: Daily practice rewards

## Data Models

### Progress Schema
```typescript
interface Progress {
  userId: string;
  sessions: Session[];
  achievements: Achievement[];
  stats: {
    totalProblems: number;
    correctAnswers: number;
    streak: number;
    favoriteType: string;
    timeSpent: number;
  };
}

interface Session {
  id: string;
  date: Date;
  duration: number;
  problems: Problem[];
  score: number;
}

interface Problem {
  id: string;
  type: ProblemType;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  timeSpent: number;
  attempts: number;
  hintsUsed: number;
}
```

## Performance Targets
- Initial load: < 2 seconds
- Route transitions: < 300ms
- Animation FPS: 60fps minimum
- Memory usage: < 100MB
- Local storage: < 10MB

## Future Enhancements
1. Parent dashboard for monitoring
2. Multiplayer modes for classroom use
3. Voice input for answers
4. AR features for counting
5. Offline PWA support
6. Multi-language support

## Deployment
1. Build with `bun run build`
2. Serve static files with CDN
3. Enable gzip compression
4. Implement service worker for caching
5. Monitor with error tracking (privacy-conscious)