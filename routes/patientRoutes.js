import { Router } from "express";
import { auth, permit } from "../middleware/authMiddleware.js";
import {
  searchDoctors,
  bookAppointment,
  cancelAppointment,
  myAppointments,
  myPrescriptions
} from "../controllers/patientController.js";
import { vBookAppointment, vCancelAppointment } from "../utils/validators.js";

const router = Router();

router.use(auth, permit("PATIENT"));

router.get("/doctors/search", searchDoctors);
router.post("/appointments", vBookAppointment, bookAppointment);
router.delete("/appointments/:id", vCancelAppointment, cancelAppointment);
router.get("/appointments", myAppointments);
router.get("/prescriptions", myPrescriptions);

export default router;
