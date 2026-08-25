import Bookmark from "../models/Bookmark.model.js";
import Resource from "../models/Resource.model.js";
import ApiError from "../utils/ApiError.js";
import { scoped } from "../utils/visibility.js";

async function create(req, res) {
    const userId = req.user._id;
    const { resource: resourceId } = req.body;

    const resource = await Resource.findOne(scoped(userId, { _id: resourceId }));
    if (!resource) throw ApiError.notFound("Resource not found");

    const existing = await Bookmark.findOne({ user: userId, resource: resourceId });
    if (existing) return res.status(200).json(existing);

    const bookmark = await Bookmark.create({ user: userId, resource: resourceId });
    await Resource.updateOne({ _id: resourceId }, { $inc: { bookmarkCount: 1 } });

    res.status(201).json(bookmark);
}

async function remove(req, res) {
    const bookmark = await Bookmark.findOneAndDelete({
        user: req.user._id,
        resource: req.params.resourceId,
    });

    if (bookmark) {
        await Resource.updateOne(
            { _id: req.params.resourceId }, { $inc: { bookmarkCount: -1 } });
    };

    res.json({ message: "Bookmark removed" });
}

async function listMine(req, res) {
    const bookmarks = await Bookmark.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
        path: "resource",
        populate: { path: "owner", select: "username name avatarUrl" },
    });
    res.json(bookmarks.filter((b)  => b.resource));
}

export { create, remove, listMine };

