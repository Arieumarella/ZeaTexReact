import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getDetailBarang, updateBarang } from '../../service/barangService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";


export default function EditManajemenListBarang() {
  const { id } = useParams();
  const [namaBarang, setNamaBarang] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDetailBarang(Number(id)).then(res => {
      if (res.status && res.data) {
        setNamaBarang(res.data.nama_barang);
        setKodeBarang(res.data.kd_barang ?? "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await updateBarang(Number(id), { kd_barang: kodeBarang || undefined, nama_barang: namaBarang });
  };

  return (
    <>
      <PageMeta
        title="Edit List Barang"
        description="Form edit list barang di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Edit List Barang"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen List Barang", link: "/manajemen-list-barang" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Edit List Barang">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            ) : (
              <div>
                 
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white mt-4">Nama Barang</label>
                  <input type="text" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Kode Barang</label>
                  <input type="text" value={kodeBarang} onChange={e => setKodeBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" />
              </div>
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
