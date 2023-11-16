import mongoose from "mongoose";

const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  commands: Schema.Types.Mixed,
  timestamp: {
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
});

const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;