import { v2 as cloudinary } from "cloudinary";
import ApiError from "../utils/ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = "Aside-Project";

function uploadFile(req, res, next) {
    if (!req.file) throw ApiError.badRequest("No file provided");

    const stream = cloudinary.uploader.upload_stream(
     {
        folder: FOLDER,
        asset_folder: FOLDER,
        resource_type: "auto",
     },
     (error, result) => {
        if (error) return next(error);
        res.status(201).json({  url: result.secure_url });
     }
    );
    stream.end(req.file.buffer);
}

export { uploadFile };