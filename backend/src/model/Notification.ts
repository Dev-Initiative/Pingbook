import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  message: string;
  type?: string; // e.g., 'contact_shared', 'label_updated'
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification>(
  "Notification",
  NotificationSchema
);
