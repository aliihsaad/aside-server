import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

function signToken(user) {
  const { _id, username, name } = user;
  return jwt.sign({ _id, username, name }, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

export const signup = async (req, res) => {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name ) {
        throw ApiError.badRequest("username, email, password and name are all required");
    }

    if (!passwordRegex.test(password)) {
        throw ApiError.badRequest("Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number and a special character");
    }

    const exisiting = await User.findOne({ $or: [{ email }, { username }] });
    if (exisiting) throw ApiError.conflict("That username or email is already taken");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
        username,
        email,
        name,
        password: hashedPassword,
    });

    res.status(201).json({
        authToken: signToken(user),
        user: { _id: user._id, username: user.username, name: user.name },
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw ApiError.badRequest("Email and password are required");
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const passwordCheck = user && (await bcrypt.compare(password, user.password));
    if (!passwordCheck) {
      throw ApiError.unauthorized("Email or password is incorrect");
    }

    res.json({
        authToken: signToken(user),
        user: { _id: user._id, username: user.username, name: user.name },
    });
};

export const verify = (req, res) => {
        res.json(req.user);
};