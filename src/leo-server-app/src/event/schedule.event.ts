import EventEmitter from "node:events";
import { scheduleJobForNextOverpass } from "../jobs/schedule.job";

export const ScheduleEventEmitter = new EventEmitter();

// Schedule job to run for a satellite's next overpass
ScheduleEventEmitter.on(
  "overpassFinished",
  (satelliteId: string, scheduleId: string, startTime: Date) => {
    scheduleJobForNextOverpass(satelliteId, scheduleId, startTime);
  }
);
