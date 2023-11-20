import mongoose from "mongoose";

const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    data: Schema.Types.Mixed,
    satellite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
    },
  },
  { timestamps: true }
);

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
