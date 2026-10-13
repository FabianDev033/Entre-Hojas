import multer from "multer";
import { HttpError } from "../utils/http-error.js";

export const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 2, fieldSize: 200_000, parts: 12 },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new HttpError(400, "Usá imágenes JPG, PNG o WebP."));
      return;
    }
    callback(null, true);
  },
}).array("imagenes", 10);
