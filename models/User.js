import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true }, // hashed
    email: { type: String, unique: true, required: true, lowercase: true },
    phone: { type: String },
    role: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"], required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
