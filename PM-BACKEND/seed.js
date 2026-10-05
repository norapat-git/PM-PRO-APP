const { supabase } = require('./config/supabase');
require('dotenv').config();

async function runSeed() {
  console.log('🚀 Starting Supabase Database Seeding...');

  // 1. Departments
  console.log('-> Seeding departments...');
  const { error: errDept } = await supabase.from('departments').upsert([
    { id: 1, name: 'แผนกซ่อมบำรุงและวิศวกรรม (Maintenance)', description: 'ดูแลรักษาเครื่องจักรและระบบสาธารณูปโภค' },
    { id: 2, name: 'แผนกผลิตชิ้นส่วนยานยนต์ (Machining)', description: 'ดูแลสายการผลิตกลึงและกัดชิ้นส่วนความแม่นยำสูง' },
    { id: 3, name: 'แผนกปั๊มขึ้นรูป (Pressing)', description: 'ดูแลแท่นปั๊มไฮดรอลิกขนาดใหญ่' }
  ]);
  if (errDept) console.error('Error departments:', errDept.message);

  // 2. Users
  console.log('-> Seeding users...');
  const { error: errUsers } = await supabase.from('users').upsert([
    { id: 1, employee_code: 'EMP-001', full_name: 'สมศักดิ์ ผู้จัดการฝ่ายผลิต', email: 'somsak@bangna-parts.com', phone: '081-888-2233', password_hash: 'hash123', role: 'requester', department_id: 2, skills: 'Production Control' },
    { id: 2, employee_code: 'EMP-002', full_name: 'ช่างกิตติศักดิ์ ชำนาญการ', email: 'kittisak@pm-pro.com', phone: '089-777-6655', password_hash: 'hash123', role: 'technician', department_id: 1, skills: 'ไฮดรอลิก, เครื่องกล, ลม' },
    { id: 3, employee_code: 'EMP-003', full_name: 'วิศวกรธนพล ชื่นใจ', email: 'thanapol@pm-pro.com', phone: '086-333-2211', password_hash: 'hash123', role: 'supervisor', department_id: 1, skills: 'PLC, Automation, Robotics' }
  ]);
  if (errUsers) console.error('Error users:', errUsers.message);

  // 3. Locations
  console.log('-> Seeding locations...');
  const { error: errLoc } = await supabase.from('locations').upsert([
    { id: 1, name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์', code: 'LOC-BKK-01', address: 'สมุทรปราการ กม.18' },
    { id: 2, name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี', code: 'LOC-RYG-02', address: 'นิคมอุตสาหกรรมมาบตาพุด ระยอง' },
    { id: 3, name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์', code: 'LOC-AYT-03', address: 'เขตส่งเสริมอุตสาหกรรมนวนคร ปทุมธานี' }
  ]);
  if (errLoc) console.error('Error locations:', errLoc.message);

  // 4. Asset Categories
  console.log('-> Seeding asset_categories...');
  const { error: errCat } = await supabase.from('asset_categories').upsert([
    { id: 1, name: 'เครื่องจักรกล CNC & Machining' },
    { id: 2, name: 'ระบบไฮดรอลิก & แท่นปั๊ม' },
    { id: 3, name: 'ระบบลมอัดอุตสาหกรรม (Air Compressor)' },
    { id: 4, name: 'หุ่นยนต์อุตสาหกรรม & ระบบอัตโนมัติ' }
  ]);
  if (errCat) console.error('Error categories:', errCat.message);

  // 5. Assets
  console.log('-> Seeding assets...');
  const { error: errAssets } = await supabase.from('assets').upsert([
    { id: 1, asset_code: 'CNC-5AX-2023-018', name: 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)', category_id: 1, location_id: 1, manufacturer: 'Mazak Japan', model: 'VX-500 Pro', serial_number: 'CNC-5AX-2023-018', purchase_date: '2023-03-15', status: 'active', notes: 'แผนก Machining & Tooling' },
    { id: 2, asset_code: 'HYD-PUMP-500T-04', name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน', category_id: 2, location_id: 1, manufacturer: 'Rexroth Bosch', model: 'HP-500H', serial_number: 'HYD-PUMP-500T-04', purchase_date: '2022-07-20', status: 'under_maintenance', notes: 'แผนก Heavy Pressing' },
    { id: 3, asset_code: 'AC-SCREW-75-09', name: 'Air Compressor สกรูอุตสาหกรรม 75kW', category_id: 3, location_id: 2, manufacturer: 'Atlas Copco Sweden', model: 'Atlas-GA75', serial_number: 'AC-SCREW-75-09', purchase_date: '2021-11-10', status: 'active', notes: 'ระบบ Utility & พลังงานลมกลาง' },
    { id: 4, asset_code: 'ROBOT-WELD-6AX-11', name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2', category_id: 4, location_id: 3, manufacturer: 'KUKA Robotics Germany', model: 'KR-CYBERTECH', serial_number: 'ROBOT-WELD-6AX-11', purchase_date: '2024-01-18', status: 'inactive', notes: 'แผนก Robotic Assembly' }
  ]);
  if (errAssets) console.error('Error assets:', errAssets.message);

  // 6. Suppliers & Parts
  console.log('-> Seeding suppliers & parts...');
  await supabase.from('suppliers').upsert([
    { id: 1, name: 'บริษัท บอช เร็กซ์ร็อธ (ประเทศไทย) จำกัด', contact: 'ฝ่ายขายอะไหล่ไฮดรอลิก', phone: '02-777-8899', email: 'sales@rexroth.co.th' },
    { id: 2, name: 'บริษัท แอตลาส คอปโก้ (ประเทศไทย) จำกัด', contact: 'ฝ่ายบริการอะไหล่ปั๊มลม', phone: '02-666-5544', email: 'service@atlascopco.co.th' }
  ]);

  await supabase.from('parts').upsert([
    { id: 1, part_code: 'SP-SEAL-REX-01', name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm', unit: 'ชุด', unit_cost: 3200.00, stock_qty: 18, min_stock: 5, supplier_id: 1 },
    { id: 2, part_code: 'SP-FILT-OIL-75', name: 'ไส้กรองน้ำมันเครื่องอัดลม Atlas Copco GA75', unit: 'ชิ้น', unit_cost: 4850.00, stock_qty: 12, min_stock: 4, supplier_id: 2 },
    { id: 3, part_code: 'SP-SERVO-DRV-15', name: 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7', unit: 'ตัว', unit_cost: 38500.00, stock_qty: 2, min_stock: 3, supplier_id: 1 },
    { id: 4, part_code: 'SP-BEAR-SKF-6310', name: 'ตลับลูกปืนความเร็วสูง SKF 6310-2RS1/C3', unit: 'ตลับ', unit_cost: 1450.00, stock_qty: 45, min_stock: 10, supplier_id: 1 },
    { id: 5, part_code: 'SP-SOL-VALVE-24V', name: 'โซลินอยด์วาล์ว 5/2 ทาง 24VDC SMC SY5120', unit: 'ตัว', unit_cost: 2750.00, stock_qty: 22, min_stock: 6, supplier_id: 1 }
  ]);

  // 7. PM Schedules
  console.log('-> Seeding pm_schedules...');
  await supabase.from('pm_schedules').upsert([
    { id: 1, asset_id: 4, title: 'ตรวจสอบระยะสลักเกลียว ข้อต่อแกน 1-6 และอัดจาระบีเกรดหุ่นยนต์', description: 'ตรวจเช็คตามรอบคู่มือ KUKA', interval_days: 60, next_due_date: '2026-10-08', default_assignee: 3, is_active: true },
    { id: 2, asset_id: 2, title: 'ถ่ายน้ำมันไฮดรอลิก เปลี่ยนไส้กรอง และตรวจเช็คการสั่นสะเทือนปั๊ม', description: 'ตรวจเช็คแรงดันและอุณหภูมิ', interval_days: 90, next_due_date: '2026-10-18', default_assignee: 2, is_active: true },
    { id: 3, asset_id: 1, title: 'บำรุงรักษาเชิงป้องกันประจำไตรมาสและสอบเทียบความเที่ยงตรงเลเซอร์', description: 'Calibration แกน X/Y/Z', interval_days: 90, next_due_date: '2026-11-15', default_assignee: 2, is_active: true }
  ]);

  // 8. Maintenance Requests
  console.log('-> Seeding maintenance_requests...');
  const { error: errReq } = await supabase.from('maintenance_requests').upsert([
    { id: 1, request_no: 'MR-2026-00001', title: 'แรงดันไฮดรอลิกตกและพบคราบน้ำมันซึมที่หัวปั๊ม Press 500T', description: 'แรงดันตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและคราบน้ำมันซึมที่หัวปั๊ม', requester_id: 1, asset_id: 2, location_id: 1, priority: 'high', status: 'in_progress', desired_date: '2026-10-06' },
    { id: 2, request_no: 'MR-2026-00002', title: 'หุ่นยนต์เชื่อมประกอบหยุดฉุกเฉิน ฟ้อง Alarm E-742 Servo Axis 3', description: 'หุ่นยนต์หยุดกะทันหันขณะทำงาน รอบหมุนสะดุดที่ข้อต่อแกน 3', requester_id: 1, asset_id: 4, location_id: 3, priority: 'critical', status: 'new', desired_date: '2026-10-05' }
  ]);
  if (errReq) console.error('Error maintenance_requests:', errReq.message);

  // 9. Work Orders
  console.log('-> Seeding work_orders...');
  await supabase.from('work_orders').upsert([
    { id: 1, wo_no: 'WO-2026-00001', request_id: 1, asset_id: 2, title: 'งานซ่อม: ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน', description: 'ถอดล้างชุดซีล เปลี่ยนชุดโอริงและซีล Rexroth 60mm ใหม่', work_type: 'corrective', priority: 'high', status: 'completed', created_by: 1, assigned_to: 2, root_cause: 'โอริงและซีลเพลาขับฉีกขาดจากความร้อนสะสม', resolution: 'เปลี่ยนชุดซีลใหม่และทดสอบแรงดัน 250 Bar นิ่งสนิท' }
  ]);

  console.log('✅ All data seeded to Supabase successfully!');
}

runSeed();
