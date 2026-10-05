-- ================================================================
-- PM-PRO DATABASE SCHEMA FOR SUPABASE
-- Systems covered:
-- 1. Service Requests & Repair Tickets (แอปแจ้งซ่อมและขอบริการ)
-- 2. Field Service Reports (แอปรายงานงานบริการสำหรับช่าง)
-- 3. Machine Registry & Preventive Maintenance (ระบบประวัติเครื่องจักรและบำรุงรักษา)
-- 4. Quotations & Spare Parts Tracking (ระบบติดตามใบเสนอราคาและอะไหล่)
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. FACTORIES / CLIENT PLANTS (โรงงานและหน่วยงาน)
create table if not exists factories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  location text,
  contact_person text,
  contact_phone text,
  created_at timestamptz default now()
);

-- 2. MACHINES & EQUIPMENT (เครื่องจักรและอุปกรณ์)
create table if not exists machines (
  id uuid primary key default gen_random_uuid(),
  factory_id uuid references factories(id) on delete cascade,
  name text not null,
  serial_number text unique not null,
  model text,
  brand text,
  department text,
  installation_date date,
  status text default 'operational' check (status in ('operational', 'warning', 'breakdown', 'maintenance')),
  next_pm_date date,
  last_service_date date,
  specs jsonb default '{}'::jsonb,
  qr_code text,
  created_at timestamptz default now()
);

-- 3. REPAIR & SERVICE TICKETS (การแจ้งซ่อมและขอบริการ)
create table if not exists repair_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  machine_id uuid references machines(id) on delete set null,
  factory_id uuid references factories(id) on delete set null,
  customer_name text not null,
  contact_phone text not null,
  contact_email text,
  issue_type text not null,
  urgency text default 'medium' check (urgency in ('low', 'medium', 'high', 'critical')),
  preferred_time text,
  description text not null,
  media_urls jsonb default '[]'::jsonb,
  status text default 'submitted' check (status in ('submitted', 'assigned', 'in_progress', 'pending_approval', 'completed', 'cancelled')),
  assigned_technician text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. FIELD SERVICE REPORTS (รายงานหน้างานสำหรับช่าง)
create table if not exists service_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text unique not null,
  ticket_id uuid references repair_tickets(id) on delete set null,
  machine_id uuid references machines(id) on delete set null,
  technician_name text not null,
  service_date date default current_date,
  service_type text default 'corrective' check (service_type in ('corrective', 'preventive', 'inspection')),
  summary_findings text,
  action_taken text,
  before_photos jsonb default '[]'::jsonb,
  after_photos jsonb default '[]'::jsonb,
  measurements jsonb default '{}'::jsonb,
  parts_used jsonb default '[]'::jsonb,
  customer_signature text,
  customer_signed_by text,
  customer_signed_at timestamptz,
  status text default 'draft' check (status in ('draft', 'submitted', 'acknowledged')),
  created_at timestamptz default now()
);

-- 5. PREVENTIVE MAINTENANCE SCHEDULES (กำหนดการบำรุงรักษาเชิงป้องกัน)
create table if not exists pm_schedules (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references machines(id) on delete cascade,
  title text not null,
  frequency_days integer default 90,
  due_date date not null,
  checklist jsonb default '[]'::jsonb,
  status text default 'upcoming' check (status in ('upcoming', 'due_soon', 'overdue', 'completed')),
  last_completed_at timestamptz,
  created_at timestamptz default now()
);

-- 6. SPARE PARTS INVENTORY (คลังอะไหล่)
create table if not exists spare_parts (
  id uuid primary key default gen_random_uuid(),
  part_number text unique not null,
  name text not null,
  category text,
  unit_price numeric(12, 2) not null default 0,
  stock_quantity integer not null default 0,
  min_stock_level integer default 5,
  unit text default 'ชิ้น',
  compatible_machines jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 7. QUOTATIONS & RFQ (ใบเสนอราคาและคำขอราคา)
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text unique not null,
  customer_name text not null,
  company_name text not null,
  contact_email text,
  contact_phone text,
  ticket_id uuid references repair_tickets(id) on delete set null,
  items jsonb default '[]'::jsonb,
  subtotal numeric(12, 2) default 0,
  discount numeric(12, 2) default 0,
  vat numeric(12, 2) default 0,
  total_amount numeric(12, 2) default 0,
  notes text,
  status text default 'requested' check (status in ('requested', 'drafting', 'sent_to_client', 'approved', 'rejected', 'preparing_parts', 'delivered')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_machines_factory on machines(factory_id);
create index if not exists idx_tickets_machine on repair_tickets(machine_id);
create index if not exists idx_tickets_status on repair_tickets(status);
create index if not exists idx_reports_ticket on service_reports(ticket_id);
create index if not exists idx_pm_machine on pm_schedules(machine_id);
create index if not exists idx_quotations_status on quotations(status);

-- Enable Row Level Security (RLS)
alter table factories enable row level security;
alter table machines enable row level security;
alter table repair_tickets enable row level security;
alter table service_reports enable row level security;
alter table pm_schedules enable row level security;
alter table spare_parts enable row level security;
alter table quotations enable row level security;

-- Default permissive policies for API backend with anon/publishable access or authenticated service
create policy "Allow all operations for service backend" on factories for all using (true) with check (true);
create policy "Allow all operations for service backend" on machines for all using (true) with check (true);
create policy "Allow all operations for service backend" on repair_tickets for all using (true) with check (true);
create policy "Allow all operations for service backend" on service_reports for all using (true) with check (true);
create policy "Allow all operations for service backend" on pm_schedules for all using (true) with check (true);
create policy "Allow all operations for service backend" on spare_parts for all using (true) with check (true);
create policy "Allow all operations for service backend" on quotations for all using (true) with check (true);

-- ================================================================
-- INITIAL SEED DATA
-- ================================================================

insert into factories (id, code, name, location, contact_person, contact_phone) values
  ('a1000000-0000-0000-0000-000000000001', 'FT-BKK-01', 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์', 'สมุทรปราการ', 'คุณอนุรักษ์', '081-445-8899'),
  ('a1000000-0000-0000-0000-000000000002', 'FT-RYG-02', 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี', 'ระยอง', 'คุณวิภาวรรณ', '089-112-3344'),
  ('a1000000-0000-0000-0000-000000000003', 'FT-AYT-03', 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์', 'ปทุมธานี', 'คุณสมเกียรติ', '086-778-9900')
on conflict (code) do nothing;

insert into machines (id, factory_id, name, serial_number, model, brand, department, installation_date, status, next_pm_date, last_service_date, specs, qr_code) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'เครื่องกลึง CNC 5 แกน (Line A)', 'CNC-5AX-2023-018', 'VX-500 Pro', 'Mazak', 'แผนก Machining', '2023-03-15', 'operational', '2026-11-15', '2026-08-10', '{"power": "15kW", "max_rpm": 12000, "pressure": "7 Bar"}'::jsonb, 'QR-CNC-018'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'ปั๊มไฮดรอลิกแรงดันสูง Press 500T', 'HYD-PUMP-500T-04', 'HP-500H', 'Rexroth', 'แผนก Pressing', '2022-07-20', 'warning', '2026-10-18', '2026-07-12', '{"flow_rate": "180 L/min", "oil_temp": "68C", "pressure": "250 Bar"}'::jsonb, 'QR-HYD-500T'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Air Compressor สกรูอุตสาหกรรม 75kW', 'AC-SCREW-75-09', 'Atlas-GA75', 'Atlas Copco', 'ระบบ Utility & พลังงาน', '2021-11-10', 'operational', '2026-12-01', '2026-09-02', '{"pressure_bar": 8.5, "dewpoint": "3C", "cooling": "Air-cooled"}'::jsonb, 'QR-COMP-75'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'หุ่นยนต์เชื่อมประกอบ Robotic Arm #2', 'ROBOT-WELD-6AX-11', 'KR-CYBERTECH', 'KUKA', 'แผนก Robotic Assembly', '2024-01-18', 'breakdown', '2026-10-08', '2026-08-25', '{"payload": "16kg", "reach": "2013mm", "repeatability": "0.04mm"}'::jsonb, 'QR-ROBOT-W11')
on conflict (serial_number) do nothing;

insert into spare_parts (id, part_number, name, category, unit_price, stock_quantity, min_stock_level, unit) values
  ('c1000000-0000-0000-0000-000000000001', 'SP-SEAL-REX-01', 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm', 'Hydraulic Seals', 3200.00, 18, 5, 'ชุด'),
  ('c1000000-0000-0000-0000-000000000002', 'SP-FILT-OIL-75', 'ไส้กรองน้ำมันเครื่องอัดลม Atlas Copco GA75', 'Filtration', 4850.00, 12, 4, 'ชิ้น'),
  ('c1000000-0000-0000-0000-000000000003', 'SP-SERVO-DRV-15', 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7', 'Electrical & Drives', 38500.00, 3, 2, 'ตัว'),
  ('c1000000-0000-0000-0000-000000000004', 'SP-BEAR-SKF-6310', 'ตลับลูกปืนความเร็วสูง SKF 6310-2RS1/C3', 'Bearings', 1450.00, 45, 10, 'ตลับ'),
  ('c1000000-0000-0000-0000-000000000005', 'SP-SOL-VALVE-24V', 'โซลินอยด์วาล์ว 5/2 ทาง 24VDC SMC SY5120', 'Pneumatics', 2750.00, 22, 6, 'ตัว')
on conflict (part_number) do nothing;

insert into repair_tickets (id, ticket_number, machine_id, factory_id, customer_name, contact_phone, contact_email, issue_type, urgency, preferred_time, description, status, assigned_technician) values
  ('d1000000-0000-0000-0000-000000000001', 'TK-2026-0042', 'b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'สมศักดิ์ ผู้จัดการฝ่ายผลิต', '081-888-2233', 'somsak@bangna-parts.com', 'hydraulic', 'high', 'วันนี้ก่อน 14:00 น.', 'แรงดันไฮดรอลิกตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและคราบน้ำมันซึมที่หัวปั๊ม', 'in_progress', 'ช่างกิตติศักดิ์ ชำนาญการ'),
  ('d1000000-0000-0000-0000-000000000002', 'TK-2026-0043', 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'ประสิทธิ์ หัวหน้าซ่อมบำรุง', '085-123-9999', 'prasit@nava-semi.co.th', 'electrical', 'critical', 'ด่วนที่สุด', 'หุ่นยนต์เชื่อมหยุดกะทันหัน ฟ้อง Alarm E-742 Servo Axis 3 Overload สั่งการไม่ได้', 'assigned', 'ช่างธนพล วิศวกรควบคุม')
on conflict (ticket_number) do nothing;

insert into quotations (id, quotation_number, customer_name, company_name, contact_email, contact_phone, items, subtotal, discount, vat, total_amount, notes, status) values
  ('e1000000-0000-0000-0000-000000000001', 'QT-2026-0105', 'คุณอนุรักษ์', 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์', 'anurak@bangna.co.th', '081-445-8899',
   '[{"name": "ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm", "part_number": "SP-SEAL-REX-01", "quantity": 2, "unit_price": 3200, "total": 6400}, {"name": "ค่าบริการตรวจเช็คและเปลี่ยนชุดซีลหน้างาน", "part_number": "SRV-LABOR-01", "quantity": 1, "unit_price": 4500, "total": 4500}]'::jsonb,
   10900.00, 500.00, 728.00, 11128.00, 'เสนอราคาพร้อมรับประกันงานซ่อม 90 วัน', 'sent_to_client')
on conflict (quotation_number) do nothing;
