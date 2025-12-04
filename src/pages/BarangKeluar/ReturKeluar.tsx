import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadCrumTreLevel';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { toast,ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import { getTransaksiKeluarById, createReturKeluar } from '../../service/barangKeluarService';

const spinnerHideStyles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`;

interface DetailItem {
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
  jml_yard_retur: number;
  jml_rol_retur: number;
  harga_satuan: number;
}

interface Transaksi {
  id: number;
  tgl_transaksi: string;
  pelanggan: { id: number; nama: string };
  total_transaksi: number;
  details: DetailItem[];
}

export default function ReturKeluar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchDetail() {
      try {
        const tid = Number(id);
        const t = await getTransaksiKeluarById(tid);
        if (!t) {
          toast.error('Gagal mengambil data transaksi');
          if (mounted) setLoading(false);
          return;
        }
        if (mounted) {
          // ensure retur fields exist and adapt shape from service response
          const raw: any = t;
          const tx: Transaksi = {
            id: raw.id,
            tgl_transaksi: raw.tgl_transaksi,
            pelanggan: raw.pelanggan,
            total_transaksi: raw.total_transaksi,
            details: (raw.details || []).map((d: any) => ({
              ...d,
              jml_yard: d.jml_yard,
              jml_rol: d.jml_rol,
              jml_yard_retur: d.jml_yard_retur ?? 0,
              jml_rol_retur: d.jml_rol_retur ?? 0,
              harga_satuan: d.harga_satuan,
              barang: d.barang,
            })),
          };
          setTransaksi(tx);
        }
      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan jaringan');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { mounted = false; };
  }, [id]);

  const onChangeRetur = (detailId: number, field: 'jml_yard_retur' | 'jml_rol_retur', value: number) => {
    if (!transaksi) return;
    const upd = { ...transaksi } as Transaksi;
    upd.details = upd.details.map(d => {
      if (d.id !== detailId) return d;
      const maxYard = Number(d.jml_yard) || 0;
      const maxRol = Number(d.jml_rol) || 0;
      const next = { ...d } as DetailItem;
      if (field === 'jml_yard_retur') {
        next.jml_yard_retur = Math.max(0, Math.min(value || 0, maxYard));
      } else {
        next.jml_rol_retur = Math.max(0, Math.min(value || 0, maxRol));
      }
      return next;
    });
    setTransaksi(upd);
  };

  const handleSubmit = async () => {
    if (!transaksi) return;
    // ensure at least one retur > 0
    const hasRetur = transaksi.details.some(d => (d.jml_yard_retur || 0) > 0 || (d.jml_rol_retur || 0) > 0);
    if (!hasRetur) return toast.info('Tidak ada item yang dipilih untuk retur');

    const ok = await Swal.fire({
      title: 'Konfirmasi Retur',
      text: 'Yakin ingin menyimpan retur untuk transaksi ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal'
    });
    if (!ok.isConfirmed) return;

    setSubmitting(true);
    try {
      // build payload: list of detail id and retur quantities
      const payload = {
        details: transaksi.details.map(d => ({
          id: d.id,
          jml_yard_retur: Number(d.jml_yard_retur || 0),
          jml_rol_retur: Number(d.jml_rol_retur || 0),
        }))
      };

      const data = await createReturKeluar(transaksi.id, payload);
      if (!data || !data.status) {
        toast.error((data && data.message) || 'Gagal menyimpan retur');
        return;
      }
      toast.success('Retur berhasil disimpan');
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menyimpan retur');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="w-full mt-8 text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
    </div>
  );

  if (!transaksi) return (
    <div className="w-full mt-8 text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">Data transaksi tidak ditemukan.</p>
    </div>
  );

  return (
    <>
      <style>{spinnerHideStyles}</style>
      <PageMeta title="Retur Barang Keluar" description="Form retur barang keluar" />
      <PageBreadcrumb
        pageTitle="Retur Barang Keluar"
        lvl1={{ tittle: 'Home', link: '/Home' }}
        lvl2={{ tittle: 'Barang Keluar', link: '/barang-keluar' }}
      />

      <div className="w-full mt-8">
        <ComponentCard title={`Retur Transaksi #${transaksi.id}`}>
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-4">
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Tanggal Transaksi</span>
                <span className="font-semibold block text-gray-800 dark:text-white/90">{new Date(transaksi.tgl_transaksi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Pelanggan</span>
                <span className="font-semibold block text-gray-800 dark:text-white/90">{transaksi.pelanggan?.nama || '-'}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500 dark:text-gray-400">Total</span>
                <span className="font-semibold block text-gray-800 dark:text-white/90">Rp {Number(transaksi.total_transaksi).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-white/90">Daftar Barang (masukkan jumlah retur)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm bg-white dark:bg-gray-900">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-left">No</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-left">Nama Barang</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Harga Satuan</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Jumlah Yard</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Jumlah Rol</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Retur Yard</th>
                      <th className="border px-3 py-2 text-gray-700 dark:text-white/80 text-right">Retur Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksi.details.map((d, idx) => (
                      <tr key={d.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border px-3 py-2 text-center text-gray-700 dark:text-white/90">{idx + 1}</td>
                        <td className="border px-3 py-2 text-gray-700 dark:text-white/90">{d.barang?.nama_barang || '-'}</td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(d.harga_satuan || 0))}</td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">{Number(d.jml_yard).toLocaleString()}</td>
                        <td className="border px-3 py-2 text-right text-gray-700 dark:text-white/90">{Number(d.jml_rol).toLocaleString()}</td>
                        <td className="border px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={d.jml_yard}
                            value={d.jml_yard_retur}
                            onChange={e => onChangeRetur(d.id, 'jml_yard_retur', Number(e.target.value))}
                            className="w-28 border rounded px-2 py-1 text-right bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:border-white/[0.06]"
                          />
                        </td>
                        <td className="border px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            max={d.jml_rol}
                            value={d.jml_rol_retur}
                            onChange={e => onChangeRetur(d.id, 'jml_rol_retur', Number(e.target.value))}
                            className="w-28 border rounded px-2 py-1 text-right bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:border-white/[0.06]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t flex gap-3 justify-end">
              <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded">Batal</button>
              <button onClick={handleSubmit} disabled={submitting} className={`px-4 py-2 rounded text-white ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>{submitting ? 'Menyimpan...' : 'Simpan Retur'}</button>
            </div>

          </div>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
