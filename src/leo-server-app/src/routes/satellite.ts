import * as dotenv from "dotenv";
import SatelliteModel from "../models/satellite";
import globals from "../globals/globals";
import {
  getNextPasses,
  getSatelliteInfo,
  getTLE,
  getSatelliteName,
  isSunlit,
} from "../utils/satellite.utils";
import { SatelliteEventEmitter } from "../event/satellite.event";

dotenv.config({
  path: `.env.${
    (process.env.NODE_ENV === "development" ? "local" : process.env.NODE_ENV) ||
    "local"
  }`,
  override: true,
});

const express = require("express");
let spacetrack = require("spacetrack");

const router = express.Router();
router.use(express.json());

spacetrack.login({
  username: process.env.SPACE_TRACK_USERNAME,
  password: process.env.SPACE_TRACK_PASSWORD,
});

// BDSAT-2 TLE from Space-Track accessed 12/25/2023
let defaultNoradId = "55098";
let defaultName = "BDSAT-2";

function setTleLines(noradId: string, line1: string, line2: string) {
  globals.tleLines[noradId] = [line1, line2];
}

function setSatelliteName(satelliteName: string) {
  globals.satelliteName = satelliteName;
}

async function getTleLines(noradId: string) {
  let tleLines = globals.tleLines[noradId];

  if (!tleLines) {
    tleLines = await getTLE(noradId);
  }
  globals.tleLines[noradId] = tleLines;
  return tleLines;
}

function getNoradId(noradId: string | undefined) {
  return noradId ?? defaultNoradId;
}

// Set TLE data for a NORAD_ID in global variable
async function setTLE(noradId: string) {
  const result = await getTLE(noradId);
  defaultNoradId = noradId;
  setTleLines(noradId, result[0], result[1]);
}

async function setName(noradId: string) {
  const result = await getSatelliteName(noradId);
  defaultName = result;
  setSatelliteName(defaultName);
}

router.get("/getSatelliteInfo", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);
  try {
    const [tleLine1, tleLine2] = await getTleLines(noradId);
    const satelliteInfo = getSatelliteInfo(new Date(), tleLine1, tleLine2);
    res.json(satelliteInfo);
  } catch (error) {
    console.error("Error in getSatelliteInfo():", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getSatelliteName", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);
  try {
    const satelliteName = await getSatelliteName(noradId);
    res.json(satelliteName);
  } catch (error) {
    console.error("Error in getSatelliteName():", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getPolarPlotData", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);

  try {
    const [tleLine1, tleLine2] = await getTleLines(noradId);

    const startDate = new Date(req.query.START_DATE);
    const endDate = new Date(req.query.END_DATE);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(500).send("Invalid start or end date");
    }

    let current = startDate;
    const tenSecond = 10000; // Incrementing by 10 seconds
    let data = [];

    while (current <= endDate) {
      const info = getSatelliteInfo(current, tleLine1, tleLine2);
      data.push({ azimuth: info.azimuth, elevation: info.elevation });

      // Increment current date by ten seconds
      current = new Date(current.getTime() + tenSecond);
    }

    res.json(data);
  } catch (error) {
    console.error("Error in getNextPasses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getMaxElevation", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);

  try {
    const [tleLine1, tleLine2] = await getTleLines(noradId);

    let startDate = new Date(req.query.START_DATE);
    let endDate = new Date(req.query.END_DATE);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(500).send("Invalid start or end date");
    }

    let current = startDate;
    const oneSecond = 1000; // Incrementing by 1 second
    let maxElevation = 0; // Initialize max elevation

    while (current <= endDate) {
      const info = getSatelliteInfo(current, tleLine1, tleLine2);

      // Update max elevation if current elevation is higher
      if (info.elevation > maxElevation) {
        maxElevation = info.elevation;
      }

      // Increment current date by one second
      current = new Date(current.getTime() + oneSecond);
    }

    // Return the maximum elevation
    res.json({ maxElevation: maxElevation });
  } catch (error) {
    console.error("Error in getMaxElevation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getNextPasses", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);

  try {
    const nextPasses = await getNextPasses(noradId);
    res.json({ nextPasses });
  } catch (error) {
    console.error("Error in getNextPasses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getSolarIlluminationCycle", async (req: any, res: any) => {
  const noradId = getNoradId(req.query.noradId);

  try {
    const [tleLine1, tleLine2] = await getTleLines(noradId);
    // Time window in milliseconds (1 minute)
    const WINDOWMILLIS = 10 * 1000;
    // Minimum duration for illumination cycle in milliseconds (10 minutes)
    const MIN_CYCLE_DURATION = 10 * 60 * 1000;

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextIlluminations = [];
    let enterIllumination = null;
    let enterTime = null;
    let enterInfo;
    let exitInfo;

    // Gets illuminations for the next week
    for (let i = 0; i < 7 * 24 * 60; i++) {
      // Calculate the next illumination
      let nextIlluminationTime = new Date(today.getTime() + i * WINDOWMILLIS);

      // Get satellite information for the next pass
      let satelliteInfo = getSatelliteInfo(
        nextIlluminationTime,
        tleLine1,
        tleLine2
      );
      let longitude = satelliteInfo.longitude;
      let latitude = satelliteInfo.latitude;
      let height = satelliteInfo.height;

      // Format Time
      const formattedTime = nextIlluminationTime
        .toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(/\u202f/g, " ");

      // Checks if satellite is illuminated
      if (isSunlit(nextIlluminationTime, longitude, latitude, height)) {
        // If satellite is entering illumniation, make a entry
        if (!enterIllumination) {
          enterInfo = {
            type: "Enter",
            time: formattedTime,
            longitude: longitude,
            latitude: latitude,
          };
          enterIllumination = true;
          enterTime = nextIlluminationTime.getTime();
        }
      } else {
        // If satellite is exiting illumniation, make a exit, and push
        if (enterIllumination && enterTime !== null) {
          exitInfo = {
            type: "Exit",
            time: formattedTime,
            longitude: longitude,
            latitude: latitude,
          };

          // Checks if the cycle > minimum cycle duration
          if (
            nextIlluminationTime.getTime() - enterTime >=
            MIN_CYCLE_DURATION
          ) {
            nextIlluminations.push([enterInfo, exitInfo]);
          }
          enterIllumination = null;
          enterTime = null;
        }
      }
    }
    res.json({ nextIlluminations });
  } catch (error) {
    console.error("Error in getSolarIlluminationCycle:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/changeTLE", async (req: any, res: any) => {
  const { body } = req;
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Bad request" });
  } else {
    try {
      await setTLE(body.noradID as string);
      res.status(200).json({ message: "TLE Changed to" + " " + body.noradID });
    } catch (error) {
      console.error("Error in changeTLE:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

router.post("/addSatelliteTarget", async (req: any, res: any) => {
  const { body } = req;

  const tleLines = await getTLE(body.noradId);
  setTleLines(body.noradId, tleLines[0], tleLines[1]);

  const newSatellite = new SatelliteModel({
    name: body.name,
    noradId: body.noradId,
    validCommands: body.validCommands,
    tleLines: tleLines,
  });

  const satellite = await SatelliteModel.create(newSatellite);

  // Emit event to create schedules for next 7 days
  SatelliteEventEmitter.emit(
    "satelliteCreated",
    satellite.id,
    satellite.noradId
  );

  res.status(201).json({ message: "Satellite system added", satellite });
});



router.patch("/updateSatelliteTargetCommands", async (req: any, res: any) => {
  const { query, body } = req;

  const filter = { _id: query.id };
  const update = { validCommands: body.validCommands };

  const user = await SatelliteModel.findOneAndUpdate(filter, update);
  res.status(201).json({ message: "Satellite system added", user });
});

// Helper Function
router.get("/getAllSatellites", async (req: any, res: any) => {
  const satellites = await SatelliteModel.find({});
  res.status(201).json({ message: "All satellite info", satellites });
});

router.get("/getSatellite", async (req: any, res: any) => {
  const satelliteId = req.query.satelliteId;

  const satellite = await SatelliteModel.findById(satelliteId);
  res.status(201).json({ message: "Fetched satellite", satellite });
});

module.exports = { router, getSatelliteInfo, setTleLines };
