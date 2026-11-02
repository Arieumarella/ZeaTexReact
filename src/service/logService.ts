import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';
import {
  getApiErrorMessage,
  getErrorMessage,
  isInvalidTokenMessage,
} from '../utils/errorMessage';

export interface LogItem {
  id: number;
  id_toko: number;
  id_user?: number;
  nama_user: string;
  nama_toko: string;
  aksi: string;
  keterangan: string;
  created_at: string;
  updated_at?: string;
}

export interface LogResponse {
  status: boolean;
  data: LogItem[];
  page: number;
  total: number;
  totalPages: number;
  message?: string;
}

export async function getLogs(
  page: number = 1,
  search: string = "",
  limit: number = 15
): Promise<LogResponse> {
  const fallback: LogResponse = {
    status: false,
    data: [],
    page: 1,
    total: 0,
    totalPages: 1,
  };

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      all_stores: "true",
    });
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE}/log?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.status) {
      const message = getApiErrorMessage(data, "Gagal mengambil data log aktivitas.");
      toast.error(message);
      if (isInvalidTokenMessage(message)) window.location.replace("/");
      return { ...fallback, message };
    }
    return data;
  } catch (error) {
    const message = getErrorMessage(error, "Gagal mengambil data log aktivitas.");
    toast.error(message);
    return { ...fallback, message };
  }
}
