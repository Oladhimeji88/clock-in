import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, CopyIcon, UserPlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { departments } from '../../data/employees';
import { useApp } from '../../contexts/AppContext';
import { cn } from '../../utils/cn';
import type { AccountStatus, Employee } from '../../types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EMPTY = {
  name: '',
  email: '',
  password: 'cadence-temp',
  department: 'Engineering',
  jobTitle: '',
  expectedHours: 8,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '09:00',
  endTime: '17:00',
  breakAllowanceMin: 60,
  accountStatus: 'active' as AccountStatus
};

export function AddEmployeeDrawer({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { addEmployee } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [created, setCreated] = useState<Employee | null>(null);

  const set = <K extends keyof typeof EMPTY,>(key: K, value: (typeof EMPTY)[K]) =>
  setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (day: string) =>
  setForm((prev) => ({
    ...prev,
    workingDays: prev.workingDays.includes(day) ?
    prev.workingDays.filter((d) => d !== day) :
    DAYS.filter((d) => prev.workingDays.includes(d) || d === day)
  }));

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setForm(EMPTY);
      setCreated(null);
    }, 220);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const employee = addEmployee({
      name: form.name,
      email: form.email,
      department: form.department,
      jobTitle: form.jobTitle,
      expectedHours: Number(form.expectedHours),
      workingDays: form.workingDays,
      startTime: form.startTime,
      endTime: form.endTime,
      breakAllowanceMin: Number(form.breakAllowanceMin),
      accountStatus: form.accountStatus
    });
    setCreated(employee);
    toast.success('Employee account created', { description: `${employee.name} can now sign in to Cadence.` });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      variant="drawer"
      title={created ? 'Account created' : 'Add employee'}
      description={
      created ?
      'Share the temporary credentials with the new team member.' :
      'Create the account and set the working-hour requirements.'
      }
      footer={
      created ?
      <>
            <Button
          onClick={() => {
            setForm(EMPTY);
            setCreated(null);
          }}>
          
              Add another
            </Button>
            <Button
          variant="primary"
          onClick={() => {
            const id = created.id;
            close();
            navigate(`/hr/employees/${id}`);
          }}>
          
              View employee
            </Button>
          </> :

      <>
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" form="add-employee-form" variant="primary" icon={<UserPlusIcon className="h-4 w-4" />}>
              Create account
            </Button>
          </>

      }>
      
      {created ?
      <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white">
              <CheckIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-emerald-900">{created.name} is ready to clock in</p>
              <p className="text-[13px] text-emerald-700">Account active · {created.department}</p>
            </div>
          </div>

          <dl className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200">
            {[
          ['Email', created.email],
          ['Temporary password', form.password],
          ['Expected hours', `${created.expectedHours} hrs / day`],
          ['Schedule', `${created.startTime} – ${created.endTime}`],
          ['Working days', created.workingDays.join(', ')],
          ['Break allowance', `${created.breakAllowanceMin} min`]].
          map(([k, v]) =>
          <div key={k} className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="text-[13px] text-ink-500">{k}</dt>
                <dd className="num text-[13px] font-medium text-ink-900">{v}</dd>
              </div>
          )}
          </dl>

          <Button
          icon={<CopyIcon className="h-4 w-4" />}
          fullWidth
          onClick={() => toast.success('Credentials copied to clipboard')}>
          
            Copy credentials
          </Button>
        </div> :

      <form id="add-employee-form" onSubmit={submit} className="space-y-4">
          <Field label="Full name" htmlFor="emp-name">
            <Input id="emp-name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jordan Rivera" />
          </Field>
          <Field label="Work email" htmlFor="emp-email">
            <Input
            id="emp-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="jordan.rivera@northbeam.co" />
          
          </Field>
          <Field label="Temporary password" htmlFor="emp-pass" hint="The employee is asked to change this on first login.">
            <Input id="emp-pass" required value={form.password} onChange={(e) => set('password', e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Department" htmlFor="emp-dept">
              <Select id="emp-dept" value={form.department} onChange={(e) => set('department', e.target.value)}>
                {departments.map((d) =>
              <option key={d}>{d}</option>
              )}
              </Select>
            </Field>
            <Field label="Job title" htmlFor="emp-title">
              <Input id="emp-title" required value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="Product Designer" />
            </Field>
          </div>

          <div className="rounded-xl border border-ink-200 bg-ink-50/50 p-4">
            <Field
            label="Expected working hours"
            htmlFor="emp-hours"
            locked
            hint="Employees cannot change this — only People Ops can.">
            
              <div className="flex items-center gap-2">
                <Input
                id="emp-hours"
                type="number"
                min={1}
                max={12}
                step={0.5}
                required
                value={form.expectedHours}
                onChange={(e) => set('expectedHours', Number(e.target.value))}
                className="w-24" />
              
                <span className="text-[13px] text-ink-500">hours per working day</span>
              </div>
            </Field>

            <div className="mt-4">
              <p className="mb-2 text-[13px] font-medium text-ink-700">Working days</p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => {
                const active = form.workingDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={active}
                    className={cn(
                      'h-8 w-11 rounded-lg border text-[13px] font-medium transition-colors duration-150',
                      active ?
                      'border-accent-600 bg-accent-600 text-white' :
                      'border-ink-200 bg-white text-ink-500 hover:border-ink-300'
                    )}>
                    
                      {d}
                    </button>);

              })}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Start time" htmlFor="emp-start">
                <Input id="emp-start" type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
              </Field>
              <Field label="End time" htmlFor="emp-end">
                <Input id="emp-end" type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
              </Field>
              <Field label="Break allowance" htmlFor="emp-break">
                <Select
                id="emp-break"
                value={form.breakAllowanceMin}
                onChange={(e) => set('breakAllowanceMin', Number(e.target.value))}>
                
                  {[30, 45, 60, 90].map((m) =>
                <option key={m} value={m}>
                      {m} min
                    </option>
                )}
                </Select>
              </Field>
            </div>
          </div>

          <Field label="Account status" htmlFor="emp-status">
            <Select
            id="emp-status"
            value={form.accountStatus}
            onChange={(e) => set('accountStatus', e.target.value as AccountStatus)}>
            
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="disabled">Disabled</option>
            </Select>
          </Field>
        </form>
      }
    </Modal>);

}