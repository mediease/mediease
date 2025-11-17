# Quick Setup Guide

## Prerequisites
- Node.js v18+ installed
- MongoDB v6+ installed and running
- Git (optional)

## Step-by-Step Setup

### 1. Install Dependencies
```powershell
cd d:\applications\mediease
npm install
```

### 2. Configure Environment
```powershell
# Copy environment template
copy .env.example .env

# Edit .env file with your settings
notepad .env
```

**Important .env variables to update:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Change to a secure random string
- `ADMIN_PASSWORD` - Set your admin password

### 3. Start MongoDB
Ensure MongoDB is running on your system:
```powershell
# If MongoDB is installed as a service, it should already be running
# Check with:
mongo --version

# Or if using MongoDB Compass, connect to:
# mongodb://localhost:27017
```

### 4. Seed Admin User
```powershell
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@hospital.com`
- Password: `Admin@123` (or as set in .env)

### 5. Start the Server
```powershell
# Development mode (with auto-restart)
npm run dev

# OR Production mode
npm start
```

Server will start on: `http://localhost:5000`

### 6. Test the API

**Option A: Using Postman**
1. Open Postman
2. Import `docs/postman_collection.json`
3. Update collection variables if needed
4. Run "1.1 Login Admin" to get started

**Option B: Using curl/PowerShell**
```powershell
# Health check
curl http://localhost:5000/health

# Login as admin
$body = @{
    email = "admin@hospital.com"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## Quick Test Workflow

### 1. Login as Admin
```
POST http://localhost:5000/auth/login
{
  "email": "admin@hospital.com",
  "password": "Admin@123"
}
```
→ Save the `token` from response

### 2. Register a Doctor
```
POST http://localhost:5000/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "doctor@test.com",
  "password": "Doctor@123",
  "confirmPassword": "Doctor@123",
  "role": "doctor",
  "medicalLicenseId": "MED12345",
  "nic": "199012345678",
  "division": "Cardiology"
}
```

### 3. Approve Doctor (as Admin)
```
PUT http://localhost:5000/admin/approve/doctor/MED12345
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### 4. Login as Doctor
```
POST http://localhost:5000/auth/login
{
  "email": "doctor@test.com",
  "password": "Doctor@123"
}
```
→ Save the `token` from response

### 5. Create a Patient
```
POST http://localhost:5000/fhir/Patient
Authorization: Bearer YOUR_DOCTOR_TOKEN
{
  "nic": "987654321V",
  "firstName": "Jane",
  "lastName": "Smith",
  "gender": "female",
  "contactNumber": "+94771234567",
  "dob": "1990-05-15",
  "address": "123 Main St, Colombo",
  "guardianNIC": "123456789V",
  "guardianName": "Robert Smith"
}
```
→ Note the `phn` (e.g., PH00001)

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try: `mongodb://127.0.0.1:27017/fhir_emr_db` instead of localhost

### Issue: "Module not found" errors
**Solution:**
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Issue: "Port 5000 already in use"
**Solution:**
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

### Issue: Admin seed fails with "Admin already exists"
**Solution:**
- This is normal if you've already seeded
- To reset: Drop the database and run seed again
```javascript
// In MongoDB shell or Compass:
use fhir_emr_db
db.dropDatabase()
```

## Project Structure Overview

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── middleware/      # Auth & validation
├── utils/           # Helper functions
├── seeds/           # Database seeders
├── tests/           # Test files
├── docs/            # API documentation
├── .env.example     # Environment template
├── package.json     # Dependencies
└── server.js        # Application entry
```

## Next Steps

1. ✅ Review the full API documentation in `docs/api-docs.md`
2. ✅ Import Postman collection from `docs/postman_collection.json`
3. ✅ Read the comprehensive README in `README.md`
4. ✅ Run the test suite: `npm test`
5. ✅ Explore the critical workflows in the Postman collection

## Security Reminders

- ⚠️ Change default admin password immediately
- ⚠️ Use a strong JWT_SECRET in production
- ⚠️ Never commit `.env` file to version control
- ⚠️ Enable HTTPS in production
- ⚠️ Implement rate limiting for production use

## Support

- 📖 Full API Docs: `docs/api-docs.md`
- 📚 README: `README.md`
- 🧪 Tests: `tests/criticalFlows.test.js`
- 📮 Postman: `docs/postman_collection.json`

---

**You're all set! Start building your FHIR-compliant EMR system! 🚀**
