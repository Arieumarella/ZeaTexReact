import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import HrPageHeader from '../../components/hr/HrPageHeader';
import StoreMapPicker from '../../components/hr/StoreMapPicker';
import { getStoreConfigs, updateStoreConfig, listHolidays, createHoliday, deleteHoliday } from '../../service/hrAdminService';
import type { Holiday, HrStoreConfig } from '../../types/hr';
import { formatDate } from '../../utils/hrFormat';

const WORK_DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
  { value: 7, label: 'Minggu' },
];

interface FormState {
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
  late_penalty_per_occurrence: number;
  missing_checkout_penalty: number;
  work_days: string;
}

export default function HrStoreLocations() {
  const [configs, setConfigs] = useState<HrStoreConfig[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  const [form, setForm] = useState<FormState>({
    latitude: null,
    longitude: null,
    radius_meters: 100,
    work_start_time: '08:00',
    work_end_time: '17:00',
    grace_period_minutes: 15,
    late_penalty_per_occurrence: 0,
    missing_checkout_penalty: 0,
    work_days: '1,2,3,4,5,6',
  });

  useEffect(() => {
    loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedStoreId === null) {
      setHolidays([]);
      return;
    }
    listHolidays(selectedStoreId).then((res) => {
      if (res.status && res.data) setHolidays(res.data);
    });
  }, [selectedStoreId]);

  async function loadConfigs() {
    setLoading(true);
    const res = await getStoreConfigs();
    if (res.status && res.data) {
      setConfigs(res.data);
      if (res.data.length > 0 && selectedStoreId === null) {
        selectStore(res.data[0]);
      }
    } else {
      toast.error(res.message || 'Gagal memuat konfigurasi toko.');
    }
    setLoading(false);
  }

  function selectStore(config: HrStoreConfig) {
    setSelectedStoreId(config.store_id);
    setForm({
      latitude: config.latitude,
      longitude: config.longitude,
      radius_meters: config.radius_meters,
      work_start_time: config.work_start_time,
      work_end_time: config.work_end_time,
      grace_period_minutes: config.grace_period_minutes,
      late_penalty_per_occurrence: config.late_penalty_per_occurrence,
      missing_checkout_penalty: config.missing_checkout_penalty,
      work_days: config.work_days,
    });
  }

  function toggleWorkDay(value: number) {
    const current = form.work_days
      .split(',')
      .map((day) => parseInt(day, 10))
      .filter(Boolean);
    const next = current.includes(value)
      ? current.filter((day) => day !== value)
      : [...current, value];
    setForm({ ...form, work_days: next.sort((a, b) => a - b).join(',') });
  }

  async function handleSave() {
    if (selectedStoreId === null) return;
    if (!form.work_days) {
      toast.error('Pilih minimal satu hari kerja.');
      return;
    }
    if (form.work_end_time <= form.work_start_time) {
      toast.error('Jam pulang harus setelah jam masuk.');
      return;
    }
    setSaving(true);
    const res = await updateStoreConfig(selectedStoreId, form);
    setSaving(false);
    if (res.status) {
      toast.success('Konfigurasi toko berhasil disimpan.');
      loadConfigs();
    } else {
      toast.error(res.message || 'Gagal menyimpan konfigurasi toko.');
    }
  }

  async function handleAddHoliday() {
    if (selectedStoreId === null) return;
    if (!holidayDate || !holidayName.trim()) {
      toast.error('Tanggal dan nama hari libur wajib diisi.');
      return;
    }
    const res = await createHoliday({
      store_id: selectedStoreId,
      holiday_date: holidayDate,
      name: holidayName.trim(),
    });
    if (res.status) {
      toast.success('Hari libur berhasil ditambahkan.');
      setHolidayDate('');
      setHolidayName('');
      const reload = await listHolidays(selectedStoreId);
      if (reload.status && reload.data) setHolidays(reload.data);
    } else {
      toast.error(res.message || 'Gagal menambah hari libur.');
    }
  }

  async function handleDeleteHoliday(holiday: Holiday) {
    const confirm = await Swal.fire({
      title: 'Hapus hari libur?',
      text: `"${holiday.name}" (${holiday.holiday_date}) akan dihapus.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });
    if (!confirm.isConfirmed) return;
    const res = await deleteHoliday(holiday.id);
    if (res.status) {
      toast.success('Hari libur berhasil dihapus.');
      setHolidays((prev) => prev.filter((item) => item.id !== holiday.id));
    } else {
      toast.error(res.message || 'Gagal menghapus hari libur.');
    }
  }

  if (loading) {
    return (
      <div>
        <HrPageHeader title="Lokasi & Jam Kerja Toko" />
        <div className="text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div>
      <HrPageHeader
        title="Lokasi & Jam Kerja Toko"
        description="Atur titik lokasi (geofence), radius, jam kerja, denda, dan hari libur per cabang."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {configs.map((config) => (
            <button
              key={config.store_id}
              onClick={() => selectStore(config)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedStoreId === config.store_id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {config.toko?.nama_toko || `Toko #${config.store_id}`}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {config.latitude !== null && config.longitude !== null
                  ? 'Lokasi sudah diatur'
                  : 'Lokasi belum diatur'}
                {' · '}Radius {config.radius_meters} m
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Peta & Radius</h3>
            <StoreMapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radius={form.radius_meters}
              onLocationChange={(latitude, longitude) => setForm({ ...form, latitude, longitude })}
              onRadiusChange={(radius_meters) => setForm({ ...form, radius_meters })}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Jam Kerja & Denda</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={form.work_start_time}
                  onChange={(event) => setForm({ ...form, work_start_time: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jam Pulang
                </label>
                <input
                  type="time"
                  value={form.work_end_time}
                  onChange={(event) => setForm({ ...form, work_end_time: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Toleransi Telat (menit)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.grace_period_minutes}
                  onChange={(event) =>
                    setForm({ ...form, grace_period_minutes: parseInt(event.target.value || '0', 10) })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Denda Telat / Kejadian (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.late_penalty_per_occurrence}
                  onChange={(event) =>
                    setForm({ ...form, late_penalty_per_occurrence: Number(event.target.value || 0) })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Denda Lupa Absen Pulang (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.missing_checkout_penalty}
                  onChange={(event) =>
                    setForm({ ...form, missing_checkout_penalty: Number(event.target.value || 0) })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hari Kerja
              </label>
              <div className="flex flex-wrap gap-2">
                {WORK_DAYS.map((day) => {
                  const active = form.work_days
                    .split(',')
                    .map((value) => parseInt(value, 10))
                    .includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWorkDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Hari Libur</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              <input
                type="date"
                value={holidayDate}
                onChange={(event) => setHolidayDate(event.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Nama hari libur"
                value={holidayName}
                onChange={(event) => setHolidayName(event.target.value)}
                className="flex-1 min-w-[180px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={handleAddHoliday}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Tambah
              </button>
            </div>
            {holidays.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada hari libur untuk toko ini.</p>
            ) : (
              <div className="space-y-2">
                {holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{holiday.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{formatDate(holiday.holiday_date)}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(holiday)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
