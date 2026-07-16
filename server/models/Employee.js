const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  profileImage: String,
  department: String,
  designation: String,
  joiningDate: Date,
  grossSalary: Number,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave'],
    default: 'Active',
  },
  banking: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },
  documents: {
    pan: String,
    aadhaar: String,
    uan: String,
    esic: String,
  },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
