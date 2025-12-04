import { toast } from 'react-toastify';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProfileData {
  id: number;
  nama_toko?: string | null;
  alamat?: string | null;
  nomor_telepon_1?: string | null;
  nomor_telepon_2?: string | null;
  nomor_telepon3?: string | null;
  rekening?: string | null;
  nama_rekening?: string | null;
  maps?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function getProfile(): Promise<ProfileData | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data profile.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data.data || null;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat mengambil profile.');
    return null;
  }
}

export async function updateProfile(payload: Partial<ProfileData>): Promise<{ status: boolean; message: string; data?: ProfileData } | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal memperbarui profile.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return data;
    }
    toast.success(data.message || 'Profile berhasil diperbarui.');
    return data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat memperbarui profile.');
    return null;
  }
}
