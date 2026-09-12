import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AttendanceRecord } from '../types';

export function useOwnRecords(from: string, to: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.attendance.
    recordsMe({ from, to }).
    then((r) => alive && setRecords(r)).
    finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [from, to]);

  return { records, loading };
}

export function useHrRecords(employeeId: string | undefined, from: string, to: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.attendance.
    records({ employeeId, from, to }).
    then((r) => alive && setRecords(r)).
    finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [employeeId, from, to]);

  return { records, loading };
}
