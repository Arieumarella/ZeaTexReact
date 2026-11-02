// src/service/tokoService.ts
import { API_BASE, getAuthHeaders } from './apiHelper';
import { getApiErrorMessage, getErrorMessage } from '../utils/errorMessage';

export interface Toko {
  id: number;
  nama_toko: string;
  alamat?: string;
  nomor_telepon_1?: string;
  nomor_telepon_2?: string;
  nomor_telepon3?: string;
  rekening?: string;
  nama_rekening?: string;
  maps?: string;
  status_aktif?: boolean;
  created_at?: string;
  updated_at?: string;
}

type TokoResponse = { status: boolean; data?: Toko[]; message?: string };
type TokoDetailResponse = { status: boolean; data?: Toko; message?: string };
type TokoMutationResponse = { status: boolean; data?: Toko; message?: string; };

async function parseResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getAllToko(): Promise<TokoResponse> {
  try {
    const response = await fetch(`${API_BASE}/toko`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<TokoResponse>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        message: getApiErrorMessage(data, 'Gagal mengambil data toko.'),
      };
    }
    return data;
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, 'Gagal mengambil data toko.'),
    };
  }
}

export async function getTokoById(id: number): Promise<TokoDetailResponse> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<TokoDetailResponse>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        message: getApiErrorMessage(data, 'Gagal mengambil detail toko.'),
      };
    }
    return data;
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, 'Gagal mengambil detail toko.'),
    };
  }
}

export async function createToko(tokoData: Partial<Toko> & { saldo_awal?: number }): Promise<TokoMutationResponse> {
  try {
    const response = await fetch(`${API_BASE}/toko`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokoData),
    });
    const data = await parseResponse<TokoMutationResponse>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        message: getApiErrorMessage(data, 'Gagal menambah toko baru.'),
      };
    }
    return data;
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, 'Gagal menambah toko baru.'),
    };
  }
}

export async function updateToko(id: number, tokoData: Partial<Toko>): Promise<TokoMutationResponse> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokoData),
    });
    const data = await parseResponse<TokoMutationResponse>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        message: getApiErrorMessage(data, 'Gagal mengedit profil toko.'),
      };
    }
    return data;
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, 'Gagal mengedit profil toko.'),
    };
  }
}

export async function deleteToko(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{ status: boolean; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        message: getApiErrorMessage(data, 'Gagal menonaktifkan toko.'),
      };
    }
    return data;
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, 'Gagal menonaktifkan toko.'),
    };
  }
}
