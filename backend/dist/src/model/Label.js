import { Schema, model } from "mongoose";
const LabelSchema = new Schema({
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
    contacts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Contact",
        },
    ],
}, { timestamps: true });
export const Label = model("Label", LabelSchema);
//# sourceMappingURL=Label.js.map