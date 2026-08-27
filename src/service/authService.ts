// src/service/authService.ts
import { API_BASE } from './apiHelper';

export async function login(username: string, password: string): Promise<{ status: boolean; token?: string; role?: string; id_toko?: number; message?: string }> {
  try {
    const response = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.status && data.token) {
      localStorage.setItem('auth_token', data.token);
      if (data.nama) localStorage.setItem("auth_nama", data.nama);
      if (data.jabatan) localStorage.setItem("auth_jabatan", data.jabatan);
      if (data.role) localStorage.setItem("auth_role", data.role);
      
      const tokoId = data.id_toko || 1;
      localStorage.setItem("active_toko_id", String(tokoId));
      if (data.nama_toko) localStorage.setItem("active_toko_nama", data.nama_toko);

      if (data.stores) {
        localStorage.setItem("auth_stores", JSON.stringify(data.stores));
      } else {
        localStorage.removeItem("auth_stores");
      }

      return { status: true, token: data.token, role: data.role, id_toko: tokoId };
    } else {
      return { status: false, message: data.message || 'Login gagal' };
    }
  } catch (error) {
    return { status: false, message: 'Network error' };
  }
}

