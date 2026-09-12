import React, { useMemo, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { Panel, ProgressBar } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { ExportModal } from '../../components/hr/ExportModal';
import { attendanceHistory } from '../../data/attendance';
import { departments } from '../../data/employees';
import { useApp } from '../../contexts/AppContext';
import { formatClockHours, formatDifference, formatHm, isoDate } from '../../utils/time';
import { cn } from '../../utils/cn';

export function Reports() {
  const { employeeById, employees } = useApp();
  const [exporting, setExporting] = useState(false);

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);

  const byDepartment = useMemo(() => {
    return departments.
    map((dept) => {
      const ids = employees.filter((e) => e.department === dept).map((e) => e.id);
      const records = attendanceHistory.filter((r) => ids.includes(r.employeeId));
      const worked = records.reduce((s, r) => s + r.totalMin, 0);
      const expected = records.reduce((s, r) => s + r.expectedMin, 0);
      const late = records.filter((r) => r.status === 'late').length;
      const leave = records.filter((r) => r.status === 'leave').length;
      return {
        dept,
        people: ids.length,
        worked,
        expected,
        diff: worked - expected,
        late,
        leave,
        utilisation: expected ? worked / expected : 0
      };
    }).
    filter((d) => d.people > 0).
    sort((a, b) => b.worked - a.worked);
  }, [employees]);

  const totals = byDepartment.reduce(
    (acc, d) => ({ worked: acc.worked + d.worked, expected: acc.expected + d.expected, late: acc.late + d.late }),
    { worked: 0, expected: 0, late: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Reports</h2>
          <p className="mt-1 text-[13px] text-ink-500">Rolling 30 working days across {employees.length} employees</p>
        </div>
        <Button variant="primary" icon={<DownloadIcon className="h-4 w-4" />} onClick={() => setExporting(true)}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
        ['Hours logged', formatHm(totals.worked), 'text-ink-900'],
        ['Hours expected', formatHm(totals.expected), 'text-ink-900'],
        [
        'Variance',
        formatDifference(totals.worked - totals.expected),
        totals.worked - totals.expected >= 0 ? 'text-emerald-600' : 'text-rose-600'],

        ['Late arrivals', String(totals.late), 'text-ink-900']].
        map(([label, value, tone]) =>
        <div key={label} className="rounded-2xl border border-ink-200 bg-surface p-4 shadow-card">
            <p className="text-[12px] text-ink-500">{label}</p>
            <p className={cn('num mt-1 text-2xl font-semibold tracking-[-0.025em]', tone)}>{value}</p>
          </div>
        )}
      </div>

      <Panel flush title="Department performance" description="Utilisation against expected hours">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {['Department', 'People', 'Hours worked', 'Expected', 'Variance', 'Late', 'Leave days', 'Utilisation'].map(
                  (h) =>
                  <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                      {h}
                    </th>

                )}
              </tr>
            </thead>
            <tbody>
              {byDepartment.map((d) =>
              <tr key={d.dept} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 text-[13px] font-medium text-ink-900">{d.dept}</td>
                  <td className="num px-4 py-3 text-[13px] text-ink-700">{d.people}</td>
                  <td className="num px-4 py-3 text-[13px] text-ink-900">{formatClockHours(d.worked)}</td>
                  <td className="num px-4 py-3 text-[13px] text-ink-500">{formatClockHours(d.expected)}</td>
                  <td
                  className={cn(
                    'num px-4 py-3 text-[13px] font-medium',
                    d.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                  
                    {formatDifference(d.diff)}
                  </td>
                  <td className="num px-4 py-3 text-[13px] text-ink-700">{d.late}</td>
                  <td className="num px-4 py-3 text-[13px] text-ink-700">{d.leave}</td>
                  <td className="px-4 py-3">
                    <div className="flex w-[140px] items-center gap-2.5">
                      <ProgressBar value={d.utilisation} tone={d.utilisation >= 1 ? 'emerald' : 'accent'} />
                      <span className="num w-10 text-right text-xs text-ink-500">
                        {Math.round(d.utilisation * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <ExportModal
        open={exporting}
        onClose={() => setExporting(false)}
        records={attendanceHistory}
        employeeById={employeeById}
        range={{ from: isoDate(start), to: isoDate(today) }}
        filterSummary={['All employees', 'All departments', 'Rolling 30 days']} />
      
    </div>);

}