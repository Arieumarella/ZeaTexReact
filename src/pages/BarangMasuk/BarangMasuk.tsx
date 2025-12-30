import { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { getAllSuppliers, Supplier, getTransaksiMasuk, TransaksiItem, deleteTransaksiMasuk } from '../../service/barangMasuk';

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

// Helper function to calculate total payment
const calculateTotalPayment = (berjangka: any[]): number => {
  return berjangka.reduce((sum, b) => sum + (Number(b.jml_bayar) || 0), 0);
};

export default function BarangMasuk() {
  const navigate = useNavigate();

  const handleDeleteTransaksi = async (id: number, supplierName: string) => {
    Swal.fire({
      title: 'Yakin ingin menghapus transaksi?',
      text: `Data yang dihapus tidak dapat dikembalikan!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = await deleteTransaksiMasuk(id);
        if (data && data.status) {
          window.location.reload();
        }
      }
    });
  };

  // Fungsi export Excel (will use server data)
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet((transactions || []).map((item, idx) => ({
      No: (page - 1) * rowsPerPage + idx + 1,
      "Tanggal Transaksi": formatDateWithMonth(item.tgl_transaksi),
      "Suplier": item.supplier?.nama || '',
      "Total Harga": item.total_transaksi,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BarangMasuk");
    XLSX.writeFile(wb, "barang-masuk.xlsx");
  };

  // State transaksi dari server
  const [transactions, setTransactions] = useState<TransaksiItem[]>([]);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [totalState, setTotalState] = useState(0);

  // State filter dan pagination
  const [suplier, setSuplier] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState("");
  const [tanggalStart, setTanggalStart] = useState("");
  const [tanggalEnd, setTanggalEnd] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = totalPagesState;
  const paginatedData = transactions;

  // Fetch transaksi from server when filters / page change
  useEffect(() => {
    let mounted = true;
    async function fetchTransaksi() {
      const params: any = { page };
      if (suplier) params.supplierId = Number(suplier);
      if (tanggalStart) params.waktuAwal = tanggalStart;
      if (tanggalEnd) params.waktuAkhir = tanggalEnd;
      const res = await getTransaksiMasuk(params);
      if (!mounted) return;
      if (res && res.data) {
        setTransactions(res.data);
        setTotalState(res.total || 0);
        setTotalPagesState(res.totalPages || 1);
      } else {
        setTransactions([]);
        setTotalState(0);
        setTotalPagesState(1);
      }
    }
    fetchTransaksi();
    return () => { mounted = false; };
  }, [page, suplier, tanggalStart, tanggalEnd]);

  useEffect(() => {
    let mounted = true;
    async function fetchSup() {
      const list = await getAllSuppliers();
      if (mounted && list) setSuppliers(list);
    }
    fetchSup();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <PageMeta
        title="Zea. Textile - Barang Masuk"
        description="Data barang masuk yang tersedia di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Barang Masuk" />
      <div className="space-y-6">
        <ComponentCard title="Daftar Barang Masuk Per Transaksi">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/tambah-masuk')}
            >
              + Tambah Data
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Cari atau pilih supplier..."
                value={selectedSupplierName || supplierQuery}
                onChange={e => { setSupplierQuery(e.target.value); setSelectedSupplierName(''); setShowSupplierDropdown(true); }}
                onFocus={() => setShowSupplierDropdown(true)}
                className="border rounded px-3 py-2 text-sm w-full bg-white dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {showSupplierDropdown && (
                <ul className="absolute z-40 w-full max-h-48 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 mt-1 rounded shadow-sm">
                  <li className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onMouseDown={() => { setSuplier(''); setSelectedSupplierName(''); setSupplierQuery(''); setShowSupplierDropdown(false); }}>Semua Suplayer</li>
                  {suppliers.filter(s => s.nama.toLowerCase().includes((supplierQuery || selectedSupplierName).toLowerCase())).map(s => (
                    <li key={s.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                      onMouseDown={() => { setSuplier(String(s.id)); setSelectedSupplierName(s.nama); setSupplierQuery(''); setShowSupplierDropdown(false); }}
                    >
                      <span className="truncate">{s.nama}</span>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{s.no_tlp}</span>
                    </li>
                  ))}
                  {suppliers.length === 0 && <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Tidak ada supplier</li>}
                </ul>
              )}
            </div>
            <input
              type="date"
              value={tanggalStart}
              onChange={e => setTanggalStart(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white/90"
              placeholder="Tanggal Awal"
            />
            <span className="text-gray-500 dark:text-gray-400">s/d</span>
            <input
              type="date"
              value={tanggalEnd}
              onChange={e => setTanggalEnd(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white/90"
              placeholder="Tanggal Akhir"
            />

          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Tanggal Transaksi</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Suplier</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Total Harga</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Status Pembayaran</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Penginput/Pengedit Data</TableCell>
                    <TableCell isHeader className="w-48 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <td colSpan={7} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <TableRow key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{formatDateWithMonth(item.tgl_transaksi)}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.supplier?.nama || ''}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {(() => {
                            const details = item.details || [];
                            const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
                            const gross = details.reduce((s, d) => s + (Number(d.jml_yard || 0) * Number(d.harga_satuan || 0)), 0);
                            const deduction = details.reduce((s, d) => s + (Number((d as any).jml_yard_retur || 0) * Number(d.harga_satuan || 0)), 0);
                            const net = Math.max(0, gross - deduction);
                            const totalReturYard = details.reduce((s, d) => s + Number((d as any).jml_yard_retur || 0), 0);
                            const hasRetur = deduction > 0;
                            return (
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold">{fmt(net)}</span>
                                  {hasRetur && <span className="inline-block text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">Retur</span>}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <span>Gross: {fmt(gross)}</span>
                                  {hasRetur && (
                                    <span className="ml-2 text-red-600 dark:text-red-400">− {fmt(deduction)} ({totalReturYard.toLocaleString()}y)</span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              {item.status_pembayaran === "0" ? (
                                <div className="text-sm font-bold px-3 py-1.5 rounded-full inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  Lunas
                                </div>
                              ) : (
                                (() => {
                                  const totalBayar = calculateTotalPayment(item.berjangka || []);
                                  const totalTransaksi = Number(item.total_transaksi);
                                  const isSudahLunas = totalBayar >= totalTransaksi;

                                  return (
                                    <div>
                                      <div className={`text-sm font-bold px-3 py-1.5 rounded-full inline-block ${isSudahLunas
                                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                                        }`}>
                                        {isSudahLunas ? "Lunas - " : ""}Pembayaran Berjangka
                                      </div>
                                    </div>
                                  );
                                })()
                              )}
                              {item.status_pembayaran === "1" && item.berjangka && item.berjangka.length > 0 && (
                                <div className="text-xs space-y-2 mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                                  {item.berjangka
                                    .sort((a: any, b: any) => a.id - b.id)
                                    .map((tenor: any, tIdx: number) => (
                                      <div key={tenor.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                        <div className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                          Angsuran {tIdx + 1}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Jatuh Tempo: {formatDateWithMonth(tenor.tgl_jatuh_tempo)}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                          Jumlah Bayar: Rp {Number(tenor.jml_bayar || 0).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.penginput?.username || ''}</TableCell>
                        <TableCell className="w-48 px-2 py-2 border text-center">
                          <button className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded mr-1 hover:bg-blue-600" onClick={() => navigate(`/detail-masuk/${item.id}`)}>Detail</button>
                          <button className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded mr-1 hover:bg-yellow-600" onClick={() => navigate(`/edit-masuk/${item.id}`)}>Edit</button>
                          {item.status_pembayaran === "1" && (
                            <button className="px-1.5 py-0.5 text-xs bg-purple-500 text-white rounded mr-1 hover:bg-purple-600" onClick={() => navigate(`/input-cicilan/${item.id}`)}>Input Cicilan</button>
                          )}
                          {/* Retur Barang button */}
                          <button className="px-1.5 py-0.5 text-xs bg-indigo-500 text-white rounded mr-1 hover:bg-indigo-600" onClick={() => navigate(`/retur-masuk/${item.id}`)}>Retur</button>
                          <button
                            className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => handleDeleteTransaksi(item.id, item.supplier?.nama || 'Unknown')}
                          >
                            Hapus
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex justify-end items-center gap-2 w-full">
              <span className="dark:bg-gray-900 dark:text-white/90">Halaman:</span>
              {/* Tombol Prev */}
              <button
                className="px-3 py-1 border rounded bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              {/* Nomor halaman dinamis */}
              {(() => {
                const pageNumbers = [];
                let start = Math.max(1, page - 2);
                let end = Math.min(totalPages, page + 2);
                if (page <= 3) {
                  end = Math.min(5, totalPages);
                }
                if (page >= totalPages - 2) {
                  start = Math.max(1, totalPages - 4);
                }
                for (let i = start; i <= end; i++) {
                  pageNumbers.push(i);
                }
                return pageNumbers.map((num) => (
                  <button
                    key={num}
                    className={`px-3 py-1 border rounded ${page === num ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                    onClick={() => setPage(num)}
                    disabled={page === num}
                  >
                    {num}
                  </button>
                ));
              })()}
              {/* Tombol Next */}
              <button
                className="px-3 py-1 border rounded bg-white text-gray-700 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
