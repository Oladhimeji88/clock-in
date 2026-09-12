import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LockIcon, SlidersHorizontalIcon } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Field, Input, Toggle } from '../../components/ui/Field';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../utils/cn';

export function EmployeeSettings() {
  const { currentUser, clockSettings, saveClockSettings } = useApp();
  const navigate = useNavigate();
  const [notif, setNotif] = useState({ clockReminder: true, breakReminder: true, leaveUpdates: true, weekly: false });

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Settings</h2>
          <p className="mt-1 text-[13px] text-ink-500">Your profile, clock preferences and notifications.</p>
        </div>
        <Button variant="primary" onClick={() => toast.success('Settings saved')}>
          Save changes
        </Button>
      </div>

      <Panel title="Profile">
        <div className="flex items-center gap-4">
          <span className={cn('grid h-14 w-14 place-items-center rounded-2xl text-lg font-semibold', currentUser.tone)}>
            {currentUser.initials}
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink-900">{currentUser.name}</p>
            <p className="text-[13px] text-ink-500">
              {currentUser.jobTitle} · {currentUser.department}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="me-name">
            <Input id="me-name" defaultValue={currentUser.name} />
          </Field>
          <Field label="Work email" htmlFor="me-email">
            <Input id="me-email" type="email" defaultValue={currentUser.email} />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-ink-50/60 p-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink-500 shadow-card">
            <LockIcon className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-ink-900">
              Expected working hours: {currentUser.expectedHours} hrs/day
            </p>
            <p className="text-xs text-ink-500">
              Schedule {currentUser.startTime}–{currentUser.endTime} · {currentUser.breakAllowanceMin} min break. Set by
              People Ops and not editable here.
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Password">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password" htmlFor="me-pass-old">
            <Input id="me-pass-old" type="password" placeholder="••••••••" />
          </Field>
          <Field label="New password" htmlFor="me-pass-new">
            <Input id="me-pass-new" type="password" placeholder="••••••••" />
          </Field>
          <Field label="Confirm password" htmlFor="me-pass-confirm">
            <Input id="me-pass-confirm" type="password" placeholder="••••••••" />
          </Field>
        </div>
        <Button className="mt-4" onClick={() => toast.success('Password updated')}>
          Update password
        </Button>
      </Panel>

      <Panel title="Clock appearance" description={`${clockSettings.style} style · ${clockSettings.theme} theme`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-ink-100 p-0.5">
            {[
            { label: '12 hour', value: true },
            { label: '24 hour', value: false }].
            map((opt) =>
            <button
              key={opt.label}
              onClick={() => saveClockSettings({ ...clockSettings, hour12: opt.value })}
              className={cn(
                'rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors duration-150',
                clockSettings.hour12 === opt.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
              )}>
              
                {opt.label}
              </button>
            )}
          </div>
          <Button icon={<SlidersHorizontalIcon className="h-4 w-4" />} onClick={() => navigate('/me/customize')}>
            Open clock designer
          </Button>
        </div>
      </Panel>

      <Panel title="Notifications">
        <div className="divide-y divide-ink-100">
          <div className="py-0.5">
            <Toggle
              checked={notif.clockReminder}
              onChange={(v) => setNotif((p) => ({ ...p, clockReminder: v }))}
              label="Clock-in reminder"
              description={`Nudge me at ${currentUser.startTime} if I haven't clocked in.`} />
            
          </div>
          <div className="py-0.5">
            <Toggle
              checked={notif.breakReminder}
              onChange={(v) => setNotif((p) => ({ ...p, breakReminder: v }))}
              label="Break reminder"
              description="Remind me when my break allowance is nearly used." />
            
          </div>
          <div className="py-0.5">
            <Toggle
              checked={notif.leaveUpdates}
              onChange={(v) => setNotif((p) => ({ ...p, leaveUpdates: v }))}
              label="Leave decisions" />
            
          </div>
          <div className="py-0.5">
            <Toggle
              checked={notif.weekly}
              onChange={(v) => setNotif((p) => ({ ...p, weekly: v }))}
              label="Weekly hours summary" />
            
          </div>
        </div>
      </Panel>
    </div>);

}