import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
  emailVerified: boolean;
  settings?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  avatar?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    settings: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    avatar: {
      type: String,
      default: "", // set a default avatarURL if needed
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
