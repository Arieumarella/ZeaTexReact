import React, { useState } from "react";
import { useEffect } from "react";
import * as XLSX from "xlsx";
import { getOprasional, deleteOprasional, Oprasional } from '../../service/oprasionalServices';
import { ToastContainer } from 'react-toastify';
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

export default function BiayaOprasional() {
  const navigate = useNavigate();
  const [data, setData] = useState<Oprasional[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [tanggalStart, setTanggalStart] = useState(() => sessionStorage.getItem("biaya_oprasional_tglAwal") || "");
  const [tanggalEnd, setTanggalEnd] = useState(() => sessionStorage.getItem("biaya_oprasional_tglAkhir") || "");
  const [search, setSearch] = useState(() => sessionStorage.getItem("biaya_oprasional_search") || "");
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("biaya_oprasional_page");
    return saved ? parseInt(saved, 10) || 1 : 1;
  });
  const rowsPerPage = 10;

  // Persist filter di sessionStorage
  useEffect(() => {
    if (search) sessionStorage.setItem("biaya_oprasional_search", search);
    else sessionStorage.removeItem("biaya_oprasional_search");
    if (tanggalStart) sessionStorage.setItem("biaya_oprasional_tglAwal", tanggalStart);
    else sessionStorage.removeItem("biaya_oprasional_tglAwal");
    if (tanggalEnd) sessionStorage.setItem("biaya_oprasional_tglAkhir", tanggalEnd);
    else sessionStorage.removeItem("biaya_oprasional_tglAkhir");
    sessionStorage.setItem("biaya_oprasional_page", String(page));
  }, [search, tanggalStart, tanggalEnd, page]);

  // Filter tanggal rentang
  useEffect(() => {
    setLoading(true);
    getOprasional(page, search).then(res => {
      if (res && res.status && res.data) {
        let filtered = res.data;
        // Filter tanggal
        if (tanggalStart || tanggalEnd) {
          filtered = filtered.filter(item => {
            const tgl = (item.tanggal || item.created_at).slice(0, 10);
            if (tanggalStart && tanggalEnd) {
              return tgl >= tanggalStart && tgl <= tanggalEnd;
            } else if (tanggalStart) {
              return tgl >= tanggalStart;
            } else if (tanggalEnd) {
              return tgl <= tanggalEnd;
            }
            return true;
          });
        }
        setData(filtered);
        const tp = res.totalPages || 1;
        setTotalPages(tp);
        if (page > tp && tp >= 1) {
          setPage(1);
        }
      } else {
        setData([]);
        setTotalPages(1);
      }
      setLoading(false);
    });
  }, [page, search, tanggalStart, tanggalEnd]);

  // Hapus handler
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus data oprasional?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await deleteOprasional(id);
        if (res.status) {
          // Refresh data
          setLoading(true);
          getOprasional(page).then(res => {
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
            setLoading(false);
          });
        }
      }
    });
  };

  const handleExportExcel = async () => {
    try {
      const res = await getOprasional(1, search, true);
      if (res && res.status && res.data) {
        let exportData = res.data;
        if (tanggalStart || tanggalEnd) {
          exportData = exportData.filter(item => {
            const tgl = (item.tanggal || item.created_at).slice(0, 10);
            if (tanggalStart && tanggalEnd) {
              return tgl >= tanggalStart && tgl <= tanggalEnd;
            } else if (tanggalStart) {
              return tgl >= tanggalStart;
            } else if (tanggalEnd) {
              return tgl <= tanggalEnd;
            }
            return true;
          });
        }
        const ws = XLSX.utils.json_to_sheet(exportData.map((item, idx) => ({
          No: idx + 1,
          "Nama Biaya": item.nama_baya,
          "Jumlah Uang": Number(item.jml_biaya),
          "Tanggal": item.tanggal ? item.tanggal.slice(0, 10) : item.created_at.slice(0, 10),
          "Penginput": item.penginput?.username || item.username || (item.user && item.user.username) || '-'
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "BiayaOperasional");
        XLSX.writeFile(wb, "biaya-operasional.xlsx");
      }
    } catch (err) {
      console.error("Gagal export excel:", err);
    }
  };

  return (
    <>
      <PageMeta
        title="Biaya Oprasional"
        description="Tabel biaya oprasional di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Biaya Oprasional" />
      <div className="space-y-6">
        <ComponentCard title="Daftar Biaya Oprasional">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
            <input
              type="text"
              placeholder="Cari nama biaya..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border rounded px-3 py-2 w-full md:w-64 dark:bg-gray-900 dark:text-white/90"
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/tambah-biaya')}
            >
              + Tambah Biaya
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
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Nama Biaya</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Jumlah Uang</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Tanggal</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Penginput</TableCell>
                    <TableCell isHeader className="w-48 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-4">
                        <td colSpan={5} className="text-center py-4 dark:text-gray-400">Loading...</td>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-4">
                        <td colSpan={5} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.nama_baya}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">Rp {Number(item.jml_biaya).toLocaleString()}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">
                          {item.tanggal ? item.tanggal.slice(0, 10) : item.created_at.slice(0, 10)}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.penginput?.username || item.username || (item.user && item.user.username) || '-'}</TableCell>
                        <TableCell className="w-48 px-2 py-2 border text-center">
                          <button className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded mr-1 hover:bg-yellow-600" onClick={() => navigate(`/edit-biaya/${item.id}`)}>Edit</button>
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
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
