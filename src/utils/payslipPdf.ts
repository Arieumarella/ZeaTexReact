import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { PayrollDetail, Payslip } from '../types/hr';
import { formatRupiah } from './hrFormat';

export function downloadPayslipPdf(payslip: Payslip, payrollLabel: string) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('SLIP GAJI PEGAWAI', 105, 18, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Zea Textile', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Periode: ${payrollLabel}`, 14, 35);
  doc.text(`Nama: ${payslip.employee_name_snapshot || '-'}`, 14, 41);
  doc.text(`Jabatan: ${payslip.position_snapshot || '-'}`, 14, 47);
  doc.text(`Kode: ${payslip.employee_code_snapshot || '-'}`, 14, 53);
  doc.text(`Cabang: ${payslip.store_name_snapshot || '-'}`, 14, 59);
  doc.text(`Bank: ${payslip.bank_name_snapshot || '-'} ${payslip.bank_account_snapshot || ''}`, 14, 65);

  const rows: [string, string][] = [
    ['Gaji Pokok', formatRupiah(payslip.base_salary)],
    [`Uang Makan (${payslip.total_present_days} hari)`, formatRupiah(payslip.meal_allowance_amount)],
    [`Uang Transport (${payslip.total_present_days} hari)`, formatRupiah(payslip.transport_allowance_amount)],
    [`Lembur (${payslip.total_overtime_hours} jam)`, formatRupiah(payslip.overtime_pay)],
    ['Bonus', formatRupiah(payslip.bonus_amount)],
    ['Potongan Telat', `- ${formatRupiah(payslip.late_deduction_amount)}`],
    ['Potongan Alpha', `- ${formatRupiah(payslip.absence_deduction_amount)}`],
    ['Potongan Cuti Tanpa Gaji', `- ${formatRupiah(payslip.unpaid_leave_deduction_amount)}`],
    ['Potongan Lupa Absen Pulang', `- ${formatRupiah(payslip.missing_checkout_deduction_amount)}`],
    ['Potongan Kasbon', `- ${formatRupiah(payslip.loan_deduction_amount)}`],
    ['Potongan Lain', `- ${formatRupiah(payslip.other_deduction_amount)}`],
  ];

  autoTable(doc, {
    startY: 72,
    head: [['Keterangan', 'Jumlah']],
    body: rows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  const summaryY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120;

  autoTable(doc, {
    startY: summaryY + 8,
    head: [['Ringkasan', 'Jumlah']],
    body: [
      ['Hari Kerja', String(payslip.total_working_days)],
      ['Hadir', String(payslip.total_present_days)],
      ['Alpha', String(payslip.total_absent_days)],
      ['Total Pendapatan', formatRupiah(payslip.gross_salary)],
      ['Total Potongan', formatRupiah(payslip.total_deduction)],
      ['GAJI BERSIH', formatRupiah(payslip.net_salary)],
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  const safeName = (payslip.employee_name_snapshot || `pegawai-${payslip.user_id}`).replace(/[^\w\d-]+/g, '-');
  doc.save(`slip-gaji-${safeName}-${payrollLabel.replace(/[^\w\d-]+/g, '-')}.pdf`);
}

export function exportBankTransferCsv(payroll: PayrollDetail) {
  const escape = (value: string | number | null | undefined) => {
    const text = String(value ?? '').replace(/"/g, '""');
    return `"${text}"`;
  };

  const header = ['No', 'Nama Pegawai', 'Bank', 'No Rekening', 'Nominal Transfer', 'Cabang', 'Keterangan'];
  const rows = payroll.payslips.map((payslip, index) => [
    index + 1,
    payslip.employee_name_snapshot || '-',
    payslip.bank_name_snapshot || '-',
    payslip.bank_account_snapshot || '-',
    payslip.net_salary,
    payslip.store_name_snapshot || '-',
    payroll.period_name,
  ]);

  const csv = '\uFEFF' + [header, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transfer-bank-${payroll.period_name.replace(/[^\w\d-]+/g, '-')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPayrollExcel(payroll: PayrollDetail) {
  const rows = payroll.payslips.map((payslip) => ({
    'Nama': payslip.employee_name_snapshot || '-',
    'Kode': payslip.employee_code_snapshot || '-',
    'Cabang': payslip.store_name_snapshot || '-',
    'Bank': payslip.bank_name_snapshot || '-',
    'No Rekening': payslip.bank_account_snapshot || '-',
    'Hari Kerja': payslip.total_working_days,
    'Hadir': payslip.total_present_days,
    'Alpha': payslip.total_absent_days,
    'Gaji Pokok': payslip.base_salary,
    'Uang Makan': payslip.meal_allowance_amount,
    'Uang Transport': payslip.transport_allowance_amount,
    'Lembur': payslip.overtime_pay,
    'Bonus': payslip.bonus_amount,
    'Total Pendapatan': payslip.gross_salary,
    'Potongan Telat': payslip.late_deduction_amount,
    'Potongan Alpha': payslip.absence_deduction_amount,
    'Potongan Cuti Tanpa Gaji': payslip.unpaid_leave_deduction_amount,
    'Potongan Lupa Absen': payslip.missing_checkout_deduction_amount,
    'Potongan Kasbon': payslip.loan_deduction_amount,
    'Potongan Lain': payslip.other_deduction_amount,
    'Total Potongan': payslip.total_deduction,
    'GAJI BERSIH': payslip.net_salary,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Gaji');
  XLSX.writeFile(workbook, `rekap-${payroll.period_name.replace(/[^\w\d-]+/g, '-')}.xlsx`);
}
