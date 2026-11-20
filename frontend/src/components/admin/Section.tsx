import type { ReactNode } from 'react';
import { C } from '../../theme';

export function Section({ icon, title, action, children }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl p-5 sm:p-6" style={{ background: C.s2, border: `1px solid ${C.b1}` }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold text-cream flex items-center gap-2">{icon} {title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
