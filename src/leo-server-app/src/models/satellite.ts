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
  },
  { timestamps: true }
);

const Satellite = mongoose.model("Satellite", satelliteSchema);
export default Satellite;
