import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment_date: { type: Date, required: true },
    status: { type: String, enum: ["BOOKED", "COMPLETED", "CANCELLED"], default: "BOOKED" }
  },
  { timestamps: true }
);

// Optional: harden against exact duplicate bookings
appointmentSchema.index({ doctor: 1, appointment_date: 1 }, { unique: false });

export default mongoose.model("Appointment", appointmentSchema);
