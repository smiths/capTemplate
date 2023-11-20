const express = require("express");
const Log = require("../models/log");

const router = express.Router();
router.use(express.json());

router.get("/getLogs", async (req: any, res: any) => {
  const { body } = req;

  const filter = {
    satellite: body.satelliteId,
  };

  const logs = await Log.find(filter).exec();
  res.status(201).json({ message: "Fetched logs", logs });
});

module.exports = router;
