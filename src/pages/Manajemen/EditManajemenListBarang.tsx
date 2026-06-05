import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { getDetailBarang, updateBarang } from '../../service/barangService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function EditManajemenListBarang() {
  const { id } = useParams();
  const [namaBarang, setNamaBarang] = useState("");
  const [kodeBarang, setKodeBarang] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [currentFoto, setCurrentFoto] = useState<string | null>(null);
  const [hapusFoto, setHapusFoto] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDetailBarang(Number(id)).then(res => {
      if (res.status && res.data) {
        setNamaBarang(res.data.nama_barang);
        setKodeBarang(res.data.kd_barang ?? "");
        setCurrentFoto(res.data.foto ?? null);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const res = await updateBarang(Number(id), {
      kd_barang: kodeBarang || undefined,
      nama_barang: namaBarang,
      foto: foto,
      hapus_foto: hapusFoto,
    });
    if (res.status) {
      // Refresh detail data
      getDetailBarang(Number(id)).then(res2 => {
        if (res2.status && res2.data) {
          setCurrentFoto(res2.data.foto ?? null);
          setFoto(null);
          setHapusFoto(false);
          const fileInput = document.getElementById("foto-input") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        }
      });
    }
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
              <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white mt-4">Nama Barang</label>
                    <input type="text" value={namaBarang} onChange={e => setNamaBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Kode Barang</label>
                    <input type="text" value={kodeBarang} onChange={e => setKodeBarang(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Foto Produk</label>
                    {currentFoto && !hapusFoto ? (
                      <div className="mb-2 flex items-center gap-3">
                        <img
                          src={`${API_BASE}/uploads/${currentFoto}`}
                          alt="Foto Produk"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setHapusFoto(true)}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium dark:bg-red-900/30 dark:text-red-400"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {hapusFoto ? "Foto ditandai untuk dihapus" : "Belum ada foto produk"}
                      </div>
                    )}
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
                        if (hapusFoto) setHapusFoto(false);
                      }}
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      * Format yang diperbolehkan: PNG, JPG, JPEG (Maksimal 5 MB)
                    </p>
                  </div>
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
