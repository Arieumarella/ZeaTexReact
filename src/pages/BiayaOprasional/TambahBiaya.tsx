import React, { useState } from "react";
import { createOprasional } from '../../service/oprasionalServices';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function TambahBiaya() {
  const [namaBiaya, setNamaBiaya] = useState("");
  const [jumlahUang, setJumlahUang] = useState("");
  // Penginput diambil dari user login, tidak perlu input di form

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createOprasional({ nama_baya: namaBiaya, jml_biaya: jumlahUang });
    if (res.status) {
      setNamaBiaya("");
      setJumlahUang("");
    }
  };
  return (
    <>
      <PageMeta
        title="Tambah Biaya Oprasional"
        description="Form tambah biaya oprasional di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah Biaya Oprasional"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Biaya Oprasional", link: "/biaya-operasional" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah Biaya Oprasional">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama Biaya</label>
              <input type="text" value={namaBiaya} onChange={e => setNamaBiaya(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Jumlah Uang</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={jumlahUang}
                onChange={e => setJumlahUang(e.target.value.replace(/[^0-9]/g, ""))}
                className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                required
              />
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
