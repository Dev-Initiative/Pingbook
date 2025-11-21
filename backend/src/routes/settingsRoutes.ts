import { Router } from "express";
import { settingsMiddleware } from "../middleware/settingsMiddleware.js";
import { getSettings, createSettings, updateSettings } from "../controller/settingsController.js";

const router = Router();

// GET /api/settings
// Input: Authorization header with JWT token
// Output: { success: boolean, settings: ISettings }
router.get("/", settingsMiddleware, getSettings);

// PUT /api/settings
// Input: Authorization header with JWT token, { theme?: "light" | "dark", notificationsEnabled?: boolean }
// Output: { success: boolean, message: string, settings: ISettings }
router.put("/", settingsMiddleware, updateSettings);

// POST /api/settings
// Input: Authorization header with JWT token, { theme?: "light" | "dark", notificationsEnabled?: boolean }
// Output: { success: boolean, message: string, settings: ISettings }
router.post("/", settingsMiddleware, createSettings);

export default router;
