const { supabase } = require('../config/supabase');

let mockFactories = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    code: 'FT-BKK-01',
    name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    location: 'สมุทรปราการ',
    contact_person: 'คุณอนุรักษ์',
    contact_phone: '081-445-8899'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    code: 'FT-RYG-02',
    name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี',
    location: 'ระยอง',
    contact_person: 'คุณวิภาวรรณ',
    contact_phone: '089-112-3344'
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    code: 'FT-AYT-03',
    name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    location: 'ปทุมธานี',
    contact_person: 'คุณสมเกียรติ',
    contact_phone: '086-778-9900'
  }
];

let mockMachines = [
  {
    id: 'b1000000-0000-0000-0000-000000000001',
    factory_id: 'a1000000-0000-0000-0000-000000000001',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    name: 'เครื่องกลึง CNC 5 แกน (Line A)',
    serial_number: 'CNC-5AX-2023-018',
    model: 'VX-500 Pro',
    brand: 'Mazak',
    department: 'แผนก Machining',
    installation_date: '2023-03-15',
    status: 'operational',
    next_pm_date: '2026-11-15',
    last_service_date: '2026-08-10',
    specs: { power: '15kW', max_rpm: 12000, pressure: '7 Bar' },
    qr_code: 'QR-CNC-018'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000002',
    factory_id: 'a1000000-0000-0000-0000-000000000001',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    name: 'ปั๊มไฮดรอลิกแรงดันสูง Press 500T',
    serial_number: 'HYD-PUMP-500T-04',
    model: 'HP-500H',
    brand: 'Rexroth',
    department: 'แผนก Pressing',
    installation_date: '2022-07-20',
    status: 'warning',
    next_pm_date: '2026-10-18',
    last_service_date: '2026-07-12',
    specs: { flow_rate: '180 L/min', oil_temp: '68C', pressure: '250 Bar' },
    qr_code: 'QR-HYD-500T'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000003',
    factory_id: 'a1000000-0000-0000-0000-000000000002',
    factory_name: 'โรงงานมาบตาพุด เคมีภัณฑ์และปิโตรเคมี',
    name: 'Air Compressor สกรูอุตสาหกรรม 75kW',
    serial_number: 'AC-SCREW-75-09',
    model: 'Atlas-GA75',
    brand: 'Atlas Copco',
    department: 'ระบบ Utility & พลังงาน',
    installation_date: '2021-11-10',
    status: 'operational',
    next_pm_date: '2026-12-01',
    last_service_date: '2026-09-02',
    specs: { pressure_bar: 8.5, dewpoint: '3C', cooling: 'Air-cooled' },
    qr_code: 'QR-COMP-75'
  },
  {
    id: 'b1000000-0000-0000-0000-000000000004',
    factory_id: 'a1000000-0000-0000-0000-000000000003',
    factory_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm #2',
    serial_number: 'ROBOT-WELD-6AX-11',
    model: 'KR-CYBERTECH',
    brand: 'KUKA',
    department: 'แผนก Robotic Assembly',
    installation_date: '2024-01-18',
    status: 'breakdown',
    next_pm_date: '2026-10-08',
    last_service_date: '2026-08-25',
    specs: { payload: '16kg', reach: '2013mm', repeatability: '0.04mm' },
    qr_code: 'QR-ROBOT-W11'
  }
];

let mockPMSchedules = [
  {
    id: 'pm-01',
    machine_id: 'b1000000-0000-0000-0000-000000000004',
    machine_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm #2',
    title: 'ตรวจสอบระยะสลักเกลียว ข้อต่อแกน 1-6 และระบบหล่อลื่นจาระบี',
    frequency_days: 60,
    due_date: '2026-10-08',
    status: 'overdue',
    checklist: ['ตรวจสอบสายไฟหุ้มข้อต่อ', 'เช็คความแม่นยำ Zero Point', 'วัดกระแสไฟฟ้าขณะหมุนแกน']
  },
  {
    id: 'pm-02',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง Press 500T',
    title: 'ถ่ายน้ำมันไฮดรอลิก ตรวจไส้กรอง และเช็คระดับแรงสั่นสะเทือนมอเตอร์',
    frequency_days: 90,
    due_date: '2026-10-18',
    status: 'due_soon',
    checklist: ['วัดอุณหภูมิน้ำมัน', 'เช็ครอยรั่วข้อต่อท่อแรงดัน', 'วัดการสั่นสะเทือนแกนเพลา']
  },
  {
    id: 'pm-03',
    machine_id: 'b1000000-0000-0000-0000-000000000001',
    machine_name: 'เครื่องกลึง CNC 5 แกน (Line A)',
    title: 'บำรุงรักษาเชิงป้องกันประจำไตรมาส Calibration แกน X/Y/Z',
    frequency_days: 90,
    due_date: '2026-11-15',
    status: 'upcoming',
    checklist: ['ตรวจสอบแรงตึงสายพาน Spindle', 'เช็คระบบหล่อเย็น Coolant Filter', 'ทดสอบ Emergency Stop']
  }
];

const machineController = {
  // GET /api/machines
  async getMachines(req, res) {
    try {
      const { factory_id, status } = req.query;
      let query = supabase.from('machines').select(`
        *,
        factories:factory_id (id, name, code, location)
      `).order('name', { ascending: true });

      if (factory_id) query = query.eq('factory_id', factory_id);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }

      let filtered = [...mockMachines];
      if (factory_id) filtered = filtered.filter(m => m.factory_id === factory_id);
      if (status) filtered = filtered.filter(m => m.status === status);

      return res.status(200).json({ success: true, source: 'local_fallback', count: filtered.length, data: filtered });
    } catch (err) {
      console.error('[MachineController.getMachines error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockMachines });
    }
  },

  // GET /api/machines/:id
  async getMachineById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('machines')
        .select(`
          *,
          factories:factory_id (*),
          repair_tickets:repair_tickets(*),
          service_reports:service_reports(*),
          pm_schedules:pm_schedules(*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.status(200).json({ success: true, data });
      }

      const machine = mockMachines.find(m => m.id === id || m.serial_number === id);
      if (machine) {
        return res.status(200).json({
          success: true,
          data: {
            ...machine,
            pm_schedules: mockPMSchedules.filter(p => p.machine_id === machine.id)
          }
        });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลเครื่องจักร' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // GET /api/factories
  async getFactories(req, res) {
    try {
      const { data, error } = await supabase.from('factories').select('*');
      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }
      return res.status(200).json({ success: true, source: 'local_fallback', data: mockFactories });
    } catch (err) {
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockFactories });
    }
  },

  // GET /api/pm-schedules
  async getPMSchedules(req, res) {
    try {
      const { data, error } = await supabase.from('pm_schedules').select(`
        *,
        machines:machine_id (id, name, serial_number, department)
      `).order('due_date', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }

      return res.status(200).json({ success: true, source: 'local_fallback', data: mockPMSchedules });
    } catch (err) {
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockPMSchedules });
    }
  }
};

module.exports = machineController;
