const express = require("express");
import Log from "../models/log";

const router = express.Router();
router.use(express.json());

type GetLogBySatelliteProp = {
  query: {
    satelliteId: string;
  };
};

type GetLogByScheduleProp = {
  query: {
    satelliteId: string;
    scheduleId: string;
  };
};

type GetLogByCommandeProp = {
  query: {
    satelliteId: string;
    commandId: string;
  };
};

type CreateLogProp = {
  query: {
    commandId: string;
    satelliteId: string;
    userId: string;
    scheduleId: string;
    response: string;
  };
};

router.get("/getLogsBySatellite", async (req: GetLogBySatelliteProp, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satelliteId: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by satelliteId", logs });
});

router.get("/getLogsBySchedule", async (req: GetLogByScheduleProp, res: any) => {
  const { satelliteId, scheduleId } = req.query;

  const filter = {
    scheduleId: scheduleId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by ScheduleId", logs });
});

router.get("/getLogsByCommand", async (req: GetLogByCommandeProp, res: any) => {
  const { satelliteId, commandId } = req.query;

  const filter = {
    commandId: commandId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by commandId", logs });
});

router.post("/createLog", async (req: CreateLogProp, res: any) => {
  const { query } = req;

  let resObj = {};

  const newLog = {
    satelliteId: query.satelliteId,
    commandId: query.commandId,
    scheduleId: query.scheduleId,
    response: query.response,
    userId: query.userId,
  };

  const log = await Log.create(newLog);
  resObj = {
    message: "Created Log",
    log,
  };

  res.status(201).json(resObj);
});

module.exports = router;
