import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../ui';
import { useEffect, useRef, useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const current = location.pathname.substring(1);
  const role = user?.tipo === 'barbeiro' ? 'barbeiro' : 'cliente';

  return (
    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>
      <BottomNav
        current={current}
        onNav={(path) => nav(`/${path}`)}
        role={role}
        onLogout={() => { logout(); nav('/login'); }}
      />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: '5rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}