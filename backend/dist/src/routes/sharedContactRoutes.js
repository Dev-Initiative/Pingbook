import { Router } from "express";
const router = Router();
// GET /api/shared-contacts
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/", async (req, res) => {
    // TODO: Implement get shared contacts for user logic (requires auth middleware)
    res.status(501).json({ message: "Not implemented" });
});
// GET /api/shared-contacts/received
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/received", async (req, res) => {
    // TODO: Implement get received shared contacts logic (requires auth middleware)
    res.status(501).json({ message: "Not implemented" });
});
// GET /api/shared-contacts/sent
// Input: Authorization header with JWT token, query params: status? (pending/accepted/rejected)
// Output: { success: boolean, sharedContacts: ISharedContact[] }
router.get("/sent", async (req, res) => {
    // TODO: Implement get sent shared contacts logic (requires auth middleware)
    res.status(501).json({ message: "Not implemented" });
});
// Get /api/shared-contacts/:id/status
// Input: Authorization header with JWT token
// Output: { success: boolean, status: string }
router.get("/:id/status", async (req, res) => {
    // TODO: Implement get shared contact status logic (requires auth middleware, check ownership)
    res.status(501).json({ message: "Not implemented" });
});
// PUT /api/shared-contacts/:id/accept
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.put("/:id/accept", async (req, res) => {
    // TODO: Implement accept shared contact logic (requires auth middleware, check if recipient)
    res.status(501).json({ message: "Not implemented" });
});
// PUT /api/shared-contacts/:id/reject
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string, sharedContact: ISharedContact }
router.put("/:id/reject", async (req, res) => {
    // TODO: Implement reject shared contact logic (requires auth middleware, check if recipient)
    res.status(501).json({ message: "Not implemented" });
});
// DELETE /api/shared-contacts/:id
// Input: Authorization header with JWT token
// Output: { success: boolean, message: string }
router.delete("/:id", async (req, res) => {
    // TODO: Implement delete shared contact logic (requires auth middleware, check ownership)
    res.status(501).json({ message: "Not implemented" });
});
export default router;
//# sourceMappingURL=sharedContactRoutes.js.map