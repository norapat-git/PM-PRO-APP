const { supabase } = require('../config/supabase');

let mockQuotations = [
  {
    id: 'e1000000-0000-0000-0000-000000000001',
    quotation_number: 'QT-2026-0105',
    customer_name: 'คุณอนุรักษ์',
    company_name: 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์',
    contact_email: 'anurak@bangna.co.th',
    contact_phone: '081-445-8899',
    ticket_id: 'd1000000-0000-0000-0000-000000000001',
    ticket_number: 'TK-2026-0042',
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
        name: 'ค่าบริการตรวจเช็คและเปลี่ยนชุดซีลหน้างาน',
        quantity: 1,
        unit_price: 4500,
        total: 4500
      }
    ],
    subtotal: 10900.00,
    discount: 500.00,
    vat: 728.00,
    total_amount: 11128.00,
    notes: 'เสนอราคาพร้อมรับประกันงานซ่อม 90 วัน จัดส่งอะไหล่ภายใน 24 ชม.',
    status: 'sent_to_client',
    created_at: '2026-10-04T10:00:00Z',
    updated_at: '2026-10-04T11:30:00Z'
  },
  {
    id: 'e1000000-0000-0000-0000-000000000002',
    quotation_number: 'QT-2026-0106',
    customer_name: 'คุณประสิทธิ์',
    company_name: 'โรงงานนวนคร อิเล็กทรอนิกส์และเซมิคอนดักเตอร์',
    contact_email: 'prasit@nava-semi.co.th',
    contact_phone: '085-123-9999',
    ticket_id: 'd1000000-0000-0000-0000-000000000002',
    ticket_number: 'TK-2026-0043',
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
        name: 'ค่าบริการพารามิเตอร์และ Tuning Servo Axis 3',
        quantity: 1,
        unit_price: 6500,
        total: 6500
      }
    ],
    subtotal: 45000.00,
    discount: 1000.00,
    vat: 3080.00,
    total_amount: 47080.00,
    notes: 'อะไหล่เบิกศูนย์แท้ มีสต็อกพร้อมจัดส่งและติดตั้งทันที',
    status: 'drafting',
    created_at: '2026-10-05T08:30:00Z',
    updated_at: '2026-10-05T09:15:00Z'
  }
];

const quotationController = {
  // GET /api/quotations
  async getQuotations(req, res) {
    try {
      const { status } = req.query;
      let query = supabase.from('quotations').select(`
        *,
        repair_tickets:ticket_id (id, ticket_number, customer_name)
      `).order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return res.status(200).json({ success: true, count: data.length, data });
      }

      let filtered = [...mockQuotations];
      if (status && status !== 'all') filtered = filtered.filter(q => q.status === status);

      return res.status(200).json({ success: true, source: 'local_fallback', count: filtered.length, data: filtered });
    } catch (err) {
      console.error('[QuotationController.getQuotations error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockQuotations });
    }
  },

  // GET /api/quotations/:id
  async getQuotationById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await supabase.from('quotations').select('*').eq('id', id).single();
      if (!error && data) {
        return res.status(200).json({ success: true, data });
      }

      const found = mockQuotations.find(q => q.id === id || q.quotation_number === id);
      if (found) {
        return res.status(200).json({ success: true, data: found });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบใบเสนอราคา' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // POST /api/quotations - Create RFQ or Quotation
  async createQuotation(req, res) {
    try {
      const {
        customer_name,
        company_name,
        contact_email,
        contact_phone,
        ticket_id,
        items = [],
        notes = '',
        status = 'requested'
      } = req.body;

      if (!customer_name || !company_name || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'กรุณากรอกข้อมูลลูกค้า บริษัท และรายการสินค้าอย่างน้อย 1 รายการ'
        });
      }

      const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price || 0)), 0);
      const discount = Number(req.body.discount) || 0;
      const taxable = Math.max(0, subtotal - discount);
      const vat = Number((taxable * 0.07).toFixed(2));
      const total_amount = Number((taxable + vat).toFixed(2));

      const quotationNumber = `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord = {
        quotation_number: quotationNumber,
        customer_name,
        company_name,
        contact_email: contact_email || '',
        contact_phone: contact_phone || '',
        ticket_id: ticket_id || null,
        items,
        subtotal,
        discount,
        vat,
        total_amount,
        notes,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('quotations').insert(newRecord).select().single();
      if (!error && data) {
        return res.status(201).json({ success: true, message: 'บันทึกคำขอใบเสนอราคาสำเร็จ', data });
      }

      const mockCreated = { id: `qt-${Date.now()}`, ...newRecord };
      mockQuotations.unshift(mockCreated);
      return res.status(201).json({ success: true, message: 'บันทึกคำขอใบเสนอราคาสำเร็จ (Local Sync)', data: mockCreated });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  // PUT /api/quotations/:id/status - Update quotation status in pipeline
  async updateQuotationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุสถานะ' });
      }

      const updatePayload = { status, updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from('quotations').update(updatePayload).eq('id', id).select().single();

      if (!error && data) {
        return res.status(200).json({ success: true, message: 'อัปเดตสถานะใบเสนอราคาสำเร็จ', data });
      }

      const index = mockQuotations.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuotations[index] = { ...mockQuotations[index], ...updatePayload };
        return res.status(200).json({ success: true, message: 'อัปเดตสถานะสำเร็จ', data: mockQuotations[index] });
      }

      return res.status(404).json({ success: false, message: 'ไม่พบใบเสนอราคา' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = quotationController;
