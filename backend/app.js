import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicVisitRoutes from './routes/clinicVisitRoutes.js';

// FHIR R4 Routes
import fhirPatientRoutes from './routes/fhir/fhirPatientRoutes.js';
import fhirPractitionerRoutes from './routes/fhir/fhirPractitionerRoutes.js';
import fhirAppointmentRoutes from './routes/fhir/fhirAppointmentRoutes.js';
import fhirEncounterRoutes from './routes/fhir/fhirEncounterRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
// Support both application/json and application/fhir+json content types
app.use(express.json({ type: ['application/json', 'application/fhir+json'] }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinic-visits', clinicVisitRoutes);

// FHIR R4 Routes
app.use('/fhir/Patient', fhirPatientRoutes);
app.use('/fhir/Practitioner', fhirPractitionerRoutes);
app.use('/fhir/Appointment', fhirAppointmentRoutes);
app.use('/fhir/Encounter', fhirEncounterRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Patient Management API with FHIR R4 Support is running',
    endpoints: {
      legacy: {
        auth: '/api/auth',
        admin: '/api/admin',
        patients: '/api/patients',
        appointments: '/api/appointments',
        clinicVisits: '/api/clinic-visits'
      },
      fhir: {
        patient: '/fhir/Patient',
        practitioner: '/fhir/Practitioner',
        appointment: '/fhir/Appointment',
        encounter: '/fhir/Encounter'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

export default app;

