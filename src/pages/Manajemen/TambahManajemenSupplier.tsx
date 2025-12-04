import React, { useState } from "react";
import { createSupplier } from '../../service/supplierService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function TambahManajemenSupplier() {
  const [nama, setNama] = useState("");
  const [noTelp, setNoTelp] = useState("");

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createSupplier({ nama, no_tlp: noTelp });
    if (res.status) {
      setNama("");
      setNoTelp("");
    }
  };
  return (
    <>
      <PageMeta
        title="Tambah Supplier"
        description="Form tambah supplier di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Tambah Supplier"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen Supplier", link: "/manajemen-supplier" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Tambah Supplier">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nomor Telepon</label>
              <input type="text" value={noTelp} onChange={e => setNoTelp(e.target.value.replace(/[^0-9]/g, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
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
