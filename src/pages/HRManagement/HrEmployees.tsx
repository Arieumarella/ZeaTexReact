import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import HrPageHeader from '../../components/hr/HrPageHeader';
import Modal from '../../components/hr/Modal';
import Pagination from '../../components/hr/Pagination';
import StatusBadge from '../../components/hr/StatusBadge';
import {
  deleteEmployee,
  getSalaryHistory,
  listAvailableUsers,
  listEmployees,
  listShifts,
  updateEmployee,
} from '../../service/hrAdminService';
import { getAllToko, Toko } from '../../service/tokoService';
import type { AvailableUser, EmployeeProfile, HrShift, SalaryHistoryRow } from '../../types/hr';
import { formatRupiah } from '../../utils/hrFormat';

interface FormState {
  employee_code: string;
  nik: string;
  position: string;
  store_id: number;
  shift_id: string;
  base_salary: string;
  fixed_meal_allowance: string;
  fixed_transport_allowance: string;
  overtime_rate_per_hour: string;
  bank_account: string;
  bank_name: string;
  annual_leave_quota: string;
  annual_leave_entitlement: string;
  join_date: string;
  resign_date: string;
  allow_any_store_checkin: boolean;
  is_active: boolean;
}

const emptyForm: FormState = {
  employee_code: '',
  nik: '',
  position: '',
  store_id: 1,
  shift_id: '',
  base_salary: '0',
  fixed_meal_allowance: '0',
  fixed_transport_allowance: '0',
  overtime_rate_per_hour: '0',
  bank_account: '',
  bank_name: '',
  annual_leave_quota: '12',
  annual_leave_entitlement: '12',
  join_date: '',
  resign_date: '',
  allow_any_store_checkin: false,
  is_active: true,
};

function buildPayload(form: FormState) {
  return {
    employee_code: form.employee_code || null,
    nik: form.nik || null,
    position: form.position || null,
    store_id: form.store_id,
    shift_id: form.shift_id ? Number(form.shift_id) : null,
    base_salary: Number(form.base_salary || 0),
    fixed_meal_allowance: Number(form.fixed_meal_allowance || 0),
    fixed_transport_allowance: Number(form.fixed_transport_allowance || 0),
    overtime_rate_per_hour: Number(form.overtime_rate_per_hour || 0),
    bank_account: form.bank_account || null,
    bank_name: form.bank_name || null,
    annual_leave_quota: Number(form.annual_leave_quota || 0),
    annual_leave_entitlement: Number(form.annual_leave_entitlement || 0),
    join_date: form.join_date || null,
    resign_date: form.resign_date || null,
    allow_any_store_checkin: form.allow_any_store_checkin,
    is_active: form.is_active,
  };
}

interface EmployeeFieldsProps {
  form: FormState;
  stores: Toko[];
  shifts: HrShift[];
  inputClass: string;
  onChange: (form: FormState) => void;
}

function EmployeeFields({ form, stores, shifts, inputClass, onChange }: EmployeeFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Pegawai</label>
        <input className={inputClass} value={form.employee_code} onChange={(event) => onChange({ ...form, employee_code: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIK</label>
        <input className={inputClass} value={form.nik} onChange={(event) => onChange({ ...form, nik: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jabatan</label>
        <input className={inputClass} value={form.position} onChange={(event) => onChange({ ...form, position: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toko</label>
        <select
          className={inputClass}
          value={form.store_id}
          onChange={(event) => onChange({ ...form, store_id: parseInt(event.target.value, 10) })}
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.nama_toko}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shift Kerja</label>
        <select
          className={inputClass}
          value={form.shift_id}
          onChange={(event) => onChange({ ...form, shift_id: event.target.value })}
        >
          <option value="">Jam Kerja Toko (default)</option>
          {shifts
            .filter((shift) => shift.store_id === form.store_id)
            .map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({shift.work_start_time}-{shift.work_end_time})
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaji Pokok (Rp)</label>
        <input type="number" min={0} className={inputClass} value={form.base_salary} onChange={(event) => onChange({ ...form, base_salary: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uang Makan / Hari (Rp)</label>
        <input type="number" min={0} className={inputClass} value={form.fixed_meal_allowance} onChange={(event) => onChange({ ...form, fixed_meal_allowance: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uang Transport / Hari (Rp)</label>
        <input type="number" min={0} className={inputClass} value={form.fixed_transport_allowance} onChange={(event) => onChange({ ...form, fixed_transport_allowance: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tarif Lembur / Jam (Rp)</label>
        <input type="number" min={0} className={inputClass} value={form.overtime_rate_per_hour} onChange={(event) => onChange({ ...form, overtime_rate_per_hour: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jatah Cuti / Tahun</label>
        <input type="number" min={0} className={inputClass} value={form.annual_leave_entitlement} onChange={(event) => onChange({ ...form, annual_leave_entitlement: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sisa Cuti Saat Ini</label>
        <input type="number" min={0} className={inputClass} value={form.annual_leave_quota} onChange={(event) => onChange({ ...form, annual_leave_quota: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Bergabung</label>
        <input type="date" className={inputClass} value={form.join_date} onChange={(event) => onChange({ ...form, join_date: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Berhenti</label>
        <input type="date" className={inputClass} value={form.resign_date} onChange={(event) => onChange({ ...form, resign_date: event.target.value })} />
        <p className="text-xs text-gray-500 mt-1">Mengisi tanggal berhenti otomatis menonaktifkan pegawai.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Bank</label>
        <input className={inputClass} value={form.bank_name} onChange={(event) => onChange({ ...form, bank_name: event.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No. Rekening</label>
        <input className={inputClass} value={form.bank_account} onChange={(event) => onChange({ ...form, bank_account: event.target.value })} />
      </div>
      <div className="sm:col-span-2 flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.allow_any_store_checkin}
            onChange={(event) => onChange({ ...form, allow_any_store_checkin: event.target.checked })}
          />
          Boleh absen di toko mana pun (roamer)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => onChange({ ...form, is_active: event.target.checked })}
          />
          Aktif
        </label>
      </div>
    </div>
  );
}

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

  const [addOpen, setAddOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [availableSearch, setAvailableSearch] = useState('');
  const [availableLoading, setAvailableLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [addSaving, setAddSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EmployeeProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const [shifts, setShifts] = useState<HrShift[]>([]);
  const [historyTarget, setHistoryTarget] = useState<EmployeeProfile | null>(null);
  const [historyRows, setHistoryRows] = useState<SalaryHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    getAllToko().then((res) => {
      if (res.status && res.data) setStores(res.data);
    });
    listShifts().then((res) => {
      if (res.status && res.data) setShifts(res.data);
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

  async function loadAvailable(searchValue: string) {
    setAvailableLoading(true);
    const res = await listAvailableUsers({ take: 20, search: searchValue || undefined });
    if (res.status && res.data) {
      setAvailableUsers(res.data);
    } else {
      setAvailableUsers([]);
      if (res.message) toast.error(res.message);
    }
    setAvailableLoading(false);
  }

  async function openHistory(employee: EmployeeProfile) {
    setHistoryTarget(employee);
    setHistoryRows([]);
    setHistoryLoading(true);
    const res = await getSalaryHistory(employee.user_id);
    if (res.status && res.data) {
      setHistoryRows(res.data);
    } else {
      toast.error(res.message || 'Gagal memuat riwayat gaji.');
    }
    setHistoryLoading(false);
  }

  function openAdd() {
    setAddOpen(true);
    setSelectedUser(null);
    setAddForm({ ...emptyForm });
    setAvailableSearch('');
    loadAvailable('');
  }

  function selectUser(user: AvailableUser) {
    setSelectedUser(user);
    setAddForm({
      ...emptyForm,
      store_id: user.id_toko || 1,
      position: user.jabatan || '',
    });
  }

  async function handleAdd() {
    if (!selectedUser) {
      toast.error('Pilih user terlebih dahulu.');
      return;
    }
    setAddSaving(true);
    const res = await updateEmployee(selectedUser.id, buildPayload(addForm));
    setAddSaving(false);
    if (res.status) {
      toast.success('Pegawai berhasil ditambahkan.');
      setAddOpen(false);
      setPage(1);
      load();
    } else {
      toast.error(res.message || 'Gagal menambahkan pegawai.');
    }
  }

  function openEdit(employee: EmployeeProfile) {
    setEditing(employee);
    setForm({
      employee_code: employee.employee_code || '',
      nik: employee.nik || '',
      position: employee.position || '',
      store_id: employee.store_id,
      shift_id: employee.shift_id ? String(employee.shift_id) : '',
      base_salary: String(employee.base_salary),
      fixed_meal_allowance: String(employee.fixed_meal_allowance),
      fixed_transport_allowance: String(employee.fixed_transport_allowance),
      overtime_rate_per_hour: String(employee.overtime_rate_per_hour),
      bank_account: employee.bank_account || '',
      bank_name: employee.bank_name || '',
      annual_leave_quota: String(employee.annual_leave_quota),
      annual_leave_entitlement: String(employee.annual_leave_entitlement ?? employee.annual_leave_quota),
      join_date: employee.join_date ? employee.join_date.slice(0, 10) : '',
      resign_date: employee.resign_date ? employee.resign_date.slice(0, 10) : '',
      allow_any_store_checkin: employee.allow_any_store_checkin,
      is_active: employee.is_active,
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const res = await updateEmployee(editing.user_id, buildPayload(form));
    setSaving(false);
    if (res.status) {
      toast.success('Data pegawai berhasil disimpan.');
      setEditing(null);
      load();
    } else {
      toast.error(res.message || 'Gagal menyimpan data pegawai.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await deleteEmployee(deleteTarget.user_id);
    setDeleting(false);
    if (res.status) {
      toast.success(res.message || 'Pegawai berhasil dihapus.');
      setDeleteTarget(null);
      load();
    } else {
      toast.error(res.message || 'Gagal menghapus pegawai.');
    }
  }

  async function handleActivate(employee: EmployeeProfile) {
    setActivatingId(employee.user_id);
    const res = await updateEmployee(employee.user_id, { is_active: true });
    setActivatingId(null);
    if (res.status) {
      toast.success('Pegawai berhasil diaktifkan kembali.');
      load();
      if (addOpen) loadAvailable(availableSearch);
    } else {
      toast.error(res.message || 'Gagal mengaktifkan pegawai.');
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
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-sm"
        >
          + Tambah Karyawan
        </button>
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
                <th className="px-4 py-3 text-center font-semibold">Sisa / Jatah Cuti</th>
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
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {employee.nama_toko || '-'}
                      {employee.shift?.name ? ` · ${employee.shift.name}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                      {formatRupiah(employee.base_salary)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                      {employee.annual_leave_quota} / {employee.annual_leave_entitlement ?? employee.annual_leave_quota}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={employee.is_active ? 'APPROVED' : 'REJECTED'} />
                      {employee.resign_date && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Berhenti {employee.resign_date.slice(0, 10)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {!employee.is_active && (
                          <button
                            onClick={() => handleActivate(employee)}
                            disabled={activatingId === employee.user_id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {activatingId === employee.user_id ? 'Proses...' : 'Aktifkan'}
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(employee)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openHistory(employee)}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100"
                        >
                          Riwayat
                        </button>
                        <button
                          onClick={() => setDeleteTarget(employee)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
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
        <EmployeeFields form={form} stores={stores} shifts={shifts} inputClass={inputClass} onChange={setForm} />
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

      <Modal open={addOpen} title="Tambah Karyawan" onClose={() => setAddOpen(false)} wide>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pilih User (belum terdaftar sebagai pegawai)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari nama / username..."
              value={availableSearch}
              onChange={(event) => setAvailableSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') loadAvailable(availableSearch);
              }}
              className={inputClass}
            />
            <button
              onClick={() => loadAvailable(availableSearch)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              Cari
            </button>
          </div>

          <div className="mt-2 rounded-lg border border-gray-200 dark:border-gray-700 max-h-52 overflow-y-auto">
            {availableLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">Memuat user...</div>
            ) : availableUsers.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Tidak ada user yang bisa ditambahkan.
              </div>
            ) : (
              availableUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.nama || user.username || `User #${user.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.username || '-'} · {user.role || '-'} · {user.nama_toko || '-'}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {selectedUser && (
            <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              Dipilih: <span className="font-semibold">{selectedUser.nama || selectedUser.username}</span>
            </div>
          )}
        </div>

        {selectedUser && (
          <EmployeeFields form={addForm} stores={stores} shifts={shifts} inputClass={inputClass} onChange={setAddForm} />
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setAddOpen(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleAdd}
            disabled={addSaving || !selectedUser}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {addSaving ? 'Menyimpan...' : 'Simpan Pegawai'}
          </button>
        </div>
      </Modal>

      <Modal
        open={historyTarget !== null}
        title={`Riwayat Gaji & Jabatan — ${historyTarget?.user?.nama || ''}`}
        onClose={() => setHistoryTarget(null)}
        wide
      >
        {historyLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">Memuat riwayat...</p>
        ) : historyRows.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Jabatan</th>
                  <th className="px-3 py-2 text-right">Gaji Pokok</th>
                  <th className="px-3 py-2 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {historyRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {row.effective_date ? row.effective_date.slice(0, 10) : '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{row.position || '-'}</td>
                    <td className="px-3 py-2 text-right text-gray-900 dark:text-white">{formatRupiah(row.base_salary)}</td>
                    <td className="px-3 py-2 text-gray-500">{row.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Hapus Pegawai"
        onClose={() => setDeleteTarget(null)}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Hapus pegawai{' '}
          <span className="font-semibold">{deleteTarget?.user?.nama || deleteTarget?.user?.username || ''}</span>{' '}
          dari daftar pegawai?
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Jika pegawai memiliki riwayat HR (absensi, payroll, pengajuan, atau kasbon), statusnya akan
          dinonaktifkan dan seluruh riwayat tetap tersimpan. Akun login POS tidak ikut dihapus.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Memproses...' : 'Hapus'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
