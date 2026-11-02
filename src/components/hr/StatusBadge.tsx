const STATUS_STYLES: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  LATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SICK: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  ANNUAL_LEAVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  UNPAID_LEAVE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  FIELD_DUTY: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  ALPHA: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  APPROVED_ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PAID_OFF: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  FINAL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  SICK: 'Sakit',
  ANNUAL_LEAVE: 'Cuti Tahunan',
  UNPAID_LEAVE: 'Cuti Tanpa Gaji',
  FIELD_DUTY: 'Dinas Luar',
  ALPHA: 'Alpha',
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  APPROVED_ACTIVE: 'Aktif',
  PAID_OFF: 'Lunas',
  DRAFT: 'Draft',
  FINAL: 'Final',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${style}`}>
      {label}
    </span>
  );
}
