import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { getLogs, LogItem } from "../../service/logService";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function LogAktivitas() {

  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const fetchLogsData = (p: number, s: string) => {
    setLoading(true);
    getLogs(p, s)
      .then((res) => {
        if (res && res.status) {
          setLogs(res.data);
          setTotalPages(res.totalPages || 1);
        } else {
          setLogs([]);
          setTotalPages(1);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogsData(page, search);
  }, [page, search]);

  const getAksiBadge = (aksi: string) => {
    const act = (aksi || "").toUpperCase();
    if (act.includes("LOGIN")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {aksi}
        </span>
      );
    }
    if (act.includes("TAMBAH") || act.includes("TRANSAKSI")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          {aksi}
        </span>
      );
    }
    if (act.includes("EDIT") || act.includes("UBAH")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {aksi}
        </span>
      );
    }
    if (act.includes("HAPUS") || act.includes("RETUR")) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {aksi}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {aksi}
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Log Aktivitas - Zea Textile POS"
        description="Riwayat audit log aktivitas sistem dan pengguna"
      />
      <PageBreadcrumb pageTitle="Log Aktivitas Audit System" />

      <div className="space-y-6">
        <ComponentCard title="Riwayat Audit Log Aktivitas">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pantau seluruh rekam jejak aktivitas user, login, dan transaksi di semua cabang toko.
            </p>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari aksi / keterangan..."
                className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Waktu & Tanggal</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Pengguna (User)</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Toko Cabang</TableCell>
                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Tipe Aksi</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-left text-theme-xs dark:text-gray-400">Keterangan Detail</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-6 dark:text-gray-400">
                        <td colSpan={6} className="text-center py-4 dark:text-gray-400">Memuat data log...</td>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-6 dark:text-gray-400">
                        <td colSpan={6} className="text-center py-4 dark:text-gray-400">Belum ada riwayat aktivitas</td>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-3 py-2.5 border text-center text-gray-800 dark:text-white/90 text-xs">
                          {idx + 1 + (page - 1) * 15}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 border text-center text-gray-800 dark:text-white/90 text-xs font-mono whitespace-nowrap">
                          {formatDateTime(item.created_at)}
                        </TableCell>

                        <TableCell className="px-4 py-2.5 border text-center text-gray-900 dark:text-white font-medium text-xs">
                          {item.nama_user}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 border text-center text-blue-600 dark:text-blue-400 font-semibold text-xs whitespace-nowrap">
                          {item.nama_toko}
                        </TableCell>
                        <TableCell className="px-4 py-2.5 border text-center text-xs">
                          {getAksiBadge(item.aksi)}
                        </TableCell>
                        <TableCell className="px-5 py-2.5 border text-left text-gray-700 dark:text-gray-300 text-xs">
                          {item.keterangan || "-"}
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
              <span className="text-xs text-gray-600 dark:text-gray-400">Halaman:</span>
              <button
                className="px-3 py-1 border rounded text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="px-3 py-1 border rounded text-xs bg-blue-500 text-white font-semibold">
                {page} / {totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
