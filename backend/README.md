# Patient Management Backend

A secure Node.js backend application using Express.js and MongoDB for managing patient records with user authentication and role-based access control.

## Features

- RESTful API for patient management
- MongoDB database with Mongoose ODM
- CRUD operations for patients
- User authentication with JWT tokens
- Role-based access control (Admin, Doctor, Nurse)
- Password hashing with bcrypt
- Input validation and error handling
- ES modules support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mediease
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important:** Change the `JWT_SECRET` to a strong, random string in production.

3. Make sure MongoDB is running on your system.

4. Create an admin user (required for managing doctor approvals):
```bash
node scripts/createAdmin.js <email> [firstName] [lastName] [password] [nic]
```

Example:
```bash
node scripts/createAdmin.js admin@example.com Admin User admin123 ADMIN001
```

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in .env).

## Project Structure

```
project/
├── server.js
├── app.js
├── models/
│   ├── userModel.js
│   └── patientModel.js
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   └── patientRoutes.js
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   └── patientController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── config/
│   └── db.js
├── scripts/
│   └── createAdmin.js
├── .env
└── package.json
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Description:** Register a new doctor or nurse
- **Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "doctor@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "doctor",
    "nic": "123456789V",
    "doctorId": "DOC001",
    "division": "Cardiology"
  }
  ```
- **Note:** 
  - For doctors: `doctorId` and `division` are required
  - For nurses: `doctorId` and `division` are not required
  - Admin accounts cannot be created through this endpoint (use `scripts/createAdmin.js`)

#### Login
- **POST** `/api/auth/login`
- **Description:** Login and receive JWT token
- **Body:**
  ```json
  {
    "email": "doctor@example.com",
    "password": "password123"
  }
  ```
- **Response:** Returns user object and JWT token (expires in 1 day)

### Admin Routes (Requires Admin Role)

All admin routes require authentication with a valid JWT token and admin role.

#### Get Pending Doctors
- **GET** `/api/admin/pending-doctors`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Get all doctors with pending status

#### Approve Doctor
- **PUT** `/api/admin/approve/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Approve a doctor registration

#### Reject Doctor
- **PUT** `/api/admin/reject/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Reject a doctor registration

#### Get All Users
- **GET** `/api/admin/users`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** View all registered users

### Patient Routes

#### Create Patient
- **POST** `/api/patients`
- **Description:** Create a new patient

#### Get All Patients
- **GET** `/api/patients`
- **Description:** Get all patients

#### Get Patient by ID
- **GET** `/api/patients/:id`
- **Description:** Get a single patient by ID

#### Update Patient
- **PUT** `/api/patients/:id`
- **Description:** Update patient information

#### Delete Patient
- **DELETE** `/api/patients/:id`
- **Description:** Delete a patient

## User Model

### Common Fields (All Users)
- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `password` (String, required, min 6 characters)
- `role` (String, enum: ['admin', 'doctor', 'nurse'], required)
- `status` (String, enum: ['pending', 'approved', 'rejected'], default: 'pending')
- `nic` (String, required, unique)

### Doctor-Specific Fields
- `doctorId` (String, required if role = 'doctor', unique)
- `division` (String, required if role = 'doctor')

**Note:** Nurses and Admins do NOT have `doctorId` or `division` fields.

## Patient Model

### Required Fields
- `nic` (String) - Unique
- `fullName` (String)
- `gender` (String)
- `contactNumber` (String)
- `dob` (Date)
- `address` (String)
- `guardianNIC` (String)
- `guardianName` (String)

### Optional Fields
- `height` (Number)
- `weight` (Number)
- `bloodPressure` (String)
- `sugarLevel` (String)

## Authentication & Authorization

### JWT Token Usage

Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer <your_jwt_token>
```

### User Roles

1. **Admin**
   - Can approve/reject doctor registrations
   - Can view all users
   - Manually created (not through registration API)
   - Status is automatically set to 'approved'

2. **Doctor**
   - Must register with `doctorId` and `division`
   - Status starts as 'pending'
   - Requires admin approval before login
   - Once approved, can access protected routes

3. **Nurse**
   - Can register without `doctorId` or `division`
   - Status starts as 'pending'
   - Requires admin approval before login
   - Once approved, can access protected routes

### Security Features

- Passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 1 day
- Protected routes require valid authentication
- Role-based access control for admin routes
- Pending users cannot login until approved

## Response Structure

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "missingFields": [...] // if applicable
}
```

## Example Requests

### Register Doctor
```json
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "doctor@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "doctor",
  "nic": "123456789V",
  "doctorId": "DOC001",
  "division": "Cardiology"
}
```

### Register Nurse
```json
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "nurse@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "nurse",
  "nic": "987654321V"
}
```

### Login
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@example.com",
  "password": "password123"
}
```

### Create Patient
```json
POST /api/patients
Content-Type: application/json

{
  "nic": "123456789V",
  "fullName": "John Doe",
  "gender": "Male",
  "contactNumber": "0771234567",
  "dob": "1990-01-15",
  "address": "123 Main Street, City",
  "guardianNIC": "987654321V",
  "guardianName": "Jane Doe",
  "height": 175,
  "weight": 70,
  "bloodPressure": "120/80",
  "sugarLevel": "90"
}
```

## Error Handling

The API provides clear error messages for:
- Missing required fields
- Invalid credentials
- Unauthorized access
- Duplicate entries (email, NIC, doctorId)
- Invalid user IDs
- Token expiration
- Validation errors

## License

ISC
