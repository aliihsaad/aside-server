import { Schema, model } from "mongoose";

const bookmarkSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        resource: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    },
    { timestamps: true }
);

bookmarkSchema.index({ user: 1, resource: 1 }, {  unique: true});

export default model("Bookmark", bookmarkSchema);