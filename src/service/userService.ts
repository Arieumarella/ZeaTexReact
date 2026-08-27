import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

export interface User {
  id: number;
  id_toko?: number;
  nama_toko?: string;
  role?: string;
  username: string;
  nama: string;
  jabatan: string;
  no_tlp: string;
  created_at: string;
  updated_at: string;
}


export interface UserListResponse {
  status: boolean;
  data: User[];
  page: number;
  total: number;
  totalPages: number;
}

export interface UserDetailResponse {
  status: boolean;
  user?: User;
  message?: string;
}

export interface UpdateUserPayload {
  username: string;
  password?: string;
  nama: string;
  jabatan: string;
  no_tlp: string;
  id_toko?: number;
  role?: string;
}

export async function deleteUser(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menghapus user.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menghapus user.' };
    }
    toast.success('User berhasil dihapus!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    window.location.replace('/');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function createUser(payload: UpdateUserPayload): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal menambah user.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal menambah user.' };
    }
    toast.success('User berhasil ditambahkan!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    window.location.replace('/');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      toast.error(data.message || 'Gagal update user.');
      if (data.message === 'Invalid token') {
        window.location.replace('/');
      }
      return { status: false, message: data.message || 'Gagal update user.' };
    }
    toast.success('User berhasil diupdate!');
    return { status: true };
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    window.location.replace('/');
    return { status: false, message: 'Terjadi kesalahan jaringan.' };
  }
}

export async function getUserDetail(id: number): Promise<UserDetailResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      toast.error('Gagal mengambil data user detail.');
      window.location.replace('/');
      return null;
    }
    const data = await response.json();
    if (data && data.status === false && data.message === 'Invalid token') {
      toast.error('Token tidak valid, silakan login ulang.');
      window.location.replace('/');
      return null;
    }
    if (!data.status) {
      toast.error(data.message || 'Gagal mengambil data user detail.');
      return null;
    }
    return data;
  } catch (error) {
    toast.error('Terjadi kesalahan jaringan.');
    window.location.replace('/');
    return null;
  }
}

export async function getUsers(page: number = 1): Promise<UserListResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/users?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      window.location.replace('/');
      return null;
    }
    const data = await response.json();
    if (data && data.status === false && data.message === 'Invalid token') {
      window.location.replace('/');
      return null;
    }
    return data;
  } catch (error) {
    window.location.replace('/');
    return null;
  }
}


