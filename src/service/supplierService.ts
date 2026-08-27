import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface Supplier {
  id: number;
  nama: string;
  noTelp?: string;
  no_tlp?: string;
}

export async function getDetailSupplier(id: number): Promise<{ status: boolean; data?: Supplier; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(API_BASE + '/supplier', {
      method: 'POST',
      headers: getAuthHeaders(),
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

export async function getSupplier(page: number = 1, search: string = ""): Promise<{ status: boolean; data?: Supplier[]; totalPages?: number; message?: string }> {
  try {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.append('search', search);
    const response = await fetch(`${API_BASE}/supplier?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
  try {
    const response = await fetch(`${API_BASE}/supplier/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

