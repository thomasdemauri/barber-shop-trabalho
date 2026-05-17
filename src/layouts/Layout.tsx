import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../ui';

export default function Layout() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const current = location.pathname.substring(1);
  const role = user?.tipo === 'barbeiro' ? 'barbeiro' : 'cliente';

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <BottomNav
        current={current}
        onNav={(path) => nav(`/${path}`)}
        role={role}
        onLogout={handleLogout}
      />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
