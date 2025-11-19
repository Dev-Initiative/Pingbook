import { Schema, model } from "mongoose";
const SettingsSchema = new Schema({
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
}, { timestamps: { createdAt: false, updatedAt: true } });
export const Settings = model("Settings", SettingsSchema);
//# sourceMappingURL=Settings.js.map