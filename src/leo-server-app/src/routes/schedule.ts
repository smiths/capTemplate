import { ScheduleType } from "../types/schedule";

const express = require("express");
const Schedule = require("../models/schedule");
const Log = require("../models/log");

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

router.post("/createSchedule", async (req: CreateScheduleProp, res: any) => {
  const { body } = req;

  // validate commands

  const newSchedule = {
    userId: body.userId,
    satelliteId: body.satelliteId,
    commands: body.commands,
    executionTimestamp: body.executionTimestamp,
    status: false,
    type: ScheduleType.FUTURE,
  };

  const schedule = await Schedule.create(newSchedule);
  res.status(201).json({ message: "Created schdule", schedule });
});

router.post("/getSchedulesBySatellite", async (req: any, res: any) => {
  const { body } = req;

  const filter = { satellite: body.satelliteId };

  const schedules = await Schedule.find(filter).exec();
  res.status(201).json({ message: "Fetched operators", schedules });
});

async function sendRequest(
  satelliteId: string,
  scheduleId: string,
  commands: string[]
) {
  // send command to ground station and capture response
  let res = {};

  // create log
  const newLog = {
    data: res,
    satellite: satelliteId,
    schdule: scheduleId,
  };
  const log = await Log.create(newLog);
  return log;
}

// Executing Requests
router.post("/sendLiveRequest", async (req: any, res: any) => {
  const { body } = req;

  // validate commands

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
  const log = await sendRequest(body.satelliteId, schedule._id, body.commands);
  res.status(201).json({ message: "Sent command sequence", log });
});

module.exports = router;
