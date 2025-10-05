import { body, param } from "express-validator";

// Auth
export const vRegisterPatient = [
  body("username").trim().notEmpty(),
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("age").optional().isInt({ min: 0 }),
  body("gender").optional().isIn(["Male", "Female", "Other"]),
  body("blood_group").optional().isString()
];

export const vLogin = [
  body("usernameOrEmail").notEmpty(),
  body("password").notEmpty()
];

// Patient
export const vBookAppointment = [
  body("doctorId").notEmpty().isMongoId(),
  body("appointment_date").notEmpty().isISO8601()
];
export const vCancelAppointment = [
  param("id").isMongoId()
];

// Admin
export const vCreateDoctor = [
  body("username").trim().notEmpty(),
  body("email").isEmail(),
  body("phone").optional().isString(),
  body("password").isLength({ min: 6 }),
  body("specialization").optional().isString(),
  body("departmentId").optional().isMongoId()
];

export const vAddDepartment = [
  body("name").trim().notEmpty()
];
