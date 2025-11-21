import { Response } from "express";
import { SharedContact } from "../model/SharedContact.js";
import { Contact } from "../model/Contact.js";
import { User } from "../model/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// CREATE SHARED CONTACT
export async function createSharedContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { contacts, sharedWithUserId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Contacts array is required and cannot be empty",
        });
    }

    if (!sharedWithUserId) {
      return res
        .status(400)
        .json({ success: false, message: "sharedWithUserId is required" });
    }

    // Check if recipient exists
    const recipient = await User.findById(sharedWithUserId);
    if (!recipient) {
      return res
        .status(404)
        .json({ success: false, message: "Recipient user not found" });
    }

    // Check if all contacts exist and belong to the sender
    const contactDocs = await Contact.find({ _id: { $in: contacts }, userId });
    if (contactDocs.length !== contacts.length) {
      return res
        .status(400)
        .json({
          success: false,
          message: "One or more contacts not found or do not belong to you",
        });
    }

    // Check if already shared (optional: prevent duplicate shares)
    const existingShare = await SharedContact.findOne({
      sharedByUserId: userId,
      sharedWithUserId,
      contacts: { $in: contacts },
      status: "pending",
    });
    if (existingShare) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Contact(s) already shared with this user",
        });
    }

    const newSharedContact = new SharedContact({
      contacts,
      sharedByUserId: userId,
      sharedWithUserId,
      status: "pending",
    });

    const savedSharedContact = await newSharedContact.save();

    return res.status(201).json({
      success: true,
      message: "Contact(s) shared successfully",
      sharedContact: savedSharedContact,
    });
  } catch (error) {
    console.error("Create shared contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sharing contact",
    });
  }
}

// GET ALL SHARED CONTACTS (sent and received)
export async function getAllSharedContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // This would need to be implemented based on how shared contacts are tracked
    // For now, return empty array
    const sharedContacts = await SharedContact.find({
      $or: [{ sharedByUserId: userId }, { sharedWithUserId: userId }],
      ...(status && { status }),
    }).populate("contacts", "firstname lastname email phone");

    return res.status(200).json({
      success: true,
      sharedContacts,
    });
  } catch (error) {
    console.error("Get all shared contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching shared contacts",
    });
  }
}

// GET RECEIVED SHARED CONTACTS
export async function getReceivedSharedContacts(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContacts = await SharedContact.find({
      sharedWithUserId: userId,
      ...(status && { status }),
    }).populate("contacts", "firstname lastname email phone");

    return res.status(200).json({
      success: true,
      sharedContacts,
    });
  } catch (error) {
    console.error("Get received shared contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching received shared contacts",
    });
  }
}

// GET SENT SHARED CONTACTS
export async function getSentSharedContacts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContacts = await SharedContact.find({
      sharedByUserId: userId,
      ...(status && { status }),
    }).populate("contacts", "firstname lastname email phone");

    return res.status(200).json({
      success: true,
      sharedContacts,
    });
  } catch (error) {
    console.error("Get sent shared contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching sent shared contacts",
    });
  }
}

// GET SHARED CONTACT STATUS
export async function getSharedContactStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContact = await SharedContact.findById(id);

    if (!sharedContact) {
      return res.status(404).json({
        success: false,
        message: "Shared contact not found",
      });
    }

    // Check if user is involved
    if (
      sharedContact.sharedByUserId.toString() !== userId &&
      sharedContact.sharedWithUserId.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      status: sharedContact.status,
    });
  } catch (error) {
    console.error("Get shared contact status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching shared contact status",
    });
  }
}

// ACCEPT SHARED CONTACT
export async function acceptSharedContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContact = await SharedContact.findById(id);

    if (!sharedContact) {
      return res.status(404).json({
        success: false,
        message: "Shared contact not found",
      });
    }

    // Check if user is the recipient
    if (sharedContact.sharedWithUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can accept shared contacts",
      });
    }

    sharedContact.status = "accepted";
    await sharedContact.save();

    return res.status(200).json({
      success: true,
      message: "Shared contact accepted",
      sharedContact,
    });
  } catch (error) {
    console.error("Accept shared contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while accepting shared contact",
    });
  }
}

// REJECT SHARED CONTACT
export async function rejectSharedContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContact = await SharedContact.findById(id);

    if (!sharedContact) {
      return res.status(404).json({
        success: false,
        message: "Shared contact not found",
      });
    }

    // Check if user is the recipient
    if (sharedContact.sharedWithUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the recipient can reject shared contacts",
      });
    }

    sharedContact.status = "rejected";
    await sharedContact.save();

    return res.status(200).json({
      success: true,
      message: "Shared contact rejected",
      sharedContact,
    });
  } catch (error) {
    console.error("Reject shared contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rejecting shared contact",
    });
  }
}

// DELETE SHARED CONTACT
export async function deleteSharedContact(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const sharedContact = await SharedContact.findById(id);

    if (!sharedContact) {
      return res.status(404).json({
        success: false,
        message: "Shared contact not found",
      });
    }

    // Check if user is the sender
    if (sharedContact.sharedByUserId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the sender can delete shared contacts",
      });
    }

    await SharedContact.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Shared contact deleted",
    });
  } catch (error) {
    console.error("Delete shared contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting shared contact",
    });
  }
}
