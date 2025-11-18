import { Schema, model, Document } from "mongoose";

export interface IContact extends Document {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  address: string;
  userId: Schema.Types.ObjectId; // the id of the user that added the contact
  photoUrl: string;
  labels: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    photoUrl: {
      type: String,
      default: "", // replace with default photoURL if needed
    },
    labels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Label",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const Contact = model<IContact>("Contact", ContactSchema);
