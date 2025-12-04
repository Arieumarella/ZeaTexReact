import { toast } from 'react-toastify';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Customer {
  id: number;
  nama: string;
  no_tlp: string;
  created_at: string;
  updated_at: string;
}

export async function getAllCustomers(): Promise<Customer[] | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/pelanggan/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil daftar customer.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data.data || [];
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat mengambil customer.');
    return null;
  }
}

export interface StoreProfile {
  id: number;
  nama_toko: string;
  alamat: string;
  nomor_telepon_1?: string | null;
  nomor_telepon_2?: string | null;
  nomor_telepon3?: string | null;
  rekening?: string | null;
  nama_rekening?: string | null;
  maps?: string | null;
}

export async function getStoreProfile(): Promise<StoreProfile | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || data.status === false) {
      toast.error(data.message || 'Gagal mengambil data profil toko.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data.data || null;
  } catch (error) {
    console.error('getStoreProfile error', error);
    toast.error('Terjadi kesalahan jaringan saat mengambil profil toko.');
    return null;
  }
}

export interface Barang {
  id: number;
  kd_barang: string;
  nama_barang: string;
  jml_yard: string;
  created_at: string;
  updated_at: string;
}

export async function getAllBarang(): Promise<Barang[] | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/barang/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil daftar barang.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data.data || [];
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat mengambil barang.');
    return null;
  }
}

// Helper function to get barang by id
export function getBarangById(barangList: Barang[], id: number): Barang | undefined {
  return barangList.find(b => b.id === id);
}

export interface CreateTransaksiPayload {
  id_pelanggan: number | null;
  id_user: number | null;
  tgl_transaksi: string;
  total_transaksi: number;
  tipe_discount: string;
  jml_discount: number;
  tipe_ppn: string;
  jml_ppn: number;
  catatan: string | null;
  status_pembayaran: string;
  tenor: number;
  tanggal_tenor: string[];
  details: Array<{
    id_barang: number | null;
    kode_barang: string | null;
    nama_barang: string | null;
    jml_yard: number;
    jml_rol: number;
    harga_satuan: number;
  }>;
}

export async function createTransaksiKeluar(payload: CreateTransaksiPayload): Promise<any> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(API_BASE + '/transaksi-keluar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal menyimpan transaksi.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return data;
    }
    toast.success(data.message || 'Transaksi berhasil disimpan.');
    return data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat menyimpan transaksi.');
    return null;
  }
}

export interface TransaksiItem {
  id: number;
  tgl_transaksi: string;
  status_pembayaran: "0" | "1";
  tenor?: number;
  pelanggan: { id: number; nama: string } | null;
  total_transaksi: number;
  penginput: { id: number; nama: string; username: string } | null;
  tipe_discount: string;
  jml_discount: number;
  tipe_ppn: string;
  jml_ppn: number;
  catatan: string;
  details?: Array<{
    id: number;
    id_barang: number;
    jml_yard: number;
    jml_rol: number;
    harga_satuan: number;
    created_at: string;
    updated_at: string;
    // Optional fields yang bisa tidak ada dari API
    kode_barang?: string;
    nama_barang?: string;
  }>;
  berjangka?: Array<{
    id: number;
    tgl_jatuh_tempo: string;
    jml_bayar: number;
    created_at: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface GetTransaksiParams {
  page?: number;
  customerId?: number;
  waktuAwal?: string; // YYYY-MM-DD
  waktuAkhir?: string; // YYYY-MM-DD
}

export async function getTransaksiKeluar(params: GetTransaksiParams = {}): Promise<{
  status: boolean;
  data: TransaksiItem[];
  page?: number;
  total?: number;
  totalPages?: number;
} | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.customerId) qs.set('customerId', String(params.customerId));
  if (params.waktuAwal) qs.set('waktuAwal', params.waktuAwal);
  if (params.waktuAkhir) qs.set('waktuAkhir', params.waktuAkhir);
  const url = `${API_BASE}/transaksi-keluar${qs.toString() ? `?${qs.toString()}` : ''}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data transaksi keluar.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat mengambil transaksi keluar.');
    return null;
  }
}

export async function getTransaksiKeluarById(id: number): Promise<TransaksiItem | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/transaksi-keluar/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal mengambil data transaksi keluar.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return null;
    }
    return data.data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat mengambil transaksi keluar.');
    return null;
  }
}

export async function updateTransaksiKeluar(
  id: number,
  payload: {
    id_pelanggan: number | null;
    tgl_transaksi: string;
    total_transaksi: number;
    tipe_discount: string;
    jml_discount: number;
    tipe_ppn: string;
    jml_ppn: number;
    catatan: string | null;
    status_pembayaran: string;
    tenor: number;
    tanggal_tenor: string[];
    details: Array<{
      id_barang: number | null;
      kode_barang: string | null;
      nama_barang: string | null;
      jml_yard: number;
      jml_rol: number;
      harga_satuan: number;
    }>;
  }
): Promise<{ status: boolean; message: string; data?: any } | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/transaksi-keluar/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal memperbarui transaksi keluar.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return data;
    }
    return data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat memperbarui transaksi keluar.');
    return null;
  }
}

export interface UpdateBerjangkaPayload {
  payments: Array<{
    id: number;
    jml_bayar: number;
  }>;
}

export async function updateBerjangkaKeluar(
  transaksiId: number,
  payload: UpdateBerjangkaPayload
): Promise<{ status: boolean; message: string; data?: any } | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/berjangka-keluar-cicil/${transaksiId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Response:', res.status, data);

    if (!res.ok) {
      console.error('Error response:', data);
      toast.error(data.message || 'Gagal memperbarui cicilan.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return data;
    }

    if (data.status) {
      console.log('Success:', data.message);
      // Toast akan ditampilkan di component, jadi tidak perlu di sini
      return data;
    } else {
      console.error('Status false:', data);
      toast.error(data.message || 'Gagal memperbarui cicilan.');
      return data;
    }
  } catch (err) {
    console.error('Catch error:', err);
    toast.error('Terjadi kesalahan jaringan saat memperbarui cicilan.');
    return null;
  }
}

export async function deleteTransaksiKeluar(id: number): Promise<{ status: boolean; message: string } | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/transaksi-keluar/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response bukan JSON. Periksa endpoint atau authentication.');
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Response kosong dari server');
    }

    const data = JSON.parse(text);

    // Handle semua status response (200, 400, 404, 500 dll)
    if (data.status) {
      toast.success(data.message || 'Transaksi berhasil dihapus');
    } else {
      toast.error(data.message || 'Gagal menghapus transaksi');
    }

    return data;
  } catch (error) {
    console.error('Delete error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Terjadi kesalahan';
    toast.error(errorMsg);
    return null;
  }
}

// Retur interfaces
export interface ReturDetailPayload {
  id: number;
  jml_yard_retur: number;
  jml_rol_retur: number;
}

export interface CreateReturPayload {
  details: ReturDetailPayload[];
}

// Create retur for barang keluar
export async function createReturKeluar(
  transaksiId: number,
  payload: CreateReturPayload
): Promise<{ status: boolean; message: string; data?: any } | null> {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    toast.error('Token tidak ditemukan, silakan login ulang.');
    window.location.replace('/');
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/transaksi-keluar/${transaksiId}/retur`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.status) {
      toast.error(data.message || 'Gagal menyimpan retur transaksi keluar.');
      if (data.message === 'Invalid token') window.location.replace('/');
      return data;
    }
    toast.success(data.message || 'Retur berhasil disimpan.');
    return data;
  } catch (err) {
    console.error(err);
    toast.error('Terjadi kesalahan jaringan saat menyimpan retur.');
    return null;
  }
}

// Send nota PDF file to external WhatsApp server
export async function sendNotaFile(file: File, number: string, caption: string): Promise<any | null> {
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('number', number);
    form.append('caption', caption);

    const WA_BASE = import.meta.env.VITE_WHATSAPP_API_URL || 'http://localhost:5000';
    const res = await fetch(WA_BASE + '/send-file', {
      method: 'POST',
      body: form,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('sendNotaFile error', data);
      toast.error(data?.message || 'Gagal mengirim file ke server');
      return data;
    }

    return data;
  } catch (err) {
    console.error('sendNotaFile catch', err);
    toast.error('Gagal menghubungi server pengirim WhatsApp');
    return null;
  }
}
