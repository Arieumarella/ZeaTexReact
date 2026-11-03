import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import HrPageHeader from '../../components/hr/HrPageHeader';
import StatusBadge from '../../components/hr/StatusBadge';
import { deletePayroll, finalizePayroll, getPayroll, updatePayslip } from '../../service/hrAdminService';
import type { PayrollDetail, Payslip } from '../../types/hr';
import { formatDate, formatRupiah } from '../../utils/hrFormat';
import { downloadPayslipPdf, exportBankTransferCsv, exportPayrollExcel } from '../../utils/payslipPdf';

export default function HrPayrollDetail() {
  const { id } = useParams<{ id: string }>();
  const payrollId = parseInt(id || '0', 10);
  const [payroll, setPayroll] = useState<PayrollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState<{ payslipId: number; bonus: string; other: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!payrollId) return;
    setLoading(true);
    const res = await getPayroll(payrollId);
    if (res.status && res.data) {
      setPayroll(res.data);
    } else {
      toast.error(res.message || 'Gagal memuat detail payroll.');
    }
    setLoading(false);
  }, [payrollId]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(slip: Payslip) {
    setEditingRow({ payslipId: slip.id, bonus: String(slip.bonus_amount), other: String(slip.other_deduction_amount) });
  }

  async function saveEdit() {
    if (!editingRow) return;
    setBusy(true);
    const res = await updatePayslip(payrollId, editingRow.payslipId, {
      bonus_amount: Number(editingRow.bonus || 0),
      other_deduction_amount: Number(editingRow.other || 0),
    });
    setBusy(false);
    if (res.status) {
      toast.success('Slip gaji berhasil diperbarui.');
      setEditingRow(null);
      load();
    } else {
      toast.error(res.message || 'Gagal memperbarui slip gaji.');
    }
  }

  async function handleFinalize() {
    if (!payroll) return;
    const confirm = await Swal.fire({
      title: 'Finalisasi payroll?',
      html: `
        <p>Payroll <b>${payroll.period_name}</b> akan dikunci permanen.</p>
        <p>Saldo kasbon pegawai akan dipotong sesuai slip.</p>
        <p class="text-red-600 font-semibold mt-2">Tindakan ini tidak bisa dibatalkan.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, finalisasi',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;
    setBusy(true);
    const res = await finalizePayroll(payrollId);
    setBusy(false);
    if (res.status) {
      toast.success('Payroll berhasil difinalisasi.');
      load();
    } else {
      toast.error(res.message || 'Gagal memfinalisasi payroll.');
    }
  }

  async function handleDelete() {
    if (!payroll) return;
    const confirm = await Swal.fire({
      title: 'Hapus payroll draft?',
      text: 'Seluruh slip gaji di periode ini juga akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;
    const res = await deletePayroll(payrollId);
    if (res.status) {
      toast.success('Payroll draft berhasil dihapus.');
      window.location.href = '/hr-management/payrolls';
    } else {
      toast.error(res.message || 'Gagal menghapus payroll.');
    }
  }

  if (loading || !payroll) {
    return (
      <div>
        <HrPageHeader title="Detail Payroll" />
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm text-gray-900 dark:text-white';

  return (
    <div>
      <HrPageHeader
        title={payroll.period_name}
        description={`${payroll.nama_toko || 'Semua Toko'} · ${formatDate(payroll.cutoff_start || payroll.cutoff_start_date)} s/d ${formatDate(payroll.cutoff_end || payroll.cutoff_end_date)}`}
      >
        <Link
          to="/hr-management/payrolls"
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Kembali
        </Link>
        <button
          onClick={() => exportPayrollExcel(payroll)}
          className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          Export Excel
        </button>
        <button
          onClick={() => exportBankTransferCsv(payroll)}
          className="px-4 py-2.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
        >
          Export Transfer Bank
        </button>
        {payroll.status === 'DRAFT' && (
          <>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
            >
              Hapus
            </button>
            <button
              onClick={handleFinalize}
              disabled={busy}
              className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? 'Memproses...' : 'Finalisasi'}
            </button>
          </>
        )}
      </HrPageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500">Pegawai</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{payroll.total_employees}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500">Total Bruto</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatRupiah(payroll.total_gross)}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500">Total Potongan</div>
          <div className="text-xl font-bold text-red-600">{formatRupiah(payroll.total_deduction)}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs text-gray-500">Total Bersih</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatRupiah(payroll.total_net)}</div>
        </div>
      </div>

      {payroll.total_net < 0 && (
        <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          Peringatan: total gaji bersih negatif. Periksa potongan dan gaji pegawai.
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Pegawai</th>
                <th className="px-4 py-3 text-center font-semibold">Hari Kerja</th>
                <th className="px-4 py-3 text-center font-semibold">Hadir</th>
                <th className="px-4 py-3 text-center font-semibold">Alpha</th>
                <th className="px-4 py-3 text-right font-semibold">Bruto</th>
                <th className="px-4 py-3 text-right font-semibold">Bonus</th>
                <th className="px-4 py-3 text-right font-semibold">Potongan Lain</th>
                <th className="px-4 py-3 text-right font-semibold">Total Potongan</th>
                <th className="px-4 py-3 text-right font-semibold">Bersih</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {payroll.payslips.map((slip) => {
                const isEditing = editingRow?.payslipId === slip.id;
                return (
                  <tr key={slip.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {slip.employee_name_snapshot || slip.user?.nama || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {slip.position_snapshot || '-'} · {slip.nama_toko || slip.store_name_snapshot || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{slip.total_working_days}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{slip.total_present_days}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{slip.total_absent_days}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatRupiah(slip.gross_salary)}</td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editingRow.bonus}
                          onChange={(event) => setEditingRow({ ...editingRow, bonus: event.target.value })}
                          className={inputClass + ' w-28 text-right'}
                        />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">{formatRupiah(slip.bonus_amount)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editingRow.other}
                          onChange={(event) => setEditingRow({ ...editingRow, other: event.target.value })}
                          className={inputClass + ' w-28 text-right'}
                        />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300">{formatRupiah(slip.other_deduction_amount)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">{formatRupiah(slip.total_deduction)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatRupiah(slip.net_salary)}
                      {slip.net_salary < 0 && (
                        <span className="ml-1 text-xs text-red-500 font-medium">(negatif)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingRow(null)}
                            className="ml-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 text-xs font-semibold"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => downloadPayslipPdf(slip, payroll.period_name)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                          >
                            PDF
                          </button>
                          {payroll.status === 'DRAFT' && (
                            <button
                              onClick={() => startEdit(slip)}
                              className="ml-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-200"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <StatusBadge status={payroll.status} />
        <span className="text-sm text-gray-500">
          {payroll.status === 'DRAFT'
            ? 'Payroll masih draft. Bonus dan potongan lain bisa diedit sebelum finalisasi.'
            : `Difinalisasi pada ${formatDate(payroll.finalized_at)}. Payroll terkunci.`}
        </span>
      </div>
    </div>
  );
}
