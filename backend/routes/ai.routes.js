import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, checkApprovalStatus } from '../middleware/roleMiddleware.js';
import {
  getPatientSummary
} from '../controllers/ai.controller.js';

const router = express.Router();

router.get(
  '/summary/:phn',
  protect,
  checkApprovalStatus,
  authorize('doctor', 'nurse', 'admin'),
  getPatientSummary
);

export default router;
