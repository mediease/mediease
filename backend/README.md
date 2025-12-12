MediEase Backend

A modern, production-ready Electronic Medical Records (EMR) backend built using Node.js, Express, MongoDB, and HL7 FHIR R4 standards. MediEase provides secure, scalable, and standards-compliant clinical data management for hospitals and healthcare applications.

⭐ Key Features

Role-based Access Control (RBAC) — Admin, Doctor, and Nurse roles with permission-based workflows

FHIR R4-Compliant Resources — Patient, Practitioner, Appointment, and Encounter

Automated Identifier Generation — PHN, NURID, APID, ENCID

JWT Authentication — Secure token-based access

Appointment & Encounter Management — Full lifecycle handling

Approval Workflow — Doctors/Nurses require admin approval before accessing the system

Clinical Data Integrity — Appointment records are never deleted (audit-friendly)

🏛️ Business Logic Overview
🔐 Roles & Permissions
Role	Capabilities
Admin	Approve practitioners, manage users, full system access
Doctor	Create encounters, view appointments (must be approved)
Nurse	Create appointments, manage patients (must be approved)
🆔 Identifier Structure
ID	Format
Patient PHN	PH00001
Nurse NURID	NUR00001
Appointment APID	AP00001
Encounter ENCID	ENCxxxxx
Medical License	Alphanumeric (e.g., MED12345)
🔄 Critical Workflows

Practitioner registers → Admin approves → FHIR Practitioner created

Patient creation → Auto-generate PHN

Nurse creates appointment → APID auto-generated → Status: pending

Doctor starts encounter → Appointment marked as completed (not deleted)

Walk-in encounters supported (PHN-only)

🚀 Getting Started
Prerequisites

Node.js v18+

MongoDB v6+

npm or yarn

Installation
git clone https://github.com/mediease/mediease.git
cd mediease/backend
npm install

Environment Setup
cp .env.example .env


Update the .env file with your database URI, JWT secret, and admin credentials.

Seed the admin user
npm run seed

Run the server
npm run dev       # development
npm start         # production

📡 API Documentation
Base URL
http://localhost:5000

Authentication

Provide JWT token in header:

Authorization: Bearer <token>

🔐 Authentication Endpoints
Register Doctor/Nurse

POST /auth/register

Login

POST /auth/login

Admin Approvals

Approve doctor: PUT /admin/approve/doctor/:licenseId

Approve nurse: PUT /admin/approve/nurse/:userId

Get pending users: GET /admin/pending-users

🏥 Patient Endpoints

Create Patient — POST /fhir/Patient

Get Patient by PHN — GET /fhir/Patient/:phn

Search Patients — GET /fhir/Patient?name=&gender=

Update Patient — PUT /fhir/Patient/:phn

📅 Appointment Endpoints

Create Appointment (Nurse) — POST /fhir/Appointment

Doctor Appointments — GET /doctor/appointments/:licenseId

Admin: All Appointments — GET /admin/appointments

🏥 Encounter Endpoints

Walk-In Encounter — POST /clinic/start/:phn

Encounter from Appointment — POST /clinic/start-appointment/:apid

Get Patient Encounters — GET /fhir/Encounter?patient=

Get Doctor Encounters — GET /fhir/Encounter?participant=

Close Encounter — PUT /fhir/Encounter/:id

📁 Project Structure
backend/
├── server.js
├── app.js
├── config/
├── models/
├── controllers/
├── routes/
├── middleware/
├── utils/
├── seeds/
├── tests/
└── docs/

🧪 Testing

Run all tests:

npm test


Covers:
✔ Practitioner approval flow
✔ Patient creation & PHN generation
✔ Appointment creation & lifecycle
✔ Encounter creation & status updates
✔ Appointment → Encounter mapping

🔒 Security

Passwords hashed using bcrypt

JWT-based authentication

Role-based route protection

Approval workflow prevents unauthorized access

Sensitive data stored via environment variables

📈 Future Enhancements

Medication & prescriptions

Lab results & diagnostic reports

Patient portal

Real-time notifications

Full FHIR search parameters

Audit logs

File uploads for medical records

External FHIR server support

📄 License

MIT License — See LICENSE file.

🤝 Support

API Docs: /docs/api-docs.md

Postman Collection: /docs/postman_collection.json

Tests: /tests/