import { Schema, model, Document } from "mongoose";

export interface IExport extends Document {
  userId: Schema.Types.ObjectId; // the id of the user who made the export
  format: "csv" | "vcf"; // format of the exported file
  status: "completed" | "in_progress" | "failed"; // status of the export
  labelId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExportSchema = new Schema<IExport>(
  {
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
  },
  { timestamps: true } // Use standard timestamps
);

export const Export = model<IExport>("Export", ExportSchema);
