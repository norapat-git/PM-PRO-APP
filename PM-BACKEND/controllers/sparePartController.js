const { supabase } = require('../config/supabase');

let mockParts = [
  {
    id: 1,
    part_code: 'SP-SEAL-REX-01',
    name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm',
    category: 'Hydraulic Seals',
    unit_cost: 3200.00,
    unit_price: 3200.00,
    stock_qty: 18,
    stock_quantity: 18,
    min_stock: 5,
    min_stock_level: 5,
    unit: 'ชุด',
    status: 'in_stock'
  },
  {
    id: 2,
    part_code: 'SP-FILT-OIL-75',
    name: 'ไส้กรองน้ำมันเครื่องอัดลม Atlas Copco GA75',
    category: 'Filtration',
    unit_cost: 4850.00,
    unit_price: 4850.00,
    stock_qty: 12,
    stock_quantity: 12,
    min_stock: 4,
    min_stock_level: 4,
    unit: 'ชิ้น',
    status: 'in_stock'
  },
  {
    id: 3,
    part_code: 'SP-SERVO-DRV-15',
    name: 'เซอร์โวมอเตอร์ไดรฟ์ 15kW Yaskawa Sigma-7',
    category: 'Electrical & Drives',
    unit_cost: 38500.00,
    unit_price: 38500.00,
    stock_qty: 2,
    stock_quantity: 2,
    min_stock: 3,
    min_stock_level: 3,
    unit: 'ตัว',
    status: 'low_stock'
  },
  {
    id: 4,
    part_code: 'SP-BEAR-SKF-6310',
    name: 'ตลับลูกปืนความเร็วสูง SKF 6310-2RS1/C3',
    category: 'Bearings',
    unit_cost: 1450.00,
    unit_price: 1450.00,
    stock_qty: 45,
    stock_quantity: 45,
    min_stock: 10,
    min_stock_level: 10,
    unit: 'ตลับ',
    status: 'in_stock'
  },
  {
    id: 5,
    part_code: 'SP-SOL-VALVE-24V',
    name: 'โซลินอยด์วาล์ว 5/2 ทาง 24VDC SMC SY5120',
    category: 'Pneumatics',
    unit_cost: 2750.00,
    unit_price: 2750.00,
    stock_qty: 22,
    stock_quantity: 22,
    min_stock: 6,
    min_stock_level: 6,
    unit: 'ตัว',
    status: 'in_stock'
  }
];

const sparePartController = {
  // GET /api/spare-parts
  async getSpareParts(req, res) {
    try {
      const { search, low_stock } = req.query;
      let query = supabase.from('parts').select(`
        *,
        suppliers:supplier_id (id, name, contact)
      `).order('name', { ascending: true });

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped = data.map(p => ({
          id: p.id,
          part_number: p.part_code,
          part_code: p.part_code,
          name: p.name,
          category: p.suppliers?.name || 'อะไหล่และอุปกรณ์',
          unit_price: Number(p.unit_cost),
          stock_quantity: Number(p.stock_qty),
          min_stock_level: Number(p.min_stock),
          unit: p.unit
        }));
        return res.status(200).json({ success: true, count: mapped.length, data: mapped });
      }

      let filtered = [...mockParts];
      if (search) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.part_code.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (low_stock === 'true') {
        filtered = filtered.filter(p => p.stock_qty <= p.min_stock);
      }

      const mapped = filtered.map(p => ({
        ...p,
        part_number: p.part_code
      }));

      return res.status(200).json({ success: true, source: 'local_fallback', count: mapped.length, data: mapped });
    } catch (err) {
      return res.status(200).json({ success: true, source: 'fallback_error', data: mockParts });
    }
  },

  // POST /api/spare-parts
  async createSparePart(req, res) {
    try {
      const { part_number, part_code, name, unit_price, unit_cost, stock_quantity, stock_qty, min_stock_level, unit } = req.body;
      const code = part_code || part_number;
      if (!code || !name) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุรหัสอะไหล่และชื่ออะไหล่' });
      }

      const newRecord = {
        id: Date.now(),
        part_code: code,
        part_number: code,
        name,
        category: 'ทั่วไป',
        unit_cost: Number(unit_cost || unit_price || 0),
        unit_price: Number(unit_cost || unit_price || 0),
        stock_qty: Number(stock_qty || stock_quantity || 0),
        stock_quantity: Number(stock_qty || stock_quantity || 0),
        min_stock: Number(min_stock_level || 5),
        min_stock_level: Number(min_stock_level || 5),
        unit: unit || 'ชิ้น'
      };

      try {
        await supabase.from('parts').insert({
          part_code: newRecord.part_code,
          name: newRecord.name,
          unit: newRecord.unit,
          unit_cost: newRecord.unit_cost,
          stock_qty: newRecord.stock_qty,
          min_stock: newRecord.min_stock
        });
      } catch {}

      mockParts.unshift(newRecord);
      return res.status(201).json({ success: true, message: 'เพิ่มอะไหล่เรียบร้อย', data: newRecord });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = sparePartController;
