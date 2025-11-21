import { Router } from "express";
import { authMiddleware, preloadExport } from "../middleware/exportMiddleware.js";
import {
  getAllExports,
  getExport,
  createExport,
  downloadExport,
  deleteExport,
} from "../controller/exportController.js";

const router = Router();

// GET /api/exports
// Input: Authorization header with JWT token
// Output: { success: boolean, exports: IExport[] }
router.get("/", authMiddleware, getAllExports);

// GET /api/exports/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, export: IExport }
router.get("/:id", authMiddleware, preloadExport, getExport);

// POST /api/exports
// Input: Authorization header with JWT token, { format: "csv" | "vcf", labelId?: ObjectId }
// Output: { success: boolean, message: string, export: IExport }
router.post("/", authMiddleware, createExport);

// GET /api/exports/:id/download
// Input: Authorization header with JWT token
// Output: File download or { success: boolean, message: string } if not ready
router.get("/:id/download", authMiddleware, preloadExport, downloadExport);

// DELETE /api/exports/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", authMiddleware, preloadExport, deleteExport);

export default router;
