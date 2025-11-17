import { Schema, model, Document } from "mongoose";

export interface IExport extends Document {
  userId: Schema.Types.ObjectId; // the id of the user who made the export
  filePath: string; // path to the exported file
  format: "csv" | "vcf"; // format of the exported file
  status: "completed" | "in_progress" | "failed"; // status of the export

  /*id if the export is for a specific label ( it was in your schema but I don't think it's necessary )
    In my Label Schema there's no reference to exports, so I assume if this will be added then
    exports are general unless specified
  */
  labelId?: Schema.Types.ObjectId;

  createdAt: Date; // date when the export was created
}

const ExportSchema = new Schema<IExport>(
  {
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
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Export = model<IExport>("Export", ExportSchema);
