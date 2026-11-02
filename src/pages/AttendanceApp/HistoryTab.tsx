import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/hr/StatusBadge';
import { getMyHistory } from '../../service/hrEmployeeService';
import type { Attendance } from '../../types/hr';
import { formatDateTime, formatTime } from '../../utils/hrFormat';

export default function HistoryTab() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    const res = await getMyHistory(targetPage);
    if (res.status && res.data) {
      setRows(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error(res.message || 'Gagal memuat riwayat.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  return (
    <div className="space-y-3">
      {loading ? (
        <p className="text-sm text-gray-500 py-6 text-center">Memuat data...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">Belum ada riwayat absensi.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">{formatDateTime(row.attendance_date)}</span>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-xs text-gray-400">Masuk</span>
                <div>{formatTime(row.check_in_time)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-400">Pulang</span>
                <div>{formatTime(row.check_out_time)}</div>
              </div>
            </div>
            {row.late_minutes > 0 && (
              <div className="mt-1 text-xs text-amber-600">Terlambat {row.late_minutes} menit</div>
            )}
            {row.notes && <div className="mt-1 text-xs text-gray-500">{row.notes}</div>}
          </div>
        ))
      )}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
