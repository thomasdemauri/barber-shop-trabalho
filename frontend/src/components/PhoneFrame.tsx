import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-bg text-cream font-sans flex flex-col selection:bg-gold selection:text-bg">
      {children}
    </div>
  );
}
