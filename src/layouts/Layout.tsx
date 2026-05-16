import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav, useSidebar } from '../ui';

export default function Layout() {
  const { open } = useSidebar();
  const location = useLocation();
  const nav = useNavigate();
  
  // Extract path without leading slash
  const current = location.pathname.substring(1);

  return (
    <div className="flex min-h-screen bg-bg">
      <BottomNav current={current} onNav={(id) => nav(`/${id}`)} />
      
      {/* Centralized main wrapper. Flexbox automatically places it next to the sticky sidebar */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 transition-all duration-300 ease-in-out">
        <Outlet />
      </main>
    </div>
  );
}
