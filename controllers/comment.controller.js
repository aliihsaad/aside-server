import mongoose from "mongoose";
import Comment from "../models/Comment.model.js";
import ApiError from "../utils/ApiError.js";

const AUTHOR_FIELDS = "username name avatarUrl";

async function assertTargetExists(targetType, targetId) {
    if (!["Post", "Resource"].includes(targetType)) {
        throw ApiError.badRequest("Invalid target type");
    }
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw ApiError.badRequest("Invalid target id");
    }

    const Model = mongoose.model(targetType);
    const exists = await Model.exists({ _id: targetId });
    if (!exists) throw ApiError.notFound(`That ${targetType.toLowerCase()} doesn't exist`);
}

async function create(req, res) {
    const { content, targetType, targetId } = req.body;

    await assertTargetExists(targetType, targetId);
    const comment = await Comment.create({
        author: req.user._id,
        content,
        targetType,
        targetId,
    });
    await comment.populate("author", AUTHOR_FIELDS);
    res.status(201).json(comment);
}

async function list(req, res) {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
        throw ApiError.badRequest("targetType and targetId are required")
    }

    const comments = await Comment.find({ targetType, targetId })
    .populate("author", AUTHOR_FIELDS)
    .sort({ createdAt: 1 });

    res.json(comments);
}

async function update(req, res) {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw ApiError.notFound("Comment not found");

    if (String(comment.author) !== String(req.user._id)) {
        throw ApiError.forbidden("You can only edit your own comments");
    }

    comment.content = req.body.content;
    await comment.save();
    await comment.populate("author", AUTHOR_FIELDS);
    res.json(comment);
}

async function remove(req, res) {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw ApiError.notFound("Comment not found");
    if (String(comment.author) !== String(req.user._id)) {
        throw ApiError.forbidden("You can only delete your own comments");
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted"});
}

export { create, list, update, remove };
