import { Schema, model } from "mongoose";
const SharedContactSchema = new Schema({
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
    sharedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const SharedContact = model("SharedContact", SharedContactSchema);
//# sourceMappingURL=SharedContact.js.map