import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getDetailSupplier, updateSupplier } from '../../service/supplierService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";


export default function EditManajemenSupplier() {
  const { id } = useParams();
  const [nama, setNama] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDetailSupplier(Number(id)).then(res => {
      if (res.status && res.data) {
        setNama(res.data.nama);
        setNoTelp(res.data.no_tlp || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await updateSupplier(Number(id), { nama, no_tlp: noTelp });
  };

  return (
    <>
      <PageMeta
        title="Edit Supplier"
        description="Form edit supplier di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Edit Supplier"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen Supplier", link: "/manajemen-supplier" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Edit Supplier">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            ) : (
              <>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama</label>
                  <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nomor Telepon</label>
                  <input type="text" value={noTelp} onChange={e => setNoTelp(e.target.value.replace(/[^0-9]/g, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
                </div>
              </>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan Perubahan</button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
