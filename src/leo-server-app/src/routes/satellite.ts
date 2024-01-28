import * as dotenv from "dotenv";
import { TLEResponse } from "../types/satellites";
import SatelliteModel from "../models/satellite";
import User from "../models/user";

dotenv.config({ path: `.env.local`, override: true });

const express = require("express");
let spacetrack = require("spacetrack");
let SunCalc = require("suncalc");

const satellite = require("satellite.js");

const router = express.Router();
router.use(express.json());

spacetrack.login({
  username: process.env.SPACE_TRACK_USERNAME,
  password: process.env.SPACE_TRACK_PASSWORD,
});

let tleLine1: string =
  "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991";
let tleLine2: string =
  "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199";

function setTleLines(line1: string, line2: string) {
  tleLine1 = line1;
  tleLine2 = line2;
}

// BDSAT-2 TLE from Space-Track accessed 12/25/2023
var defaultTleLine1 =
    "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991",
  defaultTleLine2 =
    "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199";

// GS info
var observerGd = {
  longitude: satellite.degreesToRadians(-79.9201),
  latitude: satellite.degreesToRadians(43.2585),
  height: 0.37,
};

// TODO: Merge getTLE and setTLE after
async function getTLE(noradId: string) {
  const result = await spacetrack.get({
    type: "tle_latest",
    query: [
      { field: "NORAD_CAT_ID", condition: noradId },
      { field: "ORDINAL", condition: "1" },
    ],
    predicates: ["OBJECT_NAME", "TLE_LINE0", "TLE_LINE1", "TLE_LINE2"],
  });

  if (!result[0].tle) {
    console.error("TLE not set properly");
  }

  return [
    result[0].tle[1]?.toString() || defaultTleLine1,
    result[0].tle[2]?.toString() || defaultTleLine2,
  ];
}

async function setTLE(noradId: string) {
  const result = await spacetrack.get({
    type: "tle_latest",
    query: [
      { field: "NORAD_CAT_ID", condition: noradId },
      { field: "ORDINAL", condition: "1" },
    ],
    predicates: ["OBJECT_NAME", "TLE_LINE0", "TLE_LINE1", "TLE_LINE2"],
  });

  if (!result[0].tle) {
    console.error("TLE not set properly");
  }

  setTleLines(
    result[0].tle[1] || defaultTleLine1,
    result[0].tle[2] || defaultTleLine2
  );
}

// For more satellite info, check out: https://github.com/shashwatak/satellite-js
function getSatelliteInfo(date: Date, tleLine1: string, tleLine2: string) {
  if (!tleLine1 || !tleLine2) {
    throw new Error("Incorrect TLE definition");
  }
  if (isNaN(date.getTime())) {
    throw new Error("Incorrect Date definition");
  }
  var satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  var positionAndVelocity = satellite.propagate(satrec, date);
  var gmst = satellite.gstime(date);

  var positionEci = positionAndVelocity.position,
    velocityEci = positionAndVelocity.velocity;

  var positionEcf = satellite.eciToEcf(positionEci, gmst),
    positionGd = satellite.eciToGeodetic(positionEci, gmst),
    lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

  var longitude = satellite.degreesLong(positionGd.longitude),
    latitude = satellite.degreesLat(positionGd.latitude),
    height = positionGd.height;

  var azimuth = satellite.radiansToDegrees(lookAngles.azimuth),
    elevation = satellite.radiansToDegrees(lookAngles.elevation),
    rangeSat = lookAngles.rangeSat;

  return {
    positionEci,
    velocityEci,
    longitude,
    latitude,
    height,
    azimuth,
    elevation,
    rangeSat,
  };
}

function isSunlit(date: Date, lon: number, lat: number, height: number) {
  if (isNaN(date.getTime())) {
    throw new Error("Incorrect Date definition");
  }
  if (height > 2000) {
    throw new Error("Height must be in km");
  }

  const heightMeters = height * 1000; // Height from satellite.js are in km
  const sunTimes = SunCalc.getTimes(date, lat, lon, heightMeters);

  // Get time between sunset start and golden hour for best accuracy
  let sunlightEnd = new Date(
    (sunTimes.sunsetStart.getTime() + sunTimes.goldenHour.getTime()) / 2
  );
  if (date > sunTimes.dawn && date < sunlightEnd) {
    return true;
  } else {
    return false;
  }
}

router.get("/getSatelliteInfo", (req: any, res: any) => {
  try {
    const satelliteInfo = getSatelliteInfo(new Date(), tleLine1, tleLine2);
    res.json(satelliteInfo);
  } catch (error) {
    console.error("Error in getSatelliteInfo():", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getPolarPlotData", (req: any, res: any) => {
  let startDate = new Date(req.query.START_DATE);
  let endDate = new Date(req.query.END_DATE);

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
});

router.get("/getMaxElevation", (req: any, res: any) => {
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
});

router.get("/getNextPasses", (req: any, res: any) => {
  try {
    // Time window in milliseconds (1 minute)
    const WINDOWMILLIS = 60 * 1000;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var nextPasses = [];
    var enterElevation = null;
    var enterInfo;
    var exitInfo;

    // Gets overpasses for the next week
    for (let i = 0; i < 7 * 24 * 60; i++) {
      // Calculate the next pass
      var nextPassTime = new Date(today.getTime() + i * WINDOWMILLIS);

      // Get satellite information for the next pass
      var satelliteInfo = getSatelliteInfo(nextPassTime, tleLine1, tleLine2);

      // Format Time
      const formattedTime = nextPassTime
        .toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        .replace(/\u202f/g, " ");

      if (satelliteInfo.elevation > 0) {
        if (!enterElevation) {
          enterInfo = {
            type: "Enter",
            time: formattedTime,
            azimuth: satelliteInfo.azimuth,
            elevation: satelliteInfo.elevation,
          };
          enterElevation = satelliteInfo.elevation;
        }
      } else {
        if (enterElevation) {
          exitInfo = {
            type: "Exit",
            time: formattedTime,
            azimuth: satelliteInfo.azimuth,
            elevation: satelliteInfo.elevation,
          };
          nextPasses.push([enterInfo, exitInfo]);
          enterElevation = null;
        }
      }
    }
    res.json({ nextPasses });
  } catch (error) {
    console.error("Error in getNextPasses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getSolarIlluminationCycle", (req: any, res: any) => {
  try {
    // Time window in milliseconds (1 minute)
    const WINDOWMILLIS = 10 * 1000;
    // Minimum duration for illumination cycle in milliseconds (10 minutes)
    const MIN_CYCLE_DURATION = 10 * 60 * 1000;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var nextIlluminations = [];
    var enterIllumination = null;
    var enterTime = null;
    var enterInfo;
    var exitInfo;

    // Gets illuminations for the next week
    for (let i = 0; i < 7 * 24 * 60; i++) {
      // Calculate the next illumination
      var nextIlluminationTime = new Date(today.getTime() + i * WINDOWMILLIS);

      // Get satellite information for the next pass
      var satelliteInfo = getSatelliteInfo(
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
  }
  try {
    await setTLE(body.noradID as string);
    res.status(200).json({ message: "TLE Changed to" + " " + body.noradID });
  } catch (error) {
    console.error("Error in changeTLE:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addSatelliteTarget", async (req: any, res: any) => {
  const { body } = req;

  const tleLines = await getTLE(body.intlCode);

  const newSatellite = new SatelliteModel({
    name: body.name,
    intlCode: body.intlCode,
    validCommands: body.validCommands,
    tleLines: tleLines,
  });

  const user = await SatelliteModel.create(newSatellite);
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

// Set the default satellite to BDSAT-2
setTLE("55098");
module.exports = { router, getSatelliteInfo, setTleLines };
