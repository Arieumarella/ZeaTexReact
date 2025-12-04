import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "react-toastify";
import { getTransaksiKeluarById } from '../../service/barangKeluarService';

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

interface TransaksiDetail {
  id: number;
  tgl_transaksi: string;
  status_pembayaran: string;
  tenor?: number;
  pelanggan: { id: number; nama: string };
  total_transaksi: number;
  penginput: { id: number; nama: string; username: string };
  berjangka?: Array<{
    id: number;
    tgl_jatuh_tempo: string;
    jml_bayar: number;
  }>;
  details?: Array<{
    id: number;
    id_barang: number;
    barang?: {
      id: number;
      kd_barang: string;
      nama_barang: string;
      jml_yard: number;
      jml_rol: number;
    };
    jml_yard: number;
    jml_rol: number;
    jml_yard_retur?: number;
    jml_rol_retur?: number;
    harga_satuan: number;
  }>;
  tipe_discount: string;
  jml_discount: number;
  tipe_ppn: string;
  jml_ppn: number;
  catatan: string;
  created_at: string;
  updated_at: string;
}

export default function DetailKeluar() {
  const { id } = useParams();
  const [transaksi, setTransaksi] = useState<TransaksiDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchDetail() {
      try {
        const tid = Number(id);
        const data = await getTransaksiKeluarById(tid);
        if (mounted && data) {
          setTransaksi(data as TransaksiDetail);
        }
      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan jaringan.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full mt-8 text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!transaksi) {
    return (
      <div className="w-full mt-8 text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Data tidak ditemukan</p>
      </div>
    );
  }

  const totalBarang = (transaksi.details || []).reduce((sum, detail) => {
    const actualYard = detail.jml_yard - (detail.jml_yard_retur || 0);
    return sum + (actualYard * detail.harga_satuan);
  }, 0);
  
  const discountNominal = transaksi.tipe_discount === "persen"
    ? (totalBarang * transaksi.jml_discount) / 100
    : transaksi.jml_discount;
  
  const subtotal = totalBarang - discountNominal;
  
  const ppnNominal = transaksi.tipe_ppn === "persen"
    ? (subtotal * transaksi.jml_ppn) / 100
    : transaksi.jml_ppn;
  
  const totalHargaKeseluruhan = subtotal + ppnNominal;

  return (
    <>
      <PageMeta
        title="Detail Barang Keluar"
        description="Preview detail transaksi barang keluar"
      />
      <PageBreadcrumb
        pageTitle="Detail Barang Keluar"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Barang Keluar", link: "/barang-keluar" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Detail Transaksi Barang Keluar">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6 mb-6">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Tanggal Transaksi</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {formatDateWithMonth(transaksi.tgl_transaksi)}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Customer</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {transaksi.pelanggan?.nama || '-'}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Penginput Data</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {transaksi.penginput?.nama || '-'}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold">Daftar Barang</span>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-left">No</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-left">Nama Barang</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-left">Kode Barang</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Jumlah Yard</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Jumlah Rol</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Retur Yard</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Retur Rol</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Harga Per Yard</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Total Harga</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900">
                    {(transaksi.details || []).map((detail, idx) => (
                      <tr key={idx} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border px-3 py-2 text-center text-gray-700 dark:text-white/90">{idx + 1}</td>
                        <td className="border px-3 py-2 text-gray-700 dark:text-white/90">{detail.barang?.nama_barang || '-'}</td>
                        <td className="border px-3 py-2 text-gray-700 dark:text-white/90">{detail.barang?.kd_barang || '-'}</td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">{detail.jml_yard.toLocaleString()}</td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">{detail.jml_rol}</td>
                        <td className={`border px-3 py-2 text-right font-semibold ${(detail.jml_yard_retur || 0) > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-white/90'}`}>
                          {(detail.jml_yard_retur || 0).toLocaleString()}
                        </td>
                        <td className={`border px-3 py-2 text-right font-semibold ${(detail.jml_rol_retur || 0) > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-white/90'}`}>
                          {(detail.jml_rol_retur || 0).toLocaleString()}
                        </td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">
                          Rp {Number(detail.harga_satuan).toLocaleString()}
                        </td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">
                          {(() => {
                            const yard = Number(detail.jml_yard || 0);
                            const retur = Number(detail.jml_yard_retur || 0);
                            const harga = Number(detail.harga_satuan || 0);
                            const rowTotal = Math.max(0, (yard - retur) * harga);
                            return `Rp ${rowTotal.toLocaleString()}`;
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discount & PPN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Discount</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {transaksi.tipe_discount === "persen"
                    ? `${transaksi.jml_discount}%`
                    : `Rp ${Number(transaksi.jml_discount).toLocaleString()}`}
                </span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">PPN</span>
                <span className="font-semibold text-gray-800 dark:text-white/90">
                  {transaksi.tipe_ppn === "persen"
                    ? `${transaksi.jml_ppn}%`
                    : `Rp ${Number(transaksi.jml_ppn).toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Status Pembayaran */}
            <div className="pt-6 border-t">
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-3 font-semibold">Status Pembayaran</span>
              {transaksi.status_pembayaran === "0" ? (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded px-3 py-2">
                  <span className="text-green-800 dark:text-green-300 font-semibold">✓ Lunas</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded px-3 py-2">
                    <span className="text-blue-800 dark:text-blue-300 font-semibold">Pembayaran Berjangka ({transaksi.tenor} Bulan)</span>
                  </div>
                  {(transaksi.berjangka || []).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {transaksi.berjangka!.map((tenor, idx) => (
                        <div key={tenor.id} className="bg-gray-50 dark:bg-gray-800 border rounded p-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-white">Angsuran {idx + 1}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Jatuh Tempo: {formatDateWithMonth(tenor.tgl_jatuh_tempo)}
                          </p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white/90 mt-2">
                            Rp {Number(tenor.jml_bayar || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Catatan */}
            <div className="pt-6 border-t">
              <span className="block text-sm text-gray-500 dark:text-gray-400 mb-2 font-semibold">Catatan</span>
              <div className="border rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white/90 min-h-[60px]">
                {transaksi.catatan || <span className="text-gray-400">-</span>}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-6 border-t">
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between text-gray-700 dark:text-white/90">
                  <span>Total Harga Barang:</span>
                  <span className="font-semibold">Rp {totalBarang.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-white/90">
                  <span>Discount:</span>
                  <span className="font-semibold">- Rp {discountNominal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-white/90">
                  <span>Subtotal:</span>
                  <span className="font-semibold">Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-white/90">
                  <span>PPN:</span>
                  <span className="font-semibold">+ Rp {ppnNominal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 border-t pt-2 mt-2">
                  <span>Total Keseluruhan:</span>
                  <span>Rp {totalHargaKeseluruhan.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition"
              >
                ← Kembali
              </button>
              {/* Edit and Delete buttons can be added here later */}
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
