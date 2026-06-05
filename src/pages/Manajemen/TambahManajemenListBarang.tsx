import React, { useState } from "react";
import { createBarang } from '../../service/barangService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function TambahManajemenListBarang() {
  const [kodeBarang, setKodeBarang] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createBarang({
      kd_barang: kodeBarang || undefined,
      nama_barang: namaBarang,
      foto: foto,
    });
    if (res.status) {
      setNamaBarang("");
      setKodeBarang("");
      setFoto(null);
      // Reset file input
      const fileInput = document.getElementById("foto-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
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
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Foto Produk</label>
              <input
                id="foto-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
                    if (!allowedTypes.includes(file.type)) {
                      toast.error("Format file harus PNG, JPG, atau JPEG.");
                      e.target.value = "";
                      setFoto(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Ukuran file maksimal 5 MB.");
                      e.target.value = "";
                      setFoto(null);
                      return;
                    }
                  }
                  setFoto(file);
                }}
                className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                * Format yang diperbolehkan: PNG, JPG, JPEG (Maksimal 5 MB)
              </p>
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
