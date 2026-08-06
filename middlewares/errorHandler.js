import ApiError from "../utils/ApiError.js";

export function notFound(req, res, next) {
    next (ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`));
}

export default function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(". ");
      return res.status(400).json({ message });
    }

    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(400).json({ message: "That id isn't valid" });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || "value";
      return res.status(409).json({ message: `That ${field} is already taken` });
    }

    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    console.error("UNHANDLED:", err);
    res.status(500).json({ message: "Something went wrong on our end" });
}