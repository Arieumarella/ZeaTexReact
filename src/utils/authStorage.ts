const AUTH_KEYS = [
  'auth_token',
  'auth_nama',
  'auth_jabatan',
  'auth_role',
  'active_toko_id',
  'active_toko_nama',
  'auth_stores',
  'auth_employee_profile',
  'auth_hr_store',
];

export function clearAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function hasToken(): boolean {
  return Boolean(localStorage.getItem('auth_token'));
}

export function getRole(): string {
  return localStorage.getItem('auth_role') || '';
}

export function hasEmployeeProfile(): boolean {
  return Boolean(localStorage.getItem('auth_employee_profile'));
}

export function isSuperAdmin(): boolean {
  return getRole() === 'SUPER_ADMIN';
}
