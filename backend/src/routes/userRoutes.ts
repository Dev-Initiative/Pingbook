import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { userMiddleware } from "../middleware/userMiddleware.js";
import {
  getProfile,
  updateProfile,
  deleteProfile,
  getUserById,
  updateUserById,
  deleteUserById,
  getAllUsers,
} from "../controller/userController.js";

const router = Router();

// GET /api/users/
// Input: Authorization header with JWT token
// Output: { success: boolean, users: IUser[] }
router.get("/", authMiddleware, getAllUsers);

// GET /api/users/is-auth
// Input: Authorization header with JWT token
// Output: { success: boolean, isAuth: boolean }
router.get("/is-auth", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, isAuth: true });
});

// GET /api/users/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, user: IUser }
router.get("/:id", authMiddleware, getUserById);

// PUT /api/users/:id
// Input: Authorization header with JWT token, { username?: string, email?: string, phone?: string, avatar?: string }
// Output: { success: boolean, message: string, user?: IUser }
router.put("/:id", authMiddleware, updateUserById);

// DELETE /api/users/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", authMiddleware, deleteUserById);

// GET /api/users/profile
// Input: Authorization header with JWT token
// Output: { success: boolean, user: IUser }
router.get("/profile", authMiddleware, userMiddleware, getProfile);

// PUT /api/users/profile
// Input: Authorization header with JWT token, { username?: string, email?: string, phone?: string, avatar?: string }
// Output: { success: boolean, message: string, user?: IUser }
router.put("/profile", authMiddleware, userMiddleware, updateProfile);

// DELETE /api/users/profile
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/profile", authMiddleware, userMiddleware, deleteProfile);

// POST /api/users/logout
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.post("/logout", authMiddleware, (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// POST /api/users/import-contacts
// Input: Authorization header with JWT token, { contacts: IContact[] }
// Output: { success: boolean, message: string, importedCount: number }
router.post("/import-contacts", authMiddleware, (req, res) => {
  // TODO: Implement import contacts logic
  res.status(501).json({ message: "Not implemented" });
});

export default router;
