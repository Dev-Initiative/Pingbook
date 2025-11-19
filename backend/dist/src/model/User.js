import { Schema, model } from "mongoose";
const UserSchema = new Schema({
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
}, { timestamps: true });
export const User = model("User", UserSchema);
//# sourceMappingURL=User.js.map