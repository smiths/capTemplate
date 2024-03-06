const express = require("express");

import SatelliteUser from "../models/satelliteUser";
import mongoose from "mongoose";
import Satellite from "../models/satellite";
import User from "../models/user";
import { UserRole } from "../types/user";

const router = express.Router();
router.use(express.json());

type CreateUserProp = {
  body: {
    satelliteId: string;
    adminId: string;
    userId: string;
    validCommands: string[];
  };
};

type GetCommandsBySatelliteAndUserProp = {
  query: {
    satelliteId: string;
    userId: string;
  };
};

type DeleteUserProp = {
  query: {
    satelliteUserId: string;
    adminId: string;
  };
};

type UpdateUserProp = {
  body: {
    satelliteUserId: string;
    adminId: string;
    satelliteId: string;
    validCommands: string[];
  };
};

type GetUsersBySatellite = {
  query: {
    satelliteId: string;
  };
};

const isAdminCheck = async (userId: string) => {
  const userRecord = await User.findById(userId);
  return userRecord?.role === UserRole.ADMIN;
};

const isValidUserCheck = async (userId: string) => {
  const userRecord = await User.findById(userId);
  return Boolean(userRecord);
};

const isValidSatUserCheck = async (satUserId: string) => {
  const userRecord = await SatelliteUser.findById(satUserId);
  return Boolean(userRecord);
};

async function validateCommands(satelliteId: string, commands: string[]) {
  // Get satellite data
  const satellite = await Satellite.findById(satelliteId).exec();

  // Check if commands are valid
  return commands.every((cmd) => satellite?.validCommands.includes(cmd));
}

router.post("/createSatelliteUser", async (req: CreateUserProp, res: any) => {
  const { body } = req;
  const isCommandsValid = await validateCommands(
    body.satelliteId,
    body.validCommands
  );
  const isAdminValid = await isAdminCheck(body.adminId);
  const isUserValid = await isValidUserCheck(body.userId);

  let resObj = {};

  if (!isUserValid) {
    resObj = {
      message: "Invalid User",
    };
  } else if (!isAdminValid) {
    resObj = {
      message: "Invalid Admin",
    };
  } else if (!isCommandsValid) {
    resObj = {
      message: "Invalid Commands",
    };
  } else {
    const newUser = {
      userId: body.userId,
      satelliteId: body.satelliteId,
      validCommands: body.validCommands,
      adminId: body.adminId,
    };

    const satelliteUser = await SatelliteUser.create(newUser);
    resObj = {
      message: "Created new satellite User",
      satelliteUser,
    };
  }

  res.status(201).json(resObj);
});

router.get(
  "/getUserBySatellite",
  async (req: GetUsersBySatellite, res: any) => {
    const filter = {
      satelliteId: req.query.satelliteId,
    };
    const record = await SatelliteUser.find(filter)
      .sort({ createdAt: "desc" })
      .exec();

    res.status(201).json({ message: "Users fetched by satellite", record });
  }
);

router.get(
  "/getCommandsBySatelliteAndUser",
  async (req: GetCommandsBySatelliteAndUserProp, res: any) => {
    const { satelliteId, userId } = req.query;
    const filter = {
      satelliteId: satelliteId,
      userId: userId,
    };
    const record = await SatelliteUser.find(filter)
      .sort({ createdAt: "desc" })
      .exec();

    res
      .status(201)
      .json({ message: "Commands fetched by satellite and User", record });
  }
);

router.patch("/updateByUser", async (req: UpdateUserProp, res: any) => {
  const { satelliteUserId, validCommands, adminId, satelliteId } = req.body;

  // Check if user has permission
  const isSatUser = await isValidSatUserCheck(satelliteUserId);
  if (!isSatUser) {
    return res.status(500).json({ error: "Invalid SatelliteUserId" });
  }

  const isAdmin = await isAdminCheck(adminId);
  if (!isAdmin) {
    return res.status(500).json({ error: "Invalid Admin" });
  }

  const isCommandsValid = await validateCommands(satelliteId, validCommands);
  if (!isCommandsValid) {
    return res.status(500).json({ error: "Invalid Commands" });
  }
  // Update User record
  const updatedUserCommands = await SatelliteUser.findByIdAndUpdate(
    satelliteUserId,
    {
      validCommands: validCommands,
      adminId: adminId,
    },
    { new: true }
  ).exec();

  return res.json({ message: "Updated user Commands", updatedUserCommands });
});

router.delete("/deleteByUser", async (req: DeleteUserProp, res: any) => {
  const { satelliteUserId, adminId } = req.query;

  // Validation
  if (!mongoose.isValidObjectId(satelliteUserId)) {
    return res.status(500).json({ error: "Invalid IDs" });
  }

  // Check if user has permission
  const adminCheck = await isAdminCheck(adminId);

  if (!adminCheck) {
    return res
      .status(500)
      .json({ error: "Admin does not have right permisisons" });
  }

  // Remove command record
  const cmd = await SatelliteUser.findByIdAndDelete(satelliteUserId).exec();

  return res.json({ message: "Removed User from satellite" });
});

module.exports = router;
