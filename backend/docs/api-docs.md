# MediEase Backend - API Documentation

## Overview

This document provides detailed API endpoint documentation for the MediEase Backend FHIR R4-based EMR system.

**Base URL:** `http://localhost:5000`

**Authentication:** Bearer Token (JWT) required for all protected routes

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Patient Management](#2-patient-management)
3. [Practitioner Management](#3-practitioner-management)
4. [Appointment Management](#4-appointment-management)
5. [Clinical Encounters](#5-clinical-encounters)
6. [Error Responses](#6-error-responses)

---

## 1. Authentication & Authorization

### 1.1 Register User (Doctor/Nurse)

**Endpoint:** `POST /auth/register`

**Access:** Public

**Description:** Register a new doctor or nurse. Account will be in "pending" status until approved by admin.

**Request Body:**
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 6 characters)",
  "confirmPassword": "string (required, must match password)",
  "role": "string (required, 'doctor' or 'nurse')",
  "nic": "string (required)",
  "medicalLicenseId": "string (required for doctors, alphanumeric 6-20 chars)",
  "division": "string (optional, for doctors)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Doctor registered successfully. Awaiting admin approval.",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "doctor",
      "status": "pending",
      "medicalLicenseId": "string"
    }
  }
}
```

**Validation Rules:**
- Email must be unique
- Medical License ID required for doctors (must be unique)
- NIC required for both doctors and nurses
- Password must match confirmPassword
- Role must be either "doctor" or "nurse"

---

### 1.2 Login

**Endpoint:** `POST /auth/login`

**Access:** Public

**Description:** Authenticate user and receive JWT token. Doctors login with email (not medicalLicenseId).

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "string (JWT token)",
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string",
      "status": "string",
      "medicalLicenseId": "string (if doctor)",
      "nurId": "string (if nurse and approved)"
    }
  }
}
```

**Token Payload:**
```json
{
  "userId": "string",
  "role": "string",
  "email": "string",
  "medicalLicenseId": "string (if doctor)",
  "nurId": "string (if nurse)"
}
```

---

### 1.3 Admin Approve Doctor

**Endpoint:** `PUT /admin/approve/doctor/:medicalLicenseId`

**Access:** Admin only

**Authentication:** Bearer token required

**Description:** Approve a doctor by medical license ID. Creates FHIR Practitioner resource and updates user status to "approved".

**URL Parameters:**
- `medicalLicenseId`: Doctor's medical license ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Doctor approved successfully",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "doctor",
      "status": "approved",
      "medicalLicenseId": "string"
    },
    "practitioner": {
      "id": "string",
      "resource": {
        "resourceType": "Practitioner",
        "identifier": [...],
        "name": [...],
        "qualification": [...]
      }
    }
  }
}
```

---

### 1.4 Admin Approve Nurse

**Endpoint:** `PUT /admin/approve/nurse/:userId`

**Access:** Admin only

**Authentication:** Bearer token required

**Description:** Approve a nurse by user ID. Generates NURID (NUR00001), creates FHIR Practitioner resource, and updates user status to "approved".

**URL Parameters:**
- `userId`: Nurse's MongoDB user ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Nurse approved successfully",
  "data": {
    "user": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "nurse",
      "status": "approved",
      "nurId": "NUR00001"
    },
    "practitioner": {
      "id": "string",
      "resource": { /* FHIR Practitioner */ }
    }
  }
}
```

---

### 1.5 Get Pending Users

**Endpoint:** `GET /admin/pending-users`

**Access:** Admin only

**Authentication:** Bearer token required

**Description:** Retrieve all users awaiting approval.

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "doctor",
      "status": "pending",
      "medicalLicenseId": "string",
      "createdAt": "2025-11-17T..."
    }
  ]
}
```

---

## 2. Patient Management

### 2.1 Create Patient

**Endpoint:** `POST /fhir/Patient`

**Access:** Authenticated users (doctor, nurse, admin) with approved status

**Authentication:** Bearer token required

**Description:** Create a new patient. PHN (Patient Health Number) is auto-generated in format PH00001.

**Request Body:**
```json
{
  "nic": "string (required, unique)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "gender": "string (required, male|female|other|unknown)",
  "contactNumber": "string (required, phone number)",
  "dob": "string (required, YYYY-MM-DD)",
  "address": "string (required)",
  "guardianNIC": "string (required)",
  "guardianName": "string (required)",
  "height": "number (optional, cm)",
  "weight": "number (optional, kg)",
  "bloodPressure": "string (optional, e.g., 120/80)",
  "sugarLevel": "number (optional, mg/dL)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": "string",
    "phn": "PH00001",
    "resource": {
      "resourceType": "Patient",
      "identifier": [
        {
          "system": "urn:hospital:patient:phn",
          "value": "PH00001"
        }
      ],
      "name": [...],
      "gender": "female",
      "birthDate": "1990-05-15",
      "telecom": [...],
      "address": [...],
      "contact": [...]
    },
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

---

### 2.2 Get Patient

**Endpoint:** `GET /fhir/Patient/:id`

**Alternative:** `GET /fhir/Patient?identifier=PH00001`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Retrieve patient by MongoDB ID, PHN, or identifier query parameter.

**URL Parameters:**
- `id`: MongoDB ObjectId or PHN (PH00001)

**Query Parameters:**
- `identifier`: PHN (e.g., PH00001)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "phn": "PH00001",
    "resource": { /* Full FHIR Patient resource */ },
    "metadata": {
      "firstName": "Jane",
      "lastName": "Smith",
      "gender": "female",
      "birthDate": "1990-05-15",
      "contactNumber": "+94771234567",
      "address": "123 Main Street, Colombo 03"
    }
  }
}
```

---

### 2.3 Search Patients

**Endpoint:** `GET /fhir/Patient`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Search patients by name, NIC, or gender with pagination.

**Query Parameters:**
- `name`: Search by first or last name (partial match)
- `nic`: Search by NIC (exact match)
- `gender`: Filter by gender (male|female|other|unknown)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example:** `GET /fhir/Patient?name=Jane&gender=female&page=1&limit=10`

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "string",
      "phn": "PH00001",
      "resource": { /* FHIR Patient */ },
      "metadata": { /* Patient metadata */ }
    }
  ]
}
```

---

### 2.4 Update Patient

**Endpoint:** `PUT /fhir/Patient/:id`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Update patient information. Cannot change PHN or NIC.

**URL Parameters:**
- `id`: MongoDB ObjectId or PHN

**Request Body (all fields optional):**
```json
{
  "contactNumber": "string",
  "address": "string",
  "guardianNIC": "string",
  "guardianName": "string",
  "height": "number",
  "weight": "number",
  "bloodPressure": "string",
  "sugarLevel": "number"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "string",
    "phn": "PH00001",
    "resource": { /* Updated FHIR Patient */ }
  }
}
```

---

## 3. Practitioner Management

### 3.1 Get Practitioner

**Endpoint:** `GET /fhir/Practitioner/:id`

**Alternative:** `GET /fhir/Practitioner?identifier=MED12345`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Retrieve practitioner by ID or identifier (medical license for doctors, NURID for nurses).

**Query Parameters:**
- `identifier`: Medical License ID (e.g., MED12345) or Nurse ID (e.g., NUR00001)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "role": "doctor",
    "medicalLicenseId": "MED12345",
    "resource": {
      "resourceType": "Practitioner",
      "identifier": [...],
      "name": [...],
      "qualification": [...]
    },
    "metadata": {
      "firstName": "John",
      "lastName": "Doe",
      "nic": "123456789V",
      "division": "Cardiology"
    }
  }
}
```

---

### 3.2 Search Practitioners

**Endpoint:** `GET /fhir/Practitioner`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Search practitioners by role, name, or active status.

**Query Parameters:**
- `role`: Filter by role (doctor|nurse)
- `name`: Search by first or last name
- `active`: Filter by active status (true|false)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example:** `GET /fhir/Practitioner?role=doctor&active=true`

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "string",
      "role": "doctor",
      "medicalLicenseId": "MED12345",
      "resource": { /* FHIR Practitioner */ },
      "metadata": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

---

## 4. Appointment Management

### 4.1 Create Appointment

**Endpoint:** `POST /fhir/Appointment`

**Access:** Nurse only (approved)

**Authentication:** Bearer token required

**Description:** Create a new appointment. APID (Appointment ID) is auto-generated in format AP00001. Status defaults to "pending".

**Request Body:**
```json
{
  "patientPhn": "string (required, format: PH00001)",
  "doctorLicense": "string (required, medical license ID)",
  "nurseId": "string (required, format: NUR00001)",
  "roomNo": "string (required)",
  "type": "string (optional, default: general)",
  "appointmentDate": "string (optional, ISO 8601, default: now)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "string",
    "apid": "AP00001",
    "resource": {
      "resourceType": "Appointment",
      "identifier": [
        {
          "system": "urn:hospital:appointment:apid",
          "value": "AP00001"
        }
      ],
      "status": "pending",
      "participant": [...]
    },
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

**Business Rules:**
- Patient must exist (verified by PHN)
- Doctor must exist and be approved
- Nurse must exist and be approved
- Nurse creating appointment must match authenticated user's nurId

---

### 4.2 Get Appointment

**Endpoint:** `GET /fhir/Appointment/:id`

**Alternative:** `GET /fhir/Appointment?identifier=AP00001`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Retrieve appointment by MongoDB ID, APID, or identifier query parameter.

**URL Parameters:**
- `id`: MongoDB ObjectId or APID (AP00001)

**Query Parameters:**
- `identifier`: APID (e.g., AP00001)

---

### 4.3 Get Doctor's Appointments

**Endpoint:** `GET /doctor/appointments/:medicalLicenseId`

**Alternative:** `GET /fhir/Appointment?practitionerLicense=MED12345`

**Access:** Doctor only (can only access own appointments)

**Authentication:** Bearer token required

**Description:** Retrieve all appointments for a specific doctor. Includes both pending and completed appointments.

**URL Parameters:**
- `medicalLicenseId`: Doctor's medical license ID

**Query Parameters:**
- `status`: Filter by status (pending|booked|completed|cancelled)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "total": 5,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "id": "string",
      "apid": "AP00001",
      "resource": { /* FHIR Appointment */ },
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
  ]
}
```

---

### 4.4 Get All Appointments

**Endpoint:** `GET /admin/appointments`

**Access:** Admin only

**Authentication:** Bearer token required

**Description:** Retrieve all appointments in the system with filtering and pagination.

**Query Parameters:**
- `status`: Filter by status
- `patientPhn`: Filter by patient PHN
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

---

### 4.5 Update Appointment

**Endpoint:** `PUT /fhir/Appointment/:id`

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Update appointment status or details.

**URL Parameters:**
- `id`: MongoDB ObjectId or APID

**Request Body (all fields optional):**
```json
{
  "status": "string (booked|arrived|fulfilled|cancelled|noshow|completed)",
  "roomNo": "string",
  "appointmentDate": "string (ISO 8601)"
}
```

---

## 5. Clinical Encounters

### 5.1 Start Walk-in Encounter

**Endpoint:** `POST /clinic/start/:phn`

**Access:** Doctor only (approved)

**Authentication:** Bearer token required

**Description:** Create a clinical encounter for a walk-in patient (no appointment). Links encounter to patient by PHN only.

**URL Parameters:**
- `phn`: Patient Health Number (format: PH00001)

**Request Body:**
```json
{
  "complaint": "string (required, chief complaint)",
  "weight": "number (optional, kg)",
  "notes": "string (optional, clinical notes)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Walk-in encounter started successfully",
  "data": {
    "id": "string",
    "encId": "ENC12345",
    "resource": {
      "resourceType": "Encounter",
      "identifier": [
        {
          "system": "urn:hospital:encounter:encid",
          "value": "ENC12345"
        }
      ],
      "status": "in-progress",
      "subject": {
        "reference": "Patient/PH00001"
      },
      "participant": [
        {
          "individual": {
            "reference": "Practitioner/MED12345"
          }
        }
      ],
      "period": {
        "start": "2025-11-17T10:30:00.000Z"
      },
      "reasonCode": [
        {
          "text": "Chest pain and shortness of breath"
        }
      ]
    },
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

---

### 5.2 Start Encounter from Appointment

**Endpoint:** `POST /clinic/start-appointment/:apid`

**Access:** Doctor only (approved)

**Authentication:** Bearer token required

**Description:** Create a clinical encounter from an existing appointment. **Critical:** Updates appointment.status to "completed" but **DOES NOT DELETE** the appointment.

**URL Parameters:**
- `apid`: Appointment ID (format: AP00001)

**Request Body:**
```json
{
  "complaint": "string (required)",
  "weight": "number (optional)",
  "notes": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Encounter started from appointment successfully",
  "data": {
    "encounter": {
      "id": "string",
      "encId": "ENC12346",
      "resource": {
        "resourceType": "Encounter",
        "identifier": [
          {
            "system": "urn:hospital:encounter:encid",
            "value": "ENC12346"
          },
          {
            "system": "urn:hospital:appointment:apid",
            "value": "AP00001"
          }
        ],
        "status": "in-progress",
        ...
      },
      "metadata": {
        "patientPhn": "PH00001",
        "doctorLicense": "MED12345",
        "apid": "AP00001",
        "status": "in-progress",
        "startTime": "2025-11-17T11:00:00.000Z",
        "complaint": "Follow-up checkup"
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

**Business Rules:**
- Appointment must exist and not be cancelled
- Appointment must not already be completed
- Doctor must match the appointment's assigned doctor
- Appointment status updated to "completed" (NOT DELETED)
- Encounter linked to both PHN and APID

---

### 5.3 Get Encounters

**Endpoint:** `GET /fhir/Encounter/:id`

**Alternative Query Endpoints:**
- `GET /fhir/Encounter?patient=PH00001` (get all encounters for a patient)
- `GET /fhir/Encounter?participant=MED12345` (get all encounters for a doctor)
- `GET /fhir/Encounter?identifier=AP00001` (get encounter by appointment ID)

**Access:** Authenticated and approved users

**Authentication:** Bearer token required

**Description:** Retrieve encounters by ID, patient, or doctor.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "encId": "ENC12345",
    "resource": { /* Full FHIR Encounter resource */ },
    "metadata": {
      "patientPhn": "PH00001",
      "doctorLicense": "MED12345",
      "apid": "AP00001",
      "status": "in-progress",
      "startTime": "2025-11-17T10:30:00.000Z",
      "endTime": null,
      "complaint": "Chest pain",
      "weight": 75,
      "notes": "Patient assessment notes"
    }
  }
}
```

---

### 5.4 Update Encounter

**Endpoint:** `PUT /fhir/Encounter/:id`

**Access:** Doctor only (can only update own encounters)

**Authentication:** Bearer token required

**Description:** Update encounter details or close the encounter.

**URL Parameters:**
- `id`: MongoDB ObjectId

**Request Body (all fields optional):**
```json
{
  "notes": "string (clinical notes)",
  "weight": "number",
  "status": "string (finished to close encounter)",
  "endTime": "string (ISO 8601, automatically set if status=finished)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Encounter updated successfully",
  "data": {
    "id": "string",
    "encId": "ENC12345",
    "resource": { /* Updated FHIR Encounter */ },
    "metadata": {
      "status": "finished",
      "endTime": "2025-11-17T11:30:00.000Z"
    }
  }
}
```

---

## 6. Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **400 Bad Request**: Invalid input, validation error, or missing required fields
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: User lacks required permissions or approval status
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

### Example Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

**403 Forbidden (Pending Approval):**
```json
{
  "success": false,
  "message": "Your account is pending. Please wait for admin approval.",
  "status": "pending"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Patient not found with PHN: PH00001"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "message": "Missing required patient fields",
  "missingFields": ["nic", "firstName", "contactNumber"]
}
```

---

## Appendix: ID Formats

| Entity | ID Format | Example | Generation |
|--------|-----------|---------|------------|
| Patient | PH + 5 digits | PH00001 | Auto-generated at patient creation |
| Nurse | NUR + 5 digits | NUR00001 | Generated at admin approval |
| Appointment | AP + 5 digits | AP00001 | Auto-generated at appointment creation |
| Encounter | ENC + 5 digits | ENC12345 | Auto-generated at encounter start |
| Medical License | Alphanumeric | MED12345 | Provided by doctor at registration |

---

## Appendix: FHIR Resource Types

This system implements the following FHIR R4 resources:

- **Patient**: Demographics and administrative information
- **Practitioner**: Healthcare provider information (doctors and nurses)
- **Appointment**: Scheduled healthcare service
- **Encounter**: Clinical visit or interaction

All resources are stored with full FHIR JSON structure in the `resource` field, plus indexed helper fields for fast queries.

---

## Authentication Flow Diagram

```
1. Doctor/Nurse → POST /auth/register → status: "pending"
2. Admin → POST /auth/login → receives adminToken
3. Admin → PUT /admin/approve/doctor/:medicalLicenseId → FHIR Practitioner created
4. Doctor → POST /auth/login → receives doctorToken with approved status
5. Doctor → Uses doctorToken for all protected endpoints
```

---

## Critical Workflow: Appointment to Encounter

```
1. Nurse → POST /fhir/Appointment
   → APID generated (AP00001)
   → status: "pending"

2. Doctor → POST /clinic/start-appointment/AP00001
   → Encounter created (linked to AP00001 and PH00001)
   → Appointment.status updated to "completed"
   → Appointment REMAINS in database (NOT DELETED)

3. Doctor → PUT /fhir/Encounter/:id (status: "finished")
   → Encounter closed
```

---

**End of API Documentation**
