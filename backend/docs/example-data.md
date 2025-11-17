# Example Data for Testing

# Example Data for Testing

This document provides complete test data for all scenarios in the **MediEase Backend**.

## 1. Admin Login

```json
{
  "email": "admin@hospital.com",
  "password": "Admin@123"
}
```

## 2. Register Doctor

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@hospital.com",
  "password": "Doctor@123",
  "confirmPassword": "Doctor@123",
  "role": "doctor",
  "medicalLicenseId": "MED12345",
  "nic": "199012345678",
  "division": "Cardiology"
}
```

## 3. Register Another Doctor

```json
{
  "firstName": "Emily",
  "lastName": "Johnson",
  "email": "emily.johnson@hospital.com",
  "password": "Doctor@456",
  "confirmPassword": "Doctor@456",
  "role": "doctor",
  "medicalLicenseId": "MED67890",
  "nic": "198512345679",
  "division": "Pediatrics"
}
```

## 4. Register Nurse

```json
{
  "firstName": "Sarah",
  "lastName": "Williams",
  "email": "sarah.williams@hospital.com",
  "password": "Nurse@123",
  "confirmPassword": "Nurse@123",
  "role": "nurse",
  "nic": "198512345678"
}
```

## 5. Register Another Nurse

```json
{
  "firstName": "Michael",
  "lastName": "Brown",
  "email": "michael.brown@hospital.com",
  "password": "Nurse@456",
  "confirmPassword": "Nurse@456",
  "role": "nurse",
  "nic": "199212345679"
}
```

## 6. Create Patient #1

```json
{
  "nic": "987654321V",
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "female",
  "contactNumber": "+94771234567",
  "dob": "1990-05-15",
  "address": "123 Main Street, Colombo 03, Sri Lanka",
  "guardianNIC": "123456789V",
  "guardianName": "Robert Smith",
  "height": 165,
  "weight": 60,
  "bloodPressure": "120/80",
  "sugarLevel": 95
}
```

## 7. Create Patient #2

```json
{
  "nic": "198512345670",
  "firstName": "David",
  "lastName": "Lee",
  "gender": "male",
  "contactNumber": "+94777654321",
  "dob": "1985-08-22",
  "address": "456 Galle Road, Colombo 06, Sri Lanka",
  "guardianNIC": "196012345671",
  "guardianName": "Mary Lee",
  "height": 175,
  "weight": 75,
  "bloodPressure": "130/85",
  "sugarLevel": 102
}
```

## 8. Create Patient #3

```json
{
  "nic": "200212345672",
  "firstName": "Emma",
  "lastName": "Wilson",
  "gender": "female",
  "contactNumber": "+94712345678",
  "dob": "2002-03-10",
  "address": "789 Duplication Road, Colombo 04, Sri Lanka",
  "guardianNIC": "197512345673",
  "guardianName": "James Wilson",
  "height": 160,
  "weight": 55,
  "bloodPressure": "115/75"
}
```

## 9. Create Patient #4 (Pediatric)

```json
{
  "nic": "201512345674",
  "firstName": "Oliver",
  "lastName": "Martinez",
  "gender": "male",
  "contactNumber": "+94765432109",
  "dob": "2015-11-05",
  "address": "321 Reid Avenue, Colombo 07, Sri Lanka",
  "guardianNIC": "198512345675",
  "guardianName": "Sophia Martinez",
  "height": 130,
  "weight": 35
}
```

## 10. Create Patient #5

```json
{
  "nic": "197012345676",
  "firstName": "William",
  "lastName": "Anderson",
  "gender": "male",
  "contactNumber": "+94723456789",
  "dob": "1970-06-18",
  "address": "567 Baseline Road, Colombo 09, Sri Lanka",
  "guardianNIC": "194512345677",
  "guardianName": "Elizabeth Anderson",
  "height": 170,
  "weight": 80,
  "bloodPressure": "140/90",
  "sugarLevel": 115
}
```

## 11. Update Patient (Example)

```json
{
  "contactNumber": "+94771234568",
  "address": "123B Main Street, Colombo 03, Sri Lanka",
  "weight": 62,
  "bloodPressure": "118/78",
  "sugarLevel": 92
}
```

## 12. Create Appointment #1 (General Consultation)

```json
{
  "patientPhn": "PH00001",
  "doctorLicense": "MED12345",
  "nurseId": "NUR00001",
  "roomNo": "101",
  "type": "general",
  "appointmentDate": "2025-11-18T10:00:00Z"
}
```

## 13. Create Appointment #2 (Follow-up)

```json
{
  "patientPhn": "PH00002",
  "doctorLicense": "MED12345",
  "nurseId": "NUR00001",
  "roomNo": "102",
  "type": "follow-up",
  "appointmentDate": "2025-11-18T11:00:00Z"
}
```

## 14. Create Appointment #3 (Pediatric)

```json
{
  "patientPhn": "PH00004",
  "doctorLicense": "MED67890",
  "nurseId": "NUR00002",
  "roomNo": "201",
  "type": "pediatric-checkup",
  "appointmentDate": "2025-11-18T14:00:00Z"
}
```

## 15. Create Appointment #4 (Emergency)

```json
{
  "patientPhn": "PH00005",
  "doctorLicense": "MED12345",
  "nurseId": "NUR00001",
  "roomNo": "103",
  "type": "emergency",
  "appointmentDate": "2025-11-18T09:00:00Z"
}
```

## 16. Update Appointment Status

```json
{
  "status": "booked"
}
```

## 17. Start Walk-in Encounter #1

```json
{
  "complaint": "Chest pain and shortness of breath for the past 2 hours. Pain radiates to left arm.",
  "weight": 75,
  "notes": "Patient appears distressed. Elevated heart rate. Immediate assessment required. Blood pressure 145/95."
}
```

## 18. Start Walk-in Encounter #2

```json
{
  "complaint": "Severe headache and dizziness since yesterday. Associated with nausea.",
  "weight": 60,
  "notes": "Patient reports photophobia. No fever. History of migraines."
}
```

## 19. Start Encounter from Appointment #1

```json
{
  "complaint": "Regular follow-up checkup as scheduled. Patient reports feeling well overall.",
  "weight": 75,
  "notes": "Routine examination. Blood pressure within normal range. Patient compliant with medication."
}
```

## 20. Start Encounter from Appointment #2

```json
{
  "complaint": "Follow-up for diabetes management. Blood sugar monitoring results reviewed.",
  "weight": 80,
  "notes": "HbA1c results pending. Patient reports good dietary compliance. Slight weight increase noted."
}
```

## 21. Start Encounter from Appointment #3 (Pediatric)

```json
{
  "complaint": "Routine pediatric checkup. Growth and development assessment.",
  "weight": 35,
  "notes": "Child appears healthy. Developmental milestones appropriate for age. Immunization schedule up to date."
}
```

## 22. Update Encounter - Add Notes

```json
{
  "notes": "ECG performed - normal sinus rhythm. Chest X-ray clear. Troponin levels normal. Diagnosed with anxiety-related chest pain. Prescribed anxiolytic. Patient advised to follow up if symptoms worsen."
}
```

## 23. Update Encounter - Close Encounter

```json
{
  "notes": "Final diagnosis: Essential hypertension. Prescribed: Amlodipine 5mg daily, Aspirin 75mg daily. Patient counseled on lifestyle modifications: low-salt diet, regular exercise, stress management. Follow-up in 2 weeks for blood pressure monitoring.",
  "status": "finished",
  "endTime": "2025-11-18T11:30:00Z"
}
```

## 24. Update Encounter - Close Pediatric Encounter

```json
{
  "notes": "Growth parameters normal. Weight: 35kg (75th percentile), Height: 130cm (70th percentile). Vision and hearing tests normal. Next vaccination due in 6 months. Parent education provided on nutrition and physical activity.",
  "status": "finished",
  "endTime": "2025-11-18T15:00:00Z"
}
```

## Search Query Examples

### Search Patients by Name
```
GET /fhir/Patient?name=Jane
```

### Search Patients by Gender
```
GET /fhir/Patient?gender=female
```

### Search Patients by NIC
```
GET /fhir/Patient?nic=987654321V
```

### Get Doctor's Pending Appointments
```
GET /doctor/appointments/MED12345?status=pending
```

### Get Doctor's All Appointments
```
GET /doctor/appointments/MED12345
```

### Get Patient's Encounters
```
GET /fhir/Encounter?patient=PH00001
```

### Get Doctor's Encounters
```
GET /fhir/Encounter?participant=MED12345
```

### Search Practitioners by Role
```
GET /fhir/Practitioner?role=doctor
```

### Get All Appointments (Admin)
```
GET /admin/appointments?status=pending&page=1&limit=10
```

## Expected ID Formats After Creation

- **Patient PHNs**: PH00001, PH00002, PH00003, PH00004, PH00005
- **Nurse IDs**: NUR00001, NUR00002
- **Appointment IDs**: AP00001, AP00002, AP00003, AP00004
- **Encounter IDs**: ENC##### (timestamp-based)

## Testing Workflow Sequence

1. ✅ Login as Admin
2. ✅ Register 2 Doctors
3. ✅ Register 2 Nurses
4. ✅ Get Pending Users (Admin)
5. ✅ Approve Both Doctors by Medical License
6. ✅ Approve Both Nurses by User ID (generates NURIDs)
7. ✅ Login as Doctor #1
8. ✅ Login as Nurse #1
9. ✅ Create 5 Patients (as Nurse or Doctor)
10. ✅ Create 4 Appointments (as Nurse #1)
11. ✅ Get Doctor #1's Appointments
12. ✅ Start 2 Walk-in Encounters (as Doctor #1)
13. ✅ Start 2 Encounters from Appointments (as Doctor #1)
14. ✅ Verify Appointments are "completed" not deleted
15. ✅ Update and Close Encounters
16. ✅ Search Patients, Practitioners, Encounters

## Status Lifecycle Examples

### Appointment Status Flow
```
pending → booked → arrived → fulfilled → completed
                            ↓
                        cancelled
```

### Encounter Status Flow
```
planned → arrived → triaged → in-progress → finished
                                          ↓
                                      cancelled
```

## Notes for Testing

- All dates use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- PHN format: PH + 5 digits
- NURID format: NUR + 5 digits
- APID format: AP + 5 digits
- Medical License: Alphanumeric (e.g., MED12345)
- NIC: 12 digits or 9 digits + V
- Contact numbers: International format recommended (+94...)

---

**Use this data to test all critical workflows and validate business logic!**
