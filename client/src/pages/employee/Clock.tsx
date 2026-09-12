import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  CheckCircle2Icon,
  CoffeeIcon,
  ExpandIcon,
  LogInIcon,
  LogOutIcon,
  PlayIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { ClockFace } from '../../components/clock/ClockFace';
import { CircularProgress } from '../../components/clock/CircularProgress';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { StatusPill } from '../../components/ui/StatusPill';
import { WeeklyBars } from '../../components/WeeklyBars';
import { useApp } from '../../contexts/AppContext';
import { useNow } from '../../hooks/useNow';
import { useOwnRecords } from '../../hooks/useRecords';
import { weeklyMinutesFromRecords } from '../../utils/records';
import {
  addHoursToTime,
  formatClockHours,
  formatDurationHMS,
  formatHm,
  greeting,
  isoDate,
  longDate,
  sessionTotals,
  stampToLabel } from
'../../utils/time';

export function EmployeeClock() {
  const { currentUser, session, clockSettings, clockIn, clockOut, startBreak, endBreak, resetDay } = useApp();
  const now = useNow();
  const navigate = useNavigate();

  const today = new Date();
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 13);
  const { records } = useOwnRecords(isoDate(twoWeeksAgo), isoDate(today));

  if (!currentUser) return null;

  const totals = sessionTotals(session, now, currentUser.expectedHours);
  const expectedMin = Math.round(currentUser.expectedHours * 60);
  const week = weeklyMinutesFromRecords(records);
  const weekTotal = week.reduce((s, d) => s + d.minutes, 0);
  const clockedIn = Boolean(session.clockInAt);
  const done = session.status === 'out';

  const handle = {
    in: () => {
      clockIn();
      toast.success('Clocked in', { description: `Target ${currentUser.expectedHours} hours today.` });
    },
    out: () => {
      clockOut();
      toast.success('Clocked out', { description: `Total worked ${formatDurationHMS(totals.workedMs)}.` });
    },
    breakStart: () => {
      startBreak();
      toast.success('Break started', { description: 'Working time is paused.' });
    },
    breakEnd: () => {
      endBreak();
      toast.success('Back to work', { description: 'Working time resumed.' });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-ink-900">
            {greeting(new Date(now))}, {currentUser.name.split(' ')[0]}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-500">
            {longDate(new Date(now))}
            <StatusPill status={session.status} pulse={session.status === 'working' || session.status === 'break'} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button icon={<SlidersHorizontalIcon className="h-4 w-4" />} onClick={() => navigate('/me/customize')}>
            Customize clock
          </Button>
          <Button variant="dark" icon={<ExpandIcon className="h-4 w-4" />} onClick={() => navigate('/me/fullscreen')}>
            Full screen
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <ClockFace
            settings={clockSettings}
            now={now}
            workedMs={totals.workedMs}
            remainingMs={totals.remainingMs}
            progress={totals.progress}
            status={session.status}
            expectedHours={currentUser.expectedHours}
            size="lg" />
          

          {done ?
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            
              <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-600 text-white">
                <CheckCircle2Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-emerald-900">Workday complete</p>
                <p className="num text-[13px] text-emerald-700">
                  {formatDurationHMS(totals.workedMs)} worked · {formatDurationHMS(totals.breakMs)} on break · clocked
                  out at {stampToLabel(session.clockOutAt)}
                </p>
              </div>
              <Button icon={<PlayIcon className="h-4 w-4" />} onClick={resetDay}>
                Start new session
              </Button>
            </motion.div> :

          <div className="flex flex-col gap-3 sm:flex-row">
              {!clockedIn ?
            <Button variant="primary" size="xl" fullWidth icon={<LogInIcon className="h-5 w-5" />} onClick={handle.in}>
                  Clock In
                </Button> :

            <Button
              variant="dark"
              size="xl"
              fullWidth
              icon={<LogOutIcon className="h-5 w-5" />}
              onClick={handle.out}>
              
                  Clock Out
                </Button>
            }

              {session.status === 'break' ?
            <Button size="xl" className="sm:w-[210px]" icon={<PlayIcon className="h-4 w-4" />} onClick={handle.breakEnd}>
                  End Break
                </Button> :

            <Button
              size="xl"
              className="sm:w-[210px]"
              icon={<CoffeeIcon className="h-4 w-4" />}
              disabled={session.status !== 'working'}
              onClick={handle.breakStart}>
              
                  Start Break
                </Button>
            }
            </div>
          }

          {session.status === 'break' &&
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-[13px] font-medium text-amber-900">
                Break started at {stampToLabel(session.breaks[session.breaks.length - 1]?.start ?? null)} — working time
                is paused.
              </p>
              <p className="num text-[15px] font-semibold text-amber-900">{formatDurationHMS(totals.activeBreakMs)}</p>
            </div>
          }
        </div>

        <Panel title="Workday" description={`Target ${currentUser.expectedHours} hours · set by People Ops`}>
          <div className="flex flex-col items-center">
            <CircularProgress
              progress={totals.progress}
              size={200}
              stroke={12}
              tone={session.status === 'break' ? 'amber' : totals.progress >= 1 ? 'emerald' : 'accent'}>
              
              <span className="num text-[30px] font-semibold tracking-[-0.03em] text-ink-900">
                {Math.round(totals.progress * 100)}%
              </span>
              <span className="num mt-0.5 text-[13px] text-ink-500">
                {formatHm(totals.workedMs / 60000)} / {currentUser.expectedHours}h
              </span>
            </CircularProgress>

            <dl className="mt-6 w-full divide-y divide-ink-100">
              {[
              ['Clocked in at', clockedIn ? stampToLabel(session.clockInAt) : 'Not yet'],
              ['Time worked', formatDurationHMS(totals.workedMs)],
              ['Break time', formatDurationHMS(totals.breakMs)],
              ['Remaining', formatDurationHMS(totals.remainingMs)],
              [
              'Expected clock out',
              clockedIn ?
              addHoursToTime(
                new Date(session.clockInAt ?? now).toTimeString().slice(0, 5),
                currentUser.expectedHours,
                Math.round(totals.breakMs / 60000)
              ) :
              addHoursToTime(currentUser.startTime, currentUser.expectedHours, currentUser.breakAllowanceMin)]].

              map(([label, value]) =>
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[13px] text-ink-500">{label}</dt>
                  <dd className="num text-[13px] font-medium text-ink-900">{value}</dd>
                </div>
              )}
            </dl>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
        ["Today's hours", `${formatClockHours(totals.workedMs / 60000)} / ${formatClockHours(expectedMin)}`],
        ['Break time', `${Math.round(totals.breakMs / 60000)} min`],
        ['Clock in', clockedIn ? stampToLabel(session.clockInAt) : '—'],
        [
        'Expected clock out',
        addHoursToTime(currentUser.startTime, currentUser.expectedHours, currentUser.breakAllowanceMin)],

        ['Weekly hours', formatHm(weekTotal)],
        ['Attendance', '96%']].
        map(([label, value]) =>
        <div key={label} className="rounded-2xl border border-ink-200 bg-surface p-4 shadow-card">
            <p className="text-[12px] text-ink-500">{label}</p>
            <p className="num mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-ink-900">{value}</p>
          </div>
        )}
      </div>

      <Panel title="This week" description={`${formatHm(weekTotal)} logged across your working days`}>
        <WeeklyBars data={week} expectedMin={expectedMin} />
      </Panel>
    </div>);

}