// settingsController.ts
import { Response } from "express";
import { Settings } from "../model/Settings.js";
import { SettingsRequest } from "../middleware/settingsMiddleware.js";
/**
 * Get user settings
 */
export const getSettings = async (req: SettingsRequest, res: Response) => {
  try {
    if (!req.userSettings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }
    res.json({ success: true, settings: req.userSettings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Create user settings
 */
export const createSettings = async (req: SettingsRequest, res: Response) => {
  try {
    if (req.userSettings) {
      return res.status(400).json({ success: false, message: "Settings already exist" });
    }

    const newSettings = new Settings({ userId: req.userId, ...req.body });
    await newSettings.save();

    res.json({ success: true, message: "Settings created", settings: newSettings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (req: SettingsRequest, res: Response) => {
  try {
    if (!req.userSettings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }

    const updated = await Settings.findOneAndUpdate(
      { userId: req.userId },
      { $set: req.body },
      { new: true }
    );

    res.json({ success: true, message: "Settings updated", settings: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
