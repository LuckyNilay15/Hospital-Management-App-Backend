import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Department from "../models/Department.js";

// POST /api/admin/doctors
export const createDoctor = async (req, res) => {
  const { username, email, phone, password, specialization, departmentId } = req.body;

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const user = await User.create({
    username,
    email,
    phone,
    password: await bcrypt.hash(password, 10),
    role: "DOCTOR"
  });

  const doctor = await Doctor.create({
    user: user._id,
    department: departmentId || null,
    specialization
  });

  res.status(201).json({
    user: { id: user._id, username: user.username, role: user.role },
    doctor
  });
};

// POST /api/admin/departments
export const addDepartment = async (req, res) => {
  const { name } = req.body;
  const dup = await Department.findOne({ name });
  if (dup) return res.status(409).json({ message: "Department already exists" });
  const dept = await Department.create({ name });
  res.status(201).json(dept);
};

// GET /api/admin/departments
export const listDepartments = async (_req, res) => {
  const depts = await Department.find().sort({ name: 1 });
  res.json(depts);
};
