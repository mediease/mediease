# MediEase Backend

A production-ready **Electronic Medical Records (EMR)** backend system built with **Node.js**, **Express**, **MongoDB**, and **HL7 FHIR R4** standards.

## 🏥 Features

- **Role-based Access Control**: Admin, Doctor, Nurse roles with approval workflow
- **FHIR R4 Compliance**: Patient, Practitioner, Appointment, and Encounter resources
- **Auto-generated IDs**: PHN (Patient), NURID (Nurse), APID (Appointment), ENCID (Encounter)
- **JWT Authentication**: Secure token-based authentication
- **Appointment Management**: Full lifecycle from creation to completion
- **Clinical Encounters**: Walk-in and appointment-based clinic visits
- **Approval Workflow**: Doctors and nurses require admin approval before accessing system

## 📋 Business Rules

### Roles & Permissions
- **Admin**: Approve/reject doctors and nurses, full system access
- **Doctor**: Create encounters, view their appointments (must be approved)
- **Nurse**: Create appointments, manage patient records (must be approved)

### Identifier Formats
- **PHN**: `PH00001` (Patient Health Number - auto-generated)
- **NURID**: `NUR00001` (Nurse ID - generated at approval)
- **APID**: `AP00001` (Appointment ID - auto-generated)
- **ENCID**: `ENCxxxxx` (Encounter ID - auto-generated)
- **Medical License**: Alphanumeric, 6-20 characters (e.g., `MED12345`)

### Critical Workflows
1. **Doctor/Nurse Registration** → Admin Approval → FHIR Practitioner Created
2. **Patient Creation** → Auto-generate PHN
3. **Nurse Creates Appointment** → Auto-generate APID → Status: "pending"
4. **Doctor Starts Encounter from Appointment** → Update Appointment.status = "completed" (**NOT DELETED**)
5. **Doctor Starts Walk-in Encounter** → Create Encounter linked by PHN only

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **MongoDB** v6+ (local or Atlas)
- **npm** or **yarn**

### Installation

```bash
# Clone or extract the project
cd mediease

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your configuration
# Update MONGODB_URI, JWT_SECRET, etc.

# Seed admin user
npm run seed

# Start server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fhir_emr_db

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d

# Admin Seed Credentials
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=Admin@123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator

# FHIR System URIs
FHIR_SYSTEM_PHN=urn:hospital:patient:phn
FHIR_SYSTEM_LICENSE=urn:hospital:practitioner:license
FHIR_SYSTEM_NURID=urn:hospital:nurse:nurid
FHIR_SYSTEM_APID=urn:hospital:appointment:apid
FHIR_SYSTEM_ENCID=urn:hospital:encounter:encid
```

### Running the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Seed admin user
npm run seed

# Run tests
npm test
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication

All protected routes require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Auth Endpoints

### 1. Register Doctor/Nurse
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "doctor@hospital.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "role": "doctor",
  "medicalLicenseId": "MED12345",
  "nic": "123456789V",
  "division": "Cardiology"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Doctor registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "doctor@hospital.com",
      "role": "doctor",
      "status": "pending",
      "medicalLicenseId": "MED12345"
    }
  }
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "doctor@hospital.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "doctor@hospital.com",
      "role": "doctor",
      "status": "approved",
      "medicalLicenseId": "MED12345"
    }
  }
}
```

### 3. Admin Approve Doctor
```http
PUT /admin/approve/doctor/:medicalLicenseId
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Doctor approved successfully",
  "data": {
    "user": { ... },
    "practitioner": {
      "id": "...",
      "resource": { /* FHIR Practitioner resource */ }
    }
  }
}
```

### 4. Admin Approve Nurse
```http
PUT /admin/approve/nurse/:userId
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Nurse approved successfully",
  "data": {
    "user": {
      "nurId": "NUR00001",
      "status": "approved",
      ...
    },
    "practitioner": { ... }
  }
}
```

### 5. Get Pending Users
```http
GET /admin/pending-users
Authorization: Bearer <admin_token>
```

---

## 🏥 Patient Endpoints

### 1. Create Patient
```http
POST /fhir/Patient
Authorization: Bearer <token>
Content-Type: application/json

{
  "nic": "987654321V",
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "female",
  "contactNumber": "+94771234567",
  "dob": "1990-05-15",
  "address": "123 Main St, Colombo",
  "guardianNIC": "123456789V",
  "guardianName": "John Smith",
  "height": 165,
  "weight": 60,
  "bloodPressure": "120/80",
  "sugarLevel": 95
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": "...",
    "phn": "PH00001",
    "resource": { /* FHIR Patient resource */ },
    "metadata": {
      "firstName": "Jane",
      "lastName": "Smith",
      "gender": "female",
      "birthDate": "1990-05-15",
      "contactNumber": "+94771234567"
    }
  }
}
```

### 2. Get Patient by PHN
```http
GET /fhir/Patient/PH00001
Authorization: Bearer <token>
```

### 3. Search Patients
```http
GET /fhir/Patient?name=Jane&gender=female
Authorization: Bearer <token>
```

### 4. Update Patient
```http
PUT /fhir/Patient/PH00001
Authorization: Bearer <token>
Content-Type: application/json

{
  "contactNumber": "+94771234568",
  "address": "456 New St, Colombo",
  "weight": 62
}
```

---

## 📅 Appointment Endpoints

### 1. Create Appointment (Nurse Only)
```http
POST /fhir/Appointment
Authorization: Bearer <nurse_token>
Content-Type: application/json

{
  "patientPhn": "PH00001",
  "doctorLicense": "MED12345",
  "nurseId": "NUR00001",
  "roomNo": "101",
  "type": "general",
  "appointmentDate": "2025-11-18T10:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "...",
    "apid": "AP00001",
    "resource": { /* FHIR Appointment resource */ },
    "metadata": {
      "patientPhn": "PH00001",
      "doctorLicense": "MED12345",
      "nurseId": "NUR00001",
      "roomNo": "101",
      "type": "general",
      "status": "pending",
      "appointmentDate": "2025-11-18T10:00:00.000Z"
    }
  }
}
```

### 2. Get Doctor's Appointments
```http
GET /doctor/appointments/:medicalLicenseId?status=pending
Authorization: Bearer <doctor_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "...",
      "apid": "AP00001",
      "resource": { /* FHIR Appointment */ },
      "metadata": {
        "patientPhn": "PH00001",
        "status": "pending",
        ...
      }
    }
  ]
}
```

### 3. Get All Appointments (Admin)
```http
GET /admin/appointments?status=pending&page=1&limit=10
Authorization: Bearer <admin_token>
```

---

## 🏥 Encounter Endpoints

### 1. Start Walk-in Encounter (Doctor Only)
```http
POST /clinic/start/PH00001
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "complaint": "Chest pain and shortness of breath",
  "weight": 75,
  "notes": "Patient reports symptoms for 2 hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Walk-in encounter started successfully",
  "data": {
    "id": "...",
    "encId": "ENC12345",
    "resource": { /* FHIR Encounter resource */ },
    "metadata": {
      "patientPhn": "PH00001",
      "doctorLicense": "MED12345",
      "status": "in-progress",
      "startTime": "2025-11-17T10:30:00.000Z",
      "complaint": "Chest pain and shortness of breath"
    }
  }
}
```

### 2. Start Encounter from Appointment (Doctor Only)
```http
POST /clinic/start-appointment/AP00001
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "complaint": "Follow-up checkup",
  "weight": 75,
  "notes": "Regular checkup as scheduled"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Encounter started from appointment successfully",
  "data": {
    "encounter": {
      "id": "...",
      "encId": "ENC12346",
      "resource": { /* FHIR Encounter */ },
      "metadata": {
        "patientPhn": "PH00001",
        "doctorLicense": "MED12345",
        "apid": "AP00001",
        "status": "in-progress",
        ...
      }
    },
    "appointment": {
      "apid": "AP00001",
      "status": "completed",
      "message": "Appointment marked as completed"
    }
  }
}
```

### 3. Get Patient Encounters
```http
GET /fhir/Encounter?patient=PH00001
Authorization: Bearer <token>
```

### 4. Get Doctor Encounters
```http
GET /fhir/Encounter?participant=MED12345
Authorization: Bearer <token>
```

### 5. Update Encounter (Close Encounter)
```http
PUT /fhir/Encounter/:id
Authorization: Bearer <doctor_token>
Content-Type: application/json

{
  "notes": "Prescribed medication. Follow-up in 2 weeks.",
  "status": "finished",
  "endTime": "2025-11-17T11:00:00Z"
}
```

---

## 🗂️ Project Structure

```
backend/
├── package.json
├── .env.example
├── server.js                 # Entry point
├── app.js                    # Express app configuration
├── README.md                 # This file
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── user.model.js         # User authentication model
│   ├── fhirPatient.model.js
│   ├── fhirPractitioner.model.js
│   ├── fhirAppointment.model.js
│   └── fhirEncounter.model.js
├── controllers/
│   ├── auth.controller.js
│   ├── fhirPatient.controller.js
│   ├── fhirPractitioner.controller.js
│   ├── fhirAppointment.controller.js
│   └── fhirEncounter.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── fhirPatient.routes.js
│   ├── fhirPractitioner.routes.js
│   ├── fhirAppointment.routes.js
│   └── fhirEncounter.routes.js
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── roleMiddleware.js     # Role-based access control
│   └── fhirValidationMiddleware.js
├── utils/
│   ├── idGenerators.js       # PHN, APID, NURID, ENCID generators
│   └── fhirHelpers.js        # FHIR resource builders
├── seeds/
│   └── seedAdmin.js          # Admin user seeder
├── tests/
│   └── criticalFlows.test.js
└── docs/
    ├── postman_collection.json
    └── api-docs.md
```

## 🧪 Testing

Run the critical flows test:

```bash
npm test
```

Tests cover:
1. Doctor/Nurse registration and approval
2. Patient creation with PHN generation
3. Nurse creating appointments with APID generation
4. Doctor starting encounters (walk-in and from appointment)
5. Appointment status update to "completed" (not deleted)

## 📝 Important Notes

### ID Generation
- All IDs (PHN, NURID, APID, ENCID) are auto-generated
- ID generators use sequential numbering with collision protection
- For high-concurrency production use, consider implementing a dedicated counter collection with atomic operations

### Appointment Workflow
- When doctor starts encounter from appointment, the appointment status is updated to **"completed"**
- Appointments are **NEVER DELETED** - they remain in the database for audit trail

### Authentication Flow
1. Doctor/Nurse registers → status: "pending"
2. Admin approves → status: "approved" + FHIR Practitioner created
3. Only approved practitioners can perform clinical operations

### FHIR Compliance
- Full FHIR R4 resources stored in `resource` field
- Helper fields for fast querying (phn, medicalLicenseId, etc.)
- Identifier systems use URN format (configurable via environment variables)

## 🔒 Security Considerations

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens expire after 30 days (configurable)
- Role-based middleware prevents unauthorized access
- Approval workflow ensures only vetted practitioners access clinical data
- Environment variables for sensitive configuration

## 📊 Data Model

### User (Authentication)
- Stores credentials and role information
- Doctors identified by `medicalLicenseId` (required at registration)
- Nurses receive `nurId` upon approval
- Status: pending → approved/rejected

### FHIR Patient
- Full FHIR Patient resource + helper fields
- Auto-generated PHN
- Required: NIC, full name, gender, DOB, contact, address, guardian info
- Optional: vital signs (height, weight, BP, sugar level)

### FHIR Practitioner
- Created upon admin approval
- Doctors: identified by medicalLicenseId
- Nurses: identified by nurId
- Links to User model for authentication

### FHIR Appointment
- Created by nurses
- Auto-generated APID
- Links patient (PHN), doctor (license), nurse (NURID)
- Status lifecycle: pending → completed/cancelled
- **Never deleted** when encounter starts

### FHIR Encounter
- Created by doctors
- Can be walk-in (PHN only) or from appointment (APID + PHN)
- Tracks clinical visit details
- Updates linked appointment status to "completed"

## 🚧 Future Enhancements

- [ ] Medication and prescription management
- [ ] Lab results and diagnostic reports
- [ ] Condition and observation resources
- [ ] Patient portal for self-service
- [ ] Real-time notifications
- [ ] Advanced search with FHIR query parameters
- [ ] Audit logging for compliance
- [ ] File upload for medical documents
- [ ] Integration with external FHIR servers

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
- Check the API documentation in `docs/api-docs.md`
- Import `docs/postman_collection.json` into Postman for testing
- Review test cases in `tests/criticalFlows.test.js`

---

**Built with ❤️ using Node.js, Express, MongoDB, and FHIR R4 standards**
