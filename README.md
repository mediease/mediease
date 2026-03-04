# MediEase — Electronic Medical Records System

MediEase is a full-stack, FHIR R4-compliant Electronic Medical Records (EMR) system built for hospitals and clinics. It supports multi-role workflows for doctors, nurses, lab assistants, and administrators, with an integrated AI service for prescription safety checking and patient summaries.

---

## Architecture

```
mediease/
├── backend/          # Node.js + Express + MongoDB (port 5000)
├── frontend/         # React 19 + Vite (port 5173)
└── ai_service/       # Python FastAPI microservice (port 8000)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, Mongoose (MongoDB) |
| Frontend | React 19, Vite, React Router v7 |
| AI Service | Python, FastAPI, sentence-transformers |
| AI Model | Google Gemini 2.5 Flash |
| File Storage | Cloudinary |
| Auth | JWT (RS256) |
| Data Standard | FHIR R4 |

---

## Features

### Clinical
- **Patient Management** — FHIR-compliant patient records with auto-generated PHN (`PH#####`)
- **Appointments** — Scheduling, status tracking, calendar views
- **Clinical Encounters** — Encounter records with auto-generated ENCID
- **Prescriptions** — Create and manage medication orders with AI safety validation
- **Allergy Tracking** — Patient allergy records with drug interaction checks
- **Lab Reports** — Order tests, upload results (PDF/image to Cloudinary), view inline

### AI
- **Prescription Validation** — Checks for side effects, drug–drug interactions, allergy conflicts, and condition contraindications before a prescription is saved
- **Patient Summary** — On-demand AI summary of a patient's full medical history via Google Gemini

### Admin
- **User Management** — Create accounts for doctors, nurses, lab assistants
- **Approval Workflow** — New medical staff accounts require admin approval
- **Appointment Overview** — View all appointments across all doctors

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | User management, all appointments, system settings |
| `doctor` | Patients, appointments, prescriptions, lab orders, AI features |
| `nurse` | Patients, appointments, staff workflows |
| `lab_assistant` | Lab request queue, upload reports |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.9+
- Cloudinary account
- Google Gemini API key

---

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values (see Environment Variables section)
npm run seed        # Create initial admin user
npm run dev         # Start server (port 5000, auto-reload)
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # Start Vite dev server (port 5173)
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

---

### 3. AI Service

```bash
cd ai_service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                  # Start FastAPI server (port 8000)
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mediease
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d

# Seed admin credentials
ADMIN_EMAIL=admin@hospital.com
ADMIN_PASSWORD=Admin@123
ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Administrator

# FHIR identifier systems
FHIR_SYSTEM_PHN=urn:hospital:patient:phn
FHIR_SYSTEM_LICENSE=urn:hospital:practitioner:license
FHIR_SYSTEM_NURID=urn:hospital:nurse:nurid
FHIR_SYSTEM_APID=urn:hospital:appointment:apid
FHIR_SYSTEM_ENCID=urn:hospital:encounter:encid

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Python AI microservice
AI_SERVICE_URL=http://localhost:8000

# Cloudinary (file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Overview

### Auth (`/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/register` | Register new user |
| GET | `/auth/pending` | List pending approvals |
| POST | `/auth/approve/:id` | Approve user account |

### Patients (`/fhir`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/fhir/patients` | List all patients |
| POST | `/fhir/patients` | Create patient |
| GET | `/fhir/patients/:phn` | Get patient by PHN |
| PUT | `/fhir/patients/:phn` | Update patient |

### Appointments (`/fhir/appointments`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/fhir/appointments` | All appointments (admin) |
| GET | `/fhir/appointments/:licenseId` | Doctor's appointments |
| POST | `/fhir/appointments` | Book appointment |

### Lab (`/api/lab`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lab/requests` | Pending lab requests |
| POST | `/api/lab/request` | Create lab request |
| POST | `/api/lab/upload/:id` | Upload lab report (multipart) |
| GET | `/api/lab/report/lab/:labId` | Get report by Lab ID |
| GET | `/api/lab/patient/:phn` | All reports for a patient |

### AI (`/ai`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/ai/summary/:phn` | Generate patient summary |
| POST | `/fhir/MedicationRequest/validate` | Validate prescription draft |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/ping` | Basic ping |
| GET | `/health` | Detailed health check |

---

## Project Structure

```
backend/
├── controllers/      # Request handlers (10 files)
├── models/           # Mongoose schemas (11 models)
├── routes/           # Express routers (10 files)
├── services/         # Business logic & AI integration
├── middleware/       # Auth, role checks, FHIR validation
├── utils/            # ID generators, FHIR helpers, clients
├── seeds/            # Database seeders
├── config/           # DB connection
├── app.js            # Express app setup
└── server.js         # Entry point

frontend/
├── src/
│   ├── pages/        # 33 page components
│   ├── components/   # Reusable UI components
│   ├── services/     # httpClient (axios wrapper)
│   ├── assets/       # Static assets
│   └── App.jsx       # Routing

ai_service/
├── services/         # Validation engines (classifier, side effects, interactions, allergy)
├── schemas/          # Pydantic request/response models
├── data/             # JSON knowledge bases (side effects, interactions, risk rules)
└── app.py            # FastAPI entry point
```

---

## FHIR Resources Used

| Resource | Purpose |
|----------|---------|
| Patient | Patient demographics & identifiers |
| Practitioner | Doctor and nurse profiles |
| Appointment | Scheduling |
| Encounter | Clinical visit records |
| MedicationRequest | Prescriptions |
| Observation | Lab result values |
| DiagnosticReport | Lab report with file attachment |
| AllergyIntolerance | Patient allergy records |

---

## Seeding Data

```bash
cd backend
npm run seed        # Seed admin user only
npm run seed:all    # Seed all sample data (patients, doctors, appointments, etc.)
```

Default admin credentials (from `.env`):
- Email: `admin@hospital.com`
- Password: `Admin@123`

---

## Scripts

### Backend
```bash
npm run dev         # Development server with auto-reload
npm start           # Production server
npm test            # Run Jest tests
npm run seed        # Seed admin
npm run seed:all    # Seed all data
```

### Frontend
```bash
npm run dev         # Vite dev server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint
```
