import { Schema, model } from "mongoose";

const postCommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    content: {
      type: String,
      required: [true, "A comment needs content"],
      maxlength: [1000, "Comments are limited to 1,000 characters"],
    },
  },
  { timestamps: true }
);

// The query you'll always run: every comment on one post, oldest first
postCommentSchema.index({ post: 1, createdAt: 1 });

export default model("PostComment", postCommentSchema);