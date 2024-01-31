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
    }
};

type GetCommandsBySatelliteAndUserProp = {
    query: {
        satelliteId: string;
        userId: string;
    }
};

const isAdminCheck = async (userId: string) => {
    const userRecord = await User.findById(userId);
    // console.log(userRecord?.role);
    return userRecord?.role === UserRole.ADMIN;
};

const isValidUserCheck = async (userId: string) => {
    const userRecord = await User.findById(userId);
    return Boolean(userRecord);
};

async function validateCommands(satelliteId: string, commands: string[]) {
    // Get satellite data
    const satellite = await Satellite.findById(satelliteId).exec();
  
    // Check if commands are valid
    return commands.every((cmd) => satellite?.validCommands.includes(cmd));
};

router.post("/createSatelliteUser", async (req: CreateUserProp, res: any) =>{
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

router.get("/getUserBySatellite",
async (satellite: string, res: any) =>{
    const filter = {
        satelliteId: satellite,
      };
    const record = await SatelliteUser.find(filter).sort({createdAt: "desc"}).exec();

    res.status(201).json({message: "Users fetched by satellite", record});
    
});

router.get("/getCommandsBySatelliteAndUser",
async (req: GetCommandsBySatelliteAndUserProp, res: any) =>{
    const {satelliteId, userId} = req.query;
    const filter = {
        satelliteId: satelliteId,
        userId: userId,
      };
    const record = await SatelliteUser.find(filter).sort({createdAt: "desc"}).exec();

    res.status(201).json({message: "Commands fetched by satellite and User", record});
    
});

router.update("/updateByUser");

router.delete("/deleteByUser");

module.exports = router;
