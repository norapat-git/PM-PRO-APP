import type { RepairTicket, ServiceReport, Machine, Factory, PMSchedule, SparePart, Quotation } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Initial Mock Data Seeds for local persistence
const SEED_FACTORIES: Factory[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    code: 'FT-BKK-01',
    name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    location: 'สมุทรปราการ กม.18',
    contact_person: 'คุณอนุรักษ์ รัตนชัย',
    contact_phone: '081-445-8899'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    code: 'FT-RYG-02',
    name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี',
    location: 'นิคมอุตสาหกรรมมาบตาพุด ระยอง',
    contact_person: 'คุณวิภาวรรณ สดใส',
    contact_phone: '089-112-3344'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    code: 'FT-AYT-03',
    name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    location: 'เขตส่งเสริมอุตสาหกรรมนวนคร ปทุมธานี',
    contact_person: 'คุณสมเกียรติ มั่นคง',
    contact_phone: '086-778-9900'
  }
];

const SEED_MACHINES: Machine[] = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    factory_id: 'a1000000-0000-0000-0000-000000000001',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    name: 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)',
    serial_number: 'CNC-5AX-2023-018',
    model: 'VX-500 Pro High-Precision',
    brand: 'Mazak Japan',
    department: 'แผนก Machining & Tooling',
    installation_date: '2023-03-15',
    status: 'operational',
    next_pm_date: '2026-11-15',
    last_service_date: '2026-08-10',
    specs: { 'กำลังมอเตอร์': '15 kW', 'ความเร็วรอบสูงสุด': '12,000 RPM', 'ระบบแรงดันลม': '7.0 Bar' },
    qr_code: 'PM-QR-CNC-018'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    factory_id: 'a1000000-0000-0000-0000-000000000001',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    serial_number: 'HYD-PUMP-500T-04',
    model: 'HP-500H Pro Series',
    brand: 'Rexroth Bosch Group',
    department: 'แผนก Heavy Pressing',
    installation_date: '2022-07-20',
    status: 'warning',
    next_pm_date: '2026-10-18',
    last_service_date: '2026-07-12',
    specs: { 'อัตราการไหล': '180 L/min', 'อุณหภูมิน้ำมัน': '68 °C', 'แรงดันระบบ': '250 Bar' },
    qr_code: 'PM-QR-HYD-500T'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    factory_id: 'a1000000-0000-0000-0000-000000000002',
    factory_name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี',
    name: 'Air Compressor สกรูอุตสาหกรรม 75kW',
    serial_number: 'AC-SCREW-75-09',
    model: 'Atlas-GA75 VSD+',
    brand: 'Atlas Copco Sweden',
    department: 'ระบบ Utility & พลังงานลมกลาง',
    installation_date: '2021-11-10',
    status: 'operational',
    next_pm_date: '2026-12-01',
    last_service_date: '2026-09-02',
    specs: { 'แรงดันลมจ่าย': '8.5 Bar', 'จุดน้ำค้าง (Dew Point)': '3 °C', 'ระบบระบายความร้อน': 'Air-cooled' },
    qr_code: 'PM-QR-COMP-75'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    factory_id: 'a1000000-0000-0000-0000-000000000003',
    factory_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    serial_number: 'ROBOT-WELD-6AX-11',
    model: 'KR-CYBERTECH Arc Nano',
    brand: 'KUKA Robotics Germany',
    department: 'แผนก Robotic Assembly',
    installation_date: '2024-01-18',
    status: 'breakdown',
    next_pm_date: '2026-10-08',
    last_service_date: '2026-08-25',
    specs: { 'น้ำหนักบรรทุกสูงสุด': '16 kg', 'ระยะเอื้อมแขน': '2,013 mm', 'ความแม่นยำ': '±0.04 mm' },
    qr_code: 'PM-QR-ROBOT-W11'
  }
];

const SEED_TICKETS: RepairTicket[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    ticket_number: 'TK-2026-0042',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    machine_serial: 'HYD-PUMP-500T-04',
    factory_id: 'a1000000-0000-0000-0000-000000000001',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    customer_name: 'สมศักดิ์ ผู้จัดการฝ่ายผลิต',
    contact_phone: '081-888-2233',
    contact_email: 'somsak@bangna-parts.com',
    issue_type: 'ไฮดรอลิกและแรงดัน',
    urgency: 'high',
    preferred_time: 'วันนี้ก่อน 14:00 น. หรือช่วงพักกะ',
    description: 'แรงดันไฮดรอลิกตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและพบคราบน้ำมันซึมบริเวณหน้าแปลนหัวปั๊ม เกรงว่าไลน์ปั๊มขึ้นรูปจะสะดุด',
    media_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    status: 'in_progress',
    assigned_technician: 'ช่างกิตติศักดิ์ ชำนาญการ (ทีม A)',
    created_at: '2026-10-04T08:30:00Z',
    updated_at: '2026-10-04T09:15:00Z'
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    ticket_number: 'TK-2026-0043',
    machine_id: 'b1000000-0000-0000-0000-000000000004',
    machine_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    machine_serial: 'ROBOT-WELD-6AX-11',
    factory_id: 'a1000000-0000-0000-0000-000000000003',
    factory_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    customer_name: 'ประสิทธิ์ หัวหน้าซ่อมบำรุง',
    contact_phone: '085-123-9999',
    contact_email: 'prasit@nava-semi.co.th',
    issue_type: 'ระบบไฟฟ้าและคอนโทรลเลอร์',
    urgency: 'critical',
    preferred_time: 'ด่วนที่สุด (กำลังหยุดไลน์)',
    description: 'หุ่นยนต์หยุดกะทันหันขณะทำงาน รอบหมุนสะดุดที่ข้อต่อแกน 3 จอคอนโทรลเลอร์ขึ้น Error E-742 Servo Axis 3 Overload ปิดเครื่องเปิดใหม่ไม่หาย',
    media_urls: [],
    status: 'assigned',
    assigned_technician: 'วิศวกรธนพล ชื่นใจ (Automation Specialist)',
    created_at: '2026-10-05T07:10:00Z',
    updated_at: '2026-10-05T07:45:00Z'
  }
];

const SEED_REPORTS: ServiceReport[] = [
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    report_number: 'SR-2026-0088',
    ticket_id: 'd1000000-0000-0000-0000-000000000001',
    ticket_number: 'TK-2026-0042',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    technician_name: 'ช่างกิตติศักดิ์ ชำนาญการ',
    service_date: '2026-10-04',
    service_type: 'corrective',
    summary_findings: 'ตรวจพบชุดโอริงและซีลแกนเพลาฉีกขาดจากความร้อนสะสม ทำให้น้ำมันไฮดรอลิกรั่วซึมและสูญเสียแรงดันตกเหลือ 180 Bar',
    action_taken: 'ถอดล้างชุดเฮดปั๊ม เปลี่ยนชุดโอริงและซีล Rexroth 60mm แท้ เติมน้ำมันไฮดรอลิก ISO VG46 เพิ่ม 20 ลิตร และทดสอบแรงดันระบบที่ 250 Bar ต่อเนื่อง 45 นาที ไม่พบรอยรั่วซึม',
    before_photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    after_photos: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    measurements: {
      'แรงดันขณะทำงาน (Operating Pressure)': '248 Bar (เกณฑ์มาตรฐาน 240-255 Bar)',
      'อุณหภูมิน้ำมันไฮดรอลิก (Oil Temp)': '54.2 °C (ปกติ < 65 °C)',
      'ระดับความสั่นสะเทือนมอเตอร์ (Vibration)': '1.8 mm/s (ปกติ < 2.5 mm/s)',
      'กระแสไฟฟ้ามอเตอร์ (Motor Current)': '28.4 A (พิกัดมอเตอร์ 32 A)',
      'อัตราการไหลน้ำมัน (Flow Rate)': '178 L/min (สเปก 180 L/min)'
    },
    parts_used: [
      {
        part_number: 'SP-SEAL-REX-01',
        name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm',
        quantity: 1,
        unit_price: 3200,
        total: 3200
      },
      {
        part_number: 'SP-OIL-VG46-20L',
        name: 'น้ำมันไฮดรอลิกอุตสาหกรรม Shell Tellus S2 MX46 (20L)',
        quantity: 1,
        unit_price: 2400,
        total: 2400
      }
    ],
    customer_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="70"><path d="M 20 45 Q 60 15 100 45 T 190 35" fill="none" stroke="%230f172a" stroke-width="3"/></svg>',
    customer_signed_by: 'คุณสมศักดิ์ ผู้จัดการฝ่ายผลิต',
    customer_signed_at: '2026-10-04T15:30:00Z',
    status: 'acknowledged',
    created_at: '2026-10-04T15:40:00Z'
  }
];

const SEED_PM: PMSchedule[] = [
  {
    id: 'pm-01',
    machine_id: 'b1000000-0000-0000-0000-000000000004',
    machine_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    title: 'ตรวจสอบระยะสลักเกลียว ข้อต่อแกน 1-6 และอัดจาระบีเกรดหุ่นยนต์',
    frequency_days: 60,
    due_date: '2026-10-08',
    status: 'overdue',
    checklist: ['ตรวจสอบสายไฟหุ้มข้อต่อแกน 1-6', 'เช็คความแม่นยำ Zero Point Calibration', 'วัดกระแสไฟฟ้าขณะหมุนแกนสวิง']
  },
  {
    id: 'pm-02',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    title: 'ถ่ายน้ำมันไฮดรอลิก เปลี่ยนไส้กรอง และตรวจเช็คการสั่นสะเทือนปั๊ม',
    frequency_days: 90,
    due_date: '2026-10-18',
    status: 'due_soon',
    checklist: ['วัดอุณหภูมิและความหนืดน้ำมัน', 'เช็ครอยรั่วข้อต่อท่อแรงดันสูง', 'วัดค่าแรงสั่นสะเทือน Coupling']
  },
  {
    id: 'pm-03',
    machine_id: 'b1000000-0000-0000-0000-000000000001',
    machine_name: 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)',
    title: 'บำรุงรักษาเชิงป้องกันประจำไตรมาสและสอบเทียบความเที่ยงตรงเลเซอร์',
    frequency_days: 90,
    due_date: '2026-11-15',
    status: 'upcoming',
    checklist: ['ตรวจแรงตึงสายพาน Spindle Drive', 'ทำความสะอาดระบบหล่อเย็น Coolant Filter', 'ทดสอบระบบความปลอดภัย Safety Interlock']
  }
];

const SEED_PARTS: SparePart[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    part_number: 'SP-SEAL-REX-01',
    name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm',
    category: 'Hydraulic Seals',
    unit_price: 3200.00,
    stock_quantity: 18,
    min_stock_level: 5,
    unit: 'ชุด',
    status: 'in_stock'
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    part_number: 'SP-FILT-OIL-75',
    name: 'ไส้กรองน้ำมันเครื่องอัดลม Atlas Copco GA75',
    category: 'Filtration',
    unit_price: 4850.00,
    stock_quantity: 12,
    min_stock_level: 4,
    unit: 'ชิ้น',
    status: 'in_stock'
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    part_number: 'SP-SERVO-DRV-15',
    name: 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7',
    category: 'Electrical & Drives',
    unit_price: 38500.00,
    stock_quantity: 2,
    min_stock_level: 3,
    unit: 'ตัว',
    status: 'low_stock'
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    part_number: 'SP-BEAR-SKF-6310',
    name: 'ตลับลูกปืนความเร็วสูง SKF 6310-2RS1/C3',
    category: 'Bearings',
    unit_price: 1450.00,
    stock_quantity: 45,
    min_stock_level: 10,
    unit: 'ตลับ',
    status: 'in_stock'
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    part_number: 'SP-SOL-VALVE-24V',
    name: 'โซลินอยด์วาล์ว 5/2 ทาง 24VDC SMC SY5120',
    category: 'Pneumatics',
    unit_price: 2750.00,
    stock_quantity: 22,
    min_stock_level: 6,
    unit: 'ตัว',
    status: 'in_stock'
  }
];

const SEED_QUOTATIONS: Quotation[] = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    quotation_number: 'QT-2026-0105',
    customer_name: 'คุณอนุรักษ์ รัตนชัย',
    company_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    contact_email: 'anurak@bangna.co.th',
    contact_phone: '081-445-8899',
    ticket_id: 'd1000000-0000-0000-0000-000000000001',
    items: [
      {
        part_number: 'SP-SEAL-REX-01',
        name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm',
        quantity: 2,
        unit_price: 3200,
        total: 6400
      },
      {
        part_number: 'SRV-LABOR-01',
        name: 'ค่าบริการตรวจเช็คและเปลี่ยนชุดซีลหน้างานพร้อมทดสอบ',
        quantity: 1,
        unit_price: 4500,
        total: 4500
      }
    ],
    subtotal: 10900.00,
    discount: 500.00,
    vat: 728.00,
    total_amount: 11128.00,
    notes: 'เสนอราคาพร้อมรับประกันงานซ่อม 90 วัน จัดส่งอะไหล่เข้าโรงงานภายใน 24 ชม.',
    status: 'sent_to_client',
    created_at: '2026-10-04T10:00:00Z',
    updated_at: '2026-10-04T11:30:00Z'
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    quotation_number: 'QT-2026-0106',
    customer_name: 'คุณประสิทธิ์ มั่นคง',
    company_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    contact_email: 'prasit@nava-semi.co.th',
    contact_phone: '085-123-9999',
    ticket_id: 'd1000000-0000-0000-0000-000000000002',
    items: [
      {
        part_number: 'SP-SERVO-DRV-15',
        name: 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7',
        quantity: 1,
        unit_price: 38500,
        total: 38500
      },
      {
        part_number: 'SRV-PROG-02',
        name: 'ค่าบริการตั้งค่าพารามิเตอร์และ Tuning Servo Axis 3',
        quantity: 1,
        unit_price: 6500,
        total: 6500
      }
    ],
    subtotal: 45000.00,
    discount: 1000.00,
    vat: 3080.00,
    total_amount: 47080.00,
    notes: 'อะไหล่ศูนย์แท้ ประกันศูนย์ 1 ปี ติดตั้งและทดสอบภายใน 48 ชม.',
    status: 'drafting',
    created_at: '2026-10-05T08:30:00Z',
    updated_at: '2026-10-05T09:15:00Z'
  }
];

function getStored<T>(key: string, seed: T): T {
  try {
    const data = localStorage.getItem(`pm_pro_${key}`);
    if (data) return JSON.parse(data);
    localStorage.setItem(`pm_pro_${key}`, JSON.stringify(seed));
    return seed;
  } catch {
    return seed;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`pm_pro_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export const api = {
  // 1. TICKETS
  async getTickets(): Promise<RepairTicket[]> {
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {
      // Backend not running, use persistent store
    }
    return getStored<RepairTicket[]>('tickets', SEED_TICKETS);
  },

  async createTicket(ticket: Omit<RepairTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status'>): Promise<RepairTicket> {
    const newTicket: RepairTicket = {
      ...ticket,
      id: `tk-${Date.now()}`,
      ticket_number: `TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const list = getStored<RepairTicket[]>('tickets', SEED_TICKETS);
    const updated = [newTicket, ...list];
    setStored('tickets', updated);
    return newTicket;
  },

  async updateTicketStatus(id: string, status: RepairTicket['status'], assigned_technician?: string): Promise<RepairTicket | null> {
    try {
      await fetch(`${API_BASE}/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assigned_technician })
      });
    } catch {}

    const list = getStored<RepairTicket[]>('tickets', SEED_TICKETS);
    const item = list.find(t => t.id === id);
    if (item) {
      item.status = status;
      if (assigned_technician !== undefined) item.assigned_technician = assigned_technician;
      item.updated_at = new Date().toISOString();
      setStored('tickets', [...list]);
      return item;
    }
    return null;
  },

  // 2. FIELD SERVICE REPORTS
  async getReports(): Promise<ServiceReport[]> {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<ServiceReport[]>('reports', SEED_REPORTS);
  },

  async createReport(report: Omit<ServiceReport, 'id' | 'report_number' | 'created_at'>): Promise<ServiceReport> {
    const newReport: ServiceReport = {
      ...report,
      id: `rep-${Date.now()}`,
      report_number: `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const list = getStored<ServiceReport[]>('reports', SEED_REPORTS);
    const updated = [newReport, ...list];
    setStored('reports', updated);

    // If report has ticket_id, update ticket to completed
    if (newReport.ticket_id) {
      await api.updateTicketStatus(newReport.ticket_id, 'completed');
    }
    return newReport;
  },

  // 3. MACHINES & CMMS
  async getMachines(): Promise<Machine[]> {
    try {
      const res = await fetch(`${API_BASE}/machines`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<Machine[]>('machines', SEED_MACHINES);
  },

  async getFactories(): Promise<Factory[]> {
    try {
      const res = await fetch(`${API_BASE}/factories`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<Factory[]>('factories', SEED_FACTORIES);
  },

  async getPMSchedules(): Promise<PMSchedule[]> {
    try {
      const res = await fetch(`${API_BASE}/pm-schedules`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<PMSchedule[]>('pm_schedules', SEED_PM);
  },

  // 4. SPARE PARTS & QUOTATIONS
  async getSpareParts(): Promise<SparePart[]> {
    try {
      const res = await fetch(`${API_BASE}/spare-parts`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<SparePart[]>('spare_parts', SEED_PARTS);
  },

  async getQuotations(): Promise<Quotation[]> {
    try {
      const res = await fetch(`${API_BASE}/quotations`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) return json.data;
      }
    } catch {}
    return getStored<Quotation[]>('quotations', SEED_QUOTATIONS);
  },

  async createQuotation(data: Omit<Quotation, 'id' | 'quotation_number' | 'created_at' | 'updated_at'>): Promise<Quotation> {
    const newQuote: Quotation = {
      ...data,
      id: `qt-${Date.now()}`,
      quotation_number: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {}

    const list = getStored<Quotation[]>('quotations', SEED_QUOTATIONS);
    const updated = [newQuote, ...list];
    setStored('quotations', updated);
    return newQuote;
  },

  async updateQuotationStatus(id: string, status: Quotation['status']): Promise<Quotation | null> {
    try {
      await fetch(`${API_BASE}/quotations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {}

    const list = getStored<Quotation[]>('quotations', SEED_QUOTATIONS);
    const item = list.find(q => q.id === id);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      setStored('quotations', [...list]);
      return item;
    }
    return null;
  }
};
