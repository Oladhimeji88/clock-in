import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Field, Input, Select, Toggle } from '../../components/ui/Field';
import { useApp } from '../../contexts/AppContext';

export function HRSettings() {
  const { company, updateCompany } = useApp();
  const [form, setForm] = useState({
    name: company.name,
    timezone: company.timezone,
    defaultHours: 8,
    startTime: '09:00',
    endTime: '17:00',
    breakAllowance: 60,
    graceMinutes: 10,
    autoEndBreak: true,
    requireBreakAfter: 6,
    annualAllowance: 25,
    requireApproval: true,
    allowSelfLeave: true,
    employeeEditHours: false,
    employeeSeeTeam: false,
    exportFormat: 'CSV (comma separated)',
    includeBreaks: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, name: company.name, timezone: company.timezone }));
  }, [company.name, company.timezone]);

  const set = <K extends keyof typeof form,>(key: K, value: (typeof form)[K]) =>
  setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateCompany({ name: form.name, timezone: form.timezone });
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save company details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">Settings</h2>
          <p className="mt-1 text-[13px] text-ink-500">Company-wide defaults for time tracking and leave.</p>
        </div>
        <Button variant="primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      <Panel title="Company details" description="Name and timezone are shown on the sign-in screen.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" htmlFor="co-name">
            <Input id="co-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Timezone" htmlFor="co-tz">
            <Select id="co-tz" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              <option>GMT+1 · Lisbon</option>
              <option>GMT+0 · London</option>
              <option>GMT+2 · Berlin</option>
              <option>GMT-5 · New York</option>
              <option>GMT-8 · Los Angeles</option>
            </Select>
          </Field>
        </div>
      </Panel>

      <Panel title="Working hours defaults" description="Applied to every new employee account.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Expected hours / day" htmlFor="set-hours">
            <Input
              id="set-hours"
              type="number"
              min={1}
              max={12}
              step={0.5}
              value={form.defaultHours}
              onChange={(e) => set('defaultHours', Number(e.target.value))} />
            
          </Field>
          <Field label="Default start" htmlFor="set-start">
            <Input id="set-start" type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
          </Field>
          <Field label="Default end" htmlFor="set-end">
            <Input id="set-end" type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
          </Field>
          <Field label="Late grace period" htmlFor="set-grace" className="sm:col-span-3" hint="Clock-ins after this window are flagged as late.">
            <div className="flex items-center gap-2">
              <Input
                id="set-grace"
                type="number"
                min={0}
                max={60}
                value={form.graceMinutes}
                onChange={(e) => set('graceMinutes', Number(e.target.value))}
                className="w-24" />
              
              <span className="text-[13px] text-ink-500">minutes after scheduled start</span>
            </div>
          </Field>
        </div>
      </Panel>

      <Panel title="Break rules">
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Break allowance" htmlFor="set-break">
              <Select
                id="set-break"
                value={form.breakAllowance}
                onChange={(e) => set('breakAllowance', Number(e.target.value))}>
                
                {[30, 45, 60, 90].map((m) =>
                <option key={m} value={m}>
                    {m} minutes
                  </option>
                )}
              </Select>
            </Field>
            <Field label="Mandatory break after" htmlFor="set-after">
              <Select
                id="set-after"
                value={form.requireBreakAfter}
                onChange={(e) => set('requireBreakAfter', Number(e.target.value))}>
                
                {[4, 5, 6, 8].map((h) =>
                <option key={h} value={h}>
                    {h} hours worked
                  </option>
                )}
              </Select>
            </Field>
          </div>
          <div className="border-t border-ink-100 pt-3">
            <Toggle
              checked={form.autoEndBreak}
              onChange={(v) => set('autoEndBreak', v)}
              label="Auto-end breaks at the allowance limit"
              description="Prevents forgotten breaks from eating into logged hours." />
            
          </div>
        </div>
      </Panel>

      <Panel title="Leave settings">
        <div className="space-y-3">
          <Field label="Annual leave allowance" htmlFor="set-annual">
            <div className="flex items-center gap-2">
              <Input
                id="set-annual"
                type="number"
                min={0}
                max={60}
                value={form.annualAllowance}
                onChange={(e) => set('annualAllowance', Number(e.target.value))}
                className="w-24" />
              
              <span className="text-[13px] text-ink-500">days per year</span>
            </div>
          </Field>
          <div className="space-y-1 border-t border-ink-100 pt-3">
            <Toggle
              checked={form.requireApproval}
              onChange={(v) => set('requireApproval', v)}
              label="Require HR approval for all leave" />
            
            <Toggle
              checked={form.allowSelfLeave}
              onChange={(v) => set('allowSelfLeave', v)}
              label="Let employees submit their own requests" />
            
          </div>
        </div>
      </Panel>

      <Panel title="Employee permissions">
        <div className="space-y-1">
          <Toggle
            checked={form.employeeEditHours}
            onChange={(v) => {
              set('employeeEditHours', v);
              if (v) toast.error('Required working hours stay under HR control');
            }}
            label="Allow employees to change their required hours"
            description="Locked by design — only People Ops can change expected hours." />
          
          <Toggle
            checked={form.employeeSeeTeam}
            onChange={(v) => set('employeeSeeTeam', v)}
            label="Allow employees to see team attendance" />
          
        </div>
      </Panel>

      <Panel title="Export settings">
        <div className="space-y-3">
          <Field label="Default export format" htmlFor="set-format">
            <Select id="set-format" value={form.exportFormat} onChange={(e) => set('exportFormat', e.target.value)}>
              <option>CSV (comma separated)</option>
              <option>CSV (semicolon separated)</option>
            </Select>
          </Field>
          <div className="border-t border-ink-100 pt-3">
            <Toggle
              checked={form.includeBreaks}
              onChange={(v) => set('includeBreaks', v)}
              label="Include break columns in exports" />
            
          </div>
        </div>
      </Panel>
    </div>);

}