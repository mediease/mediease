import express from 'express';
import { startClinicVisitByPhn, startClinicVisitByApid } from '../controllers/clinicVisitController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All clinic visit routes require authentication
router.use(authMiddleware);

// POST /api/clinic-visits/start/:phn - Start clinic visit for a PHN (no appointment)
router.post('/start/:phn', roleMiddleware('doctor'), startClinicVisitByPhn);

// POST /api/clinic-visits/start-appointment/:apid - Start clinic visit using an appointment APID
router.post('/start-appointment/:apid', roleMiddleware('doctor'), startClinicVisitByApid);

export default router;

