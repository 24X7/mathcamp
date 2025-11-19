import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ProgressProvider } from '@/hooks/useProgress'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ProgressProvider>
      <div
        className="min-h-screen p-4"
        style={{
          background:
            'linear-gradient(to bottom right, rgb(239 246 255), rgb(243 232 255), rgb(252 231 243))',
        }}
      >
        <Outlet />
      </div>
    </ProgressProvider>
  )
}
