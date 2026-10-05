import React, { useState } from 'react';
import type { Quotation, SparePart, QuotationStatus, UserRole } from '../types';
import { 
  FileText, 
  Package, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Send, 
  Check, 
  X, 
  AlertCircle,
  TrendingUp,
  Building,
  Calendar
} from 'lucide-react';

interface QuotationsViewProps {
  quotations: Quotation[];
  spareParts: SparePart[];
  userRole: UserRole;
  onCreateQuotation: (data: Omit<Quotation, 'id' | 'quotation_number' | 'created_at' | 'updated_at'>) => void;
  onUpdateQuotationStatus: (id: string, status: QuotationStatus) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  spareParts,
  userRole,
  onCreateQuotation,
  onUpdateQuotationStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'catalog'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isRFQModalOpen, setIsRFQModalOpen] = useState(false);

  // New RFQ Form State
  const [customerName, setCustomerName] = useState('คุณอนุรักษ์ รัตนชัย');
  const [companyName, setCompanyName] = useState('โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์');
  const [contactEmail, setContactEmail] = useState('anurak@bangna.co.th');
  const [contactPhone, setContactPhone] = useState('081-445-8899');
  const [selectedItems, setSelectedItems] = useState<{ part: SparePart; quantity: number }[]>([]);
  const [rfqNotes, setRfqNotes] = useState('ต้องการใบเสนอราคาด่วน พร้อมกำหนดวันส่งมอบเข้าโรงงาน');

  const filteredQuotations = quotations.filter(q =>
    q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredParts = spareParts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pipelineStages: { key: QuotationStatus; label: string; desc: string; color: string }[] = [
    { key: 'requested', label: '1. รับคำขอ (RFQ)', desc: 'ลูกค้ายื่นขอราคา', color: '#0284c7' },
    { key: 'drafting', label: '2. จัดทำใบเสนอราคา', desc: 'เจ้าหน้าที่คำนวณราคา', color: '#d97706' },
    { key: 'sent_to_client', label: '3. ส่งให้ลูกค้า', desc: 'รอฝ่ายจัดซื้ออนุมัติ', color: '#4338ca' },
    { key: 'approved', label: '4. อนุมัติสั่งซื้อ', desc: 'ออก PO เรียบร้อย', color: '#15803d' },
    { key: 'preparing_parts', label: '5. เตรียมอะไหล่', desc: 'เบิกจ่ายจากคลัง', color: '#86198f' },
    { key: 'delivered', label: '6. ส่งมอบเสร็จสิ้น', desc: 'ติดตั้ง/ส่งถึงโรงงาน', color: '#065f46' }
  ];

  const getStageBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'requested': return <span className="badge badge-requested">1. รับคำขอราคา (RFQ)</span>;
      case 'drafting': return <span className="badge badge-drafting">2. กำลังจัดทำใบเสนอราคา</span>;
      case 'sent_to_client': return <span className="badge badge-sent_to_client">3. ส่งให้พิจารณา</span>;
      case 'approved': return <span className="badge badge-approved">4. อนุมัติการสั่งซื้อ (PO)</span>;
      case 'preparing_parts': return <span className="badge badge-preparing_parts">5. กำลังจัดเตรียมอะไหล่</span>;
      case 'delivered': return <span className="badge badge-delivered">✓ ส่งมอบเรียบร้อย</span>;
      default: return <span className="badge badge-low">{status}</span>;
    }
  };

  const handleAddItemToRFQ = (part: SparePart) => {
    const existing = selectedItems.find(i => i.part.id === part.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.part.id === part.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { part, quantity: 1 }]);
    }
  };

  const handleRemoveItemFromRFQ = (partId: string) => {
    setSelectedItems(selectedItems.filter(i => i.part.id !== partId));
  };

  const handleCreateRFQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกรายการอะไหล่หรือบริการอย่างน้อย 1 รายการ');
      return;
    }

    const items = selectedItems.map(i => ({
      part_number: i.part.part_number,
      name: i.part.name,
      quantity: i.quantity,
      unit_price: i.part.unit_price,
      total: i.quantity * i.part.unit_price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vat = Number((subtotal * 0.07).toFixed(2));
    const total_amount = subtotal + vat;

    onCreateQuotation({
      customer_name: customerName,
      company_name: companyName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      items,
      subtotal,
      discount: 0,
      vat,
      total_amount,
      notes: rfqNotes,
      status: 'requested'
    });

    setSelectedItems([]);
    setIsRFQModalOpen(false);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Header and Subtabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            ระบบติดตามใบเสนอราคาและอะไหล่ (Quotation & Spare Parts Pipeline)
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            ติดตามสถานะคำขอราคาตั้งแต่ยื่นขอ จัดทำ อนุมัติสั่งซื้อ จนถึงเบิกจ่ายและส่งมอบอะไหล่
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 3,
            border: '1px solid #cbd5e1',
            display: 'flex'
          }}>
            <button
              onClick={() => setActiveSubTab('pipeline')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: activeSubTab === 'pipeline' ? '#ffffff' : '#64748b',
                backgroundColor: activeSubTab === 'pipeline' ? '#0284c7' : 'transparent'
              }}
            >
              ติดตามสถานะใบเสนอราคา ({quotations.length})
            </button>
            <button
              onClick={() => setActiveSubTab('catalog')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: activeSubTab === 'catalog' ? '#ffffff' : '#64748b',
                backgroundColor: activeSubTab === 'catalog' ? '#0284c7' : 'transparent'
              }}
            >
              คลังอะไหล่และราคา ({spareParts.length})
            </button>
          </div>

          <button
            onClick={() => setIsRFQModalOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}
          >
            <Plus size={16} /> ยื่นขอใบเสนอราคา (RFQ)
          </button>
        </div>
      </div>

      {/* PIPELINE TAB */}
      {activeSubTab === 'pipeline' && (
        <div>
          {/* Pipeline Stage Summary Steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            marginBottom: 24
          }}>
            {pipelineStages.map((stage, idx) => {
              const count = quotations.filter(q => q.status === stage.key).length;
              return (
                <div
                  key={stage.key}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: stage.color }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {count} <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>ใบ</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{stage.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Quotations List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredQuotations.map(q => {
              return (
                <div
                  key={q.id}
                  className="interactive-card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    padding: '20px 24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0284c7',
                        backgroundColor: '#e0f2fe',
                        padding: '3px 8px',
                        borderRadius: 6
                      }}>
                        {q.quotation_number}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {q.company_name}
                      </h3>
                      {getStageBadge(q.status)}
                    </div>

                    <div style={{ fontSize: 13, color: '#64748b' }}>
                      ผู้ติดต่อ: <span style={{ fontWeight: 600, color: '#1e293b' }}>{q.customer_name}</span> ({q.contact_phone})
                    </div>
                  </div>

                  {/* Items List Table Summary */}
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {q.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: '#334155' }}>
                            • {item.name} ({item.part_number}) x {item.quantity}
                          </span>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {item.total.toLocaleString()} บาท
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px dashed #cbd5e1',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#0284c7'
                    }}>
                      <span>ยอดสุทธิรวมภาษี (Grand Total):</span>
                      <span>{q.total_amount.toLocaleString()} บาท</span>
                    </div>
                  </div>

                  {/* Pipeline Stage Controller */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingTop: 10,
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      หมายเหตุ: {q.notes || 'รับประกันคุณภาพและมีสต็อกพร้อมจัดส่ง'}
                    </span>

                    {/* Stage actions based on status */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {q.status === 'requested' && (
                        <button
                          onClick={() => onUpdateQuotationStatus(q.id, 'drafting')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          จัดทำราคา & ส่วนลด
                        </button>
                      )}

                      {q.status === 'drafting' && (
                        <button
                          onClick={() => onUpdateQuotationStatus(q.id, 'sent_to_client')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#e0e7ff',
                            color: '#4338ca',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          <Send size={13} style={{ display: 'inline', marginRight: 4 }} />
                          ส่งใบเสนอราคาให้ลูกค้า
                        </button>
                      )}

                      {q.status === 'sent_to_client' && (
                        <button
                          onClick={() => onUpdateQuotationStatus(q.id, 'approved')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          ✓ ลูกค้าอนุมัติสั่งซื้อ (Approve PO)
                        </button>
                      )}

                      {q.status === 'approved' && (
                        <button
                          onClick={() => onUpdateQuotationStatus(q.id, 'preparing_parts')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#fae8ff',
                            color: '#86198f',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          <Package size={13} style={{ display: 'inline', marginRight: 4 }} />
                          เบิกจ่ายอะไหล่จากคลัง
                        </button>
                      )}

                      {q.status === 'preparing_parts' && (
                        <button
                          onClick={() => onUpdateQuotationStatus(q.id, 'delivered')}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          <Truck size={13} style={{ display: 'inline', marginRight: 4 }} />
                          ยืนยันการส่งมอบ/ติดตั้งเรียบร้อย
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPARE PARTS CATALOG TAB */}
      {activeSubTab === 'catalog' && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                รายการอะไหล่ในคลังและราคาจำหน่าย (Spare Parts Inventory)
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                มีระบบแจ้งเตือนสต็อกต่ำ (Low Stock Alert) และความเข้ากันได้กับเครื่องจักร
              </p>
            </div>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>รหัสอะไหล่</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left' }}>ชื่ออะไหล่ / หมวดหมู่</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>สถานะสต็อก</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>จำนวนคงเหลือ</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>ราคาต่อหน่วย</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center' }}>ขอราคา</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map(part => {
                  const isLow = part.stock_quantity <= part.min_stock_level;
                  return (
                    <tr key={part.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                        {part.part_number}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{part.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>หมวดหมู่: {part.category}</div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {isLow ? (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                            สต็อกต่ำ (เหลือน้อย)
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                            มีสต็อกพร้อมส่ง
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>
                        {part.stock_quantity} {part.unit}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                        {part.unit_price.toLocaleString()} บ.
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            handleAddItemToRFQ(part);
                            setIsRFQModalOpen(true);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            backgroundColor: '#e0f2fe',
                            color: '#0284c7',
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          + ขอราคา
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUEST FOR QUOTATION (RFQ) MODAL */}
      {isRFQModalOpen && (
        <div className="modal-backdrop">
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            maxWidth: 720,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 24,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                ยื่นคำขอใบเสนอราคาอะไหล่และบริการ (Request for Quotation)
              </h3>
              <button onClick={() => setIsRFQModalOpen(false)} style={{ color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRFQSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    ชื่อผู้ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    ชื่อโรงงาน / บริษัท
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    required
                  />
                </div>
              </div>

              {/* Selected Items */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  รายการอะไหล่ที่ต้องการขอราคา:
                </label>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, backgroundColor: '#f8fafc' }}>
                  {selectedItems.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: 12, padding: 10 }}>
                      ยังไม่ได้เลือกรายการอะไหล่ คลิกเลือกจากด้านล่างเพื่อเพิ่ม
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>{item.part.name} ({item.part.unit_price.toLocaleString()} บ.)</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>จำนวน: {item.quantity}</span>
                            <button type="button" onClick={() => handleRemoveItemFromRFQ(item.part.id)} style={{ color: '#ef4444' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add from quick list */}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed #cbd5e1', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>+ เพิ่มอะไหล่:</span>
                    {spareParts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddItemToRFQ(p)}
                        style={{ padding: '3px 8px', borderRadius: 4, backgroundColor: '#e2e8f0', fontSize: 11 }}
                      >
                        {p.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  ข้อกำหนดเพิ่มเติม / วันที่ต้องการส่งมอบ
                </label>
                <textarea
                  rows={2}
                  value={rfqNotes}
                  onChange={(e) => setRfqNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsRFQModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: 6, backgroundColor: '#0284c7', color: '#fff', fontWeight: 700, fontSize: 13 }}
                >
                  ส่งคำขอใบเสนอราคา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
