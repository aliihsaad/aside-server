import { Schema, model } from "mongoose";

const folderSchema = new Schema(
   {
    owner : { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: {
        type: String,
        required: [true, "A folder needs a name"],
        trim:true,
        maxlength: [40, "Folder name are limited to 40 characters"],
    },
    description: {type: String, default: "", maxlength: 200 },
    colour: { type: String, default: "#C9A227", },
    order: { type: Number, default: 0 },
   },
{ timestamps: true }
);
folderSchema.index({ owner: 1, name: 1 }, { unique: true });

export default model("Folder", folderSchema);