import { model, Schema } from "mongoose";

const postSchema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: "User", required: true},
        content: {
            type: String,
            required: [true, "A post needs some content"],
            maxlength: [2000, "Post are limited to 2000 characters"],
        },
        tags: [{ type: String, trim: true, lowercase: true, maxlength: 24 }],
        imageUrl: { type: String, default: ""},
        linkedResource: { type: Schema.Types.ObjectId, ref: "Resource", default: null },
        mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);
postSchema.index({ createdAt: -1 });

export default model("Post", postSchema);