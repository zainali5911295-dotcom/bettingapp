import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// ==================== DASHBOARD ====================
router.get("/stats", requireAuth, adminController.getStats);

// ==================== USERS ====================
router.get("/users", requireAuth, adminController.listUsers);
router.put("/users/:id/balance", requireAuth, adminController.updateUserBalance);
router.put("/users/:id/ban", requireAuth, adminController.toggleUserBan);

// ==================== WITHDRAWALS ====================
router.get("/withdrawals", requireAuth, adminController.listWithdrawals);
router.post("/withdrawals/:id/approve", requireAuth, adminController.approveWithdrawal);
router.post("/withdrawals/:id/reject", requireAuth, adminController.rejectWithdrawal);

// ==================== TRANSACTIONS ====================
router.get("/transactions", requireAuth, adminController.listTransactions);

// ==================== GAMES ====================
router.post("/games/color/force", requireAuth, adminController.forceColorOutcome);
router.post("/games/aviator/force", requireAuth, adminController.forceAviatorCrash);

export default router;