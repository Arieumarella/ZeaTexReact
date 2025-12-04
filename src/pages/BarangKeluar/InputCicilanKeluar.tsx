import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import PageBreadcrumb from '../../components/common/PageBreadCrumTreLevel';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { getTransaksiKeluarById, updateBerjangkaKeluar, UpdateBerjangkaPayload } from '../../service/barangKeluarService';

// Helper function to format date with month name
const formatDateWithMonth = (dateString: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const days = String(date.getDate()).padStart(2, '0');
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${days} ${month} ${year}`;
};

interface BerjangkaDetail {
  id: number;
  jml_bayar?: number;
  tgl_jatuh_tempo: string;
}

interface TransaksiDetail {
  id: number;
  tgl_transaksi: string;
  total_transaksi: number;
  tenor?: number;
  berjangka?: BerjangkaDetail[];
}

export default function InputCicilanKeluar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState<TransaksiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Array<{ id: number; jml_bayar: number }>>([]);

  useEffect(() => {
    const fetchTransaksi = async () => {
      if (!id) return;
      const result = await getTransaksiKeluarById(parseInt(id));
      if (result) {
        setTransaksi(result);
        // Initialize payment amounts
        if (result.berjangka) {
          setPayments(
            result.berjangka.map((b) => ({
              id: b.id,
              jml_bayar: b.jml_bayar || 0
            }))
          );
        }
      }
      setLoading(false);
    };
    fetchTransaksi();
  }, [id]);

  const handlePaymentChange = (index: number, value: number) => {
    const updatedPayments = [...payments];
    updatedPayments[index].jml_bayar = value;
    setPayments(updatedPayments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi
    if (!id) {
      toast.error('ID transaksi tidak valid');
      return;
    }

    const totalPayments = payments.reduce((sum, p) => sum + p.jml_bayar, 0);
    if (totalPayments === 0) {
      toast.error('Minimal ada satu cicilan yang harus diisi');
      return;
    }

    const payload: UpdateBerjangkaPayload = {
      payments: payments.map((p) => ({
        id: p.id,
        jml_bayar: p.jml_bayar
      }))
    };

    const result = await updateBerjangkaKeluar(parseInt(id), payload);
    console.log('Result from service:', result);
    if (result && result.status) {
      // Tambah delay agar toast terbaca dengan baik
      toast.success(result.message || 'Cicilan berhasil disimpan!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => {
        navigate('/barang-keluar');
      }, 1400);
    } else {
      console.error('Update failed or returned null');
      toast.error('Gagal menyimpan cicilan', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-8 text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
      </div>
    );
  }

  if (!transaksi) {
    return (
      <div className="w-full mt-8 text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Data transaksi tidak ditemukan</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Input Cicilan Keluar"
        description="Input cicilan pembayaran transaksi keluar"
      />
      <PageBreadcrumb
        pageTitle="Input Cicilan Keluar"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Barang Keluar", link: "/barang-keluar" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title={`Input Cicilan - Transaksi #${transaksi.id}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6 mb-6">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Tanggal Transaksi</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {formatDateWithMonth(transaksi.tgl_transaksi)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Total Transaksi</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  Rp {transaksi.total_transaksi?.toLocaleString('id-ID') || '0'}
                </span>
              </div>
            </div>

            {/* Rincian Cicilan */}
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold">Rincian Cicilan (Total: {transaksi.tenor} Bulan)</span>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-900 dark:to-blue-800">
                    <tr>
                      <th className="border border-blue-600 dark:border-blue-700 px-4 py-3 text-white text-left font-semibold">No</th>
                      <th className="border border-blue-600 dark:border-blue-700 px-4 py-3 text-white text-left font-semibold">Tanggal Jatuh Tempo</th>
                      <th className="border border-blue-600 dark:border-blue-700 px-4 py-3 text-white text-right font-semibold">Jumlah Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900">
                    {payments.map((payment, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                        <td className="border px-4 py-3 text-center text-gray-700 dark:text-white/90 font-medium">{idx + 1}</td>
                        <td className="border px-4 py-3 text-gray-700 dark:text-white/90">
                          {transaksi.berjangka?.[idx]
                            ? formatDateWithMonth(transaksi.berjangka[idx].tgl_jatuh_tempo)
                            : '-'}
                        </td>
                        <td className="border px-4 py-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={payment.jml_bayar || ''}
                            onChange={(e) => handlePaymentChange(idx, e.target.value ? parseFloat(e.target.value) : 0)}
                            placeholder="0"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-right text-black outline-none transition duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Summary */}
            <div className="pt-4 border-t">
              <div className="space-y-2 text-sm md:text-base ml-auto w-full md:w-1/3">
                <div className="flex justify-between text-gray-700 dark:text-white/90 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  <span className="font-semibold">Total Cicilan:</span>
                  <span className="font-semibold">Rp {payments.reduce((sum, p) => sum + p.jml_bayar, 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t flex justify-end gap-3">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Cicilan
              </button>
              <button
                type="button"
                onClick={() => navigate('/barang-keluar')}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition font-semibold shadow-md hover:shadow-lg duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal
              </button>
            </div>
          </form>
        </ComponentCard>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
      </div>
    </>
  );
}
