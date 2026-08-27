import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

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
    const data = await res.json();
    return data;
  } catch (error: any) {
    toast.error("Gagal terhubung ke server untuk mengambil log");
    return {
      status: false,
      data: [],
      page: 1,
      total: 0,
      totalPages: 1,
      message: error.message,
    };
  }
}
