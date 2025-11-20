// exportController.ts
import { Response } from "express";
import { ExportRequest } from "../middleware/exportMiddleware.js";
import { Export } from "../model/Exports.js";

/** Get all exports for the user */
export const getAllExports = async (req: ExportRequest, res: Response) => {
  try {
    const exports = await Export.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, exports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Get a single export (preloaded by middleware) */
export const getExport = async (req: ExportRequest, res: Response) => {
  res.json({ success: true, export: req.exportDoc });
};

/** Create a new export */
export const createExport = async (req: ExportRequest, res: Response) => {
  try {
    const { format, labelId } = req.body;
    if (!format || !["csv", "vcf"].includes(format)) {
      return res.status(400).json({ success: false, message: "Invalid format" });
    }

    const newExport = new Export({
      userId: req.userId,
      format,
      labelId,
      status: "in_progress",
    });

    await newExport.save();
    res.json({ success: true, message: "Export created", export: newExport });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Download export file */
export const downloadExport = async (req: ExportRequest, res: Response) => {
  try {
    if (req.exportDoc!.status !== "completed") {
      return res.status(400).json({ success: false, message: "Export not ready for download" });
    }

    // For now, just simulate download
    res.setHeader("Content-Disposition", `attachment; filename=export.${req.exportDoc!.format}`);
    res.send(`Simulated ${req.exportDoc!.format} export file content`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Delete export */
export const deleteExport = async (req: ExportRequest, res: Response) => {
  try {
    await req.exportDoc!.deleteOne();
    res.json({ success: true, message: "Export deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
