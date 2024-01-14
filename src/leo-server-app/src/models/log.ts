import mongoose from "mongoose";
import { commandSchema } from "./command";

const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    response: Schema.Types.Mixed,
    command: {
      type: commandSchema,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    satelliteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
