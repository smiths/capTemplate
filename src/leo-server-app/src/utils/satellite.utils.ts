import * as dotenv from "dotenv";
import globals from "../globals/globals";
import { scheduleJobForNextOverpass } from "../jobs/schedule.job";
import SatelliteModel from "../models/satellite";
import Schedule from "../models/schedule";
import { ScheduleStatus } from "../types/schedule";

dotenv.config({ path: `.env.local`, override: true });

const satellite = require("satellite.js");
const SunCalc = require("suncalc");
let spacetrack = require("spacetrack");

spacetrack.login({
  username: process.env.SPACE_TRACK_USERNAME,
  password: process.env.SPACE_TRACK_PASSWORD,
});

let defaultTleLine1 =
    "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991",
  defaultTleLine2 =
    "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199";

// GS info
let observerGd = {
  longitude: satellite.degreesToRadians(-79.9201),
  latitude: satellite.degreesToRadians(43.2585),
  height: 0.37,
};

// Fetch TLE data given a NORAD_ID using spacetrack
export const getTLE = async (noradId: string) => {
  const result = await spacetrack.get({
    type: "tle_latest",
    query: [
      { field: "NORAD_CAT_ID", condition: noradId },
      { field: "ORDINAL", condition: "1" },
    ],
    predicates: ["OBJECT_NAME", "TLE_LINE0", "TLE_LINE1", "TLE_LINE2"],
  });

  if (!result.length) {
    return [defaultTleLine1, defaultTleLine2];
  }

  if (!result[0].tle) {
    console.error("TLE not set properly");
  }

  return [
    result[0].tle[1]?.toString() || defaultTleLine1,
    result[0].tle[2]?.toString() || defaultTleLine2,
  ];
};

export const isSunlit = (
  date: Date,
  lon: number,
  lat: number,
  height: number
) => {
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
};

export const getSatelliteInfo = (
  date: Date,
  tleLine1: string,
  tleLine2: string
) => {
  if (!tleLine1 || !tleLine2) {
    throw new Error("Incorrect TLE definition");
  }
  if (isNaN(date.getTime())) {
    throw new Error("Incorrect Date definition");
  }
  let satrec = satellite.twoline2satrec(tleLine1, tleLine2);

  let positionAndVelocity = satellite.propagate(satrec, date);
  let gmst = satellite.gstime(date);

  let positionEci = positionAndVelocity.position,
    velocityEci = positionAndVelocity.velocity;

  let positionEcf = satellite.eciToEcf(positionEci, gmst),
    positionGd = satellite.eciToGeodetic(positionEci, gmst),
    lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

  let longitude = satellite.degreesLong(positionGd.longitude),
    latitude = satellite.degreesLat(positionGd.latitude),
    height = positionGd.height;

  let azimuth = satellite.radiansToDegrees(lookAngles.azimuth),
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
};

export const getTleLines = async (noradId: string) => {
  let tleLines = globals.tleLines[noradId];

  if (!tleLines) {
    tleLines = await getTLE(noradId);
  }
  globals.tleLines[noradId] = tleLines;
  return tleLines;
};

export const getNextPasses = async (noradId: string) => {
  const [tleLine1, tleLine2] = await getTleLines(noradId);

  // const [tleLine1, tleLine2] = globals.tleLines[noradId];

  const WINDOWMILLIS = 60 * 1000;

  let today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextPasses = [];
  let enterElevation = null;
  let enterInfo;
  let exitInfo;

  // Gets overpasses for the next week
  for (let i = 0; i < 7 * 24 * 60; i++) {
    // Calculate the next pass
    let nextPassTime = new Date(today.getTime() + i * WINDOWMILLIS);

    // Get satellite information for the next pass
    let satelliteInfo = getSatelliteInfo(nextPassTime, tleLine1, tleLine2);

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

  return nextPasses;
};

/* Edge Case:
 * If server restarts, reschedules overpass jobs for all satellites
 */
export const scheduleJobsForSatellitesOnBoot = async () => {
  // Fetch all satellites
  const satellites = await SatelliteModel.find().exec();

  for (let target of satellites) {
    // Get earliest schedule
    const nextSchedule = await Schedule.findOne({
      satelliteId: target.id,
      status: ScheduleStatus.FUTURE,
    })
      .sort({ created: "desc" })
      .exec();

    if (nextSchedule) {
      scheduleJobForNextOverpass(
        target.id,
        nextSchedule?.id,
        nextSchedule?.startDate
      );
    }
  }
};
