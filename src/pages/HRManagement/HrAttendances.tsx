import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import HrPageHeader from '../../components/hr/HrPageHeader';
import Modal from '../../components/hr/Modal';
import Pagination from '../../components/hr/Pagination';
import StatusBadge from '../../components/hr/StatusBadge';
import { listAttendances, updateAttendance } from '../../service/hrAdminService';
import { getAllToko, Toko } from '../../service/tokoService';
import type { Attendance } from '../../types/hr';
import { formatDateTime, formatTime } from '../../utils/hrFormat';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'LATE', label: 'Terlambat' },
  { value: 'SICK', label: 'Sakit' },
  { value: 'ANNUAL_LEAVE', label: 'Cuti Tahunan' },
  { value: 'UNPAID_LEAVE', label: 'Cuti Tanpa Gaji' },
  { value: 'FIELD_DUTY', label: 'Dinas Luar' },
  { value: 'ALPHA', label: 'Alpha' },
];

export default function HrAttendances() {
  const [rows, setRows] = useState<Attendance[]>([]);
  const [stores, setStores] = useState<Toko[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [storeFilter, setStoreFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [form, setForm] = useState({ check_in_time: '', check_out_time: '', status: '', late_minutes: '0', notes: '' });
  const [saving, setSaving] = useState(false);

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
    const res = await listAttendances({
      page,
      take: 10,
      store_id: storeFilter ? parseInt(storeFilter, 10) : undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      status: statusFilter || undefined,
      search: search || undefined,
    });
    if (res.status && res.data) {
      setRows(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error(res.message || 'Gagal memuat data absensi.');
    }
    setLoading(false);
  }

  function toLocalInput(dateValue: string | null | undefined): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function openEdit(row: Attendance) {
    setEditing(row);
    setForm({
      check_in_time: toLocalInput(row.check_in_time),
      check_out_time: toLocalInput(row.check_out_time),
      status: row.status,
      late_minutes: String(row.late_minutes),
      notes: row.notes || '',
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const res = await updateAttendance(editing.id, {
      check_in_time: form.check_in_time ? new Date(form.check_in_time).toISOString() : undefined,
      check_out_time: form.check_out_time ? new Date(form.check_out_time).toISOString() : undefined,
      status: form.status || undefined,
      late_minutes: parseInt(form.late_minutes || '0', 10),
      notes: form.notes,
    });
    setSaving(false);
    if (res.status) {
      toast.success('Data absensi berhasil diperbarui.');
      setEditing(null);
      load();
    } else {
      toast.error(res.message || 'Gagal memperbarui absensi.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white';

  return (
    <div>
      <HrPageHeader
        title="Monitoring Absensi"
        description="Pantau absensi pegawai per cabang beserta foto selfie dan jarak geofence."
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={storeFilter}
          onChange={(event) => setStoreFilter(event.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          <option value="">Semua Toko</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.nama_toko}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        />
        <span className="self-center text-sm text-gray-500">s/d</span>
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Cari pegawai..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-48"
        />
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm"
        >
          Filter
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Pegawai</th>
                <th className="px-4 py-3 text-left font-semibold">Masuk</th>
                <th className="px-4 py-3 text-left font-semibold">Pulang</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Jarak (m)</th>
                <th className="px-4 py-3 text-center font-semibold">Foto</th>
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
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    Tidak ada data absensi.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDateTime(row.attendance_date).split(',')[0]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{row.user?.nama || '-'}</div>
                      <div className="text-xs text-gray-500">{row.nama_toko}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatTime(row.check_in_time)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatTime(row.check_out_time)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={row.status} />
                      {row.late_minutes > 0 && (
                        <div className="text-xs text-amber-600 mt-0.5">+{row.late_minutes} mnt</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {row.check_in_distance_m !== null && row.check_in_distance_m !== undefined
                        ? Math.round(row.check_in_distance_m)
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.check_in_photo_url ? (
                        <button
                          onClick={() => setPhotoUrl(row.check_in_photo_url || null)}
                          className="text-blue-600 underline text-xs"
                        >
                          Lihat
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(row)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                      >
                        Koreksi
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal open={photoUrl !== null} title="Foto Absensi" onClose={() => setPhotoUrl(null)}>
        {photoUrl && <img src={photoUrl} alt="Foto absensi" className="rounded-xl max-h-[60vh] mx-auto" />}
      </Modal>

      <Modal open={editing !== null} title="Koreksi Absensi Manual" onClose={() => setEditing(null)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Masuk</label>
            <input
              type="datetime-local"
              value={form.check_in_time}
              onChange={(event) => setForm({ ...form, check_in_time: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Pulang</label>
            <input
              type="datetime-local"
              value={form.check_out_time}
              onChange={(event) => setForm({ ...form, check_out_time: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Menit Keterlambatan</label>
            <input
              type="number"
              min={0}
              value={form.late_minutes}
              onChange={(event) => setForm({ ...form, late_minutes: event.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
