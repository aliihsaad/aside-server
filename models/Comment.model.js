import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: {
      type: String,
      required: [true, "A comment needs content"],
      maxlength: [1000, "Comments are limited to 1000 characters"],
    },
    targetType: {
      type: String,
      enum: {
        values: ["Post", "Resource"],
        message: "Comments can only be on posts or resources",
      },
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
)

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

export default model("Comment", commentSchema)