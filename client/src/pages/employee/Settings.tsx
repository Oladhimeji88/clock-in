import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CameraIcon, LockIcon, PalmtreeIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusPill } from '../../components/ui/StatusPill';
import { RequestLeaveModal } from '../../components/employee/RequestLeaveModal';
import { Field, Input, Toggle } from '../../components/ui/Field';
import { useApp } from '../../contexts/AppContext';
import { api, ApiError } from '../../api/client';
import { fileToAvatarDataUrl } from '../../utils/image';
import { prettyDate } from '../../utils/time';
import { cn } from '../../utils/cn';

export function EmployeeSettings() {
  const { currentUser, clockSettings, saveClockSettings, updateAvatar, leave } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [notif, setNotif] = useState({ clockReminder: true, breakReminder: true, leaveUpdates: true, weekly: false });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setAvatarSaving(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await updateAvatar(dataUrl);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update photo');
    } finally {
      setAvatarSaving(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarSaving(true);
    try {
      await updateAvatar(null);
      toast.success('Photo removed');
    } catch {
      toast.error('Could not remove photo');
    } finally {
      setAvatarSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!pw.next || pw.next !== pw.confirm) {
      toast.error('New password and confirmation must match');
      return;
    }
    setPwSaving(true);
    try {
      await api.auth.changePassword(pw.current, pw.next);
      toast.success('Password updated');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not update password');
    } finally {
      setPwSaving(false);
    }
  };

  if (!currentUser) return null;

  const myLeave = leave.filter((l) => l.employeeId === currentUser.id);
  const pendingLeave = myLeave.filter((l) => l.status === 'Pending');

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
          <div className="group relative">
            <Avatar name={currentUser.name} tone={currentUser.tone} avatarUrl={currentUser.avatarUrl} size={56} className="text-lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarSaving}
              aria-label="Change photo"
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-ink-900 text-white transition-colors duration-150 hover:bg-ink-800 disabled:opacity-50">
              <CameraIcon className="h-3 w-3" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </div>
          <div className="flex-1">
            <p className="text-[15px] font-semibold text-ink-900">{currentUser.name}</p>
            <p className="text-[13px] text-ink-500">
              {currentUser.jobTitle} · {currentUser.department}
            </p>
          </div>
          {currentUser.avatarUrl &&
          <Button size="sm" icon={<XIcon className="h-3.5 w-3.5" />} onClick={removeAvatar} disabled={avatarSaving}>
              Remove photo
            </Button>
          }
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
            <Input
              id="me-pass-old"
              type="password"
              placeholder="••••••••"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))} />

          </Field>
          <Field label="New password" htmlFor="me-pass-new">
            <Input
              id="me-pass-new"
              type="password"
              placeholder="••••••••"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} />

          </Field>
          <Field label="Confirm password" htmlFor="me-pass-confirm">
            <Input
              id="me-pass-confirm"
              type="password"
              placeholder="••••••••"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} />

          </Field>
        </div>
        <Button className="mt-4" onClick={updatePassword} disabled={pwSaving}>
          {pwSaving ? 'Updating…' : 'Update password'}
        </Button>
      </Panel>

      <Panel
        title="Leave"
        description={
        pendingLeave.length > 0 ?
        `${pendingLeave.length} request${pendingLeave.length > 1 ? 's' : ''} pending approval` :
        'Request time off and track approval status.'
        }
        actions={
        <Button variant="primary" size="sm" icon={<PalmtreeIcon className="h-3.5 w-3.5" />} onClick={() => setLeaveOpen(true)}>
            Request leave
          </Button>
        }>

        {myLeave.length === 0 ?
        <p className="py-6 text-center text-[13px] text-ink-500">You haven't requested leave yet.</p> :

        <ul className="divide-y divide-ink-100">
            {myLeave.slice(0, 4).map((l) =>
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-ink-900">{l.type}</p>
                  <p className="num text-xs text-ink-400">
                    {prettyDate(l.startDate)} → {prettyDate(l.endDate)} · {l.days} days
                  </p>
                </div>
                <StatusPill status={l.status} />
              </li>
          )}
          </ul>
        }
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

      <RequestLeaveModal open={leaveOpen} onClose={() => setLeaveOpen(false)} />
    </div>);

}