import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { myPayslips } from '../../service/hrEmployeeService';
import type { Payslip } from '../../types/hr';
import { formatDate, formatRupiah } from '../../utils/hrFormat';
import { downloadPayslipPdf } from '../../utils/payslipPdf';

export default function PayslipsTab() {
  const [slips, setSlips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    myPayslips()
      .then((res) => {
        if (res.status && res.data) {
          setSlips(res.data);
        } else {
          toast.error(res.message || 'Gagal memuat slip gaji.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500 py-6 text-center">Memuat data...</p>;
  }

  if (slips.length === 0) {
    return <p className="text-sm text-gray-500 py-6 text-center">Belum ada slip gaji yang difinalisasi.</p>;
  }

  return (
    <div className="space-y-3">
      {slips.map((slip) => (
        <div key={slip.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {slip.payroll?.period_name || `Payroll #${slip.payroll_id}`}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(slip.period_start)} s/d {formatDate(slip.period_end)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Gaji Bersih</div>
              <div className="font-bold text-gray-900 dark:text-white">{formatRupiah(slip.net_salary)}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => downloadPayslipPdf(slip, slip.payroll?.period_name || `Payroll ${slip.payroll_id}`)}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
            >
              Unduh Slip PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
