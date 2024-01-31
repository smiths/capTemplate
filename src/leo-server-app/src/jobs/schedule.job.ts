import nodeSchedule from "node-schedule";
import { executeScheduledCommands } from "../utils/schedule.utils";

// Schedules a job to run for the next overpass
export const scheduleJobForNextOverpass = (
  satelliteId: string,
  scheduleId: string,
  startTime: Date
) => {
  nodeSchedule.scheduleJob(satelliteId, startTime, () =>
    executeScheduledCommands(satelliteId, scheduleId)
  );
};
