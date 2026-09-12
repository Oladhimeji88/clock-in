import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon } from 'lucide-react';
import { titleForPath } from './nav';
import { Avatar } from '../ui/Avatar';
import { useApp } from '../../contexts/AppContext';

interface TopbarProps {
  onOpenNav: () => void;
}

export function Topbar({ onOpenNav }: TopbarProps) {
  const { pathname } = useLocation();
  const { currentUser, employees, leave, employeeById, logout } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<'none' | 'bell' | 'profile'>('none');

  const results = query.trim() ?
  employees.
  filter(
    (e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    e.department.toLowerCase().includes(query.toLowerCase())
  ).
  slice(0, 5) :
  [];

  const pending = leave.filter((l) => l.status === 'Pending');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-ink-200 bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-ink-500 transition-colors duration-150 hover:bg-ink-100 lg:hidden">
        
        <MenuIcon className="h-5 w-5" />
      </button>

      <h1 className="text-[17px] font-semibold tracking-[-0.015em] text-ink-900">{titleForPath(pathname)}</h1>

      <div className="relative ml-auto hidden sm:block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search employees…"
          aria-label="Search employees"
          className="h-9 w-[220px] rounded-lg border border-ink-200 bg-ink-50/60 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors duration-150 focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-accent-500/10 xl:w-[280px]" />
        
        {results.length > 0 &&
        <div className="absolute right-0 top-11 w-[300px] overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-lift">
            {results.map((e) =>
          <button
            key={e.id}
            onClick={() => {
              setQuery('');
              navigate(`/hr/employees/${e.id}`);
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-ink-50">
            
                <Avatar name={e.name} tone={e.tone} avatarUrl={e.avatarUrl} size={32} className="text-xs" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink-900">{e.name}</span>
                  <span className="block truncate text-xs text-ink-400">{e.department}</span>
                </span>
              </button>
          )}
          </div>
        }
      </div>

      <div className="relative ml-auto sm:ml-0">
        <button
          onClick={() => setPanel(panel === 'bell' ? 'none' : 'bell')}
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-ink-500 transition-colors duration-150 hover:bg-ink-100">
          
          <BellIcon className="h-[18px] w-[18px]" />
          {pending.length > 0 &&
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-600 ring-2 ring-surface" />
          }
        </button>
        {panel === 'bell' &&
        <div className="absolute right-0 top-12 w-[320px] overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-lift">
            <div className="border-b border-ink-100 px-4 py-3 text-[13px] font-semibold text-ink-900">
              Notifications
            </div>
            <ul className="max-h-[280px] overflow-y-auto">
              {pending.map((l) =>
            <li key={l.id} className="border-b border-ink-50 px-4 py-3">
                  <p className="text-[13px] text-ink-800">
                    <span className="font-medium">{employeeById[l.employeeId]?.name}</span> requested {l.type}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {l.startDate} → {l.endDate} · {l.days} days
                  </p>
                </li>
            )}
              <li className="px-4 py-3">
                <p className="text-[13px] text-ink-800">2 employees clocked in late today</p>
                <p className="mt-0.5 text-xs text-ink-400">Tom Whitaker, Ibrahim Malik</p>
              </li>
            </ul>
            <button
            onClick={() => {
              setPanel('none');
              navigate('/hr/leave');
            }}
            className="w-full bg-ink-50/70 px-4 py-2.5 text-[13px] font-medium text-accent-700 transition-colors duration-150 hover:bg-ink-100">
            
              Review leave requests
            </button>
          </div>
        }
      </div>

      <div className="relative">
        <button
          onClick={() => setPanel(panel === 'profile' ? 'none' : 'profile')}
          className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors duration-150 hover:bg-ink-100">
          
          <Avatar
            name={currentUser?.name ?? ''}
            tone={currentUser?.tone ?? 'bg-ink-100'}
            avatarUrl={currentUser?.avatarUrl}
            size={32}
            className="text-xs" />
          <ChevronDownIcon className="h-3.5 w-3.5 text-ink-400" />
        </button>
        {panel === 'profile' &&
        <div className="absolute right-0 top-12 w-[240px] overflow-hidden rounded-xl border border-ink-200 bg-surface shadow-lift">
            <div className="border-b border-ink-100 px-4 py-3">
              <p className="text-[13px] font-semibold text-ink-900">{currentUser?.name}</p>
              <p className="truncate text-xs text-ink-400">{currentUser?.email}</p>
            </div>
            <button
            onClick={() => {
              setPanel('none');
              navigate('/hr/settings');
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-ink-700 transition-colors duration-150 hover:bg-ink-50">
            
              Company settings
            </button>
            <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full px-4 py-2.5 text-left text-[13px] text-rose-600 transition-colors duration-150 hover:bg-rose-50">
            
              Log out
            </button>
          </div>
        }
      </div>
    </header>);

}