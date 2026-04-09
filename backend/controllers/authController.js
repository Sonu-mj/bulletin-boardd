const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

function signToken(user) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment.");
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    role: user.role,
    createdAt: user.createdAt,
  };
}

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters.",
      });
    }

    if (trimmedUsername.length > 24) {
      return res.status(400).json({
        success: false,
        message: "Username must be 24 characters or fewer.",
      });
    }

    if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username may only contain letters, numbers, and underscores.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const existing = await User.findOne({ username: trimmedUsername }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken. Try another.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      username: trimmedUsername,
      password: hashedPassword,
      displayName: trimmedUsername,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created.",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[authController.register]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const trimmedUsername = username.trim().toLowerCase();

    const user = await User.findOne({ username: trimmedUsername }).select(
      "+password"
    );

    const dummyHash =
      "$2a$12$invalidhashfortimingprotectionXXXXXXXXXXXXXXXXXXXXXXX";
    const isMatch = await bcrypt.compare(
      password,
      user ? user.password : dummyHash
    );

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Logged in.",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[authController.login]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error("[authController.me]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
