import { Response } from "express";
import { Types, Schema } from "mongoose";
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

// MERGE DUPLICATE CONTACTS
export async function mergeContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { primaryContactId, duplicateIds } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      !primaryContactId ||
      !duplicateIds ||
      !Array.isArray(duplicateIds) ||
      duplicateIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "primaryContactId and duplicateIds array are required",
      });
    }

    // Find primary contact
    const primary = await Contact.findOne({ _id: primaryContactId, userId });
    if (!primary) {
      return res.status(404).json({
        success: false,
        message: "Primary contact not found",
      });
    }

    // Find duplicates
    const duplicates = await Contact.find({
      _id: { $in: duplicateIds },
      userId,
    });
    if (duplicates.length !== duplicateIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some duplicate contacts not found",
      });
    }

    // Merge logic: fill missing fields from duplicates
    const fields = [
      "firstname",
      "lastname",
      "email",
      "phone",
      "address",
      "photoUrl",
    ];
    for (const field of fields) {
      if (!primary[field] || primary[field].trim() === "") {
        for (const dup of duplicates) {
          if (dup[field] && dup[field].trim() !== "") {
            primary[field] = dup[field];
            break;
          }
        }
      }
    }

    // Combine labels uniquely
    const allLabels = new Set(primary.labels.map((id) => id));
    for (const dup of duplicates) {
      dup.labels.forEach((id) => allLabels.add(id));
    }
    primary.labels = Array.from(allLabels).map((id: any) => {
      const val = id.valueOf ? id.valueOf() : id;
      return val instanceof Types.ObjectId
        ? val
        : new Types.ObjectId(val as any);
    }) as any;

    if (
      !primary.firstname?.trim() ||
      !primary.lastname?.trim() ||
      !primary.phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot merge: required fields (firstname, lastname, phone) must be provided and cannot be empty",
      });
    }

    // Save updated primary contact
    await primary.save();

    // Delete duplicates
    await Contact.deleteMany({ _id: { $in: duplicateIds } });

    // Update labels: remove deleted contacts
    await Label.updateMany({}, { $pull: { contacts: { $in: duplicateIds } } });

    // Handle shared contacts for duplicates
    const sharedForDuplicates = await SharedContact.find({
      contactId: { $in: duplicateIds },
    });
    if (sharedForDuplicates.length > 0) {
      const sharedUserIds = [
        ...new Set(
          sharedForDuplicates.map((s) => s.sharedWithUserId.toString())
        ),
      ];
      // Create notifications
      const notifications = sharedUserIds.map((sharedUserId) => ({
        userId: sharedUserId,
        message: "A shared contact has been merged and duplicates removed",
        type: "contact_merged",
      }));
      await Notification.insertMany(notifications);

      // Delete shared records
      await SharedContact.deleteMany({ contactId: { $in: duplicateIds } });
    }

    await primary.populate("labels", "name color");

    return res.status(200).json({
      success: true,
      message: "Contacts merged successfully",
      mergedContact: primary,
    });
  } catch (error) {
    console.error("Merge contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while merging contacts",
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
