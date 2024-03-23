import mongoose from "mongoose";
import User from "../models/user";
import { verifyUserCommands } from "../utils/schedule.utils";
import { UserRole } from "../types/user";
import { CommandStatus } from "../types/command";
import Command from "../models/command";
import Log from "../models/log";

const messageHandler = require("../messageHandler"); // Import the module
const express = require("express");

const router = express.Router();
router.use(express.json());

type SendCommandProp = {
  query: {
    satelliteId: string;
    scheduleId: string;
    userId: string;
  };
  body: {
    command: string;
  };
};

const isAdminCheck = async (userId: string) => {
  const userRecord = await User.findById(userId);
  return userRecord?.role === UserRole.ADMIN;
};

router.post("/sendCommand", async (req: SendCommandProp, res: any) => {
  const { body, query } = req;

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
    [body.command]
  );

  const adm = await isAdminCheck(query.userId);

  if (!isCommandInSatelliteCriteria && !adm) {
    return res
      .status(500)
      .json({ error: "Invalid command sequence or user permission" });
  }

  //   Forward through socket
  const response = await messageHandler.sendDataToClientAndAwaitResponse(
    body.command,
    5000
  );

  // Create command record
  const newCommand = {
    userId: query.userId,
    satelliteId: query.satelliteId,
    command: body.command,
    scheduleId: query.scheduleId,
    status: CommandStatus.EXECUTED,
    delay: 0,
  };
  const createdCommand = await Command.create(newCommand);

  // log record
  const newLog = {
    satelliteId: query.satelliteId,
    commandId: createdCommand.id,
    scheduleId: query.scheduleId,
    response: response.toString(),
    userId: query.userId,
  };

  await Log.create(newLog);

  res.status(201).json({ output: response.toString() });
});
module.exports = router;
