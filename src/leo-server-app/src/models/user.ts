import mongoose from "mongoose";

const Schema = mongoose.Schema;

enum UserRole {
  "OPERATOR" = "OPERATOR",
  "ADMIN" = "ADMIN",
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  role: UserRole,
  satellites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
