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
import { validateUserCommands } from "../utils/schedule.utils";

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
    commands: any[];
    satelliteId: string;
    userId: string;
    executionTimestamp: Date;
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

type DeleteScheduleProp = {
  query: {
    commandId: string;
    userId: string;
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

async function validateCommands(satelliteId: string, commands: string[]) {
  // Get satellite data
  const satellite = await Satellite.findById(satelliteId).exec();

  // Check if commands are valid
  return commands.every((cmd) => satellite?.validCommands.includes(cmd));
}

async function verifyUserCommands(satelliteId: string, userId: string, commands: string[]) {
  // Get satellite data
  // const satellite = await Satellite.findById(satelliteId).exec();
  const comms = await validateUserCommands(satelliteId, userId)
  console.log(comms)

  // Check if commands are valid
  return commands.every((cmd) => comms?.includes(cmd));
}

// ---- API Routes ----
router.post("/createSchedule", async (req: CreateScheduleProp, res: any) => {
  const { body } = req;

  // validate commands
  const isCommandsValid = await verifyUserCommands(
    body.satelliteId,
    body.userId,
    body.commands
  );

  let resObj = {};

  const adm = await isAdminCheck(body.userId);
    console.log(isCommandsValid, adm)
  if (!isCommandsValid && !adm ) {
    resObj = {
      message: "Invalid Command Sequence or user permissions",
      schedule: undefined,
    };
  } else {
    const newSchedule = {
      user: body.userId,
      satellite: body.satelliteId,
      commands: body.commands,
      executionTimestamp: new Date(body.executionTimestamp),
      status: false,
    };

    const schedule = await Schedule.create(newSchedule);
    resObj = {
      message: "Created schdule",
      schedule,
    };
  }

  res.status(201).json(resObj);
});

const isAdminCheck = async (userId: string) => {
  const userRecord = await User.findById(userId);
  console.log(userRecord?.role);
  return userRecord?.role === UserRole.ADMIN;
};

const checkSatellitePermissionList = async (
  satelliteId: string,
  command: string
) => {
  // Fetch satellite
  const satellite = await Satellite.findById(satelliteId);

  const isValid = satellite?.validCommands.includes(command);
  return isValid;
};

router.post(
  "/createScheduledCommand",
  async (req: CreateScheduleCommandProp, res: any) => {
    const { query } = req;

    // Validation
    // if (
    //   !mongoose.isValidObjectId(query.userId)
    // ) {
    //   return res.status(500).json({ error: "Invalid user ID" });
    // }

    // const userRecord = await User.findById(query.userId);

    // if (!userRecord) {
    //   return res.status(500).json({ error: "User does not exist" });
    // }

    // // Check if user has permission   ------- TODO - change when permission list functionality is added.
    // if (userRecord.role !== UserRole.ADMIN) {
    //   return res.status(500).json({ error: "Invalid Credentials" });
    // }

    // Add validation for invalid command sequence based on satellite and user permissions
    // Check if command exists in the satellite's list of command sequences
    const isCommandInSatelliteCriteria = await verifyUserCommands(
      query.satelliteId,
      query.userId,
      [query.command]
    );

    const adm = await isAdminCheck(query.userId)

    if (!isCommandInSatelliteCriteria && !adm) {
      return res.status(500).json({ error: "Invalid command sequence or user permission" });
    }

    // add command record
    const newCommand = {
      userId: query.userId,
      satelliteId: query.satelliteId,
      command: query.command,
      scheduleId: query.scheduleId,
      status: CommandStatus.QUEUED,
      delay: 0
    }
    const createCommand = await Command.create(newCommand);

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

    // Check if user has permission
    if (userRecord.role !== UserRole.ADMIN) {
      const commandRecord = await Command.findById(commandId);
      if (commandRecord?.userId?.toString() !== userId) {
        return res.status(500).json({ error: "Invalid Credentials" });
      }
    }

    // Add validation for invalid command sequence based on satellite and user permissions
    // Check if command exists in the satellite's list of command sequences
    const isCommandInSatelliteCriteria = await checkSatellitePermissionList(
      satelliteId,
      command
    );

    if (!isCommandInSatelliteCriteria) {
      return res.status(500).json({ error: "Invalid command sequence" });
    }

    // TODO:  Check if command exists in the user's permission list for satellite unless they are admin

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
      .sort({ createdAt: "desc" })
      .limit(limit)
      .skip(skip)
      .exec();
    res.status(201).json({ message: "Fetched schedules", schedules });
  }
);

router.get(
  "/getScheduleBySatelliteAndTime",
  async (req: GetScheduleBySatelliteAndTimeProp, res: any) => {
    const {
      satelliteId,
      status = ScheduleStatus.FUTURE,
      time,
    } = req.query;

    const convertedTime = new Date(time);

    const filter = {
      satelliteId: satelliteId,
      status: status,
      $and: [
        {startDate: { '$lte': convertedTime }} ,
        { endDate: { '$gte': convertedTime } },
      ],
    };

    const schedules = await Schedule.find(filter)
      .sort({ createdAt: "desc" })
      .exec();
    res.status(201).json({ message: "Fetched schedules by satelliteId and Time", schedules });
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
      .sort({ createdAt: "desc" })
      .limit(limit)
      .skip(skip)
      .exec();
    res.status(201).json({ message: "Fetched commands", commands });
  }
);

// Executing Requests
router.post("/sendLiveRequest", async (req: any, res: any) => {
  const { body } = req;

  // validate commands
  const isCommandsValid = await validateCommands(
    body.satelliteId,
    body.commands
  );

  let resObj = {};

  if (!isCommandsValid) {
    resObj = {
      message: "Invalid Command Sequence",
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

module.exports = router;
