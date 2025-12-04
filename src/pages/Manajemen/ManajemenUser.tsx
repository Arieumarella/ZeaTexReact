import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router-dom";
import { getUsers, User } from '../../service/userService';
import { deleteUser } from '../../service/userService';
import Swal from 'sweetalert2';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

export default function ManajemenUser() {
  const navigate = useNavigate();
  const [data, setData] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUsers(page)
      .then((res) => {
        if (res && res.status) {
          setData(res.data);
          setTotalPages(res.totalPages || 1);
          setError(null);
        } else {
          setData([]);
          setTotalPages(1);
          setError('Gagal mengambil data user');
          toast.error('Gagal mengambil data user');
        }
      })
      .catch(() => {
        setError('Gagal mengambil data user');
        setData([]);
        setTotalPages(1);
        toast.error('Gagal mengambil data user');
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <PageMeta
        title="Manajemen User"
        description="Tabel manajemen user di Zea. Textile"
      />
      <PageBreadcrumb pageTitle="Manajemen User" />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover  style={{ zIndex: 999999 }}/>
      <div className="space-y-6">
        <ComponentCard title="Daftar User">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => navigate('/tambah-manajemen-user')}
            >
              + Tambah User
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="w-12 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">No</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Nama</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Username</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Nomor Telepon</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Jabatan</TableCell>
                    <TableCell isHeader className="w-48 px-2 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell className="text-center py-4 dark:text-gray-400">
                        <td colSpan={6} className="text-center py-4 dark:text-gray-400">Loading...</td>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell className="text-center py-4 dark:text-gray-400">
                        <td colSpan={6} className="text-center py-4 dark:text-gray-400">{error}</td>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center py-4 dark:text-gray-400">
                        <td colSpan={6} className="text-center py-4 dark:text-gray-400">Data tidak ditemukan</td>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item, idx) => (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.04]">
                        <TableCell className="w-12 px-2 py-2 border text-center text-gray-800 dark:text-white/90">{idx + 1 + (page - 1) * (data.length)}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.nama}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.username}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.no_tlp}</TableCell>
                        <TableCell className="px-4 py-2 border text-center text-gray-800 dark:text-white/90">{item.jabatan}</TableCell>
                        <TableCell className="w-48 px-2 py-2 border text-center">
                          <button className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded mr-1 hover:bg-yellow-600"  onClick={() => navigate(`/edit-manajemen-user/${item.id}`)}>Edit</button>
                          <button
                            className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: 'Yakin hapus user?',
                                text: 'Data user yang dihapus tidak dapat dikembalikan!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#d33',
                                cancelButtonColor: '#3085d6',
                                confirmButtonText: 'Ya, hapus!',
                                cancelButtonText: 'Batal',
                              });
                              if (result.isConfirmed) {
                                const res = await deleteUser(item.id);
                                if (res.status) {
                                  // Refresh data setelah hapus
                                  setLoading(true);
                                  getUsers(page).then((r) => {
                                    if (r && r.status) {
                                      setData(r.data);
                                      setTotalPages(r.totalPages || 1);
                                      setError(null);
                                    } else {
                                      setData([]);
                                      setTotalPages(1);
                                      setError('Gagal mengambil data user');
                                    }
                                  }).finally(() => setLoading(false));
                                }
                              }
                            }}
                          >Hapus</button>
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
        </ComponentCard>
      </div>
    </>
  );
}
