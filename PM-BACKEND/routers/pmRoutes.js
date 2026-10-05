const express = require('express');
const router = express.Router();

const ticketController = require('../controllers/ticketController');
const serviceReportController = require('../controllers/serviceReportController');
const machineController = require('../controllers/machineController');
const quotationController = require('../controllers/quotationController');
const sparePartController = require('../controllers/sparePartController');

// 1. REPAIR & SERVICE TICKETS (แอปแจ้งซ่อมและขอบริการ)
router.get('/tickets', ticketController.getTickets);
router.get('/tickets/:id', ticketController.getTicketById);
router.post('/tickets', ticketController.createTicket);
router.put('/tickets/:id/status', ticketController.updateTicketStatus);

// 2. FIELD SERVICE REPORTS (แอปรายงานงานบริการสำหรับช่าง)
router.get('/reports', serviceReportController.getReports);
router.get('/reports/:id', serviceReportController.getReportById);
router.post('/reports', serviceReportController.createReport);

// 3. MACHINES & PREVENTIVE MAINTENANCE (ระบบประวัติเครื่องจักรและบำรุงรักษา)
router.get('/machines', machineController.getMachines);
router.get('/machines/:id', machineController.getMachineById);
router.get('/factories', machineController.getFactories);
router.get('/pm-schedules', machineController.getPMSchedules);

// 4. QUOTATIONS & SPARE PARTS (ระบบติดตามใบเสนอราคาและอะไหล่)
router.get('/spare-parts', sparePartController.getSpareParts);
router.post('/spare-parts', sparePartController.createSparePart);
router.get('/quotations', quotationController.getQuotations);
router.get('/quotations/:id', quotationController.getQuotationById);
router.post('/quotations', quotationController.createQuotation);
router.put('/quotations/:id/status', quotationController.updateQuotationStatus);

module.exports = router;
