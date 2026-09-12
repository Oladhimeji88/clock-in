import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar } from '../components/hr/Sidebar';
import { Topbar } from '../components/hr/Topbar';
import { useApp } from '../contexts/AppContext';

export function HRLayout() {
  const { currentUser, authReady } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authReady) return null;
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'hr') return <Navigate to="/me" replace />;

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenNav={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>);

}