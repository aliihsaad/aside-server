import { Schema, model } from "mongoose";

const URL_RE = /^https:\/\/[^\s<>"]+$/i;

const linkSchema = new Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["repo", "demo", "docs", "file"],
        message: "Link type must be repo, demo, docs or file",
      },
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => URL_RE.test(v),
        message: "Links must be absolute https URLs",
      },
    },
    label: { type: String, trim: true, maxlength: 60, default: "" },

  },
  { _id: false }
);

const resourceSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: Schema.Types.ObjectId, ref: "Folder", required: true },

    title: {
      type: String,
      required: [true, "A resource needs a title"],
      trim: true,
      maxlength: [120, "Title is too long"],
    },
    description: { type: String, default: "", trim: true, maxlength: 300 },

    body: { type: String, default: "" },
    code: { type: String, default: "" },
    language: { type: String, default: "", trim: true, lowercase: true },

    category: {
      type: String,
      enum: {
        values: ["component", "snippet", "guide", "spec", "checklist", "link", "pattern"],
        message: "{VALUE} isn't a valid category",
      },
      default: "snippet",
    },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 24 }],
    stack: [{ type: String, trim: true, maxlength: 24 }],

    links: [linkSchema],
    previewImageUrl: { type: String, default: "" },

    visibility: {
      type: String,
      enum: ["private", "cohort"],
      default: "private",
    },

    forkedFrom: { type: Schema.Types.ObjectId, ref: "Resource", default: null },
    forkCount: { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

resourceSchema.pre("validate", function () {
  const hasBody = this.body && this.body.trim().length > 0;
  const hasCode = this.code && this.code.trim().length > 0;

  if (!hasBody && !hasCode) {
    this.invalidate(
      "body",
      "A resource needs an explanation or code — a link on its own isn't enough"
    );
  }
});

resourceSchema.index({ owner: 1, createdAt: -1 });
resourceSchema.index({ folder: 1 });
resourceSchema.index({ visibility: 1 });
resourceSchema.index({ forkedFrom: 1 });
resourceSchema.index(
  { title: "text", description: "text", body: "text", tags: "text" },
  { language_override: "textLanguage" }
);

export default model("Resource", resourceSchema);