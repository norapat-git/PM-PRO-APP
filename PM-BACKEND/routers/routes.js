var express = require('express'); 

const router = express.Router()

// Controllers
const auth_sign = require('../controllers/auth/auth_sign');
const auth_login = require('../controllers/auth/microsoft/login');
const AccountController = require('../controllers/timetableController/AccountController');

// Public Authentication
router.post('/login', auth_login.getMicrosoftLogin);
router.post('/login/preset', auth_login.getPresetLogin);
router.post('/logout', auth_login.logout);

// JWT Authentication Guard (Protected Routes)
// ทุก Request ที่อยู่หลังจากนี้จะต้องแนบ Authorization: Bearer <token>
router.use(auth_sign.verifyToken);

// Account Management (RG_SCHEDULE_ACCOUNT)
router.get('/account/list', AccountController.listAccounts);
router.post('/account/add', AccountController.addAccount);
router.put('/account/update', AccountController.updateAccount);
router.delete('/account/delete/:email', AccountController.deleteAccount);

// Test endpoints (Legacy)
let test, InsertDataController, DeleteDataController, SelectDataController;
try {
  test = require('../controllers/test');
  InsertDataController = require('../controllers/InsertModel');
  DeleteDataController = require('../controllers/DeleteModel');
  SelectDataController = require('../controllers/SelectModel');
} catch (e) {
  // Ignore missing legacy controllers
}

if (test) {
  router.get('/select', test.TestGetSelectdb);
  router.put('/send', test.TestrevData);
}
if (InsertDataController) {
  router.get('/testinsert/:x', InsertDataController.testinsert);
  router.post('/insertdb', InsertDataController.insertdb);
}
if (DeleteDataController) {
  router.delete('/deletedb', DeleteDataController.deletedb);
}
if (SelectDataController) {
  router.get('/testpool', SelectDataController.getSelectdb);
}

module.exports = router;
