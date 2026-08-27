import Resource from "../models/Resource.model.js";
import Folder from "../models/Folder.model.js";
import ApiError from "../utils/ApiError.js";
import { scoped } from "../utils/visibility.js";
import ResourceComment from "../models/ResourceComment.model.js";
import Bookmark from "../models/Bookmark.model.js";

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
  const saved = await Bookmark.exists({ user: req.user._id, resource: resource._id });
  res.json({ ...resource.toObject(), isSaved: Boolean(saved) });
}

async function list(req, res) {
  const { owner, folder, category, tag, q, sort } = req.query;

  const filter = {};
  if (owner) filter.owner = owner;
  if (folder) filter.folder = folder;
  if (category) filter.category = category;

  // The filter panel can send more than one tag: ?tag=react&tag=auth
  // $all means the resource has to carry every tag that was ticked.
  if (tag) {
    const tags = Array.isArray(tag) ? tag : [tag];
    filter.tags = { $all: tags.map((t) => t.toLowerCase()) };
  }

  const query = scoped(req.user._id, filter);

  // $text has to sit at the top level, not inside the $and that scoped() builds.
  if (q) query.$text = { $search: q };

  let order = { createdAt: -1 };
  if (sort === "forks") order = { forkCount: -1, createdAt: -1 };
  if (sort === "saves") order = { bookmarkCount: -1, createdAt: -1 };
  // A search with no chosen order comes back by relevance instead of by date.
  if (q && !sort) order = { score: { $meta: "textScore" } };

  const resources = await Resource.find(
    query,
    q ? { score: { $meta: "textScore" } } : {}
  )
    .populate("owner", OWNER_FIELDS)
    .sort(order)
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
  // Comments and bookmarks are useless without a resource, so they go with it.  
  await ResourceComment.deleteMany({ resource: resource._id });
  await Bookmark.deleteMany({ resource: resource._id });  

  await resource.deleteOne();
  res.json({ message: "Resource deleted" });
}

async function fork(req, res) {
  const viewerId = req.user._id;
  const { folder: folderId } = req.body;

  const source = await Resource.findOne(scoped(viewerId, { _id: req.params.id }));
  if(!source) throw ApiError.notFound("Resource noy found");
  if (String(source.owner) === String(viewerId)) {
    throw ApiError.badRequest("You can't fork your own resource");
  }

  const folder = await Folder.findOne({ _id: folderId, owner: viewerId });
  if(!folder) throw ApiError.badRequest("Choose one of your own folders");

  const copy = await Resource.create({
    owner: viewerId,
    folder: folder._id,
    title: source.title,
    description: source.description,
    body: source.body,
    code: source.code,
    language: source.language,
    category: source.category,
    tags: [...source.tags],
    stack: [...source.stack],
    links: source.links.map((l) => l.toObject()),
    previewImageUrl: source.previewImageUrl,
    visibility: "private",
    forkedFrom: source._id,
  });

  await Resource.updateOne({ _id: source._id }, {$inc: { forkCount: 1 } });
  await copy.populate("owner", OWNER_FIELDS);
  res.status(201).json(copy);
}

async function lineage(req, res) {
  const viewerId = req.user?._id;

  const root = await Resource.findOne(scoped(viewerId, { _id: req.params.id }))
  .select("title owner forkedFrom forkCount createdAt")
  .populate("owner", OWNER_FIELDS)

  if (!root) throw ApiError.notFound("Resource not found");
  const forks = await Resource.find(scoped(viewerId, { forkedFrom: root._id }))
  .select("title owner forkCount createdAt")
  .populate("owner", OWNER_FIELDS)
  .sort({ createdAt: 1});

  res.json({ root, forks });
}

export { create, getOne, list, update, remove, fork, lineage };
