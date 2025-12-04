import { useState, useEffect } from "react";
import ComponentCard from "../common/ComponentCard";
import DateRangeFilter from "../common/DateRangeFilter";
import ReactApexChart from "react-apexcharts";
import { getTopSellingItems } from "../../service/dashboardService";

interface TopItem {
  nama: string;
  terjual: number;
  revenue: number;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

function formatRevenue(value: number) {
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(0)}Jt`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}Rb`;
  } else {
    return `Rp ${value}`;
  }
}

export default function TopSellingItems() {
  const [items, setItems] = useState<TopItem[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      const itemsData = await getTopSellingItems(dateRange.startDate, dateRange.endDate);
      if (itemsData) {
        setItems(itemsData);
      } else {
        setItems([]);
      }
    };
    fetchData();
  }, [dateRange]);

  const chartOptions = {
    chart: {
      type: "bar" as const,
      toolbar: { show: false },
    },
    colors: ["#10b981"],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "70%",
      },
    },
    xaxis: {
      categories: items.map((item) => item.nama),
    },
    dataLabels: {
      enabled: false,
    },
  };

  const chartSeries = [
    {
      name: "Terjual (Unit)",
      data: items.map((item) => item.terjual),
    },
  ];

  return (
    <ComponentCard title="Barang Paling Laku Terjual">
      <DateRangeFilter onDateRangeChange={setDateRange} />

      <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={200} />

      <div className="mt-2 space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/30 dark:bg-emerald-900/10">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <span className="text-xs font-bold">{idx + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.nama}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Rp {item.revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex-shrink-0 text-right ml-2">
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{item.terjual}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yard</p>
            </div>
          </div>
        ))}
      </div>
    </ComponentCard>
  );
}
