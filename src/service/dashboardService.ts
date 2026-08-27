import { API_BASE, getAuthHeaders } from './apiHelper';
import { toast } from 'react-toastify';

interface SaldoData {
  id: number;
  jml_saldo: number;
  created_at: string;
  updated_at: string;
}

interface TransaksiPenjualanData {
  total_transaksi_keluar: number;
}

interface TransaksiPembelianData {
  total_transaksi_masuk: number;
}

interface TotalStokBarangData {
  total_yard: number;
  total_rol: number;
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
  page?: number;
  total?: number;
  totalPages?: number;
}

interface TopSellingItem {
  nama: string;
  terjual: number;
  revenue: number;
}

interface ChartDataItem {
  label: string;
  penjualan: number;
  pengeluaran: number;
  belum_dibayar: number;
}

export interface JatuhTempoTransaksi {
  id: number;
  nomorTransaksi: string;
  pelanggan: string;
  totalHarga: number;
  hariHitung: number;
  status?: string;
  tanggalJatuhTempo?: string;
}

export interface JatuhTempoResponse {
  status: boolean;
  datatransaksiKeluar: JatuhTempoTransaksi[];
  datatransaksiMasuk: JatuhTempoTransaksi[];
}

export interface TopCustomerData {
  nama: string;
  pembelian: number;
  totalNilai: number;
}

export interface OperationalCostData {
  kategori: string;
  jumlah: number;
}

// Get Saldo Perusahaan
export const getSaldoPerusahaan = async (): Promise<SaldoData | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/get-saldo`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result: ApiResponse<SaldoData> = await response.json();

    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data saldo perusahaan.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }

    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching saldo perusahaan:", error);
    return null;
  }
};

// Get Transaksi Penjualan
export const getTransaksiPenjualan = async (): Promise<TransaksiPenjualanData | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/get-transaksi-penjualan`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result: ApiResponse<TransaksiPenjualanData> = await response.json();

    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data transaksi penjualan.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }

    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching transaksi penjualan:", error);
    return null;
  }
};

// Get Transaksi Pembelian
export const getTransaksiPembelian = async (): Promise<TransaksiPembelianData | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/get-transaksi-pembelian`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result: ApiResponse<TransaksiPembelianData> = await response.json();

    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data transaksi pembelian.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }

    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching transaksi pembelian:", error);
    return null;
  }
};

// Get Total Stok Barang
export const getTotalStokBarang = async (): Promise<TotalStokBarangData | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/get-total-stok-barang`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: ApiResponse<TotalStokBarangData> = await response.json();
    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data total stok barang.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }
    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching total stok barang:", error);
    return null;
  }
};

// Get Top Selling Items
export const getTopSellingItems = async (dari: string, sampai: string): Promise<TopSellingItem[] | null> => {
  try {
    const params = new URLSearchParams({ dari, sampai });
    const response = await fetch(`${API_BASE}/dashboard/get-paling-laku?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: ApiResponse<TopSellingItem[]> = await response.json();
    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data barang paling laku.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }
    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching top selling items:", error);
    return null;
  }
};

// Get Chart Penjualan
export const getChartPenjualan = async (filter: string): Promise<ChartDataItem[] | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/getChartPenjualan?filter=${filter}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: ApiResponse<ChartDataItem[]> = await response.json();
    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data chart penjualan.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }
    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching chart penjualan:", error);
    return null;
  }
};

// Get Jatuh Tempo Piutang
export const getJatuhTempoPiutang = async (): Promise<JatuhTempoResponse | null> => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/getJatuhTempoPiutang`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: JatuhTempoResponse = await response.json();
    if (!response.ok || !result.status) {
      toast.error("Gagal mengambil data jatuh tempo piutang.");
      return null;
    }
    return result;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    return null;
  }
};

// Get Data Pelanggan
export const getDataPelanggan = async (dari: string, sampai: string): Promise<TopCustomerData[] | null> => {
  try {
    const params = new URLSearchParams({ dari, sampai });
    const response = await fetch(`${API_BASE}/dashboard/getDataPelanggan?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: ApiResponse<TopCustomerData[]> = await response.json();
    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data pelanggan.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }
    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching data pelanggan:", error);
    return null;
  }
};

// Get Data Oprasional
export const getDataOprasional = async (dari: string, sampai: string): Promise<OperationalCostData[] | null> => {
  try {
    const params = new URLSearchParams({ dari, sampai });
    const response = await fetch(`${API_BASE}/dashboard/getDataOprasional?${params.toString()}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const result: ApiResponse<OperationalCostData[]> = await response.json();
    if (!response.ok || !result.status) {
      toast.error(result.data?.toString() || "Gagal mengambil data biaya operasional.");
      if (result.data?.toString() === "Invalid token") {
        window.location.replace("/");
      }
      return null;
    }
    return result.data;
  } catch (error) {
    toast.error("Terjadi kesalahan jaringan.");
    console.error("Error fetching biaya operasional:", error);
    return null;
  }
};

