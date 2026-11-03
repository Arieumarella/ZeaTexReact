import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-toastify';
import HrPageHeader from '../../components/hr/HrPageHeader';
import { getHrDashboard } from '../../service/hrAdminService';
import type { HrDashboardData } from '../../types/hr';

interface CardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  to?: string;
}

function StatCard({ label, value, sub, color = 'blue', to }: CardProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  };

  const content = (
    <div className={`rounded-2xl p-4 ${colors[color]}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-80">{sub}</div>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block hover:opacity-90">
        {content}
      </Link>
    );
  }
  return content;
}

export default function HrDashboard() {
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getHrDashboard();
    if (res.status && res.data) {
      setData(res.data);
    } else {
      toast.error(res.message || 'Gagal memuat ringkasan HR.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <HrPageHeader
        title="Dashboard HR"
        description="Ringkasan absensi, pengajuan, dan payroll hari ini."
      >
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </HrPageHeader>

      {!data ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Absensi Hari Ini ({data.today})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard label="Pegawai Aktif" value={data.active_employees} sub={`Total ${data.total_employees}`} color="blue" to="/hr-management/employees" />
              <StatCard label="Hadir" value={data.present_today} color="green" to="/hr-management/attendances" />
              <StatCard label="Terlambat" value={data.late_today} color="amber" to="/hr-management/attendances" />
              <StatCard label="Cuti / Izin" value={data.on_leave_today} color="purple" to="/hr-management/approvals" />
              <StatCard label="Alpha" value={data.alpha_today} color="red" to="/hr-management/attendances" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Pengajuan Menunggu Approval
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard label="Total Pending" value={data.pending.total} color="red" to="/hr-management/approvals" />
              <StatCard label="Cuti" value={data.pending.leave} color="blue" to="/hr-management/approvals" />
              <StatCard label="Lembur" value={data.pending.overtime} color="blue" to="/hr-management/approvals" />
              <StatCard label="Koreksi Absen" value={data.pending.correction} color="blue" to="/hr-management/approvals" />
              <StatCard label="Kasbon" value={data.pending.loan} color="blue" to="/hr-management/approvals" />
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Payroll</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Payroll Draft" value={data.payrolls.draft} color="amber" to="/hr-management/payrolls" />
              <StatCard label="Payroll Final" value={data.payrolls.final} color="green" to="/hr-management/payrolls" />
              <StatCard label="Lokasi & Shift Toko" value="Atur" color="gray" to="/hr-management/store-locations" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
