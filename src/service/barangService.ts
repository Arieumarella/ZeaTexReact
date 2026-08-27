import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface Barang {
  id: number;
  kd_barang: string;
  nama_barang: string;
  foto?: string;
}

export async function getDetailBarang(id: number): Promise<{ status: boolean; data?: Barang; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail barang.' };
    }
    return { status: true, data: data.barang };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function updateBarang(
  id: number,
  {
    kd_barang,
    nama_barang,
    foto,
    hapus_foto,
  }: {
    kd_barang?: string;
    nama_barang: string;
    foto?: File | null;
    hapus_foto?: boolean;
  }
): Promise<{ status: boolean; message?: string }> {
  try {
    const formData = new FormData();
    if (kd_barang !== undefined) formData.append('kd_barang', kd_barang);
    formData.append('nama_barang', nama_barang);
    if (foto) {
      formData.append('foto', foto);
    }
    if (hapus_foto) {
      formData.append('hapus_foto', 'true');
    }

    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengedit barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengedit barang.' };
    }
    toast.success('Barang berhasil diedit!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function createBarang({
  kd_barang,
  nama_barang,
  foto,
}: {
  kd_barang?: string;
  nama_barang: string;
  foto?: File | null;
}): Promise<{ status: boolean; message?: string }> {
  try {
    const formData = new FormData();
    if (kd_barang !== undefined) formData.append('kd_barang', kd_barang);
    formData.append('nama_barang', nama_barang);
    if (foto) {
      formData.append('foto', foto);
    }

    const response = await fetch(API_BASE + '/barang', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menambah barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menambah barang.' };
    }
    toast.success('Barang berhasil ditambahkan!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getBarang(page: number = 1, search: string = ""): Promise<{ status: boolean; data?: Barang[]; totalPages?: number; message?: string }> {
  try {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/barang?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil data barang.' };
    }
    return { status: true, data: data.data, totalPages: data.totalPages };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function deleteBarang(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menghapus barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menghapus barang.' };
    }
    toast.success('Barang berhasil dihapus!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

