import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, CoffeeIcon, KeyRoundIcon, MailIcon, PencilIcon } from 'lucide-react';
import { Panel, ProgressBar } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { WeeklyBars } from '../../components/WeeklyBars';
import { EditEmployeeModal } from '../../components/hr/EditEmployeeModal';
import { useApp } from '../../contexts/AppContext';
import { useHrRecords } from '../../hooks/useRecords';
import { weeklyMinutesFromRecords } from '../../utils/records';
import { formatClockHours, formatHm, isoDate, prettyDate } from '../../utils/time';
import { cn } from '../../utils/cn';
import type { Employee } from '../../types';

type Tab = 'attendance' | 'leave' | 'breaks';

export function EmployeeDetail() {
  const { employeeId } = useParams();
  const { employeeById, today, leave } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('attendance');
  const [editing, setEditing] = useState<Employee | null>(null);

  const rangeEnd = new Date();
  const rangeStart = new Date(rangeEnd);
  rangeStart.setDate(rangeEnd.getDate() - 29);
  const { records: history } = useHrRecords(employeeId, isoDate(rangeStart), isoDate(rangeEnd));

  const employee = employeeId ? employeeById[employeeId] : undefined;

  if (!employee) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-surface p-14 text-center shadow-card">
        <p className="text-[15px] font-medium text-ink-800">Employee not found</p>
        <Link to="/hr/employees" className="mt-2 inline-block text-[13px] font-medium text-accent-700">
          Back to employees
        </Link>
      </div>);

  }

  const record = today.find((r) => r.employeeId === employee.id);
  const expectedMin = Math.round(employee.expectedHours * 60);
  const workedMin = record?.workedMin ?? 0;
  const week = weeklyMinutesFromRecords(history);
  const employeeLeave = leave.filter((l) => l.employeeId === employee.id);
  const weekTotal = week.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/hr/employees')}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition-colors duration-150 hover:text-ink-800">
        
        <ArrowLeftIcon className="h-4 w-4" />
        Employees
      </button>

      <div className="flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-ink-200 bg-surface p-5 shadow-card">
        <div className="flex items-center gap-4">
          <span className={cn('grid h-16 w-16 place-items-center rounded-2xl text-xl font-semibold', employee.tone)}>
            {employee.initials}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">{employee.name}</h2>
              <StatusPill status={employee.accountStatus} />
            </div>
            <p className="mt-1 text-[13px] text-ink-500">
              {employee.jobTitle} · {employee.department}
            </p>
            <p className="text-[13px] text-ink-400">{employee.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={<MailIcon className="h-4 w-4" />} onClick={() => toast.success(`Message sent to ${employee.name}`)}>
            Message
          </Button>
          <Button
            icon={<KeyRoundIcon className="h-4 w-4" />}
            onClick={() => toast.success(`Password reset sent to ${employee.email}`)}>
            
            Reset password
          </Button>
          <Button variant="primary" icon={<PencilIcon className="h-4 w-4" />} onClick={() => setEditing(employee)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Panel title="Today's time" description={record ? 'Live for the current workday' : 'No activity recorded yet'}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            {[
            ['Clock in', record?.clockIn ?? '—'],
            ['Current status', null],
            ['Break', record?.breakStart ? `${record.breakStart} → ${record.breakEnd ?? 'now'}` : '—'],
            ['Clock out', record?.clockOut ?? '—'],
            ['Total hours', formatClockHours(workedMin)],
            ['Expected hours', `${formatClockHours(expectedMin)} hrs`]].
            map(([label, value]) =>
            <div key={label as string}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">{label}</p>
                {value === null ?
              <div className="mt-1.5">
                    <StatusPill
                  status={record?.status ?? 'not_in'}
                  pulse={record?.status === 'working' || record?.status === 'break'} />
                
                  </div> :

              <p className="num mt-1 text-[15px] font-medium text-ink-900">{value}</p>
              }
              </div>
            )}
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[13px]">
              <span className="font-medium text-ink-700">Workday progress</span>
              <span className="num text-ink-500">
                {formatClockHours(workedMin)} / {formatClockHours(expectedMin)} hrs
              </span>
            </div>
            <ProgressBar value={expectedMin ? workedMin / expectedMin : 0} />
          </div>
        </Panel>

        <Panel
          title="This week"
          description={`${formatHm(weekTotal)} logged · target ${formatHm(expectedMin * employee.workingDays.length)}`}>
          
          <WeeklyBars data={week} expectedMin={expectedMin} />
        </Panel>
      </div>

      <Panel
        flush
        title="History"
        actions={
        <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
            {(
          [
          ['attendance', 'Attendance'],
          ['leave', 'Leave'],
          ['breaks', 'Breaks']] as
          [Tab, string][]).
          map(([key, label]) =>
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors duration-150',
              tab === key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
            )}>
            
                {label}
              </button>
          )}
          </div>
        }>
        
        {tab === 'attendance' &&
        <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  {['Date', 'Clock In', 'Break', 'Clock Out', 'Total', 'Expected', 'Status'].map((h) =>
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      {h}
                    </th>
                )}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 14).map((r) =>
              <tr key={r.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{prettyDate(r.date)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockIn ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">
                      {r.breakStart ? `${r.breakStart} → ${r.breakEnd}` : '—'}
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockOut ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">{formatClockHours(r.totalMin)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{formatClockHours(r.expectedMin)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }

        {tab === 'leave' &&
        <ul className="divide-y divide-ink-100">
            {employeeLeave.length === 0 && <li className="px-5 py-12 text-center text-[13px] text-ink-500">No leave requests yet.</li>}
            {employeeLeave.map((l) =>
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">{l.type}</p>
                  <p className="num text-xs text-ink-400">
                    {prettyDate(l.startDate)} → {prettyDate(l.endDate)} · {l.days} days
                  </p>
                </div>
                <p className="max-w-[380px] flex-1 text-[13px] text-ink-500">{l.reason}</p>
                <StatusPill status={l.status} />
              </li>
          )}
          </ul>
        }

        {tab === 'breaks' &&
        <ul className="divide-y divide-ink-100">
            {history.slice(0, 8).map((r) =>
          <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <span className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                    <CoffeeIcon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="num block text-[13px] font-medium text-ink-900">{prettyDate(r.date)}</span>
                    <span className="num block text-xs text-ink-400">
                      {r.breakStart ?? '—'} → {r.breakEnd ?? '—'}
                    </span>
                  </span>
                </span>
                <span className="num text-[13px] text-ink-500">
                  allowance {employee.breakAllowanceMin} min
                </span>
              </li>
          )}
          </ul>
        }
      </Panel>

      <EditEmployeeModal employee={editing} onClose={() => setEditing(null)} />
    </div>);

}