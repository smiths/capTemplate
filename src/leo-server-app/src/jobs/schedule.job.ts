import nodeSchedule from "node-schedule";
import { executeScheduledCommands } from "../utils/schedule.utils";

// Schedules a job to run for the next overpass
export const scheduleJobForNextOverpass = (
  satelliteId: string,
  scheduleId: string,
  startTime: Date
) => {
  const jobName = satelliteId + "_" + scheduleId;
  nodeSchedule.scheduleJob(jobName, startTime, () =>
    executeScheduledCommands(satelliteId, scheduleId)
  );
};

// Immediately executes an overpass job for a satellite
export const executeScheduleJob = (satelliteId: string, scheduleId: string) => {
  // Run job 5 seconds after creation
  const startTime = new Date(Date.now() + 5000);

  const jobName = satelliteId + "_" + scheduleId;

  const job = nodeSchedule.scheduleJob(jobName, startTime, () =>
    executeScheduledCommands(satelliteId, scheduleId)
  );

  return job?.name;
};

// Cancel an overpass job for a satellite
export const cancelScheduleJob = (satelliteId: string, scheduleId: string) => {
  const jobName = satelliteId + "_" + scheduleId;
  const isCanceled = nodeSchedule.cancelJob(jobName);

  return isCanceled;
};
