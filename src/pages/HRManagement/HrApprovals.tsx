import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import HrPageHeader from '../../components/hr/HrPageHeader';
import Pagination from '../../components/hr/Pagination';
import StatusBadge from '../../components/hr/StatusBadge';
import { approvalAction, approvalSummary, listApprovals, type ApprovalRow, type ApprovalType } from '../../service/hrAdminService';
import type { ApprovalSummary, CorrectionRequest, EmployeeLoan, LeaveRequest, OvertimeRequest, RequestStatus } from '../../types/hr';
import { formatDate, formatRupiah } from '../../utils/hrFormat';

const TABS: { key: ApprovalType; label: string }[] = [
  { key: 'leave', label: 'Cuti & Izin' },
  { key: 'overtime', label: 'Lembur' },
  { key: 'correction', label: 'Koreksi Absen' },
  { key: 'loan', label: 'Kasbon' },
];

const STATUS_FILTERS = [
  { key: 'PENDING', label: 'Menunggu' },
  { key: 'APPROVED', label: 'Disetujui' },
  { key: 'REJECTED', label: 'Ditolak' },
];

function LeaveRow({ row }: { row: LeaveRequest }) {
  const typeLabel: Record<string, string> = {
    SICK: 'Sakit',
    ANNUAL_LEAVE: 'Cuti Tahunan',
    UNPAID_LEAVE: 'Cuti Tanpa Gaji',
    FIELD_DUTY: 'Dinas Luar',
  };
  return (
    <div className="text-sm">
      <div className="font-semibold">{typeLabel[row.type] || row.type}</div>
      <div className="text-gray-500 text-xs">
        {formatDate(row.start_date)} s/d {formatDate(row.end_date)}
      </div>
      <div className="text-gray-600 dark:text-gray-300 mt-1">{row.reason}</div>
      {row.attachment_url && (
        <a href={row.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline mt-1 inline-block">
          Lihat lampiran
        </a>
      )}
    </div>
  );
}

export default function HrApprovals() {
  const [tab, setTab] = useState<ApprovalType>('leave');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [summary, setSummary] = useState<ApprovalSummary>({ leave: 0, overtime: 0, correction: 0, loan: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    const res = await approvalSummary();
    if (res.status && res.data) setSummary(res.data);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listApprovals(tab, {
      page,
      take: 10,
      status: (statusFilter || undefined) as RequestStatus | undefined,
    });
    if (res.status && res.data) {
      setRows(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error(res.message || 'Gagal memuat daftar pengajuan.');
    }
    setLoading(false);
  }, [tab, page, statusFilter]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    setPage(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter]);

  async function handleAction(row: ApprovalRow, action: 'approve' | 'reject') {
    if (action === 'reject') {
      const result = await Swal.fire({
        title: 'Tolak pengajuan?',
        input: 'textarea',
        inputPlaceholder: 'Alasan penolakan...',
        inputAttributes: { 'aria-label': 'Alasan penolakan' },
        showCancelButton: true,
        confirmButtonText: 'Tolak',
        cancelButtonText: 'Batal',
        inputValidator: (value) => (!value || !value.trim() ? 'Alasan penolakan wajib diisi.' : undefined),
      });
      if (!result.isConfirmed || !result.value) return;
      const res = await approvalAction(tab, row.id, 'reject', String(result.value).trim());
      if (res.status) {
        toast.success('Pengajuan ditolak.');
      } else {
        toast.error(res.message || 'Gagal menolak pengajuan.');
      }
    } else {
      const confirm = await Swal.fire({
        title: 'Setujui pengajuan?',
        text: 'Pastikan data sudah benar. Tindakan ini tidak bisa dibatalkan.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, setujui',
        cancelButtonText: 'Batal',
      });
      if (!confirm.isConfirmed) return;
      const res = await approvalAction(tab, row.id, 'approve');
      if (res.status) {
        toast.success('Pengajuan disetujui.');
      } else {
        toast.error(res.message || 'Gagal menyetujui pengajuan.');
      }
    }
    load();
    loadSummary();
  }

  function renderRowDetails(row: ApprovalRow) {
    if (tab === 'leave') return <LeaveRow row={row as LeaveRequest} />;
    if (tab === 'overtime') {
      const overtime = row as OvertimeRequest;
      return (
        <div className="text-sm">
          <div className="font-semibold">Lembur {formatDate(overtime.overtime_date)}</div>
          <div className="text-gray-500 text-xs">
            {overtime.start_time} – {overtime.end_time} ({overtime.duration_hours} jam)
          </div>
          <div className="text-gray-600 dark:text-gray-300 mt-1">{overtime.reason}</div>
        </div>
      );
    }
    if (tab === 'correction') {
      const correction = row as CorrectionRequest;
      return (
        <div className="text-sm">
          <div className="font-semibold">
            {correction.correction_type === 'LATE_DISPENSATION' ? 'Dispensasi Telat' : 'Koreksi Lupa Absen Pulang'}{' '}
            {formatDate(correction.attendance_date)}
          </div>
          <div className="text-gray-500 text-xs">
            {correction.correction_type === 'LATE_DISPENSATION'
              ? `Jam masuk yang diajukan: ${correction.requested_check_in_time || '-'}`
              : `Jam pulang yang diajukan: ${correction.requested_check_out_time || '-'}`}
          </div>
          <div className="text-gray-600 dark:text-gray-300 mt-1">{correction.reason}</div>
          {correction.attachment_url && (
            <a href={correction.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline mt-1 inline-block">
              Lihat lampiran
            </a>
          )}
        </div>
      );
    }
    const loan = row as EmployeeLoan;
    return (
      <div className="text-sm">
        <div className="font-semibold">Kasbon {formatRupiah(loan.total_amount)}</div>
        <div className="text-gray-500 text-xs">
          Cicilan {formatRupiah(loan.monthly_installment)}/bulan · {formatDate(loan.loan_date)}
        </div>
        <div className="text-gray-600 dark:text-gray-300 mt-1">{loan.reason}</div>
      </div>
    );
  }

  return (
    <div>
      <HrPageHeader title="Pusat Approval" description="Proses pengajuan cuti, lembur, koreksi absen, dan kasbon pegawai." />

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((item) => {
          const count =
            item.key === 'leave'
              ? summary.leave
              : item.key === 'overtime'
                ? summary.overtime
                : item.key === 'correction'
                  ? summary.correction
                  : summary.loan;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                tab === item.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              {item.label}
              {count > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStatusFilter(filter.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              statusFilter === filter.key
                ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500 text-sm py-6">Memuat data...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-500 text-sm">
            Tidak ada pengajuan pada kategori ini.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={`${tab}-${row.id}`}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                  {(row.user?.nama || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{row.user?.nama || '-'}</span>
                    <span className="text-xs text-gray-500">{row.nama_toko}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="mt-2">{renderRowDetails(row)}</div>
                  {row.admin_notes && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      Catatan admin: {row.admin_notes}
                    </div>
                  )}
                </div>
              </div>
              {row.status === 'PENDING' && (
                <div className="flex gap-2 sm:flex-col">
                  <button
                    onClick={() => handleAction(row, 'approve')}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() => handleAction(row, 'reject')}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
