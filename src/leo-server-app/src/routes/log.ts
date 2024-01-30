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

router.get("/getLogsBySatellite", async (req: GetLogBySatelliteProp, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs", logs });
});

router.get("/getLogsbySchedule", async (req: GetLogByScheduleProp, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs", logs });
});

router.get("/getLogsByCommand", async (req: GetLogByCommandeProp, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs", logs });
});

module.exports = router;
