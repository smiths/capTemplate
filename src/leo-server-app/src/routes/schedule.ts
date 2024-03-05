// TODO: FIX IMPORTS

const express = require("express");
const Log = require("../models/log");

import Satellite from "../models/satellite";
import Command from "../models/command";
import Schedule from "../models/schedule";
import User from "../models/user";
import { UserRole } from "../types/user";
import mongoose from "mongoose";
import { ScheduleStatus } from "../types/schedule";
import { CommandStatus } from "../types/command";
import { cancelScheduleJob, executeScheduleJob } from "../jobs/schedule.job";
import { addSchedulesForNext7Days, hasSchedulePassed, verifyUserCommands } from "../utils/schedule.utils";

const router = express.Router();
router.use(express.json());

type GetCommandsByScheduleProp = {
  query: {
    scheduleId: string;
    page?: number;
    limit?: number;
  };
};

type GetSchedulesBySatelliteProp = {
  query: {
    satelliteId: string;
    page?: number;
    limit?: number;
    status?: ScheduleStatus;
  };
};

type GetScheduleBySatelliteAndTimeProp = {
  query: {
    satelliteId: string;
    status?: ScheduleStatus;
    time: Date;
  };
};

type CreateScheduleProp = {
  body: {
    // commands: any[];
    satelliteId: string;
    noradId: string;
    // executionTimestamp: Date;
  };
};

type UpdateScheduleProp = {
  query: {
    command: string;
    commandId: string;
    satelliteId: string;
    userId: string;
  };
};

type CreateScheduleCommandProp = {
  query: {
    command: string;
    scheduleId: string;
    satelliteId: string;
    userId: string;
  };
};

type CreateBatchScheduleCommandProp = {
  body: {
    commands: string[];
    scheduleId: string;
    satelliteId: string;
    userId: string;
  };
};

type DeleteScheduleProp = {
  query: {
    commandId: string;
    userId: string;
  };
};

type PostExecuteScheduleProp = {
  query: {
    satelliteId: string;
    scheduleId: string;
  };
};

type CancelScheduleProp = {
  query: {
    satelliteId: string;
    scheduleId: string;
  };
};

// ---- Helper Functions ----
async function sendRequest(
  satelliteId: string,
  scheduleId: string,
  commands: string[]
) {
  // send command to ground station and capture response
  let res = {
    message: "Cool data",
  };

  // create log
  const newLog = {
    data: res,
    satellite: satelliteId,
    schdule: scheduleId,
  };
  const log = await Log.create(newLog);
  return log;
}

async function validateCommands(
  satelliteId: string,
  userId: string,
  commands: string[]
) {
  // Get satellite data
  const satellite = await Satellite.findById(satelliteId).exec();

  // Check if commands are valid
  return commands.every((cmd) => satellite?.validCommands.includes(cmd));
}

const isAdminCheck = async (userId: string) => {
  const userRecord = await User.findById(userId);
  return userRecord?.role === UserRole.ADMIN;
};

// ---- API Routes ----
router.post("/createSchedule", async (req: CreateScheduleProp, res: any) => {
  const { body } = req;

  addSchedulesForNext7Days(body.satelliteId, body.noradId);
});

router.post(
  "/createScheduledCommand",
  async (req: CreateScheduleCommandProp, res: any) => {
    const { query } = req;

    // Validation
    if (!mongoose.isValidObjectId(query.userId)) {
      return res.status(500).json({ error: "Invalid user ID" });
    }

    const userRecord = await User.findById(query.userId);

    if (!userRecord) {
      return res.status(500).json({ error: "User does not exist" });
    }

    // Add validation for invalid command sequence based on satellite and user permissions
    // Check if command exists in the satellite's list of command sequences
    const isCommandInSatelliteCriteria = await verifyUserCommands(
      query.satelliteId,
      query.userId,
      [query.command]
    );

    const adm = await isAdminCheck(query.userId);

    if (!isCommandInSatelliteCriteria && !adm) {
      return res
        .status(500)
        .json({ error: "Invalid command sequence or user permission" });
    }

    // add command record
    const newCommand = {
      userId: query.userId,
      satelliteId: query.satelliteId,
      command: query.command,
      scheduleId: query.scheduleId,
      status: CommandStatus.QUEUED,
      delay: 0,
    };
    const createCommand = await Command.create(newCommand);

    return res.json({ message: "Created command", createCommand });
  }
);

router.post(
  "/createBatchScheduledCommand",
  async (req: CreateBatchScheduleCommandProp, res: any) => {
    const { body } = req;

    // Validation
    if (!mongoose.isValidObjectId(body.userId)) {
      return res.status(500).json({ error: "Invalid user ID" });
    }

    const userRecord = await User.findById(body.userId);

    if (!userRecord) {
      return res.status(500).json({ error: "User does not exist" });
    }

    // Add validation for invalid command sequence based on satellite and user permissions
    // Check if command exists in the satellite's list of command sequences
    const isCommandInSatelliteCriteria = await verifyUserCommands(
      body.satelliteId,
      body.userId,
      body.commands
    );

    const adm = await isAdminCheck(body.userId);

    if (!isCommandInSatelliteCriteria && !adm) {
      return res
        .status(500)
        .json({ error: "Invalid command sequence or user permission" });
    }

    let requestObjArray = [];

    for (let cmd of body.commands) {
      const newCommand = {
        userId: body.userId,
        satelliteId: body.satelliteId,
        command: cmd,
        scheduleId: body.scheduleId,
        status: CommandStatus.QUEUED,
        delay: 0,
      };

      requestObjArray.push(newCommand);
    }
    // add batch command record
    const createCommand = await Command.insertMany(requestObjArray);
    return res.json({ message: "Created command", createCommand });
  }
);

router.patch(
  "/updateScheduledCommand",
  async (req: UpdateScheduleProp, res: any) => {
    const { userId, commandId, satelliteId, command } = req.query;

    // Validation
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(commandId)
    ) {
      return res.status(500).json({ error: "Invalid IDs" });
    }

    const userRecord = await User.findById(userId);

    if (!userRecord) {
      return res.status(500).json({ error: "User does not exist" });
    }

    // Add validation for invalid command sequence based on satellite and user permissions
    // Check if command exists in the satellite's list of command sequences
    const isCommandInSatelliteCriteria = await verifyUserCommands(
      satelliteId,
      userId,
      [command]
    );
    const adm = await isAdminCheck(userId);

    if (!isCommandInSatelliteCriteria && !adm) {
      return res
        .status(500)
        .json({ error: "Invalid command sequence or user permissions" });
    }

    // Update command record
    const updatedCommand = await Command.findByIdAndUpdate(
      commandId,
      {
        command,
      },
      { new: true }
    ).exec();

    return res.json({ message: "Updated command", updatedCommand });
  }
);

router.delete(
  "/deleteScheduledCommand",
  async (req: DeleteScheduleProp, res: any) => {
    const { userId, commandId } = req.query;

    // Validation
    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(commandId)
    ) {
      return res.status(500).json({ error: "Invalid IDs" });
    }

    const userRecord = await User.findById(userId);

    if (!userRecord) {
      return res.status(500).json({ error: "User does not exist" });
    }

    // Check if user has permission
    if (userRecord.role !== UserRole.ADMIN) {
      const commandRecord = await Command.findById(commandId);
      if (commandRecord?.userId?.toString() !== userId) {
        return res.status(500).json({ error: "Invalid Credentials" });
      }
    }

    // Remove command record
    const cmd = await Command.findByIdAndDelete(commandId).exec();

    return res.json({ message: "Removed command from schedule" });
  }
);

router.get(
  "/getSchedulesBySatellite",
  async (req: GetSchedulesBySatelliteProp, res: any) => {
    const {
      satelliteId,
      status = ScheduleStatus.FUTURE,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      satelliteId: satelliteId,
      status: status,
    };

    const skip = (page - 1) * limit;

    const schedules = await Schedule.find(filter)
    .sort({ startDate: "asc" })
      .limit(limit)
      .skip(skip)
      .exec();
    res.status(201).json({ message: "Fetched schedules", schedules });
  }
);

router.get(
  "/getScheduleBySatelliteAndTime",
  async (req: GetScheduleBySatelliteAndTimeProp, res: any) => {
    const { satelliteId, status = ScheduleStatus.FUTURE, time } = req.query;

    const convertedTime = new Date(time);

    const filter = {
      satelliteId: satelliteId,
      status: status,
      $and: [
        { startDate: { $lte: convertedTime } },
        { endDate: { $gte: convertedTime } },
      ],
    };

    const schedules = await Schedule.find(filter)
      .sort({ createdAt: "desc" })
      .exec();
    res.status(201).json({
      message: "Fetched schedules by satelliteId and Time",
      schedules,
    });
  }
);

router.get(
  "/getCommandsBySchedule",
  async (req: GetCommandsByScheduleProp, res: any) => {
    const { scheduleId, page = 1, limit = 10 } = req.query;

    const filter = {
      scheduleId: scheduleId,
    };

    const skip = (page - 1) * limit;

    const commands = await Command.find(filter)
      .sort({ createdAt: "asc" })
      .limit(limit)
      .skip(skip)
      .populate("userId")
      .exec();
    res.status(201).json({ message: "Fetched commands", commands });
  }
);

// Executing Requests
router.post("/sendLiveRequest", async (req: any, res: any) => {
  const { body } = req;

  // validate commands
  const isCommandsValid = await verifyUserCommands(
    body.satelliteId,
    body.userId,
    body.commands
  );

  const adm = await isAdminCheck(body.userId);

  let resObj = {};

  if (!isCommandsValid && !adm) {
    resObj = {
      message: "Invalid Command Sequence or user permissions",
      log: undefined,
    };
  } else {
    // create schedule
    const newSchedule = {
      userId: body.userId,
      satelliteId: body.satelliteId,
      commands: body.commands,
      executionTimestamp: body.executionTimestamp,
      status: false,
    };

    const schedule = await Schedule.create(newSchedule);

    // api request
    const log = await sendRequest(body.satelliteId, schedule.id, body.commands);

    resObj = {
      message: "Sent Command Sequence",
      log: log,
    };
  }

  res.status(201).json(resObj);
});

// Execute a schedule
router.post(
  "/executeSchedule",
  async (req: PostExecuteScheduleProp, res: any) => {
    const { satelliteId, scheduleId } = req.query;

    // Check if schedule is in the past
    const isScheduleInPast = await hasSchedulePassed(scheduleId);
    if (isScheduleInPast) {
      return res.status(500).json({ error: "Schedule has already passed" });
    }

    const jobName = executeScheduleJob(satelliteId, scheduleId);

    if (!jobName) {
      return res
        .status(500)
        .json({ error: "Schedule was not able to be executed" });
    }

    res.status(201).json({ message: "Executed schedule" });
  }
);

// Cancel a schedule during execution
router.post("/cancelSchedule", async (req: CancelScheduleProp, res: any) => {
  const { satelliteId, scheduleId } = req.query;

  // Check if schedule is in the past
  const isScheduleInPast = await hasSchedulePassed(scheduleId);
  if (isScheduleInPast) {
    return res.status(500).json({ error: "Schedule has already passed" });
  }

  const isJobCanceled = cancelScheduleJob(satelliteId, scheduleId);

  if (!isJobCanceled) {
    return res
      .status(500)
      .json({ error: "Schedule was not able to be canceled" });
  }

  res.status(201).json({ message: "Canceled schedule" });
});

module.exports = router;
