import { Router } from "express";
import {
  getNotifications,
  markAsRead,
} from "../controller/notificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 notifications: { type: array, items: { $ref: '#/components/schemas/Notification' } }
 */
router.get("/", authMiddleware, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 notification: { $ref: '#/components/schemas/Notification' }
 */
router.put("/:id/read", authMiddleware, markAsRead);

export default router;
