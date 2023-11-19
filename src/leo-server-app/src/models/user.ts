import mongoose from "mongoose";

const Schema = mongoose.Schema;

enum UserRole {
  "OPERATOR" = "OPERATOR",
  "ADMIN" = "ADMIN",
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: Object.values(UserRole),
    satellites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Satellite",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
