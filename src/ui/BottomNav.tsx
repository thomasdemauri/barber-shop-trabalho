import { createContext, useContext, useState, type ReactNode } from 'react';
import { IconHome, IconScissors, IconCalendar, IconUser, IconChevronLeft, IconChevronRight } from './Icons';

type SidebarCtx = { open: boolean; toggle: () => void };
const Ctx = createContext<SidebarCtx>({ open: true, toggle: () => {} });
export const useSidebar = () => useContext(Ctx);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return <Ctx.Provider value={{ open, toggle: () => setOpen(p => !p) }}>{children}</Ctx.Provider>;
}

const ITEMS: { id: string; label: string; Icon: typeof IconHome }[] = [
  { id: 'home', label: 'In+¡cio', Icon: IconHome },
  { id: 'services', label: 'Agendar', Icon: IconScissors },
  { id: 'appointments', label: 'Agenda', Icon: IconCalendar },
  { id: 'profile', label: 'Perfil', Icon: IconUser },
];

export function BottomNav({
  current,
  onNav,
}: {
  current: string;
  onNav: (id: string) => void;
}) {
  const { open, toggle } = useSidebar();

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-[64px] bg-s1 border-t border-b1 pb-[env(safe-area-inset-bottom)] items-center px-2">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              className="tap flex flex-1 flex-col items-center gap-1 border-none bg-transparent py-1"
              onClick={() => onNav(id)}
            >
              <Icon size={20} className="transition-all duration-200" style={{ color: active ? 'var(--color-gold2)' : 'var(--color-cream)', opacity: active ? 1 : 0.4 }} />
              <span className="font-sans text-[10px] transition-all duration-200" style={{ color: active ? 'var(--color-gold2)' : 'var(--color-cream3)', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Side Nav */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen bg-s1 z-40 transition-all duration-300 ease-in-out shrink-0 ${
          open ? 'w-64' : 'w-[72px]'
        }`}
        style={{ borderRight: `1px solid var(--color-b1)` }}
      >
        {/* Logo area */}
        <div className={`flex items-center gap-3 px-4 h-20 border-b border-b1 shrink-0 transition-all duration-300 ${open ? '' : 'justify-center'}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'var(--color-s3)', border: '1px solid var(--color-b2)' }}>
            <IconScissors size={20} className="text-gold" />
          </div>
          {open && (
            <div className="flex flex-col min-w-0 animate-fade-up" style={{ animationDuration: '0.3s' }}>
              <span className="text-base font-serif text-cream font-bold truncate">
                Navalha de Ouro
              </span>
              <span className="text-[10px] font-sans text-gold2 tracking-widest uppercase">
                Premium
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2 px-5 py-6 flex-1 overflow-y-auto overflow-x-hidden">
          {ITEMS.map(({ id, label, Icon }) => {
            const active = current === id;
            return (
              <button
                key={id}
                onClick={() => onNav(id)}
                className={`tap group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border ${
                  active
                    ? 'bg-goldBg text-gold2 border-gold/20'
                    : 'text-cream3 border-transparent hover:bg-s2 hover:text-cream'
                } ${open ? '' : 'justify-center px-0'}`}
              >
                {active && open && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-gold2 rounded-r-full" />
                )}
                <Icon size={20} className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {open && <span className="font-sans text-sm font-medium whitespace-nowrap">{label}</span>}
              </button>
            );
          })}
        </div>

        {/* Toggle button at bottom */}
        <div className="p-5 border-t border-b1 shrink-0">
          <button
            onClick={toggle}
            className={`tap flex items-center gap-4 w-full px-4 py-3 rounded-xl text-cream3 hover:bg-s3 hover:text-cream transition-all border border-transparent ${
              open ? '' : 'justify-center px-0'
            }`}
            style={{ background: 'var(--color-s2)' }}
          >
            {open ? <IconChevronLeft size={20} className="shrink-0" /> : <IconChevronRight size={20} className="shrink-0" />}
            {open && <span className="font-sans text-sm font-medium">Recolher</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
