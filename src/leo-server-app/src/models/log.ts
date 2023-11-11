import mongoose from "mongoose";

const Schema = mongoose.Schema;

const logSchema = new Schema({
  data: Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  message: String,
  satellite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Satellite",
  },
});

const Log = mongoose.model("Log", logSchema);
module.exports = Log;
