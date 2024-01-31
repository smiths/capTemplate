import nodeSchedule from "node-schedule";
import { executeScheduledCommands } from "../utils/schedule.utils";

export const scheduleJobForNextOverpass = (
  satelliteId: string,
  scheduleId: string,
  startTime: Date
) => {
  nodeSchedule.scheduleJob(startTime, () =>
    executeScheduledCommands(satelliteId, scheduleId)
  );
};
