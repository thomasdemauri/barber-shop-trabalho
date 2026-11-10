  import { createContext, useContext, useState, type ReactNode } from 'react';
  import {
    IconHome, IconScissors, IconCalendar, IconUser,
    IconChevronLeft, IconChevronRight, IconLogOut, IconSettings,
  } from './Icons';

  type SidebarCtx = { open: boolean; toggle: () => void };
  const Ctx = createContext<SidebarCtx>({ open: true, toggle: () => {} });
  export const useSidebar = () => useContext(Ctx);

  export function SidebarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(true);
    return <Ctx.Provider value={{ open, toggle: () => setOpen(p => !p) }}>{children}</Ctx.Provider>;
  }

  type NavItem = {
    id: string;
    label: string;
    Icon: typeof IconHome;
    path: string;
    matchPath: string;
  };

  const CLIENT_ITEMS: NavItem[] = [
    { id: 'home',         label: 'Início',    Icon: IconHome,     path: 'home',        matchPath: 'home' },
    { id: 'services',    label: 'Agendar',   Icon: IconScissors, path: 'services',   matchPath: 'services' },
    { id: 'appointments',label: 'Agenda',    Icon: IconCalendar, path: 'appointments',matchPath: 'appointments' },
    { id: 'profile',     label: 'Perfil',    Icon: IconUser,     path: 'profile',    matchPath: 'profile' },
  ];

  const ADMIN_ITEMS: NavItem[] = [
    { id: 'dash',     label: 'Dashboard', Icon: IconHome,     path: 'admin',         matchPath: 'admin' },
    { id: 'agenda',   label: 'Agenda',    Icon: IconCalendar, path: 'admin/agenda',  matchPath: 'admin/agenda' },
    { id: 'clientes', label: 'Clientes',  Icon: IconUser,     path: 'admin/clientes',matchPath: 'admin/clientes' },
    { id: 'cfg',      label: 'Config',    Icon: IconSettings, path: 'admin/config',  matchPath: 'admin/config' },
  ];

  export function BottomNav({
    current,
    onNav,
    role = 'cliente',
    onLogout,
  }: {
    current: string;
    onNav: (path: string) => void;
    role?: 'cliente' | 'barbeiro';
    onLogout?: () => void;
  }) {
    const { open, toggle } = useSidebar();
    const items = role === 'barbeiro' ? ADMIN_ITEMS : CLIENT_ITEMS;

    return (
      <>
        {/* ── Mobile Bottom Nav ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex h-[64px] items-center px-1"
          style={{
            background: 'var(--color-s1)',
            borderTop: '1px solid var(--color-b1)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {items.map(({ id, label, Icon, path, matchPath }) => {
            const active = matchPath !== '' && current === matchPath;
            return (
              <button
                key={id}
                className="tap flex flex-1 flex-col items-center gap-1 border-none bg-transparent py-1 relative"
                onClick={() => onNav(path)}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: 'var(--color-gold2)' }}
                  />
                )}
                <Icon
                  size={20}
                  style={{
                    color: active ? 'var(--color-gold2)' : 'var(--color-cream)',
                    opacity: active ? 1 : 0.38,
                    transition: 'color 0.2s, opacity 0.2s',
                  }}
                />
                <span
                  className="font-sans text-[10px] transition-all duration-200"
                  style={{
                    color: active ? 'var(--color-gold2)' : 'var(--color-cream3)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Desktop Sidebar ── */}
        <aside
          className={`hidden md:flex flex-col sticky top-0 h-screen z-40 shrink-0 transition-all duration-300 ease-in-out ${open ? 'w-64' : 'w-[72px]'}`}
          style={{
            background: 'var(--color-s1)',
            borderRight: '1px solid var(--color-b1)',
          }}
        >
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-4 h-20 shrink-0 transition-all duration-300 ${open ? '' : 'justify-center'}`}
            style={{ borderBottom: '1px solid var(--color-b1)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'var(--color-s3)', border: '1px solid var(--color-b2)' }}
            >
              <IconScissors size={20} className="text-gold" />
            </div>
            {open && (
              <div className="flex flex-col min-w-0 animate-fade-up" style={{ animationDuration: '0.25s' }}>
                <span className="font-serif text-base font-bold text-cream truncate leading-tight">
                  Navalha de Ouro
                </span>
                <span className="font-sans text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-gold2)' }}>
                  {role === 'barbeiro' ? 'Painel Admin' : 'Premium'}
                </span>
              </div>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 px-3 py-5 flex-1 overflow-y-auto overflow-x-hidden">
            {items.map(({ id, label, Icon, path, matchPath }) => {
              const active = matchPath !== '' && current === matchPath;
              return (
                <button
                  key={id}
                  onClick={() => onNav(path)}
                  className={`tap group relative flex items-center gap-3.5 rounded-xl transition-all duration-200 ${open ? 'px-4 py-3' : 'justify-center px-0 py-3'}`}
                  style={{
                    background: active ? 'var(--color-goldBg)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(196,145,42,0.2)' : 'transparent'}`,
                    color: active ? 'var(--color-gold2)' : 'var(--color-cream2)',
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--color-s2)'; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {active && open && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: 'var(--color-gold2)' }}
                    />
                  )}
                  <Icon size={19} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {open && (
                    <span className="font-sans text-[13px] font-medium whitespace-nowrap">{label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-3 shrink-0 flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-b1)' }}>
            {role === 'barbeiro' && onLogout && (
              <button
                onClick={onLogout}
                className={`tap flex items-center gap-3.5 w-full rounded-xl py-3 font-sans text-sm font-medium transition-all ${open ? 'px-4' : 'justify-center px-0'}`}
                style={{
                  background: 'var(--color-redBg)',
                  color: 'var(--color-red)',
                  border: '1px solid rgba(192,80,80,0.2)',
                }}
              >
                <IconLogOut size={18} className="shrink-0" />
                {open && <span>Sair da conta</span>}
              </button>
            )}
            <button
              onClick={toggle}
              className={`tap flex items-center gap-3.5 w-full rounded-xl py-3 font-sans text-sm font-medium transition-all ${open ? 'px-4' : 'justify-center px-0'}`}
              style={{ background: 'var(--color-s2)', color: 'var(--color-cream3)' }}
            >
              {open
                ? <><IconChevronLeft size={18} className="shrink-0" /><span>Recolher</span></>
                : <IconChevronRight size={18} className="shrink-0" />
              }
            </button>
          </div>
        </aside>
      </>
    );
  }
