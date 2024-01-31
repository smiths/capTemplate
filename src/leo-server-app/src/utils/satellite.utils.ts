import globals from "../globals/globals";
const satellite = require("satellite.js");

// GS info
let observerGd = {
  longitude: satellite.degreesToRadians(-79.9201),
  latitude: satellite.degreesToRadians(43.2585),
  height: 0.37,
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

export const getNextPasses = (noradId: string) => {
  const [tleLine1, tleLine2] = globals.tleLines[noradId];

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
