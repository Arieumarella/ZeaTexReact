import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import { getDetailOprasional, editOprasional } from "../../service/oprasionalServices";
import { toast } from "react-toastify";
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

// Ambil ID dari URL
// const { id } = useParams();


export default function EditBiaya() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [namaBiaya, setNamaBiaya] = useState("");
  const [jumlahUang, setJumlahUang] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      try {
        const detail = await getDetailOprasional(Number(id));
        if (detail) {
          setNamaBiaya(detail.nama_baya || "");
          setJumlahUang(detail.jml_biaya || "");
        }
      } catch (err) {
        // toast error sudah dihandle di service
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    try {
      const res = await editOprasional(Number(id), {
        nama_baya: namaBiaya,
        jml_biaya: jumlahUang,
      });
      if (res.status) {
       
        
      }
    } catch (err) {
      // toast error sudah dihandle di service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Edit Biaya Oprasional"
        description="Form edit biaya oprasional di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle="Edit Biaya Oprasional"
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Biaya Oprasional", link: "/biaya-operasional" }}
      />
      <div className="w-full mt-8">
        <ComponentCard title="Form Edit Biaya Oprasional">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama Biaya</label>
              <input type="text" value={namaBiaya} onChange={e => setNamaBiaya(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required disabled={loading} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Jumlah Uang</label>
              <input type="number" min="0" value={jumlahUang} onChange={e => setJumlahUang(e.target.value.replace(/^0+/, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required disabled={loading} />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
          </form>
        </ComponentCard>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
    </>
  );
}
