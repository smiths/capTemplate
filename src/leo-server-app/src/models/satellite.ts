import mongoose from "mongoose";

const Schema = mongoose.Schema;

const satelliteSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  operators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Satellite = mongoose.model("Satellite", satelliteSchema);
module.exports = Satellite;
