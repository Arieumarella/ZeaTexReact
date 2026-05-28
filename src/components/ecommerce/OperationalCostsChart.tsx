import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import DateRangeFilter from "../common/DateRangeFilter";
import ReactApexChart from "react-apexcharts";
import { useTheme } from "../../context/ThemeContext";

interface OperationalCost {
  kategori: string;
  jumlah: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export default function OperationalCostsChart() {
  const { theme } = useTheme();
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // State untuk perbaikan visual ketika data banyak
  const [limit, setLimit] = useState<number | "all">(10);
  const [sortBy, setSortBy] = useState<"jumlah-desc" | "jumlah-asc" | "kategori-asc">("jumlah-desc");
  const [showAllDetails, setShowAllDetails] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = await import("../../service/dashboardService").then(mod => mod.getDataOprasional(dateRange.startDate, dateRange.endDate));
      if (data) {
        setCosts(data);
      } else {
        setCosts([]);
      }
    }
    fetchData();
  }, [dateRange]);

  // Logika pengurutan biaya operasional
  const sortedCosts = [...costs].sort((a, b) => {
    if (sortBy === "jumlah-desc") {
      return b.jumlah - a.jumlah;
    }
    if (sortBy === "jumlah-asc") {
      return a.jumlah - b.jumlah;
    }
    if (sortBy === "kategori-asc") {
      return a.kategori.localeCompare(b.kategori);
    }
    return 0;
  });

  // Logika pembatasan data (limit/Top-N)
  const displayedCosts = limit === "all" ? sortedCosts : sortedCosts.slice(0, limit);

  const totalCosts = costs.reduce((sum, item) => sum + item.jumlah, 0);
  const maxCost = Math.max(...costs.map((item) => item.jumlah), 0) || 1;

  // Hitung tinggi chart secara dinamis agar bar tidak gepeng / bertumpukan
  const chartHeight = Math.max(250, displayedCosts.length * 38);

  // Batasi detail cards yang tampil secara default agar halaman tidak terlalu panjang
  const visibleGridCosts = showAllDetails ? displayedCosts : displayedCosts.slice(0, 6);

  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    theme: {
      mode: (theme === "dark" ? "dark" : "light") as "dark" | "light"
    },
    colors: ["#6366f1"], // Warna dasar Indigo
    fill: {
      type: "gradient",
      gradient: {
        shade: (theme === "dark" ? "dark" : "light") as "dark" | "light",
        type: "horizontal",
        shadeIntensity: 0.25,
        gradientToColors: ["#ec4899"], // Menuju Rose di ujung kanan bar
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.95,
        stops: [0, 100],
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "70%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories: displayedCosts.map((item) => item.kategori),
      labels: {
        style: { fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        style: { fontWeight: 600 },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      style: {
        fontSize: "12px",
        fontWeight: 700,
        colors: [theme === "dark" ? "#ffffff" : "#111111"], // teks putih di dark mode, hitam pekat di light mode
        textShadow: theme === "dark" ? "0 0 6px #000, 0 0 2px #000" : "0 0 6px #fff, 0 0 2px #fff"
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Biaya (Rupiah)",
      data: displayedCosts.map((item) => item.jumlah),
    },
  ];

  return (
    <ComponentCard title="Rekapan Biaya Operasional">
      <DateRangeFilter onDateRangeChange={setDateRange} />

      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-6 shadow-md dark:border-indigo-900/30 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/20 dark:bg-indigo-950/10">
        {/* Panel Kontrol Filter & Urutkan */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 dark:border-indigo-900/20 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Tampilkan:</span>
            <div className="flex rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-900/40 overflow-hidden">
              {([5, 10, 20, "all"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLimit(opt)}
                  className={`px-3 py-1.5 text-xs font-semibold border-r last:border-0 border-indigo-100 dark:border-indigo-900/30 transition-all cursor-pointer ${
                    limit === opt
                      ? "bg-indigo-600 text-white shadow-inner"
                      : "bg-white text-indigo-600 hover:bg-indigo-50 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
                  }`}
                >
                  {opt === "all" ? "Semua" : `Top ${opt}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200 whitespace-nowrap">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full min-w-0 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-indigo-900/40 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="jumlah-desc">Termahal (Tinggi-Rendah)</option>
              <option value="jumlah-asc">Termurah (Rendah-Tinggi)</option>
              <option value="kategori-asc">Nama Kategori (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Chart dengan scroll vertikal/horizontal jika data sangat banyak */}
        {displayedCosts.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
            Tidak ada data biaya operasional pada periode ini
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-900/50">
            <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={chartHeight} />
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20 shadow-sm border border-indigo-100 dark:border-indigo-900/40">
            <p className="text-sm text-indigo-600 dark:text-indigo-400">Total Biaya Operasional</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">Rp {totalCosts.toLocaleString()}</p>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {visibleGridCosts.map((item, idx) => (
                <div key={idx} className="rounded-lg bg-white dark:bg-gray-800/50 border border-indigo-100 dark:border-indigo-900/40 p-3 shadow-sm flex flex-col justify-between">
                  <p className="font-semibold text-indigo-700 dark:text-indigo-200 mb-1">{item.kategori}</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Rp {item.jumlah.toLocaleString()}</p>
                  <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
                      style={{ width: `${(item.jumlah / maxCost) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Tampilkan Lebih Banyak untuk Grid Card */}
            {displayedCosts.length > 6 && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllDetails(!showAllDetails)}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30 cursor-pointer"
                >
                  {showAllDetails ? (
                    <>
                      Sembunyikan Detail
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Tampilkan Semua Detail ({displayedCosts.length})
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
