import { Router } from "express";
import { vLogin, vRegisterPatient } from "../utils/validators.js";
import { login, registerPatient } from "../controllers/authController.js";

const router = Router();

router.post("/register/patient", vRegisterPatient, registerPatient);
router.post("/login", vLogin, login);

export default router;
