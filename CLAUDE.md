# MathCamp - Interactive Math Learning for 1st Graders

## Project Overview
MathCamp is an engaging, privacy-focused math learning application designed specifically for 1st graders (ages 6-7). Built with Bun, React, and TanStack Router, it provides interactive math exercises with fun animations and visual aids.

## Key Features
- **Math Question Types**: Addition, subtraction, comparison with visual aids
- **Fact Families**: Interactive learning of number relationships (e.g., 3+4=7, 4+3=7, 7-3=4, 7-4=3)
- **Word Problems**: Contextual problems with themes like animals, food, toys
- **Counting Exercises**: Visual counting with pizzas, pies, and other fun objects
- **Progress Tracking**: Local storage-based progress tracking (no cloud/signin required)
- **Kid-Friendly UI**: Bright colors, animations, large touch targets

## Technical Stack
- **Runtime**: Bun (not Node.js)
- **Framework**: React 19 + TanStack Router
- **Styling**: Tailwind CSS + Framer Motion
- **State**: React Context + Local Storage
- **Build**: Vite
- **Package Manager**: Bun (use `bun install`, not npm/yarn/pnpm)

## Development Priorities
1. **Child Safety**: No external data transmission, all data stays local
2. **Accessibility**: Large buttons (min 48px), clear fonts, simple navigation
3. **Engagement**: Fun animations, positive reinforcement, achievements
4. **Educational Value**: Progressive difficulty, multiple problem types
5. **Performance**: Fast load times (<2s), smooth animations (60fps)

## Current Architecture
See `architecture.md` for detailed technical architecture and development rules.
See `SESSION_MANAGEMENT.md` for quiz session lifecycle and state management patterns.

## Session Context Rules
When working on this project:
- Always maintain component modularity - keep components under 200 lines
- Prioritize user experience for 6-7 year olds
- Use encouraging, positive language in all UI copy
- Implement visual and audio feedback for all interactions
- Keep animations springy but under 300ms for responsiveness
- Use semantic HTML and ARIA labels for accessibility
- Test on touch devices with child-sized fingers in mind
- Never add features that collect or transmit user data

## File Structure
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # Base components (Button, Card, Modal)
│   ├── animations/# Animation wrappers
│   ├── feedback/  # Success animations, progress bars
│   └── layout/    # Layout components
├── features/      # Feature modules
│   ├── math-types/     # Addition, subtraction, comparison
│   ├── fact-families/  # Number relationship teaching
│   ├── word-problems/  # Story-based math problems
│   ├── counting/       # Visual counting exercises
│   └── progress/       # Progress tracking
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── routes/        # TanStack Router routes
├── types/         # TypeScript definitions
└── assets/        # Images, sounds, fonts
```

## Key Development Rules
1. **Components**: All components must be TypeScript, support className prop, include ARIA labels
2. **Styling**: Use Tailwind classes, Framer Motion for animations, maintain 8px grid system
3. **State**: Use React Context for global state, localStorage for persistence
4. **Testing**: Prioritize accessibility testing and performance on low-end devices
5. **Security**: No external APIs, sanitize all inputs, implement CSP headers

## Math Content Guidelines
- **Addition/Subtraction**: Numbers 0-20 for 1st grade level
- **Fact Families**: Use visual triangles/houses to show relationships
- **Word Problems**: Single-step problems with familiar contexts
- **Counting**: Support counting by 1s, 2s, 5s, and 10s up to 100
- **Visual Aids**: Always provide manipulatives or visual representations

## UI/UX Guidelines
- **Colors**: Bright, cheerful palette - primary blue, secondary green, accent orange
- **Fonts**: Round, friendly headers (Quicksand), clear body text (Nunito)
- **Feedback**: Confetti for success, gentle shake for errors, never harsh
- **Navigation**: Maximum 2 clicks to any feature, clear back buttons
- **Rewards**: Stickers, badges, and streak counters for motivation

## Progress Tracking Schema
```typescript
interface Progress {
  sessions: Session[];
  achievements: Achievement[];
  stats: {
    totalProblems: number;
    correctAnswers: number;
    currentStreak: number;
    favoriteActivity: string;
  };
}
```

## Current Session Status
Track progress and next steps in `.NEXT_SESSION_HANDOFF.md`

## Bun-Specific Notes
- Use `bun install` for packages
- Use `bun run dev` for development server
- Use `bun test` for testing
- Use `bun build` for production builds
- Bun automatically loads .env files

## Important Reminders
- This is for 1st graders - keep it simple, fun, and encouraging
- No user accounts or cloud storage - everything is local
- Celebrate effort, not just correct answers
- Make it accessible for all children, including those with disabilities
- Performance matters - kids have short attention spans
- never and I mean never make random stuff up