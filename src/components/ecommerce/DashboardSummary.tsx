import { useState, useEffect } from "react";
import { getSaldoPerusahaan, getTransaksiPenjualan, getTransaksiPembelian, getTotalStokBarang } from "../../service/dashboardService";

interface SummaryData {
  totalSaldo: number;
  transaksiBulanIni: {
    masuk: number;
    keluar: number;
  };
  stokBarang: {
    total: number;
    nilaiStok: number;
    totalRol?: number;
    totalYard?: number;
  };
}

export default function DashboardSummary() {
  const [data, setData] = useState<SummaryData>({
    totalSaldo: 0,
    transaksiBulanIni: { masuk: 0, keluar: 0 },
    stokBarang: { total: 0, nilaiStok: 0 },
  });
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Saldo Perusahaan
        const saldoData = await getSaldoPerusahaan();
        
        if (saldoData) {
          setData((prevData) => ({
            ...prevData,
            totalSaldo: saldoData.jml_saldo,
          }));
        }

        // Fetch Transaksi Penjualan (Transaksi Masuk)
        const transaksiData = await getTransaksiPenjualan();
        
        if (transaksiData) {
          setData((prevData) => ({
            ...prevData,
            transaksiBulanIni: {
              ...prevData.transaksiBulanIni,
              masuk: transaksiData.total_transaksi_keluar,
            },
          }));
        }

        // Fetch Transaksi Pembelian (Transaksi Keluar)
        const pembelianData = await getTransaksiPembelian();
        
        if (pembelianData) {
          setData((prevData) => ({
            ...prevData,
            transaksiBulanIni: {
              ...prevData.transaksiBulanIni,
              keluar: pembelianData.total_transaksi_masuk,
            },
          }));
        }

        // Fetch Total Stok Barang (Rol & Yard)
        const totalStokData = await getTotalStokBarang();
        
        if (totalStokData) {
          setData((prevData) => ({
            ...prevData,
            stokBarang: {
              ...prevData.stokBarang,
              totalRol: totalStokData.total_rol,
              totalYard: totalStokData.total_yard,
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Gagal mengambil data dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Saldo Perusahaan */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Perusahaan</p>
            {_loading ? (
              <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            ) : (
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.totalSaldo)}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transaksi Masuk Bulan Ini */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaksi Masuk (Bulan Ini)</p>
            {_loading ? (
              <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            ) : (
              <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.transaksiBulanIni.masuk)}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-11a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Transaksi Keluar Bulan Ini */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaksi Keluar (Bulan Ini)</p>
            {_loading ? (
              <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
            ) : (
              <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(data.transaksiBulanIni.keluar)}
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4m0 0L3 5m0 0v8m0-8l4 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Stok Barang */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Stok Barang</p>
            <div className="flex gap-4 mt-2">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-500">Total Jumlah Rol:</span>
                <span className="ml-1 font-semibold text-purple-700 dark:text-purple-300">{data.stokBarang.totalRol ?? 0}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-500">Total Jumlah Yard:</span>
                <span className="ml-1 font-semibold text-purple-700 dark:text-purple-300">{data.stokBarang.totalYard ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M8 5v10m8-10v10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
