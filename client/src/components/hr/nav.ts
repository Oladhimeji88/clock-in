import {
  BarChart3Icon,
  CalendarRangeIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  PalmtreeIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  title: string;
  icon: typeof UsersIcon;
  end?: boolean;
}

export const hrNav: NavItem[] = [
{ to: '/hr', label: 'Dashboard', title: 'Dashboard', icon: LayoutDashboardIcon, end: true },
{ to: '/hr/employees', label: 'Employees', title: 'Employees', icon: UsersIcon },
{ to: '/hr/attendance', label: 'Attendance', title: 'Attendance', icon: CalendarRangeIcon },
{ to: '/hr/time-records', label: 'Time Records', title: 'Time Records', icon: ClipboardListIcon },
{ to: '/hr/leave', label: 'Leave', title: 'Leave', icon: PalmtreeIcon },
{ to: '/hr/reports', label: 'Reports', title: 'Reports', icon: BarChart3Icon },
{ to: '/hr/settings', label: 'Settings', title: 'Settings', icon: SettingsIcon }];


export function titleForPath(pathname: string): string {
  if (/^\/hr\/employees\/[^/]+$/.test(pathname)) return 'Employee profile';
  const match = [...hrNav].reverse().find((item) => item.end ? pathname === item.to : pathname.startsWith(item.to));
  return match?.title ?? 'Dashboard';
}