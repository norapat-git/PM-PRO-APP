# PM-PRO: Enterprise Preventive Maintenance & Field Service Management System

ระบบบริหารจัดการงานแจ้งซ่อม บริการช่างหน้างาน ประวัติเครื่องจักร และติดตามใบเสนอราคาอะไหล่

---

## 🏗️ โครงสร้างระบบ (Architecture)

1. **แอปแจ้งซ่อมและขอบริการ (Service Request & Repair Tracking)**
   - เลือกรหัสและชื่อเครื่องจักรจากฐานข้อมูลโรงงาน
   - แนบรูปถ่าย/วิดีโออาการเสียหน้างาน
   - กำหนดระดับความเร่งด่วน (Urgency: ทั่วไป, ปานกลาง, ด่วน, ด่วนวิกฤต)
   - ติดตามสถานะงานแบบ Step-by-Step Live Tracking Pipeline

2. **แอปรายงานงานบริการสำหรับช่าง (Technician Field Service Report)**
   - บันทึกผลการตรวจพบและการดำเนินงานแก้ไข
   - เปรียบเทียบรูปภาพ ก่อน–หลัง (Before & After Comparison)
   - บันทึกผลการตรวจวัดและ Calibration (แรงดัน Bar, อุณหภูมิ, ความสั่นสะเทือน, กระแสไฟฟ้า)
   - บันทึกรายการอะไหล่ที่ใช้จริงพร้อมคำนวณราคา
   - แคนวาสเซ็นชื่อดิจิทัล (Digital Signature Pad) ให้ลูกค้าเซ็นรับงานบนหน้าจอ
   - สร้างและพิมพ์ใบรายงานการบริการฉบับสมบูรณ์ (Printable Service Report)

3. **ระบบประวัติเครื่องจักรและบำรุงรักษา (Machinery Registry & CMMS)**
   - ทะเบียนเครื่องจักรแยกตามโรงงานและแผนก
   - สเปกทางเทคนิค, Serial No., และ QR Code
   - แผนการบำรุงรักษาเชิงป้องกัน (Preventive Maintenance - PM)
   - ประวัติการซ่อมบำรุงย้อนหลัง (Audit Trail)

4. **ระบบติดตามใบเสนอราคาและอะไหล่ (Quotation & Spare Parts Tracking)**
   - แคตตาล็อกอะไหล่พร้อมเช็คสต็อกและเตือนสต็อกต่ำ
   - ยื่นคำขอใบเสนอราคา (RFQ)
   - ติดตาม Pipeline สถานะ 6 ขั้นตอน: รับคำขอ ➔ จัดทำราคา ➔ ส่งให้ลูกค้า ➔ อนุมัติสั่งซื้อ (PO) ➔ เตรียมอะไหล่ ➔ ส่งมอบเสร็จสิ้น

---

## 🚀 การติดตั้งและรันระบบ (Getting Started)

### 1. Backend (Node.js + Supabase API)
```bash
cd PM-BACKEND
npm install
npm run dev
# รันที่ http://localhost:5000
```

### 2. Frontend (Vite + React 19 + TypeScript)
```bash
cd PM-PRO-FRONT
npm install
npm run dev
# รันที่ http://localhost:5174
```

### 3. Database Schema (Supabase PostgreSQL)
รันไฟล์ `PM-BACKEND/supabase_schema.sql` ใน Supabase SQL Editor เพื่อสร้างตารางและ Seed Data
