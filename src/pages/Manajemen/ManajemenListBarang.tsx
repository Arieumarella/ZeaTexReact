import React, { useState } from "react";
import { useEffect } from "react";
import { getBarang, deleteBarang, updateBarang, Barang } from '../../service/barangService';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
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
import { Modal } from "../../components/ui/modal";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ManajemenListBarang() {
  const navigate = useNavigate();
  const [data, setData] = useState<Barang[]>([]);
  const [search, setSearch] = useState(() => sessionStorage.getItem("manajemen_listbarang_search") || "");
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("manajemen_listbarang_page");
    return saved ? parseInt(saved, 10) || 1 : 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  // State untuk quick photo upload
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
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
      getBarang(page, search).then(res => {
        if (res && res.status && res.data) {
          setData(res.data);
        }
      });
    }
  };

  // Persist filter di sessionStorage
  useEffect(() => {
    if (search) sessionStorage.setItem("manajemen_listbarang_search", search);
    else sessionStorage.removeItem("manajemen_listbarang_search");
    sessionStorage.setItem("manajemen_listbarang_page", String(page));
  }, [search, page]);

  useEffect(() => {
    getBarang(page, search).then(res => {
      if (res && res.status && res.data) {
        setData(res.data);
        const tp = res.totalPages || 1;
        setTotalPages(tp);
        if (page > tp && tp >= 1) {
          setPage(1);
        }
      } else {
        setData([]);
        setTotalPages(1);
      }
    });
  }, [page, search]);

  // Filter data by nama_barang
  const filteredData = data.filter(barang => barang.nama_barang.toLowerCase().includes(search.toLowerCase()));

  // Hapus handler
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus barang?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteBarang(id);
        if (res.status) {
          // Refresh data
          getBarang(page, search).then(res => {
            if (res && res.status && res.data) {
              setData(res.data);
              const tp = res.totalPages || 1;
              setTotalPages(tp);
              if (page > tp && tp >= 1) {
                setPage(1);
              }
            } else {
              setData([]);
              setTotalPages(1);
            }
          });
        }
      }
    });
  };

  return (
    <>
      <PageMeta
        title="Manajemen List Barang"
        description="Tabel manajemen list barang di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Manajemen List Barang" />
      <div className="space-y-6">
        <ComponentCard title="Daftar List Barang">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border rounded px-3 py-2 w-full md:w-64 dark:bg-gray-900 dark:text-white/90"
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/tambah-manajemen-list-barang')}
            >
              + Tambah Barang
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Nama Barang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Kode Barang</TableCell>
                    <TableCell isHeader className="w-48 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-4">
                        <td colSpan={4} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * rowsPerPage + idx + 1}</TableCell>
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
                            <span className="font-medium text-start">{item.nama_barang}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.kd_barang}</TableCell>
                        <TableCell className="w-48 px-2 py-2 border text-center">
                          <button className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded mr-1 hover:bg-yellow-600" onClick={() => navigate(`/edit-manajemen-list-barang/${item.id}`)}>Edit</button>
                          <button className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleDelete(item.id)}>Hapus</button>
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
                            getBarang(page, search).then(res2 => {
                              if (res2 && res2.status && res2.data) {
                                setData(res2.data);
                              }
                            });
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
