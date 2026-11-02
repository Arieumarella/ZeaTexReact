import { API_BASE, getAuthHeaders } from './apiHelper';
import { getApiErrorMessage, getErrorMessage } from '../utils/errorMessage';
import type {
  Attendance,
  CorrectionRequest,
  EmployeeLoan,
  LeaveRequest,
  MyToday,
  OvertimeRequest,
  Payslip,
} from '../types/hr';

async function parseResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getMyToday(): Promise<{ status: boolean; data?: MyToday; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendance/me`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: MyToday; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat data absensi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat data absensi.') };
  }
}

export async function clockInOut(formData: FormData): Promise<{ status: boolean; data?: Attendance; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendance/clock`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await parseResponse<{ status: boolean; data?: Attendance; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Absensi gagal diproses.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Absensi gagal diproses.') };
  }
}

export async function getMyHistory(page = 1): Promise<{
  status: boolean;
  data?: Attendance[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendance/history?page=${page}&take=10`, {
      headers: getAuthHeaders(),
    });
    const data = await parseResponse<{ status: boolean; data?: Attendance[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat riwayat absensi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat riwayat absensi.') };
  }
}

export async function createLeaveRequest(formData: FormData): Promise<{ status: boolean; data?: LeaveRequest; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/leave-requests`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await parseResponse<{ status: boolean; data?: LeaveRequest; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengirim pengajuan cuti.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengirim pengajuan cuti.') };
  }
}

export async function listMyLeaveRequests(page = 1): Promise<{
  status: boolean;
  data?: LeaveRequest[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/leave-requests?page=${page}&take=10`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: LeaveRequest[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat pengajuan cuti.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat pengajuan cuti.') };
  }
}

export async function createOvertimeRequest(payload: {
  overtime_date: string;
  start_time: string;
  end_time: string;
  reason: string;
}): Promise<{ status: boolean; data?: OvertimeRequest; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/overtime-requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: OvertimeRequest; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengirim pengajuan lembur.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengirim pengajuan lembur.') };
  }
}

export async function listMyOvertimeRequests(page = 1): Promise<{
  status: boolean;
  data?: OvertimeRequest[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/overtime-requests?page=${page}&take=10`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: OvertimeRequest[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat pengajuan lembur.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat pengajuan lembur.') };
  }
}

export async function createCorrectionRequest(formData: FormData): Promise<{ status: boolean; data?: CorrectionRequest; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendance-corrections`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await parseResponse<{ status: boolean; data?: CorrectionRequest; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengirim pengajuan koreksi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengirim pengajuan koreksi.') };
  }
}

export async function listMyCorrections(page = 1): Promise<{
  status: boolean;
  data?: CorrectionRequest[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/attendance-corrections?page=${page}&take=10`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: CorrectionRequest[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat pengajuan koreksi.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat pengajuan koreksi.') };
  }
}

export async function createLoanRequest(payload: {
  total_amount: number;
  monthly_installment: number;
  loan_date: string;
  reason: string;
}): Promise<{ status: boolean; data?: EmployeeLoan; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/loans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await parseResponse<{ status: boolean; data?: EmployeeLoan; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal mengirim pengajuan kasbon.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal mengirim pengajuan kasbon.') };
  }
}

export async function listMyLoans(page = 1): Promise<{
  status: boolean;
  data?: EmployeeLoan[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/loans?page=${page}&take=10`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: EmployeeLoan[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat data kasbon.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat data kasbon.') };
  }
}

export async function myPayslips(page = 1): Promise<{
  status: boolean;
  data?: Payslip[];
  total?: number;
  totalPages?: number;
  message?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/api/hr/payslips/me?page=${page}&take=10`, { headers: getAuthHeaders() });
    const data = await parseResponse<{ status: boolean; data?: Payslip[]; total?: number; totalPages?: number; message?: string }>(response);
    if (!response.ok || !data?.status) {
      return { status: false, message: getApiErrorMessage(data, 'Gagal memuat slip gaji.') };
    }
    return data;
  } catch (error) {
    return { status: false, message: getErrorMessage(error, 'Gagal memuat slip gaji.') };
  }
}
