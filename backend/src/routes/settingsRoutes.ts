import { Router } from "express";
import { settingsMiddleware } from "../middleware/settingsMiddleware.js";
import {
  getSettings,
  createSettings,
  updateSettings,
} from "../controller/settingsController.js";

const router = Router();

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 settings: { $ref: '#/components/schemas/Settings' }
 */
router.get("/", settingsMiddleware, getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme: { type: string, enum: [light, dark] }
 *               notificationsEnabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 settings: { $ref: '#/components/schemas/Settings' }
 */
router.put("/", settingsMiddleware, updateSettings);

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme: { type: string, enum: [light, dark] }
 *               notificationsEnabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Settings created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 settings: { $ref: '#/components/schemas/Settings' }
 */
router.post("/", settingsMiddleware, createSettings);

export default router;
