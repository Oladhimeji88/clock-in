import type { LeaveRequest } from '../types';

export const leaveRequests: LeaveRequest[] = [
{
  id: 'lv-01',
  employeeId: 'e-05',
  type: 'Annual Leave',
  startDate: '2026-09-11',
  endDate: '2026-09-15',
  days: 3,
  status: 'Approved',
  reason: 'Family trip booked earlier this year.',
  submittedAt: '2026-08-24'
},
{
  id: 'lv-02',
  employeeId: 'e-08',
  type: 'Sick Leave',
  startDate: '2026-09-12',
  endDate: '2026-09-12',
  days: 1,
  status: 'Approved',
  reason: 'Flu symptoms, doctor appointment at noon.',
  submittedAt: '2026-09-12'
},
{
  id: 'lv-03',
  employeeId: 'e-02',
  type: 'Personal Leave',
  startDate: '2026-09-22',
  endDate: '2026-09-23',
  days: 2,
  status: 'Pending',
  reason: 'Apartment move.',
  submittedAt: '2026-09-09'
},
{
  id: 'lv-04',
  employeeId: 'e-03',
  type: 'Annual Leave',
  startDate: '2026-10-06',
  endDate: '2026-10-10',
  days: 5,
  status: 'Pending',
  reason: 'Annual leave — visiting family abroad.',
  submittedAt: '2026-09-10'
},
{
  id: 'lv-05',
  employeeId: 'e-06',
  type: 'Sick Leave',
  startDate: '2026-09-02',
  endDate: '2026-09-03',
  days: 2,
  status: 'Rejected',
  reason: 'Submitted after the reporting window.',
  submittedAt: '2026-09-04'
},
{
  id: 'lv-06',
  employeeId: 'e-09',
  type: 'Annual Leave',
  startDate: '2026-09-29',
  endDate: '2026-09-30',
  days: 2,
  status: 'Pending',
  reason: 'Long weekend.',
  submittedAt: '2026-09-11'
},
{
  id: 'lv-07',
  employeeId: 'e-01',
  type: 'Annual Leave',
  startDate: '2026-08-04',
  endDate: '2026-08-08',
  days: 5,
  status: 'Approved',
  reason: 'Summer holiday.',
  submittedAt: '2026-07-02'
},
{
  id: 'lv-08',
  employeeId: 'e-01',
  type: 'Sick Leave',
  startDate: '2026-07-17',
  endDate: '2026-07-17',
  days: 1,
  status: 'Approved',
  reason: 'Migraine.',
  submittedAt: '2026-07-17'
}];