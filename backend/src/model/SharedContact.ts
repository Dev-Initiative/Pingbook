import { Schema, model, Document } from "mongoose";

export interface ISharedContact extends Document {
  contacts: Schema.Types.ObjectId[]; // array of contact ids being shared
  sharedByUserId: Schema.Types.ObjectId; // the id of the user that shared the contacts
  sharedWithUserId: Schema.Types.ObjectId; // the id of the user that the contacts were shared to
  status: "accepted" | "pending" | "rejected"; // status of the shared contact
  createdAt: Date;
  updatedAt: Date;
}

const SharedContactSchema = new Schema(
  {
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Contact",
        required: true,
      },
    ],
    sharedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true } // Use standard timestamps
);

export const SharedContact = model<ISharedContact>(
  "SharedContact",
  SharedContactSchema
);
