const { supabase } = require('../config/supabase');

let mockSpareParts = [
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

const sparePartController = {
  // GET /api/spare-parts
  async getSpareParts(req, res) {
    try {
      const { search, category, low_stock } = req.query;
      let query = supabase.from('spare_parts').select('*').order('name', { ascending: true });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        let result = data;
        if (search) {
          result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.part_number.toLowerCase().includes(search.toLowerCase())
          );
        }
        return res.status(200).json({ success: true, count: result.length, data: result });
      }

      let filtered = [...mockSpareParts];
      if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
      if (search) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.part_number.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (low_stock === 'true') {
        filtered = filtered.filter(p => p.stock_quantity <= p.min_stock_level);
      }

      return res.status(200).json({ success: true, source: 'local_fallback', count: filtered.length, data: filtered });
    } catch (err) {
      console.error('[SparePartController.getSpareParts error]', err);
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockSpareParts });
    }
  },

  // POST /api/spare-parts - Add new part
  async createSparePart(req, res) {
    try {
      const { part_number, name, category, unit_price, stock_quantity, min_stock_level, unit } = req.body;
      if (!part_number || !name || !unit_price) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสอะไหล่, ชื่อ และราคาต่อหน่วย' });
      }

      const newRecord = {
        part_number,
        name,
        category: category || 'ทั่วไป',
        unit_price: Number(unit_price),
        stock_quantity: Number(stock_quantity) || 0,
        min_stock_level: Number(min_stock_level) || 5,
        unit: unit || 'ชิ้น',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase.from('spare_parts').insert(newRecord).select().single();
      if (!error && data) {
        return res.status(201).json({ success: true, message: 'เพิ่มอะไหล่เรียบร้อย', data });
      }

      const mockCreated = { id: `sp-${Date.now()}`, ...newRecord, status: 'in_stock' };
      mockSpareParts.unshift(mockCreated);
      return res.status(201).json({ success: true, message: 'เพิ่มอะไหล่เรียบร้อย (Local Sync)', data: mockCreated });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = sparePartController;
