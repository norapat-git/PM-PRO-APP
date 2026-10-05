const { supabase } = require('../config/supabase');

// Fallback in-memory data for instant development & offline testing
let mockTickets = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    ticket_number: 'TK-2026-0042',
    machine_id: 'b1000000-0000-0000-0000-000000000002',
    machine_name: 'ปั๊มไฮดรอลิกแรงดันสูง Press 500T',
    machine_serial: 'HYD-PUMP-500T-04',
    factory_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    customer_name: 'สมศักดิ์ ผู้จัดการฝ่ายผลิต',
    contact_phone: '081-888-2233',
    contact_email: 'somsak@bangna-parts.com',
    issue_type: 'hydraulic',
    urgency: 'high',
    preferred_time: 'วันนี้ก่อน 14:00 น.',
    description: 'แรงดันไฮดรอลิกตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและคราบน้ำมันซึมที่หัวปั๊ม',
    media_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
    ],
    status: 'in_progress',
    assigned_technician: 'ช่างกิตติศักดิ์ ชำนาญการ',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    ticket_number: 'TK-2026-0043',
    machine_id: 'b1000000-0000-0000-0000-000000000004',
    machine_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm #2',
    machine_serial: 'ROBOT-WELD-6AX-11',
    factory_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    customer_name: 'ประสิทธิ์ หัวหน้าซ่อมบำรุง',
    contact_phone: '085-123-9999',
    contact_email: 'prasit@nava-semi.co.th',
    issue_type: 'electrical',
    urgency: 'critical',
    preferred_time: 'ด่วนที่สุด',
    description: 'หุ่นยนต์เชื่อมหยุดกะทันหัน ฟ้อง Alarm E-742 Servo Axis 3 Overload สั่งการไม่ได้',
    media_urls: [],
    status: 'assigned',
    assigned_technician: 'ช่างธนพล วิศวกรควบคุม',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const ticketController = {
  // GET /api/tickets - List all tickets with optional filtering
  async getTickets(req, res) {
    try {
      const { status, urgency } = req.query;
      let query = supabase.from('repair_tickets').select(`
        *,
        machines:machine_id (id, name, serial_number, model, brand),
        factories:factory_id (id, name, location)
      `).order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (urgency && urgency !== 'all') {
        query = query.eq('urgency', urgency);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }

      // Fallback
      let filtered = [...mockTickets];
      if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
      if (urgency && urgency !== 'all') filtered = filtered.filter(t => t.urgency === urgency);

      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        count: filtered.length,
        data: filtered
      });
    } catch (err) {
      console.error('[TicketController.getTickets error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockTickets });
    }
  },

  // GET /api/tickets/:id - Get ticket by ID
  async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('repair_tickets')
        .select(`
          *,
          machines:machine_id (*),
          factories:factory_id (*)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.status(200).json({ success: true, data });
      }

      const found = mockTickets.find(t => t.id === id || t.ticket_number === id);
      if (found) {
        return res.status(200).json({ success: true, data: found });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลใบแจ้งซ่อม' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/tickets - Create new repair request
  async createTicket(req, res) {
    try {
      const {
        machine_id,
        factory_id,
        customer_name,
        contact_phone,
        contact_email,
        issue_type,
        urgency = 'medium',
        preferred_time,
        description,
        media_urls = []
      } = req.body;

      if (!customer_name || !contact_phone || !issue_type || !description) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูลที่จำเป็น: ชื่อผู้แจ้ง, เบอร์โทร, ประเภทปัญหา และรายละเอียด'
        });
      }

      const ticketNumber = `TK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        ticket_number: ticketNumber,
        machine_id: machine_id || null,
        factory_id: factory_id || null,
        customer_name,
        contact_phone,
        contact_email: contact_email || '',
        issue_type,
        urgency,
        preferred_time: preferred_time || 'ตามสะดวก',
        description,
        media_urls,
        status: 'submitted',
        assigned_technician: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('repair_tickets')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        return res.status(201).json({
          success: true,
          message: 'บันทึกการแจ้งซ่อมเรียบร้อยแล้ว',
          data
        });
      }

      // Add to mock
      const mockCreated = { id: `tk-${Date.now()}`, ...newRecord };
      mockTickets.unshift(mockCreated);

      return res.status(201).json({
        success: true,
        message: 'บันทึกการแจ้งซ่อมเรียบร้อยแล้ว (Local Sync)',
        data: mockCreated
      });
    } catch (err) {
      console.error('[TicketController.createTicket error]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/tickets/:id/status - Update ticket status
  async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, assigned_technician } = req.body;

      const updatePayload = {
        updated_at: new Date().toISOString()
      };
      if (status) updatePayload.status = status;
      if (assigned_technician !== undefined) updatePayload.assigned_technician = assigned_technician;

      const { data, error } = await supabase
        .from('repair_tickets')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data });
      }

      // Fallback
      const index = mockTickets.findIndex(t => t.id === id);
      if (index !== -1) {
        mockTickets[index] = { ...mockTickets[index], ...updatePayload };
        return res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: mockTickets[index] });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบรายการแจ้งซ่อม' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = ticketController;
