// src/service/apiHelper.ts
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getAuthHeaders(isFormData: boolean = false): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const activeTokoId = localStorage.getItem('active_toko_id');

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeTokoId) {
    headers['X-Toko-Id'] = activeTokoId;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}
