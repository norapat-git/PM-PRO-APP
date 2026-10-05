-- =====================================================================
-- Maintenance Request & Work Tracking System
-- Database: PostgreSQL 13+
-- =====================================================================

-- ---------- ENUM types ----------
CREATE TYPE user_role AS ENUM ('requester', 'technician', 'supervisor', 'admin');
CREATE TYPE request_status AS ENUM ('new', 'reviewing', 'approved', 'rejected', 'in_progress', 'on_hold', 'completed', 'closed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE work_order_status AS ENUM ('open', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'verified', 'cancelled');
CREATE TYPE work_type AS ENUM ('corrective', 'preventive', 'inspection', 'installation');
CREATE TYPE asset_status AS ENUM ('active', 'under_maintenance', 'inactive', 'retired');
CREATE TYPE task_status AS ENUM ('todo', 'doing', 'done', 'skipped');

-- ---------- Organization ----------
CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role          user_role NOT NULL DEFAULT 'requester',
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    skills        TEXT,                       -- ทักษะช่าง เช่น ไฟฟ้า, เครื่องกล
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Locations & Assets ----------
CREATE TABLE locations (
    id        SERIAL PRIMARY KEY,
    parent_id INT REFERENCES locations(id) ON DELETE SET NULL,  -- โรงงาน > อาคาร > ชั้น > ห้อง
    name      VARCHAR(150) NOT NULL,
    code      VARCHAR(30) UNIQUE,
    address   TEXT
);

CREATE TABLE asset_categories (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE      -- เช่น เครื่องจักร, ระบบไฟฟ้า, HVAC, ยานพาหนะ
);

CREATE TABLE assets (
    id              SERIAL PRIMARY KEY,
    asset_code      VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    category_id     INT REFERENCES asset_categories(id) ON DELETE SET NULL,
    location_id     INT REFERENCES locations(id) ON DELETE SET NULL,
    manufacturer    VARCHAR(100),
    model           VARCHAR(100),
    serial_number   VARCHAR(100),
    purchase_date   DATE,
    warranty_expiry DATE,
    status          asset_status NOT NULL DEFAULT 'active',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Maintenance Requests (ใบแจ้งซ่อม) ----------
CREATE TABLE maintenance_requests (
    id              SERIAL PRIMARY KEY,
    request_no      VARCHAR(30) NOT NULL UNIQUE,         -- เช่น MR-2026-00001
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    requester_id    INT NOT NULL REFERENCES users(id),
    asset_id        INT REFERENCES assets(id) ON DELETE SET NULL,
    location_id     INT REFERENCES locations(id) ON DELETE SET NULL,
    priority        priority_level NOT NULL DEFAULT 'medium',
    status          request_status NOT NULL DEFAULT 'new',
    reviewed_by     INT REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    reject_reason   TEXT,
    desired_date    DATE,                                -- วันที่ต้องการให้เสร็จ
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Work Orders (ใบสั่งงาน) ----------
CREATE TABLE work_orders (
    id              SERIAL PRIMARY KEY,
    wo_no           VARCHAR(30) NOT NULL UNIQUE,         -- เช่น WO-2026-00001
    request_id      INT REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    asset_id        INT REFERENCES assets(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    work_type       work_type NOT NULL DEFAULT 'corrective',
    priority        priority_level NOT NULL DEFAULT 'medium',
    status          work_order_status NOT NULL DEFAULT 'open',
    created_by      INT NOT NULL REFERENCES users(id),
    assigned_to     INT REFERENCES users(id),            -- ช่างหลักที่รับผิดชอบ
    planned_start   TIMESTAMPTZ,
    planned_end     TIMESTAMPTZ,
    actual_start    TIMESTAMPTZ,
    actual_end      TIMESTAMPTZ,
    root_cause      TEXT,
    resolution      TEXT,
    verified_by     INT REFERENCES users(id),
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (planned_end IS NULL OR planned_start IS NULL OR planned_end >= planned_start)
);

-- ช่างหลายคนต่อ 1 ใบสั่งงาน
CREATE TABLE work_order_assignees (
    work_order_id INT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id),
    assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (work_order_id, user_id)
);

-- งานย่อย / checklist
CREATE TABLE work_order_tasks (
    id            SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    seq           INT NOT NULL DEFAULT 1,
    description   TEXT NOT NULL,
    status        task_status NOT NULL DEFAULT 'todo',
    completed_by  INT REFERENCES users(id),
    completed_at  TIMESTAMPTZ
);

-- บันทึกเวลาทำงานของช่าง
CREATE TABLE time_logs (
    id            SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id),
    start_time    TIMESTAMPTZ NOT NULL,
    end_time      TIMESTAMPTZ,
    note          TEXT,
    CHECK (end_time IS NULL OR end_time >= start_time)
);

-- ---------- Parts / Inventory ----------
CREATE TABLE suppliers (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(150) NOT NULL,
    contact VARCHAR(150),
    phone   VARCHAR(30),
    email   VARCHAR(150)
);

CREATE TABLE parts (
    id           SERIAL PRIMARY KEY,
    part_code    VARCHAR(50) NOT NULL UNIQUE,
    name         VARCHAR(150) NOT NULL,
    unit         VARCHAR(20) NOT NULL DEFAULT 'pcs',
    unit_cost    NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_qty    NUMERIC(12,2) NOT NULL DEFAULT 0,
    min_stock    NUMERIC(12,2) NOT NULL DEFAULT 0,
    supplier_id  INT REFERENCES suppliers(id) ON DELETE SET NULL
);

CREATE TABLE work_order_parts (
    id            SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id       INT NOT NULL REFERENCES parts(id),
    quantity      NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit_cost     NUMERIC(12,2) NOT NULL,              -- เก็บราคา ณ เวลาที่ใช้
    used_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Preventive Maintenance (PM) ----------
CREATE TABLE pm_schedules (
    id              SERIAL PRIMARY KEY,
    asset_id        INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    interval_days   INT NOT NULL CHECK (interval_days > 0),
    last_done_date  DATE,
    next_due_date   DATE NOT NULL,
    default_assignee INT REFERENCES users(id),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ---------- Collaboration ----------
CREATE TABLE comments (
    id            SERIAL PRIMARY KEY,
    request_id    INT REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    work_order_id INT REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id),
    body          TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (num_nonnulls(request_id, work_order_id) = 1)  -- ผูกกับอย่างใดอย่างหนึ่ง
);

CREATE TABLE attachments (
    id            SERIAL PRIMARY KEY,
    request_id    INT REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    work_order_id INT REFERENCES work_orders(id) ON DELETE CASCADE,
    uploaded_by   INT NOT NULL REFERENCES users(id),
    file_name     VARCHAR(255) NOT NULL,
    file_url      TEXT NOT NULL,                       -- path / URL ใน storage
    mime_type     VARCHAR(100),
    file_size     BIGINT,
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (num_nonnulls(request_id, work_order_id) = 1)
);

-- ประวัติการเปลี่ยนสถานะ (audit trail)
CREATE TABLE status_history (
    id            BIGSERIAL PRIMARY KEY,
    request_id    INT REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    work_order_id INT REFERENCES work_orders(id) ON DELETE CASCADE,
    old_status    VARCHAR(30),
    new_status    VARCHAR(30) NOT NULL,
    changed_by    INT REFERENCES users(id),
    note          TEXT,
    changed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (num_nonnulls(request_id, work_order_id) = 1)
);

CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(200) NOT NULL,
    message    TEXT,
    link_url   TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Indexes ----------
CREATE INDEX idx_requests_status     ON maintenance_requests(status);
CREATE INDEX idx_requests_requester  ON maintenance_requests(requester_id);
CREATE INDEX idx_requests_asset      ON maintenance_requests(asset_id);
CREATE INDEX idx_wo_status           ON work_orders(status);
CREATE INDEX idx_wo_assigned_to      ON work_orders(assigned_to);
CREATE INDEX idx_wo_request          ON work_orders(request_id);
CREATE INDEX idx_wo_planned_start    ON work_orders(planned_start);
CREATE INDEX idx_assets_location     ON assets(location_id);
CREATE INDEX idx_time_logs_wo        ON time_logs(work_order_id);
CREATE INDEX idx_pm_next_due         ON pm_schedules(next_due_date) WHERE is_active;
CREATE INDEX idx_notifications_user  ON notifications(user_id, is_read);
CREATE INDEX idx_status_history_req  ON status_history(request_id);
CREATE INDEX idx_status_history_wo   ON status_history(work_order_id);

-- ---------- Auto-update updated_at ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_assets_updated   BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_wo_updated       BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Enable Row Level Security (RLS) & Policies ----------
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow read/write for API access (Publishable & Secret Key)
CREATE POLICY "Allow all on departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on locations" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on asset_categories" ON asset_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on maintenance_requests" ON maintenance_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on work_orders" ON work_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on work_order_assignees" ON work_order_assignees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on work_order_tasks" ON work_order_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on time_logs" ON time_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on parts" ON parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on work_order_parts" ON work_order_parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on pm_schedules" ON pm_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on comments" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on attachments" ON attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on status_history" ON status_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- INITIAL SEED DATA (ข้อมูลเริ่มต้นสำหรับทดสอบ)
-- =====================================================================

INSERT INTO departments (id, name, description) VALUES
  (1, 'แผนกซ่อมบำรุงและวิศวกรรม (Maintenance)', 'ดูแลรักษาเครื่องจักรและระบบสาธารณูปโภค'),
  (2, 'แผนกผลิตชิ้นส่วนยานยนต์ (Machining)', 'ดูแลสายการผลิตกลึงและกัดชิ้นส่วนความแม่นยำสูง'),
  (3, 'แผนกปั๊มขึ้นรูป (Pressing)', 'ดูแลแท่นปั๊มไฮดรอลิกขนาดใหญ่')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, employee_code, full_name, email, phone, password_hash, role, department_id, skills) VALUES
  (1, 'EMP-001', 'สมศักดิ์ ผู้จัดการฝ่ายผลิต', 'somsak@bangna-parts.com', '081-888-2233', 'hash123', 'requester', 2, 'Production Control'),
  (2, 'EMP-002', 'ช่างกิตติศักดิ์ ชำนาญการ', 'kittisak@pm-pro.com', '089-777-6655', 'hash123', 'technician', 1, 'ไฮดรอลิก, เครื่องกล, ลม'),
  (3, 'EMP-003', 'วิศวกรธนพล ชื่นใจ', 'thanapol@pm-pro.com', '086-333-2211', 'hash123', 'supervisor', 1, 'PLC, Automation, Robotics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, code, address) VALUES
  (1, 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์', 'LOC-BKK-01', 'สมุทรปราการ กม.18'),
  (2, 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี', 'LOC-RYG-02', 'นิคมอุตสาหกรรมมาบตาพุด ระยอง'),
  (3, 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์', 'LOC-AYT-03', 'เขตส่งเสริมอุตสาหกรรมนวนคร ปทุมธานี')
ON CONFLICT (id) DO NOTHING;

INSERT INTO asset_categories (id, name) VALUES
  (1, 'เครื่องจักรกล CNC & Machining'),
  (2, 'ระบบไฮดรอลิก & แท่นปั๊ม'),
  (3, 'ระบบลมอัดอุตสาหกรรม (Air Compressor)'),
  (4, 'หุ่นยนต์อุตสาหกรรม & ระบบอัตโนมัติ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO assets (id, asset_code, name, category_id, location_id, manufacturer, model, serial_number, purchase_date, status, notes) VALUES
  (1, 'CNC-5AX-2023-018', 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)', 1, 1, 'Mazak Japan', 'VX-500 Pro', 'CNC-5AX-2023-018', '2023-03-15', 'active', 'แผนก Machining & Tooling'),
  (2, 'HYD-PUMP-500T-04', 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน', 2, 1, 'Rexroth Bosch', 'HP-500H', 'HYD-PUMP-500T-04', '2022-07-20', 'under_maintenance', 'แผนก Heavy Pressing'),
  (3, 'AC-SCREW-75-09', 'Air Compressor สกรูอุตสาหกรรม 75kW', 3, 2, 'Atlas Copco Sweden', 'Atlas-GA75', 'AC-SCREW-75-09', '2021-11-10', 'active', 'ระบบ Utility & พลังงานลมกลาง'),
  (4, 'ROBOT-WELD-6AX-11', 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2', 4, 3, 'KUKA Robotics Germany', 'KR-CYBERTECH', 'ROBOT-WELD-6AX-11', '2024-01-18', 'inactive', 'แผนก Robotic Assembly')
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, contact, phone, email) VALUES
  (1, 'บริษัท บอช เร็กซ์ร็อธ (ประเทศไทย) จำกัด', 'ฝ่ายขายอะไหล่ไฮดรอลิก', '02-777-8899', 'sales@rexroth.co.th'),
  (2, 'บริษัท แอตลาส คอปโก้ (ประเทศไทย) จำกัด', 'ฝ่ายบริการอะไหล่ปั๊มลม', '02-666-5544', 'service@atlascopco.co.th')
ON CONFLICT (id) DO NOTHING;

INSERT INTO parts (id, part_code, name, unit, unit_cost, stock_qty, min_stock, supplier_id) VALUES
  (1, 'SP-SEAL-REX-01', 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm', 'ชุด', 3200.00, 18, 5, 1),
  (2, 'SP-FILT-OIL-75', 'ไส้กรองน้ำมันเครื่องอัดลม Atlas Copco GA75', 'ชิ้น', 4850.00, 12, 4, 2),
  (3, 'SP-SERVO-DRV-15', 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7', 'ตัว', 38500.00, 2, 3, 1),
  (4, 'SP-BEAR-SKF-6310', 'ตลับลูกปืนความเร็วสูง SKF 6310-2RS1/C3', 'ตลับ', 1450.00, 45, 10, 1),
  (5, 'SP-SOL-VALVE-24V', 'โซลินอยด์วาล์ว 5/2 ทาง 24VDC SMC SY5120', 'ตัว', 2750.00, 22, 6, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pm_schedules (id, asset_id, title, description, interval_days, next_due_date, default_assignee, is_active) VALUES
  (1, 4, 'ตรวจสอบระยะสลักเกลียว ข้อต่อแกน 1-6 และอัดจาระบีเกรดหุ่นยนต์', 'ตรวจเช็คตามรอบคู่มือ KUKA', 60, '2026-10-08', 3, true),
  (2, 2, 'ถ่ายน้ำมันไฮดรอลิก เปลี่ยนไส้กรอง และตรวจเช็คการสั่นสะเทือนปั๊ม', 'ตรวจเช็คแรงดันและอุณหภูมิ', 90, '2026-10-18', 2, true),
  (3, 1, 'บำรุงรักษาเชิงป้องกันประจำไตรมาสและสอบเทียบความเที่ยงตรงเลเซอร์', 'Calibration แกน X/Y/Z', 90, '2026-11-15', 2, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, request_no, title, description, requester_id, asset_id, location_id, priority, status, desired_date) VALUES
  (1, 'MR-2026-00001', 'แรงดันไฮดรอลิกตกและพบคราบน้ำมันซึมที่หัวปั๊ม Press 500T', 'แรงดันตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและคราบน้ำมันซึมที่หัวปั๊ม', 1, 2, 1, 'high', 'in_progress', '2026-10-06'),
  (2, 'MR-2026-00002', 'หุ่นยนต์เชื่อมประกอบหยุดฉุกเฉิน ฟ้อง Alarm E-742 Servo Axis 3', 'หุ่นยนต์หยุดกะทันหันขณะทำงาน รอบหมุนสะดุดที่ข้อต่อแกน 3', 1, 4, 3, 'critical', 'new', '2026-10-05')
ON CONFLICT (id) DO NOTHING;