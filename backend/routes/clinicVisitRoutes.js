import express from 'express';
import { startClinicVisit } from '../controllers/clinicVisitController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All clinic visit routes require authentication
router.use(authMiddleware);

// POST /api/clinic-visits/start - Start clinic visit (Doctor only)
router.post('/start', roleMiddleware('doctor'), startClinicVisit);

export default router;

