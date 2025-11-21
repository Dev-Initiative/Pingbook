import { Router } from "express";
import {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  shareContact,
} from "../controller/contactController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/contacts
// Input: Authorization header with JWT token, query params: page?, limit?, search?, labelId?
// Output: { success: boolean, contacts: IContact[], total: number, page: number, pages: number }
router.get("/", authMiddleware, getAllContacts);

// GET /api/contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, contact: IContact }
router.get("/:id", authMiddleware, getContact);

// POST /api/contacts
// Input: Authorization header with JWT token, { firstname: string, lastname: string, email?: string, phone: string, address?: string, photoUrl?: string, labels?: ObjectId[] }
// Output: { success: boolean, message: string, contact: IContact }
router.post("/", authMiddleware, createContact);

// PUT /api/contacts/:id
// Input: Authorization header with JWT token, { firstname?: string, lastname?: string, email?: string, phone?: string, address?: string, photoUrl?: string, labels?: ObjectId[] }
// Output: { success: boolean, message: string, contact: IContact }
router.put("/:id", authMiddleware, updateContact);

// DELETE /api/contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", authMiddleware, deleteContact);

// POST /api/contacts/:id/share
// Input: Authorization header with JWT token, { sharedWithUserId: ObjectId }
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.post("/:id/share", authMiddleware, shareContact);

export default router;
