import type { SalaryType } from '../types/hr';

export const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  MONTHLY: 'Bulanan',
  WEEKLY: 'Mingguan',
  DAILY: 'Harian',
};

export const SALARY_TYPE_UNITS: Record<SalaryType, string> = {
  MONTHLY: 'bulan',
  WEEKLY: 'minggu',
  DAILY: 'hari',
};

export function normalizeSalaryType(value: string | null | undefined): SalaryType {
  return value === 'WEEKLY' || value === 'DAILY' ? value : 'MONTHLY';
}

export function salaryTypeLabel(value: string | null | undefined): string {
  return SALARY_TYPE_LABELS[normalizeSalaryType(value)];
}

export function salaryTypeUnit(value: string | null | undefined): string {
  return SALARY_TYPE_UNITS[normalizeSalaryType(value)];
}

export function formatRupiah(value: number | null | undefined): string {
  const number = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  return value;
}

export function todayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
