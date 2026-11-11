import multer from "multer";
import path from "path";
import fs from "fs";

export const fileValidation = {
  images: ["image/png", "image/jpg", "image/jpeg", , "image/gif"],
  videos: ["video/mp4", "video/avi", "video/mov", "video/mpeg", "video/mj2"],
  audios: ["audio/3gpp2", "audio/aac", "audio/mp3"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const localFileUpload = ({ customPath = "general", validation = [] }) => {
  const basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let userBasePath = basePath;

      if (req.user?._id) userBasePath += `/${req.user._id}`;
      const fullPath = path.resolve(`./src/${userBasePath}`);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, path.resolve(fullPath));
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;

      file.finalPath = `${basePath}/${req.user?._id ? req.user._id + "/" : ""}${uniqueFilename}`;
      cb(null, uniqueFilename);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (validation.length && !validation.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  };

  return multer({ fileFilter, storage });
};
