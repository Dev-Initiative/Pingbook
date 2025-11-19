import { Router, Request, Response } from "express";

const router = Router();

// POST /api/auth/register
// Input: { username: string, email: string, phone: string, password: string, avatar?: string }
// Output: { success: boolean, message: string, user?: IUser }
router.post("/register", async (req: Request, res: Response) => {
  // TODO: Implement user registration logic
  res.status(501).json({ message: "Not implemented" });
});

// POST /api/auth/login
// Input: { email: string, password: string }
// Output: { success: boolean, message: string, token?: string, user?: IUser }
router.post("/login", async (req: Request, res: Response) => {
  // TODO: Implement user login logic
  res.status(501).json({ message: "Not implemented" });
});

// POST /api/auth/verify-email
// Input: { token: string }
// Output: { success: boolean, message: string }
router.post("/verify-email", async (req: Request, res: Response) => {
  // TODO: Implement email verification logic
  res.status(501).json({ message: "Not implemented" });
});

// PUT /api/auth/reset-password
// Input: Authorization header with JWT token, { currentPassword: string, newPassword: string }
// Output: { success: boolean, message: string }
router.put("/reset-password", async (req: Request, res: Response) => {
  // TODO: Implement change password logic (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
});

export default router;
