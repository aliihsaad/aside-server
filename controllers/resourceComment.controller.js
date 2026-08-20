// import ResourceComment from "../models/ResourceComment.model.js";
// import Resource from "../models/Resource.model.js";
// import ApiError from "../utils/ApiError.js";

// const AUTHOR_FIELDS = "username name avatarUrl";

// async function create(req, res) {
//   const { content, resource } = req.body;

//   const exists = await Resource.exists({ _id: resource });
//   if (!exists) throw ApiError.notFound("That resource doesn't exist");

//   const comment = await ResourceComment.create({
//     author: req.user._id,
//     resource,
//     content,
//   });

//   await comment.populate("author", AUTHOR_FIELDS);
//   res.status(201).json(comment);
// }

// async function list(req, res) {
//   const { resource } = req.query;
//   if (!resource) throw ApiError.badRequest("A resource id is required");

//   const comments = await ResourceComment.find({ resource })
//     .populate("author", AUTHOR_FIELDS)
//     .sort({ createdAt: 1 });

//   res.status(200).json(comments);
// }

// async function update(req, res) {
//   const comment = await ResourceComment.findById(req.params.id);
//   if (!comment) throw ApiError.notFound("Comment not found");

//   if (String(comment.author) !== String(req.user._id)) {
//     throw ApiError.forbidden("You can only edit your own comments");
//   }

//   comment.content = req.body.content;
//   await comment.save();

//   await comment.populate("author", AUTHOR_FIELDS);
//   res.status(200).json(comment);
// }

// async function remove(req, res) {
//   const comment = await ResourceComment.findById(req.params.id);
//   if (!comment) throw ApiError.notFound("Comment not found");

//   if (String(comment.author) !== String(req.user._id)) {
//     throw ApiError.forbidden("You can only delete your own comments");
//   }

//   await comment.deleteOne();
//   res.status(200).json({ message: "Comment deleted" });
// }

// export { create, list, update, remove };