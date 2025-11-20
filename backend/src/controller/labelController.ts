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
    const { name, color, description, contacts } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate contacts if provided
    if (contacts && contacts.length > 0) {
      for (const contactId of contacts) {
        const existingContact = await Contact.findOne({
          _id: contactId,
          userId,
        });
        if (!existingContact) {
          return res.status(400).json({
            success: false,
            message: `Contact with id ${contactId} does not exist or does not belong to user`,
          });
        }
      }
    }

    const newLabel = new Label({
      name,
      color,
      description,
      userId,
      contacts: contacts || [],
    });

    const savedLabel = await newLabel.save();

    // Add label to contacts
    if (contacts && contacts.length > 0) {
      await Contact.updateMany(
        { _id: { $in: contacts } },
        { $addToSet: { labels: savedLabel._id } }
      );
    }

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
    const { name, color, description, contacts } = req.body;

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

    // Validate contacts if provided
    if (contacts && contacts.length > 0) {
      for (const contactId of contacts) {
        const existingContact = await Contact.findOne({
          _id: contactId,
          userId,
        });
        if (!existingContact) {
          return res.status(400).json({
            success: false,
            message: `Contact with id ${contactId} does not exist or does not belong to user`,
          });
        }
      }
    }

    const oldContacts = label.contacts.map((id) => id.toString());
    const newContacts = contacts
      ? contacts.map((id) => id.toString())
      : oldContacts;

    label.name = name || label.name;
    label.color = color || label.color;
    label.description = description || label.description;
    label.contacts = contacts || label.contacts;

    const updatedLabel = await label.save();

    // Update contacts: add to new contacts, remove from old contacts not in new
    const contactsToAdd = newContacts.filter(
      (contact) => !oldContacts.includes(contact)
    );
    const contactsToRemove = oldContacts.filter(
      (contact) => !newContacts.includes(contact)
    );

    if (contactsToAdd.length > 0) {
      await Contact.updateMany(
        { _id: { $in: contactsToAdd } },
        { $addToSet: { labels: updatedLabel._id } }
      );
    }

    if (contactsToRemove.length > 0) {
      await Contact.updateMany(
        { _id: { $in: contactsToRemove } },
        { $pull: { labels: updatedLabel._id } }
      );
    }

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
