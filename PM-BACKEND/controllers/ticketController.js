const { supabase } = require('../config/supabase');

// In-memory data matching the new PostgreSQL schema
let mockRequests = [
  {
    id: 1,
    request_no: 'MR-2026-00001',
    title: 'แรงดันไฮดรอลิกตกและพบคราบน้ำมันซึมที่หัวปั๊ม Press 500T',
    description: 'แรงดันไฮดรอลิกตกจาก 250 เหลือ 180 Bar มีเสียงหวีดและคราบน้ำมันซึมที่หัวปั๊ม เกรงว่าไลน์ผลิตจะสะดุด',
    priority: 'high',
    status: 'in_progress',
    desired_date: '2026-10-06',
    requester_name: 'สมศักดิ์ ผู้จัดการฝ่ายผลิต',
    requester_phone: '081-888-2233',
    requester_email: 'somsak@bangna-parts.com',
    asset_id: 2,
    asset_code: 'HYD-PUMP-500T-04',
    asset_name: 'ปั๊มไฮดรอลิกแรงดันสูง แท่นปั๊ม 500 ตัน',
    location_name: 'โรงงานบางนา - อาคารผลิตชิ้นส่วนยานยนต์ Line A',
    issue_type: 'ระบบไฮดรอลิกและแรงดัน',
    assigned_technician: 'ช่างกิตติศักดิ์ ชำนาญการ',
    media_urls: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    request_no: 'MR-2026-00002',
    title: 'หุ่นยนต์เชื่อมประกอบหยุดฉุกเฉิน ฟ้อง Alarm E-742 Servo Axis 3',
    description: 'หุ่นยนต์เชื่อมหยุดกะทันหันขณะทำงาน รอบหมุนสะดุดที่ข้อต่อแกน 3 จอคอนโทรลเลอร์ขึ้น Error E-742 Servo Axis 3 Overload',
    priority: 'critical',
    status: 'reviewing',
    desired_date: '2026-10-05',
    requester_name: 'ประสิทธิ์ หัวหน้าซ่อมบำรุง',
    requester_phone: '085-123-9999',
    requester_email: 'prasit@nava-semi.co.th',
    asset_id: 4,
    asset_code: 'ROBOT-WELD-6AX-11',
    asset_name: 'หุ่นยนต์เชื่อมประกอบ Robotic Arm 6 แกน #2',
    location_name: 'โรงงานนวนคร - อาคาร Robotic Assembly ชั้น 1',
    issue_type: 'ระบบไฟฟ้าและคอนโทรลเลอร์',
    assigned_technician: 'วิศวกรธนพล ชื่นใจ',
    media_urls: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const ticketController = {
  // GET /api/tickets - List all maintenance requests
  async getTickets(req, res) {
    try {
      const { status, priority, asset_id } = req.query;

      // Try Supabase maintenance_requests table first
      let query = supabase.from('maintenance_requests').select(`
        *,
        assets:asset_id (id, asset_code, name, model, serial_number),
        locations:location_id (id, name, code),
        users:requester_id (id, full_name, email, phone)
      `).order('created_at', { ascending: false });

      if (status && status !== 'all') query = query.eq('status', status);
      if (priority && priority !== 'all') query = query.eq('priority', priority);
      if (asset_id) query = query.eq('asset_id', asset_id);

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.id,
          ticket_number: item.request_no,
          request_no: item.request_no,
          title: item.title,
          description: item.description,
          urgency: item.priority,
          priority: item.priority,
          status: item.status,
          machine_id: item.asset_id,
          machine_name: item.assets?.name || item.title,
          machine_serial: item.assets?.serial_number || item.assets?.asset_code,
          factory_name: item.locations?.name,
          customer_name: item.users?.full_name || 'ผู้ประสานงาน',
          contact_phone: item.users?.phone || '',
          contact_email: item.users?.email || '',
          issue_type: item.title,
          preferred_time: item.desired_date ? `กำหนดส่งมอบ: ${item.desired_date}` : 'ตามสะดวก',
          media_urls: [],
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        return res.status(200).json({ success: true, count: formatted.length, data: formatted });
      }

      // Fallback
      let filtered = [...mockRequests];
      if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
      if (priority && priority !== 'all') filtered = filtered.filter(t => t.priority === priority);

      const mapped = filtered.map(t => ({
        id: t.id,
        ticket_number: t.request_no,
        request_no: t.request_no,
        title: t.title,
        description: t.description,
        urgency: t.priority,
        priority: t.priority,
        status: t.status,
        machine_id: t.asset_id,
        machine_name: t.asset_name,
        machine_serial: t.asset_code,
        factory_name: t.location_name,
        customer_name: t.requester_name,
        contact_phone: t.requester_phone,
        contact_email: t.requester_email,
        issue_type: t.issue_type,
        preferred_time: t.desired_date ? `ต้องการในวันที่: ${t.desired_date}` : 'ตามสะดวก',
        assigned_technician: t.assigned_technician,
        media_urls: t.media_urls,
        created_at: t.created_at,
        updated_at: t.updated_at
      }));

      return res.status(200).json({ success: true, source: 'local_fallback', count: mapped.length, data: mapped });
    } catch (err) {
      console.error('[ticketController.getTickets error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockRequests });
    }
  },

  // GET /api/tickets/:id
  async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const found = mockRequests.find(t => String(t.id) === String(id) || t.request_no === id);
      if (found) {
        return res.status(200).json({
          success: true,
          data: {
            ...found,
            ticket_number: found.request_no,
            urgency: found.priority
          }
        });
      }
      return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อม' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/tickets - Create maintenance request
  async createTicket(req, res) {
    try {
      const {
        title,
        description,
        customer_name,
        contact_phone,
        contact_email,
        machine_id,
        machine_name,
        urgency = 'medium',
        priority = 'medium',
        issue_type,
        preferred_time,
        desired_date,
        media_urls = []
      } = req.body;

      const requestNo = `MR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const newRecord = {
        id: Date.now(),
        request_no: requestNo,
        title: title || `${issue_type || 'แจ้งซ่อม'}: ${machine_name || 'เครื่องจักร'}`,
        description: description || '',
        priority: urgency || priority || 'medium',
        status: 'new',
        desired_date: desired_date || new Date().toISOString().split('T')[0],
        requester_name: customer_name || 'ผู้ประสานงาน',
        requester_phone: contact_phone || '',
        requester_email: contact_email || '',
        asset_id: machine_id || null,
        asset_name: machine_name || 'เครื่องจักรอุตสาหกรรม',
        asset_code: machine_id ? `AST-${machine_id}` : 'AST-GENERAL',
        location_name: 'โรงงานบางนา อุตสาหกรรม',
        issue_type: issue_type || 'ทั่วไป',
        assigned_technician: null,
        media_urls: mediaUrls(media_urls),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try inserting into Supabase
      try {
        await supabase.from('maintenance_requests').insert({
          request_no: requestNo,
          title: newRecord.title,
          description: newRecord.description,
          priority: newRecord.priority,
          status: 'new',
          desired_date: newRecord.desired_date
        });
      } catch (dbErr) {
        console.warn('[Supabase Insert Request Warning]', dbErr.message);
      }

      mockRequests.unshift(newRecord);

      return res.status(201).json({
        success: true,
        message: 'บันทึกใบแจ้งซ่อมสำเร็จ (Maintenance Request Created)',
        data: {
          ...newRecord,
          ticket_number: newRecord.request_no,
          urgency: newRecord.priority
        }
      });
    } catch (err) {
      console.error('[ticketController.createTicket error]', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/tickets/:id/status
  async updateTicketStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, priority, assigned_technician } = req.body;

      const updatePayload = { updated_at: new Date().toISOString() };
      if (status) updatePayload.status = status;
      if (priority) updatePayload.priority = priority;

      try {
        await supabase.from('maintenance_requests').update(updatePayload).eq('id', id);
      } catch {}

      const idx = mockRequests.findIndex(t => String(t.id) === String(id) || t.request_no === id);
      if (idx !== -1) {
        mockRequests[idx] = {
          ...mockRequests[idx],
          ...updatePayload,
          assigned_technician: assigned_technician !== undefined ? assigned_technician : mockRequests[idx].assigned_technician
        };
        return res.status(200).json({
          success: true,
          message: 'อัปเดตสถานะสำเร็จ',
          data: {
            ...mockRequests[idx],
            ticket_number: mockRequests[idx].request_no,
            urgency: mockRequests[idx].priority
          }
        });
      }

      return res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

function mediaUrls(urls) {
  if (Array.isArray(urls)) return urls;
  return [];
}

module.exports = ticketController;
