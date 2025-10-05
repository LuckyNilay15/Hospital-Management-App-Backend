import { Router } from "express";
import { auth, permit } from "../middleware/authMiddleWare.js";
import {
  createDoctor,
  addDepartment,
  listDepartments
} from "../controllers/adminController.js";
import { vCreateDoctor, vAddDepartment } from "../utils/validators.js";

const router = Router();

router.use(auth, permit("ADMIN"));

router.post("/doctors", vCreateDoctor, createDoctor);
router.post("/departments", vAddDepartment, addDepartment);
router.get("/departments", listDepartments);

export default router;
