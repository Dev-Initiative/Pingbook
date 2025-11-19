import { Router, Request, Response } from "express";

const router = Router();

// GET /api/contacts
// Input: Authorization header with JWT token, query params: page?, limit?, search?, labelId?
// Output: { success: boolean, contacts: IContact[], total: number, page: number, pages: number }
router.get("/", async (req: Request, res: Response) => {
  // TODO: Implement get all contacts for user logic (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
});

// GET /api/contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, contact: IContact }
router.get("/:id", async (req: Request, res: Response) => {
  // TODO: Implement get single contact logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

// POST /api/contacts
// Input: Authorization header with JWT token, { firstname: string, lastname: string, email: string, phone: string, address?: string, photoUrl?: string, labels?: ObjectId[] }
// Output: { success: boolean, message: string, contact: IContact }
router.post("/", async (req: Request, res: Response) => {
  // TODO: Implement create contact logic (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
});

// PUT /api/contacts/:id
// Input: Authorization header with JWT token, { firstname?: string, lastname?: string, email?: string, phone?: string, address?: string, photoUrl?: string, labels?: ObjectId[] }
// Output: { success: boolean, message: string, contact: IContact }
router.put("/:id", async (req: Request, res: Response) => {
  // TODO: Implement update contact logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

// DELETE /api/contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", async (req: Request, res: Response) => {
  // TODO: Implement delete contact logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

// POST /api/contacts/:id/share
// Input: Authorization header with JWT token, { sharedWithUserId: ObjectId }
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.post("/:id/share", async (req: Request, res: Response) => {
  // TODO: Implement share contact logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

export default router;
