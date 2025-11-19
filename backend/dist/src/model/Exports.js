import { Schema, model } from "mongoose";
const ExportSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    format: {
        type: String,
        enum: ["csv", "vcf"],
        required: true,
    },
    status: {
        type: String,
        enum: ["completed", "in_progress", "failed"],
        default: "in_progress",
    },
    labelId: {
        type: Schema.Types.ObjectId,
        ref: "Label",
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Export = model("Export", ExportSchema);
//# sourceMappingURL=Exports.js.map