import React, { useEffect, useState } from "react";
import { getAllToko, Toko } from "../../service/tokoService";

const StoreSwitcher: React.FC = () => {
  const [stores, setStores] = useState<Toko[]>([]);
  const [activeTokoId, setActiveTokoId] = useState<string>(
    localStorage.getItem("active_toko_id") || "1"
  );
  const userRole = localStorage.getItem("auth_role") || "ADMIN_TOKO";
  const userJabatan = (localStorage.getItem("auth_jabatan") || "").toLowerCase();
  const isSuperAdminOrOwner =
    userRole === "SUPER_ADMIN" ||
    userJabatan.includes("owner") ||
    userJabatan.includes("pemilik");

  useEffect(() => {
    // Try reading cached stores from login
    const cachedStores = localStorage.getItem("auth_stores");
    if (cachedStores) {
      try {
        setStores(JSON.parse(cachedStores));
      } catch (e) {
        // ignore parse error
      }
    }

    // If super admin/owner, fetch fresh list of active stores
    if (isSuperAdminOrOwner) {
      getAllToko().then((res) => {
        if (res.status && res.data) {
          setStores(res.data);
          localStorage.setItem("auth_stores", JSON.stringify(res.data));
        }
      });
    }
  }, [isSuperAdminOrOwner]);

  const handleSelectStore = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedStore = stores.find((s) => String(s.id) === selectedId);
    
    setActiveTokoId(selectedId);
    localStorage.setItem("active_toko_id", selectedId);
    if (selectedStore?.nama_toko) {
      localStorage.setItem("active_toko_nama", selectedStore.nama_toko);
    }
    
    // Refresh page to apply new store context across all modules
    window.location.reload();
  };

  // If user is only assigned to 1 store and not super admin, render a simple badge
  if (!isSuperAdminOrOwner && stores.length <= 1) {
    const activeNama = localStorage.getItem("active_toko_nama") || "Zea Textile Pusat";
    return (
      <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800">
        <span className="w-2 h-2 mr-2 bg-blue-500 rounded-full animate-pulse"></span>
        {activeNama}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <select
          value={activeTokoId}
          onChange={handleSelectStore}
          className="appearance-none font-medium text-xs bg-gray-50 border border-gray-300 text-gray-800 rounded-lg px-3 py-1.5 pr-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer transition-colors"
        >
          {stores.map((toko) => (
            <option key={toko.id} value={toko.id}>
              🏪 {toko.nama_toko} {toko.id === 1 ? "(Pusat)" : ""}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StoreSwitcher;
