# MediEase: FHIR-Compliant Hospital Management System

[![Production Ready](https://img.shields.io/badge/status-Production%20Ready-brightgreen)]()
[![License: Proprietary](https://img.shields.io/badge/license-Proprietary-blue)]()
[![Node.js](https://img.shields.io/badge/node-%3E=16.x-green.svg)]()
[![MongoDB](https://img.shields.io/badge/mongo-%3E=5.x-brightgreen)]()

---

## Overview

MediEase is a comprehensive Hospital Electronic Medical Records (EMR) system built with Node.js, Express, and MongoDB. It implements FHIR (Fast Healthcare Interoperability Resources) standards for healthcare data exchange and manages core clinical and hospital workflows: patient registration, scheduling, encounters, prescriptions, and advanced laboratory diagnostics with secure review workflows.

- **Version:** 1.0.0
- **Status:** Production Ready
- **Last Updated:** November 2025
- **Maintained by:** MediEase Development Team

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Overview](#api-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Version History](#version-history)
- [Roadmap](#roadmap)

---

## Features

- **Authentication & Authorization:** Role-based access (Admin, Doctor, Nurse, Lab Assistant) with JWT security and approval workflows for medical staff and assistants.
- **Patient Management:** FHIR-compliant patient resources, automatic PHN (Patient Health Number), complete demographics, and NIC-based patient search.
- **Clinical Workflows:** Full support for patient encounters, prescriptions (single/multi-item), FHIR MedicationRequest, medication lookup, vital sign and clinical notes.
- **Appointment System:** Scheduling, room assignment, and workflow linkage between doctor, patient, nurse, with status tracking.
- **Laboratory Management:** Lab request and reporting with file upload (PNG, JPG, PDF), FHIR DiagnosticReport/Observation generation, and multi-step review.
- **FHIR Compliance:** Supports Patient, Practitioner (Doctor/Nurse), Appointment, Encounter, MedicationRequest, DiagnosticReport, and Observation resources.
- **Audit & Security:** Robust error handling, validation and secure password storage, environment-controlled settings, file size/type validation, CORS support.
- **Performance:** Indexed queries on PHN, doctorLicense, encounter, and lab requests. Optimized JWT validation and file storage management.

---

## Tech Stack
- **Backend:** Node.js, Express, MongoDB
- **Database:** Mongoose (ODM), Indexed
- **Authentication:** JWT, bcrypt
- **APIs:** RESTful, FHIR standards
- **Testing:** Postman collection, Newman CLI
- **File Upload:** Multer (disk storage), 10MB file cap

---

## API Overview

### Base URL
```
http://localhost:5000
```

### Core Routes (RESTful Examples)

**Authentication**
- `POST   /auth/register` – Register (Doctor/Nurse/Lab Assistant)
- `POST   /auth/login` – Login
- `PUT    /auth/approve/:role/:id` – Admin approval
- `PUT    /auth/reject/:userId` – Admin reject
- `GET    /auth/pending-users` – List pending

**Patients**
- `POST   /fhir/Patient` – Create patient
- `GET    /fhir/Patient/:phn` – Get by PHN
- `GET    /fhir/Patient` – List all

**Practitioners**
- `GET    /fhir/Practitioner/:id` – Get doctor/nurse
- `GET    /fhir/Practitioner` – List all

**Appointments**
- `POST   /fhir/Appointment`
- `GET    /fhir/Appointment/:apid`
- `GET    /fhir/Appointment`
- `PUT    /fhir/Appointment/:apid`

**Encounters**
- `POST   /clinic/start/:phn` – Start walk-in
- `GET    /fhir/Encounter/:id`
- `PUT    /fhir/Encounter/:id`
- `GET    /fhir/Encounter`

**Prescriptions**
- `POST   /fhir/MedicationRequest`
- `GET    /fhir/MedicationRequest/:phn`
- `PUT    /fhir/MedicationRequest/:id`
- `DELETE /fhir/MedicationRequest/:id`

**Medications**
- `GET    /fhir/Medication/search` – Search

**Lab Management**
- `POST   /api/lab/request` – Doctor creates
- `GET    /api/lab/pending` – Lab Assistant lists
- `POST   /api/lab/upload/:labRequestId` – Report upload
- `GET    /api/lab/reports` – Doctor retrieves
- `PUT    /api/lab/review/:reportId` – Doctor review

**System**
- `GET    /health` – Health check

> Full detailed API docs are in [`docs/api-docs.md`](../docs/api-docs.md). Example requests in [`docs/example-data.md`](../docs/example-data.md)

---

## Getting Started

### Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Configure Environment
cp .env.example .env
# Edit .env as needed with your MongoDB URI, JWT secret, etc.

# Start server
npm start
```

---

## Environment Variables
Example `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mediease
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
UPLOAD_DIR=uploads/lab
MAX_FILE_SIZE=10485760 # (10MB)
CORS_ORIGIN=http://localhost:3000
```

---

## Usage

- The backend provides all REST APIs; see [API Overview](#api-overview).
- JWT tokens are required for authenticated endpoints (Authorization header: `Bearer <token>`).
- Registration and workflow for medical staff includes multi-step approval by Admin.
- Doctor initiates lab requests; Lab Assistant uploads lab files and results; Doctor reviews the report.

---

## Testing

- Full Postman Collection: `docs/postman_final_complete_suite.json`
- 7 Folders, 41 requests, >50 assertions
- Test scripts auto-populate variables and simulate full user flows

```bash
# In Postman
docs/postman_final_complete_suite.json
#set baseUrl to http://localhost:5000

# Or with Newman CLI
npm install -g newman
newman run docs/postman_final_complete_suite.json --environment env.json
```

---

## Troubleshooting

- **MongoDB Connection:**
  - Check service: `sudo systemctl status mongod`
  - Verify `MONGODB_URI` in .env
- **Port Conflict:**
  - Find process: `netstat -ano | findstr :5000`
  - Kill: `taskkill /PID <PID> /F`
- **JWT Errors:** `401 Unauthorized` – Re-login to get fresh token
- **Lab Upload Fails:**
  - Max size: 10MB; only PNG, JPG, PDF
  - Ensure encounterId is format ENCxxxxx

---

## Contributing
- Follow existing code structure and project style
- Add tests for new features
- Update README/documentation for all API changes
- Use clear, meaningful commits
- Open pull requests for review

---

## License

This repository and its code are proprietary.
MediEase © 2025. All rights reserved.

---

## Contact

For support:
- See [Troubleshooting](#troubleshooting)
- Review API Documentation
- See Postman collection examples
- Contact the MediEase development team

---

## Version History
### v1.0.0 (November 2025)
- Core authentication
- Patient management (FHIR compliant)
- Appointment scheduling
- Clinical encounters & prescriptions
- Lab management with file uploads
- Automatic FHIR resource generation
- Lab report review workflow
- Complete API test suite

---

## Roadmap

- [ ] Telemedicine integration
- [ ] Mobile app API
- [ ] Advanced analytics dashboard
- [ ] Integration with external labs
- [ ] Prescription delivery tracking
- [ ] Patient portal
- [ ] SMS/Email notifications
- [ ] Multi-language support

---
