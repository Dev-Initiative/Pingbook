import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Export, IExport } from "../model/Exports.js";

export interface ExportRequest extends Request {
  userId?: string;
  exportDoc?: IExport;
}

// Auth middleware
export const authMiddleware = (req: ExportRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Middleware to preload export by ID and check ownership
export const preloadExport = async (req: ExportRequest, res: Response, next: NextFunction) => {
  try {
    const exportId = req.params.id;
    const exportDoc = await Export.findById(exportId);
    if (!exportDoc) return res.status(404).json({ success: false, message: "Export not found" });

    if (exportDoc.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    req.exportDoc = exportDoc;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
