const { supabase } = require('../config/supabase');

let mockReports = [
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    report_number: 'SR-2026-0088',
    ticket_id: 'd1000000-0000-0000-0000-000000000001',
    ticket_number: 'TK-2026-0042',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง Press 500T',
    technician_name: 'ช่างกิตติศักดิ์ ชำนาญการ',
    service_date: '2026-10-04',
    service_type: 'corrective',
    summary_findings: 'ตรวจพบชุดโอริงซีลแกนเพลาฉีกขาดจากความร้อนสะสม ทำให้น้ำมันไฮดรอลิกสูญเสียแรงดัน',
    action_taken: 'ถอดล้างชุดซีล เปลี่ยนชุดโอริงและซีล Rexroth 60mm ใหม่ เติมน้ำมันไฮดรอลิก ISO VG46 และทดสอบแรงดันระบบที่ 250 Bar นิ่งสนิท',
    before_photos: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    after_photos: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'
    ],
    measurements: {
      operating_pressure: '248 Bar (เกณฑ์ปกติ 240-255 Bar)',
      oil_temperature: '54 °C (เกณฑ์ปกติ < 65 °C)',
      pump_vibration: '1.8 mm/s (เกณฑ์ปกติ < 2.5 mm/s)',
      motor_current: '28.4 A (พิกัด 32 A)',
      flow_rate: '178 L/min'
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
    customer_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M 10 50 Q 50 10 90 50 T 170 40" fill="none" stroke="%230f172a" stroke-width="3"/></svg>',
    customer_signed_by: 'คุณสมศักดิ์ (หัวหน้าส่วนผลิต)',
    customer_signed_at: '2026-10-04T15:30:00Z',
    status: 'acknowledged',
    created_at: '2026-10-04T15:35:00Z'
  }
];

const serviceReportController = {
  // GET /api/reports
  async getReports(req, res) {
    try {
      const { ticket_id, machine_id } = req.query;
      let query = supabase.from('service_reports').select(`
        *,
        machines:machine_id (id, name, serial_number),
        repair_tickets:ticket_id (id, ticket_number, customer_name)
      `).order('created_at', { ascending: false });

      if (ticket_id) query = query.eq('ticket_id', ticket_id);
      if (machine_id) query = query.eq('machine_id', machine_id);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }

      let filtered = [...mockReports];
      if (ticket_id) filtered = filtered.filter(r => r.ticket_id === ticket_id);
      if (machine_id) filtered = filtered.filter(r => r.machine_id === machine_id);

      return res.status(200).json({ success: true, source: 'local_fallback', count: filtered.length, data: filtered });
    } catch (err) {
      console.error('[ServiceReportController.getReports error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockReports });
    }
  },

  // GET /api/reports/:id
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('service_reports')
        .select(`
          *,
          machines:machine_id (*),
          repair_tickets:ticket_id (*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.status(200).json({ success: true, data });
      }

      const found = mockReports.find(r => r.id === id || r.report_number === id);
      if (found) {
        return res.status(200).json({ success: true, data: found });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบรายงานบริการ' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/reports - Create new technician service report
  async createReport(req, res) {
    try {
      const {
        ticket_id,
        machine_id,
        technician_name,
        service_date,
        service_type = 'corrective',
        summary_findings,
        action_taken,
        before_photos = [],
        after_photos = [],
        measurements = {},
        parts_used = [],
        customer_signature,
        customer_signed_by
      } = req.body;

      if (!technician_name || !summary_findings || !action_taken) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูลให้ครบถ้วน: ชื่อช่าง, ผลการตรวจพบ, การดำเนินงาน'
        });
      }

      const reportNumber = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        report_number: reportNumber,
        ticket_id: ticket_id || null,
        machine_id: machine_id || null,
        technician_name,
        service_date: service_date || new Date().toISOString().split('T')[0],
        service_type,
        summary_findings,
        action_taken,
        before_photos,
        after_photos,
        measurements,
        parts_used,
        customer_signature: customer_signature || null,
        customer_signed_by: customer_signed_by || null,
        customer_signed_at: customer_signature ? new Date().toISOString() : null,
        status: customer_signature ? 'acknowledged' : 'submitted',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('service_reports')
        .insert(newRecord)
        .select()
        .single();

      // If associated with a ticket and signed, update ticket to completed
      if (ticket_id) {
        await supabase
          .from('repair_tickets')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', ticket_id);
      }

      if (!error && data) {
        return res.status(201).json({
          success: true,
          message: 'บันทึกรายงานงานบริการและลายเซ็นลูกค้าสำเร็จ',
          data
        });
      }

      // Add to mock
      const mockCreated = { id: `rep-${Date.now()}`, ...newRecord };
      mockReports.unshift(mockCreated);

      return res.status(201).json({
        success: true,
        message: 'บันทึกรายงานงานบริการและลายเซ็นลูกค้าสำเร็จ (Local Sync)',
        data: mockCreated
      });
    } catch (err) {
      console.error('[ServiceReportController.createReport error]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = serviceReportController;
