import Command from "../models/command";
import Log from "../models/log";
import Schedule from "../models/schedule";
import { CommandStatus } from "../types/command";
import nodeSchedule from "node-schedule";
import { getNextPasses } from "../utils/satellite.utils";
import { scheduleJobForNextOverpass } from "../jobs/schedule.job";
import { ScheduleEventEmitter } from "../event/schedule.event";

export const executeScheduledCommands = async (
  satelliteId: string,
  scheduleId: string
) => {
  const schedule = await Schedule.findById(scheduleId).exec();
  const filter = {
    scheduleId: scheduleId,
    status: CommandStatus.QUEUED,
  };

  // ---- Get commands ----
  const commands = await Command.find(filter)
    .sort({ createdAt: "desc", priority: "asc" })
    .exec();

  const length = commands.length;
  let ind = 0;

  let currTime = Date.now();

  // ---- Loop through commands and execute them ----
  while (
    schedule?.startDate &&
    schedule.endDate &&
    schedule?.startDate?.getTime() <= Date.now() &&
    schedule?.endDate.getTime() > currTime
  ) {
    if (ind >= length) {
      continue;
    }

    const currCommand = commands[ind];

    // Execute command
    let response = {};
    console.log(currCommand.command);
    setTimeout(() => {}, currCommand.delay); // delay

    // update cmd
    await Command.findByIdAndUpdate(currCommand.id, {
      status: CommandStatus.EXECUTED,
    }).exec();

    const logObj = {
      command: currCommand.id,
      user: currCommand.userId,
      satelliteId: satelliteId,
      scheduleId: scheduleId,
      response: response,
    };
    // store log
    await Log.create(logObj);

    ind += 1;
    currTime = Date.now();
  }

  // ---- Reschedule any left over commands ----
  const nextSchedule = await rescheduleLeftoverCommands(scheduleId);

  //   Emit event to create new schedule
  ScheduleEventEmitter.emit(
    "overpassFinished",
    satelliteId,
    nextSchedule?.id,
    nextSchedule?.startDate
  );
};

export const rescheduleLeftoverCommands = async (scheduleId: string) => {
  //   Get next scheduled overpass
  const nextSchedule = await Schedule.findOne({ scheduleId: scheduleId })
    .sort({ created: "desc" })
    .exec();

  // Reschedule all commands that have not been executed for the next overpass
  await Command.updateMany(
    { scheduleId: scheduleId, status: CommandStatus.QUEUED },
    { $set: { scheduleId: nextSchedule?.id, priority: 2 } }
  ).exec();

  return nextSchedule;
};

export const addSchedulesForNext7Days = async (
  satelliteId: string,
  noradId: string
) => {
  const nextPasses = getNextPasses(noradId);
  let requestObjArray = [];

  // Loop through each overpass and format the request
  for (let overpass of nextPasses) {
    const [enterInfo, exitInfo] = overpass;
    const reqObj = {
      startDate: new Date(enterInfo?.time ?? ""),
      endDate: new Date(exitInfo?.time ?? ""),
      satelliteId: satelliteId,
    };

    requestObjArray.push(reqObj);
  }

  const job = nodeSchedule.scheduledJobs[satelliteId];

  // Bulk write schedules
  const createdSchedules = await Schedule.insertMany(requestObjArray);

  const firstSchedule = createdSchedules[0];

  if (!job) {
    scheduleJobForNextOverpass(
      satelliteId,
      firstSchedule.id,
      firstSchedule.startDate
    );
  }

  return createdSchedules;
};
