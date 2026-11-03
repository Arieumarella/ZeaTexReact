export interface HrStoreConfig {
  id: number;
  store_id: number;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
  late_penalty_per_occurrence: number;
  missing_checkout_penalty: number;
  work_days: string;
  toko?: {
    id: number;
    nama_toko?: string | null;
    alamat?: string | null;
    maps?: string | null;
  } | null;
}

export interface Holiday {
  id: number;
  store_id: number;
  holiday_date: string;
  name: string;
}

export interface UserBrief {
  id: number;
  username?: string | null;
  nama?: string | null;
  jabatan?: string | null;
  role?: string | null;
  no_tlp?: string | null;
}

export interface AvailableUser extends UserBrief {
  id_toko?: number | null;
  nama_toko?: string | null;
}

export interface HrShift {
  id: number;
  store_id: number;
  name: string;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
  is_active: boolean;
}

export interface SalaryHistoryRow {
  id: number;
  user_id: number;
  store_id: number;
  effective_date: string;
  position?: string | null;
  base_salary: number;
  notes?: string | null;
  created_by?: number | null;
}

export interface HrDashboardData {
  today: string;
  active_employees: number;
  total_employees: number;
  present_today: number;
  late_today: number;
  on_leave_today: number;
  alpha_today: number;
  pending: {
    leave: number;
    overtime: number;
    correction: number;
    loan: number;
    total: number;
  };
  payrolls: {
    draft: number;
    final: number;
  };
}

export interface EmployeeProfile {
  id: number;
  user_id: number;
  store_id: number;
  employee_code: string | null;
  nik: string | null;
  position: string | null;
  base_salary: number;
  fixed_meal_allowance: number;
  fixed_transport_allowance: number;
  overtime_rate_per_hour: number;
  bank_account: string | null;
  bank_name: string | null;
  annual_leave_quota: number;
  annual_leave_entitlement: number;
  leave_quota_year?: number;
  join_date: string | null;
  resign_date?: string | null;
  shift_id?: number | null;
  allow_any_store_checkin: boolean;
  is_active: boolean;
  user?: UserBrief | null;
  nama_toko?: string;
  toko?: { id: number; nama_toko?: string | null } | null;
  shift?: HrShift | null;
}

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "SICK"
  | "ANNUAL_LEAVE"
  | "UNPAID_LEAVE"
  | "FIELD_DUTY"
  | "ALPHA";

export interface Attendance {
  id: number;
  user_id: number;
  store_id: number;
  attendance_date: string;
  check_in_time?: string | null;
  check_in_photo?: string | null;
  check_in_photo_url?: string | null;
  check_in_latitude?: number | null;
  check_in_longitude?: number | null;
  check_in_distance_m?: number | null;
  check_in_accuracy_m?: number | null;
  check_out_time?: string | null;
  check_out_photo?: string | null;
  check_out_photo_url?: string | null;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  check_out_distance_m?: number | null;
  check_out_accuracy_m?: number | null;
  status: AttendanceStatus;
  late_minutes: number;
  notes?: string | null;
  user?: UserBrief | null;
  nama_toko?: string;
}

export interface AttendanceRecapRow {
  user_id: number;
  store_id: number;
  total_days: number;
  present: number;
  late: number;
  sick: number;
  annual_leave: number;
  unpaid_leave: number;
  field_duty: number;
  alpha: number;
  late_minutes: number;
  missing_checkout: number;
  user?: UserBrief | null;
  nama_toko?: string;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type LeaveType = "SICK" | "ANNUAL_LEAVE" | "UNPAID_LEAVE" | "FIELD_DUTY";

export interface LeaveRequest {
  id: number;
  user_id: number;
  store_id: number;
  type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  attachment?: string | null;
  attachment_url?: string | null;
  status: RequestStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  user?: UserBrief | null;
  nama_toko?: string;
}

export interface OvertimeRequest {
  id: number;
  user_id: number;
  store_id: number;
  overtime_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  reason: string;
  status: RequestStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  user?: UserBrief | null;
  nama_toko?: string;
}

export type CorrectionType = "LATE_DISPENSATION" | "MISSING_CHECKOUT";

export interface CorrectionRequest {
  id: number;
  user_id: number;
  store_id: number;
  attendance_date: string;
  correction_type: CorrectionType;
  requested_check_in_time?: string | null;
  requested_check_out_time?: string | null;
  reason: string;
  attachment?: string | null;
  attachment_url?: string | null;
  status: RequestStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  user?: UserBrief | null;
  nama_toko?: string;
}

export type LoanStatus = "PENDING" | "APPROVED_ACTIVE" | "REJECTED" | "PAID_OFF";

export interface EmployeeLoan {
  id: number;
  user_id: number;
  store_id: number;
  total_amount: number;
  monthly_installment: number;
  remaining_balance: number;
  loan_date: string;
  reason: string;
  status: LoanStatus;
  approved_by?: number | null;
  approved_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
  user?: UserBrief | null;
  nama_toko?: string;
}

export type PayrollStatus = "DRAFT" | "FINAL";

export interface Payroll {
  id: number;
  store_id: number | null;
  period_name: string;
  cutoff_start_date: string;
  cutoff_end_date: string;
  cutoff_start?: string;
  cutoff_end?: string;
  status: PayrollStatus;
  total_employees: number;
  total_gross: number;
  total_deduction: number;
  total_net: number;
  finalized_at?: string | null;
  nama_toko?: string;
}

export interface Payslip {
  id: number;
  payroll_id: number;
  user_id: number;
  store_id: number;
  store_name_snapshot?: string | null;
  employee_code_snapshot?: string | null;
  employee_name_snapshot?: string | null;
  position_snapshot?: string | null;
  bank_account_snapshot?: string | null;
  bank_name_snapshot?: string | null;
  period_start: string;
  period_end: string;
  base_salary: number;
  fixed_meal_allowance: number;
  fixed_transport_allowance: number;
  overtime_rate_per_hour: number;
  total_working_days: number;
  total_present_days: number;
  total_late_count: number;
  total_absent_days: number;
  total_unpaid_leave_days: number;
  total_missing_checkout_count: number;
  total_overtime_hours: number;
  meal_allowance_amount: number;
  transport_allowance_amount: number;
  overtime_pay: number;
  late_deduction_amount: number;
  absence_deduction_amount: number;
  unpaid_leave_deduction_amount: number;
  missing_checkout_deduction_amount: number;
  loan_deduction_amount: number;
  other_deduction_amount: number;
  bonus_amount: number;
  gross_salary: number;
  total_deduction: number;
  net_salary: number;
  loan_breakdown?: { loan_id: number; amount: number }[] | null;
  user?: UserBrief | null;
  nama_toko?: string | null;
  payroll?: {
    period_name: string;
    finalized_at?: string | null;
    status: string;
  };
}

export interface PayrollDetail extends Payroll {
  payslips: Payslip[];
}

export interface ApprovalSummary {
  leave: number;
  overtime: number;
  correction: number;
  loan: number;
  total: number;
}

export interface MyHrStore {
  id: number;
  nama_toko?: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  work_start_time: string;
  work_end_time: string;
  grace_period_minutes: number;
  work_days: string;
  location_configured: boolean;
  shift?: {
    id: number;
    name: string;
    work_start_time: string;
    work_end_time: string;
    grace_period_minutes: number;
  } | null;
}

export interface MyToday {
  server_time: string;
  today: string;
  attendance: Attendance | null;
  profile: EmployeeProfile;
  hr_store: MyHrStore;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  total: number;
  totalPages: number;
}
