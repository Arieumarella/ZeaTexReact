import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getDetailPelanggan, updatePelanggan } from '../../service/pelangganService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

export default function EditManajemenPelanggan() {
  const { id } = useParams<{ id: string }>();
  const [nama, setNama] = useState("");
  const [noWhatsapp, setNoWhatsapp] = useState("");
  const [npwp, setNpwp] = useState("");
  const [email, setEmail] = useState("");
  const [alamat, setAlamat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getDetailPelanggan(Number(id)).then(res => {
      if (res && res.status && res.pelanggan) {
        setNama(res.pelanggan.nama || "");
        setNoWhatsapp(res.pelanggan.noWhatsapp || "");
        setNpwp(res.pelanggan.npwp || "");
        setEmail(res.pelanggan.email || "");
        setAlamat(res.pelanggan.alamat || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await updatePelanggan(Number(id), {
      nama,
      no_tlp: noWhatsapp,
      npwp: npwp || undefined,
      email: email || undefined,
      alamat: alamat || undefined,
    });
  };

  return (
    <>
      <PageMeta
        title="Edit Pelanggan"
        description="Form edit pelanggan di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Edit Pelanggan"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen Pelanggan", link: "/manajemen-pelanggan" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Edit Pelanggan">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                      Nama Pelanggan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={e => setNama(e.target.value)}
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={noWhatsapp}
                      onChange={e => setNoWhatsapp(e.target.value.replace(/[^0-9]/g, ""))}
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                      NPWP (Opsional)
                    </label>
                    <input
                      type="text"
                      value={npwp}
                      onChange={e => setNpwp(e.target.value)}
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                      placeholder="Contoh: 1000000010816967"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                      placeholder="Contoh: pelanggan@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">
                    Alamat (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={alamat}
                    onChange={e => setAlamat(e.target.value)}
                    className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90"
                    placeholder="Alamat lengkap pelanggan..."
                  />
                </div>
              </>
            )}
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition">
                Simpan Perubahan
              </button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
