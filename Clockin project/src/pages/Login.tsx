import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircleIcon, ArrowRightIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { Brand } from '../components/Brand';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { ClockFace } from '../components/clock/ClockFace';
import { useApp } from '../contexts/AppContext';
import { useNow } from '../hooks/useNow';
import { cn } from '../utils/cn';

const DEMO = [
{ label: 'HR / Admin', email: 'amara.cole@northbeam.co', hint: 'People Operations' },
{ label: 'Employee', email: 'sarah.johnson@northbeam.co', hint: 'Engineering' }];


export function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const now = useNow();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('cadence');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (currentUser) return <Navigate to={currentUser.role === 'hr' ? '/hr' : '/me'} replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setBusy(false);
      if (!result.ok) {
        setError(result.message ?? 'Unable to sign in.');
        return;
      }
      navigate(result.role === 'hr' ? '/hr' : '/me');
    }, 420);
  };

  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <div className="relative hidden w-[46%] max-w-[620px] flex-col justify-between bg-ink-950 p-10 lg:flex">
        <Brand inverted />
        <div className="space-y-8">
          <ClockFace
            settings={{
              style: 'segmented',
              theme: 'dark',
              hour12: false,
              showSeconds: true,
              showDate: true,
              showDay: true,
              showStatus: false,
              showWorked: false,
              showRemaining: false,
              showProgress: false
            }}
            now={now}
            workedMs={0}
            remainingMs={0}
            progress={0}
            status="not_in"
            expectedHours={8}
            size="md"
            className="border-white/10" />
          
          <div>
            <h2 className="max-w-sm text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
              Every hour accounted for, without the paperwork.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
              Clock in, take breaks, request leave — and give People Ops a live view of the whole company.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/30">Northbeam Labs · Workforce time tracking</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="w-full max-w-[380px]">
          
          <div className="lg:hidden">
            <Brand size="lg" />
          </div>
          <h1 className="mt-8 text-[26px] font-semibold tracking-[-0.02em] text-ink-900 lg:mt-0">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to your Cadence workspace.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <Field label="Work email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@northbeam.co" />
              
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-11" />
                
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1.5 rounded-md p-1.5 text-ink-400 transition-colors duration-150 hover:bg-ink-100 hover:text-ink-700">
                  
                  {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-ink-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-accent-600 focus:ring-accent-500/30" />
                
                Remember me
              </label>
              <button type="button" className="text-[13px] font-medium text-accent-700 hover:text-accent-800">
                Forgot password?
              </button>
            </div>

            {error &&
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-[13px] text-rose-700">
                <AlertCircleIcon className="mt-px h-4 w-4 shrink-0" />
                {error}
              </div>
            }

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
              {busy ? 'Signing in…' : 'Log in'}
              {!busy && <ArrowRightIcon className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-ink-200 bg-surface p-3">
            <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
              Demo accounts
            </p>
            {DEMO.map((d) =>
            <button
              key={d.email}
              onClick={() => {
                setEmail(d.email);
                setPassword('cadence');
                setError(null);
              }}
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-ink-50',
                email === d.email && 'bg-ink-50'
              )}>
              
                <span>
                  <span className="block text-[13px] font-medium text-ink-900">{d.label}</span>
                  <span className="block text-xs text-ink-400">{d.email}</span>
                </span>
                <span className="text-[11px] font-medium text-ink-400">{d.hint}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>);

}