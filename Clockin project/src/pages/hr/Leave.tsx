import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, EyeIcon, XIcon } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusPill } from '../../components/ui/StatusPill';
import { useApp } from '../../contexts/AppContext';
import { prettyDate } from '../../utils/time';
import { cn } from '../../utils/cn';
import type { LeaveRequest, LeaveStatus } from '../../types';

const TABS: (LeaveStatus | 'All')[] = ['All', 'Pending', 'Approved', 'Rejected'];

export function LeaveAdmin() {
  const { leave, employeeById, setLeaveStatus } = useApp();
  const [tab, setTab] = useState<LeaveStatus | 'All'>('Pending');
  const [detail, setDetail] = useState<LeaveRequest | null>(null);

  const rows = tab === 'All' ? leave : leave.filter((l) => l.status === tab);
  const counts = {
    Pending: leave.filter((l) => l.status === 'Pending').length,
    Approved: leave.filter((l) => l.status === 'Approved').length,
    Rejected: leave.filter((l) => l.status === 'Rejected').length
  };

  const decide = (request: LeaveRequest, status: LeaveStatus) => {
    setLeaveStatus(request.id, status);
    toast.success(`${status} — ${employeeById[request.employeeId]?.name}`, {
      description: `${request.type}, ${prettyDate(request.startDate)} → ${prettyDate(request.endDate)}`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Leave</h2>
        <p className="mt-1 text-[13px] text-ink-500">
          {counts.Pending} awaiting your decision · {counts.Approved} approved this quarter
        </p>
      </div>

      <Panel
        flush
        title="Requests"
        description={`${rows.length} shown`}
        actions={
        <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
            {TABS.map((t) =>
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors duration-150',
              tab === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
            )}>
            
                {t}
                {t !== 'All' && counts[t] > 0 && <span className="num ml-1.5 text-ink-400">{counts[t]}</span>}
              </button>
          )}
          </div>
        }>
        
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/50">
                {['Employee', 'Leave type', 'Start date', 'End date', 'Duration', 'Status', 'Actions'].map((h) =>
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                    {h}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const emp = employeeById[l.employeeId];
                return (
                  <tr key={l.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn('grid h-8 w-8 place-items-center rounded-full text-[11px] font-semibold', emp?.tone)}>
                          {emp?.initials}
                        </span>
                        <span>
                          <span className="block text-[13px] font-medium text-ink-900">{emp?.name}</span>
                          <span className="block text-xs text-ink-400">{emp?.department}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-700">{l.type}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{prettyDate(l.startDate)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-700">{prettyDate(l.endDate)}</td>
                    <td className="num px-4 py-3 text-[13px] text-ink-500">{l.days} days</td>
                    <td className="px-4 py-3">
                      <StatusPill status={l.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {l.status === 'Pending' ?
                        <>
                            <Button
                            size="sm"
                            variant="primary"
                            icon={<CheckIcon className="h-3.5 w-3.5" />}
                            onClick={() => decide(l, 'Approved')}>
                            
                              Approve
                            </Button>
                            <Button size="sm" icon={<XIcon className="h-3.5 w-3.5" />} onClick={() => decide(l, 'Rejected')}>
                              Reject
                            </Button>
                          </> :

                        <span className="num text-xs text-ink-400">Decided {prettyDate(l.submittedAt)}</span>
                        }
                        <button
                          onClick={() => setDetail(l)}
                          aria-label="View leave details"
                          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-800">
                          
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 &&
        <div className="px-4 py-16 text-center">
            <p className="text-[15px] font-medium text-ink-800">Nothing to review</p>
            <p className="mt-1 text-[13px] text-ink-500">All {tab.toLowerCase()} requests are cleared.</p>
          </div>
        }
      </Panel>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Leave request"
        size="sm"
        footer={
        detail?.status === 'Pending' ?
        <>
              <Button
            onClick={() => {
              decide(detail, 'Rejected');
              setDetail(null);
            }}>
            
                Reject
              </Button>
              <Button
            variant="primary"
            onClick={() => {
              decide(detail, 'Approved');
              setDetail(null);
            }}>
            
                Approve
              </Button>
            </> :

        <Button onClick={() => setDetail(null)}>Close</Button>

        }>
        
        {detail &&
        <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span
              className={cn(
                'grid h-11 w-11 place-items-center rounded-full text-[13px] font-semibold',
                employeeById[detail.employeeId]?.tone
              )}>
              
                {employeeById[detail.employeeId]?.initials}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink-900">{employeeById[detail.employeeId]?.name}</p>
                <p className="text-[13px] text-ink-500">{employeeById[detail.employeeId]?.department}</p>
              </div>
              <StatusPill status={detail.status} className="ml-auto" />
            </div>
            <dl className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
              {[
            ['Leave type', detail.type],
            ['Start date', prettyDate(detail.startDate)],
            ['End date', prettyDate(detail.endDate)],
            ['Duration', `${detail.days} working days`],
            ['Submitted', prettyDate(detail.submittedAt)]].
            map(([k, v]) =>
            <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[13px] text-ink-500">{k}</dt>
                  <dd className="num text-[13px] font-medium text-ink-900">{v}</dd>
                </div>
            )}
            </dl>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Reason</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{detail.reason}</p>
            </div>
          </div>
        }
      </Modal>
    </div>);

}