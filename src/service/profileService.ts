import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

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
  try {
    const res = await fetch(API_BASE + '/profile', {
      method: 'GET',
      headers: getAuthHeaders()
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
  try {
    const res = await fetch(API_BASE + '/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
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

