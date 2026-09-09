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
  const [npwp, setNpwp] = useState("");
  const [email, setEmail] = useState("");
  const [alamat, setAlamat] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createPelanggan({
      nama,
      no_tlp: noWhatsapp,
      npwp: npwp || undefined,
      email: email || undefined,
      alamat: alamat || undefined,
    });
    if (res && res.status) {
      setNama("");
      setNoWhatsapp("");
      setNpwp("");
      setEmail("");
      setAlamat("");
    }
  };

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
          <form className="space-y-5" onSubmit={handleSubmit}>
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
                  placeholder="Nama pelanggan"
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
                  placeholder="08xxxxxxxxxx"
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
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded transition">
                Simpan
              </button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
        </ComponentCard>
      </div>
    </>
  );
}
