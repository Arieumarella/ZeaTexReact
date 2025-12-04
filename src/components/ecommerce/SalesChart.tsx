import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { getChartPenjualan } from "../../service/dashboardService";

const FILTER_OPTIONS = [
  { label: "Harian", value: "harian" },
  { label: "Mingguan", value: "mingguan" },
  { label: "Bulanan", value: "bulanan" },
  { label: "Tahunan", value: "tahunan" },
];

interface ChartDataItem {
  label: string;
  penjualan: number;
  pengeluaran: number;
}

export default function SalesChart() {
  const [filter, setFilter] = useState("bulanan");
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getChartPenjualan(filter);
      if (data) {
        setChartData(data);
      } else {
        setChartData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [filter]);

  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    colors: ["#10b981", "#f59e0b"], // emerald & orange
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 6,
        dataLabels: {
          position: "top" as const,
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: 700,
        colors: ["#065f46", "#b45309"],
      },
      offsetY: -8,
      formatter: (val: number) => `Rp ${val.toLocaleString()}`,
    },
    xaxis: {
      categories: chartData.map((d) => d.label),
      labels: {
        style: {
          colors: ["#065f46"],
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      title: { text: "Nilai (Rupiah)" },
      labels: {
        formatter: (val: number) => `Rp ${val.toLocaleString()}`,
        style: {
          colors: ["#065f46"],
          fontWeight: 600,
        },
      },
    },
    legend: {
      position: "top" as const,
      fontWeight: 700,
      labels: {
        colors: ["#10b981", "#f59e0b"],
      },
    },
    grid: {
      show: true,
      borderColor: "#e0e7ef",
      strokeDashArray: 4,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      },
    },
  };

  const chartSeries = [
    {
      name: "Penjualan",
      data: chartData.map((d) => d.penjualan),
    },
    {
      name: "Pengeluaran",
      data: chartData.map((d) => d.pengeluaran),
    },
  ];

  // Info summary
  const totalPenjualan = chartData.reduce((a, b) => a + b.penjualan, 0);
  const totalPengeluaran = chartData.reduce((a, b) => a + b.pengeluaran, 0);
  const margin = totalPenjualan - totalPengeluaran;

  return (
    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-orange-50 p-6 shadow-md dark:border-emerald-900/30 dark:bg-emerald-950/10">
      <div className="mb-4 flex gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`px-3 py-1 rounded font-medium border transition-colors text-sm ${
              filter === opt.value
                ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="rounded-lg bg-emerald-100 text-emerald-800 px-2 py-1 font-semibold text-center border border-emerald-300 text-sm">
          Total Penjualan<br />
          <span className="text-base">Rp {totalPenjualan.toLocaleString()}</span>
        </div>
        <div className="rounded-lg bg-orange-100 text-orange-800 px-2 py-1 font-semibold text-center border border-orange-300 text-sm">
          Total Pengeluaran<br />
          <span className="text-base">Rp {totalPengeluaran.toLocaleString()}</span>
        </div>
        <div className={`rounded-lg px-2 py-1 font-semibold text-center border text-sm ${margin >= 0 ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-red-100 text-red-800 border-red-300"}`}>
          Margin Keuntungan<br />
          <span className="text-base">Rp {margin.toLocaleString()}</span>
        </div>
      </div>
      {loading ? (
        <div className="h-56 flex items-center justify-center animate-pulse text-gray-400">Loading chart...</div>
      ) : (
        <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={300} />
      )}
    </div>
  );
}
