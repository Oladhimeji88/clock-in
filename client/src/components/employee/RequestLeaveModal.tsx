import React, { useState } from 'react';
import { toast } from 'sonner';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { useApp } from '../../contexts/AppContext';
import { isoDate } from '../../utils/time';
import type { LeaveType } from '../../types';

const TYPES: LeaveType[] = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Other'];

export function RequestLeaveModal({ open, onClose }: {open: boolean;onClose: () => void;}) {
  const { submitLeave } = useApp();
  const todayIso = isoDate(new Date());
  const [type, setType] = useState<LeaveType>('Annual Leave');
  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(todayIso);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const close = () => {
    onClose();
    window.setTimeout(() => setSubmitted(false), 220);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitLeave({ type, startDate, endDate, reason });
    setSubmitted(true);
    toast.success('Leave request submitted', { description: 'People Ops will review it shortly.' });
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={submitted ? 'Request submitted' : 'Request leave'}
      description={submitted ? undefined : 'Your manager and People Ops are notified immediately.'}
      size="sm"
      footer={
      submitted ?
      <Button variant="primary" onClick={close}>
            Done
          </Button> :

      <>
            <Button onClick={close}>Cancel</Button>
            <Button type="submit" form="leave-form" variant="primary">
              Submit request
            </Button>
          </>

      }>
      
      {submitted ?
      <div className="py-2 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-sm font-semibold text-amber-700">
            •••
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink-900">Pending approval</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink-500">
            {type} · {startDate} → {endDate}. You'll get a notification once it's reviewed.
          </p>
        </div> :

      <form id="leave-form" onSubmit={submit} className="space-y-4">
          <Field label="Leave type" htmlFor="leave-type">
            <Select id="leave-type" value={type} onChange={(e) => setType(e.target.value as LeaveType)}>
              {TYPES.map((t) =>
            <option key={t}>{t}</option>
            )}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="leave-start">
              <Input id="leave-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date" htmlFor="leave-end">
              <Input id="leave-end" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Reason" htmlFor="leave-reason">
            <Textarea
            id="leave-reason"
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="A short note for your manager…" />
          
          </Field>
        </form>
      }
    </Modal>);

}