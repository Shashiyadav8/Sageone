const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user (admin or employee) & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  console.log('Login attempt:', req.body.email);
  const { email, password } = req.body;

  try {
    // 1. Check Admin collection first
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      console.log('Login success: Admin');
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        token: generateToken(admin._id, 'admin'),
      });
    }

    // 2. Check Employee collection
    const employee = await Employee.findOne({ $or: [{ email }, { employeeId: email }] });
    if (employee && (await bcrypt.compare(password, employee.password))) {
      console.log('Login success: Employee');
      return res.json({
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeId: employee.employeeId,
        role: 'employee',
        token: generateToken(employee._id, 'employee'),
      });
    }

    // 3. If neither matched
    console.log('Login failed: Invalid credentials');
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed initial admin
const seedAdmin = async (req, res) => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@sagepath.com' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@sagepath.com',
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Admin seeded successfully', admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser, seedAdmin };
