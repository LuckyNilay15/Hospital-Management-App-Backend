import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    doctor_notes: { type: String },
    medicines: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
