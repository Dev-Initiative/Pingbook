import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  userId: Schema.Types.ObjectId;
  theme?: "light" | "dark"; // suugested setting ( if themes will be applied that is)
  notificationsEnabled: boolean; // suggested setting ( for users to receive notifications or not)
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = model<ISettings>("Settings", SettingsSchema);
