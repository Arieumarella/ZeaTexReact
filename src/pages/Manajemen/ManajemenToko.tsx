import React, { useEffect, useState } from "react";
import { getAllToko, createToko, updateToko, Toko } from "../../service/tokoService";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "react-toastify";



export default function ManajemenToko() {
  const [stores, setStores] = useState<Toko[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingToko, setEditingToko] = useState<Toko | null>(null);

  const [formData, setFormData] = useState({
    nama_toko: "",
    alamat: "",
    nomor_telepon_1: "",
    nomor_telepon_2: "",
    rekening: "",
    nama_rekening: "",
    maps: "",
    saldo_awal: 0,
  });

  const fetchStores = async () => {
    setLoading(true);
    const res = await getAllToko();
    if (res.status && res.data) {
      setStores(res.data);
    } else {
      toast.error(res.message || "Gagal memuat daftar toko");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const userRole = localStorage.getItem("auth_role") || "ADMIN_TOKO";
  const userJabatan = (localStorage.getItem("auth_jabatan") || "").toLowerCase();
  const isSuperAdmin =
    userRole === "SUPER_ADMIN" ||
    userJabatan.includes("owner") ||
    userJabatan.includes("pemilik");

  const handleOpenAddModal = () => {
    if (!isSuperAdmin) {
      toast.error("Hanya Super Admin yang berhak menambah cabang toko baru");
      return;
    }
    setEditingToko(null);
    setFormData({
      nama_toko: "",
      alamat: "",
      nomor_telepon_1: "",
      nomor_telepon_2: "",
      rekening: "",
      nama_rekening: "",
      maps: "",
      saldo_awal: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (toko: Toko) => {
    if (!isSuperAdmin) {
      toast.error("Hanya Super Admin yang berhak merubah profil toko");
      return;
    }
    setEditingToko(toko);
    setFormData({
      nama_toko: toko.nama_toko || "",
      alamat: toko.alamat || "",
      nomor_telepon_1: toko.nomor_telepon_1 || "",
      nomor_telepon_2: toko.nomor_telepon_2 || "",
      rekening: toko.rekening || "",
      nama_rekening: toko.nama_rekening || "",
      maps: toko.maps || "",
      saldo_awal: 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Hanya Super Admin yang berhak mengubah data toko");
      return;
    }
    if (!formData.nama_toko.trim()) {
      toast.error("Nama toko wajib diisi");
      return;
    }

    if (editingToko) {
      const res = await updateToko(editingToko.id, formData);
      if (res.status) {
        toast.success("Profil toko berhasil diperbarui!");
        setIsModalOpen(false);
        fetchStores();
      } else {
        toast.error(res.message || "Gagal memperbarui toko");
      }
    } else {
      const res = await createToko(formData);
      if (res.status) {
        toast.success("Toko baru berhasil ditambahkan!");
        setIsModalOpen(false);
        fetchStores();
      } else {
        toast.error(res.message || "Gagal menambah toko baru");
      }
    }
  };

  const activeStoreId = localStorage.getItem("active_toko_id") || "1";

  return (
    <>
      <PageMeta
        title="Manajemen Toko - Zea Textile POS"
        description="Kelola toko, tambah cabang baru, dan konfigurasi multi-tenant POS."
      />
      <PageBreadcrumb pageTitle="Manajemen Toko" />


      <div className="space-y-6">
        <ComponentCard title="Daftar Toko / Cabang Zea Textile">
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola seluruh cabang toko Zea Textile. Tambahkan cabang baru dengan data & stok terisolasi.
            </p>
            {isSuperAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-1.5"
              >
                <span>+</span> Tambah Toko Baru
              </button>
            ) : (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                🔒 Hanya Super Admin yang berhak menambah/mengubah toko
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Memuat data toko...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nama Toko</th>
                    <th className="py-3 px-4">Alamat</th>
                    <th className="py-3 px-4">No. Telepon</th>
                    <th className="py-3 px-4">Rekening</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-800">
                  {stores.map((toko) => {
                    const isActive = String(toko.id) === activeStoreId;
                    return (
                      <tr
                        key={toko.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                          isActive ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold">#{toko.id}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                          {toko.nama_toko} {toko.id === 1 ? "(Pusat)" : ""}
                          {isActive && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Aktif Sekarang
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {toko.alamat || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {toko.nomor_telepon_1 || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {toko.rekening ? `${toko.rekening} (${toko.nama_rekening})` : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Aktif
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSuperAdmin ? (
                            <button
                              onClick={() => handleOpenEditModal(toko)}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium transition"
                            >
                              Edit
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Read-only</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </ComponentCard>
      </div>

      {/* Modal Form Tambah / Edit Toko */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-800 my-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {editingToko ? `Edit Toko: ${editingToko.nama_toko}` : "Tambah Toko Baru"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nama Toko *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_toko}
                  onChange={(e) => setFormData({ ...formData, nama_toko: e.target.value })}
                  placeholder="Contoh: Zea Textile Cabang Bandung"
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={2}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Alamat toko..."
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No. Telepon 1
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_telepon_1}
                    onChange={(e) => setFormData({ ...formData, nomor_telepon_1: e.target.value })}
                    placeholder="0812xxxx"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No. Telepon 2
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_telepon_2}
                    onChange={(e) => setFormData({ ...formData, nomor_telepon_2: e.target.value })}
                    placeholder="0813xxxx"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No. Rekening
                  </label>
                  <input
                    type="text"
                    value={formData.rekening}
                    onChange={(e) => setFormData({ ...formData, rekening: e.target.value })}
                    placeholder="BCA 12345678"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    value={formData.nama_rekening}
                    onChange={(e) => setFormData({ ...formData, nama_rekening: e.target.value })}
                    placeholder="a.n Zea Textile"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              {!editingToko && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Saldo Kas Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.saldo_awal}
                    onChange={(e) => setFormData({ ...formData, saldo_awal: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={formData.maps}
                  onChange={(e) => setFormData({ ...formData, maps: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                >
                  {editingToko ? "Simpan Perubahan" : "Buat Toko Baru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
