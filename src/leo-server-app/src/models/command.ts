import mongoose from "mongoose";
import { CommandStatus } from "../types/command";

const Schema = mongoose.Schema;

export const commandSchema = new Schema(
  {
    command: { type: String },
    satelliteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
    delay: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(CommandStatus),
      default: CommandStatus.QUEUED,
    },
  },
  { timestamps: true }
);

const Command = mongoose.model("Command", commandSchema);

module.exports = Command;
