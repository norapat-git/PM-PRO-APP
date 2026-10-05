const { supabase } = require('../config/supabase');

let mockAssets = [
  {
    id: 1,
    asset_code: 'CNC-5AX-2023-018',
    name: 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)',
    model: 'VX-500 Pro High-Precision',
    manufacturer: 'Mazak Japan',
    serial_number: 'CNC-5AX-2023-018',
    department: 'แผนก Machining & Tooling',
    location_id: 1,
    location_name: 'โรงงานบางนา - อาคาร Machining',
    status: 'active',
    status_label: 'operational',
    next_pm_date: '2026-11-15',
    last_service_date: '2026-08-10',
    specs: { 'กำลังมอเตอร์': '15 kW', 'ความเร็วรอบสูงสุด': '12,000 RPM', 'ระบบแรงดันลม': '7.0 Bar' },
    qr_code: 'PM-QR-CNC-018'
  },
  {
    id: 2,
    asset_code: 'HYD-PUMP-500T-04',
    name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    model: 'HP-500H Pro Series',
    manufacturer: 'Rexroth Bosch Group',
    serial_number: 'HYD-PUMP-500T-04',
    department: 'แผนก Heavy Pressing',
    location_id: 1,
    location_name: 'โรงงานบางนา - อาคาร Heavy Pressing',
    status: 'under_maintenance',
    status_label: 'warning',
    next_pm_date: '2026-10-18',
    last_service_date: '2026-07-12',
    specs: { 'อัตราการไหล': '180 L/min', 'อุณหภูมิน้ำมัน': '68 °C', 'แรงดันระบบ': '250 Bar' },
    qr_code: 'PM-QR-HYD-500T'
  },
  {
    id: 3,
    asset_code: 'AC-SCREW-75-09',
    name: 'Air Compressor สกรูอุตสาหกรรม 75kW',
    model: 'Atlas-GA75 VSD+',
    manufacturer: 'Atlas Copco Sweden',
    serial_number: 'AC-SCREW-75-09',
    department: 'ระบบ Utility & พลังงานลมกลาง',
    location_id: 2,
    location_name: 'โรงงานมาบตาพุด - อาคาร Utility',
    status: 'active',
    status_label: 'operational',
    next_pm_date: '2026-12-01',
    last_service_date: '2026-09-02',
    specs: { 'แรงดันลมจ่าย': '8.5 Bar', 'จุดน้ำค้าง (Dew Point)': '3 °C', 'ระบบระบายความร้อน': 'Air-cooled' },
    qr_code: 'PM-QR-COMP-75'
  },
  {
    id: 4,
    asset_code: 'ROBOT-WELD-6AX-11',
    name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    model: 'KR-CYBERTECH Arc Nano',
    manufacturer: 'KUKA Robotics Germany',
    serial_number: 'ROBOT-WELD-6AX-11',
    department: 'แผนก Robotic Assembly',
    location_id: 3,
    location_name: 'โรงงานนวนคร - อาคาร Robotic Assembly',
    status: 'inactive',
    status_label: 'breakdown',
    next_pm_date: '2026-10-08',
    last_service_date: '2026-08-25',
    specs: { 'น้ำหนักบรรทุกสูงสุด': '16 kg', 'ระยะเอื้อมแขน': '2,013 mm', 'ความแม่นยำ': '±0.04 mm' },
    qr_code: 'PM-QR-ROBOT-W11'
  }
];

let mockLocations = [
  { id: 1, code: 'LOC-BKK-01', name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์', address: 'สมุทรปราการ กม.18' },
  { id: 2, code: 'LOC-RYG-02', name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี', address: 'ระยอง' },
  { id: 3, code: 'LOC-AYT-03', name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์', address: 'ปทุมธานี' }
];

let mockPMSchedules = [
  {
    id: 1,
    asset_id: 4,
    asset_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    title: 'ตรวจสอบระยะสลักเกลียว ข้อต่อแกน 1-6 และอัดจาระบีเกรดหุ่นยนต์',
    interval_days: 60,
    next_due_date: '2026-10-08',
    status: 'overdue',
    checklist: ['ตรวจสอบสายไฟหุ้มข้อต่อแกน 1-6', 'เช็คความแม่นยำ Zero Point Calibration', 'วัดกระแสไฟฟ้าขณะหมุนแกนสวิง']
  },
  {
    id: 2,
    asset_id: 2,
    asset_name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    title: 'ถ่ายน้ำมันไฮดรอลิก เปลี่ยนไส้กรอง และตรวจเช็คการสั่นสะเทือนปั๊ม',
    interval_days: 90,
    next_due_date: '2026-10-18',
    status: 'due_soon',
    checklist: ['วัดอุณหภูมิและความหนืดน้ำมัน', 'เช็ครอยรั่วข้อต่อท่อแรงดันสูง', 'วัดค่าแรงสั่นสะเทือน Coupling']
  },
  {
    id: 3,
    asset_id: 1,
    asset_name: 'เครื่องกลึง CNC 5 แกน ความแม่นยำสูง (Line A)',
    title: 'บำรุงรักษาเชิงป้องกันประจำไตรมาสและสอบเทียบความเที่ยงตรงเลเซอร์',
    interval_days: 90,
    next_due_date: '2026-11-15',
    status: 'upcoming',
    checklist: ['ตรวจแรงตึงสายพาน Spindle Drive', 'ทำความสะอาดระบบหล่อเย็น Coolant Filter', 'ทดสอบระบบความปลอดภัย Safety Interlock']
  }
];

const machineController = {
  // GET /api/machines
  async getMachines(req, res) {
    try {
      const { location_id, status } = req.query;

      let query = supabase.from('assets').select(`
        *,
        locations:location_id (id, name, code, address),
        asset_categories:category_id (id, name)
      `).order('name', { ascending: true });

      if (location_id) query = query.eq('location_id', location_id);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id,
          factory_id: item.location_id,
          factory_name: item.locations?.name || 'โรงงานอุตสาหกรรม',
          name: item.name,
          serial_number: item.serial_number || item.asset_code,
          model: item.model,
          brand: item.manufacturer,
          department: item.notes || 'ส่วนงานผลิต',
          installation_date: item.purchase_date || item.created_at,
          status: item.status === 'active' ? 'operational' : item.status === 'under_maintenance' ? 'warning' : 'breakdown',
          next_pm_date: '2026-11-15',
          last_service_date: '2026-08-10',
          specs: { 'Model': item.model || '', 'Manufacturer': item.manufacturer || '' },
          qr_code: `QR-${item.asset_code}`
        }));
        return res.status(200).json({ success: true, count: formatted.length, data: formatted });
      }

      // Fallback
      let filtered = [...mockAssets];
      if (location_id) filtered = filtered.filter(m => String(m.location_id) === String(location_id));

      const mapped = filtered.map(m => ({
        id: m.id,
        factory_id: m.location_id,
        factory_name: m.location_name,
        name: m.name,
        serial_number: m.serial_number,
        model: m.model,
        brand: m.manufacturer,
        department: m.department,
        installation_date: '2023-03-15',
        status: m.status_label,
        next_pm_date: m.next_pm_date,
        last_service_date: m.last_service_date,
        specs: m.specs,
        qr_code: m.qr_code
      }));

      return res.status(200).json({ success: true, source: 'local_fallback', count: mapped.length, data: mapped });
    } catch (err) {
      console.error('[machineController.getMachines error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockAssets });
    }
  },

  // GET /api/machines/:id
  async getMachineById(req, res) {
    try {
      const { id } = req.params;
      const found = mockAssets.find(m => String(m.id) === String(id) || m.asset_code === id);
      if (found) {
        return res.status(200).json({ success: true, data: found });
      }
      return res.status(404).json({ success: false, message: 'ไม่พบเครื่องจักร' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/factories
  async getFactories(req, res) {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (!error && data && data.length > 0) {
        const mapped = data.map(l => ({
          id: l.id,
          code: l.code || `LOC-${l.id}`,
          name: l.name,
          location: l.address || l.name,
          contact_person: 'ฝ่ายบริหารงานซ่อมบำรุง',
          contact_phone: '02-888-9999'
        }));
        return res.status(200).json({ success: true, count: mapped.length, data: mapped });
      }
      return res.status(200).json({ success: true, source: 'local_fallback', data: mockLocations });
    } catch (err) {
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockLocations });
    }
  },

  // GET /api/pm-schedules
  async getPMSchedules(req, res) {
    try {
      const { data, error } = await supabase.from('pm_schedules').select(`
        *,
        assets:asset_id (id, name, asset_code)
      `).order('next_due_date', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map(p => ({
          id: p.id,
          machine_id: p.asset_id,
          machine_name: p.assets?.name || 'เครื่องจักร',
          title: p.title,
          frequency_days: p.interval_days,
          due_date: p.next_due_date,
          status: 'upcoming',
          checklist: ['ตรวจเช็คระดับสารหล่อลื่น', 'ทดสอบระบบการทำงานฉุกเฉิน']
        }));
        return res.status(200).json({ success: true, count: mapped.length, data: mapped });
      }

      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        data: mockPMSchedules.map(p => ({
          ...p,
          frequency_days: p.interval_days,
          due_date: p.next_due_date
        }))
      });
    } catch (err) {
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockPMSchedules });
    }
  }
};

module.exports = machineController;
