// src/service/tokoService.ts
import { API_BASE, getAuthHeaders } from './apiHelper';

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

export async function getAllToko(): Promise<{ status: boolean; data?: Toko[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: 'Gagal mengambil data toko' };
  }
}

export async function getTokoById(id: number): Promise<{ status: boolean; data?: Toko; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: 'Gagal mengambil detail toko' };
  }
}

export async function createToko(tokoData: Partial<Toko> & { saldo_awal?: number }): Promise<{ status: boolean; data?: Toko; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokoData),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: 'Gagal menambah toko baru' };
  }
}

export async function updateToko(id: number, tokoData: Partial<Toko>): Promise<{ status: boolean; data?: Toko; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokoData),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: 'Gagal mengedit profil toko' };
  }
}

export async function deleteToko(id: number): Promise<{ status: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/toko/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    return { status: false, message: 'Gagal menonaktifkan toko' };
  }
}
