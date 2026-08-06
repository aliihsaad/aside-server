export default class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isApiError = true;
        // trace starts at the line that actually threw instead of at this file.
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg ="Bad request") {return new ApiError(400, msg); }
    static unauthorized(msg = "Unauthorized") { return new ApiError(401, msg); }
    static forbidden(msg = "You can't do that") { return new ApiError(403, msg); }
    static notFound(msg = "Not found") {return new ApiError(404, msg); }
    static conflict(msg = "Already exists") { return new ApiError(409, msg); }
}