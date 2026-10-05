import React, { useState } from 'react';
import type { ServiceReport, UserRole } from '../types';
import { 
  FileCheck2, 
  Calendar, 
  User, 
  PenTool, 
  Printer, 
  CheckCircle, 
  ExternalLink,
  Search,
  Camera,
  Layers,
  Gauge
} from 'lucide-react';

interface ServiceReportsListViewProps {
  reports: ServiceReport[];
  userRole: UserRole;
  onOpenReportDetails: (report: ServiceReport) => void;
}

export const ServiceReportsListView: React.FC<ServiceReportsListViewProps> = ({
  reports,
  userRole,
  onOpenReportDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = reports.filter(r =>
    r.report_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.machine_name && r.machine_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    r.technician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.ticket_number && r.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            รายงานงานบริการสำหรับช่าง (Technician Field Service Reports)
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            ประวัติการปฏิบัติงานหน้างาน รูปภาพก่อน-หลังตรวจซ่อม ผลตรวจวัด และลายเซ็นตรวจรับจากลูกค้า
          </p>
        </div>

        <div style={{ position: 'relative', width: 320 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="ค้นหาเลขที่รายงาน, ช่าง, เครื่องจักร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {filteredReports.map(rep => {
          return (
            <div
              key={rep.id}
              className="interactive-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                boxShadow: 'var(--shadow-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#0284c7',
                  backgroundColor: '#e0f2fe',
                  padding: '3px 8px',
                  borderRadius: 6
                }}>
                  {rep.report_number}
                </span>
                <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} /> {new Date(rep.service_date).toLocaleDateString('th-TH')}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  {rep.machine_name}
                </h3>
                <div style={{ fontSize: 12, color: '#0284c7', marginTop: 2 }}>
                  ตั๋วอ้างอิง: {rep.ticket_number || 'TR-2026'} | ประเภท: {rep.service_type === 'corrective' ? 'งานซ่อมแก้ไข' : 'บำรุงรักษาเชิงป้องกัน'}
                </div>
              </div>

              {/* Before & After Thumbnails */}
              {rep.before_photos.length > 0 && rep.after_photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={rep.before_photos[0]}
                      alt="Before"
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid #fecaca' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      backgroundColor: 'rgba(185, 28, 28, 0.85)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4
                    }}>
                      ก่อนซ่อม
                    </span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <img
                      src={rep.after_photos[0]}
                      alt="After"
                      style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8, border: '1px solid #bbf7d0' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      backgroundColor: 'rgba(21, 128, 61, 0.85)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4
                    }}>
                      หลังซ่อม
                    </span>
                  </div>
                </div>
              )}

              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                {rep.summary_findings}
              </p>

              {/* Technician and Customer Sign Info */}
              <div style={{
                marginTop: 'auto',
                paddingTop: 12,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12
              }}>
                <span style={{ color: '#64748b' }}>
                  👨‍🔧 {rep.technician_name.split(' ')[0]}
                </span>

                {rep.customer_signature ? (
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: '#15803d',
                    fontWeight: 600,
                    backgroundColor: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    <CheckCircle size={13} /> ลูกค้าเซ็นรับแล้ว
                  </span>
                ) : (
                  <span style={{ color: '#d97706', fontSize: 11 }}>รอลูกค้าลงนาม</span>
                )}
              </div>

              {/* Open Detail / Print Button */}
              <button
                onClick={() => onOpenReportDetails(rep)}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0284c7',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <Printer size={15} /> ดูรายงานฉบับเต็ม / พิมพ์เอกสาร
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
