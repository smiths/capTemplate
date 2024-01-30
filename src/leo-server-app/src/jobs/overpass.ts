import Command from "../models/command";
import Log from "../models/log";
import Schedule from "../models/schedule";
import { CommandStatus } from "../types/command";
import nodeSchedule from "node-schedule";

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
  await rescheduleLeftoverCommands(scheduleId);
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
};

// Creates overpass schedules for the next 7 days
export const createSchedulesForSatellite = (satelliteId: string) => {};

export const scheduleJobForNextOverpass = (
  satelliteId: string,
  scheduleId: string,
  startTime: Date
) => {
  nodeSchedule.scheduleJob(startTime, () =>
    executeScheduledCommands(satelliteId, scheduleId)
  );
};
