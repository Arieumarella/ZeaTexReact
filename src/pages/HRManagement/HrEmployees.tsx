import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import HrPageHeader from '../../components/hr/HrPageHeader';
import Modal from '../../components/hr/Modal';
import Pagination from '../../components/hr/Pagination';
import StatusBadge from '../../components/hr/StatusBadge';
import { listEmployees, updateEmployee } from '../../service/hrAdminService';
import { getAllToko, Toko } from '../../service/tokoService';
import type { EmployeeProfile } from '../../types/hr';
import { formatRupiah } from '../../utils/hrFormat';

interface FormState {
  employee_code: string;
  nik: string;
  position: string;
  store_id: number;
  base_salary: string;
  fixed_meal_allowance: string;
  fixed_transport_allowance: string;
  overtime_rate_per_hour: string;
  bank_account: string;
  bank_name: string;
  annual_leave_quota: string;
  join_date: string;
  allow_any_store_checkin: boolean;
  is_active: boolean;
}

const emptyForm: FormState = {
  employee_code: '',
  nik: '',
  position: '',
  store_id: 1,
  base_salary: '0',
  fixed_meal_allowance: '0',
  fixed_transport_allowance: '0',
  overtime_rate_per_hour: '0',
  bank_account: '',
  bank_name: '',
  annual_leave_quota: '12',
  join_date: '',
  allow_any_store_checkin: false,
  is_active: true,
};

export default function HrEmployees() {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [stores, setStores] = useState<Toko[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmployeeProfile | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllToko().then((res) => {
      if (res.status && res.data) setStores(res.data);
    });
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, storeFilter, activeFilter]);

  async function load() {
    setLoading(true);
    const res = await listEmployees({
      page,
      take: 10,
      search: search || undefined,
      store_id: storeFilter ? parseInt(storeFilter, 10) : undefined,
      is_active: activeFilter === '' ? undefined : activeFilter === 'true',
    });
    if (res.status && res.data) {
      setEmployees(res.data);
      setTotalPages(res.totalPages || 1);
    } else {
      toast.error(res.message || 'Gagal memuat data pegawai.');
    }
    setLoading(false);
  }

  function openEdit(employee: EmployeeProfile) {
    setEditing(employee);
    setForm({
      employee_code: employee.employee_code || '',
      nik: employee.nik || '',
      position: employee.position || '',
      store_id: employee.store_id,
      base_salary: String(employee.base_salary),
      fixed_meal_allowance: String(employee.fixed_meal_allowance),
      fixed_transport_allowance: String(employee.fixed_transport_allowance),
      overtime_rate_per_hour: String(employee.overtime_rate_per_hour),
      bank_account: employee.bank_account || '',
      bank_name: employee.bank_name || '',
      annual_leave_quota: String(employee.annual_leave_quota),
      join_date: employee.join_date ? employee.join_date.slice(0, 10) : '',
      allow_any_store_checkin: employee.allow_any_store_checkin,
      is_active: employee.is_active,
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const res = await updateEmployee(editing.user_id, {
      employee_code: form.employee_code || null,
      nik: form.nik || null,
      position: form.position || null,
      store_id: form.store_id,
      base_salary: Number(form.base_salary || 0),
      fixed_meal_allowance: Number(form.fixed_meal_allowance || 0),
      fixed_transport_allowance: Number(form.fixed_transport_allowance || 0),
      overtime_rate_per_hour: Number(form.overtime_rate_per_hour || 0),
      bank_account: form.bank_account || null,
      bank_name: form.bank_name || null,
      annual_leave_quota: Number(form.annual_leave_quota || 0),
      join_date: form.join_date || null,
      allow_any_store_checkin: form.allow_any_store_checkin,
      is_active: form.is_active,
    });
    setSaving(false);
    if (res.status) {
      toast.success('Data pegawai berhasil disimpan.');
      setEditing(null);
      load();
    } else {
      toast.error(res.message || 'Gagal menyimpan data pegawai.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white';

  return (
    <div>
      <HrPageHeader
        title="Master Karyawan & Gaji"
        description="Kelola profil pegawai: gaji, tunjangan, rekening, dan kuota cuti."
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama / username..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setPage(1);
              load();
            }
          }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm w-64"
        />
        <select
          value={storeFilter}
          onChange={(event) => {
            setStoreFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          <option value="">Semua Toko</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.nama_toko}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
        >
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm"
        >
          Cari
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Pegawai</th>
                <th className="px-4 py-3 text-left font-semibold">Kode / NIK</th>
                <th className="px-4 py-3 text-left font-semibold">Toko</th>
                <th className="px-4 py-3 text-right font-semibold">Gaji Pokok</th>
                <th className="px-4 py-3 text-center font-semibold">Kuota Cuti</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Tidak ada data pegawai.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {employee.user?.nama || '-'}
                      </div>
                      <div className="text-xs text-gray-500">{employee.position || employee.user?.jabatan || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {employee.employee_code || '-'}
                      {employee.nik ? ` / ${employee.nik}` : ''}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{employee.nama_toko || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatRupiah(employee.base_salary)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {employee.annual_leave_quota}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={employee.is_active ? 'APPROVED' : 'REJECTED'} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(employee)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                      >
                        Edit
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

      <Modal open={editing !== null} title={`Edit Pegawai — ${editing?.user?.nama || ''}`} onClose={() => setEditing(null)} wide>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Pegawai</label>
            <input className={inputClass} value={form.employee_code} onChange={(event) => setForm({ ...form, employee_code: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIK</label>
            <input className={inputClass} value={form.nik} onChange={(event) => setForm({ ...form, nik: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
            <input className={inputClass} value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toko</label>
            <select
              className={inputClass}
              value={form.store_id}
              onChange={(event) => setForm({ ...form, store_id: parseInt(event.target.value, 10) })}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.nama_toko}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaji Pokok (Rp)</label>
            <input type="number" min={0} className={inputClass} value={form.base_salary} onChange={(event) => setForm({ ...form, base_salary: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uang Makan / Hari (Rp)</label>
            <input type="number" min={0} className={inputClass} value={form.fixed_meal_allowance} onChange={(event) => setForm({ ...form, fixed_meal_allowance: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uang Transport / Hari (Rp)</label>
            <input type="number" min={0} className={inputClass} value={form.fixed_transport_allowance} onChange={(event) => setForm({ ...form, fixed_transport_allowance: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tarif Lembur / Jam (Rp)</label>
            <input type="number" min={0} className={inputClass} value={form.overtime_rate_per_hour} onChange={(event) => setForm({ ...form, overtime_rate_per_hour: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kuota Cuti Tahunan</label>
            <input type="number" min={0} className={inputClass} value={form.annual_leave_quota} onChange={(event) => setForm({ ...form, annual_leave_quota: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Bergabung</label>
            <input type="date" className={inputClass} value={form.join_date} onChange={(event) => setForm({ ...form, join_date: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bank</label>
            <input className={inputClass} value={form.bank_name} onChange={(event) => setForm({ ...form, bank_name: event.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Rekening</label>
            <input className={inputClass} value={form.bank_account} onChange={(event) => setForm({ ...form, bank_account: event.target.value })} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.allow_any_store_checkin}
                onChange={(event) => setForm({ ...form, allow_any_store_checkin: event.target.checked })}
              />
              Boleh absen di toko mana pun (roamer)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
              />
              Aktif
            </label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
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
      </Modal>
    </div>
  );
}
