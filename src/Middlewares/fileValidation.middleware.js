import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { badRequestException } from "../Utils/response/error.response.js";

export const validateMagicBytes = (allowedMimeTypes = []) => {
  return async (req, res, next) => {
    // If no file was uploaded, skip validation
    if (!req.file) return next();

    try {
      // 1. Inspect the actual file header on disk
      const fileHeader = await fileTypeFromFile(req.file.path);

      // 2. Check if file-type detected a valid format and if it's allowed
      if (!fileHeader || !allowedMimeTypes.includes(fileHeader.mime)) {
        // Delete the unsafe file from the uploads directory immediately
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(badRequestException("Security Alert: Invalid or spoofed file content!"));
      }

      next();
    } catch (error) {
      // Delete file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(error);
    }
  };
};
