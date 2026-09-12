import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/Field';
import { departments } from '../../data/employees';
import { useApp } from '../../contexts/AppContext';
import type { AccountStatus, Employee } from '../../types';

interface EditEmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export function EditEmployeeModal({ employee, onClose }: EditEmployeeModalProps) {
  const { updateEmployee } = useApp();
  const [form, setForm] = useState<Employee | null>(employee);

  useEffect(() => setForm(employee), [employee]);

  if (!form) return <Modal open={false} onClose={onClose} title="Edit employee">{null}</Modal>;

  const set = <K extends keyof Employee,>(key: K, value: Employee[K]) =>
  setForm((prev) => prev ? { ...prev, [key]: value } : prev);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(form.id, {
      department: form.department,
      jobTitle: form.jobTitle,
      expectedHours: Number(form.expectedHours),
      startTime: form.startTime,
      endTime: form.endTime,
      breakAllowanceMin: Number(form.breakAllowanceMin),
      accountStatus: form.accountStatus
    });
    toast.success(`${form.name} updated`, { description: `Expected hours set to ${form.expectedHours} hrs/day.` });
    onClose();
  };

  return (
    <Modal
      open={Boolean(employee)}
      onClose={onClose}
      title={`Edit ${form.name}`}
      description="Working-hour requirements are controlled here, not by the employee."
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="edit-employee-form" variant="primary">
            Save changes
          </Button>
        </>
      }>
      
      <form id="edit-employee-form" onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department" htmlFor="edit-dept">
            <Select id="edit-dept" value={form.department} onChange={(e) => set('department', e.target.value)}>
              {departments.map((d) =>
              <option key={d}>{d}</option>
              )}
            </Select>
          </Field>
          <Field label="Job title" htmlFor="edit-title">
            <Input id="edit-title" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
          </Field>
        </div>

        <Field label="Expected working hours" htmlFor="edit-hours" locked hint="Applies from the next working day.">
          <div className="flex items-center gap-2">
            <Input
              id="edit-hours"
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={form.expectedHours}
              onChange={(e) => set('expectedHours', Number(e.target.value))}
              className="w-24" />
            
            <span className="text-[13px] text-ink-500">hours per working day</span>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Start time" htmlFor="edit-start">
            <Input id="edit-start" type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </Field>
          <Field label="End time" htmlFor="edit-end">
            <Input id="edit-end" type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </Field>
          <Field label="Break allowance" htmlFor="edit-break">
            <Select
              id="edit-break"
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

        <Field label="Account status" htmlFor="edit-status">
          <Select
            id="edit-status"
            value={form.accountStatus}
            onChange={(e) => set('accountStatus', e.target.value as AccountStatus)}>
            
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="disabled">Disabled</option>
          </Select>
        </Field>
      </form>
    </Modal>);

}