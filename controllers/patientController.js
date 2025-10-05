import { validationResult } from "express-validator";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";

// GET /api/patient/doctors/search?specialization=&name=
export const searchDoctors = async (req, res) => {
  const { specialization, name, department } = req.query;
  const q = {};
  if (specialization) q.specialization = new RegExp(specialization, "i");
  if (department) q.department = department;

  const docs = await Doctor.find(q)
    .populate({ path: "user", select: "username email phone" })
    .populate({ path: "department", select: "name" });

  const filtered = name
    ? docs.filter(d => d.user?.username?.toLowerCase().includes(name.toLowerCase()))
    : docs;

  res.json(filtered);
};

// POST /api/patient/appointments
export const bookAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { doctorId, appointment_date } = req.body;

  // map user -> patientId (safety if middleware missed)
  const p = await Patient.findOne({ user: req.user._id });
  const patientId = p ? p._id : req.user._id;

  // prevent exact slot double-booking for that doctor
  const clash = await Appointment.findOne({
    doctor: doctorId,
    appointment_date: new Date(appointment_date),
    status: { $ne: "CANCELLED" }
  });
  if (clash) return res.status(409).json({ message: "Slot already booked" });

  const appt = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointment_date: new Date(appointment_date)
  });

  res.status(201).json(appt);
};

// DELETE /api/patient/appointments/:id
export const cancelAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;

  const p = await Patient.findOne({ user: req.user._id });
  const patientId = p ? p._id : req.user._id;

  const appt = await Appointment.findById(id);
  if (!appt) return res.status(404).json({ message: "Appointment not found" });
  if (String(appt.patient) !== String(patientId))
    return res.status(403).json({ message: "You can cancel only your appointment" });

  appt.status = "CANCELLED";
  await appt.save();
  res.json(appt);
};

// GET /api/patient/appointments
export const myAppointments = async (req, res) => {
  const p = await Patient.findOne({ user: req.user._id });
  const patientId = p ? p._id : req.user._id;

  const appts = await Appointment.find({ patient: patientId })
    .sort({ appointment_date: -1 })
    .populate({ path: "doctor", populate: { path: "user", select: "username email" } });
  res.json(appts);
};

// GET /api/patient/prescriptions
export const myPrescriptions = async (req, res) => {
  const p = await Patient.findOne({ user: req.user._id });
  const patientId = p ? p._id : req.user._id;

  const pres = await Prescription.find()
    .populate({
      path: "appointment",
      match: { patient: patientId },
      populate: [{ path: "doctor", populate: { path: "user", select: "username" } }]
    });

  res.json(pres.filter(x => x.appointment));
};
