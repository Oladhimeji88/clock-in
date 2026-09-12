import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlarmClockIcon,
  BellRingIcon,
  CoffeeIcon,
  DownloadIcon,
  EyeIcon,
  HourglassIcon,
  PalmtreeIcon,
  TimerIcon,
  UsersIcon } from
'lucide-react';
import { StatCard } from '../../components/hr/StatCard';
import { Panel, ProgressBar } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusPill } from '../../components/ui/StatusPill';
import { useApp } from '../../contexts/AppContext';
import { formatClockHours, formatHm, longDate } from '../../utils/time';
import { cn } from '../../utils/cn';
import type { DayStatus } from '../../types';

const FILTERS: {key: DayStatus | 'all';label: string;}[] = [
{ key: 'all', label: 'All' },
{ key: 'working', label: 'Working' },
{ key: 'break', label: 'On Break' },
{ key: 'out', label: 'Clocked Out' },
{ key: 'leave', label: 'On Leave' },
{ key: 'late', label: 'Late' }];


export function HRDashboard() {
  const { employees, today, employeeById } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<DayStatus | 'all'>('all');

  const rows = useMemo(() => {
    const active = employees.filter((e) => e.accountStatus !== 'disabled');
    return active.map((emp) => {
      const record = today.find((r) => r.employeeId === emp.id);
      return {
        emp,
        status: (record?.status ?? 'not_in') as DayStatus,
        clockIn: record?.clockIn ?? null,
        breakStart: record?.breakStart ?? null,
        breakEnd: record?.breakEnd ?? null,
        clockOut: record?.clockOut ?? null,
        workedMin: record?.workedMin ?? 0,
        expectedMin: record?.expectedMin ?? Math.round(emp.expectedHours * 60)
      };
    });
  }, [employees, today, employeeById]);

  const counts = useMemo(() => {
    const by = (s: DayStatus) => rows.filter((r) => r.status === s).length;
    return {
      total: rows.length,
      working: by('working'),
      break: by('break'),
      leave: by('leave'),
      late: by('late'),
      hours: rows.reduce((sum, r) => sum + r.workedMin, 0)
    };
  }, [rows]);

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-ink-500">{longDate(new Date())}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-ink-900">
            {counts.working + counts.break} of {counts.total} people are on the clock
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<DownloadIcon className="h-4 w-4" />} onClick={() => navigate('/hr/attendance')}>
            Export day
          </Button>
          <Button variant="dark" icon={<EyeIcon className="h-4 w-4" />} onClick={() => navigate('/hr/time-records')}>
            Time records
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total employees"
          value={String(counts.total)}
          icon={<UsersIcon className="h-4 w-4" />}
          trend={{ direction: 'up', text: '+2 this month', tone: 'neutral' }}
          onClick={() => navigate('/hr/employees')} />
        
        <StatCard
          label="Currently clocked in"
          value={String(counts.working)}
          icon={<TimerIcon className="h-4 w-4" />}
          trend={{ direction: 'flat', text: 'live', tone: 'neutral' }}
          emphasis
          onClick={() => setFilter('working')} />
        
        <StatCard
          label="On break"
          value={String(counts.break)}
          icon={<CoffeeIcon className="h-4 w-4" />}
          trend={{ direction: 'flat', text: 'avg 38m', tone: 'neutral' }}
          onClick={() => setFilter('break')} />
        
        <StatCard
          label="On leave"
          value={String(counts.leave)}
          icon={<PalmtreeIcon className="h-4 w-4" />}
          trend={{ direction: 'flat', text: '2 approved', tone: 'neutral' }}
          onClick={() => setFilter('leave')} />
        
        <StatCard
          label="Late today"
          value={String(counts.late)}
          icon={<AlarmClockIcon className="h-4 w-4" />}
          trend={{ direction: 'down', text: '-1 vs avg', tone: 'positive' }}
          onClick={() => setFilter('late')} />
        
        <StatCard
          label="Hours logged today"
          value={formatClockHours(counts.hours)}
          icon={<HourglassIcon className="h-4 w-4" />}
          trend={{ direction: 'up', text: '+3h vs avg', tone: 'positive' }} />
        
      </div>

      <Panel
        flush
        title="Today's attendance"
        description={`${filtered.length} of ${rows.length} employees shown`}
        actions={
        <>
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-ink-100 p-0.5">
              {FILTERS.map((f) =>
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors duration-150',
                filter === f.key ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
              )}>
              
                  {f.label}
                </button>
            )}
            </div>
            <Button size="sm">Today</Button>
          </>
        }>
        
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {[
                'Employee',
                'Status',
                'Clock In',
                'Break',
                'Clock Out',
                'Hours Worked',
                'Expected',
                'Progress',
                ''].
                map((h) =>
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                  
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ emp, status, clockIn, breakStart, breakEnd, clockOut, workedMin, expectedMin }) => {
                const progress = expectedMin ? workedMin / expectedMin : 0;
                return (
                  <tr
                    key={emp.id}
                    className="border-b border-ink-50 transition-colors duration-150 last:border-0 hover:bg-ink-50/60">
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn('grid h-9 w-9 place-items-center rounded-full text-xs font-semibold', emp.tone)}>
                          
                          {emp.initials}
                        </span>
                        <span>
                          <button
                            onClick={() => navigate(`/hr/employees/${emp.id}`)}
                            className="block text-[13px] font-semibold text-ink-900 hover:text-accent-700">
                            
                            {emp.name}
                          </button>
                          <span className="block text-xs text-ink-400">{emp.department}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={status} pulse={status === 'working' || status === 'break'} />
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{clockIn ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">
                      {breakStart ?
                      <span className="flex flex-col">
                          <span>{breakStart}</span>
                          <span className="text-xs text-ink-400">{breakEnd ? `→ ${breakEnd}` : 'in progress'}</span>
                        </span> :

                      '—'
                      }
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{clockOut ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">
                      {formatClockHours(workedMin)}
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{formatClockHours(expectedMin)}</td>
                    <td className="px-4 py-3">
                      <div className="flex w-[132px] items-center gap-2.5">
                        <ProgressBar
                          value={progress}
                          tone={status === 'break' ? 'amber' : progress >= 1 ? 'emerald' : 'accent'} />
                        
                        <span className="num w-9 text-right text-xs font-medium text-ink-500">
                          {Math.round(progress * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/hr/employees/${emp.id}`)}
                          aria-label={`View ${emp.name}`}
                          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
                          
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.success(`Reminder sent to ${emp.name}`)}
                          aria-label={`Nudge ${emp.name}`}
                          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
                          
                          <BellRingIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 &&
        <div className="px-4 py-14 text-center">
            <p className="text-[15px] font-medium text-ink-800">No employees in this state</p>
            <p className="mt-1 text-[13px] text-ink-500">Try a different filter to see today's activity.</p>
          </div>
        }
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Attendance rate" description="Last 7 working days">
          <div className="flex items-end gap-2">
            {[96, 92, 98, 94, 97, 99, 95].map((v, i) =>
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-md bg-ink-100">
                  <div
                  className="w-full rounded-md bg-accent-600 transition-[height] duration-500 ease-snap"
                  style={{ height: `${v}%` }} />
                
                </div>
                <span className="num text-[11px] text-ink-400">{v}%</span>
              </div>
            )}
          </div>
        </Panel>
        <Panel title="Overtime watch" description="Employees above expected hours this week">
          <ul className="space-y-3">
            {rows.
            filter((r) => r.workedMin > r.expectedMin * 0.9).
            slice(0, 4).
            map((r) =>
            <li key={r.emp.id} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <span className={cn('grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold', r.emp.tone)}>
                      {r.emp.initials}
                    </span>
                    <span className="text-[13px] font-medium text-ink-800">{r.emp.name}</span>
                  </span>
                  <span className="num text-[13px] text-ink-500">{formatHm(r.workedMin)}</span>
                </li>
            )}
          </ul>
        </Panel>
        <Panel title="Break compliance" description="Average break length by department">
          <ul className="space-y-3.5">
            {[
            ['Engineering', 0.62, '37 min'],
            ['Design', 0.48, '29 min'],
            ['Support', 0.78, '47 min'],
            ['Sales', 0.55, '33 min']].
            map(([dept, value, label]) =>
            <li key={dept as string}>
                <div className="mb-1.5 flex items-center justify-between text-[13px]">
                  <span className="text-ink-700">{dept}</span>
                  <span className="num text-ink-500">{label}</span>
                </div>
                <ProgressBar value={value as number} tone="ink" />
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </div>);

}