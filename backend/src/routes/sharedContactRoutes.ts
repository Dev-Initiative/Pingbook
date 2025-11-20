import { Router } from "express";
import {
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

// GET /api/shared-contacts
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/", authMiddleware, getAllSharedContacts);

// GET /api/shared-contacts/received
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/received", authMiddleware, getReceivedSharedContacts);

// GET /api/shared-contacts/sent
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/sent", authMiddleware, getSentSharedContacts);

// Get /api/shared-contacts/:id/status
// Input: Authorization header with JWT token
// Output: { success: boolean, status: string }
router.get("/:id/status", authMiddleware, getSharedContactStatus);

// PUT /api/shared-contacts/:id/accept
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.put("/:id/accept", authMiddleware, acceptSharedContact);

// PUT /api/shared-contacts/:id/reject
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.put("/:id/reject", authMiddleware, rejectSharedContact);

// DELETE /api/shared-contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", authMiddleware, deleteSharedContact);

export default router;
