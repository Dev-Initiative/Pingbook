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

// GET /api/labels
// Input: Authorization header with JWT token
// Output: { success: boolean, labels: ILabel[] }
router.get("/", authMiddleware, getAllLabels);

// GET /api/labels/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, label: ILabel }
router.get("/:id", authMiddleware, getLabel);

// POST /api/labels
// Input: Authorization header with JWT token, { name: string, color?: string, description?: string }
// Output: { success: boolean, message: string, label: ILabel }
router.post("/", authMiddleware, createLabel);

// PUT /api/labels/:id
// Input: Authorization header with JWT token, { name?: string, color?: string, description?: string }
// Output: { success: boolean, message: string, label: ILabel }
router.put("/:id", authMiddleware, updateLabel);

// DELETE /api/labels/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", authMiddleware, deleteLabel);

export default router;
