import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import StatusBadge from '../../components/hr/StatusBadge';
import {
  createCorrectionRequest,
  createLeaveRequest,
  createLoanRequest,
  createOvertimeRequest,
  listMyCorrections,
  listMyLeaveRequests,
  listMyLoans,
  listMyOvertimeRequests,
} from '../../service/hrEmployeeService';
import type { CorrectionRequest, EmployeeLoan, LeaveRequest, OvertimeRequest } from '../../types/hr';
import { formatDate, formatRupiah, todayString } from '../../utils/hrFormat';

type SubTab = 'leave' | 'overtime' | 'correction' | 'loan';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'leave', label: 'Cuti/Izin' },
  { key: 'overtime', label: 'Lembur' },
  { key: 'correction', label: 'Koreksi' },
  { key: 'loan', label: 'Kasbon' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white';

export default function RequestsTab() {
  const [tab, setTab] = useState<SubTab>('leave');
  const [submitting, setSubmitting] = useState(false);

  const [leaveForm, setLeaveForm] = useState({ type: 'ANNUAL_LEAVE', start_date: todayString(), end_date: todayString(), reason: '', attachment: null as File | null });
  const [overtimeForm, setOvertimeForm] = useState({ overtime_date: todayString(), start_time: '17:30', end_time: '19:30', reason: '' });
  const [correctionForm, setCorrectionForm] = useState({
    attendance_date: todayString(),
    correction_type: 'MISSING_CHECKOUT' as 'LATE_DISPENSATION' | 'MISSING_CHECKOUT',
    time: '17:30',
    reason: '',
    attachment: null as File | null,
  });
  const [loanForm, setLoanForm] = useState({ total_amount: '', monthly_installment: '', loan_date: todayString(), reason: '' });

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [loans, setLoans] = useState<EmployeeLoan[]>([]);

  const loadLists = useCallback(async () => {
    const [leaveRes, overtimeRes, correctionRes, loanRes] = await Promise.all([
      listMyLeaveRequests(),
      listMyOvertimeRequests(),
      listMyCorrections(),
      listMyLoans(),
    ]);
    if (leaveRes.status && leaveRes.data) setLeaves(leaveRes.data);
    if (overtimeRes.status && overtimeRes.data) setOvertimes(overtimeRes.data);
    if (correctionRes.status && correctionRes.data) setCorrections(correctionRes.data);
    if (loanRes.status && loanRes.data) setLoans(loanRes.data);
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  async function submitLeave() {
    if (!leaveForm.reason.trim()) {
      toast.error('Alasan wajib diisi.');
      return;
    }
    if (leaveForm.end_date < leaveForm.start_date) {
      toast.error('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }
    if (leaveForm.type === 'SICK' && !leaveForm.attachment) {
      toast.error('Surat keterangan sakit wajib dilampirkan.');
      return;
    }
    const formData = new FormData();
    formData.append('type', leaveForm.type);
    formData.append('start_date', leaveForm.start_date);
    formData.append('end_date', leaveForm.end_date);
    formData.append('reason', leaveForm.reason.trim());
    if (leaveForm.attachment) formData.append('attachment', leaveForm.attachment);
    setSubmitting(true);
    const res = await createLeaveRequest(formData);
    setSubmitting(false);
    if (res.status) {
      toast.success(res.message || 'Pengajuan cuti terkirim.');
      setLeaveForm({ ...leaveForm, reason: '', attachment: null });
      loadLists();
    } else {
      toast.error(res.message || 'Gagal mengirim pengajuan cuti.');
    }
  }

  async function submitOvertime() {
    if (!overtimeForm.reason.trim()) {
      toast.error('Alasan wajib diisi.');
      return;
    }
    setSubmitting(true);
    const res = await createOvertimeRequest({ ...overtimeForm, reason: overtimeForm.reason.trim() });
    setSubmitting(false);
    if (res.status) {
      toast.success(res.message || 'Pengajuan lembur terkirim.');
      setOvertimeForm({ ...overtimeForm, reason: '' });
      loadLists();
    } else {
      toast.error(res.message || 'Gagal mengirim pengajuan lembur.');
    }
  }

  async function submitCorrection() {
    if (!correctionForm.reason.trim()) {
      toast.error('Alasan wajib diisi.');
      return;
    }
    const formData = new FormData();
    formData.append('attendance_date', correctionForm.attendance_date);
    formData.append('correction_type', correctionForm.correction_type);
    formData.append(
      correctionForm.correction_type === 'LATE_DISPENSATION' ? 'requested_check_in_time' : 'requested_check_out_time',
      correctionForm.time,
    );
    formData.append('reason', correctionForm.reason.trim());
    if (correctionForm.attachment) formData.append('attachment', correctionForm.attachment);
    setSubmitting(true);
    const res = await createCorrectionRequest(formData);
    setSubmitting(false);
    if (res.status) {
      toast.success(res.message || 'Pengajuan koreksi terkirim.');
      setCorrectionForm({ ...correctionForm, reason: '', attachment: null });
      loadLists();
    } else {
      toast.error(res.message || 'Gagal mengirim pengajuan koreksi.');
    }
  }

  async function submitLoan() {
    if (!loanForm.reason.trim()) {
      toast.error('Alasan wajib diisi.');
      return;
    }
    const total = Number(loanForm.total_amount);
    const installment = Number(loanForm.monthly_installment);
    if (!total || total <= 0 || !installment || installment <= 0 || installment > total) {
      toast.error('Cicilan harus lebih dari 0 dan tidak melebihi jumlah kasbon.');
      return;
    }
    setSubmitting(true);
    const res = await createLoanRequest({
      total_amount: total,
      monthly_installment: installment,
      loan_date: loanForm.loan_date,
      reason: loanForm.reason.trim(),
    });
    setSubmitting(false);
    if (res.status) {
      toast.success(res.message || 'Pengajuan kasbon terkirim.');
      setLoanForm({ ...loanForm, total_amount: '', monthly_installment: '', reason: '' });
      loadLists();
    } else {
      toast.error(res.message || 'Gagal mengirim pengajuan kasbon.');
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {SUB_TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
              tab === item.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'leave' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ajukan Cuti / Izin</h3>
            <select value={leaveForm.type} onChange={(event) => setLeaveForm({ ...leaveForm, type: event.target.value })} className={inputClass}>
              <option value="ANNUAL_LEAVE">Cuti Tahunan</option>
              <option value="SICK">Sakit</option>
              <option value="UNPAID_LEAVE">Cuti Tanpa Gaji</option>
              <option value="FIELD_DUTY">Dinas Luar</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={leaveForm.start_date} onChange={(event) => setLeaveForm({ ...leaveForm, start_date: event.target.value })} className={inputClass} />
              <input type="date" value={leaveForm.end_date} onChange={(event) => setLeaveForm({ ...leaveForm, end_date: event.target.value })} className={inputClass} />
            </div>
            <textarea rows={2} placeholder="Alasan..." value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} className={inputClass} />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setLeaveForm({ ...leaveForm, attachment: event.target.files?.[0] || null })}
              className="text-sm text-gray-600 dark:text-gray-300"
            />
            <button onClick={submitLeave} disabled={submitting} className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
          <div className="space-y-2">
            {leaves.map((leave) => (
              <div key={leave.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {leave.type === 'SICK' ? 'Sakit' : leave.type === 'ANNUAL_LEAVE' ? 'Cuti Tahunan' : leave.type === 'UNPAID_LEAVE' ? 'Cuti Tanpa Gaji' : 'Dinas Luar'}
                  </span>
                  <StatusBadge status={leave.status} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(leave.start_date)} s/d {formatDate(leave.end_date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'overtime' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ajukan Lembur</h3>
            <input type="date" value={overtimeForm.overtime_date} onChange={(event) => setOvertimeForm({ ...overtimeForm, overtime_date: event.target.value })} className={inputClass} />
            <div className="grid grid-cols-2 gap-3">
              <input type="time" value={overtimeForm.start_time} onChange={(event) => setOvertimeForm({ ...overtimeForm, start_time: event.target.value })} className={inputClass} />
              <input type="time" value={overtimeForm.end_time} onChange={(event) => setOvertimeForm({ ...overtimeForm, end_time: event.target.value })} className={inputClass} />
            </div>
            <textarea rows={2} placeholder="Alasan lembur..." value={overtimeForm.reason} onChange={(event) => setOvertimeForm({ ...overtimeForm, reason: event.target.value })} className={inputClass} />
            <button onClick={submitOvertime} disabled={submitting} className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
          <div className="space-y-2">
            {overtimes.map((overtime) => (
              <div key={overtime.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Lembur {formatDate(overtime.overtime_date)}</span>
                  <StatusBadge status={overtime.status} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {overtime.start_time} – {overtime.end_time} ({overtime.duration_hours} jam)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'correction' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ajukan Koreksi Absen</h3>
            <select
              value={correctionForm.correction_type}
              onChange={(event) => setCorrectionForm({ ...correctionForm, correction_type: event.target.value as 'LATE_DISPENSATION' | 'MISSING_CHECKOUT' })}
              className={inputClass}
            >
              <option value="MISSING_CHECKOUT">Lupa Absen Pulang</option>
              <option value="LATE_DISPENSATION">Dispensasi Keterlambatan</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={correctionForm.attendance_date} onChange={(event) => setCorrectionForm({ ...correctionForm, attendance_date: event.target.value })} className={inputClass} />
              <input type="time" value={correctionForm.time} onChange={(event) => setCorrectionForm({ ...correctionForm, time: event.target.value })} className={inputClass} />
            </div>
            <textarea rows={2} placeholder="Alasan koreksi..." value={correctionForm.reason} onChange={(event) => setCorrectionForm({ ...correctionForm, reason: event.target.value })} className={inputClass} />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setCorrectionForm({ ...correctionForm, attachment: event.target.files?.[0] || null })}
              className="text-sm text-gray-600 dark:text-gray-300"
            />
            <button onClick={submitCorrection} disabled={submitting} className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
          <div className="space-y-2">
            {corrections.map((correction) => (
              <div key={correction.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {correction.correction_type === 'LATE_DISPENSATION' ? 'Dispensasi Telat' : 'Lupa Absen Pulang'} · {formatDate(correction.attendance_date)}
                  </span>
                  <StatusBadge status={correction.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'loan' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Ajukan Kasbon</h3>
            <input
              type="number"
              min={0}
              placeholder="Jumlah kasbon (Rp)"
              value={loanForm.total_amount}
              onChange={(event) => setLoanForm({ ...loanForm, total_amount: event.target.value })}
              className={inputClass}
            />
            <input
              type="number"
              min={0}
              placeholder="Cicilan per bulan (Rp)"
              value={loanForm.monthly_installment}
              onChange={(event) => setLoanForm({ ...loanForm, monthly_installment: event.target.value })}
              className={inputClass}
            />
            <input type="date" value={loanForm.loan_date} onChange={(event) => setLoanForm({ ...loanForm, loan_date: event.target.value })} className={inputClass} />
            <textarea rows={2} placeholder="Alasan kasbon..." value={loanForm.reason} onChange={(event) => setLoanForm({ ...loanForm, reason: event.target.value })} className={inputClass} />
            <button onClick={submitLoan} disabled={submitting} className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50">
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
          <div className="space-y-2">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">{formatRupiah(loan.total_amount)}</span>
                  <StatusBadge status={loan.status} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Cicilan {formatRupiah(loan.monthly_installment)}/bln · Sisa {formatRupiah(loan.remaining_balance)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
