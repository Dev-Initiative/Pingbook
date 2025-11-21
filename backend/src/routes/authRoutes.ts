import { Router } from "express";
import passport from "passport";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resetPassword,
  googleLogin,
  setPassword,
  resendVerificationEmail,
} from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateVerifyEmail,
  validateResendEmail,
  validateResetPassword,
  handleValidationErrors,
} from "../middleware/validateAuth.js";

const router = Router();

// Standard Auth Routes
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  registerUser
);
router.post("/login", validateLogin, handleValidationErrors, loginUser);
router.post(
  "/verify-email",
  validateVerifyEmail,
  handleValidationErrors,
  verifyEmail
);
router.post(
  "/resend-email",
  validateResendEmail,
  handleValidationErrors,
  resendVerificationEmail
);

// Password management for logged-in users
router.put(
  "/reset-password",
  authMiddleware,
  validateResetPassword,
  handleValidationErrors,
  resetPassword
);
router.post("/set-password", authMiddleware, setPassword); // New endpoint

// Google Auth Routes
router.get("/google", passport.authenticate("google"));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  googleLogin
);

export default router;
