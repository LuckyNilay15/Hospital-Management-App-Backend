import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Patient from "../models/Patient.js";

const sign = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerPatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, phone, password, age, gender, blood_group } = req.body;

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: "User already exists" });

  const user = await User.create({
    username,
    email,
    phone,
    password: await bcrypt.hash(password, 10),
    role: "PATIENT"
  });

  await Patient.create({
    user: user._id,
    age,
    gender,
    blood_group
  });

  const token = sign(user._id, user.role);
  res.status(201).json({
    token,
    user: { id: user._id, username: user.username, role: user.role }
  });
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { usernameOrEmail, password } = req.body;

  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
  });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = sign(user._id, user.role);
  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role }
  });
};
