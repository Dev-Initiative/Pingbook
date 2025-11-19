import { Schema, model, Document } from "mongoose";

export interface ILabel extends Document {
  name: string;
  color: string;
  description?: string;
  userId: Schema.Types.ObjectId; // the id of the user that created the label
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "#aaa",
    },
    description: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Label = model<ILabel>("Label", LabelSchema);
