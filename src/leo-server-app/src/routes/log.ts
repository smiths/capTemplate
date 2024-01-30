const express = require("express");
import Log from "../models/log";

const router = express.Router();
router.use(express.json());

router.get("/getLogs", async (req: any, res: any) => {
  const { satelliteId } = req.query;

  const filter = {
    satellite: satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs", logs });
});

module.exports = router;
