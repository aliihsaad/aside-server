import Folder from "../models/Folder.model.js";
import Resource from "../models/Resource.model.js"
import ApiError from "../utils/ApiError.js"

async function create(req, res) {
    const { name, description, colour, order } = req.body;
    const folder = await Folder.create({
        owner: req.user._id,
        name,
        description,
        colour,
        order,
    });
    res.status(201).json(folder);
}

async function listbyUser(req, res) {
    const folder = await Folder.find({ owner: req.params.userId }).sort({
        order: 1,
        name: 1,
    });
    res.json(folder);
}

async function update(req, res) {
    const folder = await Folder.findById(req.params.id);
    if (!folder) throw ApiError.notFound("Folder not found");
    if (String(folder.owner) !== String(req.user._id)) {
        throw ApiError.forbidden("you can only edit your own folders");
    }

    const { name, description, colour, order } = req.body;
    Object.assign(folder, { name, description, colour, order });
    await folder.save();
    res.json(folder);
}

async function remove(req, res) {
    const folder = await Folder.findById(req.params.id);
    if(!folder) throw ApiError.notFound("Folder not found");
    if (String(folder.owner) !== String(req.user._id)) {
        throw ApiError.forbidden("You can only delete your own folders");
    }

    const count = await Resource.countDocuments({ folder: folder._id });
    if (count > 0) {
        throw ApiError.badRequest(
            `Move or delete the ${count} resource${count === 1 ? "" : "s"} in this folder first`
        );
    }

    await folder.deleteOne();
    res.json({ message: "Folder deleted" });
}

async function getOne(req, res) {
    const folder = await Folder.findById(req.params.id).populate(
        "owner",
        "username name avatarUrl"
    );

    if (!folder) {
        throw ApiError.notFound("Folder not found");
    }

    res.json(folder);
}

export { create, listbyUser, getOne, update, remove };