import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getUserDetail } from '../../service/userService';
import { updateUser } from '../../service/userService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageBreadcrumb from "../../components/common/PageBreadCrumTreLevel";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";


export default function EditManajemenUser() {
  const { id } = useParams<{ id: string }>();
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [noTelp, setNoTelp] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getUserDetail(Number(id)).then((res) => {
      if (res && res.status && res.user) {
        setNama(res.user.nama || '');
        setUsername(res.user.username || '');
        setPassword(''); // Kosongkan password untuk keamanan
        setNoTelp(res.user.no_tlp || '');
        setJabatan(res.user.jabatan || '');
      }
      setLoading(false);
    });
  }, [id]);

  return (
    <>
      <PageMeta
        title={`Edit User #${id || ''}`}
        description="Form edit user di Zea. Textile"
      />
      <PageBreadcrumb
        pageTitle={`Edit User #${id || ''}`}
        lvl1={{ tittle: "Home", link: "/Home" }}
        lvl2={{ tittle: "Manajemen User", link: "/manajemen-user" }}
      />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover style={{ zIndex: 999999 }} />
      <div className="w-full mt-8">
        <ComponentCard title={`Form Edit User #${id || ''}`}>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              if (!id) return;
              await updateUser(Number(id), {
                username,
                password,
                nama,
                jabatan,
                no_tlp: noTelp,
              });
            }}>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nama</label>
                <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Nomor Telepon</label>
                <input type="text" value={noTelp} onChange={e => setNoTelp(e.target.value.replace(/[^0-9]/g, ""))} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white">Jabatan</label>
                <input type="text" value={jabatan} onChange={e => setJabatan(e.target.value)} className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:text-white/90" required />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Simpan Perubahan</button>
              </div>
            </form>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
