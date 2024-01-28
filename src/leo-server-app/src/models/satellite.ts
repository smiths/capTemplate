import mongoose from "mongoose";

const Schema = mongoose.Schema;

const satelliteSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    intlCode: { type: String, required: true, unique: true },
    validCommands: {
      type: [String],
    },
    tleLines: {
      type: [String],
    },
  },
  { timestamps: true }
);

const SatelliteModel = mongoose.model("Satellite", satelliteSchema);
export default SatelliteModel;
