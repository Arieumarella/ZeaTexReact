import { useState } from "react";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  onDateRangeChange: (dateRange: DateRange) => void;
}

export default function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    onDateRangeChange({ startDate: newStartDate, endDate });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    onDateRangeChange({ startDate, endDate: newEndDate });
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const newStartDate = start.toISOString().split("T")[0];
    const newEndDate = end.toISOString().split("T")[0];

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateRangeChange({ startDate: newStartDate, endDate: newEndDate });
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        <button
          onClick={() => handleQuickRange(7)}
          className="rounded bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          7H
        </button>
        <button
          onClick={() => handleQuickRange(30)}
          className="rounded bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          30H
        </button>
        <button
          onClick={() => handleQuickRange(90)}
          className="rounded bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          90H
        </button>
        <button
          onClick={() => handleQuickRange(365)}
          className="rounded bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          1T
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Dari:</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 w-full sm:w-auto"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Ke:</label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400 w-full sm:w-auto"
          />
        </div>
      </div>
    </div>
  );
}
