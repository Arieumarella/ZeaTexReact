interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-4 text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        Halaman {page} dari {totalPages}
      </span>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Sebelumnya
      </button>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Berikutnya
      </button>
    </div>
  );
}
