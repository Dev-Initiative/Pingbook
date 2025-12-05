import { Request, Response, NextFunction } from "express";
import { User } from "../model/User.js";

export interface UserRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  currentUser?: any;
}

export const userMiddleware = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // authMiddleware must run before this
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Get fresh user from DB
    const existingUser = await User.findById(req.user.id).select("-password");

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach sanitized user object
    req.currentUser = existingUser;

    next();
  } catch (error: any) {
    console.error("User Middleware Error:", error);

    // Handle invalid ObjectId format
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID in token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while loading user",
    });
  }
};
