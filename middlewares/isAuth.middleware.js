import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

export default function isAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(ApiError.unauthorized("No token provided"));
    }

    try {
        req.user = jwt.verify(header.split(" ")[1], process.env.TOKEN_SECRET);
        next();
    } catch {
        next(ApiError.unauthorized("Token is invalid or expired"));
    }
}