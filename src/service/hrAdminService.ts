import { API_BASE, getAuthHeaders } from './apiHelper';
import { getApiErrorMessage, getErrorMessage } from '../utils/errorMessage';
import type {
  ApprovalSummary,
  Attendance,
  AttendanceRecapRow,
  AvailableUser,
  CorrectionRequest,
  EmployeeLoan,
  EmployeeProfile,
  Holiday,
  HrDashboardData,
  HrShift,
  HrStoreConfig,
  LeaveRequest,
  OvertimeRequest,
  Payroll,
  PayrollDetail,
  Payslip,
  RequestStatus,
  SalaryHistoryRow,
} from '../types/hr';

type BasicResponse = { status: boolean; message?: string };

async function parseResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

// ===================== Store config =====================

export async function getStoreConfigs(): Promise<{ status: boolean; data?: HrStoreConfig[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/store-configs`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: HrStoreConfig[]; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil konfigurasi HR toko.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil konfigurasi HR toko.') };
  }
}

export async function updateStoreConfig(
  storeId: number,
  payload: Partial<HrStoreConfig>,
): Promise<{ status: boolean; data?: HrStoreConfig; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/store-configs/${storeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: HrStoreConfig; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menyimpan konfigurasi toko.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menyimpan konfigurasi toko.') };
  }
}

// ===================== Holidays =====================

export async function listHolidays(storeId?: number): Promise<{ status: boolean; data?: Holiday[]; message?: string }> {
  try {
    const query = storeId ? `?store_id=${storeId}` : '';
    const response = await fetch(`${API_BASE}/api/hr/holidays${query}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: Holiday[]; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil daftar hari libur.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil daftar hari libur.') };
  }
}

export async function createHoliday(payload: { store_id: number; holiday_date: string; name: string }): Promise<BasicResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/holidays`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<BasicResponse>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menambah hari libur.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menambah hari libur.') };
  }
}

export async function deleteHoliday(id: number): Promise<BasicResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/holidays/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<BasicResponse>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menghapus hari libur.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menghapus hari libur.') };
  }
}

// ===================== Shifts =====================

export async function listShifts(
  storeId?: number,
): Promise<{ status: boolean; data?: HrShift[]; message?: string }> {
  try {
    const query = storeId ? `?store_id=${storeId}` : '';
    const response = await fetch(`${API_BASE}/api/hr/shifts${query}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: HrShift[]; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil data shift.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil data shift.') };
  }
}

export async function createShift(payload: {
  store_id: number;
  name: string;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
}): Promise<{ status: boolean; data?: HrShift; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/shifts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: HrShift; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menambah shift.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menambah shift.') };
  }
}

export async function updateShift(
  id: number,
  payload: Partial<HrShift>,
): Promise<{ status: boolean; data?: HrShift; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/shifts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: HrShift; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memperbarui shift.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memperbarui shift.') };
  }
}

export async function deleteShift(id: number): Promise<BasicResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/shifts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<BasicResponse>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menghapus shift.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menghapus shift.') };
  }
}

// ===================== Dashboard =====================

export async function getHrDashboard(): Promise<{ status: boolean; data?: HrDashboardData; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/dashboard`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: HrDashboardData; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil ringkasan HR.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil ringkasan HR.') };
  }
}

// ===================== Employees =====================

export interface EmployeeListParams {
  page?: number;
  take?: number;
  search?: string;
  store_id?: number;
  is_active?: boolean;
}

export async function listEmployees(
  params: EmployeeListParams = {},
): Promise<{ status: boolean; data?: EmployeeProfile[]; total?: number; totalPages?: number; page?: number; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.take) query.set('take', String(params.take));
    if (params.search) query.set('search', params.search);
    if (params.store_id !== undefined) query.set('store_id', String(params.store_id));
    if (params.is_active !== undefined) query.set('is_active', params.is_active ? 'true' : 'false');
    const response = await fetch(`${API_BASE}/api/hr/employees?${query.toString()}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: EmployeeProfile[]; total?: number; totalPages?: number; page?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil data pegawai.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil data pegawai.') };
  }
}

export async function getEmployee(userId: number): Promise<{ status: boolean; data?: EmployeeProfile; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/employees/${userId}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: EmployeeProfile; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil detail pegawai.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil detail pegawai.') };
  }
}

export async function updateEmployee(
  userId: number,
  payload: Partial<EmployeeProfile>,
): Promise<{ status: boolean; data?: EmployeeProfile; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/employees/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: EmployeeProfile; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menyimpan data pegawai.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menyimpan data pegawai.') };
  }
}

export async function getSalaryHistory(
  userId: number,
): Promise<{ status: boolean; data?: SalaryHistoryRow[]; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/employees/${userId}/salary-history`, {
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{ status: boolean; data?: SalaryHistoryRow[]; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil riwayat gaji.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil riwayat gaji.') };
  }
}

export interface AvailableUserParams {
  page?: number;
  take?: number;
  search?: string;
  store_id?: number;
}

export async function listAvailableUsers(
  params: AvailableUserParams = {},
): Promise<{ status: boolean; data?: AvailableUser[]; total?: number; totalPages?: number; page?: number; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.take) query.set('take', String(params.take));
    if (params.search) query.set('search', params.search);
    if (params.store_id !== undefined) query.set('store_id', String(params.store_id));
    const response = await fetch(`${API_BASE}/api/hr/available-users?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{
      status: boolean;
      data?: AvailableUser[];
      total?: number;
      totalPages?: number;
      page?: number;
      message?: string;
    }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil daftar user.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil daftar user.') };
  }
}

export async function deleteEmployee(
  userId: number,
): Promise<{ status: boolean; deactivated?: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/employees/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{ status: boolean; deactivated?: boolean; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menghapus pegawai.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menghapus pegawai.') };
  }
}

// ===================== Attendances =====================

export interface AttendanceListParams {
  page?: number;
  take?: number;
  store_id?: number;
  start_date?: string;
  end_date?: string;
  status?: string;
  search?: string;
}

export async function listAttendances(
  params: AttendanceListParams = {},
): Promise<{ status: boolean; data?: Attendance[]; total?: number; totalPages?: number; page?: number; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.take) query.set('take', String(params.take));
    if (params.store_id !== undefined) query.set('store_id', String(params.store_id));
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const response = await fetch(`${API_BASE}/api/hr/attendances?${query.toString()}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: Attendance[]; total?: number; totalPages?: number; page?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil data absensi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil data absensi.') };
  }
}

export interface AttendanceRecapParams {
  start_date?: string;
  end_date?: string;
  store_id?: number;
  search?: string;
}

export async function getAttendanceRecap(
  params: AttendanceRecapParams = {},
): Promise<{ status: boolean; data?: AttendanceRecapRow[]; start_date?: string | null; end_date?: string | null; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.start_date) query.set('start_date', params.start_date);
    if (params.end_date) query.set('end_date', params.end_date);
    if (params.store_id !== undefined) query.set('store_id', String(params.store_id));
    if (params.search) query.set('search', params.search);
    const response = await fetch(`${API_BASE}/api/hr/attendances/recap?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{
      status: boolean;
      data?: AttendanceRecapRow[];
      start_date?: string | null;
      end_date?: string | null;
      message?: string;
    }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil rekap absensi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil rekap absensi.') };
  }
}

export async function updateAttendance(
  id: number,
  payload: { check_in_time?: string; check_out_time?: string; status?: string; late_minutes?: number; notes?: string },
): Promise<{ status: boolean; data?: Attendance; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendances/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: Attendance; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memperbarui absensi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memperbarui absensi.') };
  }
}

// ===================== Approvals =====================

export async function approvalSummary(): Promise<{ status: boolean; data?: ApprovalSummary; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/approvals/summary`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: ApprovalSummary; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil ringkasan approval.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil ringkasan approval.') };
  }
}

export type ApprovalType = 'leave' | 'overtime' | 'correction' | 'loan';
export type ApprovalRow = LeaveRequest | OvertimeRequest | CorrectionRequest | EmployeeLoan;

export async function listApprovals(
  type: ApprovalType,
  params: { page?: number; take?: number; status?: RequestStatus; store_id?: number } = {},
): Promise<{ status: boolean; data?: ApprovalRow[]; total?: number; totalPages?: number; page?: number; message?: string }> {
  try {
    const query = new URLSearchParams({ type });
    if (params.page) query.set('page', String(params.page));
    if (params.take) query.set('take', String(params.take));
    if (params.status) query.set('status', params.status);
    if (params.store_id !== undefined) query.set('store_id', String(params.store_id));
    const response = await fetch(`${API_BASE}/api/hr/approvals?${query.toString()}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: ApprovalRow[]; total?: number; totalPages?: number; page?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil daftar pengajuan.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil daftar pengajuan.') };
  }
}

export async function approvalAction(
  type: ApprovalType,
  id: number,
  action: 'approve' | 'reject',
  adminNotes?: string,
): Promise<{ status: boolean; data?: ApprovalRow; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/approvals/${type}/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, admin_notes: adminNotes || undefined }),
    });
    const data = await parseResponse<{ status: boolean; data?: ApprovalRow; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memproses pengajuan.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memproses pengajuan.') };
  }
}

// ===================== Payrolls =====================

export async function generatePayroll(payload: {
  store_id?: number | null;
  period_name: string;
  cutoff_start_date: string;
  cutoff_end_date: string;
}): Promise<{
  status: boolean;
  blocked?: boolean;
  details?: { leave: number; overtime: number; correction: number; loan: number };
  data?: { id: number; total_employees: number; total_gross: number; total_deduction: number; total_net: number };
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payrolls/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{
      status: boolean;
      blocked?: boolean;
      details?: { leave: number; overtime: number; correction: number; loan: number };
      data?: { id: number; total_employees: number; total_gross: number; total_deduction: number; total_net: number };
      message?: string;
    }>(response);
    if (!response.ok || !data?.status) {
      return {
        status: false,
        blocked: Boolean(data?.blocked),
        details: data?.details,
        message: getApiErrorMessage(data, 'Gagal membuat payroll.'),
      };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal membuat payroll.') };
  }
}

export async function listPayrolls(params: { page?: number; take?: number; status?: string } = {}): Promise<{
  status: boolean;
  data?: Payroll[];
  total?: number;
  totalPages?: number;
  page?: number;
  message?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.take) query.set('take', String(params.take));
    if (params.status) query.set('status', params.status);
    const response = await fetch(`${API_BASE}/api/hr/payrolls?${query.toString()}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: Payroll[]; total?: number; totalPages?: number; page?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil daftar payroll.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil daftar payroll.') };
  }
}

export async function getPayroll(id: number): Promise<{ status: boolean; data?: PayrollDetail; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payrolls/${id}`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: PayrollDetail; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengambil detail payroll.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengambil detail payroll.') };
  }
}

export async function updatePayslip(
  payrollId: number,
  payslipId: number,
  payload: { bonus_amount?: number; other_deduction_amount?: number },
): Promise<{ status: boolean; data?: Payslip; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payrolls/${payrollId}/payslips/${payslipId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: Payslip; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memperbarui slip gaji.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memperbarui slip gaji.') };
  }
}

export async function finalizePayroll(id: number): Promise<BasicResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payrolls/${id}/finalize`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<BasicResponse>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memfinalisasi payroll.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memfinalisasi payroll.') };
  }
}

export async function deletePayroll(id: number): Promise<BasicResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payrolls/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<BasicResponse>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal menghapus payroll.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal menghapus payroll.') };
  }
}
