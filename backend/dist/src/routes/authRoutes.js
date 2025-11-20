import { Router } from "express";
import { loginUser, registerUser, resetPassword, } from "../controller/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin, validateResetPassword, handleValidationErrors, } from "../middleware/validateAuth.js";
const router = Router();
// POST /api/auth/register
// Input: { username: string, email: string, phone: string, password: string, avatar?: string }
// Output: { success: boolean, message: string, user?: IUser }
router.post("/register", validateRegister, handleValidationErrors, registerUser);
// POST /api/auth/login
// Input: { email: string, password: string }
// Output: { success: boolean, message: string, token?: string, user?: IUser }
router.post("/login", validateLogin, handleValidationErrors, loginUser);
// POST /api/auth/verify-email
// Input: { token: string }
// Output: { success: boolean, message: string }
// Temporarily disabled for testing
// router.post(
//   "/verify-email",
//   validateVerifyEmail,
//   handleValidationErrors,
//   verifyEmail
// );
// PUT /api/auth/reset-password
// Input: Authorization header with JWT token, { currentPassword: string, newPassword: string }
// Output: { success: boolean, message: string }
router.put("/reset-password", authMiddleware, validateResetPassword, handleValidationErrors, resetPassword);
export default router;
//# sourceMappingURL=authRoutes.js.map