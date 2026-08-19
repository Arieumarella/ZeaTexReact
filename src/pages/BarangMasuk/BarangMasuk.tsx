import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
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
import { getAllSuppliers, Supplier, getTransaksiMasuk, TransaksiItem, deleteTransaksiMasuk, getTransaksiMasukById, updateTransaksiMasuk } from '../../service/barangMasuk';

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
  const [notaModalOpen, setNotaModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<string | null>(null);
  const [selectedTransaksi, setSelectedTransaksi] = useState<TransaksiItem | null>(null);
  const [loadingNotaData, setLoadingNotaData] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const openNotaModal = async (item: TransaksiItem) => {
    setSelectedNota(item.nota || null);
    setSelectedTransaksi(null);
    setSelectedFile(null);
    setNotaModalOpen(true);
    setLoadingNotaData(true);
    try {
      const fullTx = await getTransaksiMasukById(item.id);
      if (fullTx) {
        setSelectedTransaksi(fullTx);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat detail transaksi");
    } finally {
      setLoadingNotaData(false);
    }
  };

  const handleUploadNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaksi || !selectedFile) return;
    setUploading(true);
    try {
      const payload = {
        id_supplier: selectedTransaksi.supplier?.id || null,
        tgl_transaksi: selectedTransaksi.tgl_transaksi ? new Date(selectedTransaksi.tgl_transaksi).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        total_transaksi: Number(selectedTransaksi.total_transaksi) || 0,
        tipe_discount: selectedTransaksi.tipe_discount || null,
        jml_discount: Number(selectedTransaksi.jml_discount) || 0,
        tipe_ppn: selectedTransaksi.tipe_ppn || null,
        jml_ppn: Number(selectedTransaksi.jml_ppn) || 0,
        catatan: selectedTransaksi.catatan || null,
        status_pembayaran: selectedTransaksi.status_pembayaran,
        tenor: selectedTransaksi.tenor || 1,
        tanggal_tenor: (selectedTransaksi.berjangka || []).map((b: any) => b.tgl_jatuh_tempo ? new Date(b.tgl_jatuh_tempo).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        details: (selectedTransaksi.details || []).map((d: any) => ({
          id_barang: d.id_barang,
          jml_yard: Number(d.jml_yard) || 0,
          jml_rol: Number(d.jml_rol) || 0,
          harga_satuan: Number(d.harga_satuan) || 0,
        }))
      };
      const res = await updateTransaksiMasuk(selectedTransaksi.id, payload, selectedFile, false);
      if (res && res.status) {
        toast.success("Nota berhasil diunggah!");
        setNotaModalOpen(false);
        setSelectedFile(null);
        setSelectedTransaksi(null);
        // Refresh list
        const params: any = { page };
        if (suplier) params.supplierId = Number(suplier);
        if (tanggalStart) params.waktuAwal = tanggalStart;
        if (tanggalEnd) params.waktuAkhir = tanggalEnd;
        if (searchKdBarang) params.kdBarang = searchKdBarang;
        const listRes = await getTransaksiMasuk(params);
        if (listRes && listRes.data) {
          setTransactions(listRes.data);
        }
      } else {
        toast.error(res?.message || "Gagal mengunggah nota.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat mengunggah nota.");
    } finally {
      setUploading(false);
    }
  };

  const handleHapusNota = async () => {
    if (!selectedTransaksi) return;
    Swal.fire({
      title: 'Hapus nota pembayaran?',
      text: 'Tindakan ini tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setUploading(true);
        try {
          const payload = {
            id_supplier: selectedTransaksi.supplier?.id || null,
            tgl_transaksi: selectedTransaksi.tgl_transaksi ? new Date(selectedTransaksi.tgl_transaksi).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            total_transaksi: Number(selectedTransaksi.total_transaksi) || 0,
            tipe_discount: selectedTransaksi.tipe_discount || null,
            jml_discount: Number(selectedTransaksi.jml_discount) || 0,
            tipe_ppn: selectedTransaksi.tipe_ppn || null,
            jml_ppn: Number(selectedTransaksi.jml_ppn) || 0,
            catatan: selectedTransaksi.catatan || null,
            status_pembayaran: selectedTransaksi.status_pembayaran,
            tenor: selectedTransaksi.tenor || 1,
            tanggal_tenor: (selectedTransaksi.berjangka || []).map((b: any) => b.tgl_jatuh_tempo ? new Date(b.tgl_jatuh_tempo).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
            details: (selectedTransaksi.details || []).map((d: any) => ({
              id_barang: d.id_barang,
              jml_yard: Number(d.jml_yard) || 0,
              jml_rol: Number(d.jml_rol) || 0,
              harga_satuan: Number(d.harga_satuan) || 0,
            }))
          };
          const res = await updateTransaksiMasuk(selectedTransaksi.id, payload, null, true);
          if (res && res.status) {
            toast.success("Nota berhasil dihapus!");
            setSelectedNota(null);
            if (selectedTransaksi) {
              setSelectedTransaksi({ ...selectedTransaksi, nota: null });
            }
            // Refresh list
            const params: any = { page };
            if (suplier) params.supplierId = Number(suplier);
            if (tanggalStart) params.waktuAwal = tanggalStart;
            if (tanggalEnd) params.waktuAkhir = tanggalEnd;
            if (searchKdBarang) params.kdBarang = searchKdBarang;
            const listRes = await getTransaksiMasuk(params);
            if (listRes && listRes.data) {
              setTransactions(listRes.data);
            }
          } else {
            toast.error(res?.message || "Gagal menghapus nota.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Terjadi kesalahan saat menghapus nota.");
        } finally {
          setUploading(false);
        }
      }
    });
  };

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
  const handleExportExcel = async () => {
    try {
      const params: any = { all: true };
      if (suplier) params.supplierId = Number(suplier);
      if (tanggalStart) params.waktuAwal = tanggalStart;
      if (tanggalEnd) params.waktuAkhir = tanggalEnd;
      if (searchKdBarang) params.kdBarang = searchKdBarang;

      const res = await getTransaksiMasuk(params);
      if (res && res.data) {
        const rows: any[] = [];
        let rowNum = 1;

        (res.data || []).forEach((item: any, idx: number) => {
          const totalBayar = calculateTotalPayment(item.berjangka || []);
          const totalTransaksi = Number(item.total_transaksi);
          const isSudahLunas = totalBayar >= totalTransaksi;
          const sisaPembayaran = item.status_pembayaran === "0" ? 0 : Math.max(0, totalTransaksi - totalBayar);

          let statusPembayaranStr = "";
          if (item.status_pembayaran === "0") {
            statusPembayaranStr = "Lunas";
          } else {
            statusPembayaranStr = isSudahLunas ? "Lunas - Pembayaran Berjangka" : "Pembayaran Berjangka";
          }

          const detailAngsuranStr = item.status_pembayaran === "1" && item.berjangka && item.berjangka.length > 0
            ? item.berjangka
                .sort((a: any, b: any) => a.id - b.id)
                .map((tenor: any, tIdx: number) => `Angsuran ${tIdx + 1}: Rp ${Number(tenor.jml_bayar || 0).toLocaleString()} (Jatuh Tempo: ${formatDateWithMonth(tenor.tgl_jatuh_tempo)})`)
                .join("; ")
            : "-";

          const details = item.details || [];
          if (details.length === 0) {
            rows.push({
              No: idx + 1,
              "ID Transaksi": item.id,
              "Tanggal Transaksi": formatDateWithMonth(item.tgl_transaksi),
              "Suplier": item.supplier?.nama || '',
              "Kode Barang": "-",
              "Nama Barang": "-",
              "Jumlah Yard": 0,
              "Jumlah Rol": 0,
              "Harga Satuan": 0,
              "Total Harga Transaksi": item.total_transaksi,
              "Sisa Pembayaran": sisaPembayaran,
              "Status Pembayaran": statusPembayaranStr,
              "Detail Angsuran": detailAngsuranStr,
              "Penginput/Pengedit Data": item.penginput?.username || '',
            });
          } else {
            details.forEach((d: any, dIdx: number) => {
              rows.push({
                No: idx + 1,
                "ID Transaksi": item.id,
                "Tanggal Transaksi": formatDateWithMonth(item.tgl_transaksi),
                "Suplier": item.supplier?.nama || '',
                "Kode Barang": d.barang?.kd_barang || "-",
                "Nama Barang": d.barang?.nama_barang || "-",
                "Jumlah Yard": d.jml_yard || 0,
                "Jumlah Rol": d.jml_rol || 0,
                "Harga Satuan": d.harga_satuan || 0,
                "Total Harga Transaksi": dIdx === 0 ? item.total_transaksi : "",
                "Sisa Pembayaran": dIdx === 0 ? sisaPembayaran : "",
                "Status Pembayaran": statusPembayaranStr,
                "Detail Angsuran": detailAngsuranStr,
                "Penginput/Pengedit Data": item.penginput?.username || '',
              });
            });
          }
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BarangMasuk");
        XLSX.writeFile(wb, "barang-masuk.xlsx");
      }
    } catch (err) {
      console.error("Gagal export excel:", err);
    }
  };

  // State transaksi dari server
  const [transactions, setTransactions] = useState<TransaksiItem[]>([]);
  const [totalPagesState, setTotalPagesState] = useState(1);
  const [totalState, setTotalState] = useState(0);

  // State filter dan pagination — diambil dari sessionStorage agar persist saat navigasi
  const [suplier, setSuplier] = useState(() => sessionStorage.getItem("barang_masuk_suplier") || "");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState(() => sessionStorage.getItem("barang_masuk_supplierName") || "");
  const [tanggalStart, setTanggalStart] = useState(() => sessionStorage.getItem("barang_masuk_tglAwal") || "");
  const [tanggalEnd, setTanggalEnd] = useState(() => sessionStorage.getItem("barang_masuk_tglAkhir") || "");
  const [searchKdBarang, setSearchKdBarang] = useState(() => sessionStorage.getItem("barang_masuk_kdBarang") || "");
  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem("barang_masuk_page");
    if (savedPage) {
      const parsed = parseInt(savedPage, 10);
      return !isNaN(parsed) && parsed > 0 ? parsed : 1;
    }
    return 1;
  });
  const rowsPerPage = 10;
  const totalPages = totalPagesState;
  const paginatedData = transactions;

  // Persist page di sessionStorage
  useEffect(() => {
    sessionStorage.setItem("barang_masuk_page", String(page));
  }, [page]);

  // Persist filter di sessionStorage agar tetap ada saat kembali dari halaman lain
  useEffect(() => {
    if (suplier) sessionStorage.setItem("barang_masuk_suplier", suplier);
    else sessionStorage.removeItem("barang_masuk_suplier");
    if (selectedSupplierName) sessionStorage.setItem("barang_masuk_supplierName", selectedSupplierName);
    else sessionStorage.removeItem("barang_masuk_supplierName");
    if (tanggalStart) sessionStorage.setItem("barang_masuk_tglAwal", tanggalStart);
    else sessionStorage.removeItem("barang_masuk_tglAwal");
    if (tanggalEnd) sessionStorage.setItem("barang_masuk_tglAkhir", tanggalEnd);
    else sessionStorage.removeItem("barang_masuk_tglAkhir");
    if (searchKdBarang) sessionStorage.setItem("barang_masuk_kdBarang", searchKdBarang);
    else sessionStorage.removeItem("barang_masuk_kdBarang");
  }, [suplier, selectedSupplierName, tanggalStart, tanggalEnd, searchKdBarang]);

  // Fetch transaksi from server when filters / page change
  useEffect(() => {
    let mounted = true;
    async function fetchTransaksi() {
      const params: any = { page };
      if (suplier) params.supplierId = Number(suplier);
      if (tanggalStart) params.waktuAwal = tanggalStart;
      if (tanggalEnd) params.waktuAkhir = tanggalEnd;
      if (searchKdBarang) params.kdBarang = searchKdBarang;
      const res = await getTransaksiMasuk(params);
      if (!mounted) return;
      if (res && res.data) {
        setTransactions(res.data);
        setTotalState(res.total || 0);
        const tp = res.totalPages || 1;
        setTotalPagesState(tp);
        if (page > tp && tp >= 1) {
          setPage(1);
        }
      } else {
        setTransactions([]);
        setTotalState(0);
        setTotalPagesState(1);
      }
    }
    fetchTransaksi();
    return () => { mounted = false; };
  }, [page, suplier, tanggalStart, tanggalEnd, searchKdBarang]);

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
            <input
              type="text"
              placeholder="Cari kode barang..."
              value={searchKdBarang}
              onChange={e => { setSearchKdBarang(e.target.value); setPage(1); }}
              className="border rounded px-3 py-2 text-sm w-64 bg-white dark:bg-gray-900 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400"
            />
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
                  <li className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onMouseDown={() => { setSuplier(''); setSelectedSupplierName(''); setSupplierQuery(''); setShowSupplierDropdown(false); setPage(1); }}>Semua Suplayer</li>
                  {suppliers.filter(s => s.nama.toLowerCase().includes((supplierQuery || selectedSupplierName).toLowerCase())).map(s => (
                    <li key={s.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-gray-700 dark:text-gray-100 flex justify-between items-center"
                      onMouseDown={() => { setSuplier(String(s.id)); setSelectedSupplierName(s.nama); setSupplierQuery(''); setShowSupplierDropdown(false); setPage(1); }}
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
              onChange={e => { setTanggalStart(e.target.value); setPage(1); }}
              className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white/90"
              placeholder="Tanggal Awal"
            />
            <span className="text-gray-500 dark:text-gray-400">s/d</span>
            <input
              type="date"
              value={tanggalEnd}
              onChange={e => { setTanggalEnd(e.target.value); setPage(1); }}
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
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Kode Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Suplier</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Total Harga</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Sisa Pembayaran</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Status Pembayaran</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Nota</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Penginput/Pengedit Data</TableCell>
                    <TableCell isHeader className="w-48 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <td colSpan={9} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <TableRow key={item.id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{formatDateWithMonth(item.tgl_transaksi)}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {[...new Set((item.details?.map((d: any) => d.barang?.kd_barang).filter(Boolean) || []))].join(", ") || "-"}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.supplier?.nama || ''}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {(() => {
                            const details = item.details || [];
                            const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
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
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {(() => {
                            const totalTagihan = Number(item.total_transaksi);
                            if (item.status_pembayaran === "0") {
                              return <span className="text-green-600 dark:text-green-400 font-semibold">Lunas</span>;
                            }
                            const totalBayar = calculateTotalPayment(item.berjangka || []);
                            const sisa = Math.max(0, totalTagihan - totalBayar);
                            const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
                            return (
                              <span className={sisa > 0 ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-green-600 dark:text-green-400 font-semibold'}>
                                {fmt(sisa)}
                              </span>
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
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {item.nota ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${item.nota}`}
                              alt="Nota"
                              onClick={() => openNotaModal(item)}
                              className="w-24 h-24 object-cover rounded mx-auto cursor-pointer border border-gray-300 dark:border-gray-600 hover:scale-105 transition-transform"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => openNotaModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors border border-blue-100 dark:border-transparent"
                            >
                              + Upload Nota
                            </button>
                          )}
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
          {/* ToastContainer is handled globally in main.tsx */}
        </ComponentCard>
      </div>

      {/* Premium Receipt Modal */}
      {notaModalOpen && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300"
          onClick={() => {
            if (!uploading && !loadingNotaData) {
              setNotaModalOpen(false);
              setSelectedTransaksi(null);
              setSelectedNota(null);
              setSelectedFile(null);
            }
          }}
        >
          <div
            className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full transform scale-100 transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                Nota Pembayaran - Transaksi #{selectedTransaksi?.id || ""}
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (!uploading && !loadingNotaData) {
                    setNotaModalOpen(false);
                    setSelectedTransaksi(null);
                    setSelectedNota(null);
                    setSelectedFile(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl font-bold"
                disabled={uploading || loadingNotaData}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
              {loadingNotaData ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm font-medium">Memuat detail transaksi...</span>
                </div>
              ) : (
                <>
                  {/* Transaction Info Summary */}
                  {selectedTransaksi && (
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-850 rounded-xl p-4 text-xs border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Supplier</span>
                        <span className="font-semibold text-gray-850 dark:text-white">{selectedTransaksi.supplier?.nama || "-"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Tanggal</span>
                        <span className="font-semibold text-gray-850 dark:text-white">{formatDateWithMonth(selectedTransaksi.tgl_transaksi)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Total Belanja</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedTransaksi.total_transaksi)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Status Pembayaran</span>
                        <span className={`font-semibold ${selectedTransaksi.status_pembayaran === "0" ? "text-green-600" : "text-red-500"}`}>
                          {selectedTransaksi.status_pembayaran === "0" ? "Lunas" : "Pembayaran Berjangka"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Image Preview / Placeholder */}
                  {selectedNota ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-gray-500 mb-2 self-start flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Nota Terpasang:
                      </span>
                      <div className="relative group w-full bg-gray-100 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center p-3 shadow-inner">
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${selectedNota}`}
                          alt="Nota Pembayaran"
                          className="max-w-full max-h-[320px] object-contain rounded-lg shadow-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleHapusNota}
                        disabled={uploading}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-100 dark:border-transparent disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Nota
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-950/40 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-2 shadow-inner">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-800 dark:text-white mb-1">Belum Ada Nota Pembayaran</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[280px]">Silakan pilih file di bawah ini untuk mengunggah nota baru.</p>
                    </div>
                  )}

                  {/* Form Upload */}
                  <form onSubmit={handleUploadNota} className="space-y-4 border-t pt-4 dark:border-gray-800">
                    <div>
                      <label className="block mb-1.5 text-xs font-semibold text-gray-700 dark:text-white flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {selectedNota ? "Unggah Nota Baru (Menggantikan)" : "Pilih File Nota"}
                      </label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
                            if (!allowedTypes.includes(file.type)) {
                              toast.error("Format file harus PNG, JPG, atau JPEG.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("Ukuran file maksimal 5 MB.");
                              e.target.value = "";
                              setSelectedFile(null);
                              return;
                            }
                          }
                          setSelectedFile(file);
                        }}
                        className="border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 w-full dark:bg-gray-955/40 dark:text-white/90 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 transition-colors focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                      <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Format: PNG, JPG, JPEG (Maksimal 5 MB)
                      </p>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-2 border-t dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          setNotaModalOpen(false);
                          setSelectedTransaksi(null);
                          setSelectedNota(null);
                          setSelectedFile(null);
                        }}
                        disabled={uploading}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-xs transition-colors disabled:opacity-50"
                      >
                        Tutup
                      </button>
                      <button
                        type="submit"
                        disabled={uploading || !selectedFile}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium text-xs transition-all shadow-sm shadow-blue-500/20 disabled:pointer-events-none flex items-center gap-1.5"
                      >
                        {uploading ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Mengunggah...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Simpan Nota</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
