import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { createPelanggan } from '../../service/pelangganService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function TambahManajemenPelanggan() {
  const [nama, setNama] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");

  return (
    <>
      <PageMeta
        title="Tambah Pelanggan"
        description="Form tambah pelanggan di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah Pelanggan"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen Pelanggan", link: "/manajemen-pelanggan" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah Pelanggan">
          <form className="space-y-6" onSubmit={async (e) => {
            e.preventDefault();
            await createPelanggan({
              nama,
              no_tlp: noWhatsapp,
            });
          }}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nomor Whatsapp</label>
              <input type="text" value={noWhatsapp} onChange={e => setNoWhatsapp(e.target.value.replace(/[^0-9]/g, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
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
