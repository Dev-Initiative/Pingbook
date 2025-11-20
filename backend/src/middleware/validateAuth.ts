import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Middleware to handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation for user registration
export const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Username must be at least 2 characters long"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phone")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Phone number must be at least 10 characters long"),
];

// Validation for user login
export const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

// Validation for email verification
export const validateVerifyEmail = [
  body("token").trim().notEmpty().withMessage("Verification token is required"),
];

// Validation for password reset
export const validateResetPassword = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .trim()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];
