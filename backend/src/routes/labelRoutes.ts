import { Router, Request, Response } from "express";

const router = Router();

// GET /api/labels
// Input: Authorization header with JWT token
// Output: { success: boolean, labels: ILabel[] }
router.get("/", async (req: Request, res: Response) => {
  // TODO: Implement get all labels for user logic (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
});

// GET /api/labels/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, label: ILabel }
router.get("/:id", async (req: Request, res: Response) => {
  // TODO: Implement get single label logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

// POST /api/labels
// Input: Authorization header with JWT token, { name: string, color?: string, description?: string }
// Output: { success: boolean, message: string, label: ILabel }
router.post("/", async (req: Request, res: Response) => {
  // TODO: Implement create label logic (requires auth middleware)
  res.status(501).json({ message: "Not implemented" });
});

// PUT /api/labels/:id
// Input: Authorization header with JWT token, { name?: string, color?: string, description?: string }
// Output: { success: boolean, message: string, label: ILabel }
router.put("/:id", async (req: Request, res: Response) => {
  // TODO: Implement update label logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

// DELETE /api/labels/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", async (req: Request, res: Response) => {
  // TODO: Implement delete label logic (requires auth middleware, check ownership)
  res.status(501).json({ message: "Not implemented" });
});

export default router;
