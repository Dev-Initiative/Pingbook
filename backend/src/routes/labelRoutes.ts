import { Router } from "express";
import {
  getAllLabels,
  getLabel,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../controller/labelController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * /api/labels:
 *   get:
 *     summary: Get all labels
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of labels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 labels: { type: array, items: { $ref: '#/components/schemas/Label' } }
 */
router.get("/", authMiddleware, getAllLabels);

/**
 * @swagger
 * /api/labels/{id}:
 *   get:
 *     summary: Get label by ID
 *     tags: [Labels]
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
 *         description: Label details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 label: { $ref: '#/components/schemas/Label' }
 */
router.get("/:id", authMiddleware, getLabel);

/**
 * @swagger
 * /api/labels:
 *   post:
 *     summary: Create a new label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name: { type: string }
 *               color: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Label created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 label: { $ref: '#/components/schemas/Label' }
 */
router.post("/", authMiddleware, createLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   put:
 *     summary: Update label
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               color: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Label updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 label: { $ref: '#/components/schemas/Label' }
 */
router.put("/:id", authMiddleware, updateLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     summary: Delete label
 *     tags: [Labels]
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
 *         description: Label deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 */
router.delete("/:id", authMiddleware, deleteLabel);

export default router;
