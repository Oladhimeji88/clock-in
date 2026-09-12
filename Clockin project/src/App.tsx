import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider } from './contexts/AppContext';
import { HRLayout } from './layouts/HRLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { Login } from './pages/Login';
import { HRDashboard } from './pages/hr/Dashboard';
import { Employees } from './pages/hr/Employees';
import { EmployeeDetail } from './pages/hr/EmployeeDetail';
import { Attendance } from './pages/hr/Attendance';
import { TimeRecords } from './pages/hr/TimeRecords';
import { LeaveAdmin } from './pages/hr/Leave';
import { Reports } from './pages/hr/Reports';
import { HRSettings } from './pages/hr/Settings';
import { EmployeeClock } from './pages/employee/Clock';
import { EmployeeHistory } from './pages/employee/History';
import { CustomizeClock } from './pages/employee/CustomizeClock';
import { EmployeeSettings } from './pages/employee/Settings';
import { FullScreenClock } from './pages/employee/FullScreenClock';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: '12px' } }} />
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<HRDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:employeeId" element={<EmployeeDetail />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="time-records" element={<TimeRecords />} />
            <Route path="leave" element={<LeaveAdmin />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<HRSettings />} />
          </Route>

          <Route path="/me/fullscreen" element={<FullScreenClock />} />
          <Route path="/me" element={<EmployeeLayout />}>
            <Route index element={<EmployeeClock />} />
            <Route path="history" element={<EmployeeHistory />} />
            <Route path="customize" element={<CustomizeClock />} />
            <Route path="settings" element={<EmployeeSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>);

}