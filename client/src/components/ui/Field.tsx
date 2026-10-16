import React from 'react';
import { cn } from '../../utils/cn';

export const inputClasses =
'h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 placeholder:text-ink-400 transition-colors duration-150 hover:border-ink-300 focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/10';

interface FieldProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  locked?: boolean;
}

export function Field({ label, hint, htmlFor, children, className, locked }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-[13px] font-medium text-ink-700">
        {label}
        {locked &&
        <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
            HR controlled
          </span>
        }
      </label>
      {children}
      {hint && <p className="text-xs text-ink-400">{hint}</p>}
    </div>);

}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={cn(inputClasses, 'appearance-none bg-white pr-8', className)}>
      {children}
    </select>);

}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cn(inputClasses, className)} />;
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cn(inputClasses, 'h-auto py-2.5 leading-relaxed', className)} />;
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg py-1.5 text-left">
      
      <span>
        <span className="block text-[13px] font-medium text-ink-800">{label}</span>
        {description && <span className="block text-xs text-ink-400">{description}</span>}
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ease-snap',
          checked ? 'bg-accent-600' : 'bg-ink-200'
        )}>
        
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-snap',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          )} />
        
      </span>
    </button>);

}