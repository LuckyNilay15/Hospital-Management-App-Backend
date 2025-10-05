import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: { type: Number },
    gender: { type: String },
    blood_group: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
