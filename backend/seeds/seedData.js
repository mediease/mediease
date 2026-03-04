/**
 * MediEase Full Data Seed Script
 *
 * Seeds: admin, doctors, nurses, lab assistant, patients, appointments,
 *        encounters, allergies, and prescriptions.
 *
 * Run:  node seeds/seedData.js
 *
 * Idempotent — skips records that already exist (matched by unique key).
 */

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/user.model.js';
import FHIRPatient from '../models/fhirPatient.model.js';
import FHIRPractitioner from '../models/fhirPractitioner.model.js';
import FHIRAppointment from '../models/fhirAppointment.model.js';
import FHIREncounter from '../models/fhirEncounter.model.js';
import Allergy from '../models/allergy.model.js';
import Prescription from '../models/prescription.model.js';

dotenv.config();

// ─── HELPERS ────────────────────────────────────────────────────────────────

let created = 0;
let skipped = 0;

async function upsert(Model, uniqueQuery, data, label) {
  const exists = await Model.findOne(uniqueQuery);
  if (exists) {
    console.log(`  ⏭  ${label} already exists — skipping`);
    skipped++;
    return exists;
  }
  const doc = await Model.create(data);
  console.log(`  ✅ Created ${label}`);
  created++;
  return doc;
}

// ─── USERS ──────────────────────────────────────────────────────────────────

const USERS = [
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@hospital.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'approved',
  },
  {
    firstName: 'Kamal',
    lastName: 'Perera',
    email: 'dr.kamal@hospital.com',
    password: 'Doctor@123',
    role: 'doctor',
    status: 'approved',
    medicalLicenseId: 'MLID001',
    nic: '197512345678V',
    division: 'Cardiology',
  },
  {
    firstName: 'Nimal',
    lastName: 'Silva',
    email: 'dr.nimal@hospital.com',
    password: 'Doctor@123',
    role: 'doctor',
    status: 'approved',
    medicalLicenseId: 'MLID002',
    nic: '198023456789V',
    division: 'General Medicine',
  },
  {
    firstName: 'Sunethra',
    lastName: 'Fernando',
    email: 'dr.sunethra@hospital.com',
    password: 'Doctor@123',
    role: 'doctor',
    status: 'approved',
    medicalLicenseId: 'MLID003',
    nic: '197834567890V',
    division: 'Pediatrics',
  },
  {
    firstName: 'Kumari',
    lastName: 'Wijesinghe',
    email: 'nurse.kumari@hospital.com',
    password: 'Nurse@123',
    role: 'nurse',
    status: 'approved',
    nurId: 'NUR00001',
    nic: '199045678901V',
    division: 'OPD',
  },
  {
    firstName: 'Priya',
    lastName: 'Jayawardena',
    email: 'nurse.priya@hospital.com',
    password: 'Nurse@123',
    role: 'nurse',
    status: 'approved',
    nurId: 'NUR00002',
    nic: '199256789012V',
    division: 'Cardiology',
  },
  {
    firstName: 'Asanka',
    lastName: 'Bandara',
    email: 'lab.asanka@hospital.com',
    password: 'Lab@123',
    role: 'lab_assistant',
    status: 'approved',
    labId: 'LAB00001',
    nic: '198867890123V',
    division: 'Pathology',
  },
];

// ─── PRACTITIONERS (FHIR) ───────────────────────────────────────────────────

const PRACTITIONERS = [
  {
    role: 'doctor',
    medicalLicenseId: 'MLID001',
    firstName: 'Kamal',
    lastName: 'Perera',
    nic: '197512345678V',
    division: 'Cardiology',
    resource: {
      resourceType: 'Practitioner',
      id: 'MLID001',
      identifier: [{ system: 'https://mediease.health/medicalLicenseId', value: 'MLID001' }],
      name: [{ use: 'official', family: 'Perera', given: ['Kamal'] }],
      qualification: [{ code: { text: 'MBBS, MD (Cardiology)' } }],
      active: true,
    },
  },
  {
    role: 'doctor',
    medicalLicenseId: 'MLID002',
    firstName: 'Nimal',
    lastName: 'Silva',
    nic: '198023456789V',
    division: 'General Medicine',
    resource: {
      resourceType: 'Practitioner',
      id: 'MLID002',
      identifier: [{ system: 'https://mediease.health/medicalLicenseId', value: 'MLID002' }],
      name: [{ use: 'official', family: 'Silva', given: ['Nimal'] }],
      qualification: [{ code: { text: 'MBBS, MD (Internal Medicine)' } }],
      active: true,
    },
  },
  {
    role: 'doctor',
    medicalLicenseId: 'MLID003',
    firstName: 'Sunethra',
    lastName: 'Fernando',
    nic: '197834567890V',
    division: 'Pediatrics',
    resource: {
      resourceType: 'Practitioner',
      id: 'MLID003',
      identifier: [{ system: 'https://mediease.health/medicalLicenseId', value: 'MLID003' }],
      name: [{ use: 'official', family: 'Fernando', given: ['Sunethra'] }],
      qualification: [{ code: { text: 'MBBS, DCH, MD (Paediatrics)' } }],
      active: true,
    },
  },
  {
    role: 'nurse',
    nurId: 'NUR00001',
    firstName: 'Kumari',
    lastName: 'Wijesinghe',
    nic: '199045678901V',
    division: 'OPD',
    resource: {
      resourceType: 'Practitioner',
      id: 'NUR00001',
      identifier: [{ system: 'https://mediease.health/nurId', value: 'NUR00001' }],
      name: [{ use: 'official', family: 'Wijesinghe', given: ['Kumari'] }],
      active: true,
    },
  },
  {
    role: 'nurse',
    nurId: 'NUR00002',
    firstName: 'Priya',
    lastName: 'Jayawardena',
    nic: '199256789012V',
    division: 'Cardiology',
    resource: {
      resourceType: 'Practitioner',
      id: 'NUR00002',
      identifier: [{ system: 'https://mediease.health/nurId', value: 'NUR00002' }],
      name: [{ use: 'official', family: 'Jayawardena', given: ['Priya'] }],
      active: true,
    },
  },
];

// ─── PATIENTS ───────────────────────────────────────────────────────────────

const PATIENTS = [
  {
    phn: 'PH00001',
    nic: '198012345678V',
    firstName: 'Saman',
    lastName: 'Kumara',
    gender: 'male',
    birthDate: '1980-03-15',
    contactNumber: '+94712345678',
    address: '42 Galle Road, Colombo 03',
    height: 172,
    weight: 78,
    bloodPressure: '130/85',
    sugarLevel: 105,
    resource: {
      resourceType: 'Patient',
      id: 'PH00001',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00001' },
        { system: 'https://mediease.health/nic', value: '198012345678V' },
      ],
      name: [{ use: 'official', family: 'Kumara', given: ['Saman'] }],
      gender: 'male',
      birthDate: '1980-03-15',
      telecom: [{ system: 'phone', value: '+94712345678' }],
      address: [{ text: '42 Galle Road, Colombo 03' }],
    },
  },
  {
    phn: 'PH00002',
    nic: '199267890123V',
    firstName: 'Dilani',
    lastName: 'Perera',
    gender: 'female',
    birthDate: '1992-07-22',
    contactNumber: '+94776543210',
    address: '15 Kandy Road, Kiribathgoda',
    height: 158,
    weight: 55,
    bloodPressure: '118/76',
    sugarLevel: 92,
    resource: {
      resourceType: 'Patient',
      id: 'PH00002',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00002' },
        { system: 'https://mediease.health/nic', value: '199267890123V' },
      ],
      name: [{ use: 'official', family: 'Perera', given: ['Dilani'] }],
      gender: 'female',
      birthDate: '1992-07-22',
      telecom: [{ system: 'phone', value: '+94776543210' }],
      address: [{ text: '15 Kandy Road, Kiribathgoda' }],
    },
  },
  {
    phn: 'PH00003',
    nic: '196534567890V',
    firstName: 'Roshan',
    lastName: 'Fernando',
    gender: 'male',
    birthDate: '1965-11-08',
    contactNumber: '+94714567890',
    address: '7 Temple Road, Nugegoda',
    height: 168,
    weight: 85,
    bloodPressure: '145/92',
    sugarLevel: 148,
    resource: {
      resourceType: 'Patient',
      id: 'PH00003',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00003' },
        { system: 'https://mediease.health/nic', value: '196534567890V' },
      ],
      name: [{ use: 'official', family: 'Fernando', given: ['Roshan'] }],
      gender: 'male',
      birthDate: '1965-11-08',
      telecom: [{ system: 'phone', value: '+94714567890' }],
      address: [{ text: '7 Temple Road, Nugegoda' }],
    },
  },
  {
    phn: 'PH00004',
    nic: '195745678901V',
    firstName: 'Malini',
    lastName: 'Silva',
    gender: 'female',
    birthDate: '1957-04-30',
    contactNumber: '+94772345678',
    address: '22 Hospital Road, Kandy',
    height: 152,
    weight: 62,
    bloodPressure: '155/95',
    sugarLevel: 178,
    resource: {
      resourceType: 'Patient',
      id: 'PH00004',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00004' },
        { system: 'https://mediease.health/nic', value: '195745678901V' },
      ],
      name: [{ use: 'official', family: 'Silva', given: ['Malini'] }],
      gender: 'female',
      birthDate: '1957-04-30',
      telecom: [{ system: 'phone', value: '+94772345678' }],
      address: [{ text: '22 Hospital Road, Kandy' }],
    },
  },
  {
    phn: 'PH00005',
    nic: '199756789012V',
    firstName: 'Kasun',
    lastName: 'Jayawardena',
    gender: 'male',
    birthDate: '1997-09-14',
    contactNumber: '+94758901234',
    address: '88 Station Road, Gampaha',
    height: 178,
    weight: 72,
    bloodPressure: '120/78',
    sugarLevel: 88,
    resource: {
      resourceType: 'Patient',
      id: 'PH00005',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00005' },
        { system: 'https://mediease.health/nic', value: '199756789012V' },
      ],
      name: [{ use: 'official', family: 'Jayawardena', given: ['Kasun'] }],
      gender: 'male',
      birthDate: '1997-09-14',
      telecom: [{ system: 'phone', value: '+94758901234' }],
      address: [{ text: '88 Station Road, Gampaha' }],
    },
  },
  {
    phn: 'PH00006',
    nic: '198367890123V',
    firstName: 'Thilini',
    lastName: 'Bandara',
    gender: 'female',
    birthDate: '1983-12-03',
    contactNumber: '+94715678901',
    address: '3 Lake Drive, Battaramulla',
    height: 163,
    weight: 60,
    bloodPressure: '122/80',
    sugarLevel: 96,
    resource: {
      resourceType: 'Patient',
      id: 'PH00006',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00006' },
        { system: 'https://mediease.health/nic', value: '198367890123V' },
      ],
      name: [{ use: 'official', family: 'Bandara', given: ['Thilini'] }],
      gender: 'female',
      birthDate: '1983-12-03',
      telecom: [{ system: 'phone', value: '+94715678901' }],
      address: [{ text: '3 Lake Drive, Battaramulla' }],
    },
  },
  {
    phn: 'PH00007',
    nic: '197178901234V',
    firstName: 'Ajith',
    lastName: 'Wickramasinghe',
    gender: 'male',
    birthDate: '1971-06-18',
    contactNumber: '+94779012345',
    address: '56 Main Street, Moratuwa',
    height: 174,
    weight: 80,
    bloodPressure: '138/88',
    sugarLevel: 115,
    resource: {
      resourceType: 'Patient',
      id: 'PH00007',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00007' },
        { system: 'https://mediease.health/nic', value: '197178901234V' },
      ],
      name: [{ use: 'official', family: 'Wickramasinghe', given: ['Ajith'] }],
      gender: 'male',
      birthDate: '1971-06-18',
      telecom: [{ system: 'phone', value: '+94779012345' }],
      address: [{ text: '56 Main Street, Moratuwa' }],
    },
  },
  {
    phn: 'PH00008',
    nic: '198989012345V',
    firstName: 'Nadeeka',
    lastName: 'Ranasinghe',
    gender: 'female',
    birthDate: '1989-02-27',
    contactNumber: '+94712890123',
    address: '9 Flower Road, Colombo 07',
    height: 160,
    weight: 58,
    bloodPressure: '116/74',
    sugarLevel: 90,
    resource: {
      resourceType: 'Patient',
      id: 'PH00008',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00008' },
        { system: 'https://mediease.health/nic', value: '198989012345V' },
      ],
      name: [{ use: 'official', family: 'Ranasinghe', given: ['Nadeeka'] }],
      gender: 'female',
      birthDate: '1989-02-27',
      telecom: [{ system: 'phone', value: '+94712890123' }],
      address: [{ text: '9 Flower Road, Colombo 07' }],
    },
  },
  {
    phn: 'PH00009',
    nic: '196001234567V',
    firstName: 'Sunil',
    lastName: 'Dissanayake',
    gender: 'male',
    birthDate: '1960-05-12',
    contactNumber: '+94713456789',
    address: '18 Baseline Road, Colombo 09',
    height: 166,
    weight: 88,
    bloodPressure: '160/98',
    sugarLevel: 210,
    resource: {
      resourceType: 'Patient',
      id: 'PH00009',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00009' },
        { system: 'https://mediease.health/nic', value: '196001234567V' },
      ],
      name: [{ use: 'official', family: 'Dissanayake', given: ['Sunil'] }],
      gender: 'male',
      birthDate: '1960-05-12',
      telecom: [{ system: 'phone', value: '+94713456789' }],
      address: [{ text: '18 Baseline Road, Colombo 09' }],
    },
  },
  {
    phn: 'PH00010',
    nic: '200112345678V',
    firstName: 'Amaya',
    lastName: 'Senanayake',
    gender: 'female',
    birthDate: '2001-08-19',
    contactNumber: '+94771234567',
    address: '5 Rajagiriya Road, Rajagiriya',
    height: 162,
    weight: 52,
    bloodPressure: '112/70',
    sugarLevel: 86,
    resource: {
      resourceType: 'Patient',
      id: 'PH00010',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00010' },
        { system: 'https://mediease.health/nic', value: '200112345678V' },
      ],
      name: [{ use: 'official', family: 'Senanayake', given: ['Amaya'] }],
      gender: 'female',
      birthDate: '2001-08-19',
      telecom: [{ system: 'phone', value: '+94771234567' }],
      address: [{ text: '5 Rajagiriya Road, Rajagiriya' }],
    },
  },
  {
    phn: 'PH00011',
    nic: '197523456789V',
    firstName: 'Chaminda',
    lastName: 'Gunawardena',
    gender: 'male',
    birthDate: '1975-01-30',
    contactNumber: '+94759012345',
    address: '33 Dutugemunu Street, Dehiwala',
    height: 175,
    weight: 92,
    bloodPressure: '142/90',
    sugarLevel: 130,
    resource: {
      resourceType: 'Patient',
      id: 'PH00011',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00011' },
        { system: 'https://mediease.health/nic', value: '197523456789V' },
      ],
      name: [{ use: 'official', family: 'Gunawardena', given: ['Chaminda'] }],
      gender: 'male',
      birthDate: '1975-01-30',
      telecom: [{ system: 'phone', value: '+94759012345' }],
      address: [{ text: '33 Dutugemunu Street, Dehiwala' }],
    },
  },
  {
    phn: 'PH00012',
    nic: '199034567890V',
    firstName: 'Sanduni',
    lastName: 'Madushani',
    gender: 'female',
    birthDate: '1990-11-05',
    contactNumber: '+94778901234',
    address: '77 New Kandy Road, Malabe',
    height: 155,
    weight: 50,
    bloodPressure: '110/68',
    sugarLevel: 82,
    resource: {
      resourceType: 'Patient',
      id: 'PH00012',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00012' },
        { system: 'https://mediease.health/nic', value: '199034567890V' },
      ],
      name: [{ use: 'official', family: 'Madushani', given: ['Sanduni'] }],
      gender: 'female',
      birthDate: '1990-11-05',
      telecom: [{ system: 'phone', value: '+94778901234' }],
      address: [{ text: '77 New Kandy Road, Malabe' }],
    },
  },
  {
    phn: 'PH00013',
    nic: '195534567890V',
    firstName: 'Pradeep',
    lastName: 'Liyanage',
    gender: 'male',
    birthDate: '1955-07-22',
    contactNumber: '+94714890123',
    address: '2 Independence Avenue, Colombo 07',
    height: 169,
    weight: 70,
    bloodPressure: '135/85',
    sugarLevel: 120,
    resource: {
      resourceType: 'Patient',
      id: 'PH00013',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00013' },
        { system: 'https://mediease.health/nic', value: '195534567890V' },
      ],
      name: [{ use: 'official', family: 'Liyanage', given: ['Pradeep'] }],
      gender: 'male',
      birthDate: '1955-07-22',
      telecom: [{ system: 'phone', value: '+94714890123' }],
      address: [{ text: '2 Independence Avenue, Colombo 07' }],
    },
  },
  {
    phn: 'PH00014',
    nic: '198545678901V',
    firstName: 'Iresha',
    lastName: 'Pathirana',
    gender: 'female',
    birthDate: '1985-03-17',
    contactNumber: '+94770123456',
    address: '14 Elvitigala Mawatha, Narahenpita',
    height: 164,
    weight: 64,
    bloodPressure: '124/80',
    sugarLevel: 98,
    resource: {
      resourceType: 'Patient',
      id: 'PH00014',
      identifier: [
        { system: 'https://mediease.health/phn', value: 'PH00014' },
        { system: 'https://mediease.health/nic', value: '198545678901V' },
      ],
      name: [{ use: 'official', family: 'Pathirana', given: ['Iresha'] }],
      gender: 'female',
      birthDate: '1985-03-17',
      telecom: [{ system: 'phone', value: '+94770123456' }],
      address: [{ text: '14 Elvitigala Mawatha, Narahenpita' }],
    },
  },
];

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────

const APPOINTMENTS = [
  {
    apid: 'AP00001',
    patientPhn: 'PH00001',
    doctorLicense: 'MLID001',
    nurseId: 'NUR00001',
    roomNo: '101',
    type: 'OPD',
    status: 'completed',
    appointmentDate: new Date('2026-02-10T09:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00001',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00001', display: 'Saman Kumara' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID001', display: 'Dr. Kamal Perera' }, status: 'accepted' },
      ],
      start: '2026-02-10T09:00:00Z',
    },
  },
  {
    apid: 'AP00002',
    patientPhn: 'PH00002',
    doctorLicense: 'MLID002',
    nurseId: 'NUR00001',
    roomNo: '205',
    type: 'OPD',
    status: 'completed',
    appointmentDate: new Date('2026-02-12T10:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00002',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00002', display: 'Dilani Perera' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID002', display: 'Dr. Nimal Silva' }, status: 'accepted' },
      ],
      start: '2026-02-12T10:30:00Z',
    },
  },
  {
    apid: 'AP00003',
    patientPhn: 'PH00003',
    doctorLicense: 'MLID001',
    nurseId: 'NUR00002',
    roomNo: '101',
    type: 'IPD',
    status: 'completed',
    appointmentDate: new Date('2026-02-14T08:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00003',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00003', display: 'Roshan Fernando' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID001', display: 'Dr. Kamal Perera' }, status: 'accepted' },
      ],
      start: '2026-02-14T08:00:00Z',
    },
  },
  {
    apid: 'AP00004',
    patientPhn: 'PH00004',
    doctorLicense: 'MLID002',
    nurseId: 'NUR00001',
    roomNo: '207',
    type: 'Clinic',
    status: 'booked',
    appointmentDate: new Date('2026-03-10T11:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00004',
      status: 'booked',
      participant: [
        { actor: { reference: 'Patient/PH00004', display: 'Malini Silva' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID002', display: 'Dr. Nimal Silva' }, status: 'accepted' },
      ],
      start: '2026-03-10T11:00:00Z',
    },
  },
  {
    apid: 'AP00005',
    patientPhn: 'PH00005',
    doctorLicense: 'MLID003',
    nurseId: 'NUR00002',
    roomNo: '310',
    type: 'OPD',
    status: 'pending',
    appointmentDate: new Date('2026-03-12T14:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00005',
      status: 'pending',
      participant: [
        { actor: { reference: 'Patient/PH00005', display: 'Kasun Jayawardena' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID003', display: 'Dr. Sunethra Fernando' }, status: 'accepted' },
      ],
      start: '2026-03-12T14:00:00Z',
    },
  },
  {
    apid: 'AP00006',
    patientPhn: 'PH00006',
    doctorLicense: 'MLID001',
    nurseId: 'NUR00001',
    roomNo: '102',
    type: 'OPD',
    status: 'booked',
    appointmentDate: new Date('2026-03-15T09:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00006',
      status: 'booked',
      participant: [
        { actor: { reference: 'Patient/PH00006', display: 'Thilini Bandara' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID001', display: 'Dr. Kamal Perera' }, status: 'accepted' },
      ],
      start: '2026-03-15T09:30:00Z',
    },
  },
  {
    apid: 'AP00007',
    patientPhn: 'PH00007',
    doctorLicense: 'MLID002',
    nurseId: 'NUR00002',
    roomNo: '206',
    type: 'OPD',
    status: 'completed',
    appointmentDate: new Date('2026-02-20T10:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00007',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00007', display: 'Ajith Wickramasinghe' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID002', display: 'Dr. Nimal Silva' }, status: 'accepted' },
      ],
      start: '2026-02-20T10:00:00Z',
    },
  },
  {
    apid: 'AP00008',
    patientPhn: 'PH00008',
    doctorLicense: 'MLID003',
    nurseId: 'NUR00001',
    roomNo: '311',
    type: 'Clinic',
    status: 'pending',
    appointmentDate: new Date('2026-03-18T13:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00008',
      status: 'pending',
      participant: [
        { actor: { reference: 'Patient/PH00008', display: 'Nadeeka Ranasinghe' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID003', display: 'Dr. Sunethra Fernando' }, status: 'accepted' },
      ],
      start: '2026-03-18T13:00:00Z',
    },
  },
  {
    apid: 'AP00009',
    patientPhn: 'PH00009',
    doctorLicense: 'MLID001',
    nurseId: 'NUR00002',
    roomNo: '103',
    type: 'IPD',
    status: 'completed',
    appointmentDate: new Date('2026-02-25T08:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00009',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00009', display: 'Sunil Dissanayake' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID001', display: 'Dr. Kamal Perera' }, status: 'accepted' },
      ],
      start: '2026-02-25T08:30:00Z',
    },
  },
  {
    apid: 'AP00010',
    patientPhn: 'PH00010',
    doctorLicense: 'MLID003',
    nurseId: 'NUR00001',
    roomNo: '312',
    type: 'OPD',
    status: 'booked',
    appointmentDate: new Date('2026-03-20T10:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00010',
      status: 'booked',
      participant: [
        { actor: { reference: 'Patient/PH00010', display: 'Amaya Senanayake' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID003', display: 'Dr. Sunethra Fernando' }, status: 'accepted' },
      ],
      start: '2026-03-20T10:00:00Z',
    },
  },
  {
    apid: 'AP00011',
    patientPhn: 'PH00011',
    doctorLicense: 'MLID002',
    nurseId: 'NUR00002',
    roomNo: '208',
    type: 'Clinic',
    status: 'completed',
    appointmentDate: new Date('2026-02-28T11:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00011',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00011', display: 'Chaminda Gunawardena' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID002', display: 'Dr. Nimal Silva' }, status: 'accepted' },
      ],
      start: '2026-02-28T11:30:00Z',
    },
  },
  {
    apid: 'AP00012',
    patientPhn: 'PH00012',
    doctorLicense: 'MLID002',
    nurseId: 'NUR00001',
    roomNo: '209',
    type: 'OPD',
    status: 'pending',
    appointmentDate: new Date('2026-03-22T09:00:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00012',
      status: 'pending',
      participant: [
        { actor: { reference: 'Patient/PH00012', display: 'Sanduni Madushani' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID002', display: 'Dr. Nimal Silva' }, status: 'accepted' },
      ],
      start: '2026-03-22T09:00:00Z',
    },
  },
  {
    apid: 'AP00013',
    patientPhn: 'PH00013',
    doctorLicense: 'MLID001',
    nurseId: 'NUR00002',
    roomNo: '104',
    type: 'IPD',
    status: 'completed',
    appointmentDate: new Date('2026-03-01T07:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00013',
      status: 'fulfilled',
      participant: [
        { actor: { reference: 'Patient/PH00013', display: 'Pradeep Liyanage' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID001', display: 'Dr. Kamal Perera' }, status: 'accepted' },
      ],
      start: '2026-03-01T07:30:00Z',
    },
  },
  {
    apid: 'AP00014',
    patientPhn: 'PH00014',
    doctorLicense: 'MLID003',
    nurseId: 'NUR00001',
    roomNo: '313',
    type: 'OPD',
    status: 'booked',
    appointmentDate: new Date('2026-03-25T14:30:00Z'),
    resource: {
      resourceType: 'Appointment',
      id: 'AP00014',
      status: 'booked',
      participant: [
        { actor: { reference: 'Patient/PH00014', display: 'Iresha Pathirana' }, status: 'accepted' },
        { actor: { reference: 'Practitioner/MLID003', display: 'Dr. Sunethra Fernando' }, status: 'accepted' },
      ],
      start: '2026-03-25T14:30:00Z',
    },
  },
];

// ─── ENCOUNTERS ──────────────────────────────────────────────────────────────

function makeEncResource(encId, phn, licenseId) {
  return {
    resourceType: 'Encounter',
    id: encId,
    status: 'finished',
    subject: { reference: `Patient/${phn}` },
    participant: [{ individual: { reference: `Practitioner/${licenseId}` } }],
  };
}

const ENCOUNTERS = [
  {
    encId: 'ENC00001',
    patientPhn: 'PH00001',
    doctorLicense: 'MLID001',
    apid: 'AP00001',
    status: 'finished',
    complaint: 'Chest pain and shortness of breath on exertion',
    weight: 78,
    notes: 'Patient reports intermittent chest tightness for 2 weeks. ECG ordered.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00001', 'PH00001', 'MLID001'),
  },
  {
    encId: 'ENC00002',
    patientPhn: 'PH00002',
    doctorLicense: 'MLID002',
    apid: 'AP00002',
    status: 'finished',
    complaint: 'Fever, headache, and body aches for 3 days',
    weight: 55,
    notes: 'Viral fever. Advised rest and hydration.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00002', 'PH00002', 'MLID002'),
  },
  {
    encId: 'ENC00003',
    patientPhn: 'PH00003',
    doctorLicense: 'MLID001',
    apid: 'AP00003',
    status: 'finished',
    complaint: 'Uncontrolled blood pressure and blurred vision',
    weight: 85,
    notes: 'BP 168/104 on admission. Medication adjusted. Ophthalmology referral.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00003', 'PH00003', 'MLID001'),
  },
  {
    encId: 'ENC00004',
    patientPhn: 'PH00004',
    doctorLicense: 'MLID002',
    status: 'in-progress',
    complaint: 'Increased thirst, frequent urination, and fatigue',
    weight: 62,
    notes: 'Fasting glucose 178 mg/dL. Diabetes review scheduled.',
    hasPrescription: false,
    isActive: true,
    resource: makeEncResource('ENC00004', 'PH00004', 'MLID002'),
  },
  {
    encId: 'ENC00005',
    patientPhn: 'PH00007',
    doctorLicense: 'MLID002',
    apid: 'AP00007',
    status: 'finished',
    complaint: 'Lower back pain radiating to left leg',
    weight: 80,
    notes: 'Lumbar radiculopathy suspected. MRI ordered. Physiotherapy advised.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00005', 'PH00007', 'MLID002'),
  },
  {
    encId: 'ENC00006',
    patientPhn: 'PH00001',
    doctorLicense: 'MLID001',
    status: 'finished',
    complaint: 'Follow-up: hypertension management',
    weight: 77,
    notes: 'BP well controlled at 128/82. Continue current medications.',
    hasPrescription: false,
    isActive: false,
    resource: makeEncResource('ENC00006', 'PH00001', 'MLID001'),
  },
  {
    encId: 'ENC00007',
    patientPhn: 'PH00009',
    doctorLicense: 'MLID001',
    apid: 'AP00009',
    status: 'finished',
    complaint: 'Severe headache, dizziness, and blurred vision',
    weight: 88,
    notes: 'Hypertensive crisis. BP 185/112 on arrival. IV labetalol administered. Admitted for monitoring.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00007', 'PH00009', 'MLID001'),
  },
  {
    encId: 'ENC00008',
    patientPhn: 'PH00011',
    doctorLicense: 'MLID002',
    apid: 'AP00011',
    status: 'finished',
    complaint: 'Persistent cough, wheezing, and chest tightness',
    weight: 92,
    notes: 'Moderate asthma exacerbation. Peak flow 62% predicted. Nebulisation given. Salbutamol inhaler prescribed.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00008', 'PH00011', 'MLID002'),
  },
  {
    encId: 'ENC00009',
    patientPhn: 'PH00013',
    doctorLicense: 'MLID001',
    apid: 'AP00013',
    status: 'finished',
    complaint: 'Acute chest pain radiating to left arm, diaphoresis',
    weight: 70,
    notes: 'ACS ruled out via serial troponins and ECG. Stable angina suspected. Cardiology follow-up arranged.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00009', 'PH00013', 'MLID001'),
  },
  {
    encId: 'ENC00010',
    patientPhn: 'PH00004',
    doctorLicense: 'MLID002',
    status: 'finished',
    complaint: 'Joint pain and swelling in both knees',
    weight: 63,
    notes: 'Osteoarthritis of bilateral knees. X-ray confirms grade II changes. Physiotherapy referral. Weight loss advised.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00010', 'PH00004', 'MLID002'),
  },
  {
    encId: 'ENC00011',
    patientPhn: 'PH00006',
    doctorLicense: 'MLID001',
    apid: 'AP00006',
    status: 'finished',
    complaint: 'Palpitations and irregular heartbeat',
    weight: 60,
    notes: 'Paroxysmal AF detected on ECG. Rate controlled with medication. Anticoagulation started. Cardiology referral.',
    hasPrescription: true,
    isActive: false,
    resource: makeEncResource('ENC00011', 'PH00006', 'MLID001'),
  },
  {
    encId: 'ENC00012',
    patientPhn: 'PH00008',
    doctorLicense: 'MLID003',
    status: 'in-progress',
    complaint: 'Nausea, vomiting, and abdominal pain for 2 days',
    weight: 57,
    notes: 'Acute gastroenteritis likely. Rehydration started. Stool culture sent.',
    hasPrescription: false,
    isActive: true,
    resource: makeEncResource('ENC00012', 'PH00008', 'MLID003'),
  },
];

// ─── ALLERGIES ───────────────────────────────────────────────────────────────

function makeAllergyResource(phn, category, substance, criticality, reaction) {
  return {
    resourceType: 'AllergyIntolerance',
    patient: { reference: `Patient/${phn}` },
    category: [category],
    criticality,
    code: { text: substance },
    reaction: [{ manifestation: [{ text: reaction }] }],
  };
}

const ALLERGIES = [
  {
    patientPhn: 'PH00001',
    category: 'medication',
    criticality: 'high',
    substance: 'Penicillin',
    reaction: 'Anaphylaxis — severe systemic reaction within 30 minutes of exposure',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00001', 'medication', 'Penicillin', 'high', 'Anaphylaxis'),
  },
  {
    patientPhn: 'PH00001',
    category: 'food',
    criticality: 'low',
    substance: 'Shellfish',
    reaction: 'Urticaria and mild oedema',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00001', 'food', 'Shellfish', 'low', 'Urticaria'),
  },
  {
    patientPhn: 'PH00003',
    category: 'medication',
    criticality: 'high',
    substance: 'Aspirin',
    reaction: 'Bronchospasm and worsening of asthma',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00003', 'medication', 'Aspirin', 'high', 'Bronchospasm'),
  },
  {
    patientPhn: 'PH00005',
    category: 'medication',
    criticality: 'low',
    substance: 'Sulfonamides',
    reaction: 'Skin rash and mild photosensitivity',
    recorder: 'MLID003',
    fhirResource: makeAllergyResource('PH00005', 'medication', 'Sulfonamides', 'low', 'Skin rash'),
  },
  {
    patientPhn: 'PH00007',
    category: 'food',
    criticality: 'low',
    substance: 'Peanuts',
    reaction: 'Oral itching and mild gastrointestinal upset',
    recorder: 'MLID002',
    fhirResource: makeAllergyResource('PH00007', 'food', 'Peanuts', 'low', 'Oral itching'),
  },
  {
    patientPhn: 'PH00009',
    category: 'medication',
    criticality: 'high',
    substance: 'Metformin',
    reaction: 'Severe lactic acidosis — hospitalisation required',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00009', 'medication', 'Metformin', 'high', 'Lactic acidosis'),
  },
  {
    patientPhn: 'PH00011',
    category: 'medication',
    criticality: 'high',
    substance: 'Beta-blockers',
    reaction: 'Severe bronchospasm — triggers acute asthma attack',
    recorder: 'MLID002',
    fhirResource: makeAllergyResource('PH00011', 'medication', 'Beta-blockers', 'high', 'Bronchospasm'),
  },
  {
    patientPhn: 'PH00013',
    category: 'medication',
    criticality: 'low',
    substance: 'Codeine',
    reaction: 'Severe nausea and vomiting',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00013', 'medication', 'Codeine', 'low', 'Nausea and vomiting'),
  },
  {
    patientPhn: 'PH00004',
    category: 'food',
    criticality: 'low',
    substance: 'Dairy products',
    reaction: 'Bloating and diarrhoea (lactose intolerance)',
    recorder: 'MLID002',
    fhirResource: makeAllergyResource('PH00004', 'food', 'Dairy products', 'low', 'Bloating and diarrhoea'),
  },
  {
    patientPhn: 'PH00006',
    category: 'medication',
    criticality: 'high',
    substance: 'Warfarin',
    reaction: 'Haematuria and prolonged bleeding — INR >8',
    recorder: 'MLID001',
    fhirResource: makeAllergyResource('PH00006', 'medication', 'Warfarin', 'high', 'Haematuria and prolonged bleeding'),
  },
  // ─── Amoxicillin allergy (high criticality, medication category) ───────────
  // IMPORTANT: must be category='medication' so the backend fetches it during
  // prescription validation (aiPrescriptionValidation.service.js filters by
  // category:'medication' only). This triggers both Strategy 1 (substring match)
  // and Strategy 2 (Beta-lactam / Antibiotic class match) in allergy_checker.py.
  {
    patientPhn: 'PH00005',
    category: 'medication',
    criticality: 'high',
    substance: 'Amoxicillin',
    reaction: 'Anaphylaxis — severe urticaria, angioedema, and hypotension within minutes of first dose',
    recorder: 'MLID003',
    note: 'Cross-reactive to all Penicillins and potentially Cephalosporins. Avoid all Beta-lactam antibiotics.',
    fhirResource: makeAllergyResource('PH00005', 'medication', 'Amoxicillin', 'high', 'Anaphylaxis — urticaria, angioedema, hypotension'),
  },
  {
    patientPhn: 'PH00002',
    category: 'medication',
    criticality: 'high',
    substance: 'Amoxicillin',
    reaction: 'Severe rash (Steven-Johnson Syndrome suspected) — hospitalised',
    recorder: 'MLID002',
    note: 'Avoid all Penicillin-class antibiotics. Use macrolides or fluoroquinolones as alternatives.',
    fhirResource: makeAllergyResource('PH00002', 'medication', 'Amoxicillin', 'high', 'Steven-Johnson Syndrome'),
  },
];

// ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────

function makePrescriptionResource(prescriptionId, phn, licenseId, medicines) {
  return {
    resourceType: 'MedicationRequest',
    id: prescriptionId,
    status: 'completed',
    subject: { reference: `Patient/${phn}` },
    requester: { reference: `Practitioner/${licenseId}` },
    dosageInstruction: medicines.map((m) => ({ text: `${m.medication} ${m.dose} ${m.frequency}` })),
  };
}

const PRESCRIPTIONS = [
  {
    prescriptionId: 'PR00001',
    subject: 'PH00001',
    requester: 'MLID001',
    authoredOn: '2026-02-10',
    status: 'Completed',
    visitType: 'OPD',
    complaint: 'Chest pain and shortness of breath on exertion',
    dosageInstruction: [
      { medication: 'Amlodipine', dose: '5mg', frequency: 'Once daily', period: '30 days', doseComment: 'Take in the morning' },
      { medication: 'Aspirin', dose: '75mg', frequency: 'Once daily', period: '30 days', doseComment: 'Take after food' },
      { medication: 'Atorvastatin', dose: '20mg', frequency: 'Once at night', period: '30 days', doseComment: '' },
    ],
    resource: makePrescriptionResource('PR00001', 'PH00001', 'MLID001', [
      { medication: 'Amlodipine', dose: '5mg', frequency: 'Once daily' },
      { medication: 'Aspirin', dose: '75mg', frequency: 'Once daily' },
      { medication: 'Atorvastatin', dose: '20mg', frequency: 'Once at night' },
    ]),
  },
  {
    prescriptionId: 'PR00002',
    subject: 'PH00002',
    requester: 'MLID002',
    authoredOn: '2026-02-12',
    status: 'Completed',
    visitType: 'OPD',
    complaint: 'Fever, headache, and body aches',
    dosageInstruction: [
      { medication: 'Paracetamol', dose: '500mg', frequency: 'Three times daily', period: '5 days', doseComment: 'Take after meals' },
      { medication: 'Cetirizine', dose: '10mg', frequency: 'Once at night', period: '5 days', doseComment: 'May cause drowsiness' },
    ],
    resource: makePrescriptionResource('PR00002', 'PH00002', 'MLID002', [
      { medication: 'Paracetamol', dose: '500mg', frequency: 'Three times daily' },
      { medication: 'Cetirizine', dose: '10mg', frequency: 'Once at night' },
    ]),
  },
  {
    prescriptionId: 'PR00003',
    subject: 'PH00003',
    requester: 'MLID001',
    authoredOn: '2026-02-14',
    status: 'Completed',
    visitType: 'IPD',
    complaint: 'Uncontrolled hypertension',
    dosageInstruction: [
      { medication: 'Amlodipine', dose: '10mg', frequency: 'Once daily', period: '30 days', doseComment: '' },
      { medication: 'Losartan', dose: '50mg', frequency: 'Once daily', period: '30 days', doseComment: 'Monitor potassium levels' },
      { medication: 'Furosemide', dose: '40mg', frequency: 'Once in the morning', period: '14 days', doseComment: 'Monitor electrolytes' },
    ],
    resource: makePrescriptionResource('PR00003', 'PH00003', 'MLID001', [
      { medication: 'Amlodipine', dose: '10mg', frequency: 'Once daily' },
      { medication: 'Losartan', dose: '50mg', frequency: 'Once daily' },
      { medication: 'Furosemide', dose: '40mg', frequency: 'Once in the morning' },
    ]),
  },
  {
    prescriptionId: 'PR00004',
    subject: 'PH00007',
    requester: 'MLID002',
    authoredOn: '2026-02-20',
    status: 'Completed',
    visitType: 'OPD',
    complaint: 'Lower back pain',
    dosageInstruction: [
      { medication: 'Ibuprofen', dose: '400mg', frequency: 'Three times daily', period: '7 days', doseComment: 'Take with food' },
      { medication: 'Diazepam', dose: '2mg', frequency: 'Twice daily', period: '5 days', doseComment: 'Do not drive. Avoid alcohol.' },
    ],
    resource: makePrescriptionResource('PR00004', 'PH00007', 'MLID002', [
      { medication: 'Ibuprofen', dose: '400mg', frequency: 'Three times daily' },
      { medication: 'Diazepam', dose: '2mg', frequency: 'Twice daily' },
    ]),
  },
  {
    prescriptionId: 'PR00005',
    subject: 'PH00009',
    requester: 'MLID001',
    authoredOn: '2026-02-25',
    status: 'Completed',
    visitType: 'IPD',
    complaint: 'Hypertensive crisis',
    dosageInstruction: [
      { medication: 'Amlodipine', dose: '10mg', frequency: 'Once daily', period: '30 days', doseComment: '' },
      { medication: 'Losartan', dose: '100mg', frequency: 'Once daily', period: '30 days', doseComment: 'Monitor kidney function and potassium' },
      { medication: 'Indapamide', dose: '1.5mg', frequency: 'Once daily in the morning', period: '30 days', doseComment: 'Monitor electrolytes' },
    ],
    resource: makePrescriptionResource('PR00005', 'PH00009', 'MLID001', [
      { medication: 'Amlodipine', dose: '10mg', frequency: 'Once daily' },
      { medication: 'Losartan', dose: '100mg', frequency: 'Once daily' },
      { medication: 'Indapamide', dose: '1.5mg', frequency: 'Once daily' },
    ]),
  },
  {
    prescriptionId: 'PR00006',
    subject: 'PH00011',
    requester: 'MLID002',
    authoredOn: '2026-02-28',
    status: 'Completed',
    visitType: 'Clinic',
    complaint: 'Asthma exacerbation',
    dosageInstruction: [
      { medication: 'Salbutamol', dose: '100mcg', frequency: 'Two puffs as needed (max 4 times/day)', period: 'Ongoing', doseComment: 'Use before exercise' },
      { medication: 'Fluticasone', dose: '250mcg', frequency: 'Two puffs twice daily', period: '30 days', doseComment: 'Rinse mouth after use' },
      { medication: 'Prednisolone', dose: '30mg', frequency: 'Once daily in the morning', period: '5 days', doseComment: 'Take with food. Do not stop abruptly.' },
    ],
    resource: makePrescriptionResource('PR00006', 'PH00011', 'MLID002', [
      { medication: 'Salbutamol', dose: '100mcg', frequency: 'As needed' },
      { medication: 'Fluticasone', dose: '250mcg', frequency: 'Twice daily' },
      { medication: 'Prednisolone', dose: '30mg', frequency: 'Once daily' },
    ]),
  },
  {
    prescriptionId: 'PR00007',
    subject: 'PH00013',
    requester: 'MLID001',
    authoredOn: '2026-03-01',
    status: 'Completed',
    visitType: 'IPD',
    complaint: 'Stable angina',
    dosageInstruction: [
      { medication: 'Isosorbide Mononitrate', dose: '20mg', frequency: 'Twice daily', period: '30 days', doseComment: 'Take first dose in morning. Avoid late evening dose.' },
      { medication: 'Atorvastatin', dose: '40mg', frequency: 'Once at night', period: '30 days', doseComment: 'Report muscle pain' },
      { medication: 'Clopidogrel', dose: '75mg', frequency: 'Once daily', period: '30 days', doseComment: 'Take with Aspirin unless contraindicated' },
    ],
    resource: makePrescriptionResource('PR00007', 'PH00013', 'MLID001', [
      { medication: 'Isosorbide Mononitrate', dose: '20mg', frequency: 'Twice daily' },
      { medication: 'Atorvastatin', dose: '40mg', frequency: 'Once at night' },
      { medication: 'Clopidogrel', dose: '75mg', frequency: 'Once daily' },
    ]),
  },
  {
    prescriptionId: 'PR00008',
    subject: 'PH00004',
    requester: 'MLID002',
    authoredOn: '2026-02-18',
    status: 'Completed',
    visitType: 'OPD',
    complaint: 'Knee osteoarthritis and diabetes',
    dosageInstruction: [
      { medication: 'Paracetamol', dose: '1g', frequency: 'Three times daily', period: '14 days', doseComment: 'Do not exceed 4g/day' },
      { medication: 'Glucosamine', dose: '1500mg', frequency: 'Once daily', period: '90 days', doseComment: 'May take 4-8 weeks for effect' },
      { medication: 'Metformin', dose: '500mg', frequency: 'Twice daily with meals', period: '30 days', doseComment: 'Monitor blood glucose' },
    ],
    resource: makePrescriptionResource('PR00008', 'PH00004', 'MLID002', [
      { medication: 'Paracetamol', dose: '1g', frequency: 'Three times daily' },
      { medication: 'Glucosamine', dose: '1500mg', frequency: 'Once daily' },
      { medication: 'Metformin', dose: '500mg', frequency: 'Twice daily' },
    ]),
  },
  {
    prescriptionId: 'PR00009',
    subject: 'PH00006',
    requester: 'MLID001',
    authoredOn: '2026-03-15',
    status: 'Pending',
    visitType: 'OPD',
    complaint: 'Atrial fibrillation',
    dosageInstruction: [
      { medication: 'Digoxin', dose: '0.125mg', frequency: 'Once daily', period: '30 days', doseComment: 'Monitor heart rate and digoxin levels' },
      { medication: 'Apixaban', dose: '5mg', frequency: 'Twice daily', period: '30 days', doseComment: 'Do not stop without doctor advice. Watch for bleeding.' },
    ],
    resource: makePrescriptionResource('PR00009', 'PH00006', 'MLID001', [
      { medication: 'Digoxin', dose: '0.125mg', frequency: 'Once daily' },
      { medication: 'Apixaban', dose: '5mg', frequency: 'Twice daily' },
    ]),
  },
];

// ─── MAIN SEED FUNCTION ──────────────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();

    // ── Users
    console.log('\n👥 Seeding Users…');
    for (const u of USERS) {
      // Build a unique query that also checks role-specific IDs to avoid
      // duplicate key conflicts when rerunning on a partially-seeded DB.
      let userQuery = { email: u.email };
      if (u.medicalLicenseId) userQuery = { $or: [{ email: u.email }, { medicalLicenseId: u.medicalLicenseId }] };
      else if (u.nurId) userQuery = { $or: [{ email: u.email }, { nurId: u.nurId }] };
      else if (u.labId) userQuery = { $or: [{ email: u.email }, { labId: u.labId }] };
      await upsert(User, userQuery, u, `${u.role} — ${u.email}`);
    }

    // ── FHIRPractitioners
    console.log('\n🩺 Seeding Practitioners…');
    for (const p of PRACTITIONERS) {
      const uniqueQ = p.role === 'doctor'
        ? { medicalLicenseId: p.medicalLicenseId }
        : { nurId: p.nurId };
      await upsert(FHIRPractitioner, uniqueQ, p, `${p.role} — ${p.firstName} ${p.lastName}`);
    }

    // ── Patients
    console.log('\n🧑‍⚕️ Seeding Patients…');
    for (const p of PATIENTS) {
      await upsert(FHIRPatient, { phn: p.phn }, p, `${p.phn} — ${p.firstName} ${p.lastName}`);
    }

    // ── Appointments
    console.log('\n📅 Seeding Appointments…');
    for (const a of APPOINTMENTS) {
      await upsert(FHIRAppointment, { apid: a.apid }, a, `${a.apid} — ${a.patientPhn}`);
    }

    // ── Encounters
    console.log('\n🏥 Seeding Encounters…');
    for (const e of ENCOUNTERS) {
      await upsert(FHIREncounter, { encId: e.encId }, e, `${e.encId} — ${e.patientPhn}`);
    }

    // ── Allergies
    console.log('\n💊 Seeding Allergies…');
    for (const a of ALLERGIES) {
      await upsert(
        Allergy,
        { patientPhn: a.patientPhn, substance: a.substance },
        a,
        `${a.patientPhn} — ${a.substance}`,
      );
    }

    // ── Prescriptions
    console.log('\n📋 Seeding Prescriptions…');
    for (const p of PRESCRIPTIONS) {
      await upsert(Prescription, { prescriptionId: p.prescriptionId }, p, `${p.prescriptionId} — ${p.subject}`);
    }

    // ── Summary
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`✅ Seed complete — ${created} created, ${skipped} skipped`);
    console.log(`${'─'.repeat(50)}\n`);

    console.log('📋 Login Credentials:');
    console.log('  Admin:        admin@hospital.com       / Admin@123');
    console.log('  Doctor 1:     dr.kamal@hospital.com    / Doctor@123  (MLID001)');
    console.log('  Doctor 2:     dr.nimal@hospital.com    / Doctor@123  (MLID002)');
    console.log('  Doctor 3:     dr.sunethra@hospital.com / Doctor@123  (MLID003)');
    console.log('  Nurse 1:      nurse.kumari@hospital.com / Nurse@123  (NUR00001)');
    console.log('  Nurse 2:      nurse.priya@hospital.com  / Nurse@123  (NUR00002)');
    console.log('  Lab Tech:     lab.asanka@hospital.com   / Lab@123    (LAB00001)\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

seed();
