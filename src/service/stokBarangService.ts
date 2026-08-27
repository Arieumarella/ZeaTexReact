import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface StokBarang {
  id: number;
  kd_barang: string;
  nama_barang: string;
  jml_yard: number;
  jml_rol: number;
  tot_yard_terjual?: number;
  tot_rol_terjual?: number;
  foto?: string;
  created_at: string;
  updated_at: string;
}

export interface StokBarangResponse {
  status: boolean;
  data: StokBarang[];
  page: number;
  total: number;
  totalPages: number;
}

export async function getAllStokBarang(
  page: number = 1,
  search: string = "",
  all: boolean = false
): Promise<StokBarangResponse> {
  try {
    const params = new URLSearchParams();
    if (all) {
      params.append('all', 'true');
    } else {
      params.append('page', String(page));
    }
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/barang/stockBarang?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data stok barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, data: [], page: 1, total: 0, totalPages: 0 };
    }
    return {
      status: true,
      data: data.data,
      page: data.page,
      total: data.total,
      totalPages: data.totalPages,
    };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching stok barang:', error);
    return { status: false, data: [], page: 1, total: 0, totalPages: 0 };
  }
}

export async function getStokBarangById(id: number): Promise<{ status: boolean; data?: StokBarang; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail stok barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail stok barang.' };
    }
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching stok barang detail:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getDetilMasukKeluar(id: number | string): Promise<{ status: boolean; data?: Array<any>; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/detilMasukeluar/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail masuk/keluar.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail masuk/keluar.' };
    }
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching detil masuk/keluar:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getDetilKeluar(id: number | string): Promise<{ status: boolean; data?: Array<any>; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/detilKeluar/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail keluar.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail keluar.' };
    }
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching detil keluar:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getDetilMasuk(id: number | string): Promise<{ status: boolean; data?: Array<any>; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/detilMasuk/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail masuk.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail masuk.' };
    }
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching detil masuk:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getDetilSisa(id: number | string): Promise<{ status: boolean; data?: Array<any>; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/detilSisa/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail sisa stok.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail sisa stok.' };
    }
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error fetching detil sisa stok:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function createStokBarang(payload: {
  kd_barang: string;
  nama_barang: string;
  jml_yard: string;
  jml_rol?: number | null;
}): Promise<{ status: boolean; data?: StokBarang; message?: string }> {
  try {
    const response = await fetch(API_BASE + '/barang', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menambah stok barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menambah stok barang.' };
    }
    toast.success('Stok barang berhasil ditambahkan!');
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error creating stok barang:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function updateStokBarang(
  id: number,
  payload: { kd_barang?: string; nama_barang?: string; jml_yard?: string; jml_rol?: number | null }
): Promise<{ status: boolean; data?: StokBarang; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengubah stok barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengubah stok barang.' };
    }
    toast.success('Stok barang berhasil diubah!');
    return { status: true, data: data.data };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error updating stok barang:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function deleteStokBarang(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menghapus stok barang.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menghapus stok barang.' };
    }
    toast.success('Stok barang berhasil dihapus!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    console.error('Error deleting stok barang:', error);
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

