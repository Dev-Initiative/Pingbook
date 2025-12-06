import { Response } from "express";
import { Notification } from "../model/Notification.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// GET ALL NOTIFICATIONS FOR USER
export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
    });
  }
}

// MARK NOTIFICATION AS READ
export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while marking notification as read",
    });
  }
}
