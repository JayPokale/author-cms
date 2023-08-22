import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    jwtKey: { type: String, required: true },
    blocked: { type: Boolean, required: true, default: false },
    bio: { type: String },
    about: { type: String },
    location: { type: String },
    profilePhoto: { type: String },
    socialLinks: [{ platform: String, link: String }],
    posts: [{ type: mongoose.Types.ObjectId, ref: "postModel" }],
    drafts: [{ type: mongoose.Types.ObjectId, ref: "postModel" }],
    liked: [String],
    viewed: [String],
    saved: [String],
    commented: [String],
    followed: [String],
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    countPosts: { type: Number, default: 0 },
    countDrafts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
