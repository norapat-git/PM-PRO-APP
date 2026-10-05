export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'submitted' | 'assigned' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled';
export type MachineStatus = 'operational' | 'warning' | 'breakdown' | 'maintenance';
export type QuotationStatus = 'requested' | 'drafting' | 'sent_to_client' | 'approved' | 'rejected' | 'preparing_parts' | 'delivered';
export type UserRole = 'customer' | 'technician' | 'manager';

export interface Factory {
  id: string;
  code: string;
  name: string;
  location: string;
  contact_person: string;
  contact_phone: string;
}

export interface Machine {
  id: string;
  factory_id: string;
  factory_name?: string;
  name: string;
  serial_number: string;
  model: string;
  brand: string;
  department: string;
  installation_date: string;
  status: MachineStatus;
  next_pm_date: string;
  last_service_date: string;
  specs: Record<string, string | number>;
  qr_code: string;
}

export interface RepairTicket {
  id: string;
  ticket_number: string;
  machine_id: string | null;
  machine_name?: string;
  machine_serial?: string;
  factory_id?: string | null;
  factory_name?: string;
  customer_name: string;
  contact_phone: string;
  contact_email?: string;
  issue_type: string;
  urgency: UrgencyLevel;
  preferred_time: string;
  description: string;
  media_urls: string[];
  status: TicketStatus;
  assigned_technician?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SparePartUsed {
  part_number: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface ServiceReport {
  id: string;
  report_number: string;
  ticket_id: string | null;
  ticket_number?: string;
  machine_id: string | null;
  machine_name?: string;
  technician_name: string;
  service_date: string;
  service_type: 'corrective' | 'preventive' | 'inspection';
  summary_findings: string;
  action_taken: string;
  before_photos: string[];
  after_photos: string[];
  measurements: Record<string, string>;
  parts_used: SparePartUsed[];
  customer_signature?: string | null;
  customer_signed_by?: string | null;
  customer_signed_at?: string | null;
  status: 'draft' | 'submitted' | 'acknowledged';
  created_at: string;
}

export interface PMSchedule {
  id: string;
  machine_id: string;
  machine_name?: string;
  title: string;
  frequency_days: number;
  due_date: string;
  checklist: string[];
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  last_completed_at?: string;
}

export interface SparePart {
  id: string;
  part_number: string;
  name: string;
  category: string;
  unit_price: number;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface QuotationItem {
  part_number: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  company_name: string;
  contact_email?: string;
  contact_phone: string;
  ticket_id?: string | null;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total_amount: number;
  notes: string;
  status: QuotationStatus;
  created_at: string;
  updated_at: string;
}
