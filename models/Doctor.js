import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    specialization: { type: String },
    availability: { type: String } // e.g., "Mon–Fri 10am–2pm"
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
