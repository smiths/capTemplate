import mongoose from "mongoose";
import { ScheduleStatus } from "../types/schedule";

const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
  {
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: Date.now,
    },
    satelliteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Satellite",
    },
    status: {
      type: String,
      enums: Object.values(ScheduleStatus),
      default: ScheduleStatus.FUTURE,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);

export default Schedule;
