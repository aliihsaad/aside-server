import { Schema, model } from "mongoose";

const resourceCommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resource: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    content: {
      type: String,
      required: [true, "A comment needs content"],
      maxlength: [1000, "Comments are limited to 1,000 characters"],
    },
  },
  { timestamps: true }
);

resourceCommentSchema.index({ resource: 1, createdAt: 1 });

export default model("ResourceComment", resourceCommentSchema);