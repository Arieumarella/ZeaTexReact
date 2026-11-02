import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';
import {
  getApiErrorMessage,
  getErrorMessage,
  isInvalidTokenMessage,
} from '../utils/errorMessage';

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
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal mengambil data profile.');
      toast.error(message);
      if (isInvalidTokenMessage(message)) window.location.replace('/');
      return null;
    }
    return data.data || null;
  } catch (err) {
    console.error(err);
    toast.error(getErrorMessage(err, 'Gagal mengambil data profile.'));
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

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal memperbarui profile.');
      toast.error(message);
      if (isInvalidTokenMessage(message)) window.location.replace('/');
      return data;
    }
    toast.success(data?.message || 'Profile berhasil diperbarui.');
    return data;
  } catch (err) {
    console.error(err);
    toast.error(getErrorMessage(err, 'Gagal memperbarui profile.'));
    return null;
  }
}

