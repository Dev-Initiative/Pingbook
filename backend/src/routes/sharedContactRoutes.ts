import { Router } from "express";
import {
  createSharedContact,
  getAllSharedContacts,
  getReceivedSharedContacts,
  getSentSharedContacts,
  getSharedContactStatus,
  acceptSharedContact,
  rejectSharedContact,
  deleteSharedContact,
} from "../controller/sharedContactController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/shared-contacts:
 *   post:
 *     summary: Create a shared contact
 *     tags: [SharedContacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contacts
 *               - sharedWithUserId
 *             properties:
 *               contacts: { type: array, items: { type: string } }
 *               sharedWithUserId: { type: string }
 *     responses:
 *       200:
 *         description: Shared contact created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 sharedContact: { $ref: '#/components/schemas/SharedContact' }
 */
router.post("/", authMiddleware, createSharedContact);

/**
 * @swagger
 * /api/shared-contacts:
 *   get:
 *     summary: Get all shared contacts
 *     tags: [SharedContacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *     responses:
 *       200:
 *         description: List of shared contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 sharedContacts: { type: array, items: { $ref: '#/components/schemas/SharedContact' } }
 */
router.get("/", authMiddleware, getAllSharedContacts);

/**
 * @swagger
 * /api/shared-contacts/received:
 *   get:
 *     summary: Get received shared contacts
 *     tags: [SharedContacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *     responses:
 *       200:
 *         description: List of received shared contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 sharedContacts: { type: array, items: { $ref: '#/components/schemas/SharedContact' } }
 */
router.get("/received", authMiddleware, getReceivedSharedContacts);

/**
 * @swagger
 * /api/shared-contacts/sent:
 *   get:
 *     summary: Get sent shared contacts
 *     tags: [SharedContacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *     responses:
 *       200:
 *         description: List of sent shared contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 sharedContacts: { type: array, items: { $ref: '#/components/schemas/SharedContact' } }
 */
router.get("/sent", authMiddleware, getSentSharedContacts);

/**
 * @swagger
 * /api/shared-contacts/{id}/status:
 *   get:
 *     summary: Get shared contact status
 *     tags: [SharedContacts]
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
 *         description: Shared contact status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 status: { type: string, enum: [pending, accepted, rejected] }
 */
router.get("/:id/status", authMiddleware, getSharedContactStatus);

/**
 * @swagger
 * /api/shared-contacts/{id}/accept:
 *   put:
 *     summary: Accept shared contact
 *     tags: [SharedContacts]
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
 *         description: Shared contact accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 sharedContact: { $ref: '#/components/schemas/SharedContact' }
 */
router.put("/:id/accept", authMiddleware, acceptSharedContact);

/**
 * @swagger
 * /api/shared-contacts/{id}/reject:
 *   put:
 *     summary: Reject shared contact
 *     tags: [SharedContacts]
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
 *         description: Shared contact rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 sharedContact: { $ref: '#/components/schemas/SharedContact' }
 */
router.put("/:id/reject", authMiddleware, rejectSharedContact);

/**
 * @swagger
 * /api/shared-contacts/{id}:
 *   delete:
 *     summary: Delete shared contact
 *     tags: [SharedContacts]
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
 *         description: Shared contact deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 */
router.delete("/:id", authMiddleware, deleteSharedContact);

export default router;
