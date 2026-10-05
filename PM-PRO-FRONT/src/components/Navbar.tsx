import React from 'react';
import type { UserRole } from '../types';
import { 
  Wrench, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  HardHat, 
  PlusCircle,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  onOpenNewTicket: () => void;
  pendingTicketsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  onOpenNewTicket,
  pendingTicketsCount
}) => {
  return (
    <header style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      borderBottom: '1px solid #1e293b',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      {/* Top Bar */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(2, 132, 199, 0.4)'
          }}>
            <Wrench size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: '#ffffff' }}>
                PM-PRO
              </span>
              <span style={{
                fontSize: 10,
                padding: '2px 7px',
                borderRadius: 4,
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                letterSpacing: 0.5
              }}>
                ENTERPRISE
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              ระบบแจ้งซ่อม บริการช่างหน้างาน และบำรุงรักษาเครื่องจักร (CMMS)
            </p>
          </div>
        </div>

        {/* Right Section: Role Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Supabase status badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#1e293b',
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid #334155',
            fontSize: 12,
            color: '#38bdf8'
          }}>
            <Database size={13} color="#38bdf8" />
            <span>Supabase Ready</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          </div>

          {/* Role selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            borderRadius: 10,
            padding: 3,
            border: '1px solid #334155'
          }}>
            <button
              onClick={() => setUserRole('customer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                color: userRole === 'customer' ? '#ffffff' : '#94a3b8',
                backgroundColor: userRole === 'customer' ? '#0284c7' : 'transparent'
              }}
            >
              <Building2 size={14} />
              ลูกค้าโรงงาน
            </button>
            <button
              onClick={() => setUserRole('technician')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                color: userRole === 'technician' ? '#ffffff' : '#94a3b8',
                backgroundColor: userRole === 'technician' ? '#0284c7' : 'transparent'
              }}
            >
              <HardHat size={14} />
              ช่างหน้างาน
            </button>
            <button
              onClick={() => setUserRole('manager')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                color: userRole === 'manager' ? '#ffffff' : '#94a3b8',
                backgroundColor: userRole === 'manager' ? '#0284c7' : 'transparent'
              }}
            >
              <UserCheck size={14} />
              วิศวกร / หัวหน้า
            </button>
          </div>

          {/* New Ticket CTA */}
          <button
            onClick={onOpenNewTicket}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
            }}
          >
            <PlusCircle size={16} />
            แจ้งซ่อม / ขอบริการ
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setCurrentTab('tickets')}
          style={{
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: currentTab === 'tickets' ? '#38bdf8' : '#cbd5e1',
            borderBottom: currentTab === 'tickets' ? '3px solid #38bdf8' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <Wrench size={16} />
          1. แจ้งซ่อมและติดตามงาน
          {pendingTicketsCount > 0 && (
            <span style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: 11,
              padding: '1px 6px',
              borderRadius: 10,
              fontWeight: 700
            }}>
              {pendingTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentTab('reports')}
          style={{
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: currentTab === 'reports' ? '#38bdf8' : '#cbd5e1',
            borderBottom: currentTab === 'reports' ? '3px solid #38bdf8' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={16} />
          2. รายงานช่าง & เซ็นรับงาน
        </button>

        <button
          onClick={() => setCurrentTab('machines')}
          style={{
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: currentTab === 'machines' ? '#38bdf8' : '#cbd5e1',
            borderBottom: currentTab === 'machines' ? '3px solid #38bdf8' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <Building2 size={16} />
          3. ประวัติเครื่องจักร & บำรุงรักษา (PM)
        </button>

        <button
          onClick={() => setCurrentTab('quotations')}
          style={{
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: currentTab === 'quotations' ? '#38bdf8' : '#cbd5e1',
            borderBottom: currentTab === 'quotations' ? '3px solid #38bdf8' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={16} />
          4. ใบเสนอราคา & อะไหล่
        </button>
      </div>
    </header>
  );
};
