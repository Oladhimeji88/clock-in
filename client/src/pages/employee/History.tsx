import { useState } from 'react';
import { Panel } from '../../components/ui/Panel';
import { StatusPill } from '../../components/ui/StatusPill';
import { WeeklyBars } from '../../components/WeeklyBars';
import { useApp } from '../../contexts/AppContext';
import { useOwnRecords } from '../../hooks/useRecords';
import { weeklyMinutesFromRecords } from '../../utils/records';
import { formatClockHours, formatDifference, formatHm, isoDate, prettyDate } from '../../utils/time';
import { cn } from '../../utils/cn';

export function EmployeeHistory() {
  const { currentUser, leave } = useApp();
  const [range, setRange] = useState<'14' | '30'>('14');

  const today = new Date();
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - (Number(range) - 1));
  const { records: allRecords } = useOwnRecords(isoDate(rangeStart), isoDate(today));

  if (!currentUser) return null;

  const expectedMin = Math.round(currentUser.expectedHours * 60);
  const records = allRecords;
  const week = weeklyMinutesFromRecords(records);
  const myLeave = leave.filter((l) => l.employeeId === currentUser.id);
  const worked = records.reduce((s, r) => s + r.totalMin, 0);
  const expected = records.reduce((s, r) => s + r.expectedMin, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">History</h2>
        <p className="mt-1 text-[13px] text-ink-500">Your clock-ins, breaks and leave over the last {range} records.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
        ['Hours worked', formatHm(worked), 'text-ink-900'],
        ['Hours expected', formatHm(expected), 'text-ink-900'],
        ['Variance', formatDifference(worked - expected), worked - expected >= 0 ? 'text-emerald-600' : 'text-rose-600'],
        ['Leave taken', `${myLeave.filter((l) => l.status === 'Approved').reduce((s, l) => s + l.days, 0)} days`, 'text-ink-900']].
        map(([label, value, tone]) =>
        <div key={label} className="rounded-2xl border border-ink-200 bg-surface p-4 shadow-card">
            <p className="text-[12px] text-ink-500">{label}</p>
            <p className={cn('num mt-1 text-xl font-semibold tracking-[-0.02em]', tone)}>{value}</p>
          </div>
        )}
      </div>

      <Panel title="This week" description={`Target ${currentUser.expectedHours}h per working day`}>
        <WeeklyBars data={week} expectedMin={expectedMin} />
      </Panel>

      <Panel
        flush
        title="Attendance"
        actions={
        <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
            {(['14', '30'] as const).map((r) =>
          <button
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors duration-150',
              range === r ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
            )}>
            
                Last {r}
              </button>
          )}
          </div>
        }>
        
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {['Date', 'Clock In', 'Break', 'Clock Out', 'Total', 'Difference', 'Status'].map((h) =>
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const diff = r.totalMin - r.expectedMin;
                return (
                  <tr key={r.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{prettyDate(r.date)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockIn ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">
                      {r.breakStart ? `${r.breakStart} → ${r.breakEnd}` : '—'}
                    </td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{r.clockOut ?? '—'}</td>
                    <td className="num px-4 py-3 text-[13px] font-medium text-ink-900">{formatClockHours(r.totalMin)}</td>
                    <td
                      className={cn(
                        'num px-4 py-3 text-[13px] font-medium',
                        Math.abs(diff) <= 10 ? 'text-ink-500' : diff > 0 ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                      
                      {Math.abs(diff) <= 10 ? 'On target' : formatDifference(diff)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel flush title="Leave requests" description={`${myLeave.length} total`}>
        <ul className="divide-y divide-ink-100">
          {myLeave.length === 0 &&
          <li className="px-5 py-12 text-center text-[13px] text-ink-500">You haven't requested leave yet.</li>
          }
          {myLeave.map((l) =>
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-[13px] font-semibold text-ink-900">{l.type}</p>
                <p className="num text-xs text-ink-400">
                  {prettyDate(l.startDate)} → {prettyDate(l.endDate)} · {l.days} days
                </p>
              </div>
              <p className="max-w-[420px] flex-1 text-[13px] text-ink-500">{l.reason}</p>
              <StatusPill status={l.status} />
            </li>
          )}
        </ul>
      </Panel>
    </div>);

}