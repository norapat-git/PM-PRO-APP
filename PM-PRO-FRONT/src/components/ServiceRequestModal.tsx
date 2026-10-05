import React, { useState } from 'react';
import type { Machine, UrgencyLevel, RepairTicket } from '../types';
import { X, Upload, AlertTriangle, Clock, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  machines: Machine[];
  onSubmitTicket: (ticket: Omit<RepairTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status'>) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  machines,
  onSubmitTicket
}) => {
  const [machineId, setMachineId] = useState('');
  const [customerName, setCustomerName] = useState('สมศักดิ์ ผู้จัดการฝ่ายผลิต');
  const [contactPhone, setContactPhone] = useState('081-888-2233');
  const [contactEmail, setContactEmail] = useState('somsak@bangna-parts.com');
  const [issueType, setIssueType] = useState('ระบบไฮดรอลิกและแรงดัน');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [preferredTime, setPreferredTime] = useState('วันนี้ ช่วงเวลา 13:00 - 16:00 น.');
  const [description, setDescription] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
  ]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !contactPhone || !description) {
      alert('กรุณากรอกชื่อผู้แจ้ง เบอร์ติดต่อ และรายละเอียดอาการเสีย');
      return;
    }

    setSubmitting(true);
    const selectedMachine = machines.find(m => m.id === machineId);

    setTimeout(() => {
      onSubmitTicket({
        machine_id: machineId || null,
        machine_name: selectedMachine ? selectedMachine.name : 'เครื่องจักรทั่วไป / ไม่ได้ระบุ',
        machine_serial: selectedMachine ? selectedMachine.serial_number : undefined,
        factory_id: selectedMachine ? selectedMachine.factory_id : null,
        factory_name: selectedMachine ? selectedMachine.factory_name : undefined,
        customer_name: customerName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        issue_type: issueType,
        urgency: urgency,
        preferred_time: preferredTime,
        description: description,
        media_urls: mediaUrls,
        assigned_technician: null
      });
      setSubmitting(false);
      onClose();
    }, 400);
  };

  const addSamplePhoto = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls([...mediaUrls, url]);
    }
  };

  const removePhoto = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const urgencyOptions: { value: UrgencyLevel; label: string; desc: string; color: string }[] = [
    { value: 'low', label: 'ทั่วไป (Low)', desc: 'ไม่กระทบไลน์ผลิต ซ่อมได้ใน 3-5 วัน', color: '#64748b' },
    { value: 'medium', label: 'ปานกลาง (Medium)', desc: 'เครื่องทำงานได้แต่มีสัญญาณเตือน ใน 48 ชม.', color: '#0284c7' },
    { value: 'high', label: 'ด่วน (High)', desc: 'กระทบผลผลิต ต้องเข้าตรวจใน 4-8 ชม.', color: '#d97706' },
    { value: 'critical', label: 'ด่วนวิกฤต (Critical)', desc: 'เครื่องหยุดฉุกเฉิน / ไลน์ผลิตหยุดทันที', color: '#dc2626' }
  ];

  return (
    <div className="modal-backdrop">
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxWidth: 720,
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              แบบฟอร์มแจ้งซ่อมและขอบริการด่วน (Service Request)
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              ระบุปัญหา แนบรูปถ่ายหน้างาน และกำหนดเวลาที่สะดวกเพื่อให้ทีมช่างเข้าบริการ
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
              color: '#64748b',
              backgroundColor: '#f1f5f9'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Machine Selection */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              เลือกเครื่องจักรที่พบปัญหา <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
              required
            >
              <option value="">-- กรุณาเลือกเครื่องจักรในโรงงาน --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.serial_number}) - {m.factory_name} [{m.brand} {m.model}]
                </option>
              ))}
            </select>
          </div>

          {/* Issue Type & Preferred Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                ประเภทปัญหา / ระบบที่ขัดข้อง
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="ระบบไฮดรอลิกและแรงดัน">ระบบไฮดรอลิกและแรงดัน (Hydraulic & Pressure)</option>
                <option value="ระบบไฟฟ้าและคอนโทรลเลอร์">ระบบไฟฟ้าและคอนโทรลเลอร์ (Electrical & PLC/CNC)</option>
                <option value="ระบบกลไกและการสึกหรอ">ระบบกลไก แกนส่งกำลัง และตลับลูกปืน (Mechanical)</option>
                <option value="ระบบนิวแมติกและลมจ่าย">ระบบนิวแมติกและหัวขับลม (Pneumatic)</option>
                <option value="การรั่วซึมและความร้อนสะสม">การรั่วซึม สารหล่อเย็น และความร้อนสะสม (Thermal)</option>
                <option value="อื่นๆ / ขอตรวจเช็คประจำงวด">อื่นๆ / ขอตรวจเช็คประจำงวด (Inspection)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                วัน-เวลาที่สะดวกให้ช่างเข้าปฏิบัติงาน
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="เช่น วันนี้ก่อน 15:00 น. หรือ เสาร์-อาทิตย์"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 14
                  }}
                />
                <Clock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
              </div>
            </div>
          </div>

          {/* Urgency Selector */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              ระดับความเร่งด่วน (Urgency Level)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {urgencyOptions.map(opt => {
                const isSelected = urgency === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setUrgency(opt.value)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? opt.color : '#e2e8f0'}`,
                      backgroundColor: isSelected ? `${opt.color}10` : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: opt.color }}>
                      {isSelected && <CheckCircle2 size={15} />}
                      {opt.label}
                    </div>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.3 }}>
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              รายละเอียดอาการเสีย / เสียงผิดปกติ / โค้ด Error <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุอาการผิดปกติ เช่น รอบหมุนสะดุด, อุณหภูมิขึ้นสูงเกิน 70 องศา, รหัส Error บนหน้าจอ เพื่อให้ช่างจัดเตรียมเครื่องมือได้ตรงจุด"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                resize: 'vertical'
              }}
              required
            />
          </div>

          {/* Photo & Video Attachment */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              แนบรูปถ่ายหน้างานหรือวิดีโออาการเสีย ({mediaUrls.length} รูป)
            </label>
            
            {/* Thumbnails */}
            {mediaUrls.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                {mediaUrls.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: 90, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <img src={url} alt={`attachment-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Upload Action Box */}
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 10,
              padding: '16px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}>
              <Upload size={24} color="#0284c7" />
              <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                ลากรูปมาวาง หรือคลิกเพิ่มรูปภาพตัวอย่างหน้างานเพื่อความรวดเร็ว
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => addSamplePhoto('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80')}
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
                  <ImageIcon size={13} /> +รูปคราบน้ำมัน/หัวปั๊ม
                </button>
                <button
                  type="button"
                  onClick={() => addSamplePhoto('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80')}
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
                  <ImageIcon size={13} /> +รูปแผงวงจร/คอนโทรล
                </button>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                ชื่อผู้ประสานงานหน้างาน <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
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
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                เบอร์โทรศัพท์ติดต่อด่วน <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
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
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                อีเมลรับแจ้งสถานะ
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 14
                }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 10,
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
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                backgroundColor: submitting ? '#94a3b8' : '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอแจ้งซ่อมทันที'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
