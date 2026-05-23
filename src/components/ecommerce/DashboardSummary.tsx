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
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" strokeLinecap="round" strokeLinejoin="round" />
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
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="23 6 17 6 23 12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round"/>
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
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="23 18 17 18 23 12" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 18l-9.5-9.5-5 5L1 6" strokeLinecap="round" strokeLinejoin="round"/>
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
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8v8a2 2 0 01-1 1.73l-7 4a2 2 0 01-2 0l-7-4A2 2 0 013 16V8a2 2 0 011-1.73l7-4a2 2 0 012 0l7 4A2 2 0 0121 8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V12" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12L3 8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l9-4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 5.5L12 8L7.5 5.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
