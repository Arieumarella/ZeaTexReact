import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyToday } from '../../service/hrEmployeeService';
import { clearAuthStorage } from '../../utils/authStorage';
import type { MyToday } from '../../types/hr';
import AttendanceTab from './AttendanceTab';
import RequestsTab from './RequestsTab';
import HistoryTab from './HistoryTab';
import PayslipsTab from './PayslipsTab';

type TabKey = 'absen' | 'pengajuan' | 'riwayat' | 'slip';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'absen', label: 'Absen' },
  { key: 'pengajuan', label: 'Pengajuan' },
  { key: 'riwayat', label: 'Riwayat' },
  { key: 'slip', label: 'Slip Gaji' },
];

export default function AttendanceApp() {
  const [tab, setTab] = useState<TabKey>('absen');
  const [data, setData] = useState<MyToday | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverOffset, setServerOffset] = useState(0);
  const [nowTick, setNowTick] = useState(Date.now());

  const load = useCallback(async () => {
    const res = await getMyToday();
    if (res.status && res.data) {
      setData(res.data);
      setLoadError('');
      const offset = Date.parse(res.data.server_time) - Date.now();
      if (!Number.isNaN(offset)) setServerOffset(offset);
    } else {
      setLoadError(res.message || 'Gagal memuat data absensi.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const serverNow = new Date(nowTick + serverOffset);
  const nama = localStorage.getItem('auth_nama') || 'Pegawai';

  function handleLogout() {
    clearAuthStorage();
    window.location.href = '/signin';
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="sticky top-0 z-20 bg-blue-700 text-white shadow">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-bold">{nama}</div>
            <div className="text-xs opacity-80">{data?.hr_store?.nama_toko || 'Zea Textile'}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/home"
              className="px-3 py-1.5 rounded-lg bg-white/15 text-xs font-semibold hover:bg-white/25"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-white/15 text-xs font-semibold hover:bg-white/25"
            >
              Keluar
            </button>
          </div>
        </div>
        <nav className="max-w-lg mx-auto px-2 pb-2 flex gap-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold ${
                tab === item.key ? 'bg-white text-blue-700' : 'text-white/90 hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24">
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-700 dark:text-red-300">
            {loadError}
            <button onClick={load} className="ml-2 underline font-semibold">
              Muat ulang
            </button>
          </div>
        ) : (
          <>
            {tab === 'absen' && <AttendanceTab data={data} serverNow={serverNow} onRefresh={load} />}
            {tab === 'pengajuan' && <RequestsTab />}
            {tab === 'riwayat' && <HistoryTab />}
            {tab === 'slip' && <PayslipsTab />}
          </>
        )}
      </main>

      <div className="text-center text-xs text-gray-400 pb-4">
        Absensi membutuhkan lokasi & kamera. Gunakan HTTPS di produksi.
      </div>
    </div>
  );
}
