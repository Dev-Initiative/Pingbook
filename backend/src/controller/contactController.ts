import { Response } from "express";
import { Contact } from "../model/Contact.js";
import { Label } from "../model/Label.js";
import { SharedContact } from "../model/SharedContact.js";
import { Notification } from "../model/Notification.js";
import { User } from "../model/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// GET ALL CONTACTS FOR USER
export async function getAllContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10, search, labelId } = req.query;
    // use Number.parseInt rather
    const pageNum = Number.parseInt(page as string, 10);
    const limitNum = Number.parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { userId };

    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (labelId) {
      query.labels = labelId;
    }

    const contacts = await Contact.find(query)
      .populate("labels", "name color")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);

    return res.status(200).json({
      success: true,
      contacts,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Get all contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
}

// GET SINGLE CONTACT
export async function getContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const contact = await Contact.findOne({ _id: id, userId }).populate(
      "labels",
      "name color"
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contact",
    });
  }
}

// CREATE CONTACT
export async function createContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { firstname, lastname, email, phone, address, photoUrl, labels } =
      req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!firstname || !lastname || !phone) {
      return res.status(400).json({
        success: false,
        message: "Firstname, lastname, and phone are required",
      });
    }

    // Validate labels based on id's if provided
    if (labels && labels.length > 0) {
      for (const labelId of labels) {
        const existingLabel = await Label.findOne({
          _id: labelId,
          userId,
        });
        if (!existingLabel) {
          return res.status(400).json({
            success: false,
            message: `Label with id ${labelId} does not exist or does not belong to user`,
          });
        }
      }
    }

    const newContact = new Contact({
      firstname,
      lastname,
      email,
      phone,
      address,
      photoUrl,
      userId,
      labels: labels || [],
    });

    const savedContact = await newContact.save();

    // Add contact to labels
    if (labels && labels.length > 0) {
      await Label.updateMany(
        { _id: { $in: labels } },
        { $addToSet: { contacts: savedContact._id } }
      );
    }

    await savedContact.populate("labels", "name color");

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact: savedContact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating contact",
    });
  }
}

// UPDATE CONTACT
export async function updateContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { firstname, lastname, email, phone, address, photoUrl, labels } =
      req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const contact = await Contact.findOne({ _id: id, userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Validate labels based on id's if provided
    if (labels && labels.length > 0) {
      for (const labelId of labels) {
        const existingLabel = await Label.findOne({
          _id: labelId,
          userId,
        });
        if (!existingLabel) {
          return res.status(400).json({
            success: false,
            message: `Label with id ${labelId} does not exist or does not belong to user`,
          });
        }
      }
    }

    const oldLabels = contact.labels.map((id) => id.toString());
    const newLabels = labels ? labels.map((id) => id.toString()) : oldLabels;

    contact.firstname = firstname || contact.firstname;
    contact.lastname = lastname || contact.lastname;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;
    contact.address = address || contact.address;
    contact.photoUrl = photoUrl || contact.photoUrl;
    contact.labels = labels || contact.labels; // Keep as ObjectIds

    const updatedContact = await contact.save();

    // Update labels: add to new labels, remove from old labels not in new
    const labelsToAdd = newLabels.filter((label) => !oldLabels.includes(label));
    const labelsToRemove = oldLabels.filter(
      (label) => !newLabels.includes(label)
    );

    if (labelsToAdd.length > 0) {
      await Label.updateMany(
        { _id: { $in: labelsToAdd } },
        { $addToSet: { contacts: updatedContact._id } }
      );
    }

    if (labelsToRemove.length > 0) {
      await Label.updateMany(
        { _id: { $in: labelsToRemove } },
        { $pull: { contacts: updatedContact._id } }
      );
    }

    await updatedContact.populate("labels", "name color");

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating contact",
    });
  }
}

// DELETE CONTACT
export async function deleteContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const contact = await Contact.findOneAndDelete({ _id: id, userId });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Remove contact from labels
    await Label.updateMany({ contacts: id }, { $pull: { contacts: id } });

    // Find users who had this contact shared with them and notify them
    const sharedContacts = await SharedContact.find({ contactId: id });
    if (sharedContacts.length > 0) {
      const sharedUserIds = sharedContacts.map((share) =>
        share.sharedWithUserId.toString()
      );
      // Create notifications for each shared user
      const notifications = sharedUserIds.map((sharedUserId) => ({
        userId: sharedUserId,
        message: "A shared contact has been deleted by the owner",
        type: "contact_deleted",
      }));
      await Notification.insertMany(notifications);

      // Optionally, delete the SharedContact records
      await SharedContact.deleteMany({ contactId: id });
    }

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting contact",
    });
  }
}

// SHARE CONTACT
export async function shareContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { sharedWithUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const contact = await Contact.findOne({ _id: id, userId });
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    // Check if already shared
    const existingShare = await SharedContact.findOne({
      contactId: id,
      sharedWithUserId,
    });

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: "Contact already shared with this user",
      });
    }

    const newSharedContact = new SharedContact({
      contactId: id,
      sharedByUserId: userId,
      sharedWithUserId,
    });

    const savedSharedContact = await newSharedContact.save();
    await savedSharedContact.populate(
      "contactId",
      "firstname lastname email phone"
    );

    // Create notification for the recipient
    const sharer = await User.findById(userId).select("username");
    const notificationMessage = sharer
      ? `${sharer.username} shared a contact with you`
      : "You have a new shared contact";
    const notification = new Notification({
      userId: sharedWithUserId,
      message: notificationMessage,
      type: "contact_shared",
    });
    await notification.save();

    return res.status(201).json({
      success: true,
      message: "Contact shared successfully",
      sharedContact: savedSharedContact,
    });
  } catch (error) {
    console.error("Share contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sharing contact",
    });
  }
}
