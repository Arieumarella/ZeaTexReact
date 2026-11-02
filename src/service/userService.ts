import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';
import {
  getApiErrorMessage,
  getErrorMessage,
  isInvalidTokenMessage,
} from '../utils/errorMessage';

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

function redirectIfInvalidToken(message: string): void {
  if (isInvalidTokenMessage(message)) {
    window.location.replace('/');
  }
}

export async function deleteUser(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal menghapus user.');
      toast.error(message);
      redirectIfInvalidToken(message);
      return { status: false, message };
    }
    toast.success('User berhasil dihapus!');
    return { status: true };
  } catch (error) {
    const message = getErrorMessage(error, 'Gagal menghapus user.');
    toast.error(message);
    return { status: false, message };
  }
}

export async function createUser(payload: UpdateUserPayload): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal menambah user.');
      toast.error(message);
      redirectIfInvalidToken(message);
      return { status: false, message };
    }
    toast.success('User berhasil ditambahkan!');
    return { status: true };
  } catch (error) {
    const message = getErrorMessage(error, 'Gagal menambah user.');
    toast.error(message);
    return { status: false, message };
  }
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal update user.');
      toast.error(message);
      redirectIfInvalidToken(message);
      return { status: false, message };
    }
    toast.success('User berhasil diupdate!');
    return { status: true };
  } catch (error) {
    const message = getErrorMessage(error, 'Gagal update user.');
    toast.error(message);
    return { status: false, message };
  }
}

export async function getUserDetail(id: number): Promise<UserDetailResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal mengambil detail user.');
      toast.error(message);
      redirectIfInvalidToken(message);
      return null;
    }
    return data;
  } catch (error) {
    const message = getErrorMessage(error, 'Gagal mengambil detail user.');
    toast.error(message);
    return null;
  }
}

export async function getUsers(page: number = 1): Promise<UserListResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/users?page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.status) {
      const message = getApiErrorMessage(data, 'Gagal mengambil data user.');
      toast.error(message);
      redirectIfInvalidToken(message);
      return null;
    }
    return data;
  } catch (error) {
    const message = getErrorMessage(error, 'Gagal mengambil data user.');
    toast.error(message);
    return null;
  }
}
