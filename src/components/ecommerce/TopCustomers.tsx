import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import DateRangeFilter from "../common/DateRangeFilter";
import ReactApexChart from "react-apexcharts";
import { TopCustomerData } from "../../service/dashboardService";

export default function TopCustomers() {
  const [customers, setCustomers] = useState<TopCustomerData[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    import("../../service/dashboardService").then(mod => {
      mod.getDataPelanggan(dateRange.startDate, dateRange.endDate).then((data: TopCustomerData[] | null) => {
        if (data) {
          setCustomers(data);
        } else {
          setCustomers([]);
        }
      });
    });
  }, [dateRange]);

  const chartOptions = {
    chart: {
      type: "donut" as const,
    },
    colors: [
      "#2563eb", // biru
      "#10b981", // hijau
      "#f59e0b", // kuning
      "#ef4444", // merah
      "#6366f1", // ungu
    ],
    labels: customers.map((c) => c.nama),
    legend: {
      position: "bottom" as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ["#111"], // hitam pekat agar kontras
        fontWeight: 900,
        fontSize: "16px",
        textShadow: "0 0 6px #fff, 0 0 2px #fff",
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 6,
        color: '#fff',
        opacity: 1,
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '15px',
        fontWeight: 700,
        color: '#111',
      },
      fillSeriesColor: false,
      theme: 'light',
      custom: function({ series, seriesIndex, w }: { series: number[]; seriesIndex: number; w: any }) {
        const name = w.globals.labels[seriesIndex];
        const value = series[seriesIndex].toLocaleString();
        return `
          <div style='
            background: #fff;
            border: 1.5px solid #3b82f6;
            box-shadow: 0 2px 8px rgba(59,130,246,0.08);
            padding: 7px 12px;
            border-radius: 8px;
            color: #1e293b;
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 0.2px;
            text-align: left;
            min-width: 100px;
          '>
            <div style='font-size:12px;font-weight:500;margin-bottom:2px;'>${name}</div>
            <div style='font-size:14px;font-weight:700;color:#2563eb;'>${value}x</div>
          </div>
        `;
      },
    },
  };

  const chartSeries = customers.map((c) => c.pembelian);

  return (
    <ComponentCard title="Pelanggan Paling Banyak Membeli">
      <DateRangeFilter onDateRangeChange={setDateRange} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <ReactApexChart options={chartOptions} series={chartSeries} type="donut" height={250} />
        </div>
        <div className="space-y-3">
          {customers.map((customer, idx) => (
            <div key={idx} className="rounded-lg border border-gray-100 p-3 bg-gradient-to-r from-white via-blue-50 to-blue-100 dark:from-gray-900 dark:via-indigo-900 dark:to-indigo-950 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-blue-900 dark:text-blue-200">{customer.nama}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Nilai: Rp {customer.totalNilai.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/40">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-200">{customer.pembelian}x</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ComponentCard>
  );
}
