import { toast } from 'react-toastify';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Oprasional {
  id: number;
  id_user: number;
  nama_baya: string;
  jml_biaya: string;
  created_at: string;
  updated_at: string;
  penginput?: {
    id: number;
    nama: string;
    username: string;
  };
  username?: string;
  user?: { username: string };
}

export async function getOprasional(page: number = 1, search: string = ""): Promise<{ status: boolean; data?: Oprasional[]; totalPages?: number; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/oprasional?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data biaya oprasional.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil data biaya oprasional.' };
    }
    return { status: true, data: data.data, totalPages: data.totalPages };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getDetailOprasional(id: number): Promise<Oprasional | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail biaya oprasional.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return null;
    }
    return data.oprasional;
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return null;
  }
}

export async function createOprasional({ nama_baya, jml_biaya }: { nama_baya: string; jml_biaya: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(API_BASE + '/oprasional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nama_baya, jml_biaya }),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menambah data oprasional.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menambah data oprasional.' };
    }
    toast.success('Data oprasional berhasil ditambahkan!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function editOprasional(id: number, data: { nama_baya: string; jml_biaya: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    if (!response.ok || !resData.status) {
      toast.error(resData.message || 'Gagal mengedit biaya oprasional.');
      if (resData.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: resData.message || 'Gagal mengedit biaya oprasional.' };
    }
    toast.success('Berhasil mengedit biaya operasional');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function deleteOprasional(id: number): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menghapus biaya oprasional.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menghapus biaya oprasional.' };
    }
    toast.success('Biaya oprasional berhasil dihapus!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}
