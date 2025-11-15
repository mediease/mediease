import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  apid: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  patientPhn: {
    type: String,
    required: [true, 'Patient PHN is required'],
    trim: true
  },
  nurseId: {
    type: String,
    required: [true, 'Nurse ID is required'],
    trim: true
  },
  doctorId: {
    type: String,
    required: [true, 'Doctor ID is required'],
    trim: true
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  doctorDivision: {
    type: String,
    required: [true, 'Doctor division is required'],
    trim: true
  },
  roomNo: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Auto-generate APID (AP00001...)
appointmentSchema.pre('validate', async function(next) {
  try {
    if (!this.apid) {
      const last = await mongoose.model('Appointment').findOne({ apid: /^AP/ }).sort({ apid: -1 }).lean();
      let nextNum = 1;
      if (last && last.apid) {
        const n = parseInt(last.apid.replace(/^AP0*/, ''), 10);
        if (!isNaN(n)) nextNum = n + 1;
      }
      this.apid = 'AP' + String(nextNum).padStart(5, '0');
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

