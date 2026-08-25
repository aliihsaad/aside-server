import { Router } from "express";
import multer from "multer";
import isAuth from "../middlewares/isAuth.middleware.js";
import { uploadFile } from "../controllers/upload.controller.js";
import ApiError from "../utils/ApiError.js";

const router = Router();
const ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED.includes(file.mimetype)) {
            return cb(ApiError.badRequest(`${file.mimetype} files are not allowed here`));
        }
        cb(null, true);
    },
})

router.post("/", isAuth, upload.single("file"), uploadFile);

export default router;