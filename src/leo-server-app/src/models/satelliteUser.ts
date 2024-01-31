import mongoose from "mongoose";

const Schema = mongoose.Schema;

const satelliteUserSchema = new Schema(
  {
    satelliteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    validCommands: {
      type: [String],
    },
  },
  { timestamps: true }
);

const SatelliteUserModel = mongoose.model("SatelliteUser", satelliteUserSchema);
export default SatelliteUserModel;
