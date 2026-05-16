import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppointmentProvider } from './contexts/AppointmentContext';
import { BookingProvider } from './contexts/BookingContext';
import { AppShell } from './components/PhoneFrame';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Services from './pages/Services';
import Barber from './pages/Barber';
import DateTime from './pages/DateTime';
import Confirm from './pages/Confirm';
import Success from './pages/Success';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import Layout from './layouts/Layout';

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/barber" element={<Barber />} />
          <Route path="/datetime" element={<DateTime />} />
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/success" element={<Success />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppShell>
  );
}

import { SidebarProvider } from './ui';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AppointmentProvider>
          <SidebarProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Toaster
              position="top-center"
              gutter={10}
              containerStyle={{ top: 20 }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1d1a16',
                  color: '#f0e3c4',
                  border: '1px solid #3c3428',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '12px 16px',
                  maxWidth: '360px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
                },
                success: {
                  iconTheme: { primary: '#4a9d6e', secondary: '#f0e3c4' },
                  style: {
                    background: '#0c2216',
                    border: '1px solid rgba(74,157,110,0.3)',
                    color: '#f0e3c4',
                  },
                },
                error: {
                  iconTheme: { primary: '#c05050', secondary: '#f0e3c4' },
                  style: {
                    background: '#280e0e',
                    border: '1px solid rgba(192,80,80,0.3)',
                    color: '#f0e3c4',
                  },
                },
              }}
            />
          </SidebarProvider>
        </AppointmentProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
