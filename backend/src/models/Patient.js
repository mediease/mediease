'use strict';

const mongoose = require('mongoose');

function generatePhid() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let part1 = '';
  for (let i = 0; i < 3; i += 1) {
    part1 += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const part2 = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${part1}${part2}`;
}

const patientSchema = new mongoose.Schema(
  {
    phid: { type: String, unique: true, index: true, required: true },
    name: { type: String, required: true },
    nic: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    contactNo: { type: String, required: true },
    address: { type: String, required: true },
    guardianNic: { type: String, required: true },
    guardianName: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

patientSchema.statics.generateUniquePhid = async function generateUniquePhid() {
  let phid;
  for (let i = 0; i < 10; i += 1) {
    phid = generatePhid();
    // eslint-disable-next-line no-await-in-loop
    const existing = await this.findOne({ phid }).lean();
    if (!existing) return phid;
  }
  throw new Error('Failed to generate unique PHID');
};

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;



