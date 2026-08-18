import User from "../models/User.model.js";

const MENTION_RE = /@([a-z0-9_]{3,24})/gi;

export async function resolveMentions(content = "") {
  const usernames = [...content.matchAll(MENTION_RE)].map((m) => m[1].toLowerCase());
  if (usernames.length === 0) return [];

  const unique = [...new Set(usernames)];
  const users = await User.find({ username: { $in: unique } }).select("_id");
  return users.map((u) => u._id);
}