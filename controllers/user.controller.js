import User from "../models/User.model.js"
import ApiError from "../utils/ApiError.js"

const PUBLIC_FIELDS =
  "username name bio avatarUrl skills socialLinks githubUsername createdAt";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}  


async function getMe(req, res) {
  const user = await User.findById(req.user._id).select(PUBLIC_FIELDS + " email");
  if (!user) throw ApiError.notFound("User not found");
  res.json(user);
}

async function getOne(req, res) {
  const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
  if (!user) throw ApiError.notFound("User not found");
  res.json(user);
}

async function list(req, res) {
  const { search } = req.query;

  const filter = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { username: rx }, { skills: rx }];
  }

  const users = await User.find(filter).select(PUBLIC_FIELDS).sort({ name: 1 });
  res.json(users);
}

async function updateMe(req, res) {
  const { name, bio, avatarUrl, skills, socialLinks, githubUsername } = req.body;

  if (githubUsername && !/^[a-zA-Z0-9-]{1,39}$/.test(githubUsername)) {
    throw ApiError.badRequest("That doesn't look like a GitHub username");
  }
  
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio, avatarUrl, skills, socialLinks, githubUsername },
    { new: true, runValidators: true }
  ).select(PUBLIC_FIELDS);

  res.json(user);
}

export { getMe, getOne, list, updateMe };