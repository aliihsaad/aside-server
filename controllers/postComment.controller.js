import PostComment from "../models/PostComment.model.js";
import Post from "../models/Post.model.js";
import ApiError from "../utils/ApiError.js";

const AUTHOR_FIELDS = "username name avatarUrl";

async function create(req, res) {
  const { content, post } = req.body;

  const exists = await Post.exists({ _id: post });
  if (!exists) throw ApiError.notFound("That post doesn't exist");

  const comment = await PostComment.create({
    author: req.user._id,
    post,
    content,
  });

  await comment.populate("author", AUTHOR_FIELDS);
  res.status(201).json(comment);
}

async function list(req, res) {
  const { post } = req.query;
  if (!post) throw ApiError.badRequest("A post id is required");

  const comments = await PostComment.find({ post })
    .populate("author", AUTHOR_FIELDS)
    .sort({ createdAt: 1 });

  res.status(200).json(comments);
}

async function update(req, res) {
  const comment = await PostComment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  if (String(comment.author) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only edit your own comments");
  }

  comment.content = req.body.content;
  await comment.save();

  await comment.populate("author", AUTHOR_FIELDS);
  res.status(200).json(comment);
}

async function remove(req, res) {
  const comment = await PostComment.findById(req.params.id);
  if (!comment) throw ApiError.notFound("Comment not found");

  if (String(comment.author) !== String(req.user._id)) {
    throw ApiError.forbidden("You can only delete your own comments");
  }

  await comment.deleteOne();
  res.status(200).json({ message: "Comment deleted" });
}

export { create, list, update, remove };