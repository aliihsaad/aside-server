import Post from "../models/Post.model.js";
import ApiError from "../utils/ApiError.js";

const AUTHOR_FIELDS = "username name avatarUrl";

async function create(req, res) {
  const { content, tags, imageUrl } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    tags,
    imageUrl,
  });

  await post.populate("author", AUTHOR_FIELDS);
  res.status(201).json(post);
}

async function list(req, res) {
  const { author, tag } = req.query;

  const filter = {};
  if (author) filter.author = author;
  if (tag) filter.tags = tag.toLowerCase();

  const posts = await Post.find(filter)
    .populate("author", AUTHOR_FIELDS)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(posts);
}

async function getOne(req, res) {
  const post = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);
  if (!post) throw ApiError.notFound("Post not found");
  res.json(post);
}

async function update(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");

  if (String(post.author) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only edit your own posts");
  }

  const { content, tags, imageUrl } = req.body;
  Object.assign(post, { content, tags, imageUrl });
  await post.save();

  await post.populate("author", AUTHOR_FIELDS);
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

export { create, list, getOne, update, remove };
