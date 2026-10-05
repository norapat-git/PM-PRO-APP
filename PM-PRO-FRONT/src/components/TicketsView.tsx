import React, { useState } from 'react';
import type { RepairTicket, UserRole, TicketStatus } from '../types';
import { 
  Wrench, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  UserCheck, 
  Phone, 
  FileText,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';

interface TicketsViewProps {
  tickets: RepairTicket[];
  userRole: UserRole;
  onOpenReportModal: (ticket: RepairTicket) => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus, tech?: string) => void;
  onOpenNewTicket: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({
  tickets,
  userRole,
  onOpenReportModal,
  onUpdateTicketStatus,
  onOpenNewTicket
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.machine_name && t.machine_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || t.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusStepIndex = (status: TicketStatus) => {
    switch (status) {
      case 'submitted': return 0;
      case 'assigned': return 1;
      case 'in_progress': return 2;
      case 'pending_approval': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const steps = [
    { title: '1. แจ้งเรื่อง', sub: 'ระบบรับข้อมูล' },
    { title: '2. จัดสรรช่าง', sub: 'มอบหมายทีม' },
    { title: '3. ดำเนินการ', sub: 'ตรวจซ่อมหน้างาน' },
    { title: '4. ตรวจรับงาน', sub: 'ลูกค้าเซ็นรับ' },
    { title: '5. เสร็จสมบูรณ์', sub: 'ปิดงานเรียบร้อย' }
  ];

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <span className="badge badge-critical">ด่วนวิกฤต (Critical)</span>;
      case 'high':
        return <span className="badge badge-high">ด่วนมาก (High)</span>;
      case 'medium':
        return <span className="badge badge-medium">ปานกลาง (Medium)</span>;
      default:
        return <span className="badge badge-low">ทั่วไป (Low)</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-completed">✓ เสร็จสมบูรณ์</span>;
      case 'in_progress':
        return <span className="badge badge-in_progress">⚙ กำลังดำเนินการ</span>;
      case 'assigned':
        return <span className="badge badge-assigned">👤 จัดสรรช่างแล้ว</span>;
      case 'pending_approval':
        return <span className="badge badge-pending_approval">✍ รอลูกค้าตรวจรับ</span>;
      default:
        return <span className="badge badge-submitted">📩 รอรับเรื่อง</span>;
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Top Banner & KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>งานแจ้งซ่อมทั้งหมด</span>
            <span style={{ padding: 6, borderRadius: 8, backgroundColor: '#f1f5f9', color: '#475569' }}><Wrench size={16} /></span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>{tickets.length}</div>
          <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>ครอบคลุม 3 โรงงานอุตสาหกรรม</div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>กำลังดำเนินการซ่อม</span>
            <span style={{ padding: 6, borderRadius: 8, backgroundColor: '#fef3c7', color: '#b45309' }}><Clock size={16} /></span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#b45309', marginTop: 8 }}>
            {tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>ช่างเข้าตรวจสอบหน้างาน</div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>เคสด่วนวิกฤต (Critical)</span>
            <span style={{ padding: 6, borderRadius: 8, backgroundColor: '#fee2e2', color: '#b91c1c' }}><AlertCircle size={16} /></span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626', marginTop: 8 }}>
            {tickets.filter(t => t.urgency === 'critical').length}
          </div>
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>ตอบสนองด่วนภายใน 2 ชม.</div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '18px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>ซ่อมเสร็จและเซ็นรับงานแล้ว</span>
            <span style={{ padding: 6, borderRadius: 8, backgroundColor: '#dcfce7', color: '#15803d' }}><CheckCircle size={16} /></span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#15803d', marginTop: 8 }}>
            {tickets.filter(t => t.status === 'completed').length}
          </div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>ส่งมอบรายงานดิจิทัลสำเร็จ</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ตั๋ว, ชื่อเครื่องจักร, ผู้แจ้ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#fff',
              color: '#334155'
            }}
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="submitted">รอรับเรื่อง</option>
            <option value="assigned">จัดสรรช่างแล้ว</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="completed">เสร็จสมบูรณ์</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#fff',
              color: '#334155'
            }}
          >
            <option value="all">ความเร่งด่วนทั้งหมด</option>
            <option value="critical">ด่วนวิกฤต (Critical)</option>
            <option value="high">ด่วนมาก (High)</option>
            <option value="medium">ปานกลาง (Medium)</option>
            <option value="low">ทั่วไป (Low)</option>
          </select>
        </div>

        <button
          onClick={onOpenNewTicket}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            backgroundColor: '#0284c7',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          + เปิดใบแจ้งซ่อมใหม่
        </button>
      </div>

      {/* Tickets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredTickets.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b'
          }}>
            <Wrench size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>ไม่พบรายการแจ้งซ่อม</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>ลองเปลี่ยนคำค้นหาหรือคลิกปุ่มเปิดใบแจ้งซ่อมใหม่</p>
          </div>
        ) : (
          filteredTickets.map(ticket => {
            const currentStep = getStatusStepIndex(ticket.status);
            return (
              <div
                key={ticket.id}
                className="interactive-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      {ticket.ticket_number}
                    </span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      {ticket.machine_name}
                    </h3>
                    {getUrgencyBadge(ticket.urgency)}
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    <span>แจ้งเมื่อ: {new Date(ticket.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Machine & Problem Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                  backgroundColor: '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid #f1f5f9'
                }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>โรงงาน / สถานที่ติดตั้ง:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                      {ticket.factory_name || 'โรงงานบางนา อุตสาหกรรมชิ้นส่วนยานยนต์'}
                    </span>
                    {ticket.machine_serial && (
                      <span style={{ fontSize: 12, color: '#475569', display: 'block', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                        S/N: {ticket.machine_serial}
                      </span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>ประเภทปัญหา & เวลาที่สะดวก:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{ticket.issue_type}</span>
                    <span style={{ fontSize: 12, color: '#0284c7', display: 'block', marginTop: 2 }}>
                      ⏰ สะดวก: {ticket.preferred_time || 'ตามที่ตกลง'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>ผู้แจ้ง & ทีมช่างผู้รับผิดชอบ:</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                      {ticket.customer_name} ({ticket.contact_phone})
                    </span>
                    <span style={{ fontSize: 12, color: '#4338ca', display: 'block', marginTop: 2, fontWeight: 600 }}>
                      👨‍🔧 ช่าง: {ticket.assigned_technician || 'กำลังรอจ่ายงาน'}
                    </span>
                  </div>
                </div>

                {/* Description & Media */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      รายละเอียดอาการเสียหน้างาน:
                    </span>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                      {ticket.description}
                    </p>
                  </div>

                  {ticket.media_urls && ticket.media_urls.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {ticket.media_urls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ position: 'relative' }}>
                          <img
                            src={url}
                            alt="issue photo"
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '1px solid #cbd5e1'
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progress Step Timeline Tracker */}
                <div style={{ marginTop: 6, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10 }}>
                    ลำดับสถานะการดำเนินการ (Live Tracking Pipeline):
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 8,
                    position: 'relative'
                  }}>
                    {steps.map((st, sIdx) => {
                      const isCompleted = sIdx <= currentStep;
                      const isCurrent = sIdx === currentStep;
                      return (
                        <div
                          key={sIdx}
                          style={{
                            textAlign: 'center',
                            padding: '8px 4px',
                            borderRadius: 8,
                            backgroundColor: isCurrent ? '#e0f2fe' : isCompleted ? '#f0fdf4' : '#f8fafc',
                            border: `1px solid ${isCurrent ? '#38bdf8' : isCompleted ? '#bbf7d0' : '#e2e8f0'}`
                          }}
                        >
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: isCurrent ? '#0284c7' : isCompleted ? '#10b981' : '#cbd5e1',
                            color: '#fff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 4px'
                          }}>
                            {isCompleted && sIdx < currentStep ? '✓' : sIdx + 1}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? '#0284c7' : isCompleted ? '#166534' : '#64748b' }}>
                            {st.title}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{st.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                  paddingTop: 12,
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap'
                }}>
                  {/* Status changer buttons */}
                  {ticket.status === 'submitted' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'assigned', 'ช่างกิตติศักดิ์ ชำนาญการ')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      👤 มอบหมายช่าง (Assign)
                    </button>
                  )}

                  {ticket.status === 'assigned' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'in_progress')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        backgroundColor: '#fef3c7',
                        color: '#b45309',
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      ⚙ ช่างเริ่มปฏิบัติงาน (Start Work)
                    </button>
                  )}

                  {/* Technician field service report modal launcher */}
                  <button
                    onClick={() => onOpenReportModal(ticket)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 6,
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <FileText size={15} />
                    {ticket.status === 'completed' ? 'ดูรายงานการซ่อม & ลายเซ็น' : 'บันทึกรายงานหน้างาน & ลายเซ็นลูกค้า'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
