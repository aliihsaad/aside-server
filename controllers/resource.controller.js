import Resource from "../models/Resource.model.js";
import Folder from "../models/Folder.model.js";
import ApiError from "../utils/ApiError.js";
import { scoped } from "../utils/visibility.js";

const OWNER_FIELDS = "username name avatarUrl";


function pickWritable(payload) {
  const {
    title, description, body, code, language,
    category, tags, stack, links, previewImageUrl, visibility,
  } = payload;

  const fields = {
    title, description, body, code, language,
    category, tags, stack, links, previewImageUrl, visibility,
  };

  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined)
  );
}

async function create(req, res) {
  const { folder: folderId } = req.body;

  const folder = await Folder.findOne({ _id: folderId, owner: req.user._id });
  if (!folder) throw ApiError.badRequest("Choose one of your own folders");

  const resource = await Resource.create({
    ...pickWritable(req.body),
    owner: req.user._id,
    folder: folder._id,
  });

  await resource.populate("owner", OWNER_FIELDS);
  res.status(201).json(resource);
}

async function getOne(req, res) {
  const resource = await Resource.findOne(scoped(req.user._id, { _id: req.params.id }))
    .populate("owner", OWNER_FIELDS)
    .populate("folder", "name colour")
    .populate({
      path: "forkedFrom",
      select: "title owner",
      populate: { path: "owner", select: OWNER_FIELDS },
    });

  if (!resource) throw ApiError.notFound("Resource not found");
  res.json(resource);
}

async function list(req, res) {
  const { owner, folder, category, tag } = req.query;

  const filter = {};
  if (owner) filter.owner = owner;
  if (folder) filter.folder = folder;
  if (category) filter.category = category;
  if (tag) filter.tags = tag.toLowerCase();

  const resources = await Resource.find(scoped(req.user._id, filter))
    .populate("owner", OWNER_FIELDS)
    .sort({ createdAt: -1 })
    .limit(60);

  res.json(resources);
}

async function update(req, res) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw ApiError.notFound("Resource not found");

  if (String(resource.owner) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only edit your own resources");
  }

  if (req.body.folder && String(req.body.folder) !== String(resource.folder)) {
    const folder = await Folder.findOne({ _id: req.body.folder, owner: req.user._id });
    if (!folder) throw ApiError.badRequest("Choose one of your own folders");
    resource.folder = folder._id;
  }

  Object.assign(resource, pickWritable(req.body));
  await resource.save();

  await resource.populate("owner", OWNER_FIELDS);
  res.json(resource);
}

async function remove(req, res) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw ApiError.notFound("Resource not found");

  if (String(resource.owner) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only delete your own resources");
  }

  await Resource.updateMany({ forkedFrom: resource._id }, { forkedFrom: null });

  await resource.deleteOne();
  res.json({ message: "Resource deleted" });
}

export { create, getOne, list, update, remove };
