import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import DateRangeFilter from "../common/DateRangeFilter";
import ReactApexChart from "react-apexcharts";

interface OperationalCost {
  kategori: string;
  jumlah: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

export default function OperationalCostsChart() {
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

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

  const totalCosts = costs.reduce((sum, item) => sum + item.jumlah, 0);
  const maxCost = Math.max(...costs.map((item) => item.jumlah));

  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    colors: ["#ef4444"],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "60%",
      },
    },
    xaxis: {
      categories: costs.map((item) => item.kategori),
      labels: {
        style: { fontWeight: 600 },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `Rp ${val.toLocaleString()}`,
      style: {
        fontSize: "13px",
        fontWeight: 700,
        colors: ["#111"], // hitam pekat
        textShadow: "0 0 6px #fff, 0 0 2px #fff"
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
      data: costs.map((item) => item.jumlah),
    },
  ];

  return (
    <ComponentCard title="Rekapan Biaya Operasional">
      <DateRangeFilter onDateRangeChange={setDateRange} />

      <div className="rounded-xl border border-red-200 bg-gradient-to-br from-white via-red-50 to-rose-50 p-6 shadow-md dark:border-red-900/30 dark:bg-red-950/10">
        <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={300} />

        <div className="mt-6 space-y-2">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20 shadow-sm border border-red-100 dark:border-red-900/40">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Biaya Operasional</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">Rp {totalCosts.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {costs.map((item, idx) => (
              <div key={idx} className="rounded-lg bg-white dark:bg-red-900/30 border border-red-100 dark:border-red-900/40 p-3 shadow-sm flex flex-col justify-between">
                <p className="font-semibold text-red-700 dark:text-red-200 mb-1">{item.kategori}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Rp {item.jumlah.toLocaleString()}</p>
                <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(item.jumlah / maxCost) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
