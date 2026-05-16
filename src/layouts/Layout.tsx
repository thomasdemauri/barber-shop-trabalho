import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '../ui';

export default function Layout() {
  const location = useLocation();
  const nav = useNavigate();

  const current = location.pathname.substring(1);

  return (
    <div className="flex min-h-screen bg-bg">
      <BottomNav current={current} onNav={(id) => nav(`/${id}`)} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
