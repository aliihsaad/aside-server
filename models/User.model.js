import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [24, "Username must be 24 characters or fewer"],
      match: [/^[a-z0-9_]+$/, "Username can only use letters, numbers and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "That doesn't look like an email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name is too long"],
    },
    bio: { type: String, default: "", maxlength: [280, "Bio is too long"] },
    avatarUrl: { type: String, default: "" },
    skills: [{ type: String, trim: true, maxlength: 30 }],
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    githubUsername: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default model("User", userSchema);