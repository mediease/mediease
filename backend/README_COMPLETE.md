# MediEase - FHIR-Compliant Hospital Management System

## 📋 Overview

MediEase is a comprehensive Hospital Electronic Medical Records (EMR) system built with Node.js, Express, and MongoDB. It implements FHIR (Fast Healthcare Interoperability Resources) standards for healthcare data exchange and provides complete clinical workflow management including patient management, appointments, encounters, prescriptions, and advanced lab diagnostics with review capabilities.

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** November 2025

---

## 🎯 Key Features

### 1. **Authentication & Role Management**
- Multi-role support: Admin, Doctor, Nurse, Lab Assistant
- JWT-based authentication
- Role-based access control (RBAC)
- Approval workflow for healthcare professionals
- Lab Assistant registration with unique LBID (Lab ID)

### 2. **Patient Management**
- FHIR Patient resource compliance
- Automatic PHN (Patient Health Number) generation
- Complete patient demographics
- NIC-based patient identification

### 3. **Clinical Workflows**
- **Encounters:** Walk-in and appointment-based encounters
- **Prescriptions:** Single & multi-item medication requests
- **FHIR MedicationRequest** resources
- Medication search and lookup
- Clinical notes and vital signs tracking

### 4. **Appointment System**
- Appointment scheduling
- Room assignment
- Doctor-Patient-Nurse linkage
- Status tracking

### 5. **Lab Management** (Advanced Feature)
- **Lab Request Creation** (Doctor)
- **Pending Requests List** (Lab Assistant)
- **Lab Report Upload** with file support (PNG, JPG, PDF)
- **Automatic FHIR Resource Generation:**
  - DiagnosticReport
  - Observation
- **Lab Review by Doctor:**
  - Status tracking: pending → completed → reviewed
  - Doctor review notes
  - Review timestamp and reviewer identification

### 6. **FHIR Compliance**
- Patient resources
- Practitioner resources (Doctor, Nurse)
- Appointment resources
- Encounter resources with custom ENC IDs
- MedicationRequest resources
- DiagnosticReport resources
- Observation resources

---

## 🚀 Quick Start

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

# Create .env file
cp .env.example .env

# Configure environment variables
# Edit .env with your MongoDB URI, JWT secret, etc.

# Start server
npm start
```

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/mediease

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# File Upload
UPLOAD_DIR=uploads/lab
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 📊 API Structure

### Base URL
```
http://localhost:5000
```

### Core Routes

#### Authentication (`/auth`)
```
POST   /auth/register              - Register new user (Doctor/Nurse/Lab Assistant)
POST   /auth/login                 - User login
PUT    /auth/approve/doctor/:id    - Approve doctor by medical license
PUT    /auth/approve/nurse/:id     - Approve nurse by nurse ID
PUT    /auth/approve/lab-assistant/:id - Approve lab assistant by LBID
PUT    /auth/reject/:userId        - Reject pending user
GET    /auth/pending-users         - Get pending approvals (Admin only)
```

#### Patients (`/fhir/Patient`)
```
POST   /fhir/Patient               - Create patient
GET    /fhir/Patient/:phn          - Get patient by PHN
GET    /fhir/Patient              - List all patients
```

#### Practitioners (`/fhir/Practitioner`)
```
GET    /fhir/Practitioner/:id      - Get practitioner (Doctor/Nurse)
GET    /fhir/Practitioner          - List all practitioners
```

#### Appointments (`/fhir/Appointment`)
```
POST   /fhir/Appointment           - Create appointment
GET    /fhir/Appointment/:apid     - Get appointment
GET    /fhir/Appointment           - List appointments
PUT    /fhir/Appointment/:apid     - Update appointment
```

#### Encounters (`/fhir/Encounter` / `/clinic`)
```
POST   /clinic/start/:phn          - Start walk-in encounter
GET    /fhir/Encounter/:id         - Get encounter details
PUT    /fhir/Encounter/:id         - Update encounter
GET    /fhir/Encounter             - List encounters
```

#### Prescriptions (`/fhir/MedicationRequest`)
```
POST   /fhir/MedicationRequest     - Create prescription
GET    /fhir/MedicationRequest/:phn - Get patient prescriptions
PUT    /fhir/MedicationRequest/:id - Update prescription
DELETE /fhir/MedicationRequest/:id - Delete prescription
```

#### Medications (`/fhir/Medication`)
```
GET    /fhir/Medication/search     - Search medications by query
```

#### Lab Management (`/api/lab`)
```
POST   /api/lab/request            - Create lab request (Doctor)
GET    /api/lab/pending            - List pending requests (Lab Assistant)
POST   /api/lab/upload/:labRequestId - Upload lab report (Lab Assistant)
GET    /api/lab/reports            - Get encounter lab reports (Doctor)
PUT    /api/lab/review/:reportId   - Review lab report (Doctor)
```

#### System
```
GET    /health                     - Health check
```

---

## 👥 User Roles & Permissions

### Admin
- Approve/reject user registrations
- View pending users
- Full system access

### Doctor
- Create patient records
- Create lab requests
- Create prescriptions
- Start & manage encounters
- Schedule appointments
- Review lab reports

### Nurse
- Create patient records
- Schedule appointments
- Assist with patient care

### Lab Assistant
- View pending lab requests
- Upload lab reports with files and results
- Generate FHIR resources automatically

---

## 🔐 Authentication Flow

### 1. User Registration
```bash
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@hospital.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "doctor",
  "medicalLicenseId": "MED12345",
  "nic": "199012345678",
  "division": "Cardiology"
}
```

### 2. Admin Approval
```bash
PUT /auth/approve/doctor/MED12345
Headers: Authorization: Bearer <admin-token>
```

### 3. User Login
```bash
POST /auth/login
{
  "email": "john@hospital.com",
  "password": "password123",
  "role": "doctor"
}
```

### 4. Use Token
```bash
Headers: Authorization: Bearer <token>
```

---

## 🧪 Lab Workflow (Complete Example)

### Step 1: Doctor Creates Lab Request
```bash
POST /api/lab/request
Headers: Authorization: Bearer <doctor-token>
{
  "patientPhn": "PH00001",
  "encounterId": "ENC12345",
  "testType": "cbc"  // xray, ecg, blood_sugar, cbc
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "lab_req_001",
    "status": "pending",
    "testType": "cbc"
  }
}
```

### Step 2: Lab Assistant Views Pending Requests
```bash
GET /api/lab/pending
Headers: Authorization: Bearer <lab-assistant-token>
```

### Step 3: Lab Assistant Uploads Report
```bash
POST /api/lab/upload/lab_req_001
Headers: Authorization: Bearer <lab-assistant-token>
Body: FormData
  - file: <PNG/JPG/PDF file>
  - resultText: "WBC 7.5, RBC 4.8, HB 14.5 - all normal"
```

**Response (Auto-generates FHIR resources):**
```json
{
  "success": true,
  "data": {
    "labRequest": {
      "status": "completed"
    },
    "diagnosticReport": {
      "resourceType": "DiagnosticReport",
      "status": "final",
      "code": { "coding": [{"system": "SNOMED", "code": "57021-8"}] }
    },
    "observation": {
      "resourceType": "Observation",
      "status": "final",
      "valueString": "WBC 7.5, RBC 4.8, HB 14.5 - all normal"
    }
  }
}
```

### Step 4: Doctor Retrieves Reports
```bash
GET /api/lab/reports?encounterId=ENC12345
Headers: Authorization: Bearer <doctor-token>
```

### Step 5: Doctor Reviews Report
```bash
PUT /api/lab/review/report_id_001
Headers: Authorization: Bearer <doctor-token>
{
  "reviewNotes": "Results are normal. Patient healthy. Continue monitoring."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report": {
      "status": "reviewed",
      "reviewedBy": "MED12345",
      "reviewNotes": "Results are normal. Patient healthy. Continue monitoring.",
      "reviewedAt": "2025-11-20T10:30:00Z"
    }
  }
}
```

---

## 📦 Database Models

### User
```javascript
{
  firstName, lastName, email, password, role,
  status: 'pending|approved|rejected',
  // Role-specific:
  medicalLicenseId (doctor),
  nurId (nurse),
  labId (lab_assistant),
  nic, division, timestamps
}
```

### FHIRPatient
```javascript
{
  phn, nic, firstName, lastName, gender,
  dob, contactNumber, address, resource,
  indexes: phn, nic
}
```

### FHIREncounter
```javascript
{
  encId, resource, patientPhn, doctorLicense,
  status, complaint, weight, isActive,
  prescriptions: [ObjectId],
  indexes: encId, patientPhn, status
}
```

### LabRequest
```javascript
{
  patientPhn, doctorLicense, encounterId,
  testType: 'xray|ecg|blood_sugar|cbc',
  status: 'pending|completed',
  fileUrl, resultText, completedAt,
  timestamps
}
```

### FHIRDiagnosticReport
```javascript
{
  patientPhn, encounterEncId, labRequestId,
  testType, resource,
  // Review fields:
  status: 'pending|reviewed',
  reviewedBy, reviewNotes, reviewedAt,
  timestamps
}
```

### FHIRObservation
```javascript
{
  patientPhn, encounterEncId, labRequestId,
  testType, resource,
  timestamps
}
```

---

## 🔄 FHIR Code Mappings

### Lab Test Types
| Test Type | SNOMED Code | LOINC Code |
|-----------|------------|-----------|
| xray | 30758008 | - |
| ecg | 164847007 | - |
| blood_sugar | - | 2339-0 |
| cbc | - | 57021-8 |

---

## 📝 Testing

### Postman Collection
Import `postman_final_complete_suite.json` in Postman for complete API testing.

**Collection Details:**
- **7 Folders**
- **41 Requests**
- **Variables:** Auto-populated via test scripts
- **Tests:** 50+ assertions

**Test Coverage:**
- ✅ Authentication (13 requests)
- ✅ Patient Management (3 requests)
- ✅ Appointments (2 requests)
- ✅ Clinical Encounters (7 requests)
- ✅ Lab Management (7 requests)
- ✅ Error Scenarios (8 requests)
- ✅ System Health (1 request)

### Running Tests
```bash
# Using Postman
1. Open postman_final_complete_suite.json
2. Set baseUrl to http://localhost:5000
3. Run collection sequentially

# Using Newman (CLI)
npm install -g newman
newman run postman_final_complete_suite.json --environment env.json
```

---

## 🛠️ Development

### Project Structure
```
backend/
├── config/              # Database configuration
├── controllers/         # Route handlers
│   ├── auth.controller.js
│   ├── lab.controller.js
│   ├── fhir*.controller.js
├── models/              # Mongoose schemas
│   ├── user.model.js
│   ├── labRequest.model.js
│   ├── fhir*.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── lab.routes.js
│   ├── fhir*.routes.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── fhirValidationMiddleware.js
├── utils/               # Helper utilities
│   ├── fhirHelpers.js
│   ├── idGenerators.js
│   ├── labTestMappings.js
├── uploads/             # File upload directory
├── seeds/               # Database seeders
├── docs/                # API documentation & Postman collections
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json
└── README.md
```

### Adding New Lab Test Types
Edit `utils/labTestMappings.js`:
```javascript
export const LAB_TEST_CODE_MAP = {
  xray: { system: 'SNOMED', code: '30758008', display: 'X-ray' },
  ecg: { system: 'SNOMED', code: '164847007', display: 'ECG' },
  blood_sugar: { system: 'LOINC', code: '2339-0', display: 'Blood Sugar' },
  cbc: { system: 'LOINC', code: '57021-8', display: 'CBC' },
  // Add new test types here
  new_test: { system: 'SNOMED', code: 'XXXXX', display: 'New Test' }
};
```

Then update LabRequest model validation in `models/labRequest.model.js`.

---

## 🔍 ID Formats

### Custom ID Formats
- **PHN (Patient Health Number):** `PH00001` (auto-generated)
- **APID (Appointment ID):** `AP00001` (auto-generated)
- **ENCID (Encounter ID):** `ENC00001` (auto-generated)
- **LBID (Lab Assistant ID):** `LB001` (user-provided, unique)

### ID Generation
Located in `utils/idGenerators.js`:
- `createPHN()` - Generates unique patient ID
- `createAPID()` - Generates unique appointment ID
- `createENCID()` - Generates unique encounter ID

---

## 📋 Status Codes

### Success Responses
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE

### Error Responses
- `400 Bad Request` - Invalid input, missing fields
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## 🚨 Error Handling

### Common Error Scenarios

**Missing Token:**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Invalid Role Access:**
```json
{
  "success": false,
  "message": "Only doctor can create lab requests"
}
```

**Incomplete Lab Request:**
```json
{
  "success": false,
  "message": "Lab request must be completed before reviewing the report"
}
```

---

## 🔒 Security Considerations

1. **JWT Tokens:** Securely generated with expiration
2. **Password Hashing:** bcrypt with 10 salt rounds
3. **Role-Based Access Control:** Enforced at middleware level
4. **File Upload Validation:**
   - Allowed types: PNG, JPG, PDF
   - Max size: 10MB
   - Stored in `/uploads/lab/`
5. **Input Validation:** Mongoose schema validation
6. **CORS:** Configurable cross-origin requests

---

## 📈 Performance Optimizations

- **Database Indexes:** On frequently queried fields
  - PHN, doctorLicense, status, testType
  - Custom encId, patientPhn for fast lookups
- **JWT Validation:** Middleware-level caching
- **Multer Storage:** Disk storage with unique filenames
- **Query Optimization:** Minimal field selection where needed

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB service
sudo systemctl status mongod

# Verify URI in .env
MONGODB_URI=mongodb://localhost:27017/mediease
```

### Port Already in Use
```bash
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### JWT Token Errors
```
401 Unauthorized - Token invalid or expired
Solution: Re-login to get fresh token
```

### Lab Report Upload Fails
```
File size exceeds limit
Solution: Max file size is 10MB (PNG, JPG, PDF only)

ObjectId cast error
Solution: Ensure encounterId is a valid ENC format (e.g., ENC12345)
```

---

## 📚 API Documentation

Detailed API documentation available in `docs/api-docs.md`

Example requests available in `docs/example-data.md`

---

## 🤝 Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update README for API changes
4. Use meaningful commit messages
5. Create pull requests for review

---

## 📄 License

MediEase © 2025. All rights reserved.

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check Postman collection examples
4. Contact development team

---

## 📊 Version History

### v1.0.0 (November 2025)
- ✅ Core authentication system
- ✅ Patient management (FHIR compliant)
- ✅ Appointment scheduling
- ✅ Clinical encounters & prescriptions
- ✅ Lab management with file uploads
- ✅ Automatic FHIR resource generation
- ✅ Lab report review system
- ✅ Complete test suite (41 requests)

---

## 🎯 Roadmap

### Future Features
- [ ] Telemedicine integration
- [ ] Mobile app API
- [ ] Advanced analytics dashboard
- [ ] Integration with external labs
- [ ] Prescription delivery tracking
- [ ] Patient portal
- [ ] SMS/Email notifications
- [ ] Multi-language support

---

**Last Updated:** November 20, 2025  
**Maintained by:** MediEase Development Team  
**Status:** Production Ready ✅
