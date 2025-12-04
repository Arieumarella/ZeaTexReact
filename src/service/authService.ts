// src/service/authService.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login(username: string, password: string): Promise<{ status: boolean; token?: string; message?: string }> {
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
      // Simpan token di localStorage (bisa diganti ke sessionStorage atau cookie sesuai kebutuhan)
      localStorage.setItem('auth_token', data.token);
      if (data.nama) localStorage.setItem("auth_nama", data.nama);
      if (data.jabatan) localStorage.setItem("auth_jabatan", data.jabatan);
      return { status: true, token: data.token };
    } else {
      return { status: false, message: data.message || 'Login gagal' };
    }
  } catch (error) {
    return { status: false, message: 'Network error' };
  }
}
