import { Router } from "express";
import passport from "passport";
import { loginUser, registerUser, verifyEmail, resetPassword, googleLogin, } from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin, validateVerifyEmail, validateResetPassword, handleValidationErrors, } from "../middleware/validateAuth.js";
const router = Router();
// Standard Auth Routes
router.post("/register", validateRegister, handleValidationErrors, registerUser);
router.post("/login", validateLogin, handleValidationErrors, loginUser);
router.put("/reset-password", authMiddleware, validateResetPassword, handleValidationErrors, resetPassword);
router.post("/verify-email", validateVerifyEmail, handleValidationErrors, verifyEmail);
// Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/", session: false }), googleLogin);
export default router;
//# sourceMappingURL=authRoutes.js.map