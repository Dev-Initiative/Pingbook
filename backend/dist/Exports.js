import { Schema, model } from "mongoose";
const ExportSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        enum: ["csv", "vcf"],
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Export = model("Export", ExportSchema);
//# sourceMappingURL=Exports.js.map