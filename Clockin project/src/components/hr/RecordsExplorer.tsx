import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { DownloadIcon, FilterIcon, PencilLineIcon } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { StatusPill } from '../ui/StatusPill';
import { Select } from '../ui/Field';
import { ExportModal } from './ExportModal';
import { attendanceHistory } from '../../data/attendance';
import { departments } from '../../data/employees';
import { useApp } from '../../contexts/AppContext';
import { formatClockHours, formatDifference, isoDate, prettyDate } from '../../utils/time';
import { cn } from '../../utils/cn';

interface RecordsExplorerProps {
  mode: 'attendance' | 'records';
}

function differenceTone(diff: number): {label: string;classes: string;} {
  if (Math.abs(diff) <= 10) return { label: 'On target', classes: 'text-ink-500' };
  if (diff > 0) return { label: formatDifference(diff), classes: 'text-emerald-600' };
  return { label: formatDifference(diff), classes: 'text-rose-600' };
}

export function RecordsExplorer({ mode }: RecordsExplorerProps) {
  const { employees, employeeById } = useApp();
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (mode === 'attendance' ? 13 : 6));

  const [employeeId, setEmployeeId] = useState('all');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState('all');
  const [from, setFrom] = useState(isoDate(start));
  const [to, setTo] = useState(isoDate(today));
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const records = useMemo(
    () =>
    attendanceHistory.filter((r) => {
      const emp = employeeById[r.employeeId];
      if (!emp) return false;
      if (employeeId !== 'all' && r.employeeId !== employeeId) return false;
      if (dept !== 'all' && emp.department !== dept) return false;
      if (status !== 'all' && r.status !== status) return false;
      return r.date >= from && r.date <= to;
    }),
    [employeeById, employeeId, dept, status, from, to]
  );

  const totals = useMemo(() => {
    const worked = records.reduce((s, r) => s + r.totalMin, 0);
    const expected = records.reduce((s, r) => s + r.expectedMin, 0);
    return { worked, expected, diff: worked - expected };
  }, [records]);

  const filterSummary = [
  employeeId === 'all' ? 'All employees' : employeeById[employeeId]?.name ?? 'Employee',
  dept === 'all' ? 'All departments' : dept,
  status === 'all' ? 'All statuses' : status];


  const filters =
  <>
      <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="h-9 sm:w-[180px]">
        <option value="all">All employees</option>
        {employees.map((e) =>
      <option key={e.id} value={e.id}>
            {e.name}
          </option>
      )}
      </Select>
      <Select value={dept} onChange={(e) => setDept(e.target.value)} className="h-9 sm:w-[165px]">
        <option value="all">All departments</option>
        {departments.map((d) =>
      <option key={d}>{d}</option>
      )}
      </Select>
      <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 sm:w-[145px]">
        <option value="all">All statuses</option>
        <option value="out">Clocked Out</option>
        <option value="late">Late</option>
        <option value="leave">On Leave</option>
      </Select>
      <div className="flex items-center gap-2">
        <input
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        aria-label="From date"
        className="h-9 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] text-ink-800 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/10" />
      
        <span className="text-ink-400">→</span>
        <input
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        aria-label="To date"
        className="h-9 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] text-ink-800 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/10" />
      
      </div>
    </>;


  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">
            {mode === 'attendance' ? 'Attendance' : 'Time records'}
          </h2>
          <p className="mt-1 text-[13px] text-ink-500">
            {records.length} records · {prettyDate(from)} → {prettyDate(to)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="sm:hidden"
            icon={<FilterIcon className="h-4 w-4" />}
            onClick={() => setShowFilters((s) => !s)}>
            
            Filters
          </Button>
          <Button variant="primary" icon={<DownloadIcon className="h-4 w-4" />} onClick={() => setExporting(true)}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
        ['Records', String(records.length)],
        ['Hours worked', formatClockHours(totals.worked)],
        ['Hours expected', formatClockHours(totals.expected)],
        ['Difference', formatDifference(totals.diff)]].
        map(([label, value], i) =>
        <div key={label} className="rounded-xl border border-ink-200 bg-surface p-4 shadow-card">
            <p className="text-[12px] text-ink-500">{label}</p>
            <p
            className={cn(
              'num mt-1 text-xl font-semibold tracking-[-0.02em]',
              i === 3 ? totals.diff >= 0 ? 'text-emerald-600' : 'text-rose-600' : 'text-ink-900'
            )}>
            
              {value}
            </p>
          </div>
        )}
      </div>

      <div className={cn('flex-wrap items-center gap-2 sm:flex', showFilters ? 'flex' : 'hidden')}>{filters}</div>

      <Panel flush>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {[
                'Date',
                'Employee',
                'Clock In',
                'Break Start',
                'Break End',
                'Clock Out',
                'Total Hours',
                'Expected',
                'Difference',
                'Status',
                mode === 'records' ? 'Adjust' : ''].
                map((h) =>
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 80).map((r) => {
                const emp = employeeById[r.employeeId];
                const diff = differenceTone(r.totalMin - r.expectedMin);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-ink-50 transition-colors duration-150 last:border-0 hover:bg-ink-50/60">
                    
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{prettyDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn('grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold', emp?.tone)}>
                          
                          {emp?.initials}
                        </span>
                        <span>
                          <span className="block text-[13px] font-medium text-ink-900">{emp?.name}</span>
                          <span className="block text-xs text-ink-400">{emp?.department}</span>
                        </span>
                      </div>
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockIn ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{r.breakStart ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{r.breakEnd ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockOut ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">{formatClockHours(r.totalMin)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{formatClockHours(r.expectedMin)}</td>
                    <td className={cn('num px-4 py-3 text-[13px] font-medium', diff.classes)}>{diff.label}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    {mode === 'records' &&
                    <td className="px-4 py-3">
                        <button
                        onClick={() => toast.success(`Adjustment request opened for ${emp?.name}`)}
                        aria-label={`Adjust record for ${emp?.name}`}
                        className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
                        
                          <PencilLineIcon className="h-4 w-4" />
                        </button>
                      </td>
                    }
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        {records.length === 0 &&
        <div className="px-4 py-16 text-center">
            <p className="text-[15px] font-medium text-ink-800">No records in this range</p>
            <p className="mt-1 text-[13px] text-ink-500">Widen the date range or clear a filter.</p>
          </div>
        }
        {records.length > 80 &&
        <div className="border-t border-ink-100 bg-ink-50/50 px-4 py-3 text-center text-[13px] text-ink-500">
            Showing the first 80 of {records.length} records — export to see everything.
          </div>
        }
      </Panel>

      <ExportModal
        open={exporting}
        onClose={() => setExporting(false)}
        records={records}
        employeeById={employeeById}
        range={{ from, to }}
        filterSummary={filterSummary} />
      
    </div>);

}