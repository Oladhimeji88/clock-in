import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { KeyRoundIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, SearchIcon, UserMinusIcon, UserCheckIcon, Trash2Icon, EyeIcon } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { Select } from '../../components/ui/Field';
import { Avatar } from '../../components/ui/Avatar';
import { AddEmployeeDrawer } from '../../components/hr/AddEmployeeDrawer';
import { EditEmployeeModal } from '../../components/hr/EditEmployeeModal';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../utils/cn';
import type { Employee } from '../../types';

export function Employees() {
  const { employees, updateEmployee, deleteEmployee, departments } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All departments');
  const [status, setStatus] = useState('All statuses');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
    employees.filter((e) => {
      const q = query.trim().toLowerCase();
      const matchQuery = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = dept === 'All departments' || e.department === dept;
      const matchStatus = status === 'All statuses' || e.accountStatus === status.toLowerCase();
      return matchQuery && matchDept && matchStatus;
    }),
    [employees, query, dept, status]
  );

  const removeEmployee = async (employee: Employee) => {
    setMenuId(null);
    if (!window.confirm(`Permanently delete ${employee.name}'s account? This cannot be undone.`)) return;
    try {
      await deleteEmployee(employee.id);
      toast.success(`${employee.name} deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete employee');
    }
  };

  return (
    <div className="space-y-6" onClick={() => setMenuId(null)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Employees</h2>
          <p className="mt-1 text-[13px] text-ink-500">
            {employees.filter((e) => e.accountStatus === 'active').length} active ·{' '}
            {employees.filter((e) => e.accountStatus === 'disabled').length} disabled
          </p>
        </div>
        <Button variant="primary" icon={<PlusIcon className="h-4 w-4" />} onClick={() => setAdding(true)}>
          Add employee
        </Button>
      </div>

      <Panel
        flush
        actions={
        <>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              aria-label="Search employees"
              className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/10 sm:w-[240px]" />
            
            </div>
            <Select value={dept} onChange={(e) => setDept(e.target.value)} className="h-9 w-[170px]">
              <option>All departments</option>
              {departments.map((d) =>
            <option key={d}>{d}</option>
            )}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-[150px]">
              <option>All statuses</option>
              <option>Active</option>
              <option>Invited</option>
              <option>Disabled</option>
            </Select>
          </>
        }
        title="Directory"
        description={`${filtered.length} employees`}>
        
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {['Name', 'Email', 'Department', 'Role', 'Expected Hours', 'Status', 'Last Clock In', ''].map((h) =>
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) =>
              <tr
                key={e.id}
                className="border-b border-ink-50 transition-colors duration-150 last:border-0 hover:bg-ink-50/60">
                
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={e.name} tone={e.tone} avatarUrl={e.avatarUrl} size={36} className="text-xs" />
                      <button
                      onClick={() => navigate(`/hr/employees/${e.id}`)}
                      className="text-[13px] font-semibold text-ink-900 hover:text-accent-700">
                      
                        {e.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink-500">{e.email}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-700">{e.department}</td>
                  <td className="px-4 py-3 text-[13px] text-ink-700">{e.jobTitle}</td>
                  <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">{e.expectedHours} hrs/day</td>
                  <td className="px-4 py-3">
                    <StatusPill status={e.accountStatus} />
                  </td>
                  <td className="num px-4 py-3 text-[13px] text-ink-500">{e.lastClockIn}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuId(menuId === e.id ? null : e.id);
                      }}
                      aria-label={`Actions for ${e.name}`}
                      className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
                      
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </button>
                      {menuId === e.id &&
                    <div
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-0 top-9 z-20 w-[184px] overflow-hidden rounded-xl border border-ink-200 bg-surface py-1 text-left shadow-lift">
                      
                          <MenuItem icon={<EyeIcon className="h-4 w-4" />} onClick={() => navigate(`/hr/employees/${e.id}`)}>
                            View profile
                          </MenuItem>
                          <MenuItem
                        icon={<PencilIcon className="h-4 w-4" />}
                        onClick={() => {
                          setEditing(e);
                          setMenuId(null);
                        }}>
                        
                            Edit details
                          </MenuItem>
                          <MenuItem
                        icon={<KeyRoundIcon className="h-4 w-4" />}
                        onClick={() => {
                          setMenuId(null);
                          toast.success(`Password reset sent to ${e.email}`);
                        }}>
                        
                            Reset password
                          </MenuItem>
                          <MenuItem
                        icon={e.accountStatus === 'disabled' ? <UserCheckIcon className="h-4 w-4" /> : <UserMinusIcon className="h-4 w-4" />}
                        onClick={() => {
                          setMenuId(null);
                          const next = e.accountStatus === 'disabled' ? 'active' : 'disabled';
                          updateEmployee(e.id, { accountStatus: next });
                          toast.success(`${e.name} ${next === 'disabled' ? 'suspended' : 'reactivated'}`);
                        }}>

                            {e.accountStatus === 'disabled' ? 'Reactivate account' : 'Suspend account'}
                          </MenuItem>
                          <MenuItem icon={<Trash2Icon className="h-4 w-4" />} danger onClick={() => removeEmployee(e)}>
                            Delete account
                          </MenuItem>
                        </div>
                    }
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 &&
        <div className="px-4 py-14 text-center">
            <p className="text-[15px] font-medium text-ink-800">No employees match those filters</p>
            <p className="mt-1 text-[13px] text-ink-500">Clear the search or pick another department.</p>
          </div>
        }
      </Panel>

      <AddEmployeeDrawer open={adding} onClose={() => setAdding(false)} />
      <EditEmployeeModal employee={editing} onClose={() => setEditing(null)} />
    </div>);

}

function MenuItem({
  icon,
  children,
  onClick,
  danger





}: {icon: React.ReactNode;children: React.ReactNode;onClick: () => void;danger?: boolean;}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors duration-150',
        danger ? 'text-rose-600 hover:bg-rose-50' : 'text-ink-700 hover:bg-ink-50'
      )}>
      
      {icon}
      {children}
    </button>);

}