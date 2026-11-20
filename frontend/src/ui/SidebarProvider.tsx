import { useMemo, useState, type ReactNode } from 'react';
import { SidebarContext } from './sidebar';

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const value = useMemo(() => ({ open, toggle: () => setOpen(current => !current) }), [open]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
