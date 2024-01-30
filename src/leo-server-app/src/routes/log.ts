const express = require("express");
const Log = require("../models/log");

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
    command: string;
    satelliteId: string;
    user: string;
    scheduleId: string;
    response: string;
  };
};

router.get("/getLogsBySatellite", async (req: GetLogBySatelliteProp, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by satelliteId", logs });
});

router.get("/getLogsbySchedule", async (req: GetLogByScheduleProp, res: any) => {
  const { satelliteId, scheduleId } = req.query;

  const filter = {
    satellite: satelliteId,
    scheduleId: scheduleId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by satelliteId and ScheduleId", logs });
});

router.get("/getLogsByCommand", async (req: GetLogByCommandeProp, res: any) => {
  const { satelliteId, commandId } = req.query;

  const filter = {
    satellite: satelliteId,
    command: commandId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs by satelliteId and commandId", logs });
});

router.post("/createLog", async (req: CreateLogProp, res: any) => {
  const { query } = req;

  let resObj = {};

  const newLog = {
    satellite: query.satelliteId,
    command: query.command,
    scheduleId: query.scheduleId,
    response: query.response,
    user: query.user,
  };

  const log = await Log.create(newLog);
  resObj = {
    message: "Created Log",
    log,
  };

  res.status(201).json(resObj);
});

module.exports = router;
