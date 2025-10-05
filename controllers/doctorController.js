// import dayjs from "dayjs";
// import Doctor from "../models/Doctor.js";
// import Appointment from "../models/Appointment.js";
// import Prescription from "../models/Prescription.js";

// // GET /api/doctor/appointments/today
// export const todayAppointments = async (req, res) => {
//   // req.user is User; find Doctor id
//   const doctor = await Doctor.findOne({ user: req.user._id });
//   if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

//   const start = dayjs().startOf("day").toDate();
//   const end = dayjs().endOf("day").toDate();

//   const appts = await Appointment.find({
//     doctor: doctor._id,
//     appointment_date: { $gte: start, $lte: end }
//   })
//     .sort({ appointment_date: 1 })
//     .populate({ path: "patient", populate: { path: "user", select: "username email" } });

//   res.json(appts);
// };

// // PATCH /api/doctor/availability  { availability }
// export const setAvailability = async (req, res) => {
//   const { availability } = req.body;
//   const doc = await Doctor.findOneAndUpdate(
//     { user: req.user._id },
//     { availability },
//     { new: true }
//   ).populate("user", "username email");
//   if (!doc) return res.status(404).json({ message: "Doctor profile not found" });
//   res.json(doc);
// };

// // POST /api/doctor/prescriptions
// export const addOrUpdatePrescription = async (req, res) => {
//   const { appointmentId, doctor_notes, medicines, markCompleted } = req.body;

//   const doctor = await Doctor.findOne({ user: req.user._id });
//   if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

//   const appt = await Appointment.findById(appointmentId);
//   if (!appt) return res.status(404).json({ message: "Appointment not found" });
//   if (String(appt.doctor) !== String(doctor._id))
//     return res.status(403).json({ message: "Not your appointment" });

//   let pres = await Prescription.findOne({ appointment: appointmentId });
//   if (!pres) {
//     pres = await Prescription.create({ appointment: appointmentId, doctor_notes, medicines });
//   } else {
//     if (doctor_notes !== undefined) pres.doctor_notes = doctor_notes;
//     if (medicines !== undefined) pres.medicines = medicines;
//     await pres.save();
//   }

//   if (markCompleted) {
//     appt.status = "COMPLETED";
//     await appt.save();
//   }

//   res.json({ prescription: pres, appointment: appt });
// };


// controllers/doctorController.js
import dayjs from "dayjs";
import mongoose from "mongoose";                // ✅ add this
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";

// GET /api/doctor/appointments/today
export const todayAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const start = dayjs().startOf("day").toDate();
    const end = dayjs().endOf("day").toDate();

    const appts = await Appointment.find({
      doctor: doctor._id,
      appointment_date: { $gte: start, $lte: end }
    })
      .sort({ appointment_date: 1 })
      .populate({ path: "patient", populate: { path: "user", select: "username email" } });

    return res.json(appts);
  } catch (err) {
    console.error("todayAppointments failed:", err);
    return res.status(500).json({ message: err.message || "Internal error" });
  }
};

// PATCH /api/doctor/availability  { availability }
export const setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const doc = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { availability },
      { new: true }
    ).populate("user", "username email");
    if (!doc) return res.status(404).json({ message: "Doctor profile not found" });
    return res.json(doc);
  } catch (err) {
    console.error("setAvailability failed:", err);
    return res.status(500).json({ message: err.message || "Internal error" });
  }
};

// POST /api/doctor/prescriptions
export const addOrUpdatePrescription = async (req, res) => {
  try {
    const { appointmentId, doctor_notes, medicines, markCompleted } = req.body;

    // ✅ Guard: valid doctor
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    // ✅ Guard: valid ObjectId (prevents CastError)
    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }
    if (!mongoose.isValidObjectId(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointmentId" });
    }

    // ✅ Guard: appointment exists & belongs to this doctor
    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (String(appt.doctor) !== String(doctor._id)) {
      return res.status(403).json({ message: "Not your appointment" });
    }

    // --- Normalise payload ---
    const notes = (doctor_notes ?? "").toString().trim();

    // OPTION A (default): schema has medicines: String — coerce to CSV string
    let meds = "";
    if (Array.isArray(medicines)) {
      meds = medicines.map(s => String(s).trim()).filter(Boolean).join(", ");
    } else if (typeof medicines === "string") {
      meds = medicines.trim();
    } else if (medicines != null) {
      meds = String(medicines).trim();
    }

    // OPTION B (if you change schema to medicines: [String]):
    // let medsArr = [];
    // if (Array.isArray(medicines)) medsArr = medicines.map(s => String(s).trim()).filter(Boolean);
    // else if (typeof medicines === "string") medsArr = medicines.split(",").map(s => s.trim()).filter(Boolean);

    // OPTION C (temporary hot-fix): ignore medicines entirely to avoid crashes
    // const ignoreMeds = true;
    // if (ignoreMeds) meds = ""; // and do not set it below

    // Upsert by appointment
    let pres = await Prescription.findOne({ appointment: appointmentId });
    if (!pres) {
      pres = await Prescription.create({
        appointment: appointmentId,
        doctor_notes: notes,
        medicines: meds // for OPTION B: use medicines: medsArr
      });
    } else {
      pres.doctor_notes = notes;
      // Only set medicines if provided; otherwise keep previous
      if (req.body.hasOwnProperty("medicines")) {
        pres.medicines = meds; // for OPTION B: pres.medicines = medsArr
      }
      await pres.save();
    }

    // Optionally mark appointment complete
    if (markCompleted) {
      // Ensure this matches your schema enum (e.g., 'Completed' vs 'COMPLETED')
      appt.status = "Completed";
      await appt.save();
    }

    return res.json({ prescription: pres, appointment: appt });
  } catch (err) {
    console.error("addOrUpdatePrescription failed:", err);
    return res.status(500).json({ message: err.message || "Internal error" });
  }
};
