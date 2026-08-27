import React, { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { createUser } from '../../service/userService';
import { getAllToko, Toko } from '../../service/tokoService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TambahManajemenUser() {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [jabatan, setJabatan] = useState("Kasir / Staff Admin");
  const [idToko, setIdToko] = useState<number>(
    Number(localStorage.getItem("active_toko_id")) || 1
  );
  const [role, setRole] = useState<string>("ADMIN_TOKO");
  const [stores, setStores] = useState<Toko[]>([]);

  const userRole = localStorage.getItem("auth_role") || "ADMIN_TOKO";
  const userJabatan = (localStorage.getItem("auth_jabatan") || "").toLowerCase();
  const isSuperAdmin =
    userRole === "SUPER_ADMIN" ||
    userJabatan.includes("owner") ||
    userJabatan.includes("pemilik");

  useEffect(() => {
    getAllToko().then((res) => {
      if (res.status && res.data) {
        setStores(res.data);
      }
    });
  }, []);

  return (
    <>
      <PageMeta
        title="Tambah User"
        description="Form tambah user di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah User"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen User", link: "/manajemen-user" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah User">
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            await createUser({
              username,
              password,
              nama,
              jabatan,
              no_tlp: noTelp,
              id_toko: Number(idToko),
              role,
            });
          }}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nomor Telepon</label>
              <input type="text" value={noTelp} onChange={e => setNoTelp(e.target.value.replace(/[^0-9]/g, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                Jabatan {!isSuperAdmin && <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(Hanya Super Admin yang dapat mengubah)</span>}
              </label>
              <input
                type="text"
                value={jabatan}
                disabled={!isSuperAdmin}
                onChange={e => setJabatan(e.target.value)}
                className={`border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 ${!isSuperAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800' : ''}`}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                Pilih Toko / Cabang Tugas {!isSuperAdmin && <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(Hanya Super Admin yang dapat mengubah)</span>}
              </label>
              <select
                value={idToko}
                disabled={!isSuperAdmin}
                onChange={(e) => setIdToko(Number(e.target.value))}
                className={`border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 ${!isSuperAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800' : ''}`}
              >
                {stores.map((toko) => (
                  <option key={toko.id} value={toko.id}>
                    {toko.nama_toko} {toko.id === 1 ? "(Pusat)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                Role Hak Akses {!isSuperAdmin && <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-2">(Hanya Super Admin yang dapat mengubah)</span>}
              </label>
              <select
                value={role}
                disabled={!isSuperAdmin}
                onChange={(e) => setRole(e.target.value)}
                className={`border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 ${!isSuperAdmin ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800' : ''}`}
              >
                <option value="ADMIN_TOKO">ADMIN TOKO (Hanya akses toko yang ditugaskan)</option>
                <option value="SUPER_ADMIN">SUPER ADMIN / OWNER (Akses & switch ke semua toko)</option>
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan</button>
            </div>
          </form>
        </ComponentCard>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
    </div>
    </>
  );
}


