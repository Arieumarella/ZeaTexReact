const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getDetailSupplier(id: number): Promise<{ status: boolean; data?: Supplier; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil detail supplier.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil detail supplier.' };
    }
    return { status: true, data: data.supplier };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function updateSupplier(id: number, { nama, no_tlp }: { nama: string; no_tlp: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nama, no_tlp }),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengedit supplier.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengedit supplier.' };
    }
    toast.success('Supplier berhasil diedit!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}
export async function createSupplier({ nama, no_tlp }: { nama: string; no_tlp: string }): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(API_BASE + '/supplier', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nama, no_tlp }),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menambah supplier.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menambah supplier.' };
    }
    toast.success('Supplier berhasil ditambahkan!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}
import { toast } from 'react-toastify';

export interface Supplier {
  id: number;
  nama: string;
  noTelp?: string;
  no_tlp?: string;
}

export async function getSupplier(page: number = 1, search: string = ""): Promise<{ status: boolean; data?: Supplier[]; totalPages?: number; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    // Kirim parameter page dan search ke backend
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/supplier?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data supplier.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal mengambil data supplier.' };
    }
    return { status: true, data: data.data, totalPages: data.totalPages };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function deleteSupplier(id: number): Promise<{ status: boolean; message?: string }> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return { status: false, message: 'Token tidak ditemukan' };
  }
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menghapus supplier.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menghapus supplier.' };
    }
    toast.success('Supplier berhasil dihapus!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}
