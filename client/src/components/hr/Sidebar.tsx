import { NavLink, useNavigate } from 'react-router-dom';
import { LogOutIcon, XIcon } from 'lucide-react';
import { Brand } from '../Brand';
import { hrNav } from './nav';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { company, currentUser, logout, leave } = useApp();
  const navigate = useNavigate();
  const pendingLeave = leave.filter((l) => l.status === 'Pending').length;

  const content =
  <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center justify-between px-5">
        <Brand />
        <button
        onClick={onClose}
        aria-label="Close navigation"
        className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 lg:hidden">
        
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="HR navigation">
        {hrNav.map((item) =>
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClose}
        className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150 ease-snap',
          isActive ? 'bg-ink-100 text-ink-900' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
        )
        }>
        
            {({ isActive }) =>
        <>
                <item.icon className={cn('h-[17px] w-[17px]', isActive ? 'text-accent-600' : 'text-ink-400')} />
                <span className="flex-1">{item.label}</span>
                {item.label === 'Leave' && pendingLeave > 0 &&
          <span className="num rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {pendingLeave}
                  </span>
          }
              </>
        }
          </NavLink>
      )}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2">
          <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold',
            currentUser?.tone ?? 'bg-ink-100 text-ink-600'
          )}>
          
            {currentUser?.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-ink-900">{currentUser?.name}</span>
            <span className="block truncate text-xs text-ink-400">{company.name}</span>
          </span>
          <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          aria-label="Log out"
          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
          
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>;


  return (
    <>
      <aside className="hidden h-screen w-[248px] shrink-0 overflow-y-auto border-r border-ink-200 lg:block">{content}</aside>
      {mobileOpen &&
      <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-[264px] border-r border-ink-200 shadow-pop">{content}</div>
        </div>
      }
    </>);

}