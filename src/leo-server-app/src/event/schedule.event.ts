import EventEmitter from "node:events";
import {
  cancelScheduleJob,
  scheduleJobForNextOverpass,
} from "../jobs/schedule.job";

export const ScheduleEventEmitter = new EventEmitter();

// Schedule job to run for a satellite's next overpass
ScheduleEventEmitter.on(
  "overpassFinished",
  (
    prevScheduleId: string,
    satelliteId: string
    // scheduleId: string,
    // startTime: Date
  ) => {
    // destroy current job
    cancelScheduleJob(satelliteId, prevScheduleId);

    // scheduleJobForNextOverpass(satelliteId, scheduleId, startTime);
  }
);
