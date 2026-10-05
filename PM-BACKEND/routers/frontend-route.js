const express = require("express");
const router = express.Router();

const auth_sign = require("../controllers/auth/auth_sign");
const auth_login = require("../controllers/auth/microsoft/login");
const AccountController = require("../controllers/timetableController/AccountController");


// Public Authentication
router.post("/login", auth_login.getMicrosoftLogin);
router.post("/login/preset", auth_login.getPresetLogin);
router.post("/logout", auth_login.logout);

// JWT Authentication Guard (Protected Routes)
router.use(auth_sign.verifyToken);

// User Account (จัดการผู้ใช้งาน)
router.get("/account/list", AccountController.listAccounts);
router.post("/account/add", AccountController.addAccount);
router.put("/account/update", AccountController.updateAccount);
router.delete("/account/delete/:email", AccountController.deleteAccount);


module.exports = router;
