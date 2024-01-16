// TODO: FIX IMPORTS

const express = require("express");
const Satellite = require("../models/satellite");
const Schedule = require("../models/schedule");
const Log = require("../models/log");

import Command from "../models/command";
import User from "../models/user";
import { UserRole } from "../types/user";
import mongoose from "mongoose";

const router = express.Router();
router.use(express.json());

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
  return commands.every((cmd) => satellite.validCommands.includes(cmd));
}

// ---- API Routes ----
router.post("/createSchedule", async (req: CreateScheduleProp, res: any) => {
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

router.patch(
  "/updateScheduledCommand",
  async (req: UpdateScheduleProp, res: any) => {
    const { userId, commandId, command } = req.query;

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

router.get("/getSchedulesBySatellite", async (req: any, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
    status: false,
  };

  const schedules = await Schedule.find(filter).exec();
  res.status(201).json({ message: "Fetched schedules", schedules });
});

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
    const log = await sendRequest(
      body.satelliteId,
      schedule._id,
      body.commands
    );

    resObj = {
      message: "Sent Command Sequence",
      log: log,
    };
  }

  res.status(201).json(resObj);
});

router.post("/sendScheduledRequest", async (req: any, res: any) => {
  const { body } = req;

  // Get schedule
  const schedule = await Schedule.findById(body.scheduleId).exec();

  // api request
  const log = await sendRequest(
    body.satelliteId,
    body.scheduleId,
    schedule.commands
  );
  res.status(201).json({ message: "Sent command sequence", log });
});

module.exports = router;
