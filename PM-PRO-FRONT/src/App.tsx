import React, { useState, useEffect } from 'react';
import type { 
  RepairTicket, 
  ServiceReport, 
  Machine, 
  Factory, 
  PMSchedule, 
  SparePart, 
  Quotation, 
  UserRole,
  TicketStatus,
  QuotationStatus
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { TicketsView } from './components/TicketsView';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { TechnicianReportModal } from './components/TechnicianReportModal';
import { MachinesView } from './components/MachinesView';
import { QuotationsView } from './components/QuotationsView';
import { ServiceReportsListView } from './components/ServiceReportsListView';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('tickets');
  const [userRole, setUserRole] = useState<UserRole>('customer');

  // Application Data States
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [pmSchedules, setPMSchedules] = useState<PMSchedule[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTicketForReport, setActiveTicketForReport] = useState<RepairTicket | null>(null);
  const [activeReportToView, setActiveReportToView] = useState<ServiceReport | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [
          fetchedTickets,
          fetchedReports,
          fetchedMachines,
          fetchedFactories,
          fetchedPM,
          fetchedParts,
          fetchedQuotes
        ] = await Promise.all([
          api.getTickets(),
          api.getReports(),
          api.getMachines(),
          api.getFactories(),
          api.getPMSchedules(),
          api.getSpareParts(),
          api.getQuotations()
        ]);

        setTickets(fetchedTickets);
        setReports(fetchedReports);
        setMachines(fetchedMachines);
        setFactories(fetchedFactories);
        setPMSchedules(fetchedPM);
        setSpareParts(fetchedParts);
        setQuotations(fetchedQuotes);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handlers for Tickets
  const handleCreateTicket = async (data: Omit<RepairTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at' | 'status'>) => {
    const created = await api.createTicket(data);
    setTickets([created, ...tickets]);
    showToast(`✓ เปิดใบแจ้งซ่อม ${created.ticket_number} เรียบร้อยแล้ว`);
  };

  const handleUpdateTicketStatus = async (id: string, status: TicketStatus, tech?: string) => {
    const updated = await api.updateTicketStatus(id, status, tech);
    if (updated) {
      setTickets(tickets.map(t => t.id === id ? updated : t));
      showToast('✓ อัปเดตสถานะใบแจ้งซ่อมเรียบร้อย');
    }
  };

  // Handlers for Service Reports
  const handleOpenReportModal = (ticket: RepairTicket) => {
    setActiveTicketForReport(ticket);
    const existing = reports.find(r => r.ticket_id === ticket.id);
    setActiveReportToView(existing || null);
    setIsReportModalOpen(true);
  };

  const handleOpenReportDetails = (report: ServiceReport) => {
    const matchTicket = tickets.find(t => t.id === report.ticket_id) || null;
    setActiveTicketForReport(matchTicket);
    setActiveReportToView(report);
    setIsReportModalOpen(true);
  };

  const handleSubmitServiceReport = async (reportData: Omit<ServiceReport, 'id' | 'report_number' | 'created_at'>) => {
    const created = await api.createReport(reportData);
    setReports([created, ...reports]);
    if (created.ticket_id) {
      setTickets(tickets.map(t => t.id === created.ticket_id ? { ...t, status: 'completed' } : t));
    }
    showToast(`✓ บันทึกรายงาน ${created.report_number} และลงนามลูกค้าสำเร็จ`);
  };

  // Handlers for Quotations
  const handleCreateQuotation = async (quoteData: Omit<Quotation, 'id' | 'quotation_number' | 'created_at' | 'updated_at'>) => {
    const created = await api.createQuotation(quoteData);
    setQuotations([created, ...quotations]);
    showToast(`✓ ยื่นคำขอใบเสนอราคา ${created.quotation_number} สำเร็จ`);
  };

  const handleUpdateQuotationStatus = async (id: string, status: QuotationStatus) => {
    const updated = await api.updateQuotationStatus(id, status);
    if (updated) {
      setQuotations(quotations.map(q => q.id === id ? updated : q));
      showToast('✓ อัปเดตสถานะใบเสนอราคาเรียบร้อย');
    }
  };

  const pendingTicketsCount = tickets.filter(t => t.status === 'submitted' || t.status === 'assigned').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 10,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          fontWeight: 600,
          border: '1px solid #334155',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenNewTicket={() => setIsTicketModalOpen(true)}
        pendingTicketsCount={pendingTicketsCount}
      />

      {/* Active Tab Main Content */}
      <main style={{ flex: 1, paddingBottom: 48 }}>
        {currentTab === 'tickets' && (
          <TicketsView
            tickets={tickets}
            userRole={userRole}
            onOpenReportModal={handleOpenReportModal}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onOpenNewTicket={() => setIsTicketModalOpen(true)}
          />
        )}

        {currentTab === 'reports' && (
          <ServiceReportsListView
            reports={reports}
            userRole={userRole}
            onOpenReportDetails={handleOpenReportDetails}
          />
        )}

        {currentTab === 'machines' && (
          <MachinesView
            machines={machines}
            factories={factories}
            pmSchedules={pmSchedules}
            reports={reports}
            tickets={tickets}
            onSelectMachineForTicket={(m) => {
              setIsTicketModalOpen(true);
            }}
            onSelectReport={handleOpenReportDetails}
          />
        )}

        {currentTab === 'quotations' && (
          <QuotationsView
            quotations={quotations}
            spareParts={spareParts}
            userRole={userRole}
            onCreateQuotation={handleCreateQuotation}
            onUpdateQuotationStatus={handleUpdateQuotationStatus}
          />
        )}
      </main>

      {/* Modals */}
      <ServiceRequestModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        machines={machines}
        onSubmitTicket={handleCreateTicket}
      />

      <TechnicianReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        ticket={activeTicketForReport}
        existingReport={activeReportToView}
        sparePartsCatalog={spareParts}
        onSubmitReport={handleSubmitServiceReport}
      />
    </div>
  );
}

export default App;
