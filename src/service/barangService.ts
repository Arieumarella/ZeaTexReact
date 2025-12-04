const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getDetailBarang(id: number): Promise<{ status: boolean; data?: Barang; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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

export async function updateBarang(id: number, { kd_barang, nama_barang }: { kd_barang?: string; nama_barang: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kd_barang, nama_barang }),
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

export async function createBarang({ kd_barang, nama_barang }: { kd_barang?: string; nama_barang: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(API_BASE + '/barang', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kd_barang, nama_barang }),
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
import { toast } from 'react-toastify';

export interface Barang {
  id: number;
  kd_barang: string;
  nama_barang: string;
}

export async function getBarang(page: number = 1, search: string = ""): Promise<{ status: boolean; data?: Barang[]; totalPages?: number; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/barang?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/barang/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
