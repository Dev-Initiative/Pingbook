import { Router } from "express";
import {
  authMiddleware,
  preloadExport,
} from "../middleware/exportMiddleware.js";
import {
  getAllExports,
  getExport,
  createExport,
  downloadExport,
  deleteExport,
} from "../controller/exportController.js";

const router = Router();

/**
 * @swagger
 * /api/exports:
 *   get:
 *     summary: Get all exports
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exports
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 exports: { type: array, items: { $ref: '#/components/schemas/Export' } }
 */
router.get("/", authMiddleware, getAllExports);

/**
 * @swagger
 * /api/exports/{id}:
 *   get:
 *     summary: Get export by ID
 *     tags: [Exports]
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
 *         description: Export details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 export: { $ref: '#/components/schemas/Export' }
 */
router.get("/:id", authMiddleware, preloadExport, getExport);

/**
 * @swagger
 * /api/exports:
 *   post:
 *     summary: Create a new export
 *     tags: [Exports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - format
 *             properties:
 *               format: { type: string, enum: [csv, vcf] }
 *               labelId: { type: string }
 *     responses:
 *       200:
 *         description: Export created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 export: { $ref: '#/components/schemas/Export' }
 */
router.post("/", authMiddleware, createExport);

/**
 * @swagger
 * /api/exports/{id}/download:
 *   get:
 *     summary: Download export file
 *     tags: [Exports]
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
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Export not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 */
router.get("/:id/download", authMiddleware, preloadExport, downloadExport);

/**
 * @swagger
 * /api/exports/{id}:
 *   delete:
 *     summary: Delete export
 *     tags: [Exports]
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
 *         description: Export deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 */
router.delete("/:id", authMiddleware, preloadExport, deleteExport);

export default router;
