import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { BookingProvider } from './contexts/BookingContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Services from './pages/Services';
import Barber from './pages/Barber';
import DateTime from './pages/DateTime';
import Confirm from './pages/Confirm';
import Appointments from './pages/Appointments';
import AdminDashboard from './pages/AdminDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</> as any;
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppointmentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
              <Route path="/barber" element={<RequireAuth><Barber /></RequireAuth>} />
              <Route path="/datetime" element={<RequireAuth><DateTime /></RequireAuth>} />
              <Route path="/confirm" element={<RequireAuth><Confirm /></RequireAuth>} />
              <Route path="/appointments" element={<RequireAuth><Appointments /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AppointmentProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
