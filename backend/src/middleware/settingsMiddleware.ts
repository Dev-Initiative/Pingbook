// settingsMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Settings, ISettings } from "../model/Settings.js"; // adjust path if needed

// Extend Express Request to include userId and optional settings
export interface SettingsRequest extends Request {
  userId?: string;
  userSettings?: ISettings;
}

export const settingsMiddleware = async (
  req: SettingsRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1️⃣ Check Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.userId = decoded.id;

    // 3️⃣ Preload settings (optional, speeds up routes)
    const settings = await Settings.findOne({ userId: req.userId });
    if (settings) {
      req.userSettings = settings;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
