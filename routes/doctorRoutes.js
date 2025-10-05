import { Router } from "express";
import { auth, permit } from "../middleware/authMiddleWare.js";
import {
  todayAppointments,
  setAvailability,
  addOrUpdatePrescription
} from "../controllers/doctorController.js";

const router = Router();

router.use(auth, permit("DOCTOR"));

router.get("/appointments/today", todayAppointments);
router.patch("/availability", setAvailability);
router.post("/prescriptions", addOrUpdatePrescription);

export default router;
