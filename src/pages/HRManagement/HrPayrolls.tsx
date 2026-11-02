import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import HrPageHeader from '../../components/hr/HrPageHeader';
import Modal from '../../components/hr/Modal';
import Pagination from '../../components/hr/Pagination';
import StatusBadge from '../../components/hr/StatusBadge';
import { deletePayroll, generatePayroll, listPayrolls } from '../../service/hrAdminService';
import { getAllToko, Toko } from '../../service/tokoService';
import type { Payroll } from '../../types/hr';
import { formatDate, formatRupiah, todayString } from '../../utils/hrFormat';

function defaultPeriodDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const toDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);
  return { start: toDate(start), end: toDate(end), label: `Payroll ${monthLabel}` };
}

export default function HrPayrolls() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [stores, setStores] = useState<Toko[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ store_id: '', period_name: '', cutoff_start_date: '', cutoff_end_date: '' });

  useEffect(() => {
    getAllToko().then((res) => {
      if (res.status && res.data) setStores(res.data);
    });
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function load() {
    setLoading(true);
    const res = await listPayrolls({ page, take: 10 });
    if (res.status && res.data) {
      setPayrolls(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error(res.message || 'Gagal memuat daftar payroll.');
    }
    setLoading(false);
  }

  function openGenerate() {
    const defaults = defaultPeriodDates();
    setForm({
      store_id: '',
      period_name: defaults.label,
      cutoff_start_date: defaults.start,
      cutoff_end_date: defaults.end,
    });
    setModalOpen(true);
  }

  async function handleGenerate() {
    if (!form.period_name.trim() || !form.cutoff_start_date || !form.cutoff_end_date) {
      toast.error('Lengkapi periode payroll terlebih dahulu.');
      return;
    }
    if (form.cutoff_end_date < form.cutoff_start_date) {
      toast.error('Tanggal akhir periode tidak boleh sebelum tanggal awal.');
      return;
    }
    setGenerating(true);
    const res = await generatePayroll({
      store_id: form.store_id ? parseInt(form.store_id, 10) : null,
      period_name: form.period_name.trim(),
      cutoff_start_date: form.cutoff_start_date,
      cutoff_end_date: form.cutoff_end_date,
    });
    setGenerating(false);
    if (res.status && res.data) {
      toast.success(`Payroll draft berhasil dibuat untuk ${res.data.total_employees} pegawai.`);
      setModalOpen(false);
      load();
    } else if (res.blocked && res.details) {
      Swal.fire({
        title: 'Masih ada pengajuan belum diproses',
        html: `
          <div style="text-align:left">
            <p>Cuti/Izin: <b>${res.details.leave}</b></p>
            <p>Lembur: <b>${res.details.overtime}</b></p>
            <p>Koreksi absen: <b>${res.details.correction}</b></p>
            <p>Kasbon: <b>${res.details.loan}</b></p>
            <p style="margin-top:8px">Selesaikan dulu di Pusat Approval, lalu ulangi generate.</p>
          </div>`,
        icon: 'warning',
      });
    } else {
      toast.error(res.message || 'Gagal membuat payroll.');
    }
  }

  async function handleDelete(payroll: Payroll) {
    const confirm = await Swal.fire({
      title: 'Hapus payroll draft?',
      text: `"${payroll.period_name}" akan dihapus beserta slip gajinya.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;
    const res = await deletePayroll(payroll.id);
    if (res.status) {
      toast.success('Payroll draft berhasil dihapus.');
      load();
    } else {
      toast.error(res.message || 'Gagal menghapus payroll.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white';

  return (
    <div>
      <HrPageHeader
        title="Payroll"
        description="Generate dan kelola payroll bulanan per cabang atau seluruh toko."
      >
        <button
          onClick={openGenerate}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          + Generate Payroll
        </button>
      </HrPageHeader>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Periode</th>
                <th className="px-4 py-3 text-left font-semibold">Cakupan</th>
                <th className="px-4 py-3 text-center font-semibold">Pegawai</th>
                <th className="px-4 py-3 text-right font-semibold">Bruto</th>
                <th className="px-4 py-3 text-right font-semibold">Potongan</th>
                <th className="px-4 py-3 text-right font-semibold">Bersih</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Belum ada payroll. Klik "Generate Payroll" untuk membuat.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{payroll.period_name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(payroll.cutoff_start || payroll.cutoff_start_date)} s/d{' '}
                        {formatDate(payroll.cutoff_end || payroll.cutoff_end_date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{payroll.nama_toko || 'Semua Toko'}</td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{payroll.total_employees}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{formatRupiah(payroll.total_gross)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatRupiah(payroll.total_deduction)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatRupiah(payroll.total_net)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={payroll.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/hr-management/payrolls/${payroll.id}`}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 inline-block"
                      >
                        Detail
                      </Link>
                      {payroll.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(payroll)}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs font-semibold hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={modalOpen} title="Generate Payroll" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cakupan</label>
            <select
              value={form.store_id}
              onChange={(event) => setForm({ ...form, store_id: event.target.value })}
              className={inputClass}
            >
              <option value="">Semua Toko</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.nama_toko}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Periode</label>
            <input
              value={form.period_name}
              onChange={(event) => setForm({ ...form, period_name: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={form.cutoff_start_date}
                onChange={(event) => setForm({ ...form, cutoff_start_date: event.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={form.cutoff_end_date}
                onChange={(event) => setForm({ ...form, cutoff_end_date: event.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Tanggal default: {todayString()} · Payroll akan diblokir jika masih ada pengajuan PENDING pada periode ini.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Batal
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Memproses...' : 'Generate'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
