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