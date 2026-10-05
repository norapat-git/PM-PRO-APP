import React, { useState, useRef, useEffect } from 'react';
import type { RepairTicket, ServiceReport, SparePartUsed, SparePart } from '../types';
import { 
  X, 
  Check, 
  Trash2, 
  Plus, 
  Camera, 
  PenTool, 
  Printer, 
  CheckCircle2, 
  FileCheck2,
  Gauge,
  Layers
} from 'lucide-react';

interface TechnicianReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: RepairTicket | null;
  existingReport?: ServiceReport | null;
  sparePartsCatalog: SparePart[];
  onSubmitReport: (report: Omit<ServiceReport, 'id' | 'report_number' | 'created_at'>) => void;
}

export const TechnicianReportModal: React.FC<TechnicianReportModalProps> = ({
  isOpen,
  onClose,
  ticket,
  existingReport,
  sparePartsCatalog,
  onSubmitReport
}) => {
  const [technicianName, setTechnicianName] = useState('ช่างกิตติศักดิ์ ชำนาญการ (รหัสพนักงาน TK-8821)');
  const [serviceType, setServiceType] = useState<'corrective' | 'preventive' | 'inspection'>('corrective');
  const [summaryFindings, setSummaryFindings] = useState(
    existingReport?.summary_findings ||
    'ตรวจพบชุดโอริงและซีลเพลาขับสึกหรอ มีคราบน้ำมันไฮดรอลิกซึมบริเวณข้อต่อและแรงดันระบบตก'
  );
  const [actionTaken, setActionTaken] = useState(
    existingReport?.action_taken ||
    'ถอดเปลี่ยนชุดซีลใหม่ ทำความสะอาดหน้าแปลน เติมน้ำมันไฮดรอลิก และทดสอบรันเครื่อง 30 นาที'
  );

  // Photos
  const [beforePhotos, setBeforePhotos] = useState<string[]>(
    existingReport?.before_photos || [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ]
  );
  const [afterPhotos, setAfterPhotos] = useState<string[]>(
    existingReport?.after_photos || [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ]
  );

  // Measurements
  const [measurements, setMeasurements] = useState<{ key: string; value: string; standard: string; status: 'ok' | 'warn' | 'crit' }[]>([
    { key: 'แรงดันระบบขณะทำงาน (Pressure)', value: '248 Bar', standard: '240 - 255 Bar', status: 'ok' },
    { key: 'อุณหภูมิน้ำมันไฮดรอลิก (Oil Temp)', value: '54.5 °C', standard: '< 65 °C', status: 'ok' },
    { key: 'ระดับการสั่นสะเทือนมอเตอร์ (Vibration)', value: '1.8 mm/s', standard: '< 2.5 mm/s', status: 'ok' },
    { key: 'กระแสไฟฟ้ามอเตอร์ (Motor Current)', value: '28.2 A', standard: 'พิกัด 32 A', status: 'ok' },
    { key: 'ความตึงสายพาน / Alignment', value: '0.03 mm', standard: '±0.05 mm', status: 'ok' }
  ]);

  // Spare Parts Used
  const [partsUsed, setPartsUsed] = useState<SparePartUsed[]>(
    existingReport?.parts_used || [
      {
        part_number: 'SP-SEAL-REX-01',
        name: 'ชุดโอริงและซีลกันรั่วไฮดรอลิก Rexroth 60mm',
        quantity: 1,
        unit_price: 3200,
        total: 3200
      },
      {
        part_number: 'SP-OIL-VG46-20L',
        name: 'น้ำมันไฮดรอลิก Shell Tellus S2 MX46 (20L)',
        quantity: 1,
        unit_price: 2400,
        total: 2400
      }
    ]
  );

  // Customer Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(existingReport?.customer_signature || null);
  const [customerSignedBy, setCustomerSignedBy] = useState(existingReport?.customer_signed_by || 'คุณสมศักดิ์ ผู้จัดการฝ่ายผลิต');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    if (existingReport) {
      setSummaryFindings(existingReport.summary_findings);
      setActionTaken(existingReport.action_taken);
      setBeforePhotos(existingReport.before_photos);
      setAfterPhotos(existingReport.after_photos);
      setPartsUsed(existingReport.parts_used);
      setSignatureData(existingReport.customer_signature || null);
      setCustomerSignedBy(existingReport.customer_signed_by || '');
    }
  }, [existingReport]);

  if (!isOpen) return null;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Add spare part from catalog
  const handleAddPart = (part: SparePart) => {
    const existingIndex = partsUsed.findIndex(p => p.part_number === part.part_number);
    if (existingIndex !== -1) {
      const copy = [...partsUsed];
      copy[existingIndex].quantity += 1;
      copy[existingIndex].total = copy[existingIndex].quantity * copy[existingIndex].unit_price;
      setPartsUsed(copy);
    } else {
      setPartsUsed([
        ...partsUsed,
        {
          part_number: part.part_number,
          name: part.name,
          quantity: 1,
          unit_price: part.unit_price,
          total: part.unit_price
        }
      ]);
    }
  };

  const handleRemovePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const handleUpdatePartQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    const copy = [...partsUsed];
    copy[index].quantity = qty;
    copy[index].total = qty * copy[index].unit_price;
    setPartsUsed(copy);
  };

  const totalPartsCost = partsUsed.reduce((sum, p) => sum + p.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureData) {
      alert('กรุณาให้ลูกค้าหรือตัวแทนโรงงานลงลายเซ็นดิจิทัลเพื่อรับงาน');
      return;
    }

    const measurementsRecord: Record<string, string> = {};
    measurements.forEach(m => {
      measurementsRecord[m.key] = `${m.value} (เกณฑ์: ${m.standard})`;
    });

    onSubmitReport({
      ticket_id: ticket?.id || null,
      ticket_number: ticket?.ticket_number,
      machine_id: ticket?.machine_id || null,
      machine_name: ticket?.machine_name,
      technician_name: technicianName,
      service_date: new Date().toISOString().split('T')[0],
      service_type: serviceType,
      summary_findings: summaryFindings,
      action_taken: actionTaken,
      before_photos: beforePhotos,
      after_photos: afterPhotos,
      measurements: measurementsRecord,
      parts_used: partsUsed,
      customer_signature: signatureData,
      customer_signed_by: customerSignedBy,
      customer_signed_at: new Date().toISOString(),
      status: 'acknowledged'
    });

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxWidth: 960,
        width: '100%',
        maxHeight: '94vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileCheck2 size={22} color="#38bdf8" />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
                รายงานงานบริการสำหรับช่าง (Technician Field Service Report)
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
              ตั๋วงาน: {ticket?.ticket_number || 'TR-CUSTOM'} | เครื่องจักร: {ticket?.machine_name || 'ไม่ระบุ'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowPrintPreview(!showPrintPreview)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                border: '1px solid #334155'
              }}
            >
              <Printer size={14} />
              {showPrintPreview ? 'กลับไปหน้าบันทึก' : 'ดูตัวอย่างรายงานฉบับสมบูรณ์'}
            </button>
            <button
              onClick={onClose}
              style={{ padding: 6, borderRadius: 6, color: '#94a3b8', backgroundColor: '#1e293b' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINT / FORMAL REPORT PREVIEW MODE */}
        {showPrintPreview ? (
          <div style={{ padding: 32, backgroundColor: '#ffffff', color: '#0f172a' }}>
            <div style={{ border: '2px solid #0f172a', borderRadius: 8, padding: 24 }}>
              {/* Report Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    PM-PRO FIELD SERVICE REPORT
                  </h1>
                  <p style={{ fontSize: 13, color: '#475569' }}>
                    ใบรายงานการตรวจซ่อมและบำรุงรักษาเครื่องจักรอุตสาหกรรม
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    เลขที่: SR-2026-0088
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    วันที่เข้างาน: {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
                  </div>
                </div>
              </div>

              {/* Machinery & Factory Spec Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
                <tbody>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600, width: '20%' }}>เครื่องจักร:</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', width: '30%' }}>{ticket?.machine_name}</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600, width: '20%' }}>Serial No.:</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', width: '30%' }}>{ticket?.machine_serial || 'HYD-PUMP-500T-04'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}>โรงงาน / แผนก:</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{ticket?.factory_name || 'โรงงานบางนา อุตสาหกรรม'}</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}>ช่างผู้ตรวจซ่อม:</td>
                    <td style={{ padding: 8, border: '1px solid #cbd5e1' }}>{technicianName}</td>
                  </tr>
                </tbody>
              </table>

              {/* Findings & Action Taken */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>1. ผลการตรวจพบหน้างาน (Findings):</h4>
                <p style={{ fontSize: 13, color: '#334155', backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  {summaryFindings}
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>2. การดำเนินการแก้ไข (Action Taken):</h4>
                <p style={{ fontSize: 13, color: '#334155', backgroundColor: '#f8fafc', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  {actionTaken}
                </p>
              </div>

              {/* Before & After Photos Side-by-Side */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>3. รูปเปรียบเทียบ ก่อน–หลัง ดำเนินการ (Before & After Comparison):</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#b91c1c', display: 'block', marginBottom: 4 }}>• สภาพก่อนซ่อม (Before):</span>
                    <img src={beforePhotos[0]} alt="Before" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d', display: 'block', marginBottom: 4 }}>• สภาพหลังซ่อมและทดสอบ (After):</span>
                    <img src={afterPhotos[0]} alt="After" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
              </div>

              {/* Measurements Table */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>4. ผลการตรวจวัดพารามิเตอร์ (Calibration & Measurements):</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'left' }}>รายการตรวจวัด</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'left' }}>ค่าที่วัดได้จริง</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'left' }}>เกณฑ์มาตรฐาน</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'center' }}>ผลการประเมิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{m.key}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', fontWeight: 700, color: '#0284c7' }}>{m.value}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', color: '#64748b' }}>{m.standard}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'center', color: '#15803d', fontWeight: 600 }}>ผ่านเกณฑ์ปกติ ✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Spare parts used */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>5. อะไหล่และวัสดุสิ้นเปลืองที่ใช้ (Spare Parts Used):</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'left' }}>รหัสอะไหล่</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'left' }}>ชื่อรายการอะไหล่</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'center' }}>จำนวน</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'right' }}>ราคา/หน่วย (บาท)</th>
                      <th style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'right' }}>รวมเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partsUsed.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', fontFamily: 'var(--font-mono)' }}>{p.part_number}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1' }}>{p.name}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'center' }}>{p.quantity}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'right' }}>{p.unit_price.toLocaleString()}</td>
                        <td style={{ padding: 6, border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>{p.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                      <td colSpan={4} style={{ padding: 8, border: '1px solid #cbd5e1', textAlign: 'right' }}>รวมมูลค่าอะไหล่ทั้งสิ้น:</td>
                      <td style={{ padding: 8, border: '1px solid #cbd5e1', textAlign: 'right', color: '#0284c7' }}>{totalPartsCost.toLocaleString()} บาท</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderTop: '2px dashed #cbd5e1', paddingTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', color: '#334155' }}>
                    [ลายเซ็นอิเล็กทรอนิกส์ช่างบริการ]
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '80%', margin: '0 auto', paddingTop: 6, fontSize: 12 }}>
                    <div>({technicianName})</div>
                    <div style={{ color: '#64748b' }}>ช่างบริการผู้ตรวจซ่อม</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {signatureData ? (
                      <img src={signatureData} alt="Customer Signature" style={{ maxHeight: 55 }} />
                    ) : (
                      <span style={{ color: '#dc2626', fontSize: 12 }}>[รอลูกค้าลงลายเซ็น]</span>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', width: '80%', margin: '0 auto', paddingTop: 6, fontSize: 12 }}>
                    <div>({customerSignedBy || 'ตัวแทนฝ่ายลูกค้า'})</div>
                    <div style={{ color: '#64748b' }}>ผู้ตรวจรับงานและรับมอบเครื่องจักร</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Printer size={16} /> พิมพ์รายงาน / สั่งพิมพ์เป็น PDF
              </button>
              <button
                type="button"
                onClick={() => setShowPrintPreview(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                กลับไปแก้ไขฟอร์ม
              </button>
            </div>
          </div>
        ) : (
          /* FORM EDITING MODE */
          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Service Type and Technician Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  ประเภทการบริการหน้างาน
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14
                  }}
                >
                  <option value="corrective">ซ่อมแซมแก้ไขฉุกเฉิน (Corrective Repair)</option>
                  <option value="preventive">บำรุงรักษาเชิงป้องกันตามรอบ (Preventive PM)</option>
                  <option value="inspection">ตรวจเช็คสภาพและวัดค่า (Inspection & Calibration)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  ช่างบริการผู้รับผิดชอบงาน
                </label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14
                  }}
                  required
                />
              </div>
            </div>

            {/* Findings & Action Taken */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  ผลการตรวจพบหน้างาน (Findings) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={summaryFindings}
                  onChange={(e) => setSummaryFindings(e.target.value)}
                  placeholder="ระบุสาเหตุข้อขัดข้องที่ตรวจพบ เช่น ซีลฉีกขาด, ขดลวดมอเตอร์ไหม้, แบริ่งหลวม"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  การดำเนินงานแก้ไข (Action Taken) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="ระบุขั้นตอนการทำงาน เช่น ถอดประกอบเปลี่ยนอะไหล่, ปรับตั้งค่า, ล้างระบบ"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13 }}
                  required
                />
              </div>
            </div>

            {/* Before and After Photos Side-by-Side */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={18} color="#0284c7" />
                  รูปภาพเปรียบเทียบ ก่อน–หลัง (Before & After Photos)
                </label>
                <span style={{ fontSize: 12, color: '#64748b' }}>ใช้เป็นหลักฐานส่งมอบงานให้ลูกค้า</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Before Photo Box */}
                <div style={{ border: '1px solid #fecaca', backgroundColor: '#fff5f5', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>1. สภาพก่อนซ่อม (Before)</span>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: '#fee2e2', color: '#b91c1c' }}>ชำรุด</span>
                  </div>
                  {beforePhotos.length > 0 && (
                    <img
                      src={beforePhotos[0]}
                      alt="Before"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid #fca5a5' }}
                    />
                  )}
                </div>

                {/* After Photo Box */}
                <div style={{ border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>2. สภาพหลังซ่อมเสร็จ (After)</span>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, backgroundColor: '#dcfce7', color: '#15803d' }}>สมบูรณ์</span>
                  </div>
                  {afterPhotos.length > 0 && (
                    <img
                      src={afterPhotos[0]}
                      alt="After"
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid #86efac' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Inspection & Measurement Readings */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Gauge size={18} color="#0284c7" />
                  ผลการตรวจวัดและทดสอบระบบ (Measurements & Calibration)
                </label>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                backgroundColor: '#f8fafc',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #e2e8f0'
              }}>
                {measurements.map((m, idx) => (
                  <div key={idx} style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>{m.key}</span>
                    <input
                      type="text"
                      value={m.value}
                      onChange={(e) => {
                        const copy = [...measurements];
                        copy[idx].value = e.target.value;
                        setMeasurements(copy);
                      }}
                      style={{
                        width: '100%',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0284c7',
                        border: 'none',
                        outline: 'none',
                        borderBottom: '1px dashed #94a3b8'
                      }}
                    />
                    <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginTop: 4 }}>
                      เกณฑ์: {m.standard}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spare Parts Used */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={18} color="#0284c7" />
                  อะไหล่และอุปกรณ์ที่ใช้ (Spare Parts Used)
                </label>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0284c7' }}>
                  มูลค่าอะไหล่รวม: {totalPartsCost.toLocaleString()} บาท
                </div>
              </div>

              {/* Quick Select from Catalog Pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#64748b', alignSelf: 'center' }}>+ เลือกจากคลัง:</span>
                {sparePartsCatalog.map(part => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => handleAddPart(part)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Plus size={12} /> {part.name} ({part.unit_price.toLocaleString()} บ.)
                  </button>
                ))}
              </div>

              {/* Table of selected parts */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>รหัสอะไหล่</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>ชื่ออะไหล่</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 90 }}>จำนวน</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>ราคาต่อหน่วย</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>รวมเงิน</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {partsUsed.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{p.part_number}</td>
                        <td style={{ padding: '8px 12px' }}>{p.name}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) => handleUpdatePartQty(idx, parseInt(e.target.value) || 1)}
                            style={{
                              width: 55,
                              padding: '3px 6px',
                              borderRadius: 4,
                              border: '1px solid #cbd5e1',
                              textAlign: 'center'
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{p.unit_price.toLocaleString()} บ.</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>{p.total.toLocaleString()} บ.</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(idx)}
                            style={{ color: '#ef4444', padding: 4 }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Digital Signature Canvas */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #cbd5e1',
              borderRadius: 12,
              padding: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PenTool size={18} color="#0284c7" />
                  ลายเซ็นดิจิทัลสำหรับลูกค้าตรวจรับงาน (Customer Digital Signature) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  style={{
                    fontSize: 12,
                    color: '#ef4444',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  ล้างลายเซ็น (Clear)
                </button>
              </div>

              {/* Signature Canvas Box */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                position: 'relative',
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
                />
                {!signatureData && !isDrawing && (
                  <div style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    color: '#94a3b8',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <PenTool size={14} /> ใช้เมาส์หรือนิ้วสัมผัสเพื่อเซ็นรับมอบงานที่นี่
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    ชื่อและตำแหน่งผู้เซ็นตรวจรับ
                  </label>
                  <input
                    type="text"
                    value={customerSignedBy}
                    onChange={(e) => setCustomerSignedBy(e.target.value)}
                    placeholder="เช่น คุณสมศักดิ์ ผู้จัดการฝ่ายผลิต"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 13
                    }}
                    required
                  />
                </div>
                <div style={{ fontSize: 12, color: '#64748b', alignSelf: 'flex-end', paddingBottom: 6 }}>
                  ⏰ บันทึกประทับเวลา (Timestamp): {new Date().toLocaleString('th-TH')}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              paddingTop: 16,
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: 14
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  borderRadius: 8,
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <CheckCircle2 size={18} />
                บันทึกรายงาน & ส่งมอบงานเรียบร้อย
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
