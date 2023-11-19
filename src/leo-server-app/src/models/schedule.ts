import mongoose from "mongoose";

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
