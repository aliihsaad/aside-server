import Post from "../models/Post.model.js";
import ApiError from "../utils/ApiError.js";
import { resolveMentions } from "../utils/mentions.js";
import Resource from "../models/Resource.model.js";
import { scoped } from "../utils/visibility.js";

const AUTHOR_FIELDS = "username name avatarUrl";
const LINKED_RESOURCE = {
  path: "linkedResource",
  select: "title description category tags forkCount bookmarkCount owner",
  populate: { path: "owner", select: AUTHOR_FIELDS },
};


async function create(req, res) {
  const { content, tags, imageUrl, linkedResource } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    tags,
    imageUrl,
    mentions: await resolveMentions (content),
    linkedResource: await resolveLinkedResource(linkedResource, req.user._id),
  });

  await post.populate("author", AUTHOR_FIELDS);
  await post.populate("mentions", "username name"); 
  await post.populate(LINKED_RESOURCE);
  res.status(201).json(post);
}

async function list(req, res) {
  const { author, tag } = req.query;

  const filter = {};
  if (author) filter.author = author;
  if (tag) filter.tags = tag.toLowerCase();

  const posts = await Post.find(filter)
    .populate("author", AUTHOR_FIELDS)
    .populate("mentions", "username name")
    .populate(LINKED_RESOURCE) 
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(posts);
}

async function getOne(req, res) {
  const post = await Post.findById(req.params.id)
  .populate("author", AUTHOR_FIELDS)
  .populate("mentions", "username name")
  .populate(LINKED_RESOURCE) 
  if (!post) throw ApiError.notFound("Post not found");
  res.json(post);
}

async function update(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");

  if (String(post.author) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only edit your own posts");
  }

  const { content, tags, imageUrl, linkedResource } = req.body;
  Object.assign(post, { content, tags, imageUrl, mentions: await resolveMentions(content), linkedResource: await resolveLinkedResource(linkedResource, req.user._id), });
  await post.save();

  await post.populate("author", AUTHOR_FIELDS);
  await post.populate("mentions", "username name"); 
  await post.populate(LINKED_RESOURCE);
  res.json(post);
}

async function remove(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");

  if (String(post.author) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only delete your own posts");
  }

  await post.deleteOne();
  res.json({ message: "Post deleted" });
}

async function resolveLinkedResource(resourceId, viewerId) {
  if(!resourceId) return null;

  const resource = await Resource.findOne(
    scoped(viewerId, { _id: resourceId })
  ).select("_id");

  if (!resource) throw ApiError.badRequest("That resource doesn't exist or isn't visible to you");
  return resource._id;
}

export { create, list, getOne, update, remove };
