import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface Oprasional {
  id: number;
  id_user: number;
  nama_baya: string;
  tanggal?: string;
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

export async function getOprasional(
  page: number = 1,
  search: string = "",
  all: boolean = false,
  waktuAwal: string = "",
  waktuAkhir: string = ""
): Promise<{ status: boolean; data?: Oprasional[]; totalPages?: number; message?: string }> {
  try {
    const params = new URLSearchParams();
    if (all) {
      params.append('all', 'true');
    } else {
      params.append('page', String(page));
    }
    if (search) params.append('search', search);
    if (waktuAwal) params.append('waktuAwal', waktuAwal);
    if (waktuAkhir) params.append('waktuAkhir', waktuAkhir);
    const response = await fetch(`${API_BASE}/oprasional?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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

export async function createOprasional({ nama_baya, jml_biaya, tanggal }: { nama_baya: string; jml_biaya: string; tanggal?: string }): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(API_BASE + '/oprasional', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nama_baya, jml_biaya, tanggal }),
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

export async function editOprasional(id: number, data: { nama_baya: string; jml_biaya: string; tanggal?: string }): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(`${API_BASE}/oprasional/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

