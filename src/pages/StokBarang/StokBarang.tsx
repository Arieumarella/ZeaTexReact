import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
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
import { getAllStokBarang, getDetilKeluar, getDetilMasuk, type StokBarang } from "../../service/stokBarangService";

export default function StokBarang() {
  // State untuk data, loading, dan pagination
  const [data, setData] = useState<StokBarang[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state for detail masuk/keluar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<Array<any>>([]);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('Detail Barang Masuk/Keluar');

  const modalSummary = useMemo(() => {
    const summary = { masukCount: 0, keluarCount: 0, totalValue: 0 };
    modalData.forEach((r: any) => {
      const status = (r.sts_barang || "").toString().toLowerCase();
      if (status.includes("masuk")) summary.masukCount += 1;
      if (status.includes("keluar")) summary.keluarCount += 1;
      summary.totalValue += Number(r.total_harga || 0);
    });
    return summary;
  }, [modalData]);

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

  // Fetch data dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getAllStokBarang(page, filter);

      if (result.status) {
        setData(result.data);
        setTotalPages(result.totalPages);
      }
      setLoading(false);
    };
    fetchData();
  }, [page, filter]);

  // Fungsi export Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map((item, idx) => ({
      No: (page - 1) * 10 + idx + 1,
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
                          <div className="truncate">
                            <div className="font-medium">{item.nama_barang}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Kode Barang: {item.kd_barang}</div>
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
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
                  onClick={() => setPage(i + 1)}
                  disabled={page === i + 1}
                >
                  {i + 1}
                </button>
              ))}
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
                    <table className="w-full text-sm table-auto">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.02] border-b">
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3">Jml Yard</th>
                          <th className="py-2 px-3">Jml Rol</th>
                          <th className="py-2 px-3">Harga Satuan</th>
                          <th className="py-2 px-3">Total Harga</th>
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
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </ComponentCard>
      </div>
    </>
  );
}
