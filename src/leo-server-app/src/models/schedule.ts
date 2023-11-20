import mongoose from "mongoose";
import { ScheduleType } from "../types/schedule";

const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
  {
    commands: Schema.Types.Mixed,
    executionTimestamp: {
      type: Date,
      default: Date.now,
    },
    satellite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    requestType: Object.values(ScheduleType),
    status: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;
