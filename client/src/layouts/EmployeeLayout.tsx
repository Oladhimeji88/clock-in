import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClockIcon, HistoryIcon, LogOutIcon, SettingsIcon, SlidersHorizontalIcon } from 'lucide-react';
import { Brand } from '../components/Brand';
import { Avatar } from '../components/ui/Avatar';
import { MiniClockWidget } from '../components/clock/MiniClockWidget';
import { useApp } from '../contexts/AppContext';
import { cn } from '../utils/cn';

const TABS = [
{ to: '/me', label: 'Clock', icon: ClockIcon, end: true },
{ to: '/me/history', label: 'History', icon: HistoryIcon },
{ to: '/me/customize', label: 'Customize', icon: SlidersHorizontalIcon },
{ to: '/me/settings', label: 'Settings', icon: SettingsIcon }];


export function EmployeeLayout() {
  const { currentUser, logout, company, authReady } = useApp();
  const navigate = useNavigate();

  if (!authReady) return null;
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== 'employee') return <Navigate to="/hr" replace />;

  return (
    <div className="flex min-h-screen w-full flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Brand />
          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Employee navigation">
            {TABS.map((tab) =>
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
              cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-snap',
                isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
              )
              }>
              
                {tab.label}
              </NavLink>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-[13px] font-semibold text-ink-900">{currentUser.name}</span>
              <span className="block text-xs text-ink-400">{company.name}</span>
            </span>
            <Avatar name={currentUser.name} tone={currentUser.tone} avatarUrl={currentUser.avatarUrl} size={36} className="text-[13px]" />
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              aria-label="Log out"
              className="rounded-lg p-2 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
              
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Employee navigation">
        
        <div className="flex items-stretch">
          {TABS.map((tab) =>
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors duration-150',
              isActive ? 'text-accent-700' : 'text-ink-400'
            )
            }>
            
              <tab.icon className="h-[18px] w-[18px]" />
              {tab.label}
            </NavLink>
          )}
        </div>
      </nav>

      <MiniClockWidget />
    </div>);

}