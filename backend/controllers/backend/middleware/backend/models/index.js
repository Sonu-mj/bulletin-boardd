const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required."],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters."],
      maxlength: [24, "Username must be 24 characters or fewer."],
      match: [
        /^[a-z0-9_]+$/,
        "Username may only contain letters, numbers, and underscores.",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [32, "Display name must be 32 characters or fewer."],
      default: function () {
        return this.username;
      },
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [280, "Bio must be 280 characters or fewer."],
      default: null,
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "Role must be either 'user' or 'admin'.",
      },
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || model("User", userSchema);

const postSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showAuthor: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      required: [true, "Post content is required."],
      trim: true,
      maxlength: [2000, "Post content must be 2000 characters or fewer."],
    },
    mediaType: {
      type: String,
      enum: {
        values: ["none", "image", "audio", "file"],
        message: "mediaType must be one of: none, image, audio, file.",
      },
      default: "none",
    },
    mediaUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.models.Post || model("Post", postSchema);

const adminMessageSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author reference is required."],
    },
    message: {
      type: String,
      required: [true, "Message content is required."],
      trim: true,
      maxlength: [1000, "Message must be 1000 characters or fewer."],
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

adminMessageSchema.index({ isRead: 1, createdAt: -1 });

const AdminMessage =
  mongoose.models.AdminMessage || model("AdminMessage", adminMessageSchema);

module.exports = { User, Post, AdminMessage };
