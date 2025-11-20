import express from 'express';
import path from 'path';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import fhirPatientRoutes from './routes/fhirPatient.routes.js';
import fhirPractitionerRoutes from './routes/fhirPractitioner.routes.js';
import fhirAppointmentRoutes from './routes/fhirAppointment.routes.js';
import fhirEncounterRoutes from './routes/fhirEncounter.routes.js';
import fhirMedicationRoutes from './routes/fhirMedication.routes.js';
import fhirPrescriptionRoutes from './routes/fhirPrescription.routes.js';
import labRoutes from './routes/lab.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/fhir', fhirPatientRoutes);
app.use('/fhir', fhirPractitionerRoutes);
app.use('/fhir', fhirAppointmentRoutes);
app.use('/fhir', fhirEncounterRoutes);
app.use('/fhir', fhirMedicationRoutes);
app.use('/fhir', fhirPrescriptionRoutes);
app.use('/api/lab', labRoutes);
app.use('/admin', fhirAppointmentRoutes); // admin appointment routes
app.use('/admin', authRoutes); // admin approval routes
app.use('/clinic', fhirEncounterRoutes); // clinic encounter routes
app.use('/doctor', fhirAppointmentRoutes); // doctor appointment routes

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'FHIR EMR Server is running', timestamp: new Date() });
});

// Static serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
