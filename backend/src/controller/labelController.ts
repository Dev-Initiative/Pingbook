import { Response } from "express";
import { Label } from "../model/Label.js";
import { Contact } from "../model/Contact.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// GET ALL LABELS FOR USER
export async function getAllLabels(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const labels = await Label.find({ userId }).populate(
      "contacts",
      "firstname lastname email"
    );

    return res.status(200).json({
      success: true,
      labels,
    });
  } catch (error) {
    console.error("Get all labels error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching labels",
    });
  }
}

// GET SINGLE LABEL
export async function getLabel(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const label = await Label.findOne({ _id: id, userId }).populate(
      "contacts",
      "firstname lastname email"
    );

    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label not found",
      });
    }

    return res.status(200).json({
      success: true,
      label,
    });
  } catch (error) {
    console.error("Get label error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching label",
    });
  }
}

// CREATE LABEL
export async function createLabel(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { name, color, description } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const newLabel = new Label({
      name,
      color,
      description,
      userId,
      contacts: [],
    });

    const savedLabel = await newLabel.save();

    return res.status(201).json({
      success: true,
      message: "Label created successfully",
      label: savedLabel,
    });
  } catch (error) {
    console.error("Create label error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating label",
    });
  }
}

// UPDATE LABEL
export async function updateLabel(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, color, description } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const label = await Label.findOne({ _id: id, userId });
    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label not found",
      });
    }

    label.name = name || label.name;
    label.color = color || label.color;
    label.description = description || label.description;

    const updatedLabel = await label.save();

    return res.status(200).json({
      success: true,
      message: "Label updated successfully",
      label: updatedLabel,
    });
  } catch (error) {
    console.error("Update label error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating label",
    });
  }
}

// DELETE LABEL
export async function deleteLabel(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const label = await Label.findOneAndDelete({ _id: id, userId });

    if (!label) {
      return res.status(404).json({
        success: false,
        message: "Label not found",
      });
    }

    // Remove label from contacts
    await Contact.updateMany({ labels: id }, { $pull: { labels: id } });

    return res.status(200).json({
      success: true,
      message: "Label deleted successfully",
    });
  } catch (error) {
    console.error("Delete label error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting label",
    });
  }
}
