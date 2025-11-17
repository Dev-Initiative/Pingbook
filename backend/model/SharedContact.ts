import { Schema, model, Document } from "mongoose";

export interface ISharedContact extends Document {
  contactId: Schema.Types.ObjectId; // the id of the contact being shared
  sharedWithUserId: Schema.Types.ObjectId; // the id of the user that the contact was shared to
  status: "accepted" | "pending" | "rejected"; // status of the shared contact
  sharedAt: Date; // date when the contact was shared
}

const SharedContactSchema = new Schema(
  {
    contactId: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    sharedWithUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "pending", "rejected"],
      default: "pending",
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SaredContact = model<ISharedContact>(
  "SharedContact",
  SharedContactSchema
);
