import mongoose from "mongoose";
import { UserRole } from "../types/user";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: { type: String, enum: Object.values(UserRole) },
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
