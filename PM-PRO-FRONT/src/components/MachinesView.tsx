import React, { useState } from 'react';
import type { Machine, Factory, PMSchedule, ServiceReport, RepairTicket } from '../types';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  History, 
  Activity, 
  Wrench, 
  Cpu, 
  ShieldAlert,
  Search,
  ExternalLink
} from 'lucide-react';

interface MachinesViewProps {
  machines: Machine[];
  factories: Factory[];
  pmSchedules: PMSchedule[];
  reports: ServiceReport[];
  tickets: RepairTicket[];
  onSelectMachineForTicket: (machine: Machine) => void;
  onSelectReport: (report: ServiceReport) => void;
}

export const MachinesView: React.FC<MachinesViewProps> = ({
  machines,
  factories,
  pmSchedules,
  reports,
  tickets,
  onSelectMachineForTicket,
  onSelectReport
}) => {
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<Machine>(machines[0] || null);

  const filteredMachines = machines.filter(m => {
    const matchesFactory = selectedFactoryId === 'all' || m.factory_id === selectedFactoryId;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFactory && matchesStatus && matchesSearch;
  });

  const machinePMSchedules = pmSchedules.filter(p => p.machine_id === selectedMachine?.id);
  const machineTickets = tickets.filter(t => t.machine_id === selectedMachine?.id);
  const machineReports = reports.filter(r => r.machine_id === selectedMachine?.id);

  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'operational':
        return <span className="badge badge-operational">● ทำงานปกติ (Operational)</span>;
      case 'warning':
        return <span className="badge badge-warning">▲ ต้องเฝ้าระวัง (Warning)</span>;
      case 'breakdown':
        return <span className="badge badge-breakdown">✕ เครื่องหยุด (Breakdown)</span>;
      case 'maintenance':
        return <span className="badge badge-maintenance">⚙ ซ่อมบำรุง (Maintenance)</span>;
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 3600 * 24));
    return diffDays;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px', width: '100%' }}>
      {/* Header Overview */}
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
            ระบบประวัติเครื่องจักรและบำรุงรักษาเชิงป้องกัน (CMMS & Machinery Registry)
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            ติดตามสุขภาพเครื่องจักร แผนการบำรุงรักษา PM และประวัติงานซ่อมบำรุงทุกโรงงาน
          </p>
        </div>

        {/* Factory Quick Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedFactoryId('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              backgroundColor: selectedFactoryId === 'all' ? '#0f172a' : '#ffffff',
              color: selectedFactoryId === 'all' ? '#ffffff' : '#64748b',
              border: '1px solid #cbd5e1'
            }}
          >
            ทุกโรงงาน ({machines.length})
          </button>
          {factories.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFactoryId(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: selectedFactoryId === f.id ? '#0284c7' : '#ffffff',
                color: selectedFactoryId === f.id ? '#ffffff' : '#64748b',
                border: '1px solid #cbd5e1'
              }}
            >
              {f.name.split(' ')[0]} ({machines.filter(m => m.factory_id === f.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Left Machine List, Right Details & PM History */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Machinery Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
            <input
              type="text"
              placeholder="ค้นหาเครื่องจักร, Serial, รุ่น..."
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

          {/* Machine List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '72vh', overflowY: 'auto' }}>
            {filteredMachines.map(m => {
              const isSelected = selectedMachine?.id === m.id;
              const daysToPM = getDaysUntil(m.next_pm_date);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMachine(m)}
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                    borderRadius: 12,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}>
                      {m.serial_number}
                    </span>
                    {getStatusBadge(m.status)}
                  </div>

                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {m.name}
                  </h4>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {m.brand} • {m.model} • {m.department}
                  </p>

                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11
                  }}>
                    <span style={{ color: '#64748b' }}>
                      บำรุงรักษาถัดไป: {new Date(m.next_pm_date).toLocaleDateString('th-TH')}
                    </span>
                    <span style={{
                      fontWeight: 700,
                      color: daysToPM < 0 ? '#ef4444' : daysToPM <= 14 ? '#f59e0b' : '#10b981'
                    }}>
                      {daysToPM < 0 ? `เกินกำหนด ${Math.abs(daysToPM)} วัน` : `อีก ${daysToPM} วัน`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Machine Detail & PM History */}
        {selectedMachine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Machine Header Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                      {selectedMachine.name}
                    </h3>
                    {getStatusBadge(selectedMachine.status)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    {selectedMachine.brand} • รุ่น: {selectedMachine.model} • แผนก: {selectedMachine.department}
                  </p>
                  <p style={{ fontSize: 13, color: '#0284c7', fontWeight: 600, marginTop: 4 }}>
                    📍 {selectedMachine.factory_name}
                  </p>
                </div>

                {/* QR Code and Quick Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <QrCode size={28} color="#0f172a" />
                    <div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>QR Identifier</div>
                      <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {selectedMachine.qr_code}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectMachineForTicket(selectedMachine)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 8,
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                    }}
                  >
                    <Wrench size={16} /> แจ้งซ่อมเครื่องนี้
                  </button>
                </div>
              </div>

              {/* Technical Specs Grid */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 10 }}>
                  คุณสมบัติทางเทคนิคและการติดตั้ง (Machine Specifications):
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Serial Number</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {selectedMachine.serial_number}
                    </span>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>วันที่ติดตั้ง</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                      {new Date(selectedMachine.installation_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                  {Object.entries(selectedMachine.specs).map(([key, val]) => (
                    <div key={key} style={{ backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>{key}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PM Schedule & Upcoming Checklist */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={20} color="#0284c7" />
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    กำหนดการบำรุงรักษาเชิงป้องกัน (Preventive Maintenance Schedule)
                  </h4>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>รอบตรวจทุก 60 - 90 วัน</span>
              </div>

              {machinePMSchedules.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: '#64748b', fontSize: 13, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                  ยังไม่มีกำหนดการ PM ที่รอดำเนินการสำหรับเครื่องนี้
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {machinePMSchedules.map(pm => {
                    const days = getDaysUntil(pm.due_date);
                    return (
                      <div
                        key={pm.id}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: `1px solid ${days < 0 ? '#fecaca' : '#e2e8f0'}`,
                          borderRadius: 10,
                          padding: 16
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                            {pm.title}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor: days < 0 ? '#fee2e2' : '#fef3c7',
                            color: days < 0 ? '#b91c1c' : '#b45309'
                          }}>
                            {days < 0 ? `เกินกำหนดแล้ว (${Math.abs(days)} วัน)` : `ครบกำหนดใน ${days} วัน`}
                          </span>
                        </div>

                        {/* Checklist items */}
                        <div style={{ marginTop: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                            รายการเช็คลิสต์ที่ต้องปฏิบัติ (PM Checklist):
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {pm.checklist.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                                <CheckCircle2 size={16} color="#10b981" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Repair & Service History Logs */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <History size={20} color="#0284c7" />
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    ประวัติการซ่อมบำรุงและผลตรวจวัดย้อนหลัง (Service History & Audit Trail)
                  </h4>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  ประวัติ {machineReports.length + machineTickets.length} รายการ
                </span>
              </div>

              {machineReports.length === 0 && machineTickets.length === 0 ? (
                <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: 20 }}>
                  ยังไม่มีประวัติการซ่อมสำหรับเครื่องจักรนี้
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {machineReports.map(rep => (
                    <div
                      key={rep.id}
                      onClick={() => onSelectReport(rep)}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#0284c7' }}>
                            {rep.report_number}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                            {rep.service_type === 'corrective' ? 'งานซ่อมแซมแก้ไข (Corrective)' : 'บำรุงรักษาเชิงป้องกัน (PM)'}
                          </span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>
                          {new Date(rep.service_date).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
                        {rep.summary_findings}
                      </p>
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                        <span>👨‍🔧 โดย: {rep.technician_name}</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>✓ ลูกค้าเซ็นรับเรียบร้อย</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
