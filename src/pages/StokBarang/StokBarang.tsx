import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { getAllStokBarang, getDetilKeluar, getDetilMasuk, getDetilSisa, type StokBarang } from "../../service/stokBarangService";
import { updateBarang } from "../../service/barangService";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function StokBarang() {
  // State untuk data, loading, dan pagination
  const [data, setData] = useState<StokBarang[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(() => sessionStorage.getItem("stok_barang_filter") || "");
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("stok_barang_page");
    return saved ? parseInt(saved, 10) || 1 : 1;
  });
  const [totalPages, setTotalPages] = useState(0);

  // Modal state for detail masuk/keluar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('Detail Barang Masuk/Keluar');
  const [modalType, setModalType] = useState<'masuk' | 'keluar' | 'sisa'>('masuk');

  // State untuk quick photo upload
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<StokBarang | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarang || !selectedFile) return;
    setUploading(true);
    const res = await updateBarang(selectedBarang.id, {
      nama_barang: selectedBarang.nama_barang,
      kd_barang: selectedBarang.kd_barang || undefined,
      foto: selectedFile,
    });
    setUploading(false);
    if (res.status) {
      setPhotoModalOpen(false);
      setSelectedFile(null);
      setSelectedBarang(null);
      // Refresh data
      const result = await getAllStokBarang(page, filter);
      if (result.status) {
        setData(result.data);
      }
    }
  };

  const modalSummary = useMemo(() => {
    const summary = { masukCount: 0, keluarCount: 0, totalValue: 0 };
    modalData.forEach((r: any) => {
      if (modalType === 'sisa') {
        summary.totalValue += Number(r.total_nilai_sisa || 0);
      } else {
        const status = (r.sts_barang || "").toString().toLowerCase();
        if (status.includes("masuk")) summary.masukCount += 1;
        if (status.includes("keluar")) summary.keluarCount += 1;
        summary.totalValue += Number(r.total_harga || 0);
      }
    });
    return summary;
  }, [modalData, modalType]);

  const formatTanggal = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatRupiah = (n?: number) => {
    if (n == null) return "-";
    return n.toLocaleString("id-ID");
  };



  const openDetailKeluar = async (id: number | string) => {
    setModalType('keluar');
    setSelectedId(id);
    setModalTitle('Detail Barang Keluar');
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData([]);
    try {
      const result = await getDetilKeluar(id);
      if (!result.status) {
        setModalError(result.message || 'Data tidak ditemukan');
      } else {
        setModalData(result.data || []);
      }
    } catch (err: any) {
      setModalError(err?.message || 'Terjadi kesalahan');
    } finally {
      setModalLoading(false);
    }
  };

  const openDetailMasuk = async (id: number | string) => {
    setModalType('masuk');
    setSelectedId(id);
    setModalTitle('Detail Barang Masuk');
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData([]);
    try {
      const result = await getDetilMasuk(id);
      if (!result.status) {
        setModalError(result.message || 'Data tidak ditemukan');
      } else {
        setModalData(result.data || []);
      }
    } catch (err: any) {
      setModalError(err?.message || 'Terjadi kesalahan');
    } finally {
      setModalLoading(false);
    }
  };

  const openDetailSisa = async (id: number | string, namaBarang: string) => {
    setModalType('sisa');
    setSelectedId(id);
    setModalTitle(`Detail Sisa Stok - ${namaBarang}`);
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError(null);
    setModalData([]);
    try {
      const result = await getDetilSisa(id);
      if (!result.status) {
        setModalError(result.message || 'Data tidak ditemukan');
      } else {
        setModalData(result.data || []);
      }
    } catch (err: any) {
      setModalError(err?.message || 'Terjadi kesalahan');
    } finally {
      setModalLoading(false);
    }
  };

  // Persist filter di sessionStorage
  useEffect(() => {
    if (filter) sessionStorage.setItem("stok_barang_filter", filter);
    else sessionStorage.removeItem("stok_barang_filter");
    sessionStorage.setItem("stok_barang_page", String(page));
  }, [filter, page]);

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAllStokBarang(page, filter);

      if (result.status) {
        setData(result.data);
        const tp = result.totalPages;
        setTotalPages(tp);
        if (page > tp && tp >= 1) {
          setPage(1);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [page, filter]);

  // Fungsi export Excel
  const handleExportExcel = async () => {
    try {
      const result = await getAllStokBarang(1, filter, true);
      if (result.status) {
        const ws = XLSX.utils.json_to_sheet(result.data.map((item, idx) => ({
          No: idx + 1,
          "Nama Barang": item.nama_barang,
          "Kode Barang": item.kd_barang,
          "Total Yard": item.jml_yard,
          "Total Rol": item.jml_rol,
          "Total Yard Terjual": item.tot_yard_terjual ?? 0,
          "Total Rol Terjual": item.tot_rol_terjual ?? 0,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "StokBarang");
        XLSX.writeFile(wb, "stok-barang.xlsx");
      }
    } catch (err) {
      console.error("Gagal export excel:", err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    setPage(1);
  };


  return (
    <>
      <PageMeta
        title="Zea. Textile - Stok Barang"
        description="Stock barang yang tersedia di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Stok Barang" />
      <div className="space-y-6">
        <ComponentCard title="Daftar Stok Barang">
          <div className="mb-4 flex items-center gap-2">
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
              placeholder="Cari Nama/kode barang..."
              value={filter}
              onChange={handleFilterChange}
              className="border rounded px-3 py-2 w-64 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Kode Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Yard</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Rol</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Yard Terjual</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Rol Terjual</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 hidden lg:table-cell">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-4">
                        <td colSpan={8} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * 10 + idx + 1}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => {
                                setSelectedBarang(item);
                                setPhotoModalOpen(true);
                              }}
                              className="relative w-24 h-24 rounded-lg overflow-hidden border cursor-pointer group flex-shrink-0"
                              title="Klik untuk ubah foto"
                            >
                              {item.foto ? (
                                <img
                                  src={`${API_BASE}/uploads/${item.foto}`}
                                  alt={item.nama_barang}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 text-[10px] font-medium text-center leading-3">
                                  No Pic
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-semibold">
                                Ubah
                              </div>
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-start">{item.nama_barang}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 text-start">Kode Barang: {item.kd_barang}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">{item.kd_barang}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">{item.jml_yard || 0}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">{item.jml_rol || 0}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">{item.tot_yard_terjual ?? 0}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90">{item.tot_rol_terjual ?? 0}</TableCell>
                        <TableCell className="px-4 py-2 border text-gray-800 dark:text-white/90 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetailSisa(item.id, item.nama_barang || "")}
                              aria-label={`Detail sisa stok untuk ${item.nama_barang}`}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-shadow bg-purple-600 border border-transparent text-white hover:shadow-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                <polyline points="2 17 12 22 22 17" />
                                <polyline points="2 12 12 17 22 12" />
                              </svg>
                              <span>Sisa</span>
                            </button>
                            <button
                              onClick={() => openDetailKeluar(item.id)}
                              aria-label={`Detail barang keluar untuk ${item.nama_barang}`}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-shadow bg-green-600 border border-transparent text-white hover:shadow-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>Keluar</span>
                            </button>
                            <button
                              onClick={() => openDetailMasuk(item.id)}
                              aria-label={`Detail barang masuk untuk ${item.nama_barang}`}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-shadow bg-red-600 border border-transparent text-white hover:shadow-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <polyline points="9 17 4 12 9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>Masuk</span>
                            </button>
                          </div>
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
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setModalData([]);
              setSelectedId(null);
              setModalError(null);
            }}
            className="max-w-3xl p-6"
          >
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{modalTitle}</h3>
              {selectedId && (
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-3">ID: {selectedId}</div>
              )}
              {modalLoading ? (
                <div className="py-8 text-center text-gray-700 dark:text-gray-200">Memuat...</div>
              ) : modalError ? (
                <div className="py-4 text-center text-red-500 dark:text-red-400">{modalError}</div>
              ) : modalData.length === 0 ? (
                <div className="py-4 text-center text-gray-500 dark:text-gray-300">Tidak ada data</div>
              ) : (
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">Total nilai: <span className="font-medium">Rp {formatRupiah(modalSummary.totalValue)}</span></div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/[0.03] max-h-[60vh] overflow-y-auto">
                    {modalType === 'sisa' ? (
                      <table className="w-full text-sm table-auto">
                        <thead>
                          <tr className="text-left text-xs text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.02] border-b">
                            <th className="py-2 px-3">Tanggal Masuk</th>
                            <th className="py-2 px-3">Supplier</th>
                            <th className="py-2 px-3">Qty Masuk (Yard / Rol)</th>
                            <th className="py-2 px-3">Qty Sisa (Yard / Rol)</th>
                            <th className="py-2 px-3">Harga Beli Satuan</th>
                            <th className="py-2 px-3">Nilai Sisa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalData.map((row: any, i: number) => (
                            <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                              <td className="py-3 px-3 text-gray-800 dark:text-white/90">{formatTanggal(row.tgl_transaksi)}</td>
                              <td className="py-3 px-3 text-gray-800 dark:text-white/90">{row.nama_supplier}</td>
                              <td className="py-3 px-3 text-gray-800 dark:text-white/90">
                                {row.orig_yard} yd ({row.orig_rol} rol)
                              </td>
                              <td className="py-3 px-3 text-purple-700 dark:text-purple-300 font-semibold">
                                {row.sisa_yard} yd ({row.sisa_rol} rol)
                              </td>
                              <td className="py-3 px-3 text-gray-800 dark:text-white/90">Rp {formatRupiah(row.harga_satuan)}</td>
                              <td className="py-3 px-3 text-gray-800 dark:text-white/90 font-semibold">Rp {formatRupiah(row.total_nilai_sisa)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-sm table-auto">
                        <thead>
                          <tr className="text-left text-xs text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.02] border-b">
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Tanggal</th>
                            <th className="py-2 px-3">Jml Yard</th>
                            <th className="py-2 px-3">Jml Rol</th>
                            <th className="py-2 px-3">Harga Satuan</th>
                            <th className="py-2 px-3">Total Harga</th>
                            <th className="py-2 px-3">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modalData.map((row: any, i: number) => {
                            const isMasuk = (row.sts_barang || "").toString().toLowerCase().includes("masuk");
                            const isKeluar = (row.sts_barang || "").toString().toLowerCase().includes("keluar");
                            return (
                              <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">
                                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-semibold ${isMasuk ? 'bg-red-100 text-red-800 dark:bg-red-900/30' : ''} ${isKeluar ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : ''}`}>
                                    {isMasuk ? (
                                      <svg className="w-3 h-3 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 12l-7 7-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    ) : (
                                      <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 19V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    )}
                                    <span>{row.sts_barang}</span>
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">{formatTanggal(row.tgl_transaksi)}</td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">{row.jml_yard ?? "-"}</td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">{row.jml_rol ?? "-"}</td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">Rp {formatRupiah(row.harga_satuan)}</td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">Rp {formatRupiah(row.total_harga)}</td>
                                <td className="py-3 px-3 text-gray-800 dark:text-white/90">
                                  {row.id_transaksi ? (
                                    <a
                                      href={isMasuk ? `/detail-masuk/${row.id_transaksi}` : `/detail-keluar/${row.id_transaksi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                    >
                                      <span>Lihat Detail</span>
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                      </svg>
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
          <Modal
            isOpen={photoModalOpen}
            onClose={() => {
              setPhotoModalOpen(false);
              setSelectedBarang(null);
              setSelectedFile(null);
            }}
            className="max-w-2xl p-6"
          >
            <div>
              <div className="flex items-center gap-3 border-b pb-4 mb-4 dark:border-gray-700">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Foto Produk</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kelola dan lihat foto produk barang</p>
                </div>
              </div>

              {selectedBarang && (
                <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">Nama Barang</span>
                    <span className="text-base font-semibold text-gray-800 dark:text-white">{selectedBarang.nama_barang}</span>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Kode Barang</span>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-100/50 dark:border-blue-900/50">
                      {selectedBarang.kd_barang || "-"}
                    </span>
                  </div>
                </div>
              )}
              
              {selectedBarang?.foto ? (
                <div className="mb-6 flex flex-col items-center">
                  <span className="text-xs font-semibold text-gray-500 mb-2 self-start flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Foto Terpasang:
                  </span>
                  <div className="relative group w-full bg-gray-100 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center p-3 shadow-inner">
                    <img
                      src={`${API_BASE}/uploads/${selectedBarang.foto}`}
                      alt={selectedBarang.nama_barang}
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      Swal.fire({
                        title: 'Hapus foto produk?',
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
                          const res = await updateBarang(selectedBarang.id, {
                            nama_barang: selectedBarang.nama_barang,
                            kd_barang: selectedBarang.kd_barang || undefined,
                            hapus_foto: true,
                          });
                          setUploading(false);
                          if (res.status) {
                            setSelectedBarang((prev) => prev ? { ...prev, foto: undefined } : null);
                            // Refresh data
                            const result = await getAllStokBarang(page, filter);
                            if (result.status) {
                              setData(result.data);
                            }
                          }
                        }
                      });
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-semibold transition-colors border border-red-100 dark:border-transparent"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Foto
                  </button>
                </div>
              ) : (
                <div className="mb-6 bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-3 shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Belum Ada Foto Produk</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px]">Silakan pilih file di bawah ini untuk mengunggah foto baru.</p>
                </div>
              )}

              <form onSubmit={handleUploadPhoto} className="space-y-4 border-t pt-5 dark:border-gray-700">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-white flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {selectedBarang?.foto ? "Unggah Foto Baru" : "Pilih File Foto"}
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
                    className="border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 w-full dark:bg-gray-900/60 dark:text-white/90 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 transition-colors focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Format: PNG, JPG, JPEG (Maksimal 5 MB)
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoModalOpen(false);
                      setSelectedBarang(null);
                      setSelectedFile(null);
                    }}
                    className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-500/20 disabled:pointer-events-none flex items-center gap-1.5"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Simpan Foto</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
