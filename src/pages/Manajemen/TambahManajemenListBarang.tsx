import React, { useState } from "react";
import { createBarang } from '../../service/barangService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function TambahManajemenListBarang() {
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createBarang({ kd_barang: kodeBarang || undefined, nama_barang: namaBarang });
    if (res.status) {
      setNamaBarang("");
      setKodeBarang("");
    }
  };
  return (
    <>
      <PageMeta
        title="Tambah List Barang"
        description="Form tambah list barang di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah List Barang"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen List Barang", link: "/manajemen-list-barang" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah List Barang">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama Barang</label>
              <input type="text" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Kode Barang</label>
              <input type="text" value={kodeBarang} onChange={e => setKodeBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan</button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
