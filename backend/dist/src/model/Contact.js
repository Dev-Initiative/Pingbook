import { Schema, model } from "mongoose";
const ContactSchema = new Schema({
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
        default: "", // replace with default photo URL
    },
}, { timestamps: true });
export const Contact = model("Contact", ContactSchema);
//# sourceMappingURL=Contact.js.map