import { toast } from 'sonner';
import { DownloadIcon, FileSpreadsheetIcon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { buildCsv, csvColumns, downloadCsv } from '../../utils/csv';
import { prettyDate } from '../../utils/time';
import type { AttendanceRecord, Employee } from '../../types';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  employeeById: Record<string, Employee>;
  range: {from: string;to: string;};
  filterSummary: string[];
}

export function ExportModal({ open, onClose, records, employeeById, range, filterSummary }: ExportModalProps) {
  const handleExport = () => {
    downloadCsv(`attendance-${range.from}_${range.to}.csv`, buildCsv(records, employeeById));
    onClose();
    toast.success(`Exported ${records.length} records`, { description: 'attendance.csv downloaded' });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export attendance records"
      description="Only the records matching your current filters are included."
      size="sm"
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={<DownloadIcon className="h-4 w-4" />} onClick={handleExport}>
            Export CSV
          </Button>
        </>
      }>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50/60 p-3.5">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-600 shadow-card">
            <FileSpreadsheetIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="num text-[15px] font-semibold text-ink-900">{records.length} records</p>
            <p className="text-[13px] text-ink-500">
              {prettyDate(range.from)} → {prettyDate(range.to)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Active filters</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterSummary.map((f) =>
            <span key={f} className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
                {f}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">Columns</p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {csvColumns.map((c) =>
            <li key={c} className="text-[13px] text-ink-600">
                {c}
              </li>
            )}
          </ul>
        </div>
      </div>
    </Modal>);

}